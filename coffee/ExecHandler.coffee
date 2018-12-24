exec = require("child_process").exec
LOG = LoggerUtil.getLogger "ExecHandler"
class ExecHandler
  opts: {
    encoding: "binary"
    maxBuffer: 1024 * 1024 * 8 # 8M buffer
  }
  create_queue: (n) ->
    that = @
    async.queue (task, next) ->
      check_timer = setTimeout ->
        child.kill "SIGHUP"
      , task.timeout
      LOG.info task.cmd
      start_at = Date.now()
      child = exec task.cmd, that.opts, (error, stdout = "", stderr = "") ->
        clearTimeout check_timer
        stderr = stderr.trim()
        LOG.info "錯誤: #{task.cmd} #{error}\n#{stderr}" if error
        spent = Date.now() - start_at
        try
          task.callback error, stdout, stderr, spent
        catch e
          LOG.info e.stack
        process.nextTick next
    , n
  ###
  # 創建一個 n 併發的執行隊列
  ###
  queue_exec: (n = 1) ->
    exec_queue = @create_queue n
    (cmd, callback, opts = {}) ->
      task = {
        cmd
        callback
        timeout: 12000
      }
      _.assign task, opts
      if opts?.prior
        exec_queue.unshift task
      else
        exec_queue.push task

module.exports = ExecHandler
