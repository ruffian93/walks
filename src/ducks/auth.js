import { all, takeEvery, put, spawn } from 'redux-saga/effects';
import { appName, HTTP_DB } from '../config';
import { createSelector } from 'reselect';
import { Record } from 'immutable';
import { getUserByEmail, getCategories } from './common';
import { reset } from 'redux-form';
import { replace } from 'react-router-redux';

/**
 * Constants
 * */
export const moduleName = 'auth';
const prefix = `${appName}/${moduleName}`;

export const SIGN_IN_REQUEST = `${prefix}/SIGN_IN_REQUEST`;
export const SIGN_IN_START = `${prefix}/SIGN_IN_START`;
export const SIGN_IN_SUCCESS = `${prefix}/SIGN_IN_SUCCESS`;
export const SIGN_IN_ERROR = `${prefix}/SIGN_IN_ERROR`;

export const SIGN_OUT_REQUEST = `${prefix}/SIGN_OUT_REQUEST`;
export const SIGN_OUT_SUCCESS = `${prefix}/SIGN_OUT_SUCCESS`;

export const SIGN_UP_REQUEST = `${prefix}/SIGN_UP_REQUEST`;
export const SIGN_UP_START = `${prefix}/SIGN_UP_START`;
export const SIGN_UP_SUCCESS = `${prefix}/SIGN_UP_SUCCESS`;
export const SIGN_UP_ERROR = `${prefix}/SIGN_UP_ERROR`;

/**
 * Reducer
 * */
export const ReducerRecord = Record({
  user: null,
  loading: false,
  error: null
});

export default function reducer(state = new ReducerRecord(), action) {
  const { type, payload } = action;

  switch (type) {
    case SIGN_IN_START:
    case SIGN_UP_START:
      return state.set('error', null).set('loading', true);

    case SIGN_IN_SUCCESS:
    case SIGN_UP_SUCCESS:
    case SIGN_OUT_SUCCESS:
      return state.set('loading', false).set('user', payload.user);

    case SIGN_IN_ERROR:
    case SIGN_UP_ERROR:
      return state.set('loading', false).set('error', payload.error.message);

    default:
      return state;
  }
}

/**
 * Selectors
 * */
export const userSelector = (state) => state[moduleName].user;
export const authorizedSelector = createSelector(userSelector, (user) => !!user);

/**
 * Action Creators
 * */
export function signUp(email, password) {
  return {
    type: SIGN_UP_REQUEST,
    payload: { email, password }
  }
}

export function signIn(email, password, remember) {
  return {
    type: SIGN_IN_REQUEST,
    payload: { email, password, remember }
  }
}

export function signOut() {
  return {
    type: SIGN_OUT_REQUEST
  }
}

/**
 * Sagas
 */
export const auth = function*() {
  if (localStorage.getItem('user')) {
    try {
      const user = yield JSON.parse(localStorage.getItem('user'));
      yield signInSaga({payload: user});
    }
    catch (_){}
  }
}

export const signOutSaga = function*() {
  if (localStorage.getItem('user')) {
    localStorage.removeItem('user');
  }
  yield put({
    type: SIGN_OUT_SUCCESS,
    payload: {user: null}
  });
}

export const signUpSaga = function*(action) {
  const { email, password } = action.payload;

  yield put({
    type: SIGN_UP_START
  });
  
  const list = yield getUserByEmail(email);
  if (list && list.length) {
    yield put(reset('auth-up'));
    yield put({
      type: SIGN_UP_ERROR,
      payload: {error: {message: 'user already exists'}}
    });
  }
  else {
    const res = yield fetch(`${HTTP_DB}users`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({email, password})
    });
    const user = yield res.json();
    if (user) {
      yield put({
        type: SIGN_UP_SUCCESS,
        payload: { user }
      });
      yield put(reset('auth-up'));
      yield put(replace('/auth/sign-in'));
    }
    else {
      yield put(reset('auth-up'));
      yield put({
        type: SIGN_UP_ERROR,
        payload: {error: {message: 'try again'}}
      });
    }
  }
}

export const signInSaga = function*(action) {
  const { email, password, remember } = action.payload;

  yield put({
    type: SIGN_IN_START
  });

  const list = yield getUserByEmail(email);
  if (!list || !list.length) {
    yield put({
      type: SIGN_IN_ERROR,
      payload: {error: {message: 'User not registered yet'}}
    });
  }
  else {
    const user = list.find(user => password === user.password);
    if (user) {
      if (remember) {
        localStorage.setItem('user', JSON.stringify(user));
      }
      yield put({
        type: SIGN_IN_SUCCESS,
        payload: { user }
      });
      yield getCategories();
      yield put(reset('auth-in'));
      if (!window.location.pathname.startsWith('/admin')) {
        yield put(replace('/admin'));
      }
    }
    else {
      yield put({
        type: SIGN_IN_ERROR,
        payload: {error: {message: 'password'}}
      });
    }
  }
}

export const saga = function*() {
  yield spawn(auth);

  yield all([
    takeEvery(SIGN_IN_REQUEST, signInSaga),
    takeEvery(SIGN_UP_REQUEST, signUpSaga),
    takeEvery(SIGN_OUT_REQUEST, signOutSaga)
  ])
}
