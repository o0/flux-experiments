var dispatcher = require('../dispatchers/dispatcher');
var EventEmitter = require('events').EventEmitter;
var RepositoryActions = require('../actions/repository-actions');
var repositoryActions = RepositoryActions.getInstance();
var util = require('util');
var utils = require('../utils/utils');

/**
 * @enum {string}
 */
var EventType = {
  REPOSITORIES_LOAD_ERROR: 'repos-load-err',
  SET_REPOSITORIES_LIST: 'repos-set',
  SET_REVISIONS_LIST: 'revisions-set'
};

/**
 * @constructor
 */
var RepositoryStore = function() {
  this.dispatcherHandler_ = dispatcher.register(function(payload) {
    switch (payload.actionType) {
      case RepositoryActions.ActionType.LOAD_REPOSITORIES:
        if (payload.repositories.length === 0) {
          this.errorMessage_ = ['User', this.getUserName(), 'doesn\'t have repositories'].join(' ')
          this.repositoriesList_ = [];
          this.emit(EventType.REPOSITORIES_LOAD_ERROR);
          return;
        }

        this.errorMessage_ = '';
        this.repositoriesList = [];
        this.setRepositoriesList(payload.username, payload.repositories);
        break;

      case RepositoryActions.ActionType.REPOSITORIES_LOAD_ERROR:
        this.errorMessage_ = payload.message;
        this.repositoriesList_ = [];
        this.emit(EventType.REPOSITORIES_LOAD_ERROR);
        break;

      case RepositoryActions.ActionType.LOAD_REPOSITORY:
        this.setRevisionsList(payload.revisions);
        break;
    }
  }.bind(this));
};
util.inherits(RepositoryStore, EventEmitter);
utils.makeSingleton(RepositoryStore);

/**
 * @type {Array.<string>}
 * @private
 */
RepositoryStore.prototype.repositoriesList_ = [];

/**
 * @type {Array.<Object>}
 * @private
 */
RepositoryStore.prototype.revisionsList_ = [];

/**
 * @type {string}
 * @private
 */
RepositoryStore.prototype.username_ = null;

/**
 * @type {string}
 * @private
 */
RepositoryStore.prototype.errorMessage_ = '';

/**
 * @param {string} username
 * @param {Array.<Object>} repositories raw response from github api.
 */
RepositoryStore.prototype.setRepositoriesList = function(username, repositories) {
  this.username_ = username;
  this.repositoriesList_ = repositories ? repositories.map(function(item) {
    return item.name;
  }) : [];
  this.emit(EventType.SET_REPOSITORIES_LIST);
};

/**
 * @return {string}
 */
RepositoryStore.prototype.getUserName = function() {
  return this.username_;
};

/**
 * @return {Array.<string>}
 */
RepositoryStore.prototype.getRepositoriesList = function() {
  return this.repositoriesList_;
};

/**
 * @return {string}
 */
RepositoryStore.prototype.getErrorMessage = function() {
  return this.errorMessage_;
};

/**
 * @param {Array.<Object>} revisionsList
 */
RepositoryStore.prototype.setRevisionsList = function(revisionsList) {
  this.revisionsList_ = revisionsList;
  this.emit(RepositoryStore.EventType.SET_REVISIONS_LIST);
};

/**
 * @return {Array.<Object>}
 */
RepositoryStore.prototype.getRevisionsList = function() {
  return this.revisionsList_;
};


module.exports = RepositoryStore;
module.exports.EventType = EventType;

