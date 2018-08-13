import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Switch, Route, NavLink } from 'react-router-dom';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import { Button, NavItem, Nav } from 'reactstrap';
import { signOut } from '../ducks/auth';
import RoutePage from '../components/route';
import ListPage from '../components/list';

class AdminPage extends Component {
  static propTypes = {
    signOut: PropTypes.func
  }

  list = [
    {to: '/admin/route', path: '/admin/route/:id?', name: 'Маршрут', page: RoutePage},
    {to: '/admin/list', name: 'Список', page: ListPage}
  ]

  adminPage() {
    return (
      <div className="text-center pt-5">
        <h3>
          Ура авторизировались :)
          <br />
          Стартовая страница адмики.
        </h3>
      </div>
    )
  }

  render() {
    const {signOut} = this.props;
    return (
      <div className="container">
        <header>
          <Nav className="nav-pills">
            {this.list.map(({to, name}, id) =>
              <NavItem key={id}>
                <NavLink to={to} className="nav-link">{name}</NavLink>
              </NavItem>
            )}
            <Button className="ml-auto" color="link" onClick={signOut}>Sign out</Button>
          </Nav>
        </header>
        <Switch>
          {this.list.map(({to, path, name, page}, id) =>
            <Route key={id} path={path||to} component={page}/>
          )}
          <Route component={this.adminPage}/>
        </Switch>
      </div>
    )
  }
}

export default connect(null, { signOut })(withRouter(AdminPage));
