import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { reduxForm, Field } from 'redux-form';
import { Form, FormGroup, Label } from 'reactstrap';
import { findByUser, findByName, findByLenght, findByCategory } from '../../ducks/filter';

import './style.css';

class FromFilter extends Component {
  static propTypes = {
    categories: PropTypes.array,
    findByUser: PropTypes.func,
    findByName: PropTypes.func,
    findByLenght: PropTypes.func,
    findByCategory: PropTypes.func
  }

  onChangeCheckbox = (_, user) => {
    this.props.findByUser(user);
  }

  onChangeName = (_, name) => {
    this.props.findByName(name);
  }

  onChangeLength = (_, lenght) => {
    this.props.findByLenght(lenght);
  }

  onChangeСategory = (_, category) => {
    this.props.findByCategory(category);
  }

  render() {
    const { categories } = this.props;

    return (
      <Form inline>
        <FormGroup className="ml-3 my-2 mr-sm-2 mb-sm-0">
          <label htmlFor="categoryId" className="mr-sm-2">Категория</label>
          <Field
            id="categoryId"
            name="categoryId"
            component="select"
            className="form-control"
            onChange={this.onChangeСategory}
          >
            <option value=""></option>
            {categories.map(({name, id}) => <option value={id} key={name}>{name}</option>)}
          </Field>
        </FormGroup>
        <FormGroup className="ml-3 my-2 mr-sm-2 mb-sm-0">
          <Label htmlFor="name" className="mr-sm-2">Название</Label>
          <Field
            className="form-control"
            type="text"
            component="input"
            name="name"
            id="name"
            placeholder="Название маршрута"
            onChange={this.onChangeName} />
        </FormGroup>
        <FormGroup className="ml-3 my-2 mr-sm-2 mb-sm-0">
          <Label htmlFor="length" className="mr-sm-2">Длинна</Label>
          <Field
            style={{maxWidth: '100px'}}
            className="form-control"
            type="text"
            component="input"
            name="length"
            id="length"
            placeholder="Длинна"
            onChange={this.onChangeLength} />
        </FormGroup>
        <FormGroup className="my-2 mr-sm-2 mb-sm-0">
          <div className="custom-checkbox custom-control">
            <Field
              id="customCheckbox"
              className="custom-control-input"
              name="user"
              type="checkbox"
              component="input"
              onChange={this.onChangeCheckbox}
            />
            <label htmlFor="customCheckbox" className="mr-sm-2 custom-control-label">Избранные</label>
          </div>
        </FormGroup>
      </Form>
    )
  }
}

FromFilter = reduxForm({
  form: 'filter'
})(FromFilter);

export default connect(null, { findByUser, findByName, findByLenght, findByCategory })(FromFilter);