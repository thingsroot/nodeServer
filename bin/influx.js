const Influx = require('influxdb-nodejs');
const config = {
    user: 'root',
    password: 'root',
    port: 8086,
    host: '172.30.0.187'
}

InfluxClient = function() {};

InfluxClient.getClient = function(database) {
    var dblink = 'http://' + config.user + ':' + config.password + '@' + config.host + ':' + config.port + '/' + database;
    var client = new Influx(dblink);
	return client;
}

InfluxClient.query = function(database, table, condition, set, callback, time) {
    var dblink = 'http://' + config.user + ':' + config.password + '@' + config.host + ':' + config.port + '/' + database;
    var client = new Influx(dblink);
    client.setMaxListeners(10)
    client.query(table).where(condition).addGroup(time).addFunction(set).set(set)
        .then((data) => {
            var sql = client.query(table).where(condition).addGroup(time).addFunction(set).set(set).toString();
            callback(data);
        }).catch(console.error);
};

InfluxClient.queryCount = function(database, table, condition, count, callback, time) {
    var dblink = 'http://' + config.user + ':' + config.password + '@' + config.host + ':' + config.port + '/' + database;
    var client = new Influx(dblink);
    var reader = client.query(table);
    reader = reader.where(condition);
    var countArr = count.split(",");
    for (var i = 0; i <= countArr.length - 1; i++) {
        reader = reader.addFunction(countArr[i].split('=')[1] === 'raw' ? '' : countArr[i].split('=')[1], countArr[i].split('=')[0], {
            alias: countArr[i].split('=')[1] === 'raw' ? '' : countArr[i].split('=')[1] + '_value',
        })
    }
    reader.then((data) => {
        callback(data);
    }).catch(console.error);
};

module.exports = InfluxClient;
