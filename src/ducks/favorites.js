import { all, takeEvery, put, select } from 'redux-saga/effects';
import { appName, HTTP_DB } from '../config';
import { Record, OrderedMap } from 'immutable';
import { createSelector } from 'reselect';
import { moduleName as authModuleName, SIGN_IN_SUCCESS } from '../ducks/auth';

/**
 * Constants
 * */
export const moduleName = 'favorites';
const prefix = `${appName}/${moduleName}`;

export const LOAD_START = `${prefix}/LOAD_START`;
export const LOAD_SUCCESS = `${prefix}/LOAD_SUCCESS`;
export const LOAD_ERROR = `${prefix}/LOAD_ERROR`;

export const FAVORITES_REQUEST = `${prefix}/FAVORITES_REQUEST`;
export const FAVORITES_START = `${prefix}/FAVORITES_START`;
export const FAVORITES_ADD_SUCCESS = `${prefix}/FAVORITES_ADD_SUCCESS`;
export const FAVORITES_DELETE_SUCCESS = `${prefix}/FAVORITES_DELETE_SUCCESS`;
export const FAVORITES_ERROR = `${prefix}/FAVORITES_ERROR`;

/**
 * Reducer
 * */
export const ReducerRecord = Record({
  loading: false,
  error: null,
  list: new OrderedMap({})
});

const FavoritesRecord = Record({
  id: null,
  userId: null,
  routeId: null
});

export default function reducer(state = new ReducerRecord(), action) {
  const { type, payload } = action;

  switch (type) {
    case LOAD_START:
    case FAVORITES_START:
      return state.set('error', null).set('loading', true);

    case FAVORITES_ADD_SUCCESS:
      return state.set('loading', false).setIn(['list', +payload.id], new FavoritesRecord(payload));

    case FAVORITES_DELETE_SUCCESS:
      return state.set('loading', false).deleteIn(['list', +payload.id]);

    case LOAD_SUCCESS:
      return payload.reduce((state, payload) =>
        state.setIn(['list', +payload.id], new FavoritesRecord(payload)),
        new ReducerRecord()
      );

    case LOAD_ERROR:
    case FAVORITES_ERROR:
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
export const favoritesSelector = createSelector(entitiesSelector, (entities) => entities.toArray());

/**
 * Action Creators
 * */
export function favoritesAction(routeId, status) {
  return {
    type: FAVORITES_REQUEST,
    payload: { routeId, status }
  }
}

/**
 * Sagas
 */
export const favoritesSaga = function*({ payload }) {
  yield put({
    type: FAVORITES_START
  });

  const { routeId, status } = payload;
  const userId = yield select(state => state[authModuleName].user.id);
  const data = { userId, routeId };
  let res;
  if (status) {
    yield fetch(`${HTTP_DB}favorites/${status.id}`, {
      method: 'DELETE',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(data)
    });
    yield put({
      type: FAVORITES_DELETE_SUCCESS,
      payload: status
    });
  }
  else {
    res = yield fetch(`${HTTP_DB}favorites`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(data)
    });
    try {
      const json = yield res.json();
      if (json && json.id) {
        yield put({
          type: FAVORITES_ADD_SUCCESS,
          payload: json
        });
      }
    }
    catch(e) {
      yield put({
        type: FAVORITES_ERROR,
        payload: {error: {message: res}}
      });
    }
  }

}

export const loadSaga = function*({ payload }) {
  yield put({
    type: LOAD_START
  });

  const { id } = payload.user;
  const res = yield fetch(`${HTTP_DB}favorites?userId=${id}`);
  const list = yield res.json();
  if (list) {
    yield put({
      type: LOAD_SUCCESS,
      payload: list
    });
  }
  else {
    yield put({
      type: LOAD_ERROR,
      payload: {error: {massage: res}}
    });
  }
}

export const saga = function*() {
  yield all([
    takeEvery(SIGN_IN_SUCCESS, loadSaga),
    takeEvery(FAVORITES_REQUEST, favoritesSaga)
  ])
}