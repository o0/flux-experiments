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
 * @param {string} url
 * @param {string} method
 * @param {function=} callback
 * @param {*=} ctx
 */
utils.makeRequest = function(url, method, callback, ctx) {
  var xhr = new XMLHttpRequest();

  if (typeof callback !== 'undefined') {
    xhr.onload = callback.bind(ctx);
  }

  xhr.open(method, url, true);
  xhr.send();
  return xhr;
};


/**
 * @enum {string}
 */
utils.RequestEventType = {
  ABORT: 'abort',
  ERROR: 'error',
  LOAD: 'load',
  PROGRESS: 'progress'
};


module.exports = utils;
