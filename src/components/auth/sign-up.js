import React, { Component } from 'react';
import { Field, reduxForm } from 'redux-form';
import validator from 'email-validator';
import ErrorField from '../common/error-field';
import { Link } from 'react-router-dom';
import { Button } from 'reactstrap';
import ErrorMessage from './error-message';

import './style.css';

class SignUpForm extends Component {
  render() {
    return (
      <div id="auth">
        <form className="text-center form-signin" onSubmit={this.props.handleSubmit}>
          <h1 className="h3 mb-3 font-weight-normal">Sign Up</h1>
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
          <ErrorMessage />
          <Button color="primary" className="btn-lg btn-block mt-3" type="submit">Sign Up</Button>
          <div className="checkbox mt-3">
            <label>
              <Link to="/auth/sign-in">Sign In</Link>
            </label>
          </div>
        </form>
      </div>
    )
  }
}

const validate = ({ email, password }) => {
  const errors = {};

  if (!email) errors.email = 'email is a required field';
  if (email && !validator.validate(email)) errors.email = 'invalid email';

  if (!password) errors.password = 'password is a required field';
  if (password && password.length < 5) errors.password = 'to short';

  return errors;
}

export default reduxForm({
  form: 'auth-up',
  validate
})(SignUpForm);
