require('events').EventEmitter.defaultMaxListeners = 0
const express = require('express');
const app = express();
const bodyParser = require('body-parser')
const server = require('./server');
const store = require('./store');
const companies = require('./companies');
const gateways = require('./gateway');
const applications = require('./applications');
const user = require('./user')
const developer = require('./developer')
const port = 8881;
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
const getIp = function(req) {
    let ip = req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || req.connection.remoteAddres || req.socket.remoteAddress || '';
    if(ip.split(',').length>0){
        ip = ip.split(',')[0];
    }
    return ip;
}
app.use(function(req, res, next) {
    const ip = getIp(req)
    req.headers['x-forwarded-for'] = ip;
    req.headers['x-forwarded-host'] = req.hostname;
    req.headers['X-Forwarded-Proto'] = req.protocol;
    next()
})
app.use(server);
app.use(store)
app.use(companies)
app.use(gateways)
app.use(applications)
app.use(user)
app.use(developer)

app.listen(port, '0.0.0.0', function(){
    console.log('this port is ' + port + '....')
})