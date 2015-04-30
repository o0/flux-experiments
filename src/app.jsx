/**
 * @fileoverview GitHub client application entry point.
 * @author o0 (Igor Alekseenko)
 * @jsx React.DOM
 */

var AppView = require('./components/app-view.jsx');
var NavActions = require('./actions/nav-actions');
var NavActionType = NavActions.NavActionType;
var React = require('react');


/**
 * @constructor
 */
var App = function() {
  /**
   * @type {ReactCompositeComponent}
   * @private
   */
  this.appView_ = React.render(<AppView />, document.querySelector('.layout'));
  NavActions.navigate(NavActionType.INDEX);
};


/**
 * @static
 */
App.init = function() {
  return new App;
};


global.boot = App.init;
global.React = React;

