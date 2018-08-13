import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Button } from 'reactstrap';
import { moduleName, favoritesAction, favoritesSelector } from '../../ducks/favorites';

import './style.css';

const FavoritesButton = (props) => {
  const { id, list, favoritesAction } = props;
  const status = list.find(value => value.routeId == id);
  return (
    <Button color={ status ? 'success' : 'secondary'} onClick={favoritesAction.bind(props, id, status)}>
      Избранное
    </Button>
  )
};

export default connect(state => ({
  loading: state[moduleName].loading,
  list: favoritesSelector(state)
}), { favoritesAction })(FavoritesButton);
