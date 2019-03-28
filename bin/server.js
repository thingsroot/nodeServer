const express = require('express');
const app = express();
const axios = require('axios');
const http = require('../common/http');
const bodyParser = require('body-parser');
const path = 'http://ioe.thingsroot.com/api/v1';

// app.use(bodyParser.json({limit: '1mb'}));
// app.use(bodyParser.urlencoded({ extended: true }))

app.use(function(req, res, next){
    if (req.method === 'POST'){
        let str = '';
        req.on('data',function(data){
            str += data
        })
        req.on('end', function(){
            if(str){
                str = JSON.parse(str);
                req.body = str;
            }
            next();
        })
    } else {
        next();
    }
})
// 封装ajax get方式
function sendGetAjax (url, headers, query){
    let pathname = '';


    if (query){
        let str = '';
        const name = Object.keys(query);
        const querys = Object.values(query);
        name.map((item, key)=>{
            key === 0 ? str += (item + '=' + querys[key]) : str += ('&' + item + '=' + querys[key])

        })
        pathname = path + url + '?' + str;
    } else {
        pathname = path + url;
    }

    console.log(pathname)
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

//应用列表   ok
app.get('/applications_list', function(req, respons){
    axios({
        url: path + '/applications.list',
        method: 'GET',
        headers: req.headers
    }).then(res=>{
        respons.send({message: res.data, status: 'ok'})
    }).catch(err=>{
        respons.send(err)
    })
});

//应用详情（版本列表+模板列表）
app.get('/applications_read', function(req, respons){
    var message = {};
    sendGetAjax('/applications.read', req.headers, req.query).then(res=>{
        respons.send(res.data.data)
    })
    // axios.all([http.get(path + '/applications.read?name=' + item[index], {headers: req.headers}), http.get(path + '/gateways.applications.list?gateway=' + item[index], {headers: req.headers}), http.get( path + '/gateways.devices.list?gateway=' + item[index], {headers:req.headers})],{
    //     headers
    // }).then(axios.spread(function (acct, perms, devices) {
    //     console.log(devices)
    //     arr.push({data:acct.data.data, app: perms.data, devices: devices.data})
    //     if(index < item.length){
    //         getGatewaysList(index + 1, item, req.headers)
    //     }
    // }));
    // axios({
    //     url: path + '/applications.read',
    //     method: 'GET',
    //     headers: req.headers
    // }).then(res=>{
    //     console.log()
    //     respons.send(res.data)
    // }).catch(err=>{
    //     respons.send(err)
    // })
});


module.exports = app;

