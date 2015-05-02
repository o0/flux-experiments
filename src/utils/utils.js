var utils = {};

/**
 * @param {function} ctor
 */
utils.makeSingleton = function(ctor) {
  ctor.getInstance = function() {
    if (typeof ctor.instance_ === 'undefined') {
      ctor.instance_ = new ctor;
    }

    return ctor.instance_;
  };
};

/**
 * @param {*...} var_args 
 */
utils.makeObject = function(var_args) {
  var args = [].slice.call(arguments, 0);
  var obj = {};

  args.forEach(function(arg, index) {
    if (index % 2 != 0) {
      obj[arg] = args[index + 1];
    }
  });

  return obj;
};

/**
 * @type {XMLHttpRequest}
 * @private
 */
var xhr = new XMLHttpRequest();

/**
 * @param {string} url
 * @param {string} method
 * @param {function=} callback
 * @param {*=} ctx
 */
utils.makeRequest = function(url, method, callback, ctx) {
  xhr.onload = callback.bind(ctx);
  xhr.open(method, url, true);
  xhr.send();
};

module.exports = utils;