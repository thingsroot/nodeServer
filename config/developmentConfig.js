const domain = 'http://ioe.thingsroot.com'
module.exports = {
	influxdb: {
		// user: 'root',
		password: 'root',
		port: 8086,
		host: '172.30.0.187'
		// host: '127.0.0.1'
	},
	redis: {
		port: 6380,
		host: '172.30.0.187'
		// port: 6380,
		// host: '127.0.0.1'
	},
	domain: domain,
	path: domain + '/api/v1/'
}
