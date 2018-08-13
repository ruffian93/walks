import { all, takeEvery, put, select } from 'redux-saga/effects';
import { appName, HTTP_DB } from '../config';
import { createSelector } from 'reselect';
import { Record, OrderedMap } from 'immutable';
import { moduleName as commonModuleName } from '../ducks/common';
import { moduleName as authModuleName } from '../ducks/auth';
import { convertList } from './common';
import { replace } from 'react-router-redux';

/**
 * Constants
 * */
export const moduleName = 'list';
const prefix = `${appName}/${moduleName}`;

export const GET_ROUTE_REQUEST = `${prefix}/GET_ROUTE_REQUEST`;
export const GET_ROUTE_START = `${prefix}/GET_ROUTE_START`;
export const GET_ROUTE_SUCCESS = `${prefix}/GET_ROUTE_SUCCESS`;
export const GET_ROUTE_ERROR = `${prefix}/GET_ROUTE_ERROR`;

export const LOAD_ROUTE_REQUEST = `${prefix}/LOAD_ROUTE_REQUEST`;
export const LOAD_ROUTE_START = `${prefix}/LOAD_ROUTE_START`;
export const LOAD_ROUTE_SUCCESS = `${prefix}/LOAD_ROUTE_SUCCESS`;
export const LOAD_ROUTE_ERROR = `${prefix}/LOAD_ROUTE_ERROR`;

export const ADD_ROUTE_REQUEST = `${prefix}/ADD_ROUTE_REQUEST`;
export const ADD_ROUTE_START = `${prefix}/ADD_ROUTE_START`;
export const ADD_ROUTE_SUCCESS = `${prefix}/ADD_ROUTE_SUCCESS`;
export const ADD_ROUTE_ERROR = `${prefix}/ADD_ROUTE_ERROR`;

export const UPDATE_ROUTE_REQUEST = `${prefix}/UPDATE_ROUTE_REQUEST`;
export const UPDATE_ROUTE_START = `${prefix}/UPDATE_ROUTE_START`;
export const UPDATE_ROUTE_SUCCESS = `${prefix}/UPDATE_ROUTE_SUCCESS`;
export const UPDATE_ROUTE_ERROR = `${prefix}/UPDATE_ROUTE_ERROR`;

/**
 * Reducer
 * */
export const ReducerRecord = Record({
  loading: false,
  error: null,
  list: new OrderedMap({})
});

const PointRecord = Record({
  id: null,
  name: null,
  description: null,
  categoryId: null,
  length: null,
  route: null,
  userId: null
});

export default function reducer(state = new ReducerRecord(), action) {
  const { type, payload } = action;

  switch (type) {
    case ADD_ROUTE_START:
    case UPDATE_ROUTE_START:
      return state
        .set('error', null)
        .set('loading', true);

    case ADD_ROUTE_SUCCESS:
    case GET_ROUTE_SUCCESS:
      return state
        .set('loading', false)
        .setIn(['list', +payload.id], new PointRecord(payload));

    case LOAD_ROUTE_SUCCESS:
      return payload.reduce((state, payload) =>
        state.setIn(['list', +payload.id], new PointRecord(payload)),
        state.set('loading', false)
      );

    case UPDATE_ROUTE_SUCCESS:
      return state
        .set('loading', false)
        .updateIn(['list', +payload.id], data => new PointRecord(Object.assign(data.toObject(), payload)));

    case ADD_ROUTE_ERROR:
    case UPDATE_ROUTE_ERROR:
      return state
        .set('loading', false)
        .set('error', payload.error.message);

    default:
      return state;
  }
}
/**
 * Selectors
 * */
export const stateSelector = (state) => state[moduleName];
export const entitiesSelector = createSelector(stateSelector, (state) => state.list);
export const listSelector = createSelector(entitiesSelector, (entities) => entities.toArray());

/**
 * Action Creators
 * */
export function getRoute(id) {
  return {
    type: GET_ROUTE_REQUEST,
    payload: id
  }
}

export function loadRoute() {
  return {
    type: LOAD_ROUTE_REQUEST
  }
}

export function addRoute(data, callback) {
  return {
    type: ADD_ROUTE_REQUEST,
    payload: { data, callback }
  }
}

export function updateRoute(id, data) {
  return {
    type: UPDATE_ROUTE_REQUEST,
    payload: { id, data }
  }
}

/**
 * Sagas
 */
export const loadRouteSaga = function*() {
  yield put({ type: LOAD_ROUTE_START });

  const userId = yield select(state => state[authModuleName].user.id);

  const res = yield fetch(`${HTTP_DB}routes?userId=${userId}&_sort=id&_order=desc&_limit=6`);
  try {
    const json = yield res.json();
    if (json && json.length) {
      yield put({
        type: LOAD_ROUTE_SUCCESS,
        payload: json
      });
    }
  }
  catch(e) {
    yield put({
      type: LOAD_ROUTE_ERROR,
      payload: {error: {message: res}}
    });
  }
}

export const getRouteSaga = function*(action) {
  yield put({ type: GET_ROUTE_START });

  const res = yield fetch(`${HTTP_DB}routes?id=${action.payload}`);
  try {
    const json = yield res.json();
    if (json && json.length && json[0].id) {
      yield put({
        type: GET_ROUTE_SUCCESS,
        payload: json[0]
      });
    }
  }
  catch(e) {
    yield put({
      type: GET_ROUTE_ERROR,
      payload: {error: {message: res}}
    });
  }
}

export const addRouteSaga = function*(action) {
  yield put({ type: ADD_ROUTE_START });
  
  const defaultId = yield select(state => state[commonModuleName].categories[0].id);
  const userId = yield select(state => state[authModuleName].user.id);

  const { data } = action.payload;
  data.categoryId = data.categoryId || defaultId;

  const payload = { userId, ...data };

  const res = yield fetch(`${HTTP_DB}routes`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(payload)
  });
  try {
    const json = yield res.json();
    if (json && json.id) {
      yield put({
        type: ADD_ROUTE_SUCCESS,
        payload: json
      });
      yield put(replace('/admin/route/'+json.id));
    }
  }
  catch(e) {
    yield put({
      type: ADD_ROUTE_ERROR,
      payload: {error: {message: res}}
    });
  }
}

export const updateRouteSaga = function*(action) {
  yield put({ type: UPDATE_ROUTE_START });

  const userId = yield select(state => state[authModuleName].user.id);

  const { id, data } = action.payload;

  const payload = { id, userId, ...data };

  const res = yield fetch(`${HTTP_DB}routes/${id}`, {
    method: 'PUT',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(payload)
  });
  try {
    const json = yield res.json();
    if (json && json.id) {
      yield put({
        type: UPDATE_ROUTE_SUCCESS,
        payload: json
      });
    }
  }
  catch(e) {
    yield put({
      type: UPDATE_ROUTE_ERROR,
      payload: {error: {message: res}}
    });
  }
}

export const saga = function*() {
  yield all([
    takeEvery(GET_ROUTE_REQUEST, getRouteSaga),
    takeEvery(LOAD_ROUTE_REQUEST, loadRouteSaga),
    takeEvery(ADD_ROUTE_REQUEST, addRouteSaga),
    takeEvery(UPDATE_ROUTE_REQUEST, updateRouteSaga)
  ])
}
