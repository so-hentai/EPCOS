// Generated by CoffeeScript 2.3.2
(function() {
  var DownloadContext, EnterContext, LOG, SocketIORouter;

  EnterContext = require("./EnterContext");

  DownloadContext = require("./DownloadContext");

  LOG = LoggerUtil.getLogger("SocketIORouter");

  SocketIORouter = class SocketIORouter {
    router(socket) {
      socket.use(function(packet, next) {
        var ref, ref1, str;
        str = (socket != null ? (ref = socket.request) != null ? (ref1 = ref.headers) != null ? ref1.cookie : void 0 : void 0 : void 0) || "";
        return next();
      });
      // index = str.indexOf("login=s%3A")
      // return socket.emit "unlogin" if index is -1
      // sessionid = str.substring index + 10, index + 42
      // if global?.sessions?[sessionid] and global.sessions[sessionid].cookie.maxAge > 0
      // 	global.sessions[sessionid]._garbage = Date()
      // 	global.sessions[sessionid].touch()
      // 	next()
      // else unless global.sessions?[sessionid]
      // 	socket.emit "unlogin"
      // else
      // 	socket.emit "overTime", true
      // 检查登陆是否超时
      socket.on("checkOverTime", function() {
        var checkOverTime, cookie, index, sessionid, str, that;
        that = this;
        str = this.request.headers.cookie || "";
        index = str.indexOf("login=s%3A");
        sessionid = str.substring(index + 10, index + 42);
        cookie = global.sessions[sessionid].cookie;
        checkOverTime = function() {
          return setTimeout(function() {
            if (cookie.maxAge > 0) {
              return checkOverTime(cookie.maxAge);
            } else {
              return that.emit("overTime", true);
            }
          }, cookie.maxAge);
        };
        return checkOverTime();
      });
      // 更新超时窗口
      socket.on("refreshOverTime", function() {
        return socket.emit("overTime", false);
      });
      // 更新录入对象配置
      socket.on("refreshEnterEntity", function(configs, callback) {
        var conf, confMap, context, i, len, project, that;
        that = this;
        project = configs[0].project;
        confMap = {};
        for (i = 0, len = configs.length; i < len; i++) {
          conf = configs[i];
          confMap[conf.deploy_id] || (confMap[conf.deploy_id] = []);
          confMap[conf.deploy_id].push({
            field_id: conf.deploy_id,
            field_name: conf.field_name,
            src_type: conf.src_type,
            value: {},
            tip: ""
          });
        }
        context = new EnterContext();
        return async.eachOfSeries(confMap, function(v, k, cb) {
          return context.select({
            col: "resultData",
            filter: {
              deploy_id: k,
              stage: "op1"
            }
          }, function(err, docs) {
            if (err) {
              that.emit("refreshProgress", true, `${k}：更新失败\n${err}`);
              return cb(null);
            }
            if (docs && docs.length > 0) {
              that.emit("refreshProgress", false, `${k}：存在${docs.length}个录入配置，正在更新配置`);
              return context.update({
                col: "resultData",
                filter: {
                  deploy_id: k,
                  stage: "op1"
                },
                setter: {
                  enter: v
                }
              }, function(err) {
                if (err) {
                  that.emit("refreshProgress", true, `${k}：更新失败\n${err}`);
                } else {
                  that.emit("refreshProgress", true, `${k}：更新成功`);
                }
                return cb(null);
              });
            } else {
              return context.select({
                col: "entity",
                filter: {
                  deploy_id: k,
                  isDeploy: 0
                }
              }, function(err, docs) {
                var enterEntitys, entity, j, len1;
                if (err) {
                  that.emit("refreshProgress", true, `${k}：更新失败\n${err}`);
                  return cb(null);
                }
                if (docs && docs.length > 0) {
                  that.emit("refreshProgress", false, `${k}：存在${docs.length}个录入对象，正在新增录入配置`);
                  enterEntitys = [];
                  for (j = 0, len1 = docs.length; j < len1; j++) {
                    entity = docs[j];
                    enterEntitys.push({
                      _id: Utils.uuid(24, 16),
                      project: project,
                      deploy_id: entity.deploy_id,
                      code: entity.code,
                      source_img: entity.source_img,
                      path: entity.path,
                      img_name: entity.img_name,
                      enter: v,
                      stage: "ocr",
                      priority: "1",
                      create_at: entity.create_at
                    });
                  }
                  return context.save({
                    col: "resultData",
                    data: enterEntitys
                  }, function(err) {
                    if (err) {
                      that.emit("refreshProgress", true, `${k}：新增失败\n${err}`);
                    } else {
                      that.emit("refreshProgress", true, `${k}：新增成功`);
                    }
                    return cb(null);
                  });
                } else {
                  that.emit("refreshProgress", true, `${k}：未找到该配置录入对象`);
                  return cb(null);
                }
              });
            }
          });
        }, function(err) {});
      });
      // 下载与解析
      // socket.removeAllListeners "startDownAndParse"
      socket.on("startDownAndParse", function(image) {
        var context, d_socket, that;
        that = this;
        context = new DownloadContext();
        d_socket = {
          emit: function(flag, logInfo) {
            return setTimeout(function() {
              return that.emit("downAndParseProgress", flag, logInfo);
            }, 0);
          },
          on: function() {
            return that.on.apply(that, arguments);
          }
        };
        return context.execute(image, d_socket, function(err, pages) {
          var setter;
          if (err) {
            LOG.error(err);
            that.emit("downAndParseProgress", -1, err);
          } else {
            context = new EnterContext();
            setter = {
              $set: {
                pages: pages,
                state: "待分配",
                scan_at: moment().format("YYYYMMDDHHmmss")
              }
            };
            context.update({
              col: "task",
              filter: {
                _id: image.task
              },
              setter: setter
            }, function() {});
          }
          return that.emit("downAndParseProgress", "final");
        });
      });
      return socket.on("disconnect", function() {});
    }

  };

  module.exports = SocketIORouter;

}).call(this);
