const domain = 'http://ioe.thingsroot.com'
module.exports = {
	influxdb: {
		user: 'root',
		password: 'root',
		port: 8086,
		host: '127.0.0.1'
	},
	redis: {
		port: 6379,
		host: '127.0.0.1'
	},
	domain: domain,
	path: domain + '/api/v1/'
}
