/**
 * @fileoverview Application basic dispatcher.
 * @author o0 (Igor Alekseenko)
 */

var Dispatcher = require('flux').Dispatcher;
var util = require('util');

/**
 * @constructor
 * @extends {Dispatcher}
 */
var NavigationDispatcher = function() {
  Dispatcher.call(this);
};
util.inherits(NavigationDispatcher, Dispatcher);

module.exports = new NavigationDispatcher;
