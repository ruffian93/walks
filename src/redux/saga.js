import { all } from 'redux-saga/effects';
import { saga as authSaga } from '../ducks/auth';
import { saga as listSaga } from '../ducks/list';
import { saga as commentSaga } from '../ducks/comment';
import { saga as filterSaga } from '../ducks/filter';
import { saga as favoritesSaga } from '../ducks/favorites';

export default function * () {
  yield all([
    authSaga(),
    listSaga(),
    commentSaga(),
    filterSaga(),
    favoritesSaga()
  ]);
}
