/**
 * @fileoverview Top-level UI component storage.
 * @author igor.alexeenko (Igor Alekseenko)
 */

var EventEmitter = require('events').EventEmitter;
var navigationDispatcher = require('../dispatchers/dispatcher');
var util = require('util');


/**
 * @enum {number}
 */
var State = {
  NULL: 0x00,
  LOADING: 0x01,
  ERROR: 0x02
};


/**
 * @enum {string}
 */
var EventType = {
  SET_STATE: 'update-state'
};


/**
 * @constructor
 * @extends {EventEmitter}
 */
var ApplicationStore = function() {
  this.navigationHandler_ = navigationDispatcher.register(this.onNavigationDispatch_.bind(this));
};
util.inherits(ApplicationStore, EventEmitter);

/**
 * @type {State}
 * @private
 */
ApplicationStore.prototype.state_ = State.NULL;

/**
 * @param {State} state
 * @param enabled
 */
ApplicationStore.setStateEnabled = function(state, enabled) {
  this.state_ = enabled ? this.state_ | state : this.state_ & ~state;
  this.emit(EventType.SET_STATE);
};

/**
 * @param {NavAction} action
 * @private
 */
ApplicationStore.prototype.onNavigationDispatch_ = function(action) {

};

module.exports = new ApplicationStore;
module.exports.State = State;
module.exports.EventType = EventType;
