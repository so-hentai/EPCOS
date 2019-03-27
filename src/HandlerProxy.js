// Generated by CoffeeScript 2.3.2
(function() {

  /*
   * 操作者的默认代理类
   */
  var HandlerProxy, LOG, Proxy;

  Proxy = require("./Proxy");

  LOG = LoggerUtil.getLogger("HandlerProxy");

  HandlerProxy = (function() {
    class HandlerProxy extends Proxy {
      constructor(target) {
        super(target);
      }

      proxy(f) {
        var that;
        that = this;
        return function() {
          var callback, cb, e, haveParam, params, startTime;
          //# 默认只代理操作者的执行方法，并只添加日志记录能力
          if (f.name === "execute") {
            startTime = moment();
            [...params] = arguments;
            if (params.length > 0) {
              haveParam = true;
            }
            callback = params.pop();
            if (typeof callback === "function") {
              cb = function() {
                var endTime;
                endTime = moment();
                LOG.info(`${that.target.constructor.name}.${f.name}操作结束  --${endTime - startTime}ms`);
                that.io && that.io.socket.emit(1, `${that.target.constructor.name}.${f.name}操作结束  --${endTime - startTime}ms`);
                return callback.apply(this, arguments);
              };
              params.push(cb);
            } else {
              if (callback && haveParam) {
                params.push(callback);
              }
              cb = function() {
                var endTime;
                endTime = moment();
                LOG.info(`${that.target.constructor.name}.${f.name}操作结束  --${endTime - startTime}ms`);
                return that.io && that.io.socket.emit(1, `${that.target.constructor.name}.${f.name}操作结束  --${endTime - startTime}ms`);
              };
              params.push(cb);
            }
            try {
              return f.apply(that.target, params);
            } catch (error) {
              e = error;
              return LOG.error(e.stack);
            }
          } else {
            try {
              return f.apply(that.target, arguments);
            } catch (error) {
              e = error;
              return LOG.error(e.stack);
            }
          }
        };
      }

    };

    HandlerProxy.prototype.io = null;

    return HandlerProxy;

  }).call(this);

  module.exports = HandlerProxy;

}).call(this);
