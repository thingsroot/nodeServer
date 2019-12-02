const express = require('express');
const app = express.Router();
const {sendGetAjax, sendPostAjax, errMessage} = require('../common/sendAjax');
// 获取公司组列表
app.get('/companies_groups_list', function(req, response){
    req.query.company = encodeURI(req.query.company)
    let data = [];
    MapGetGroupsList = function(arr, ind, res) {
        if (ind > arr.length - 1) {
            response.setHeader('set-cookie', res.headers['set-cookie'])
            response.send({ok: true, data: data})
        }
        if (ind <= arr.length - 1) {
            sendGetAjax('/companies.groups.read?name=' + arr[ind], req.headers).then(ajax=>{
                if (ajax.data.ok) {
                    data.push(ajax.data.data)
                    MapGetGroupsList(arr, ind + 1, res)
                } else {
                    MapGetGroupsList(arr, ind + 1, res)
                }
            })
        }
    }
    sendGetAjax('/companies.groups.list', req.headers, req.query).then(res=>{
        if (res.data.ok && res.data.data.length > 0) {
            MapGetGroupsList(res.data.data, 0, res)
        } else {
            response.setHeader('set-cookie', res.headers['set-cookie'])
            response.send(res.data)
        }
    })
})
//  获取公司列表
app.get('/companies_list', function(req, response){
    sendGetAjax('/companies.list', req.headers, req.query).then(res=>{
		response.setHeader('set-cookie', res.headers['set-cookie'])
        response.send(res.data);
    }).catch(err=>{
        response.send(errMessage)
    })
})
// 创建公司
app.post('/companies_create', function(req, response){
    sendPostAjax('/companies.create', req.headers, req.body).then(res=>{
		response.setHeader('set-cookie', res.headers['set-cookie'])
        response.send(res.data);
    }).catch(err=>{
        response.send(errMessage)
    })
});
// 更新公司信息
app.post('/companies_update', function(req, response){
    sendPostAjax('/companies.update', req.headers, req.body).then(res=>{
		response.setHeader('set-cookie', res.headers['set-cookie'])
        response.send(res.data);
    }).catch(err=>{
        response.send(errMessage)
    })
});
// 查询公司信息
app.get('/companies_read', function(req, response){
    req.query.name = encodeURI(req.query.name)
    sendGetAjax('/companies.read', req.headers, req.query).then(res=>{
		response.setHeader('set-cookie', res.headers['set-cookie'])
        response.send(res.data);
    }).catch(err=>{
        response.send(errMessage)
    })
});
// 删除公司
app.post('/companies_remove', function(req, response){
    sendPostAjax('/companies.remove', req.headers, req.body).then(res=>{
		response.setHeader('set-cookie', res.headers['set-cookie'])
        response.send(res.data);
    }).catch(err=>{
        response.send(errMessage)
    })
});

// 创建公司组
app.post('/companies_groups_create', function(req, response){
    sendPostAjax('/companies.groups.create', req.headers, req.body).then(res=>{
		response.setHeader('set-cookie', res.headers['set-cookie'])
        response.send(res.data);
    }).catch(err=>{
        response.send(errMessage)
    })
});
// 更新公司组信息
app.post('/companies_groups_update', function(req, response){
    sendPostAjax('/companies.groups.update', req.headers, req.body).then(res=>{
		response.setHeader('set-cookie', res.headers['set-cookie'])
        response.send(res.data);
    }).catch(err=>{
        response.send(errMessage)
    })
});
// 获取公司组信息
app.get('/companies_groups_read', function(req, response){
    sendGetAjax('/companies.groups.read', req.headers, req.query).then(res=>{
		response.setHeader('set-cookie', res.headers['set-cookie'])
        response.send(res.data)
    }).catch(err=>{
        response.send(errMessage)
    })
})
// 删除公司组员工
app.post('/companies_groups_remove_user', function(req, response){
    sendPostAjax('/companies.groups.remove_user', req.headers, req.body).then(res=>{
		response.setHeader('set-cookie', res.headers['set-cookie'])
        response.send(res.data);
    }).catch(err=>{
        response.send(errMessage)
    })
});
// 删除公司组
app.post('/companies_groups_remove', function(req, response){
    sendPostAjax('/companies.groups.remove', req.headers, req.body).then(res=>{
		response.setHeader('set-cookie', res.headers['set-cookie'])
        response.send(res.data);
    }).catch(err=>{
        response.send(errMessage)
    })
});
// 读取设备共享组信息
app.get('/companies_sharedgroups_read', function(req, response){
    sendGetAjax('/companies.sharedgroups.read', req.headers, req.query).then(res=>{
		response.setHeader('set-cookie', res.headers['set-cookie'])
        response.send(res.data)
    }).catch(err=>{
        response.send(errMessage)
    })
})
// 删除公司设备共享组
app.post('/companies_sharedgroups_remove', function(req, response){
    sendPostAjax('/companies.sharedgroups.remove', req.headers, req.body).then(res=>{
		response.setHeader('set-cookie', res.headers['set-cookie'])
        response.send(res.data);
    }).catch(err=>{
        response.send(errMessage)
    })
});
// 获取设备共享组类表
app.get('/companies_sharedgroups_list', function(req, response){
    req.query.company = encodeURI(req.query.company)
    let data = [];
    MapGetCompaniesList = function(arr, ind, res) {
        if (ind > arr.length - 1) {
            response.setHeader('set-cookie', res.headers['set-cookie'])
            response.send({ok: true, data: data})
        }
        if (ind <= arr.length -1) {
            const name = encodeURI(arr[ind])
            sendGetAjax('/companies.sharedgroups.read?name=' + name, req.headers).then(ajax=>{
                if (ajax.data.ok) {
                        data.push(ajax.data.data)
                        MapGetCompaniesList(arr, ind + 1, res)
                } else {
                    MapGetCompaniesList(arr, ind + 1, res)
                }
            })
        }
    }
    sendGetAjax('/companies.sharedgroups.list', req.headers, req.query).then(res=>{
        if (res.data.ok && res.data.data.length > 0) {
            MapGetCompaniesList(res.data.data, 0, res)
        } else {
            response.setHeader('set-cookie', res.headers['set-cookie'])
            response.send(res.data)
        }
    })
})
// 创建设备共享组
app.post('/companies_sharedgroups_create', function(req, response){
    sendPostAjax('/companies.sharedgroups.create', req.headers, req.body).then(res=>{
		response.setHeader('set-cookie', res.headers['set-cookie'])
        response.send(res.data)
    }).catch(err=>{
        response.send(errMessage)
    })
})
// 更新设备共享组信息
app.post('/companies_sharedgroups_update', function(req, response){
    sendPostAjax('/companies.sharedgroups.update', req.headers, req.body).then(res=>{
		response.setHeader('set-cookie', res.headers['set-cookie'])
        response.send(res.data)
    }).catch(err=>{
        response.send(errMessage)
    })
})
// 添加新账号到公司组
app.post('/companies_users_create', function(req, response){
    sendPostAjax('/companies.users.create', req.headers, req.body).then(res=>{
		response.setHeader('set-cookie', res.headers['set-cookie'])
        response.send(res.data)
    }).catch(err=>{
        response.send(errMessage)
    })
})
// 更改公司员工信息
app.post('/companies_users_update', function(req, response){
    sendPostAjax('/companies.users.update', req.headers, req.body).then(res=>{
		response.setHeader('set-cookie', res.headers['set-cookie'])
        response.send(res.data)
    }).catch(err=>{
        response.send(errMessage)
    })
})
// 查询账号信息
app.get('/companies_users_read', function(req, response){
    sendGetAjax('/companies.users.read', req.headers, req.query).then(res=>{
		response.setHeader('set-cookie', res.headers['set-cookie'])
        response.send(res.data)
    }).catch(err=>{
        response.send(errMessage)
    })
})
// 添加用户到设备共享组
app.post('/companies_sharedgroups_add_user', function(req, response){
    sendPostAjax('/companies.sharedgroups.add_user', req.headers, req.body).then(res=>{
		response.setHeader('set-cookie', res.headers['set-cookie'])
        response.send(res.data)
    }).catch(err=>{
        response.send(errMessage)
    })
})
// 添加用户到公司组
app.post('/companies_groups_add_user', function(req, response){
    sendPostAjax('/companies.groups.add_user', req.headers, req.body).then(res=>{
		response.setHeader('set-cookie', res.headers['set-cookie'])
        response.send(res.data)
    }).catch(err=>{
        response.send(errMessage)
    })
})
// 添加设备到设备共享组
app.post('/companies_sharedgroups_add_device', function(req, response){
    sendPostAjax('/companies.sharedgroups.add_device', req.headers, req.body).then(res=>{
		response.setHeader('set-cookie', res.headers['set-cookie'])
        response.send(res.data)
    }).catch(err=>{
        response.send(errMessage)
    })
})
// 从设备共享组删除用户
app.post('/companies_sharedgroups_remove_user', function(req, response){
    sendPostAjax('/companies.sharedgroups.remove_user', req.headers, req.body).then(res=>{
		response.setHeader('set-cookie', res.headers['set-cookie'])
        response.send(res.data)
    }).catch(err=>{
        response.send(errMessage)
    })
})
// 从设备共享组移除网关设备
app.post('/companies_sharedgroups_remove_device', function(req, response){
    sendPostAjax('/companies.sharedgroups.remove_device', req.headers, req.body).then(res=>{
		response.setHeader('set-cookie', res.headers['set-cookie'])
        response.send(res.data)
    }).catch(err=>{
        response.send(errMessage)
    })
})
// 获取公司注册申请列表
app.get('/companies_requisition_list', function(req, response){
    sendGetAjax('/companies.requisition.list', req.headers, req.query).then(res=>{
		response.setHeader('set-cookie', res.headers['set-cookie'])
        response.send(res.data)
    }).catch(err=>{
        response.send(errMessage)
    })
})
// 创建公司注册申请
app.post('/companies_requisition_create', function(req, response){
    sendPostAjax('/companies.requisition.create', req.headers, req.body).then(res=>{
		response.setHeader('set-cookie', res.headers['set-cookie'])
        response.send(res.data)
    }).catch(err=>{
        response.send(errMessage)
    })
})
// 更新公司注册申请
app.post('/companies_requisition_update', function(req, response){
    sendPostAjax('/companies.requisition.update', req.headers, req.body).then(res=>{
		response.setHeader('set-cookie', res.headers['set-cookie'])
        response.send(res.data)
    }).catch(err=>{
        response.send(errMessage)
    })
})
// 更新公司注册申请的公司运营执照图片
app.post('/companies_requisition_update_business_licence', function(req, response){
    sendPostAjax('/companies.requisition.update_business_licence', req.headers, req.body).then(res=>{
		response.setHeader('set-cookie', res.headers['set-cookie'])
        response.send(res.data)
    }).catch(err=>{
        response.send(errMessage)
    })
})
// 读取公司注册申请详细信息
app.get('/companies_requisition_read', function(req, response){
    sendGetAjax('/companies.requisition.read', req.headers, req.query).then(res=>{
		response.setHeader('set-cookie', res.headers['set-cookie'])
        response.send(res.data)
    }).catch(err=>{
        response.send(errMessage)
    })
})
// 取消公司注册申请
app.post('/companies_requisition_remove', function(req, response){
    sendPostAjax('/companies.requisition.remove', req.headers, req.body).then(res=>{
		response.setHeader('set-cookie', res.headers['set-cookie'])
        response.send(res.data)
    }).catch(err=>{
        response.send(errMessage)
    })
})
module.exports = app;