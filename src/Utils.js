// Generated by CoffeeScript 2.3.2
(function() {
  /*
   * 工具类
   */
  var Utils, getOPropNms, lodash, recursion, sprintf;

  lodash = require("lodash");

  sprintf = require("sprintf-js");

  Utils = {};

  recursion(lodash);

  recursion(sprintf);

  Utils.getOPropNms = getOPropNms = Object.getOwnPropertyNames;

  //递归引用
  Utils.recursion = recursion = function(target) {
    var i, key, len, ref;
    ref = getOPropNms(target);
    for (i = 0, len = ref.length; i < len; i++) {
      key = ref[i];
      if (typeof target[key] === "function") {
        this[key] = target[key];
      }
    }
    if (target.__proto__ && target.__proto__ !== Object.prototype) {
      return arguments.callee(target.__proto__);
    }
  };

  module.exports = Utils;

}).call(this);
