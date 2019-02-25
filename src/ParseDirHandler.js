// Generated by CoffeeScript 2.3.2
(function() {
  var Handler, LOG, ParseDirHandler;

  Handler = require("./Handler");

  LOG = LoggerUtil.getLogger("ParseDirHandler");

  ParseDirHandler = class ParseDirHandler extends Handler {
    handle(callback) {
      var i, image, len, lines, ref;
      if (!this.data.deploy.images) {
        LOG.warn(`${argv.project}：没有进行图片配置`);
        return callback(null);
      }
      this.data.images = [];
      ref = this.data.deploy.images;
      for (i = 0, len = ref.length; i < len; i++) {
        image = ref[i];
        lines = image.lines ? image.lines : [];
        if ("string" === typeof lines) {
          lines = lines.split(/[\r\n]+/);
        }
        LOG.info(`${image.d_url}目录解析: ${lines.length} 行`);
        // 反向排序，一般 ftp 返回结果，旧文档在后面
        lines.reverse();
        lines.forEach((line) => {
          var arr;
          line = line.trim();
          arr = /(\S+)\s+(\S+\s+\S+\s+\S+)\s+(\S+)$/.exec(line);
          if (!(arr != null ? arr[3] : void 0)) {
            return;
          }
          return this.data.images.push({
            _id: Utils.uuid(24, 16),
            deploy_id: image._id.toString(),
            type: "image",
            code: image.code,
            img_name: arr[3],
            d_url: image.d_url,
            s_url: image.s_url,
            size: parseInt(arr[1]),
            state: 0,
            upload_at: moment(arr[2], "MMM D HH:mm").format("YYYYMMDDHHmmss")
          });
        });
      }
      return callback();
    }

  };

  module.exports = ParseDirHandler;

}).call(this);
