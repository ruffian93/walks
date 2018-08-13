import { put } from 'redux-saga/effects';
import { appName, HTTP_DB } from '../config';
import { Record } from 'immutable';
import { createSelector } from 'reselect';

/**
 * Constants
 * */
export const moduleName = 'common';
const prefix = `${appName}/${moduleName}`;

export const CATEGORIES_START = `${prefix}/CATEGORIES_START`;
export const CATEGORIES_SUCCESS = `${prefix}/CATEGORIES_SUCCESS`;
export const CATEGORIES_ERROR = `${prefix}/CATEGORIES_ERROR`;

/**
 * Reducer
 * */
export const ReducerRecord = Record({
  loading: false,
  error: null,
  categories: []
});

export default function reducer(state = new ReducerRecord(), action) {
  const { type, payload } = action;

  switch (type) {
    case CATEGORIES_START:
      return state.set('error', null).set('loading', true);

    case CATEGORIES_SUCCESS:
      return state.set('loading', false).set('categories', payload);

    case CATEGORIES_ERROR:
      return state.set('loading', false).set('error', payload.error.message);


    default:
      return state;
  }
}

/**
 * Sagas
 */
export const getCategories = function*() {
  yield put({
    type: CATEGORIES_START
  });
  
  const res = yield fetch(`${HTTP_DB}categories`);
  const categories = yield res.json();

  if (!categories || !categories.length) {
    yield put({
      type: CATEGORIES_ERROR,
      payload: {error: {massage: res.status}}
    });
  }
  else {
    yield put({
      type: CATEGORIES_SUCCESS,
      payload: categories
    });
  }
}

export const getUserByEmail = function*(email) {
  const res = yield fetch(`${HTTP_DB}users?email=${email}`);
  const list = yield res.json();
  return list;
}