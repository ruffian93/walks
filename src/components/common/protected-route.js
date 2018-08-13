import React, { Component } from 'react';
import { Route } from 'react-router-dom';
import { connect } from 'react-redux';
import { authorizedSelector } from '../../ducks/auth';
import AuthPage from '../../routes/auth';

class ProtectedRoute extends Component {
  render() {
    const { component, ...rest } = this.props;
    return <Route {...rest} render={this.getComponent} />
  }

  getComponent = ({ match }) => {
    return this.props.authorized ? (
      <this.props.component match={match} />
    ) : (
      <AuthPage />
    )
  }
}

export default connect(
  (state) => ({
    authorized: authorizedSelector(state)
  }),
  null,
  null,
  { pure: false }
)(ProtectedRoute)
