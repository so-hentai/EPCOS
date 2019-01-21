global.argv = {project: "EPCOS"}
global.path = require 'path'
global.fs = require 'fs'
global.moment = require "moment"
global.async = require "async"
global._ = require "lodash"
global.sprintf = require "sprintf-js"
global.mkdirp = require "mkdirp"
global.LoggerUtil = LoggerUtil = require './LoggerUtil'
global.Utils = require "./Utils"
global.MongoDao = require "./MongoDao"
global.__b_config = require "../config/base-config.json"
global.workspace = __dirname.replace("\src", "")

express = require "express"
global.app = app = express()

Router = require "./Router"
LOG = LoggerUtil.getLogger "default"
LoggerUtil.useLogger app, LOG  #请求日志

app.listen __b_config.serverInfo.port, __b_config.serverInfo.hostName, ->
	LOG.info "启动成功，服务器运行在http://#{__b_config.serverInfo.hostName}:#{__b_config.serverInfo.port}"
	router = new Router()
	router.router()