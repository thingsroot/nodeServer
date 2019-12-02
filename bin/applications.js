const express = require('express');
const app = express.Router();
const axios = require('axios');
const http = require('../common/http');
const {sendGetAjax, sendPostAjax, errMessage, path} = require('../common/sendAjax');
// 查询应用详细信息
app.get('/applications_info', function(req, response){
    sendGetAjax('/applications.read', req.headers, req.query).then(res=>{
		response.setHeader('set-cookie', res.headers['set-cookie'])
        response.send(res.data)
    }).catch(()=>{
        response.send(errMessage)
    })
})
// fork应用
app.post('/applications_forks_create', function(req, response){
    sendPostAjax('/applications.forks.create', req.headers, req.body).then(res=>{
		response.setHeader('set-cookie', res.headers['set-cookie'])
        response.send(res.data)
    }).catch((err)=>{
        response.send(errMessage)
    })
})
//获取fork应用列表
app.get('/applications_forks_list', function(req, response){
    sendGetAjax('/applications.forks.list', req.headers, req.query).then(res=>{
		response.setHeader('set-cookie', res.headers['set-cookie'])
        response.send(res.data)
    }).catch(()=>{
        response.send(errMessage)
    })
})
// 删除我的应用
app.post('/my_applications_remove', function(req, response){
    sendPostAjax('/applications.remove', req.headers, req.body).then(res=>{
		response.setHeader('set-cookie', res.headers['set-cookie'])
        response.send(res.data)
    }).catch(err=>{
        response.send(errMessage)
    })
})
// 删除设备安装应用
app.post('/applications_remove', function(req, response){
    sendPostAjax('/gateways.applications.remove', req.headers, req.body).then(res=>{
		response.setHeader('set-cookie', res.headers['set-cookie'])
        response.send(res.data)
    }).catch(err=>{
        response.send(errMessage)
    })
})
// 查詢應用版本列表
app.get('/applications_versions_list', function(req, response){
    sendGetAjax('/applications.versions.list', req.headers, req.query).then(res=>{
		response.setHeader('set-cookie', res.headers['set-cookie'])
        response.send(res.data)
    }).catch(err=>{
        response.send(errMessage)
    })
})

// 应用详情  okokok     app: 应用id  user:  用户id
app.get('/applications_read', function(req, response){
    sendGetAjax('/applications.read?name=' + req.query.app, req.headers).then(res=>{
		response.setHeader('set-cookie', res.headers['set-cookie'])
		if (res.data.ok) {
			let obj = {};
			obj['data'] = res.data.data;
			axios.all(
				[
					http.get(path + '/applications.versions.list?app=' + req.query.app, {headers: req.headers}),
					http.get(path + '/applications.versions.latest?app=' + req.query.app + '&beta=1', {headers: req.headers})
				]
			).then(axios.spread(function (versionList, versionLatest) {
				if (versionList.data.ok) {
					obj['versionList'] = versionList.data.data;
				} else {
					obj['versionList'] = [];
				}
				if (versionLatest.data.ok) {
					obj['versionLatest'] = versionLatest.data.data;
				} else {
					obj['versionLatest'] = 0;
				}
				response.send({data: obj, ok: true});
			}));
		} else {
			response.send(res.data)
		}
	}).catch((err)=>{
        response.send(errMessage)
    })
});

//应用列表   ok
app.get('/applications_list', function(req, response){
    sendGetAjax('/applications.list', req.headers, req.query).then(res=>{
		response.setHeader('set-cookie', res.headers['set-cookie'])
        response.send(res.data)
    }).catch(()=>{
        response.send(errMessage)
    })
});
app.get('/applications_versions_latest', function (req, response) {
    sendGetAjax('/applications.versions.latest', req.headers, req.query).then(res=>{
		response.setHeader('set-cookie', res.headers['set-cookie'])
        response.send(res.data);
    }).catch(err=>{
        response.send(errMessage)
    })
});

//单个APP详情
app.get('/applications_details', function (req, response) {
    sendGetAjax('/applications.read', req.headers, req.query).then(res=>{
		response.setHeader('set-cookie', res.headers['set-cookie'])
        response.send(res.data)
    }).catch(()=>{
        response.send(errMessage)
    })
});
//创建新应用   okokok
app.post('/applications_create', function(req, response){
    sendPostAjax('/applications.create', req.headers, req.body).then(res=>{
		response.setHeader('set-cookie', res.headers['set-cookie'])
        response.send(res.data)
    }).catch(()=>{
        response.send(errMessage)
    })
});

//修改应用
app.post('/applications_update', function(req, response){
    sendPostAjax('/applications.update', req.headers, req.body).then(res=>{
		response.setHeader('set-cookie', res.headers['set-cookie'])
        response.send(res.data)
    }).catch(()=>{
        response.send(errMessage)
    })
});

//获取模板版本列表    okokok   conf:  模板id
app.get('/configurations_versions_list', function (req, response) {
    sendGetAjax('/configurations.versions.list', req.headers, req.query).then(res=>{
		response.setHeader('set-cookie', res.headers['set-cookie'])
        response.send(res.data);
    }).catch(err=>{
        response.send(errMessage)
    })
});
module.exports = app;