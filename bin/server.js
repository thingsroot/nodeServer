const express = require('express');
const app = express();
const axios = require('axios');
const http = require('./common/http');
const bodyParser = require('body-parser');
const path = 'http://ioe.thingsroot.com/api/v1';

// app.use(bodyParser.urlencoded({ extended: false }))
 

// app.use(bodyParser.json())
app.use(function(req, res, next){
    if (req.method === 'POST'){
        let str = '';
        req.on('data',function(data){
            str += data
        })
        req.on('end', function(){
            str = JSON.parse(str);
            req.body = str;
            next();
        })
    } else {
        next();
    }
})
// 封装ajax get方式
function sendGetAjax (url, headers, query){
    const pathname = query ? path + url + query : path + url;
    return new Promise((resolve, reject)=>{
        http.get(pathname, {
            headers
        }).then(res=>{
            resolve(res)
        }).catch(err=>{
            reject(err)
        })
    })
}
// 封装ajax post方式
function sendPostAjax (url, headers, query){
    return new Promise((resolve, reject)=>{
        http.post(path + url,{
            headers: headers,
            data: query
        }).then(res=>{
            resolve(res)
        }).catch(err=>{
            reject(err)
        })
    })
}

//
app.get('/applist', function(req, respons){
    respons.send('asdasd')
})

app.post('/applications_remove:name', function(req, respons){
    console.log(req)
    // respons.send('asdasd')
    sendPostAjax('/applications.remove', req.headers, req.body).then(res=>{
        respons.send(res.data);
    }).catch(err=>{
        respons.send(err)
    })
})

module.exports = app;