// Generated by CoffeeScript 2.3.2
(function() {
  /*
   * 图片下载解析等操作后进行内存磁盘释放操作
   */
  var CleanHandler, ExecHandler, Handler, LOG;

  Handler = require("./Handler");

  ExecHandler = require("./ExecHandler");

  LOG = LoggerUtil.getLogger("CleanHandler");

  CleanHandler = class CleanHandler extends Handler {
    handle(param, callback) {
      LOG.info("清理");
      return typeof callback === "function" ? callback() : void 0;
    }

  };

  module.exports = CleanHandler;

}).call(this);
