const express = require('express');
const app = express();
const axios = require('axios');
const http = require('../common/http');
<<<<<<< HEAD
// const bodyParser = require('body-parser');
const path = 'http://ioe.thingsroot.com/api/v1';


// app.use(function(req, res, next){
//     if (req.method === 'POST'){
//         let str = '';
//         req.on('data',function(data){
//             str += data
//         })
//         req.on('end', function(){
//             if(str){
//                 str = JSON.parse(str);
//                 req.body = str;
//             }
//             next();
//         })
//     } else {
//         next();
//     }
// })
=======
const path = 'http://ioe.thingsroot.com/api/v1';


>>>>>>> c9ceed7c47641b1277ea86b2b222bfe5c51fbd39
// 封装ajax get方式
function sendGetAjax (url, headers, query){
    let pathname = '';
    if (query){
        let str = '';
        const name = Object.keys(query);
        const querys = Object.values(query);
        name.map((item, key)=>{
            key === 0 ? str += (item + '=' + querys[key]) : str += ('&' + item + '=' + querys[key])
        });
        pathname = path + url + '?' + str;
    } else {
        pathname = path + url;
    }
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

//首页数据
app.get('/home', function (req, respones) {
    sendGetAjax('/applications.list', req.headers, req.query).then(res=>{
        respones.send(res.data)
    })

});
//个人信息   未完成
app.get('/user_read', function (req, respones) {
    console.log(req);
    sendGetAjax('/companies.read', req.headers, req.query).then(res=>{
        console.log(res.data)
        respons.send(res.data)
    })
    // sendGetAjax('/user.read', req.headers).then(res=>{
    //     // respones.send(res.data)
    //
    // })

});

//应用列表   ok
app.get('/applications_list', function(req, respones){
    sendGetAjax('/applications.list', req.headers, req.query).then(res=>{
        respones.send(res.data)
    })
});

//应用详情  ok       name: 应用id
app.get('/applications_read', function(req, respones){
    sendGetAjax('/applications.read', req.headers, req.query).then(res=>{
        respones.send(res.data)
    });
});

//应用描述  ok       name: 应用id
app.get('/applications_desc', function(req, respones){
    sendGetAjax('/applications.read', req.headers, req.query).then(res=>{
        respones.send(res.data.data.description)
    });
});

//应用版本列表  ok     app: 应用id
app.get('/applications_versions_list', function(req, respones){
    sendGetAjax('/applications.versions.list', req.headers, req.query).then(res=>{
        respones.send(res.data)
    })
});

//应用创建新版本         app  version  comment  app_file     未成功  req.query为undefined
app.post('/applications_versions_create', function(req, respones){
    sendPostAjax('/applications.versions.create', req.headers, req.body).then(res=>{
        respones.send(res.data)
    })
});


//应用模板列表(应用模板最新版本)  ok      app: 应用id
app.get('/store_configurations_list', function (req, respones) {
    sendGetAjax('/store.configurations.list', req.headers, req.query).then(res=>{
        let list = [];
        function getLatestVersion(index, item) {
            if (index >= item.length) {
                respones.send({message: list, status: 'ok'});
                return false;
            } else {
                sendGetAjax('/configurations.versions.latest?conf=' + item[index], req.headers).then(res=>{
                    list && list.length > 0 && list.map((v)=>{
                        if (v.name === item[index]) {
                            v['latest_version'] = res.data.data;
                        }
                    });
                    getLatestVersion(index + 1, item, req.headers)
                })
            }
        }
        list = res.data.data;
        let arr = [];
        list && list.length > 0 && list.map((v)=>{
            arr.push(v.name);
        });
        getLatestVersion(0, arr);
    })
});

// {
//     "app_name": "string",     应用名称
//     "code_name": "string",    文件名
//     "has_conf_template": 0,   是否有配置模板
//     "license_type": "Open",   授权类型
//     "star": 0,                评星
//     "description": "string",  描述
//     "conf_template": "string",
//     "pre_configuration": "string",    配置模板
//     "keywords": [
//          "string"
//      ]
// }

//创建新应用   nonono
app.post('/applications_create', function(req, respones){
    sendPostAjax('/applications.create', req.headers, req.body).then(res=>{
        respones.send(res.data)
    })
});

// 平台事件  列表+总数   ok
app.get('/platform_activities_lists', function (req, respones) {
    let data = {};
    axios({
        url: path + '/'+ req.query.category +'.activities.list',
        method: 'GET',
        data: {
            name: req.query.name,
            start: req.query.start,
            limit: req.query.limit,
            filters: JSON.parse(req.query.filters)
        },
        headers: req.headers
    }).then(res=>{
        data['list'] = res.data;
        sendGetAjax('/'+ req.query.category +'.activities.count?name=' + req.query.name, req.headers).then(res=>{
            data['count'] = res.data.data;
            respones.send({data: data, ok: true})
        })
    })
});

//获取消息详情    nonono
app.get('/activities_message_read', function (req, respones) {
    sendGetAjax('/'+ req.query.category +'.activities.read?name=' + req.query.name, req.headers).then(res=>{
        console.log(res.data);
        respones.send(res.data);
    })
});

//确认消息    nonono
// app.post('/activities_disponse', function (req, respones) {
//     console.log(req);
//     // axios({
//     //     url: path + '/'+ req.body.category +'.activities.disponse',
//     //     method: 'POST',
//     //     data: {
//     //         name: req.body.name
//     //     },
//     //     headers: req.headers
//     // }).then(res=>{
//     //     respones.send({data: res.data, ok: true})
//     // })
//     // sendPostAjax('/user.activities.disponse', req.header, {
//     //     name: req.query.name
//     // }).then(res=>{
//     //     console.log(res.data);
//     //     respones.send(res.data)
//     // })
// });

//设备事件列表
app.get('/device_events_list', function (req, respones) {
    let data = {};
    axios({
        url: path + '/'+ req.query.category +'.events.list',
        method: 'GET',
        data: {
            name: req.query.name,
            start: req.query.start,
            limit: req.query.limit,
            filters: JSON.parse(req.query.filters)
        },
        headers: req.headers
    }).then(res=>{
        data['list'] = res.data;
        sendGetAjax('/'+ req.query.category +'.events.count?name=' + req.query.name, req.headers).then(res=>{
            data['count'] = res.data.data;
            respones.send({data: data, ok: true})
        })
    })
});

module.exports = app;

//应用   创建、修改、上传新版本
//消息   列表、查询、详情、确认消息、
//模板   保存
//个人信息  获取、认证旧密码、修改密码
//首页   获取表数据

