// Generated by CoffeeScript 2.3.2
(function() {
  var DBHandler, mongoClient;

  mongoClient = require('mongodb').MongoClient;

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
          throw `连接数据库${this.database}获取失败\n${e.stack}`;
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
      var e;
      try {
        this.connect((err, db) => {});
        if (err) {
          throw err;
        }
        return db.collection(this.collection).insert(docs, callback);
      } catch (error) {
        e = error;
        return callback(e);
      }
    }

    delete(param, callback) {
      var e;
      try {
        return this.connect((err, db) => {
          if (err) {
            throw err;
          }
          return db.collection(this.collection).remove(param, callback);
        });
      } catch (error) {
        e = error;
        return callback(e);
      }
    }

    update(filter, setter, callback) {
      var e;
      try {
        return this.connect((err, db) => {
          if (err) {
            throw err;
          }
          return db.collection(this.collection).update(filter, setter, callback);
        });
      } catch (error) {
        e = error;
        return callback(e);
      }
    }

    selectOne(param, callback) {
      var e;
      try {
        return this.connect((err, db) => {
          if (err) {
            throw err;
          }
          return db.collection(this.collection).findOne(param, callback);
        });
      } catch (error) {
        e = error;
        return callback(e);
      }
    }

    selectList(param, callback) {
      var e;
      try {
        return this.connect((err, db) => {
          if (err) {
            throw err;
          }
          return db.collection(this.collection).find(param).toArray(callback);
        });
      } catch (error) {
        e = error;
        return callback(e);
      }
    }

    count(param, callback) {
      var e;
      try {
        return this.connect((err, db) => {
          if (err) {
            throw err;
          }
          return db.collection(this.collection).countDocuments(param, callback);
        });
      } catch (error) {
        e = error;
        return callback(e);
      }
    }

  };

  module.exports = DBHandler;

}).call(this);
