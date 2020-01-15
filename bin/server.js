const express = require('express');
const app = express.Router();
const axios = require('axios');
const {sendGetAjax, sendPostAjax, path, errMessage} = require('../common/sendAjax');
const proxy_middle = require('http-proxy-middleware');//引入nodejs的反向代理模块
const options = {
    target: 'http://ioe.thingsroot.com/api/v1/applications.versions.create', // target host
    changeOrigin: true,               // needed for virtual hosted sites
};
const option = {
    target: 'http://ioe.thingsroot.com/api/v1/applications.icon', // target host
    changeOrigin: true,               // needed for virtual hosted sites
};
const exampleProxy = proxy_middle('/applications_versions_create', options);
const example = proxy_middle('/applications_icon', option);
app.use(exampleProxy);
app.use(example);

//刷新应用版本列表
app.get('/versions_list', function (req, response) {
    sendGetAjax('/applications.versions.list', req.headers, req.query).then(res=>{
		response.setHeader('set-cookie', res.headers['set-cookie'])
        response.send(res.data);
    }).catch(()=>{
        response.send(errMessage)
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
		if (res.data.ok) {
			data['list'] = res.data.data;
		} else {
			data['list'] = []
		}
		let query = {
			name: req.query.name,
            filters: JSON.parse(req.query.filters)
		}
		axios({
			url: path + '/'+ req.query.category +'.activities.count',
			method: 'GET',
			data: query, 
			headers: req.headers
		}).then(res=>{
			response.setHeader('set-cookie', res.headers['set-cookie'])
            data['count'] = res.data.data;
            response.send({data: data, ok: true})
		}).catch( (err) => {
            response.send(errMessage)
		})
    }).catch((err)=>{
        response.send(errMessage)
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
		if (res.data.ok) {
			data['list'] = res.data.data;
		} else {
			data['list'] = []
		}
		let query = {
			name: req.query.name,
            filters: JSON.parse(req.query.filters)
		}
		axios({
			url: path + '/'+ req.query.category +'.events.count',
			method: 'GET',
			data: query, 
			headers: req.headers
		}).then(res=>{
			response.setHeader('set-cookie', res.headers['set-cookie'])
            data['count'] = res.data.data;
            response.send({data: data, ok: true})
		}).catch( (err) => {
            response.send(errMessage)
		})
    })
});

//获取某个模板指定版本下的数据    conf: 模板id   version： 指定版本号
app.get('/configurations_version_read', function (req, response) {
    sendGetAjax('/configurations.versions.list?conf=' + req.query.conf, req.headers).then(res=>{
		response.setHeader('set-cookie', res.headers['set-cookie'])
        let list = res.data.data;
        let data = undefined;
        list && list.length > 0 && list.map((v)=>{
            if (v.version.toString() === req.query.version) {
                data = v.data;
            }
        });
		if (data === undefined) {
			response.send({error: 'version_not_found', ok: false})
		} else {
			response.send({data: data, ok: true})
		}
    }).catch(err=>{
        response.send(errMessage)
    })
});

//平台事件确认消息   okokok
app.post('/activities_dispose', function(req, response){
    sendPostAjax('/'+ req.body.category +'.activities.dispose', req.headers, {
        activities: req.body.activities,
        disposed: req.body.disposed
    }, response, true)
});
//设备事件确认消息 okokok
app.post('/events_dispose', function(req, response){
    sendPostAjax('/'+ req.body.category +'.events.dispose', req.headers, {
        events: req.body.events,
        disposed: req.body.disposed
    }, response, true)
});

//创建模板新版本  okokok
app.post('/configurations_versions_create', function (req, response) {
    sendPostAjax('/configurations.versions.create', req.headers, req.body, response, true)
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
    sendPostAjax('/configurations.create', req.headers, req.body, response, true)
});

//删除模板   okokok
app.post('/configurations_remove', function(req, response){
    sendPostAjax('/configurations.remove', req.headers, req.body, response, true)
});

//读取模板信息
app.get('/configurations_read', function (req, response) {
    sendGetAjax('/configurations.read', req.headers, req.query, response, true)
});
//读取模板信息
app.get('/get_wps_url', function (req, response) {
    axios.get('http://ioe.thingsroot.com/api/method/ioe_api.wps.wps_url?conf=' + req.query.conf + '&version=' + req.query.version + '&version_new=' + req.query.version_new, {
        headers: req.headers
    }).then(res=>{
        if (res.data.ok) {
            response.send(res.data)
        }
    })
});
//更新模板信息
app.post('/configurations_update', function (req, response) {
    sendPostAjax('/configurations.update', req.headers, req.body, response, true)
});

//查询是否是开发者
app.get('/developers_read', function (req, response) {
    sendGetAjax('/developers.read', req.headers, req.query, response, true)
});

module.exports = app;

//应用   创建、修改、上传新版本
//消息   列表、查询、详情、确认消息、
//模板   保存
//个人信息  获取、认证旧密码、修改密码
//首页   获取表数据