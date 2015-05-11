var dispatcher = require('../dispatchers/dispatcher');
var EventEmitter = require('events').EventEmitter;
var url = require('url');
var util = require('util');
var utils = require('../utils/utils');


/**
 * @const
 * @type {string}
 */
var API_URL = 'https://api.github.com';


/**
 * @enum {string}
 */
var RequestType = {
  REPOSITORY: 'repos',
  USER_INFO: 'users'
};


/**
 * @enum {string}
 */
var ActionType = {
  CLEANUP: 'cleanup',
  LOAD_REPOSITORIES: 'load-repos',
  LOAD_REVISIONS: 'load-revisions',
  LOAD_REVISION: 'load-revision',
  REPOSITORIES_LOAD_ERROR: 'load-repos-error',
  SET_PAGE_SIZE: 'set-page-size',
  LOAD_START: 'load-start'
};


/**
 * @constructor
 * @extends {EventEmitter}
 */
var RepositoryActions = function() {};
util.inherits(RepositoryActions, EventEmitter);
utils.makeSingleton(RepositoryActions);

/**
 * @type {number}
 * @private
 */
RepositoryActions.prototype.pageSize_ = Infinity;

RepositoryActions.prototype.cleanup = function() {
  dispatcher.dispatch({
    actionType: ActionType.CLEANUP
  });
};

/**
 * @param {string} username
 * @param {boolean=} silent
 * @param {function=} callback
 * @param {*=} ctx
 */
RepositoryActions.prototype.loadRepositoriesList = function(username, silent, callback, ctx) {
  var xhr = utils.makeRequest([API_URL, RequestType.USER_INFO, username, RequestType.REPOSITORY].join('/'), 'get', 
      function(event) {
        var xhr = event.target;

        // todo: Maybe it would be better to use one action type instead of two.
        switch(xhr.status) {
          case 404:
            dispatcher.dispatch({
              actionType: ActionType.REPOSITORIES_LOAD_ERROR,
              username: username,
              message: ['There\'s no user with name', username].join(' ')
            });
            break;

          default:
            dispatcher.dispatch({
              actionType: ActionType.LOAD_REPOSITORIES,
              username: username,
              repositories: JSON.parse(event.target.response),
              silent: silent
            });
            break;
        }

        if (typeof callback !== 'undefined') {
          callback.call(ctx, event);
        }
      });
};

/**
 * @param {string} username
 * @param {string} repository
 * @param {number=} numberOfLoadedRevisions
 * @param {boolean=} silent
 * @param {function=} callback
 * @param {*=} ctx
 */
RepositoryActions.prototype.loadRevisions = function(username, repository, numberOfLoadedRevisions, 
                                                     silent, callback, ctx) {
  nextPage = Math.floor(numberOfLoadedRevisions / this.pageSize_) + 1;

  if (!nextPage) {
    nextPage = 1;
  }

  dispatcher.dispatch({
    actionType: ActionType.LOAD_START
  });

  utils.makeRequest([
        [API_URL, RequestType.REPOSITORY, username, repository, 'commits'].join('/'),
        this.pageSize_ !== Infinity ? ['?page=', nextPage, '&per_page=', this.pageSize_].join('') : ''
      ].join(''), 'get', function(event) {
        var xhr = event.target;

        // NB! A bit naive check.
        if (xhr.status < 400) {
          dispatcher.dispatch({
            actionType: ActionType.LOAD_REVISIONS,
            repositoryName: repository,
            revision: null,
            revisions: JSON.parse(xhr.response),
            silent: silent
          });
        }

        if (typeof callback !== 'undefined') {
          callback.call(ctx, event);
        }
      });
};

/**
 * @param {string} username
 * @param {string} repository
 * @param {string} revisionHash
 * @param {boolean=} silent
 * @param {function=} callback
 * @param {*=} ctx
 */
RepositoryActions.prototype.loadRevision = function(username, repository, revisionHash, silent, callback, ctx) {
  utils.makeRequest([API_URL, RequestType.REPOSITORY, username, repository, 'commits', revisionHash].join('/'), 'get',
      function(event) {
        var xhr = event.target;

        if (xhr.status < 400) {
          dispatcher.dispatch({
            actionType: ActionType.LOAD_REVISION,
            repositoryName: repository,
            revision: JSON.parse(xhr.response),
            silent: silent,
            username: username
          });
        }

        if (typeof callback !== 'undefined') {
          callback.call(ctx, event);
        }
      });
};

/**
 * @param {number} itemsPerPage
 */
RepositoryActions.prototype.setPageSize = function(itemsPerPage) {
  this.pageSize_ = itemsPerPage;
};

/**
 * @return {number} 
 */
RepositoryActions.prototype.getPageSize = function() {
  return this.pageSize_;
};


module.exports = RepositoryActions;
module.exports.ActionType = ActionType;
