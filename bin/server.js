const express = require('express');
const app = express();
const axios = require('axios');
const http = require('../common/http');
const bodyParser = require('body-parser');
const path = 'http://ioe.thingsroot.com/api/v1';

app.use(bodyParser.json({limit: '1mb'}));
app.use(bodyParser.urlencoded({ extended: true }))
 

// app.use(bodyParser.json())
// app.use(function(req, res, next){
//     if (req.method === 'POST'){
//             let str = '';
//             req.on('data',function(data){
//
//                 str += data
//                 console.log(data)
//         })
//         req.on('end', function(){
//             str = JSON.parse(str);
//             req.body = str;
//             next();
//         })
//     } else {
//         next();
//     }
// })
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
app.get('/', function (req, res) {
    console.log(123)
    res.send('Hello World8881');
})

// 转接login   ok
app.post('/user_login', function(req, respons){
    sendPostAjax('/user.login', req.headers, req.body).then(res=>{
        const data = {
            data: res.data,
            status: res.status,
            statusText: res.statusText
        }
        console.log(res)
        respons.send(data)
    }).catch(err=>{
        respons.send(err)
    })
})

app.get('/applications_list', function(req, respons){
    sendGetAjax('/applications.list', req.header, req.query).then(res=>{
        // const data = {
        //     data: res.data,
        //     status: res.status,
        //     statusText: res.statusText
        // }
        console.log(res);
        respons.send(data)
    }).catch(err=>{
        respons.send(err)
    })
})

//应用列表   返回{}
app.get('/applications_list', function(req, respons){
    sendGetAjax('/applications.list', req.header, req.query).then(res=>{
        // const data = {
        //     data: res.data,
        //     status: res.status,
        //     statusText: res.statusText
        // }
        // console.log(res);
        respons.send('123123')
    }).catch(err=>{
        respons.send(err)
    })

})

app.post('/user_create', function(req, respons){
    sendPostAjax('/user.create', req.headers, req.body).then(res=>{
        const data = {
            data: res.data,
            status: res.status,
            statusText: res.statusText
        }
        respons.send(res)
    }).catch(err=>{
        respons.send(err)
    })
})



app.post('/applications_remove', function(req, respons){
    sendPostAjax('/applications.remove', req.headers, req.body).then(res=>{
        console.log(res)
        const data = {
            data: res.data,
            status: res.status,
            statusText: res.statusText
        }
        respons.send(data)
    }).catch(err=>{
        respons.send(err)
    })
})


app.listen(8881, function(){
    console.log('this port is 8881....')
})