var redis = require('redis');

var client = redis.createClient(6380, '172.30.0.187')

client.getStatus = (sn)=>{
    client.select(12)
    // client.on('connect', function(){
    //     console.log(client.exists(sn))
    // })
    return new Promise((resolve, reject)=>{
        let obj = {};
        let newObj = {};
        client.hgetall(sn, function(err, result){
            if (err){
                reject(newObj)
            }
                obj = Object(result);
                //console.log(obj['comm_upload/value'])
                for (key in obj){
                    const value = JSON.parse(obj[key])
                    const keys = key.split('/')[0];
                    newObj[keys] = value[1];
                }
                newObj['cpu'] = "imx6ull 528MHz"
                newObj['ram'] = "256 MB"
                newObj['rom'] = "4 GB"
                newObj['os'] = "openwrt"
                resolve(newObj)
        })
    })
    // client.on('ready',function(err){
    //     console.log('ready');
    // });
    // return obj;
}
client.getDevLen = (sn)=>{
    // console.log(sn)
    client.select(11);
    return new Promise((resolve, reject)=>{
        let length = 0;
        client.hgetall(sn, function(err, result){
            if (err){
                reject(err)
            }
            // length = JSON.parse(result).length;
            // console.log(result)
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
            // console.log(JSON.parse(result))
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