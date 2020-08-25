const express = require('express');
const app = express.Router();
const {sendGetAjax, sendPostAjax} = require('../common/sendAjax');
const { path } = require('../config/env');
// 创建新的应用开发者申请单
app.post('/developers_requisition_create', function(req, response){
    sendPostAjax('developers.requisition.create', req.headers, req.body, response, true)
})
// 创建开发者
app.post('/developers_create', function(req, response){
    sendPostAjax('developers.create', req.headers, req.body, response, true)
})
// 更新开发者
app.post('/developers_update', function(req, response){
    sendPostAjax('developers.update', req.headers, req.body, response, true)
})
//获取开发者列表
app.get('/developers_list', function(req, response){
    sendGetAjax('developers.list', req.headers, req.query, response, true)
})
// 获取开发者申请列表
app.get('/developers_requisition_list', function(req, response){
    sendGetAjax('developers.requisition.list', req.headers, req.query, response, true)
})
module.exports = app;
