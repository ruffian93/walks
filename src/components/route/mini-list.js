import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { moduleName as listModuleName, listSelector, loadRoute } from '../../ducks/list';
import { moduleName as authModuleName } from '../../ducks/auth';

import { link } from '../list';

import './style.css';

class FromAddRoute extends Component {
  static propTypes = {
    userId: PropTypes.number,
    loading: PropTypes.bool,
    list: PropTypes.array,
    loadRoute: PropTypes.func
  }

  componentDidMount() {
    let { loading } = this.props;
    if (!loading && this.filterRoute().length < 5) {
      this.props.loadRoute();
    }
  }

  filterRoute() {
    let { list, userId, id } = this.props;
    if (list && list.length) {
      return list.filter(value => value.userId == userId && value.id != id);
    }
    return [];
  }

  render() {
    const list = this.filterRoute();
    if (list.length) {
      return list.slice(0,5).map(link);
    }
    return '';
  }
}

export default connect(state => ({
  userId: state[authModuleName].user.id,
  loading: state[listModuleName].loading,
  list: listSelector(state)
}), { loadRoute })(FromAddRoute);