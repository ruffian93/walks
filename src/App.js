import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';
import ProtectedRoute from './components/common/protected-route';
import AuthPage from './routes/auth';
import AdminPage from './routes/admin';
import ErrorPage from './routes/error';

class App extends Component {
  render() {
    return (
      <Switch>
        <Route exact path="/" component={AuthPage} />
        <Route path="/auth" component={AuthPage} />
        <ProtectedRoute path="/admin" component={AdminPage} />
        <Route component={ErrorPage} />
      </Switch>
    )
  }
}

export default App
