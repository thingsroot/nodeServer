var redis = require('redis');

var client = redis.createClient(6380, '172.30.0.187')
 client.on('ready', function(res){
     console.log(res)
 })
 client.on('connect', function(err){
    //  console.log(err)
    //  client.get('database12', redis.print);
     console.log('connect')
 })