const Influx = require('influxdb-nodejs');
const client = new Influx('http://root:root@172.30.0.187:8086/chronograf');
client.query('')
    .where('SELECT mean("int_value") AS "mean_int_value", mean("quality") AS "mean_quality", mean("value") AS "mean_value" FROM "dongsun.com"."autogen"."frpc_run" WHERE time > :dashboardTime: GROUP BY time(:interval:) FILL(null)')
    .then(console.info)


// InfluxClient = function(){};
// InfluxClient.query = function(table, condition, set, callback){
//     var dblink = 'http://172.30.0.187:8086';
//     console.log('# dblnk' + dblink);
//     var client = new Influx(dblink);
//     // client.query(table).there('publish = 1').set({limit: 10}).then(console.info).catch(console.error);
//     client.query() = function(table, conditon, set, callback){
            
//     }
// }