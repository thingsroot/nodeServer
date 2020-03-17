const express = require('express');
const app = express.Router();
const {sendGetAjax, sendPostAjax, errMessage} = require('../common/sendAjax');
const {path} = require('../config/env');
const axios  = require('axios');
app.get('/store_read', function(req, response){
    sendGetAjax('/store.read', req.headers, req.query, response, true)
})
app.get('/store_tags_list', function(req, response){
    sendGetAjax('/store.tags.list', req.headers, req.query, response, true)
})
// 获取应用评论列表
app.get('/store_reviews_list', function(req, response){
    sendGetAjax('/store.reviews.list', req.headers, req.query, response, true)
})
// 获取应用市场讨论列表
app.get('/store_comments_list', function(req, response){
    sendGetAjax('/store.comments.list', req.headers, req.query, response, true)
})
// 创建应用评论问题
app.post('/store_comments_create', function(req, response){
    sendPostAjax('/store.comments.create', req.headers, req.body, response, true)
})
// 创建应用评论问题
app.post('/store_reviews_create', function(req, response){
    sendPostAjax('/store.reviews.create', req.headers, req.body, response, true)
})
// 删除应用评论问题
app.post('/store_reviews_remove', function(req, response){
    sendPostAjax('/store.reviews.remove', req.headers, req.body, response, true)
})
// 删除应用评论问题
app.post('/store_comments_remove', function(req, response){
    sendPostAjax('/store.comments.remove', req.headers, req.body, response, true)
})
// 增加应用到收藏列表
app.post('/store_favorites_add', function(req, response){
    sendPostAjax('/store.favorites.add', req.headers, req.body, response, true)
})
// 查询应用收藏列表
app.post('/store_favorites_list', function(req, response){
    sendPostAjax('/store.favorites.list', req.headers, req.body, response, true)
})
// 删除应用收藏列表
app.post('/store_favorites_remove', function(req, response){
    sendPostAjax('/store.favorites.remove', req.headers, req.body, response, true)
})
//获取APP列表 未作处理 未测试
app.get('/store_list', function(req, response){
    const user_list = [];
    function MapGetUserInfo (arr, index, data) {
        if (index >= arr.length) {
            data.map(item=>{
                item.user_info = user_list.filter(val=> val.name === item.developer)[0]
            })
            response.send({ok: true, data: data})
            return false;
        }
        const url = path + '/developers.read?user=' + arr[index];
        axios.get(url, {
            headers: req.headers
        }).then(res=>{
            if (res.data.ok) {
                user_list.push(res.data.data)
                MapGetUserInfo(arr, index + 1, data)
            } else {
                MapGetUserInfo(arr, index, data)
            }
        }).catch(()=>{
            response.send(errMessage)
        })
    }
    sendGetAjax('/store.list', req.headers, req.query, response).then(res=>{
        if (res.data.ok && res.data.data.length > 0) {
            const arr = [];
            res.data.data.map(item=>{
                if (arr.indexOf(item.developer) === -1) {
                    arr.push(item.developer)
                }
            })
            MapGetUserInfo(arr, 0, res.data.data)
        }
    }).catch(()=>{
        response.send(errMessage)
    })
})

app.get('/store_configurations_list',function (req, response) {
    sendGetAjax('/store.configurations.list', req.headers, req.query, response).then(res=>{
        let list = [];
        function getLatestVersion(index, item) {
            if (index >= item.length) {
                response.send({data: list, ok: true});
                return false;
            } else {
                sendGetAjax('/configurations.versions.latest?conf=' + item[index], req.headers).then(res=>{
                    list && list.length > 0 && list.map((v)=>{
                        if (v.name === item[index]) {
                            v['latest_version'] = res.data.data;
                        } 
                    });
                    getLatestVersion(index + 1, item, req.headers)
                }).catch(()=>{
                    response.send(errMessage)
                })
            }
        }
        list = res.data.data;
        let arr = [];
        list && list.length > 0 && list.map((v)=>{
            arr.push(v.name);
        });
        getLatestVersion(0, arr);
    }).catch(()=>{
        response.send(errMessage)
    })
});
module.exports = app;