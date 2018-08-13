import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { Button } from 'reactstrap';
import Form from './form';
import { numberWithCommas } from '../../common';
import { moduleName as commonModuleName } from '../../ducks/common';
import { listSelector, moduleName } from '../../ducks/filter';

import './style.css';

export const link = ({ id, length, name }) => {
  return (
    <div key={id}>
      <NavLink exact to={`/admin/route/${id}`} className="nav-link">
        Название: {name} - Длина: {numberWithCommas(length.toFixed(2))} метров
      </NavLink>
    </div>
  )
}

class ListPage extends Component {
  static propTypes = {
    loading: PropTypes.bool,
    list: PropTypes.array,
    user: PropTypes.bool,
    name: PropTypes.string,
    length: PropTypes.number,
    categoryId: PropTypes.number,
    categories: PropTypes.array,
    loadingCategories: PropTypes.bool
  }

  render() {
    const { loading, list, user, name, length, categoryId, categories, loadingCategories } = this.props;

    return (
      <div>
        {loadingCategories ? '' : <Form categories={categories} initialValues={{user, name, length, categoryId}} />}
        <div className="py-3">
          {loading ? 'Загрузка ...' : list.map(link)}
        </div>
      </div>
    )
  }
}

export default connect(state => ({
  categories: state[commonModuleName].categories,
  loadingCategories: state[commonModuleName].loading,
  user: state[moduleName].user,
  name: state[moduleName].name,
  length: state[moduleName].length,
  categoryId: state[moduleName].categoryId,
  loading: state[moduleName].loading,
  list: listSelector(state)
}))(ListPage);
