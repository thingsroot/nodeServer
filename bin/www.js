const express = require('express');
const app = express();
const axios = require('axios');
const http = require('../common/http');
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
// 粘贴post
// app.post('/', function(req, respones){
//     sendPostAjax('/', req.headers, req.query).then(res=>{
//         respones.send(res.data)
//     })
// })
// 粘贴get
// app.get('/', function(req,respones){
//     sendGetAjax('/', req.headers, req.query).then(res=>{
//         respones.send(res.data)
//     })
// })

app.get('/', function (req, res) {
    res.send('Hello World');
})


// 转接login 未作处理
app.post('/user_login', function(req, respons){
     sendPostAjax('/user.login', req.headers, req.body).then(res=>{
        const data = {
            data: res.data,
            status: res.status,
            statusText: res.statusText,
            headers: res.headers
        }
        respons.send(data)
     }).catch(err=>{
         respons.send(err)
     })
})
// 注册账户 未作处理
app.post('/user_create', function(req, respons){
    sendPostAjax('/user.create', req.headers, req.query).then(res=>{
        respons.send(res.data)
    }).catch(err=>{
        respons.send(err)
    })
})
// 忘记密码 未做处理
app.post('/user_reset_password', function(req, respons){
    sendPostAjax('/user.reset_password', req.headers, req.query).then(res=>{
        respons.send(res.data)
    }).catch(err=>{
        respons.send(err)
    })
})
// 获取csrf-token 未作处理
app.get('/token', function(req, respons){
    sendGetAjax('/user.csrf_token', req.headers).then(res=>{
        respons.send(res.data)
        console.log(res)
    }).catch(err=>{
        respons.send(err)
    })
})

app.get('/applist', function(req, respons){
    console.log(req)
    respons.send('asdasd')
})

// 获取网关列表 结合两条接口
app.get('/gateways_list', function(req, respons){
    console.log(req)
    const arr = [];
    function getGatewaysList (index, item, headers){
        if (index >= item.length){
            console.log(arr)
            respons.send({message: arr, status: 'OK'})
        }
        axios.all([http.get(path + '/gateways.read?name=' + item[index], {headers: req.headers}), http.get(path + '/gateways.applications.list?gateway=' + item[index], {headers: req.headers})],{
            headers
        }).then(axios.spread(function (acct, perms) {
            arr.push({data:acct.data.data, app: perms.data})
            if(index < item.length){
                getGatewaysList(index + 1, item, req.headers)
            }
        }));
        // axios({
        //     url: path + '/gateways.read?name=' + item[index],
        //     headers,
        //     method: 'GET'
        // }).then(res=>{
        //     axios({
        //         url: path + '/gateways.applications.list?gateway=' + item[index],
        //         headers,
        //         method: 'get'
        //     }).then(data=>{
        //         arr.push({data: res.data.data, applist})
        //     })
        //     if(index < item.length){
        //         getGatewaysList(index + 1, item, headers)
        //     }
        // })
    }
    axios({
        url: path + '/gateways.list',
        method: 'GET',
        headers: req.headers
    }).then(res=>{
        console.log(res)
        const data = res.data.data.company_devices[0].devices.concat(res.data.data.private_devices)
        // sendGetAjax(path + '/gateways.applications.list').then(data=>{
        //     console.log(data)
        // })
        getGatewaysList(0, data, req.headers)
    }).catch(err=>{
        respons.send(err)
    })
})

// 删除网关  未作处理  未测试
app.post('/gateways_remove', function(req, respons){
    sendPostAjax('/gateways.remove', req.headers, req.query).then(res=>{
        respons.send(res.data)
    }).catch(err=>{
        respons.send(err)
    })
})
//获取APP列表 未作处理 未测试
app.get('/gateways_applications_list', function(req, respons){
    sendGetAjax('/gateways.applications.list', req.headers, req.query).then(res=>{
        respons.send(res.data)
    }).catch(err=>{
        respons.send(err)
    })
})
// 安装APP 未作处理 未测试
app.post('/gateways_applications_install', function(){
    sendPostAjax('/gateways.applications.install', req.headers, req.query).then(res=>{
        respons.send(res.data)
    }).catch(err=>{
        respons.send(err)
    })
})
// 删除APP 未做处理 未测试
app.post('/gateways_applications_remove', function(req, respones){
    sendPostAjax('/gateways.applications.remove', req.headers, req.query).then(res=>{
        respones.send(res.data)
    }).catch(err=>{
        respons.send(err)
    })
})
// 网关信息查询 未做处理 未测试
app.post('/gateways_info', function(req, respones){
    sendPostAjax('/gateways.info', req.headers, req.query).then(res=>{
        respones.send(res.data)
    }).catch(err=>{
        respons.send(err)
    })
})

app.post('/gateways.remove', function(req, respones){
    sendPostAjax('/gateways.remove', req.headers, req.query).then(res=>{
        console.log(req.query)
        console.log(req)
        respones.send(res.data)
    }).catch(err=>{
        respons.send(err)
    })
})




app.listen(8881, function(){
    console.log('this port is 8881....')
})    