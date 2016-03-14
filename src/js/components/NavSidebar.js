// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { navActivate } from '../actions';
import Sidebar from 'grommet/components/Sidebar';
import Header from 'grommet/components/Header';
import Title from 'grommet/components/Title';
import Logo from './Logo';
import Menu from 'grommet/components/Menu';
import Anchor from 'grommet/components/Anchor';
import CloseIcon from 'grommet/components/icons/base/Close';

class NavSidebar extends Component {

  constructor() {
    super();
    this._onClose = this._onClose.bind(this);
  }

  _onClose() {
    this.props.dispatch(navActivate(false));
  }

  render() {
    const { nav: {items} } = this.props;
    var links = items.map(function (page) {
      return (
        <Link key={page.label} to={page.path} activeClassName="active">
          {page.label}
        </Link>
      );
    }, this);

    return (
      <Sidebar colorIndex="light-2" fixed={true} separator="right">
        <Header large={true} justify="between" pad={{horizontal: 'medium'}}>
          <Title onClick={this._onClose}>
            <Logo />
            <span>IoT Demo</span>
          </Title>
          <Menu responsive={false}>
            <Anchor onClick={this._onClose}>
              <CloseIcon />
            </Anchor>
          </Menu>
        </Header>
        <Menu primary={true}>
          {links}
        </Menu>
      </Sidebar>
    );
  }

}

NavSidebar.propTypes = {
  nav: PropTypes.shape({
    items: PropTypes.arrayOf(PropTypes.shape({
      path: PropTypes.string,
      label: PropTypes.string
    }))
  }),
  onClose: PropTypes.func
};

let select = (state) => ({ nav: state.nav });

export default connect(select)(NavSidebar);
