import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';
import { connect } from 'react-redux';
import SignInForm from '../components/auth/sign-in';
import SignUpForm from '../components/auth/sign-up';
import { signUp, signIn } from '../ducks/auth';

class AuthPage extends Component {
  render() {
    return (
      <Switch>
        <Route exact path="/auth/sign-up" render={() => <SignUpForm onSubmit={this.signUp} />}/>
        <Route render={() => <SignInForm onSubmit={this.signIn} />}/>
      </Switch>
    )
  }

  signUp = ({ email, password }) => this.props.signUp(email, password)
  signIn = ({ email, password, remember }) => this.props.signIn(email, password, remember)
}

export default connect(null, { signUp, signIn })(AuthPage);
