import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { reduxForm, Field } from 'redux-form';
import { Form, Label, Button } from 'reactstrap';
import { moduleName } from '../../ducks/comment';
import ReactStars from 'react-stars';

import './style.css';

class FormAdd extends Component {
  static propTypes = {
    handleSubmit: PropTypes.func,
    loading: PropTypes.bool,
    onChangeRating: PropTypes.func
  }

  render() {
    const { handleSubmit, loading, onChangeRating } = this.props;
    return (
      <Form onSubmit={handleSubmit} className="my-3">
        <Label htmlFor="description" className="mr-sm-2">Комментарий</Label>
        <Field
          name="description"
          id="description"
          className="form-control"
          type="text"
          component="input" />
        <ReactStars
          count={10}
          half={false}
          onChange={onChangeRating}
          size={24}
          color2={'#ffd700'} />
        <Button color="success" type="submit">{loading ? 'Загрузка ...' : 'Сохранить'}</Button>
      </Form>
    )
  }
}

FormAdd = reduxForm({
  form: 'add-comment'
})(FormAdd);

export default connect(state => ({
  loading: state[moduleName].loading
}))(FormAdd);