import { combineReducers } from 'redux';
import { routerReducer as router } from 'react-router-redux';
import { reducer as form } from 'redux-form';
import authReducer, { moduleName as authModule } from '../ducks/auth';
import commonReducer, { moduleName as commonModule } from '../ducks/common';
import listReducer, { moduleName as listModule } from '../ducks/list';
import filterReducer, { moduleName as filterModule } from '../ducks/filter';
import commentReducer, { moduleName as commentModule } from '../ducks/comment';
import favoritesReducer, { moduleName as favoritesModule } from '../ducks/favorites';

export default combineReducers({
  router,
  form,
  [authModule]: authReducer,
  [commonModule]: commonReducer,
  [listModule]: listReducer,
  [filterModule]: filterReducer,
  [commentModule]: commentReducer,
  [favoritesModule]: favoritesReducer
});
