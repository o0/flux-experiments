/** @jsx React.DOM */

var AppView = require('./components/app-view.jsx');
var NavActions = require('./actions/nav-actions');
var navActions = NavActions.getInstance();
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
  navActions.navigate(NavActionType.INDEX);
};


/**
 * @static
 */
App.init = function() {
  return new App;
};


global.boot = App.init;
global.React = React;
