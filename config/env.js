if (process.env.NODE_ENV === 'development') {
	module.exports = require(`./developmentConfig.js`)
} else {
	module.exports = require(`./productionConfig.js`)
}
