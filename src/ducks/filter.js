import { all, takeEvery, put, select } from 'redux-saga/effects';
import { appName, HTTP_DB } from '../config';
import { createSelector } from 'reselect';
import { Record, OrderedMap } from 'immutable';
import { moduleName as authModuleName, SIGN_IN_SUCCESS } from '../ducks/auth';

/**
 * Constants
 * */
export const moduleName = 'filter';
const prefix = `${appName}/${moduleName}`;

export const FIND_REQUEST = `${prefix}/FIND_REQUEST`;
export const FIND_START = `${prefix}/FIND_START`;
export const FIND_SUCCESS = `${prefix}/FIND_SUCCESS`;
export const FIND_ERROR = `${prefix}/FIND_ERROR`;

export const FIND_BY_USER_REQUEST = `${prefix}/FIND_BY_USER_REQUEST`;
export const FIND_BY_USER_START = `${prefix}/FIND_BY_USER_START`;
export const FIND_BY_USER_SUCCESS = `${prefix}/FIND_BY_USER_SUCCESS`;
export const FIND_BY_USER_ERROR = `${prefix}/FIND_BY_USER_ERROR`;

export const FIND_BY_LENGTH_REQUEST = `${prefix}/FIND_BY_LENGTH_REQUEST`;
export const FIND_BY_LENGTH_START = `${prefix}/FIND_BY_LENGTH_START`;
export const FIND_BY_LENGTH_SUCCESS = `${prefix}/FIND_BY_LENGTH_SUCCESS`;
export const FIND_BY_LENGTH_ERROR = `${prefix}/FIND_BY_LENGTH_ERROR`;

export const FIND_BY_CATEGORY_REQUEST = `${prefix}/FIND_BY_CATEGORY_REQUEST`;
export const FIND_BY_CATEGORY_START = `${prefix}/FIND_BY_CATEGORY_START`;
export const FIND_BY_CATEGORY_SUCCESS = `${prefix}/FIND_BY_CATEGORY_SUCCESS`;
export const FIND_BY_CATEGORY_ERROR = `${prefix}/FIND_BY_CATEGORY_ERROR`;

export const FIND_BY_NAME_REQUEST = `${prefix}/FIND_BY_NAME_REQUEST`;
export const FIND_BY_NAME_START = `${prefix}/FIND_BY_NAME_START`;
export const FIND_BY_NAME_SUCCESS = `${prefix}/FIND_BY_NAME_SUCCESS`;
export const FIND_BY_NAME_ERROR = `${prefix}/FIND_BY_NAME_ERROR`;

/**
 * Reducer
 * */
export const ReducerRecord = Record({
  loading: false,
  error: null,
  user: false,
  name: null,
  categoryId: null,
  length: null,
  list: new OrderedMap({})
});

export default function reducer(state = new ReducerRecord(), action) {
  const { type, payload } = action;

  switch (type) {
    case FIND_BY_USER_START:
    case FIND_BY_NAME_START:
    case FIND_BY_CATEGORY_START:
    case FIND_BY_LENGTH_START:
    case FIND_START:
      return state.set('loading', true).set('error', null);

    case FIND_BY_USER_SUCCESS:
      return state.set('user', payload).set('list', new OrderedMap({}));

    case FIND_BY_NAME_SUCCESS:
      return state.set('name', payload).set('list', new OrderedMap({}));

    case FIND_BY_LENGTH_SUCCESS:
      return state.set('length', payload).set('list', new OrderedMap({}));

    case FIND_BY_CATEGORY_SUCCESS:
      return state.set('categoryId', payload).set('list', new OrderedMap({}));

    case FIND_SUCCESS:
      return state.set('loading', false).set('list', state.list.merge(new OrderedMap(payload)));

    case FIND_BY_USER_ERROR:
    case FIND_BY_NAME_ERROR:
    case FIND_BY_CATEGORY_ERROR:
    case FIND_BY_LENGTH_ERROR:
    case FIND_ERROR:
      return state.set('loading', false).set('error', payload.error.message);

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
export function findByUser(user) {
  return {
    type: FIND_BY_USER_REQUEST,
    payload: user
  }
}

export function findByName(name) {
  return {
    type: FIND_BY_NAME_REQUEST,
    payload: name
  }
}

export function findByLenght(length) {
  return {
    type: FIND_BY_LENGTH_REQUEST,
    payload: length
  }
}

export function findByCategory(categoryId) {
  return {
    type: FIND_BY_CATEGORY_REQUEST,
    payload: categoryId
  }
}

/**
 * Sagas
 */
export const findSaga = function*() {
  yield put({ type: FIND_START });

  const { user, name, length, categoryId } = yield select(state => state[moduleName]);

  let listFavorites = [];
  let url = '';
  if (user) {
    const userId = yield select(state => state[authModuleName].user.id);
    const res = yield fetch(`${HTTP_DB}favorites?userId=${userId}`);
    listFavorites = yield res.json();
  }
  if (name) {
    url += `q=${name}&`;
  }
  if (length) {
    url += `length_lte=${length}&`;
  }
  if (categoryId) {
    url += `categoryId=${categoryId}&`;
  }

  const res = yield fetch(`${HTTP_DB}routes?${url}_sort=id&_order=desc`);
  const list = yield res.json();

  const orderedMap = {};
  if (list && list.length) {
    let id = Date.now();
    list.forEach(value => {
      if (listFavorites && listFavorites.length && !listFavorites.find(({routeId}) => value.id == routeId)) {
        return;
      }
      orderedMap[id--] = value;
    });
  }

  yield put({
    type: FIND_SUCCESS,
    payload: orderedMap
  });
}

export const findByUserSaga = function*({ payload }) {
  yield put({ type: FIND_BY_USER_START });
  yield put({
    type: FIND_BY_USER_SUCCESS,
    payload
  });
  yield put({ type: FIND_REQUEST });
}

export const findByNameSaga = function*({ payload }) {
  yield put({ type: FIND_BY_NAME_START });
  yield put({
    type: FIND_BY_NAME_SUCCESS,
    payload
  });
  yield put({ type: FIND_REQUEST });
}

export const findByLengthSaga = function*({ payload }) {
  yield put({ type: FIND_BY_LENGTH_START });
  yield put({
    type: FIND_BY_LENGTH_SUCCESS,
    payload
  });
  yield put({ type: FIND_REQUEST });
}

export const findByCategorySaga = function*({ payload }) {
  yield put({ type: FIND_BY_CATEGORY_START });
  yield put({
    type: FIND_BY_CATEGORY_SUCCESS,
    payload
  });
  yield put({ type: FIND_REQUEST });
}

export const saga = function*() {
  yield all([
    takeEvery(SIGN_IN_SUCCESS, findSaga),
    takeEvery(FIND_REQUEST, findSaga),
    takeEvery(FIND_BY_USER_REQUEST, findByUserSaga),
    takeEvery(FIND_BY_NAME_REQUEST, findByNameSaga),
    takeEvery(FIND_BY_CATEGORY_REQUEST, findByCategorySaga),
    takeEvery(FIND_BY_LENGTH_REQUEST, findByLengthSaga)
  ])
}
