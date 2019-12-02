const express = require('express');
const app = express.Router();
const {sendGetAjax, sendPostAjax, errMessage} = require('../common/sendAjax');
app.get('/store_read', function(req, response){
    sendGetAjax('/store.read', req.headers, req.query).then(res=>{
		response.setHeader('set-cookie', res.headers['set-cookie'])
        response.send(res.data)
    })
})
app.get('/store_tags_list', function(req, response){
    sendGetAjax('/store.tags.list', req.headers).then(res=>{
        response.setHeader('set-cookie', res.headers['set-cookie'])
        response.send(res.data)
    })
})
// 获取应用评论列表
app.get('/store_reviews_list', function(req, response){
    sendGetAjax('/store.reviews.list', req.headers, req.query).then(res=>{
        response.setHeader('set-cookie', res.headers['set-cookie'])
        response.send(res.data)
    }).catch(err=>{
        response.send(errMessage)
    })
})
// 获取应用市场讨论列表
app.get('/store_comments_list', function(req, response){
    sendGetAjax('/store.comments.list', req.headers, req.query).then(res=>{
        response.setHeader('set-cookie', res.headers['set-cookie'])
        response.send(res.data)
    }).catch(err=>{
        response.send(errMessage)
    })
})
// 创建应用评论问题
app.post('/store_comments_create', function(req, response){
    sendPostAjax('/store.comments.create', req.headers, req.body).then(res=>{
		response.setHeader('set-cookie', res.headers['set-cookie'])
        response.send(res.data)
    }).catch(err=>{
        response.send(errMessage)
    })
})
// 创建应用评论问题
app.post('/store_reviews_create', function(req, response){
    sendPostAjax('/store.reviews.create', req.headers, req.body).then(res=>{
		response.setHeader('set-cookie', res.headers['set-cookie'])
        response.send(res.data)
    }).catch(()=>{
        response.send(errMessage)
    })
})
// 删除应用评论问题
app.post('/store_reviews_remove', function(req, response){
    sendPostAjax('/store.reviews.remove', req.headers, req.body).then(res=>{
		response.setHeader('set-cookie', res.headers['set-cookie'])
        response.send(res.data)
    }).catch(err=>{
        response.send(errMessage)
    })
})
// 删除应用评论问题
app.post('/store_comments_remove', function(req, response){
    sendPostAjax('/store.comments.remove', req.headers, req.body).then(res=>{
		response.setHeader('set-cookie', res.headers['set-cookie'])
        response.send(res.data)
    }).catch(err=>{
        response.send(errMessage)
    })
})
// 增加应用到收藏列表
app.post('/store_favorites_add', function(req, response){
    sendPostAjax('/store.favorites.add', req.headers, req.body).then(res=>{
        console.log(res)
		response.setHeader('set-cookie', res.headers['set-cookie'])
        response.send(res.data)
    }).catch(err=>{
        response.send(errMessage)
    })
})
// 查询应用收藏列表
app.post('/store_favorites_list', function(req, response){
    sendPostAjax('/store.favorites.list', req.headers, req.body).then(res=>{
        console.log(res)
		response.setHeader('set-cookie', res.headers['set-cookie'])
        response.send(res.data)
    }).catch(err=>{
        response.send(errMessage)
    })
})
// 删除应用收藏列表
app.post('/store_favorites_remove', function(req, response){
    sendPostAjax('/store.favorites.remove', req.headers, req.body).then(res=>{
		response.setHeader('set-cookie', res.headers['set-cookie'])
        response.send(res.data)
    }).catch(err=>{
        response.send(errMessage)
    })
})
//获取APP列表 未作处理 未测试
app.get('/store_list', function(req, response){
    sendGetAjax('/store.list', req.headers).then(res=>{
		response.setHeader('set-cookie', res.headers['set-cookie'])
        response.send(res.data)
    }).catch(err=>{
        response.send(err.data)
    })
})

app.get('/store_configurations_list',function (req, response) {
    sendGetAjax('/store.configurations.list', req.headers, req.query).then(res=>{
		response.setHeader('set-cookie', res.headers['set-cookie'])
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