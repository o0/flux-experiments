/**
 * @fileoverview Navigation actions.
 * @author o0 (Igor Alekseenko)
 */

var navigationDispatcher = require('../dispatchers/dispatcher');
var url = require('url');


/**
 * Possible types of navigation between application states (urls).
 * @enum {string}
 */
var NavActionType = {
  INDEX: '/',
  REPOSITORY: 'show-repository',
  REVISIONS_LIST: 'show-revisions-list',
  REVISION: 'show-revision'
};


/**
 * Navigation action.
 * @constructor
 * @private
 */
var NavAction = function(actionType, opt_data) {
  this.type = actionType;
  this.data = opt_data;
};

/** @type {NavActionType} */
NavAction.prototype.type = null;

/** @type {Object} */
NavAction.prototype.data = null;

/**
 * @override
 * @return {string}
 */
NavAction.prototype.toString = function() {
  return url.format({
    pathname: this.type,
    search: this.data
  });
};


/** @constructor */
var NavActions = function() {
  window.onpopstate = this.onHistoryChange_.bind(this);
};

/**
 * @param {NavActionType} actionType
 * @param {Object=} data
 */
NavActions.prototype.navigate = function(actionType, data) {
  history.pushState(null, null, new NavAction(actionType, data).toString());
};

/**
 * @return {NavAction}
 */
NavActions.prototype.getActionFromUrl = function() {
  var urlData = url.parse(document.location);
  return new NavAction(urlData.pathname, urlData.search);
};

/**
 * @param {Event} event
 * @private
 */
NavActions.prototype.onHistoryChange_ = function(event) {
  var action = this.getActionFromUrl();
  navigationDispatcher.dispatch(new NavAction(action.type, action.data));
};


module.exports = new NavActions;
module.exports.NavActionType = NavActionType;
