import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Form from './form';
import { addComment, commentSelector, getComment } from '../../ducks/comment';
import ReactStars from 'react-stars';

import './style.css';

class CommentPage extends Component {
  static propTypes = {
    id: PropTypes.string,
    list: PropTypes.array,
    addComment: PropTypes.func,
    getComment: PropTypes.func
  }

  state = {
    rating: 0
  };

  componentDidMount() {
    this.props.getComment(this.props.id);
  }

  onSubmit = ({ description }) => {
    const { addComment, id } = this.props;
    addComment(id, description, this.state.rating);
  }

  onChangeRating = (rating) => {
    this.setState({ rating });
  }

  comment({ description, rating, id, routeId }) {
    return (
      <div className="my-4" key={routeId+'-'+id}>
        <div>
          {description}
        </div>
        <div>
          <ReactStars
            value={rating}
            count={10}
            half={false}
            size={24}
            color2={'#ffd700'} />
        </div>
      </div>
    );
  }

  render() {
    let { list, id } = this.props;
    list = list.filter(({routeId}) => routeId == id);
    if (!list.length) {
      return <Form onSubmit={this.onSubmit} onChangeRating={this.onChangeRating} />;
    }
    return (
      <div>
        {list.map(this.comment)}
        <Form onSubmit={this.onSubmit} onChangeRating={this.onChangeRating} />
      </div>
    )
  }
}

export default connect(state => ({
  list: commentSelector(state)
}), { addComment, getComment })(CommentPage);
