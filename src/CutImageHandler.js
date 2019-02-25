// Generated by CoffeeScript 2.3.2
(function() {
  /*
   *	对下载解析等操作后的图片进行裁剪操作
   */
  var CutImageHandler, ExecHandler, Handler, LOG;

  Handler = require("./Handler");

  ExecHandler = require("./ExecHandler");

  LOG = LoggerUtil.getLogger("CutImageHandler");

  CutImageHandler = class CutImageHandler extends Handler {
    handle(callback) {
      var cut_stat, dao, exec, that;
      that = this;
      if (!this.data.images) {
        LOG.warn(`${argv.project}：没有需要切割的分快`);
        return callback(null);
      }
      this.data.bills = [];
      exec = new ExecHandler().queue_exec(3);
      dao = new MongoDao(__b_config.dbInfo, {
        epcos: ["entity"]
      });
      cut_stat = {
        total: 0,
        success: 0,
        exist: 0,
        failure: 0
      };
      return async.each(this.data.images, function(image, cb) {
        var bills, rel_path;
        if (image.state !== 2 && image.state !== -3) {
          return cb(null);
        }
        if (image.s_url.endsWith("/")) {
          rel_path = image.s_url;
        } else {
          rel_path = `${image.s_url}/`;
        }
        bills = that.data.deploy.bills.filter(function(b) {
          return b.image === image.deploy_id;
        });
        if (image.img_name.endsWith("pdf")) {
          return fs.readdir(`${rel_path}${image.img_name.replace(".pdf", "")}/`, function(err, menu) {
            if (err) {
              return cb(err);
            }
            return async.each(menu, function(f_nm, cb1) {
              return async.each(bills, function(bill, cb2) {
                var cut_path, img_path;
                cut_path = rel_path.replace("image", "bill");
                cut_path = `${cut_path}${bill.code}/`;
                img_path = `${rel_path}${image.img_name.replace(".pdf", "")}/`;
                cut_path = `${cut_path}${image.img_name.replace(".pdf", "")}/`;
                return mkdirp(cut_path, function(err) {
                  var dbBill;
                  if (err) {
                    return cb2(err);
                  }
                  cut_stat.total++;
                  dbBill = {
                    deploy_id: bill._id.toString(),
                    type: "bill",
                    source_img: image._id,
                    code: bill.code,
                    img_name: f_nm,
                    path: cut_path
                  };
                  that.data.bills.push(dbBill);
                  return dao.epcos.entity.selectOne(dbBill, function(err, doc) {
                    if (err) {
                      return cb2(err);
                    }
                    if (doc) {
                      cut_stat.exist++;
                      dbBill._id = doc._id.toString();
                      dbBill.inDB = true;
                      dbBill.state = doc.state;
                    } else {
                      dbBill._id = Utils.uuid(24, 16);
                      dbBill.state = 0;
                      dbBill.create_at = moment().format("YYYYMMDDHHmmss");
                    }
                    if (doc && (doc.state === 1 || Math.abs(doc.state) > 1)) {
                      return cb2(null);
                    }
                    return async.series([
                      function(cb3) {
                        if (!bill.filter) {
                          return cb3(null);
                        }
                        return exec(`gm identify ${img_path}${f_nm}`,
                      function(error,
                      stdout = "",
                      stderr = "") {
                          var height,
                      info,
                      width;
                          if (error) {
                            return cb3(error);
                          }
                          info = stdout.split(" ");
                          width = +info[2].substring(0,
                      info[2].indexOf("x"));
                          height = +info[2].substring(info[2].indexOf("x") + 1,
                      info[2].indexOf("+"));
                          if (bill.filter === "width>height" && width > height) {
                            return cb3(null);
                          } else if (bill.filter === "width<height" && width < height) {
                            return cb3(null);
                          } else if (bill.filter === "width=height" && width === height) {
                            return cb3(null);
                          } else {
                            cut_stat.total--;
                            return cb3("break");
                          }
                        });
                      },
                      function(cb3) {
                        var cut_cmd,
                      e,
                      options;
                        options = {
                          src: `${img_path}${f_nm}`,
                          dst: `${cut_path}${f_nm}`,
                          x0: bill.x0,
                          y0: bill.y0,
                          x1: bill.x1,
                          y1: bill.y1
                        };
                        cut_cmd = "gmic -v - %(src)s -crop[-1] %(x0)s,%(y0)s,%(x1)s,%(y1)s -o[-1] %(dst)s";
                        try {
                          cut_cmd = sprintf.sprintf(cut_cmd,
                      options);
                        } catch (error1) {
                          e = error1;
                          dbBill.state = -1; //切图失败
                          return cb3(e);
                        }
                        return exec(cut_cmd,
                      function(err,
                      stdout,
                      stderr,
                      spent) {
                          dbBill.state = 1; //切图完成
                          if (err && (dbBill.state = -1)) { //切图失败
                            return cb3(err);
                          }
                          stdout = `${stdout}`.trim();
                          stderr = `${stderr}`.trim();
                          if (stdout.length > 0) {
                            LOG.info(stdout);
                          }
                          if (stderr.length > 0) {
                            LOG.info(stderr);
                          }
                          LOG.info(`${options.src} => ${options.dst} ${spent}ms`);
                          cut_stat.success++;
                          return cb3(null);
                        });
                      }
                    ], function(err) {
                      if (err === "break") {
                        LOG.trace(`break ${bill.filter} ${img_path}${f_nm}`);
                        return cb2(null);
                      }
                      return cb2(err);
                    });
                  });
                });
              }, cb1);
            }, function(err) {
              image.state = 3; //分块完成
              if (err && (image.state = -3)) { //分块失败
                LOG.error(err);
              }
              return cb(null);
            });
          });
        } else {
          return async.each(bills, function(bill, cb1) {
            var cut_path;
            cut_path = rel_path.replace("image", "bill");
            cut_path = `${cut_path}${bill.code}/`;
            return mkdirp(cut_path, function(err) {
              var dbBill;
              if (err) {
                return cb1(err);
              }
              cut_stat.total++;
              dbBill = {
                deploy_id: bill._id.toString(),
                type: "bill",
                source_img: image._id,
                code: bill.code,
                img_name: image.img_name,
                path: cut_path
              };
              that.data.bills.push(dbBill);
              return dao.epcos.entity.selectOne(dbBill, function(err, doc) {
                if (err) {
                  return cb1(err);
                }
                if (doc) {
                  cut_stat.exist++;
                  dbBill._id = doc._id.toString();
                  dbBill.inDB = true;
                  dbBill.state = doc.state;
                } else {
                  dbBill._id = Utils.uuid(24, 16);
                  dbBill.state = 0;
                  dbBill.create_at = moment().format("YYYYMMDDHHmmss");
                }
                if (doc && (doc.state === 1 || Math.abs(doc.state) > 1)) {
                  return cb1(null);
                }
                return async.series([
                  function(cb2) {
                    if (!bill.filter) {
                      return cb2(null);
                    }
                    return exec(`gm identify ${rel_path}${image.img_name}`,
                  function(error,
                  stdout = "",
                  stderr = "") {
                      var height,
                  info,
                  width;
                      if (error) {
                        return cb2(error);
                      }
                      info = stdout.split(" ");
                      width = +info[2].substring(0,
                  info[2].indexOf("x"));
                      height = +info[2].substring(info[2].indexOf("x") + 1,
                  info[2].indexOf("+"));
                      if (bill.filter === "width>height" && width > height) {
                        return cb2(null);
                      } else if (bill.filter === "width<height" && width < height) {
                        return cb2(null);
                      } else if (bill.filter === "width=height" && width === height) {
                        return cb2(null);
                      } else {
                        cut_stat.total--;
                        return cb2("break");
                      }
                    });
                  },
                  function(cb2) {
                    var cut_cmd,
                  e,
                  options;
                    options = {
                      src: `${rel_path}${image.img_name}`,
                      dst: `${cut_path}${image.img_name}`,
                      x0: bill.x0,
                      y0: bill.y0,
                      x1: bill.x1,
                      y1: bill.y1
                    };
                    cut_cmd = "gmic -v - %(src)s -crop[-1] %(x0)s,%(y0)s,%(x1)s,%(y1)s -o[-1] %(dst)s";
                    try {
                      cut_cmd = sprintf.sprintf(cut_cmd,
                  options);
                    } catch (error1) {
                      e = error1;
                      dbBill.state = -1; //切图失败
                      return cb2(e);
                    }
                    return exec(cut_cmd,
                  function(err,
                  stdout,
                  stderr,
                  spent) {
                      dbBill.state = 1; //切图完成
                      if (err && (dbBill.state = -1)) { //切图失败
                        return cb2(err);
                      }
                      stdout = `${stdout}`.trim();
                      stderr = `${stderr}`.trim();
                      if (stdout.length > 0) {
                        LOG.info(stdout);
                      }
                      if (stderr.length > 0) {
                        LOG.info(stderr);
                      }
                      LOG.info(`${options.src} => ${options.dst} ${spent}ms`);
                      cut_stat.success++;
                      return cb2(null);
                    });
                  }
                ], function(err) {
                  if (err === "break") {
                    LOG.trace(`break ${bill.filter} ${rel_path}${image.img_name}`);
                    return cb1(null);
                  }
                  return cb1(err);
                });
              });
            });
          }, function(err) {
            image.state = 3; //分块完成
            if (err && (image.state = -3)) { //分块失败
              LOG.error(err);
            }
            return cb(null);
          });
        }
      }, function(err) {
        if (err) {
          LOG.error(JSON.stringify(err));
        }
        cut_stat.failure = cut_stat.total - cut_stat.success - cut_stat.exist;
        LOG.info(JSON.stringify(cut_stat));
        return callback.apply(this, arguments);
      });
    }

  };

  module.exports = CutImageHandler;

}).call(this);
