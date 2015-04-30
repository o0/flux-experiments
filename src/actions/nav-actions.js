/**
 * @fileoverview Navigation actions.
 * @author o0 (Igor Alekseenko)
 */

var navigationDispatcher = require('../dispatchers/dispatcher');

/**
 * Possible types of navigation between application states (urls).
 * @enum {number}
 */
var NavActionType = {
  INDEX: 'index',
  REPOSITORY: 'show-repository',
  REVISIONS_LIST: 'show-revisions-list',
  REVISION: 'show-revision'
};

/**
 *
 * @constructor
 * @private
 */
var NavAction = function(actionType, opt_data) {
  this.type = actionType;
  this.data = opt_data;
};

/** @type {NavActionType} */
NavAction.prototype.type = null;

/** @type {*} */
NavAction.prototype.data = null;


/** @constructor */
var NavActions = function() {};

/**
 * @param {number} actionType
 * @param {*=} opt_data
 */
NavActions.prototype.navigate = function(actionType, opt_data) {
  navigationDispatcher.dispatch(new NavAction(actionType, opt_data));
};


module.exports = new NavActions;
module.exports.NavActionType = NavActionType;
