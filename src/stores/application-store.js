var EventEmitter = require('events').EventEmitter;
var dispatcher = require('../dispatchers/dispatcher');
var RepositoryActions = require('../actions/repository-actions');
var util = require('util');
var utils = require('../utils/utils');


/**
 * @enum {number}
 */
var State = {
  NULL: 0x00
};


/**
 * @enum {string}
 */
var EventType = {
  CHANGE: 'change'
};


/**
 * @constructor
 * @extends {EventEmitter}
 */
var ApplicationStore = function() {};
util.inherits(ApplicationStore, EventEmitter);
utils.makeSingleton(ApplicationStore);

/**
 * @type {State}
 * @private
 */
ApplicationStore.prototype.state_ = State.NULL;

/**
 * @param {State} state
 * @param enabled
 */
ApplicationStore.prototype.setStateEnabled = function(state, enabled) {
  this.state_ = enabled ? this.state_ | state : this.state_ & ~state;
  this.emit(EventType.SET_STATE);
};

/**
 * @param {State} state
 * @return {boolean}
 */
ApplicationStore.prototype.hasState = function(state) {
  return !!(this.state_ & state);
};


module.exports = ApplicationStore;
module.exports.State = State;
module.exports.EventType = EventType;
