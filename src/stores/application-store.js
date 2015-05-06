var EventEmitter = require('events').EventEmitter;
var dispatcher = require('../dispatchers/dispatcher');
var RepositoryActions = require('../actions/repository-actions');
var util = require('util');
var utils = require('../utils/utils');


/**
 * @enum {number}
 */
var State = {
  NULL: 0x00,
  REPOSITORY_IS_LOADED: 0x01
};


/**
 * @enum {string}
 */
var EventType = {
  CHANGE: 'change',
  LOAD_REPOSITORY: 'load-repository'
};


/**
 * @constructor
 * @extends {EventEmitter}
 */
var ApplicationStore = function() {
  this.dispatchHandler_ = dispatcher.register(function(payload) {
    switch (payload.actionType) {
      case RepositoryActions.ActionType.LOAD_REVISIONS:
        this.setStateEnabled(State.REPOSITORY_IS_LOADED, true);
        this.emit(EventType.LOAD_REPOSITORY);
        break;
    }
  }.bind(this));
};
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
