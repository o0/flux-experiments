var utils = {};


/**
 * @param {string} baseClassName
 */
utils.ClassName = function(baseClassName) {
  this.setBaseClassName(baseClassName);
};

/**
 * @param {string} baseClassName
 */
utils.ClassName.prototype.setBaseClassName = function(baseClassName) {
  /**
   * @type {string}
   * @private
   */
  this.baseClassName_ = baseClassName;
};

/**
 * @param {...string} var_args
 * @return {string}
 */
utils.ClassName.prototype.getClassName = function(var_args) {
  var classes = [].slice.call(arguments, 0);
  return [this.baseClassName_].concat(classes).join('-');
}


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
 * @throws {Error}
 */
utils.makeObject = function(var_args) {
  var args = [].slice.call(arguments, 0);
  var obj = {};

  if (args.length % 2 !== 0) {
    throw Error('Uneven number of arguments given');
  }

  args.forEach(function(arg, index) {
    if (index % 2 == 0) {
      obj[arg] = args[index + 1];
    }
  });

  return obj;
};


/**
 * @param {string} url
 * @param {string} method
 * @param {function=} callback
 * @param {function=} failCallback
 * @param {*=} ctx
 */
utils.makeRequest = function(url, method, callback, failCallback, ctx) {
  var xhr = new XMLHttpRequest();
  var timeout = setTimeout(function() {
    if (typeof failCallback !== 'undefined') {
      failCallback();
    }
  });

  if (typeof callback !== 'undefined') {
    xhr.onload = function(evt) {
      clearTimeout(timeout);
      callback.call(ctx, evt);
    }
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
