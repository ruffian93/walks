import React, { Component } from 'react';
import { reduxForm, Field } from 'redux-form';
import ErrorField from '../common/error-field';
import { Link } from 'react-router-dom';
import { Button } from 'reactstrap';
import ErrorMessage from './error-message';

import './style.css';

class SignInForm extends Component {
  render() {
    return (
      <div id="auth">
        <form className="text-center form-signin" onSubmit={this.props.handleSubmit}>
          <h1 className="h3 mb-3 font-weight-normal">Please sign in</h1>
          <Field name="email"
                 component={ErrorField}
                 label="Email address"
                 type="email"
                 id="inputEmail"
                 className="form-control"
                 placeholder="Email address"
                 required autofocus
          />
          <Field name="password"
                 component={ErrorField}
                 label="Password"
                 type="password"
                 id="inputPassword"
                 className="form-control"
                 placeholder="Password"
                 required
          />
          <div className="checkbox mb-2">
            <label>
              <Field name="remember" component="input" type="checkbox" value="remember-me" /> Remember me
            </label>
          </div>
          <ErrorMessage />
          <Button color="primary" className="btn-lg btn-block mt-3" type="submit">Sign In</Button>
          <div className="checkbox mt-3">
            <label>
              <Link to="/auth/sign-up">Sign Up</Link>
            </label>
          </div>
        </form>
      </div>
    )
  }
}

export default reduxForm({
  form: 'auth-in'
})(SignInForm);
