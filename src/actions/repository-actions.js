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
  LOAD_REPOSITORY: 1,
  REPOSITORIES_LOAD_ERROR: 2
};


/**
 * @constructor
 * @extends {EventEmitter}
 */
var RepositoryActions = function() {};
util.inherits(RepositoryActions, EventEmitter);
utils.makeSingleton(RepositoryActions);

/**
 * @param {string} username
 */
RepositoryActions.prototype.loadRepositoriesList = function(username) {
  var xhr = utils.makeRequest([API_URL, RequestType.USER_INFO, username, RequestType.REPOSITORY].join('/'), 'get', 
      function(event) {
        var xhr = event.target;

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
 */
RepositoryActions.prototype.loadRepository = function(username, repository) {
  utils.makeRequest([API_URL, RequestType.REPOSITORY, username, repository, 'commits'].join('/'), 'get', 
      function(event) {
        dispatcher.dispatch({
          actionType: ActionType.LOAD_REPOSITORY,
          repository: JSON.parse(event.target.response)
        })
      });
};

module.exports = RepositoryActions;
module.exports.ActionType = ActionType;