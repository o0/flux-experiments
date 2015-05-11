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
  CHANGE: 'change',
  LOAD_START: 'load-start',
  REPOSITORIES_LOAD_ERROR: 'repos-load-err',
  SET_REPOSITORIES_LIST: 'repos-set',
  SET_REVISIONS_LIST: 'revisions-set',
  SET_REVISION: 'revision-set'
};


/**
 * @constructor
 */
var RepositoryStore = function() {
  this.dispatcherHandler_ = dispatcher.register(function(payload) {
    switch (payload.actionType) {
      case RepositoryActions.ActionType.LOAD_START:
        this.isLoading_ = true;
        this.emit(EventType.LOAD_START);
        break;

      case RepositoryActions.ActionType.LOAD_REPOSITORIES:
        this.isLoading_ = false;

        if (payload.repositories.length === 0) {
          this.errorMessage_ = ['User', this.getUserName(), 'doesn\'t have repositories'].join(' ')
          this.repositoriesList_ = [];
          this.repositoryName_ = '';
          this.emit(EventType.REPOSITORIES_LOAD_ERROR);
          return;
        }

        this.errorMessage_ = '';
        this.repositoriesList = [];
        this.repositoryName_ = '';
        this.revision_ = null;
        this.revisionHash_ = null;
        this.setRepositoriesList(payload.username, payload.repositories);
        break;

      case RepositoryActions.ActionType.REPOSITORIES_LOAD_ERROR:
        this.isLoading_ = false;

        this.errorMessage_ = payload.message;
        this.repositoriesList_ = [];
        this.repositoryName_ = '';
        this.emit(EventType.REPOSITORIES_LOAD_ERROR);
        break;

      case RepositoryActions.ActionType.LOAD_REVISIONS:
        this.isLoading_ = false;

        var replace = this.repositoryName_ !== payload.repositoryName;

        this.repositoryName_ = payload.repositoryName;
        // NB! This might cause a problem if number of revisions on the last page
        // equal the last page size. In this case user might make one additional 
        // request.
        this.nextPageIsAvailable_ = payload.revisions.length === repositoryActions.getPageSize()
        this.setRevisionsList(payload.revisions, replace);
        break;

      case RepositoryActions.ActionType.LOAD_REVISION:
        this.isLoading_ = false;
        this.setRevision(payload.revision);
        break;

      case RepositoryActions.ActionType.SET_PAGE_SIZE:
        this.setPageSize(payload.pageSize);
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
 * @type {Array.<string>}
 * @private
 */
RepositoryStore.prototype.revisionsHashes_ = [];

/**
 * @type {string}
 * @private
 */
RepositoryStore.prototype.repositoryName_ = null;

/**
 * @type {string}
 * @private
 */
RepositoryStore.prototype.revisionHash_ = null;

/**
 * @type {Object}
 * @private
 */
RepositoryStore.prototype.revision_ = null;

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
 * @type {boolean}
 * @private
 */
RepositoryStore.prototype.nextPageIsAvailable_ = true;

/**
 * @type {boolean}
 * @private
 */
RepositoryStore.prototype.isLoading_ = true;

/**
 * @param {string} username
 * @param {Array.<Object>} repositories raw response from github api.
 * @param {boolean=} silent
 */
RepositoryStore.prototype.setRepositoriesList = function(username, repositories, silent) {
  silent = typeof silent === 'boolean' ? silent : false;

  this.username_ = username;
  this.repositoriesList_ = repositories ? repositories.map(function(item) {
    return item.name;
  }) : [];

  if (!silent) {
    this.emit(EventType.SET_REPOSITORIES_LIST);
    this.emit(EventType.CHANGE);
  }
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
 * @param {boolean=} replace
 * @param {boolean=} silent
 */
RepositoryStore.prototype.setRevisionsList = function(revisionsList, replace, silent) {
  silent = typeof silent === 'boolean' ? silent : false;

  if (replace) {
    this.revisionsList_ = [];
    this.revisionsHashes_ = [];
  }

  // NB! Merge the list of revisions. Numbers of pages are calculated
  // dynamically with respect to the current height of page so some
  // revisions could be loaded twice if page size was increased.
  // For example page size was initially 10 and then after page resize
  // it became 60. In this case RepositoryActions would load first page
  // for the second time because 50 items from it are not shown.
  this.revisionsList_ = this.revisionsList_.concat(revisionsList.filter(function(revision) {
    if (this.revisionsHashes_.indexOf(revision.sha) === -1) {
      this.revisionsHashes_.push(revision.sha);
      return true;
    }

    return false;
  }, this));

  if (!silent) {
    this.emit(RepositoryStore.EventType.SET_REVISIONS_LIST);
    this.emit(EventType.CHANGE);
  }
};

/**
 * @return {Array.<Object>}
 */
RepositoryStore.prototype.getRevisionsList = function() {
  return this.revisionsList_;
};

/**
 * @return {string}
 */
RepositoryStore.prototype.getRepositoryName = function() {
  return this.repositoryName_;
};

/**
 * @param {?Object} revision
 * @param {boolean=} silent
 */
RepositoryStore.prototype.setRevision = function(revision, silent) {
  silent = typeof silent === 'boolean' ? silent : false;

  this.revision_ = revision;
  this.revisionHash_ = revision ? revision.sha : null;

  if (!silent) {
    this.emit(EventType.SET_REVISION);
    this.emit(EventType.CHANGE);
  }
};

/**
 * @return {string}
 */
RepositoryStore.prototype.getRevisionHash = function() {
  return this.revisionHash_;
};

/**
 * @return {Object}
 */
RepositoryStore.prototype.getRevision = function() {
  return this.revision_;
}

/**
 * @return {boolean}
 */
RepositoryStore.prototype.isNextPageAvailable = function() {
  return this.nextPageIsAvailable_;
};

/**
 * @return {boolean}
 */
RepositoryStore.prototype.isLoading = function() {
  return this.isLoading_;
}


module.exports = RepositoryStore;
module.exports.EventType = EventType;

