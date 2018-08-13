import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { reduxForm, Field, change } from 'redux-form';
import { Form, Button } from 'reactstrap';
import { moduleName as listModuleName, addRoute, updateRoute, listSelector } from '../../ducks/list';
import { moduleName as commonModuleName } from '../../ducks/common';

import './style.css';

export const FormAdd = reduxForm({
  form: 'add-route'
})(props => {
  const { categories, loading, disabled, handleSubmit } = props;
  return (
    <Form onSubmit={handleSubmit} className="my-2">
      <div className="row">
        <div className="col col-md-2">
          <label htmlFor="categoryId" className="mr-sm-2">Категория</label>
          <Field
            id="categoryId"
            name="categoryId"
            component="select"
            className="form-control"
          >
            {categories.map(({name, id}) => <option value={id} key={name}>{name}</option>)}
          </Field>
        </div>
        <div className="col">
          <label htmlFor="name" className="mr-sm-2">Название</label>
          <Field
            name="name"
            id="name"
            className="form-control"
            type="text"
            component="input"
          />
        </div>
      </div>
      <label htmlFor="description" className="mr-sm-2 mt-2">Описание</label>
      <Field
        name="description"
        id="description"
        className="form-control"
        type="text"
        component="textarea"
      />
      <Button disabled={disabled} className="my-2 float-right" color="success" type="submit">
        {loading ? 'Загрузка ...' : 'Сохранить маршрут'}
      </Button>
    </Form>
  )
});

class FromAddRoute extends Component {
  static propTypes = {
    id: PropTypes.string,
    loading: PropTypes.bool,
    categories: PropTypes.array,
    loadingCategories: PropTypes.bool,
    list: PropTypes.array,
    addRoute: PropTypes.func,
    updateRoute: PropTypes.func,
    updateField: PropTypes.func
  }

  componentDidUpdate(nextProps) {
    if (nextProps.id != this.props.id) {
      const { updateField } = this.props;
      const list = ['categoryId', 'name', 'description'];
      const route = this.getRouteData();
      if (route) {
        list.forEach(value => updateField(value, route[value]));
      }
      else if (this.props.id == undefined) {
        list.forEach(value => updateField(value, ''));
      }
    }
  }

  getRouteData() {
    const { id, list } = this.props;
    let route;
    if (id && list) {
      route = list.find(value => value.id == id);
    }
    return route;
  }

  onSubmit = ({ categoryId, name, description }) => {
    const { route, length, id, addRoute, updateRoute } = this.props;
    const data = {categoryId, name, description, route, length};
    if (id) {
      updateRoute(id, data);
    }
    else {
      addRoute(data);
    }
  }

  render() {
    const { loadingCategories, categories, id, disabled, loading, list } = this.props;
    const route = this.getRouteData();

    if (loadingCategories || !categories || (id && !route)) {
      return <div>Загрузка ресурсов для формы ...</div>;
    }
    let initialValues = {};
    if (route) {
      const { categoryId, name, description } = route;
      initialValues = { categoryId, name, description };
    }

    return (
      <FormAdd
        initialValues={initialValues}
        onSubmit={this.onSubmit}
        disabled={disabled}
        categories={categories}
        loading={loading}
      />
    )
  }
}

FromAddRoute = connect(state => ({
  loading: state[listModuleName].loading,
  categories: state[commonModuleName].categories,
  loadingCategories: state[commonModuleName].loading,
  list: listSelector(state)
}), {
  addRoute,
  updateRoute,
  updateField: (name, value) => change('add-route', name, value)
})(FromAddRoute);

export default FromAddRoute;