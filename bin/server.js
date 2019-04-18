const express = require('express');
const app = express();
const axios = require('axios');
const http = require('../common/http');
const path = 'http://ioe.thingsroot.com/api/v1';
const block = {
    display: 'block'
};
const none = {
    display: 'none'
};

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

//个人信息   ok
app.get('/user_read', function (req, response) {
    console.log(req.query);
    sendGetAjax('/user.read', req.headers, req.query).then(res=>{
        console.log(res.data);
        response.send(res.data)
    })
});

//应用列表   ok
app.get('/applications_list', function(req, response){
    sendGetAjax('/applications.list', req.headers, req.query).then(res=>{
        response.send(res.data)
    })
});

//应用详情  okokok     app: 应用id
app.get('/applications_read', function(req, response){
    sendGetAjax('/store.configurations.list', req.headers, req.query).then(res=>{
        let obj = {};
        let list = [];
        function getLatestVersion(index, item) {
            if (index >= item.length) {
                obj['tempList'] = list;
                axios.all(
                    [
                        http.get(path + '/applications.read?name=' + req.query.app, {headers: req.headers}),
                        http.get(path + '/applications.versions.list?app=' + req.query.app, {headers: req.headers}),
                        http.get(path + '/applications.versions.latest?app=' + req.query.app + '&beta=1', {headers: req.headers})
                    ]
                ).then(axios.spread(function (details, versionList, versionLatest) {
                    obj['data'] = details.data;
                    obj['versionList'] = versionList.data;
                    obj['versionLatest'] = versionLatest.data;
                    response.send({data: obj, ok: true});
                }));
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
app.post('/applications_create', function(req, response){
    sendPostAjax('/applications.create', req.headers, req.body).then(res=>{
        response.send(res.data)
    })
});

// 平台事件  列表+总数   okokok
app.get('/platform_activities_lists', function (req, response) {
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
            response.send({data: data, ok: true})
        })
    })
});

//设备事件列表   okokok
app.get('/device_events_list', function (req, response) {
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
            response.send({data: data, ok: true})
        })
    })
});

//获取模板版本列表    okokok
app.get('/configurations_versions_list', function (req, response) {
    sendGetAjax('/configurations.versions.list', req.headers, req.query).then(res=>{
        response.send(res.data);
    }).catch(err=>{
        console.log('err')
    })
});



///post
//修改密码   小崔
app.post('/user_update_password', function (req, response) {
    console.log(req.body);
    sendPostAjax('/user.update_password', req.headers, req.body).then(res=>{
        console.log(res.data);
        response.send(res.data)
    })
});

//平台事件确认消息   okokok
app.post('/activities_dispose', function(req, respones){
    sendPostAjax('/'+ req.body.category +'.activities.dispose', req.headers, {
        activities: req.body.activities,
        disposed: req.body.disposed
    }).then(res=>{
        respones.send(res.data);
        console.log(req.body)
    }).catch(err=>{
        respones.send({message: 'err', ok: false})
    })
});
//设备事件确认消息 okokok
app.post('/events_dispose', function(req, respones){
    sendPostAjax('/'+ req.body.category +'.events.dispose', req.headers, {
        events: req.body.events,
        disposed: req.body.disposed
    }).then(res=>{
        respones.send(res.data);
    }).catch(err=>{
        respones.send({message: 'err', ok: false})
    })
});

//创建模板新版本  okokok
app.post('/configurations_versions_create', function (req, response) {
    console.log(req.body);
    sendPostAjax('/configurations.versions.create', req.headers, req.body)
        .then(res=>{
            response.send(res.data)
        })
});

//应用创建新版本         app  version  comment  app_file     未成功  req.query为undefined
app.post('/applications_versions_create', function(req, response){
    console.log(req.body);
    sendPostAjax('/applications.versions.create', req.headers, JSON.stringify(req.body)).then(res=>{
        response.send(res.data)
    }).catch(err=>{
        console.log('err')
    })
});


module.exports = app;

//应用   创建、修改、上传新版本
//消息   列表、查询、详情、确认消息、
//模板   保存
//个人信息  获取、认证旧密码、修改密码
//首页   获取表数据

