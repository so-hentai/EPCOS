###
#	對分快进行裁剪操作
###
Handler = require "./Handler"
ExecHandler = require "./ExecHandler"
LOG = LoggerUtil.getLogger "CutBillHandler"
class CutBillHandler extends Handler
	handle: (callback)->
		that = @
		unless @data.bills
			LOG.warn "#{argv.project}：没有需要切割的分快"
			return callback null
		@data.fields = []
		exec = new ExecHandler().queue_exec 3
		dao = new MongoDao __b_config.dbInfo, {epcos: ["field"]}
		cut_stat = {total: 0, success: 0, failure: 0, exist: 0}
		async.each @data.bills, (bill, cb)->
			return cb null if bill.state isnt 1 and image.state isnt -2
			bill_path = bill.path
			fields = that.data.deploy.fields.filter (f)-> f.bill is bill.bill_type
			async.each fields, (field, cb1)->
				field_path = bill_path.replace "bill", "field"
				field_path = "#{field_path}/#{field.code}/"
				dbField = {
					field_type: field._id.toString()
					code: field.code
					field_name: bill.bill_name
					path: field_path
					state: 0 #待切图
				}
				that.data.fields.push dbField
				dao.epcos.field.selectOne dbField, (err, doc)->
					return cb1 err if err
					if doc
						cut_stat.exist++
						dbField._id = doc._id
						dbField.state = doc.state
					return cb2 null if doc and doc.state is 1
					doc or dbField.create_at = moment().format "YYYYMMDDHHmmss"
					mkdirp field_path, (err)->
						return cb1 err if err and dbField.state = -1 #切字段失败
						cut_stat.total++
						options = {
							src: "#{bill_path}#{bill.bill_name}"
							dst: "#{field_path}#{bill.bill_name}"
							x0: field.x0
							y0: field.y0
							x1: field.x1
							y1: field.y1
						}
						cut_cmd = "gmic -v - %(src)s -crop[-1] %(x0)s,%(y0)s,%(x1)s,%(y1)s -o[-1] %(dst)s"
						try
							cut_cmd = sprintf.sprintf cut_cmd, options
						catch e
							dbField.state = -1 #切字段失败
							cb1 e
						exec cut_cmd, (err, stdout, stderr, spent) ->
							dbField.state = 1 #切字段完成
							return cb1 err if err and dbField.state = -1 #切字段失败
							stdout = "#{stdout}".trim()
							stderr = "#{stderr}".trim()
							LOG.info stdout if stdout.length > 0
							LOG.info stderr if stderr.length > 0
							LOG.info "#{options.src} => #{options.dst} #{spent}ms"
							cut_stat.success++
							cb1 null
			, (err)->
				bill.state = 2 #字段切图完成
				LOG.error err if err and bill.state = -2 #字段切图失败
				cb null
		,(err)->
			LOG.error JSON.stringify err if err
			cut_stat.failure = cut_stat.total - cut_stat.success - cut_stat.exist
			LOG.info JSON.stringify cut_stat
			callback.apply this, arguments

module.exports = CutBillHandler
