// const Influx = require('influxdb-nodejs');
// const client = new Influx('http://root:root@172.30.0.187:8086/dongsun.com');
// client.query('frpc_run')
//     // .where('SELECT mean("int_value") AS "mean_int_value", mean("quality") AS "mean_quality", mean("value") AS "mean_value" FROM "dongsun.com"."autogen"."frpc_run" WHERE time > :dashboardTime: GROUP BY time(:interval:) FILL(null)')
//     .then(function(err, result){
        // console.log(err, result)
//     })


// // InfluxClient = function(){};
// // InfluxClient.query = function(table, condition, set, callback){
// //     var dblink = 'http://172.30.0.187:8086';
//     console.log('# dblnk' + dblink);
// //     var client = new Influx(dblink);
// //     // client.query(table).there('publish = 1').set({limit: 10}).then(console.info).catch(console.error);
// //     client.query() = function(table, conditon, set, callback){
            
// //     }
// // }


const Influx = require('influxdb-nodejs');
const config = {
    user: 'root',
    password: 'root',
    port: 8086,
    host: '172.30.0.187'
}

InfluxClient = function() {};

InfluxClient.query = function(table, condition, set, callback) {    
    var dblink = 'http://' + config.user + ':' + config.password + '@' + config.host + ':' + config.port + '/' + database;
    // console.log("#     dblink:" + dblink);
    var client = new Influx(dblink);
    // client.query('video').where('publish = 1').set({limit: 10}).then(console.info).catch(console.error);
    client.query(table).where(condition).set(set)
        .then((data) => {
            var sql = client.query(table).where(condition).set(set).toString();
            console.info('##    sql: ' + sql);
            callback(data);
            
        }).catch(console.error);
};

InfluxClient.queryCount = function(database, table, condition, count, callback) {
    var dblink = 'http://' + config.user + ':' + config.password + '@' + config.host + ':' + config.port + '/' + database;
    // console.log("#     dblink:" + dblink);
    var client = new Influx(dblink);
    var reader = client.query(table);
    // console.log(reader)
    reader = reader.where(condition);
    var countArr = count.split(",");
    // console.log(countArr)
    for (var i = 0; i <= countArr.length - 1; i++) {
        // console.log(countArr[i].split('='))
        reader = reader.addFunction(countArr[i].split('=')[1] === 'raw' ? 'mean' : countArr[i].split('=')[1], countArr[i].split('=')[0], {
            alias: countArr[i].split('=')[1],
        });
        // console.log(reader)
        // console.log(reader.toString())
    }
    reader.then((data) => {
        console.info('##    sql: ' + reader.toString());
        callback(data);
    }).catch(console.error);
};

module.exports = InfluxClient;