const express = require('express');
const app = express.Router();
const {sendGetAjax, sendPostAjax, errMessage} = require('../common/sendAjax');
// 转接login 未作处理
app.post('/user_login', function(req, response){
    sendPostAjax('/user.login', req.headers, req.body).then(res=>{
       response.setHeader('set-cookie', res.headers['set-cookie'])
       response.send(res.data)
    }).catch(err=>{
        response.send(errMessage)
    })
})

// 转接logout 未作处理
app.post('/user_logout', function(req, response){
    sendPostAjax('/user.logout', req.headers, req.body).then(res=>{
       response.setHeader('set-cookie', res.headers['set-cookie'])
       response.send(res.data)
    }).catch(err=>{
        response.send(errMessage)
    })
})

// 注册账户 未作处理
app.post('/user_create', function(req, response){
   sendPostAjax('/user.create', req.headers, req.body).then(res=>{
       response.setHeader('set-cookie', res.headers['set-cookie'])
       response.send(res.data)
   }).catch(err=>{
       response.setHeader('set-cookie', res.headers['set-cookie'])
       response.send(errMessage)
   })
})
// 忘记密码 未做处理
app.post('/user_reset_password', function(req, response){
   sendPostAjax('/user.reset_password', req.headers, req.body).then(res=>{
       response.setHeader('set-cookie', res.headers['set-cookie'])
       response.send(res.data)
   }).catch(err=>{
       response.setHeader('set-cookie', res.headers['set-cookie'])
       response.send(err)
   })
})

// 重新获取csrftoken
app.get('/user_csrf_token', function(req, response){
   sendGetAjax('/user.csrf_token', req.headers).then(res=>{
       response.setHeader('set-cookie', res.headers['set-cookie'])
       response.send(res.data);
   })
})
// 创建Accesskey
app.post('/user_token_create', function(req, response){
   sendPostAjax('/user.token.create', req.headers).then(res=>{
       response.setHeader('set-cookie', res.headers['set-cookie'])
       response.send(res.data)
   }).catch(err=>{
       response.send(errMessage)
   })
})
// 获取Accesskey
app.get('/user_token_read', function(req, response){
   sendGetAjax('/user.token.read', req.headers).then(res=>{
       response.setHeader('set-cookie', res.headers['set-cookie'])
       response.send(res.data)
   }).catch(err=>{
       response.send(errMessage)
   })
})
// 更新Accesskey
app.post('/user_token_update', function(req, response){
   sendPostAjax('/user.token.update', req.headers, req.body).then(res=>{
       response.setHeader('set-cookie', res.headers['set-cookie'])
       response.send(res.data)
   }).catch(()=>{
       response.send(errMessage)
   })
})
// 获取虚拟网关列表
app.get('/user_virtual_gateways_list', function(req, response){
   const arr = [];
   function queryVirtual(index, data){
       if (index >= data.length){

           response.send({ok: true, data: arr});
           return false;
       }
           sendGetAjax('/user.virtual_gateways.read?name=' + data[index], req.headers).then(res=>{
               response.setHeader('set-cookie', res.headers['set-cookie'])
               arr.push(res.data.data)
               queryVirtual(index+1, data)
           })
   }
   sendGetAjax('/user.virtual_gateways.list', req.headers).then(res=>{
       response.setHeader('set-cookie', res.headers['set-cookie'])
       if (res.data.data && res.data.data.length > 0){
           queryVirtual(0, res.data.data)
       } else {

           response.send({data: [], ok: true})
       }
   }).catch((err)=>{
       response.send(errMessage)
   })
})
// 创建一个新的虚拟网关
app.post('/user_virtual_gateways_create', function(req, response){
   sendPostAjax('/user.virtual_gateways.create', req.headers).then(res=>{
       response.setHeader('set-cookie', res.headers['set-cookie'])
       response.send(res.data)
   }).catch(()=>{
       response.send(errMessage)
   })
})
//个人信息   ok
app.get('/user_read', function (req, response) {
    sendGetAjax('/user.read', req.headers, req.query).then(res=>{
		response.setHeader('set-cookie', res.headers['set-cookie'])
        response.send(res.data)
    }).catch(()=>{
        response.send(errMessage)
    })
});

app.get('/user_groups_list', function (req, response) {
    sendGetAjax('/user.groups.list', req.headers).then(res=>{
		response.setHeader('set-cookie', res.headers['set-cookie'])
        response.send(res.data)
    }).catch(()=>{
        response.send(errMessage)
    })
});
//我的应用下对应的模板列表   okokok
app.get('/user_configurations_list', function(req, response){
    sendGetAjax('/configurations.list?conf_type=Template', req.headers).then(res=>{
		response.setHeader('set-cookie', res.headers['set-cookie'])
        let obj = [];
        let list = [];
        let app = req.query.app;
        function getLatestVersion(index, item) {
            if (index >= item.length) {
                obj = list;
                response.send({data: list, ok: true})
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
    }).catch(()=>{
        response.send(errMessage)
    })
});
//修改密码   小崔
app.post('/user_update_password', function (req, response) {
    sendPostAjax('/user.update_password', req.headers, req.body).then(res=>{
		response.setHeader('set-cookie', res.headers['set-cookie'])
        response.send(res.data)
    }).catch(err=>{
        response.send(errMessage)
    })
});

module.exports  = app;