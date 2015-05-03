var navigationDispatcher = require('../dispatchers/dispatcher');
var url = require('url');


/**
 * Possible types of navigation between application states (urls).
 * @enum {string}
 */
var NavActionType = {
  INDEX: '/',
  REPOSITORY: 'repository',
  REVISIONS_LIST: 'revisions',
  REVISION: 'revision'
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
var NavActions = function() {};

/**
 * @param {NavActionType} actionType
 * @param {Object=} data
 */
NavActions.prototype.navigate = function(actionType, data) {
  if (!this.handlerRegistered_) {
    window.onpopstate = this.onHistoryChange_.bind(this);
    /**
     * @private
     * @type {boolean}
     */ 
    this.handlerRegistered_ = true;
  }

  history.pushState(null, null, new NavAction(actionType, data).toString());
};

/**
 * @return {NavAction}
 */
NavActions.prototype.getActionFromUrl = function() {
  var urlData = url.parse(document.location);
  return new NavAction(urlData.pathname, urlData.search);
};

NavActions.prototype.dispatchActionFromUrl = function() {
  var action = this.getActionFromUrl();
  navigationDispatcher.dispatch(new NavAction(action.type, action.data));
};

/**
 * @param {Event} event
 * @private
 */
NavActions.prototype.onHistoryChange_ = function(event) {
  this.dispatchActionFromUrl();
};


module.exports = new NavActions;
module.exports.NavActionType = NavActionType;
