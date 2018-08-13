import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Map, GoogleApiWrapper, Polyline, Marker, InfoWindow } from 'google-maps-react';
import { Button } from 'reactstrap';
import { connect } from 'react-redux';
import Form from './form';
import { numberWithCommas } from '../../common';
import { moduleName, listSelector, getRoute } from '../../ducks/list';
import { moduleName as authModuleName } from '../../ducks/auth';
import Comment from '../comment';
import MiniList from './mini-list';
import FavoritesButton from '../favorites';

import './style.css';

class RoutePage extends Component {
  static propTypes = {
    loading: PropTypes.bool,
    list: PropTypes.array,
    userId: PropTypes.number,
    getRoute: PropTypes.func
  }

  state = {
    showingInfoWindow: false,
    activeMarker: {},
    activeMarkerId: null,
    selectedPlace: {},
    route: [],
    length: null,
    id: null
  };

  componentDidMount() {
    this.getRoute(this.props);
  }

  componentDidUpdate() {
    this.getRoute(this.props);
  }

  getRoute(props) {
    const { list, match, loading, getRoute } = props;
    const { id } = match.params;
    if (id) {
      if (!loading && this.state.id !== id) {
        let state;
        if (!list || !list.length || !(state = list.find(value => value.id == id))) {
          getRoute(id);
        }
        else {
          const { route, length } = state;
          this.setState({ route, length, id });
        }
      }
    }
    else if (this.state.id) {
      this.setState({
        route: [],
        length: null,
        id: null
      });
    }
  }

  onMarkerClick = (props, marker) => {
    this.setState({
      selectedPlace: props,
      activeMarker: marker,
      showingInfoWindow: true
    });
  }

  onMapClicked = (...args) => {
    if (this.state.showingInfoWindow) {
      this.setState({
        showingInfoWindow: false,
        activeMarker: null
      });
    }
    else {
      const {latLng: {lat, lng}} = args[2];
      const { route, activeMarkerId } = this.state;
      const id = activeMarkerId === null ? route.length : activeMarkerId;
      route[id] = {lat: lat(), lng: lng()};
      this.setState({
        route,
        length: this.mathLength(route)
      });
    }
  }

  onChangePosition = () => {
    this.setState({
      showingInfoWindow: false,
      activeMarker: null,
      activeMarkerId: this.state.activeMarker.id
    });
  }

  onSave = () => {
    this.setState({
      activeMarkerId: null
    });
  }

  onDelete = () => {
    const { route, activeMarker } = this.state;
    route.splice(activeMarker.id, 1);
    this.setState({
      showingInfoWindow: false,
      activeMarker: {},
      selectedPlace: {},
      activeMarkerId: null,
      route: route,
      length: this.mathLength(route)
    });
  }

  mathLength(route) {
    const { google } = this.props;
    let coords = [];
    let length = 0;

    route.forEach(value => {
      let {lat, lng} = value;
      coords.push({lat, lng});

      if (coords.length >= 2) {
        let p1 = new google.maps.LatLng(coords[coords.length - 2].lat, coords[coords.length - 2].lng);
        let p2 = new google.maps.LatLng(lat, lng);
        length += google.maps.geometry.spherical.computeDistanceBetween(p1, p2);
      }
    });
    return length;
  }

  render() {
    const { route, length, activeMarker, showingInfoWindow, selectedPlace, activeMarkerId } = this.state;
    const { google, match } = this.props;
    const { id } = match.params;

    let markers = [];
    let triangleCoords = [];

    if (route && route.length) {
      route.forEach((value, id) => {
        let {lat, lng} = value;

        triangleCoords.push({lat, lng});

        markers.push(<Marker
          key={lat+'-'+lng}
          id={id}
          onClick={this.onMarkerClick}
          position={{lat, lng}}
          animation={activeMarkerId === id ? google.maps.Animation.BOUNCE : null}
        />);
      });
    }

    const { userId, list } = this.props;
    const protect = !id || (list && list.find && list.find(v => v.id == id && v.userId == userId));

    return (
      <div>
        {length > 0 && ("Длина маршрута "+numberWithCommas(length.toFixed(2))+" метров")}

        {protect ? <Form id={id} route={route} disabled={!(activeMarkerId == null && length > 1)} length={length} /> : ''}

        {protect ? <div className="my-2">
          <Button
            onClick={this.onSave}
            disabled={activeMarkerId === null}
            color="primary"
            className="mr-2">
            Сохранить маркер
          </Button>
          <Button
            onClick={this.onDelete}
            disabled={!showingInfoWindow}
            color="danger"
            className="mr-2">
            Удалить маркер
          </Button>
          <Button
            onClick={this.onChangePosition}
            disabled={!showingInfoWindow}
            color="secondary">
            Изменить позицию маркера
          </Button>
        </div> : ''}

        <Map
          google={google}
          containerStyle={{position:'relative'}}
          style={{width: '100%', height: '400px', position: 'relative'}}
          zoom={14}
          onClick={protect && this.onMapClicked}
        >
          <Polyline
            path={triangleCoords}
            strokeColor="#0000FF"
            strokeOpacity={0.5}
            strokeWeight={1}
          />
          {markers}
          <InfoWindow
            marker={activeMarker}
            visible={showingInfoWindow}
          >
            <div>
              <h6>lat: {selectedPlace.position && selectedPlace.position.lat}</h6>
              <h6>lng: {selectedPlace.position && selectedPlace.position.lng}</h6>
            </div>
          </InfoWindow>
        </Map>
        {id ? <FavoritesButton id={id} /> : ''}
        {id ? <MiniList id={id} /> : ''}
        {id ? <Comment id={id} /> : ''}
      </div>
    )
  }
}

RoutePage = GoogleApiWrapper({
  apiKey: "AIzaSyBofQf9piKPXKpsiUSDJM1bDs4_peH14dA"
})(RoutePage);

export default connect(state => ({
  loading: state[moduleName].loading,
  list: listSelector(state),
  userId: state[authModuleName].user.id
}), { getRoute })(RoutePage);

