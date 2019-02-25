// Generated by CoffeeScript 2.3.2
(function() {
  /*
   * mongoDB操作
   * 对mongoDB原生方法进行一层封装，简化mongo数据库的操作
   * 通过数据库链接、所连接集合、连接参数来实例化DB操作对象
   * 一般的实例化对象提供增删改查操作
   */
  var DBHandler, InsertManyOptions, ObjectId, mongoClient;

  mongoClient = require('mongodb').MongoClient;

  InsertManyOptions = require('mongodb').InsertManyOptions;

  ObjectId = require('mongodb').ObjectId;

  DBHandler = class DBHandler {
    constructor(url, collection, DB_OPTS) {
      this.url = url;
      this.collection = collection;
      this.DB_OPTS = DB_OPTS;
      this.database = this.url.substring(this.url.lastIndexOf("/") + 1, this.url.lastIndexOf("?"));
    }

    connect(callback) {
      var cb, e;
      cb = (err, db) => {
        var e;
        if (!db) {
          throw "数据库连接获取失败";
        }
        try {
          return callback(err, db.db(this.database));
        } catch (error) {
          e = error;
          throw `连接数据库${this.database}失败\n${e.stack}`;
        } finally {
          if (db != null) {
            if (typeof db.close === "function") {
              db.close();
            }
          }
        }
      };
      try {
        return mongoClient.connect(this.url, this.DB_OPTS, cb);
      } catch (error) {
        e = error;
        throw e;
      }
    }

    keepConnect(callback) {
      var cb, e;
      cb = (err, db) => {
        var e;
        if (!db) {
          throw "数据库连接获取失败";
        }
        try {
          return callback(err, db.db(this.database));
        } catch (error) {
          e = error;
          throw `连接数据库${this.database}失败\n${e.stack}`;
        }
      };
      try {
        return mongoClient.connect(this.url, this.DB_OPTS, cb);
      } catch (error) {
        e = error;
        throw e;
      }
    }

    insert(docs, callback) {
      return this.connect((err, db) => {
        if (err) {
          throw err;
        }
        if (Array.isArray(docs)) {
          docs.forEach(function(d) {
            return d._id && typeof d._id === "string" && (d._id = ObjectId(d._id));
          });
          return db.collection(this.collection).insert(docs, callback);
        } else if (docs instanceof Object) {
          docs._id && typeof docs._id === "string" && (docs._id = ObjectId(docs._id));
          return db.collection(this.collection).insertOne(docs, callback);
        } else {
          return callback("param Invalid");
        }
      });
    }

    addOrUpdate(docs, callback) {
      var that;
      if (docs instanceof Object || Array.isArray(docs)) {
        that = this;
        return this.keepConnect((err, db) => {
          if (err) {
            throw err;
          }
          if (Array.isArray(docs)) {
            return async.each(docs, function(doc, ccb) {
              doc._id && typeof doc._id === "string" && (doc._id = ObjectId(doc._id));
              return db.collection(that.collection).findOne({
                _id: doc._id
              }, function(err, result) {
                if (result) {
                  return db.collection(that.collection).update({
                    _id: doc._id
                  }, doc, ccb);
                } else {
                  return db.collection(that.collection).insert(doc, ccb);
                }
              });
            }, function(err) {
              if (db != null) {
                if (typeof db.close === "function") {
                  db.close();
                }
              }
              return callback(err);
            });
          } else if (docs instanceof Object) {
            docs._id && typeof docs._id === "string" && (docs._id = ObjectId(docs._id));
            return db.collection(that.collection).findOne({
              _id: docs._id
            }, function(err, result) {
              if (result) {
                return db.collection(that.collection).update({
                  _id: docs._id
                }, docs, function(err) {
                  if (db != null) {
                    if (typeof db.close === "function") {
                      db.close();
                    }
                  }
                  return callback(err);
                });
              } else {
                return db.collection(that.collection).insert(docs, function(err) {
                  if (db != null) {
                    if (typeof db.close === "function") {
                      db.close();
                    }
                  }
                  return callback(err);
                });
              }
            });
          }
        });
      } else {
        return callback(null);
      }
    }

    delete(param, callback) {
      return this.connect((err, db) => {
        if (err) {
          throw err;
        }
        param._id && typeof param._id === "string" && (param._id = ObjectId(param._id));
        return db.collection(this.collection).remove(param, callback);
      });
    }

    update(filter, setter, callback) {
      return this.connect((err, db) => {
        if (err) {
          throw err;
        }
        filter._id && typeof filter._id === "string" && (filter._id = ObjectId(filter._id));
        setter._id && delete setter._id;
        return db.collection(this.collection).update(filter, setter, callback);
      });
    }

    selectOne(param, callback) {
      return this.connect((err, db) => {
        if (err) {
          throw err;
        }
        param._id && typeof param._id === "string" && (param._id = ObjectId(param._id));
        return db.collection(this.collection).findOne(param, callback);
      });
    }

    selectBySortOrLimit(param, sort, limit, callback) {
      return this.connect((err, db) => {
        if (err) {
          throw err;
        }
        param._id && typeof param._id === "string" && (param._id = ObjectId(param._id));
        if (limit === -1) {
          return db.collection(this.collection).find(param).sort(sort).toArray(callback);
        } else {
          return db.collection(this.collection).find(param).sort(sort).limit(limit).toArray(callback);
        }
      });
    }

    selectList(param, callback) {
      return this.connect((err, db) => {
        if (err) {
          throw err;
        }
        param._id && typeof param._id === "string" && (param._id = ObjectId(param._id));
        return db.collection(this.collection).find(param).toArray(callback);
      });
    }

    count(param, callback) {
      return this.connect((err, db) => {
        if (err) {
          throw err;
        }
        param._id && typeof param._id === "string" && (param._id = ObjectId(param._id));
        return db.collection(this.collection).countDocuments(param, callback);
      });
    }

  };

  module.exports = DBHandler;

}).call(this);
