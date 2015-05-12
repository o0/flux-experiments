var utils = require('./utils');

describe('utils', function() {
  describe('ClassName', function() {
    var BASE_NAME = 'mybase';
    var ANOTHER_BASE_NAME = 'anotherbase';

    it ('Should set base name properly', function() {
      var className = new utils.ClassName(BASE_NAME);
      expect(className.getClassName()).toEqual(BASE_NAME);

      className.setBaseClassName(ANOTHER_BASE_NAME);
      expect(className.getClassName()).toEqual(ANOTHER_BASE_NAME);
    });

    it ('Should generate class name properly: base name and then all additional names separated by dash', function() {
      var className = new utils.ClassName(BASE_NAME);
      expect(className.getClassName('additional')).toEqual('mybase-additional');
      expect(className.getClassName('additional', 'prop')).toEqual('mybase-additional-prop');
      expect(className.getClassName('additional', 'prop', 'another')).toEqual('mybase-additional-prop-another');
    });
  });

  describe('makeSingleton', function() {
    var Constr = function() {};
    Constr.prototype.prop = 1;
    utils.makeSingleton(Constr);

    it ('Should add getInstance_ method', function() {
      expect(Constr.getInstance).toBeDefined();
    });

    it ('Should return always the same instance', function() {
      var inst1 = Constr.getInstance();
      var inst2 = Constr.getInstance();
      expect(inst1).toEqual(inst2);
    });
  });

  describe('makeObject', function() {
    it ('Should create an object with odd arguments as keys and even as values', function() {
      var obj = utils.makeObject('key1', 'val1', 'key2', 'val2');

      // NB! Jasmine doesn't have a deep object comparison tools
      // so it could be worked around as in the code below or
      // some external comparison tool needed here.
      expect(Object.keys(obj).join('')).toEqual('key1key2');
      expect(Object.keys(obj).map(function(key) {
        return obj[key]
      }).join('')).toEqual('val1val2');
    });

    it ('Should throw an error if odd number of arguments given', function() {
      var fn = function() {
        utils.makeObject('key1', 'val1', 'key2');
      };

      expect(fn).toThrowError(/uneven number of arguments given/i);
    });
  });
});
