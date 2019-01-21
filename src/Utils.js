// Generated by CoffeeScript 2.3.2
(function() {
  /*
   * 工具类
   */
  var Utils, fs, getOPropNms;

  fs = require('fs');

  Utils = {};

  Utils.getOPropNms = getOPropNms = Object.getOwnPropertyNames;

  Utils.rmdir = function(path, callback) {
    var files;
    files = [];
    if (fs.existsSync(path)) {
      files = fs.readdirSync(path);
      files.forEach(function(file, index) {
        var curPath;
        curPath = path + "/" + file;
        if (fs.statSync(curPath).isDirectory()) {
          return Utils.rmdir(curPath, function() {});
        } else {
          return fs.unlinkSync(curPath);
        }
      });
      return fs.rmdir(path, callback);
    }
  };

  module.exports = Utils;

}).call(this);
