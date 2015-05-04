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
 * @enum {number}
 */
var ActionType = {
  LOAD_REPOSITORIES: 0,
  LOAD_REVISIONS: 1,
  LOAD_REVISION: 2,
  REPOSITORIES_LOAD_ERROR: 3,
  SET_PAGE_SIZE: 4
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

/**
 * @param {string} username
 */
RepositoryActions.prototype.loadRepositoriesList = function(username) {
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

          case 200: 
          default:
            dispatcher.dispatch({
              actionType: ActionType.LOAD_REPOSITORIES,
              username: username,
              repositories: JSON.parse(event.target.response)
            });
            break;
        }
      });
};

/**
 * @param {string} username
 * @param {string} repository
 * @param {number=} numberOfLoadedRevisions
 */
RepositoryActions.prototype.loadRevisions = function(username, repository, numberOfLoadedRevisions) {
  nextPage = Math.floor(numberOfLoadedRevisions / this.pageSize_) + 1;

  if (!nextPage) {
    nextPage = 1;
  }

  utils.makeRequest(
      [
        [API_URL, RequestType.REPOSITORY, username, repository, 'commits'].join('/'),
        this.pageSize_ !== Infinity ? ['?page=', nextPage, '&per_page=', this.pageSize_].join('') : ''
      ].join(''), 'get', 
      function(event) {
        var xhr = event.target;

        if (xhr.status === 200) {
          dispatcher.dispatch({
            actionType: ActionType.LOAD_REVISIONS,
            repositoryName: repository,
            revisions: JSON.parse(xhr.response)
          });
        }
      });
};

/**
 * @param {string} username
 * @param {string} repository
 * @param {string} revisionHash
 */
RepositoryActions.prototype.loadRevision = function(username, repository, revisionHash) {
  utils.makeRequest([API_URL, RequestType.REPOSITORY, username, repository, 'commits', revisionHash].join('/'), 'get',
      function(event) {
        var xhr = event.target;

        if (xhr.status === 200) {
          dispatcher.dispatch({
            actionType: ActionType.LOAD_REVISION,
            revision: JSON.parse(xhr.response)
          });
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
