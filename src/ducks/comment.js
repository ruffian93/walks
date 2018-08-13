import { all, takeEvery, put, select } from 'redux-saga/effects';
import { appName, HTTP_DB } from '../config';
import { createSelector } from 'reselect';
import { Record, OrderedMap } from 'immutable';
import { moduleName as authModuleName } from '../ducks/auth';
import { reset } from 'redux-form';

/**
 * Constants
 * */
export const moduleName = 'comment';
const prefix = `${appName}/${moduleName}`;

export const ADD_COMMENT_REQUEST = `${prefix}/ADD_COMMENT_REQUEST`;
export const ADD_COMMENT_START = `${prefix}/ADD_COMMENT_START`;
export const ADD_COMMENT_SUCCESS = `${prefix}/ADD_COMMENT_SUCCESS`;
export const ADD_COMMENT_ERROR = `${prefix}/ADD_COMMENT_ERROR`;

export const LOAD_COMMENT_REQUEST = `${prefix}/LOAD_COMMENT_REQUEST`;
export const LOAD_COMMENT_START = `${prefix}/LOAD_COMMENT_START`;
export const LOAD_COMMENT_SUCCESS = `${prefix}/LOAD_COMMENT_SUCCESS`;

/**
 * Reducer
 * */
export const ReducerRecord = Record({
  loading: false,
  error: null,
  list: new OrderedMap({})
});

const CommentRecord = Record({
  id: null,
  description: null,
  rating: null,
  routeId: null,
  userId: null
});

export default function reducer(state = new ReducerRecord(), action) {
  const { type, payload } = action;

  switch (type) {
    case ADD_COMMENT_START:
    case LOAD_COMMENT_START:
      return state
      .set('error', null)
      .set('loading', true);

    case ADD_COMMENT_SUCCESS:
      return state.set('loading', false).setIn(['list', Date.now()], new CommentRecord(payload));

    case LOAD_COMMENT_SUCCESS:
      return state.set('loading', false).set('list', new OrderedMap(payload));

    case ADD_COMMENT_ERROR:
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
export const commentSelector = createSelector(entitiesSelector, (entities) => entities.toArray());

/**
 * Action Creators
 * */
export function addComment(routeId, description, rating) {
  return {
    type: ADD_COMMENT_REQUEST,
    payload: { routeId, description, rating }
  }
}

export function getComment(routeId) {
  return {
    type: LOAD_COMMENT_REQUEST,
    payload: routeId
  }
}

/**
 * Sagas
 */
export const addCommentSaga = function*(action) {
  yield put({ type: ADD_COMMENT_START });

  const userId = yield select(state => state[authModuleName].user.id);

  const payload = { userId, ...action.payload };

  const res = yield fetch(`${HTTP_DB}comments`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(payload)
  });
  try {
    const json = yield res.json();
    if (json && json.id) {
      yield put(reset('add-comment'));
      yield put({
        type: ADD_COMMENT_SUCCESS,
        payload: json
      });
    }
  }
  catch(e) {
    yield put({
      type: ADD_COMMENT_ERROR,
      payload: {error: {message: res}}
    });
  }
}

export const getPageSaga = function*({ payload }) {
  yield put({ type: LOAD_COMMENT_START });

  const res = yield fetch(`${HTTP_DB}comments?routeId=${payload}&_sort=id&_order=desc`);
  const list = yield res.json();
  const orderedMap = {};
  if (list && list.length) {
    let id = Date.now();
    list.forEach(value => orderedMap[id--] = new CommentRecord(value));
  }

  yield put({
    type: LOAD_COMMENT_SUCCESS,
    payload: orderedMap
  });
}

export const saga = function*() {
  yield all([
    takeEvery(ADD_COMMENT_REQUEST, addCommentSaga),
    takeEvery(LOAD_COMMENT_REQUEST, getPageSaga)
  ])
}
