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
        if (!fs.existsSync(curPath)) {
          return;
        }
        if (fs.statSync(curPath).isDirectory()) {
          return Utils.rmdir(curPath, function() {});
        } else {
          return fs.unlinkSync(curPath);
        }
      });
      return fs.rmdir(path, callback);
    } else {
      return callback("unexist");
    }
  };

  Utils.cropFile = function(source, target, callback) {
    if (fs.existsSync(source)) {
      return fs.readFile(source, function(err, data) {
        if (err) {
          return callback(err);
        }
        return fs.writeFile(target, data, callback);
      });
    }
  };

  Utils.uuid = function(len, radix) {
    var chars, i, j, k, r, ref, uuid;
    chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
    uuid = [];
    radix = radix || chars.length;
    if (len) {
      for (i = j = 0, ref = len; (0 <= ref ? j < ref : j > ref); i = 0 <= ref ? ++j : --j) {
        uuid[i] = chars[0 | Math.random() * radix];
      }
    } else {
      uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
      uuid[14] = '4';
      for (i = k = 0; k < 36; i = ++k) {
        if (!uuid[i]) {
          r = 0 | Math.random() * 16;
          uuid[i] = chars[i === 19 ? (r & 0x3) | 0x8 : r];
        }
      }
    }
    return uuid.join('').toLowerCase();
  };

  Utils.getLength = function(str) {
    str = str || "";
    str = typeof str === "string" ? str : str + "";
    return str.replace(/[\u0391-\uFFE5]/g, "aa").length; //先把中文替换成两个字节的英文，在计算长度
  };

  Utils.replaceAll = function(target, sce, val) {
    var i, j, len1, t;
    if (typeof target === "string") {
      target = target.replace(new RegExp(sce, "g"), val);
    }
    if (Array.isArray(target)) {
      for (i = j = 0, len1 = target.length; j < len1; i = ++j) {
        t = target[i];
        if (target[i] === sce) {
          target[i] = val;
        }
      }
    }
    return target;
  };

  Utils.clone = function(obj) {
    var e;
    try {
      return JSON.parse(JSON.stringify(obj));
    } catch (error) {
      e = error;
      if (typeof LOG !== "undefined" && LOG !== null) {
        LOG.error(e.stack);
      }
      return obj;
    }
  };

  module.exports = Utils;

}).call(this);
