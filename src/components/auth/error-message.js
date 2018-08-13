import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {moduleName} from '../../ducks/auth';

class ErrorMessage extends Component {
  static propTypes = {
    error: PropTypes.string
  }

  render() {
    const { error } = this.props;
    if (!error) {
      return null;
    }
    return error;
  }
}

export default connect(state => ({
  error: state[moduleName].error
}))(ErrorMessage);