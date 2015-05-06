var dispatcher = require('../dispatchers/dispatcher');
var url = require('url');
var utils = require('../utils/utils');


/**
 * Possible types of navigation between application states (urls).
 * @enum {number}
 */
var NavActionType = {
  INDEX: 0,
  REPOSITORY: 1,
  REVISION: 2
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

  var params = [].slice.call(arguments, 1, from + neededParams);
  history.pushState(null, null, params.join('/'));
  dispatcher.dispatch(this.getDataFromURL_());
};

/**
 * @param {Event} evt
 * @private
 */
NavActions.prototype.onHistoryChange_ = function(evt) {
  dispatcher.dispatch(this.getDataFromURL_());
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

  switch(+actionType) {
    case NavActionType.REVISION:
      dataObj.revision = fetchedParams[3];
    case NavActionType.REPOSITORY:
      dataObj.repository = fetchedParams[2]
      dataObj.userName = fetchedParams[1]
    case NavActionType.INDEX:
    default:
      dataObj.actionType = actionType;
      break;
  }

  return dataObj;
};


module.exports = NavActions;
module.exports.NavActionType = NavActionType;
