const express = require('express');
const app = express();
const axios = require('axios');
const http = require('../common/http');
const path = 'http://ioe.thingsroot.com/api/v1';

var proxy_middle = require('http-proxy-middleware');//引入nodejs的反向代理模块
var options = {
    target: 'http://ioe.thingsroot.com/api/v1/applications.versions.create', // target host
    changeOrigin: true,               // needed for virtual hosted sites
};
var option = {
    target: 'http://ioe.thingsroot.com/api/v1/applications.icon', // target host
    changeOrigin: true,               // needed for virtual hosted sites
};
var exampleProxy = proxy_middle('/applications_versions_create', options);
var example = proxy_middle('/applications_icon', option);
app.use(exampleProxy);
app.use(example);
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
    sendGetAjax('/user.read', req.headers, req.query).then(res=>{
        response.send(res.data)
    })
});

app.get('/user_groups_list', function (req, response) {
    sendGetAjax('/user.groups.list', req.headers).then(res=>{
    // console.log(req.query);
        response.send(res.data)
    })
});

//应用列表   ok
app.get('/applications_list', function(req, response){
    sendGetAjax('/applications.list', req.headers, req.query).then(res=>{
        response.send(res.data)
    })
});

// 应用详情  okokok     app: 应用id  user:  用户id
app.get('/applications_read', function(req, response){
    sendGetAjax('/store.configurations.list', req.headers, req.query).then(res=>{
        let obj = {};
        let list = [];
        function getLatestVersion(index, item) {
            if (index >= item.length) {
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

app.get('/application_configurations_list',function (req, response) {
    sendGetAjax('/store.configurations.list', req.headers, req.query).then(res=>{
        let list = [];
        function getLatestVersion(index, item) {
            if (index >= item.length) {
                response.send({data: list, ok: true});
                return false;
            } else {
                sendGetAjax('/configurations.versions.latest?conf=' + item[index], req.headers).then(res=>{
                    list && list.length > 0 && list.map((v)=>{
                        if (v.name === item[index]) {
                            v['templateList'] = res.data.data;
                        }
                    });
                    getLatestVersion(index + 1, item, req.headers)
                })
            }
        }
        list = res.data.data;
        console.log(res.data);
        let arr = [];
        list && list.length > 0 && list.map((v)=>{
            arr.push(v.name);
        });
        getLatestVersion(0, arr);
    })
});

app.get('/applications_versions_latest', function (req, response) {
    sendGetAjax('/applications.versions.latest', req.headers, req.query).then(res=>{
        response.send(res.data);
    }).catch(err=>{
        response.send(errMessage)
    })
});

//刷新应用版本列表
app.get('/versions_list', function (req, response) {
    sendGetAjax('/applications.versions.list', req.headers, req.query).then(res=>{
        response.send(res.data);
    })
});

//单个APP详情
app.get('/applications_details', function (req, response) {
    sendGetAjax('/applications.read', req.headers, req.query).then(res=>{
        response.send(res.data)
    })
});

//我的应用下对应的模板列表   okokok
app.get('/user_configuration_list', function(req, response){
    sendGetAjax('/configurations.list?conf_type=Configuration', req.headers).then(res=>{
        let obj = [];
        let list = [];
        let app = req.query.app;
        function getLatestVersion(index, item) {
            if (index >= item.length) {
                obj = list;
                response.send({message: list, ok: true})
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
        let data = res.data.data;
        data && data.length > 0 && data.map((v)=>{
            if (v.app === app) {
               list.push(v)
            }
        });
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
//     "description": "string",  描述
//     "conf_template": "string",
//     "pre_configuration": "string",    配置模板
// }

//创建新应用   okokok
app.post('/applications_create', function(req, response){
    sendPostAjax('/applications.create', req.headers, req.body).then(res=>{
        response.send(res.data)
    })
});

//更新图标
// app.post('/applications_icon', function (req, response) {
//     console.log(req.body);
//     axios({
//         url: path + '/applications.icon',
//         method: 'POST',
//         data: req.body,
//         headers: req.headers
//     }).then(res=>{
//         console.log(res.data);
//         response.send(res.data)
//     })
// });

//修改应用
app.post('/applications_update', function(req, response){
    sendPostAjax('/applications.update', req.headers, req.body).then(res=>{
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

//获取模板版本列表    okokok   conf:  模板id
app.get('/configurations_versions_list', function (req, response) {
    sendGetAjax('/configurations.versions.list', req.headers, req.query).then(res=>{
        response.send(res.data);
    }).catch(err=>{
        // console.log('err')
    })
});

//获取某个模板指定版本下的数据    conf: 模板id   version： 指定版本号
app.get('/configurations_version_read', function (req, response) {
    sendGetAjax('/configurations.versions.list?conf=' + req.query.conf, req.headers).then(res=>{
        let list = res.data.data;
        let data = [];
        list && list.length > 0 && list.map((v)=>{
            if (v.version.toString() === req.query.version) {
                data.push(v)
            }
        });
        response.send({message: data, ok: true})
    }).catch(err=>{
        // console.log('err')
    })
});

///post
//修改密码   小崔
app.post('/user_update_password', function (req, response) {
    sendPostAjax('/user.update_password', req.headers, req.body).then(res=>{
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
    sendPostAjax('/configurations.versions.create', req.headers, req.body)
        .then(res=>{
            response.send(res.data)
        })
});

//创建应用配置     ok
// {
//     "app": "string",   应用id
//     "conf_name": "string",   模板名称
//     "description": "string",   描述
//     "type": "Configuration",   类型
//     "public": 0,     是否公开  0不公开  1公开
//     "owner_type": "User",
//     "owner_id": "string"
// }
app.post('/configurations_create', function(req, response){
    sendPostAjax('/configurations.create', req.headers, req.body).then(res=>{
        response.send(res.data)
    }).catch(err=>{
        // console.log('err')
    })
});

//删除模板   okokok
app.post('/configurations_remove', function(req, respones){
    sendPostAjax('/configurations.remove', req.headers, req.body).then(res=>{
        respones.send(res.data)
    }).catch(err=>{
        respones.send(errMessage)
    })
});

//读取模板信息
app.get('/configurations_read', function (req, response) {
    sendGetAjax('/configurations.read', req.headers, req.query).then(res=>{
        response.send(res.data)
    }).catch(err=>{
        response.send('err')
    })
});

//查询是否是开发者
app.get('/developers_read', function (req, response) {
    sendGetAjax('/developers.read', req.headers, req.query).then(res=>{
        response.send(res.data)
    }).catch(err=>{
        response.send('err')
    })
});



module.exports = app;

//应用   创建、修改、上传新版本
//消息   列表、查询、详情、确认消息、
//模板   保存
//个人信息  获取、认证旧密码、修改密码
//首页   获取表数据

