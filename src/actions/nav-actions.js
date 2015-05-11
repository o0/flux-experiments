var ApplicationStore = require('../stores/application-store');
var applicationStore = ApplicationStore.getInstance();
var dispatcher = require('../dispatchers/dispatcher');
var RepositoryActions = require('../actions/repository-actions');
var repositoryActions = RepositoryActions.getInstance();
var url = require('url');
var utils = require('../utils/utils');


/**
 * Possible types of navigation between application states (urls).
 * @enum {string}
 */
var NavActionType = {
  INDEX: 'nav-index',
  REPOSITORY: 'nav-repository',
  REVISION: 'nav-revision'
};


/** @type {Object.<NavActionType, RegExp>} */
var actionTypeRegExp = utils.makeObject(
    NavActionType.INDEX, /^\/?$/,
    NavActionType.REPOSITORY, /^\/([A-Za-z0-9\-:_\+]+)\/([A-Za-z0-9\-:_\+]+)\/?$/,
    NavActionType.REVISION, /^\/([A-Za-z0-9\-:_\+]+)\/([A-Za-z0-9\-:_\+]+)\/([A-Za-z0-9\-:_\+]+)\/?$/);


/** @constructor */
var NavActions = function() {
  window.onpopstate = this.onHistoryChange_.bind(this);
};
utils.makeSingleton(NavActions);

/**
 * @param {NavActionType} actionType
 * @param {...string} var_args
 */
NavActions.prototype.navigate = function(actionType, var_args) {
  var from = 1;
  var neededParams = actionType === NavActionType.REPOSITORY ? 2 : 
      (actionType === NavActionType.REVISION ? 3 : 0);

  // NB! First empty element is a bit hacky but solid way
  // to fully replace path.
  var params = [''].concat([].slice.call(arguments, 1, from + neededParams));
  history.pushState(null, null, params.join('/'));
  this.handleNavigation_();
};

/**
 * @param {Event} evt
 * @private
 */
NavActions.prototype.onHistoryChange_ = function(evt) {
  this.handleNavigation_();
};

/**
 * @private
 */
NavActions.prototype.handleNavigation_ = function() {
  var payload = this.getDataFromURL_();

  switch (payload.actionType) {
    case NavActions.NavActionType.INDEX:
      applicationStore.setStateEnabled(ApplicationStore.State.REPOSITORY_IS_LOADED, false);
      break;

    case NavActions.NavActionType.REPOSITORY:
      repositoryActions.loadRevisions(payload.username, payload.repository);
      break;

    case NavActions.NavActionType.REVISION:
      repositoryActions.loadRevision(payload.username, payload.repository, payload.revision);
      break;
  }
};


/**
 * @return {{ actionType: actionType, data: Object }}
 * @private
 */
NavActions.prototype.getDataFromURL_ = function() {
  var actionType;
  var fetchedParams;
  var actionTypes = Object.keys(actionTypeRegExp);
  var parsedUrl = url.parse(document.location.toString());

  var isValidRegExp = actionTypes.some(function(currentActionType) {
    actionType = currentActionType;
    return fetchedParams = parsedUrl.pathname.match(actionTypeRegExp[currentActionType]);
  });

  if (!isValidRegExp) {
    return null;
  }

  var dataObj = {};

  switch(actionType) {
    case NavActionType.REVISION:
      dataObj.revision = fetchedParams[3];
    case NavActionType.REPOSITORY:
      dataObj.repository = fetchedParams[2]
      dataObj.username = fetchedParams[1]
    case NavActionType.INDEX:
    default:
      dataObj.actionType = actionType;
      break;
  }

  return dataObj;
};


module.exports = NavActions;
module.exports.NavActionType = NavActionType;
