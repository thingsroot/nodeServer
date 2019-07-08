var redis = require('redis');
const config = require('../config/env');

/*
const config = {
	port: 6380,
	host: '172.30.0.187'
}
*/
const conf = config.redis;
console.log('redis conf:', conf);

var client = redis.createClient(conf.port, conf.host)

 
client.on("error", function (err) {
    client.quit()
    client = redis.createClient(conf.port, conf.host);
});

client.getGatewayStatus = (sn)=>{
    let obj = {};
    client.select(9)
    return new Promise ((resolve, reject)=>{
        client.get(sn, function(err, result){
            if(err){
                reject('')
            }
            resolve(result)
        })
    })
}
client.getStatus = (sn)=>{
    client.select(12)
    return new Promise((resolve, reject)=>{
        let obj = {};
        let newObj = {};
        client.hgetall(sn, function(err, result){
            if (err){
                reject(newObj)
            }
                obj = Object(result);
                for (key in obj){
                    const value = JSON.parse(obj[key])
                    const keys = key.split('/')[0];
                    newObj[keys] = value[1];
                }
                resolve(newObj)
        })
    })
}
client.getAppLen = (sn)=>{
    client.select(6);
    return new Promise((resolve, reject)=>{
        let length = 0;
        client.get(sn,  function(err, result){
            if (err){
                reject(err)
            }
            if (result) {
                resolve(Object.keys(JSON.parse(result)).length)
            } else {
                resolve(0)
            }
        })
    })
}
client.getDevLen = (sn)=>{
    // console.log(sn)
    client.select(11);
    return new Promise((resolve, reject)=>{
        let length = 0;
        client.LLEN(sn, function(err, result){
            if (err){
                reject(err)
            }
            resolve(result)
        })
    })
}
client.getNetManager = (sn)=>{
    client.select(6);
    return new Promise((resolve, reject)=>{
        client.get(sn, function(err, result){
            if (err){
                reject(err)
            }
            resolve(JSON.parse(result))
        })
    })
}
client.getMeta = (sn)=>{
    client.select(10);
    return new Promise((resolve, reject)=>{
        client.get(sn, function(err, result){
            if (err){
                reject(err)
            }
        })
    })
}
client.getInfluxDB = (sn)=>{
    client.select(8);
    return new Promise((resolve, reject)=>{
        client.get(sn, function(err, result){
            if (err){
                reject(err)
            }
            resolve(result)
        })
    })
}
module.exports = client;
