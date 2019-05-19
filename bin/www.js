const express = require('express');
const app = express();
const axios = require('axios');
const http = require('../common/http');
const errMessage = {message: 'error', ok: false};
const path = 'http://ioe.thingsroot.com/api/v1';
const server = require('./server');
const client = require('./redis');
const bodyParser = require('body-parser')
const InfluxClient = require('./influx');
const Influx = require('influxdb-nodejs');
// app.use(function(req, res, next){
//     if (http.cookie) {
//         res.setHeader('cookie', http.cookie)
//     }
//     next()
// })
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use(server);
// 封装ajax get方式
function sendGetAjax (url, headers, query){
    let pathname = ''; 
    
    
    if (query){
        let str = '';
        const name = Object.keys(query);
        const querys = Object.values(query);
        name.map((item, key)=>{
            key === 0 ? str += (item + '=' + querys[key]) : str += ('&' + item + '=' + querys[key])
            
        })
        pathname = path + url + '?' + str;
    } else {
        pathname = path + url;
    }
    
    // console.log(pathname)
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
function sendPostAjax (url, headers, body){
    return new Promise((resolve, reject)=>{
        http.post(path + url, {
            headers: headers,
            data: body
        }) .then(res=>{
            resolve(res)
        }).catch(err=>{
            reject(err)
        })
    })
}

// 转接login 未作处理
app.post('/user_login', function(req, respons){
    // console.log(req.body)
     sendPostAjax('/user.login', undefined, req.body).then(res=>{
        //  console.log(res)
        const data = {
            data: res.data,
            status: res.status,
            statusText: res.statusText,
            headers: res.headers
        }
        respons.send(data)
     }).catch(err=>{
         respons.send(errMessage)
     })
})

// 注册账户 未作处理
app.post('/user_create', function(req, respons){
    sendPostAjax('/user.create', req.headers, req.body).then(res=>{
        respons.send(res.data)
    }).catch(err=>{
        console.log(err)
        respons.send(errMessage)
    })
})
// 忘记密码 未做处理
app.post('/user_reset_password', function(req, respons){
    sendPostAjax('/user.reset_password', req.headers, req.body).then(res=>{
        respons.send(res.data)
    }).catch(err=>{
        respons.send(err)
    })
})

// 重新获取csrftoken
app.get('/user_csrf_token', function(req, respones){
    // console.log(req)
    sendGetAjax('/user.csrf_token', req.headers).then(res=>{
        // console.log(res)
        respones.send(res.data);
    })
})
// 创建Accesskey
app.get('/user_token_read', function(req, respones){
    sendGetAjax('/user.token.read', req.headers).then(res=>{
        respones.send(res.data)
    }).catch(err=>{
        // console.log(err);
        respones.send(errMessage)
    })
})
// 更新Accesskey
app.post('/user_token_update', function(req, respones){
    sendPostAjax('/user.token.update', req.headers, req.body).then(res=>{
        respones.send(res.data)
    }).catch(()=>{
        respones.send(errMessage)
    })
})
// 获取虚拟网关列表
app.get('/user_virtual_gateways_list', function(req, respones){
    const arr = [];
    function queryVirtual(index, data){
        if (index >= data.length){
            respones.send({ok: true, data: arr});
            return false;
        }
        data.map(()=>{
            sendGetAjax('/user.virtual_gateways.read?name=' + data[index], req.headers).then(res=>{
                arr.push(res.data.data)
                queryVirtual(index+1, data)
            })
        })
        
        
    }
    sendGetAjax('/user.virtual_gateways.list', req.headers).then(res=>{
        console.log(res)
        if (res.data.data && res.data.data.length > 0){
            queryVirtual(0, res.data.data)
        } else {
            respones.send({data: [], ok: true})
        }
    }).catch((err)=>{
        console.log(err)
        respones.send(errMessage)
    })
})
// 创建一个新的虚拟网关
app.post('/user_virtual_gateways_create', function(req, respones){
    sendPostAjax('/user.virtual_gateways.create', req.headers).then(res=>{
        console.log(res)
        respones.send(res.data)
    }).catch(()=>{
        respones.send(errMessage)
    })
})
// 更新网关信息
app.post('/gateways_update', function(req, respones){
    sendPostAjax('/gateways.update', req.headers, req.body).then(res=>{
        console.log(res)
        respones.send(res.data)
    }).catch((error)=>{
        console.log(error)
        respones.send(errMessage)
    })
})
// influxdb 获取在线Ip记录
app.get('/gateway_online_record', function(req, respones){
    console.log(req.query)
    const client = new Influx('http://root:root@172.30.0.187:8086/gates_trace')
    client.query(req.query.type)
        // .where(' and "device"="' + req.query.sn + '"')
        .where('time > now() - 7d ')
        .where('iot', req.query.sn)
        .addFunction('ipaddr')
        .then(res=>{
        // var sql = client.query(req.query.type).where('time > now() - 7d ').where('iot', req.query.sn).addFunction('ipaddr').toString();
        // console.info('##   sql:' + sql)
        if (res.results[0].series) {
            respones.send({data: res.results[0].series[0].values, ok: true})
        } else {
            respones.send({data: [], ok: false})
        }
    })
})
// redis获取网关列表
app.get('/gateway_list', function(req, respones){
    const arr = [];
    function queryGateway (index, item) {
        if (index >= item.length){
            respones.send({message: arr, ok: true})
        } else {
            http.get(path + '/gateways.read?name=' + item[index], {headers: req.headers}).then(res=>{
                let data = res.data.data;
                client.getDevLen(item[index]).then(DevLen=>{
                    data.device_devs_num = DevLen;
                    client.getAppLen(item[index]).then(AppLen=>{
                        data.device_apps_num = AppLen;
                        data.last_updated = data.modified.slice(0, -7)
                        arr.push(data)
                        queryGateway(index + 1, item)
                    })
                })
            })
        }
    }
    sendGetAjax('/gateways.list', req.headers).then(res=>{
        let data = [];
        const company_devices = res.data.data.company_devices;
        const shared_devices = res.data.data.shared_devices;
        const private_devices = res.data.data.private_devices;
        if (company_devices && company_devices.length > 0 && shared_devices && shared_devices.length > 0){
            data = company_devices[0].devices.concat(private_devices).concat(shared_devices[0].devices)
        } else if (company_devices && company_devices.length > 0 && shared_devices.length <= 0) {
            data = company_devices[0].devices.concat(private_devices)
        } else if (shared_devices && shared_devices.length > 0 && company_devices.length <= 0) {
            data = shared_devices[0].devices.concat(private_devices)
        } else {
            data = private_devices
        }
            
        function promise () {
            const ONLINE = [];
            const OFFLINE = [];
            const NullData = [];
            return new Promise((resolve, reject)=>{
                function dataMap (index, item) {
                    if (index >= item.length) {
                        resolve({
                            ONLINE: ONLINE,
                            OFFLINE: OFFLINE,
                            NullData: NullData
                        })
                    } else {
                        client.getGatewayStatus(item[index]).then(status=>{
                            if (status === 'ONLINE') {
                                ONLINE.push(item[index])
                            } else if (status === 'OFFLINE') {
                                OFFLINE.push(item[index])
                            } else {
                                NullData.push(item[index])
                            }
                            dataMap(index + 1, item)
                        })
                    }
                }
                dataMap(0, data)
            })
        }
        promise().then(res=>{
            const count = res.ONLINE.concat(res.OFFLINE.concat(res.NullData))
            const status = req.query.status;
            if (status === 'online'){
                queryGateway(0, res.ONLINE)
            } else if (status === 'offline'){
                queryGateway(0, res.OFFLINE)
            } else {
                queryGateway(0, count)
            }
        })
    })
})
// 网关应用更新
app.post('/gateways_upgrade', function(req, respones){
    sendPostAjax('/gateways.upgrade', req.headers, req.body).then(res=>{
        respones.send(res.data)
    }).catch(()=>{
        respones.send(errMessage)
    })
})
// 获取网关列表 结合两条接口
app.get('/gateways_list', function(req, respones){
    const arr = [];
    function getGatewaysList (index, item){
        if (index >= item.length){
            respones.send({message: arr, status: 'OK'})
            return false;
        }
        axios.all(
            [
                http.get(path + '/gateways.read?name=' + item[index], {headers: req.headers}),
                http.get(path + '/gateways.applications.list?gateway=' + item[index], {headers: req.headers}),
                http.get( path + '/gateways.devices.list?gateway=' + item[index], {headers:req.headers})
            ]
        ).then(axios.spread(function (acct, perms, devices) {
            arr.push({data:acct.data.data, app: perms.data, devices: devices.data})
            if(index < item.length){
                getGatewaysList(index + 1, item)
            }
        }));
    }
    axios({
        url: path + '/gateways.list',
        method: 'GET',
        headers: req.headers
    }).then(res=>{
        let data = [];
        const company_devices = res.data.data.company_devices;
        const shared_devices = res.data.data.shared_devices;
        const private_devices = res.data.data.private_devices;
        if (company_devices && company_devices.length > 0 && shared_devices && shared_devices.length > 0){
            data = company_devices[0].devices.concat(private_devices).concat(shared_devices[0].devices)
        } else if (company_devices && company_devices.length > 0 && shared_devices.length <= 0) {
            data = company_devices[0].devices.concat(private_devices)
        } else if (shared_devices && shared_devices.length > 0 && company_devices.length <= 0) {
            data = shared_devices[0].devices.concat(private_devices)
        } else {
            data = private_devices
        }
        getGatewaysList(0, data, req.headers)
    }).catch(err=>{
        respones.send(err)
    })
})
// 查询应用详细信息
app.get('/applications_info', function(req, respones){
    sendGetAjax('/applications.read', req.headers, req.query).then(res=>{
        respones.send(res.data)
    }).catch(()=>{
        respones.send(errMessage)
    })
})
// 删除设备安装应用
app.post('/applications_remove', function(req, respones){
    // console.log(req)
    sendPostAjax('/gateways.applications.remove', req.headers, req.body).then(res=>{
        // console.log(res);
        respones.send(res.data)
    }).catch(err=>{
        // console.log(err)
        respones.send(errMessage)
    })
})
// 增加gateways网关
app.post('/gateways_create', function(req, respones){
    sendPostAjax('/gateways.create', req.headers, req.body).then(res=>{
        console.log(res);
        respones.send(res.data)
    }).catch(err=>{
        console.log(err)
        respones.send(errMessage)
    })
})

app.get('/gateways_applications_list', function (req, response) {
    console.log(req.query)
    sendGetAjax('/gateways.applications.list', req.headers, req.query).then(res=>{
        response.send(res.data)
    })
})

// 获取网关信息
app.get('/gateways_read', function(req, respones){
    sendGetAjax('/gateways.read', req.headers, req.query).then(res=>{
        client.getStatus(req.query.name).then(result=>{
            client.getNetManager(req.query.name).then(data=>{
                const newData = Object.values(data);
                // console.log(newData)
                result.Net_Manager = false;
                result.p2p_vpn = false;
                res.data.data.use_beta = res.data.data.use_beta ? Boolean(res.data.data.use_beta) : false;
                result.data_upload = result.data_upload? Boolean(result.data_upload): false;
                result.stat_upload = result.stat_upload? Boolean(result.stat_upload): false;
                // retult.use_beta = Boolean(retult.use_beta);
                newData.map(item=>{
                    if (item.name === 'network_uci'){
                        result.Net_Manager = true;
                    }
                    if (item.name === 'frpc'){
                        result.p2p_vpn = true;
                    }
                });
                // console.log(result)
                const Obj = Object.assign(result, res.data.data);
                respones.send(Obj)
            })
            
            
        })
        // respones.send(res.data.data)
    })
})
// 获取App列表
app.get('/gateways_app_list', function(req, respones){
    client.getMeta(req.query.gateway)
    const arr = [];
    const name = [];
    function getDevList (){
        return new Promise((resolve, reject)=>{
            const arr = [];
            function getDevicesList (index, item){
                if (index >= item.length){
                    resolve(arr)
                    return false;
                } else {
                    http.get(path + '/gateways.devices.read?gateway=' + req.query.gateway + '&name=' + item[index], {headers:req.headers}).then(res=>{
                        const data = res.data.data;
                        data.meta.sn = item[index];
                        arr.push(data);
                        getDevicesList(index + 1, item, req.headers)
                    })
                }
            }
                sendGetAjax('/gateways.devices.list', req.headers, req.query).then(res=>{
                    getDevicesList(0, res.data.data)
                })
        })
    }
    getDevList().then(DevList=>{
        function getAppList(index, item){
            if(index >= item.length){
                const obj = {};
                DevList.map((item, key)=>{
                    if(!obj[item.meta.app_inst]){
                        obj[item.meta.app_inst] = 1;
                    } else {
                        obj[item.meta.app_inst]++;
                    }
                //    console.log(item.meta, key)
                    // arr.map((value, index)=>{
                        // console.log(item.meta, '-----', value)
                    // })
                })
                arr.map((item, key)=>{
                    item.devs_len = obj[item.device_name]
                    if (!item.devs_len){
                        item.devs_len = 0;
                    }
                })
                respones.send({message: arr, ok: true})
                return false;
            } else {
                name.push(item[index].name)
                axios.all([
                    http.get(path + '/store.read?name=' + item[index].name, req.headers),
                    http.get(path + '/applications.versions.latest?beta=' + req.query.beta + '&app=' + item[index].name, {headers: req.headers})
                ]).then(axios.spread((res, version)=>{
                    if(!res.data.error){
                        item[index].data = res.data;
                        if (item[index].data.data.icon_image !== undefined){
                            item[index].data.data.icon_image = 'http://ioe.thingsroot.com' + item[index].data.data.icon_image;
                        } else {
                            item[index].data.data.icon_image = 'http://ioe.thingsroot.com/assets/app_center/img/logo.png';
                        }
                    }
                    item[index].latestVersion = version.data.data;
                    arr.push(item[index]);
                    getAppList(index + 1, item);
                }))
            }
        }
        sendGetAjax('/gateways.applications.list', req.headers, req.query).then(res=>{
            const data = res.data.data;
            const keys = Object.keys(data)
            const values = Object.values(data)
            // console.log(values)
            values.map((item, key)=>{
              if (item.running){
                  item.status = 'running';
                  item.running = new Date(parseInt(item.running) * 1000).toLocaleString().replace(/:\d{1,2}$/, ' ')
              } else {
                  item.status = 'stoped';
              }
            item.device_name = keys[key];
            })
                getAppList(0, values)
        }).catch(err=>{
            respones.send(err)
        })




        
    })
    
})
// 网关应用更改名称
app.post('/gateways_applications_rename', function(req, respones){
    sendPostAjax('/gateways.applications.rename', req.headers, req.body).then(res=>{
        respones.send(res.data)
    }).catch(err=>{
        respones.send(errMessage)
    })
})
// 网关应用开启
app.post('/gateways_applications_start', function(req, respones){
    sendPostAjax('/gateways.applications.start', req.headers, req.body).then(res=>{
        // console.log(res)
        respones.send(res.data)
    }).catch(err=>{
        console.log(err)
        respones.send(errMessage)
    })
})
// 网关应用关闭
app.post('/gateways_applications_stop', function(req, respones){
    sendPostAjax('/gateways.applications.stop', req.headers, req.body).then(res=>{
        respones.send(res.data)
    }).catch(err=>{
        console.log(err)
        respones.send(errMessage)
    })
})
// 网关应用重启
app.post('/gateways_applications_restart', function(req, respones){
    sendPostAjax('/gateways.applications.restart', req.headers, req.body).then(res=>{
        respones.send(res.data)
    }).catch(()=>{
        respones.send(errMessage)
    })
})
// 查詢應用版本列表
app.get('/applications_versions_list', function(req, respones){
    sendGetAjax('/applications.versions.list', req.headers, req.query).then(res=>{
        respones.send(res.data)
    }).catch(err=>{
        respones.send(errMessage)
    })
})
// 查詢應用最新版本
app.get('/applications_versions_latest', function(req, respones){
    sendGetAjax('/applications.versions.latest?beta=1&app=FreeIOE', req.headers).then(res=>{
        respones.send(res.data)
        console.log(res)
    }).catch(err=>{
        respones.send(errMessage)
    })
})
// 获取网关设备SN
app.get('/gateways_dev_len', function(req, respones){
    sendGetAjax('/gateways.devices.list', req.headers, req.query).then(res=>{
        respones.send(res.data.data);
    }).catch(err=>{
        respones.send(err)
    })
})
// 获取网关采集设备中的实时数据
app.get('/gateways_dev_data', function(req, respones){
    sendGetAjax('/gateways.devices.data', req.headers, req.query).then(res=>{
        respones.send(res.data)
    }).catch(err=>{
        respones.send(errMessage)
    })
})
// 获取网关历史数据
app.get('/gateways_historical_data', function(req, respones){
    // console.log(req.query)
    const obj = req.query;
    client.getInfluxDB(obj.sn).then(index=>{
        let count = '';
        let counts = '';
        if (obj.vt === 'float') {
            count = 'value=' + obj.value_method;
            counts = 'value';
        } else if(obj.vt === 'int') {
            count = 'int_value=' + obj.value_method;
            counts = 'int_value';
        } else {
            count = 'string_value=' + obj.value_method;
            counts = 'string_value';
        }
        // if (obj.value_method === 'raw'){
            InfluxClient.query(index, obj.tag, obj.time_condition +' and "device"!="' + obj.vsn + '"', counts, function(result){
                // console.log(result)
                const arr = result.results[0].series ? result.results[0].series[0].values : [];
                const data = [];
                arr.map(item=>{
                    data.push({
                        name: obj.tag,
                        quality: 0,
                        time: item[0],
                        value: typeof item[1] === 'number' ? item[1] !== null ? item[1].toFixed(2) : 0 : item[1],
                        vsn: obj.sn
                    })
                })
                respones.send({message: data})
            }, obj.group_time_span)
        // } else {
        //     // InfluxClient.queryCount(index, obj.tag, obj.time_condition +' and "device"!="' + obj.vsn + '"', count, function(result){
        //     //     // console.log(result)
        //     //     const arr = result.results[0].series ? result.results[0].series[0].values : [];
        //     //     const data = [];
        //     //     arr.map(item=>{
        //     //         data.push({
        //     //             name: obj.tag,
        //     //             quality: 0,
        //     //             time: item[0],
        //     //             value: item[1] !== null ? item[1].toFixed(2) : 0,
        //     //             vsn: obj.sn
        //     //         })
        //     //     })
        //     //     respones.send({message: data})
        //     // }, obj.group_time_span)
        //     InfluxClient.query(index, obj.tag, obj.time_condition +' and "device"!="' + obj.vsn + '"', counts, function(result){
        //         // console.log(result)
        //         const arr = result.results[0].series ? result.results[0].series[0].values : [];
        //         const data = [];
        //         arr.map(item=>{
        //             data.push({
        //                 name: obj.tag,
        //                 quality: 0,
        //                 time: item[0],
        //                 value: typeof item[1] === 'number' ? item[1] !== null ? item[1].toFixed(2) : 0 : item[1],
        //                 vsn: obj.sn
        //             })
        //         })
        //         respones.send({message: data})
        //     }, obj.group_time_span)
        // }
        
        
    })
})


// 刷新网关应用列表
app.post('/gateways_applications_refresh', function(req, respones){
    sendPostAjax('/gateways.applications.refresh', req.headers, req.body).then(res=>{
        // console.log(res);
        respones.send(res.data)
    }).catch(err=>{
        respones.send(errMessage)
    })
})
// 要求网关上传设备日志
app.post('/gateways_enable_log', function(req, respones){
    sendPostAjax('/gateways.enable_log', req.headers, req.body).then(res=>{
        respones.send(res.data)
    }).catch((err)=>{
        respones.send(errMessage)    
    })
})
// 获取网关设备列表
app.get('/gateways_dev_list', function(req, respones){

    const client = new Influx('http://root:root@172.30.0.187:8086/dongsun.com');
    client.query('app_run_ioe_frpc')
        .where('int_value', 'mean_int_value')
        //.where('mean_quality', 'value')
        .then(function(err, result){
            // console.log(err, result)
        })
    

    const arr = [];
    function getDevicesList (index, item){
        if (index >= item.length){
            respones.send({message: arr, status: 'OK'})
            return false;
        } else {
            http.get(path + '/gateways.devices.read?gateway=' + req.query.gateway + '&name=' + item[index], {headers:req.headers}).then(res=>{
                const data = res.data.data;
                data.meta.sn = item[index];
                arr.push(data);
                getDevicesList(index + 1, item, req.headers)
            })
        }
    }
        sendGetAjax('/gateways.devices.list', req.headers, req.query).then(res=>{
            getDevicesList(0, res.data.data)
        })
})

// 查询beta模式
app.get('/gateways_beta_read', function(req, respones){
    sendGetAjax('/gateways.beta.read', req.headers, req.query).then(res=>{
        respones.send(res.data)
    }).catch(err=>{
        respones.send(errMessage)
    })
})
// 开启数据上送
app.post('/gateways_data_enable', function(req, respones){
    sendPostAjax('/gateways.enable_data', req.headers, req.body).then(res=>{
        respones.send(res.data)
    }).catch(err=>{
        // console.log(err)
        respones.send(errMessage)
    })
})
// 开启beta模式
app.post('/gateways_beta_enable', function(req, respones){
    // console.log(req)
    sendPostAjax('/gateways.beta.enable', req.headers, req.body).then(res=>{
        respones.send(res.data)
        // console.log(res);
    }).catch(err=>{
        // console.log(err)
        respones.send(errMessage)
    })
})
// 網關應用升級
app.post('/gateways_applications_upgrade', function(req, respones){
    sendPostAjax('/gateways.applications.upgrade', req.headers, req.body).then(res=>{
        // console.log(res.data)
        respones.send(res.data)
    }).catch(err=>{
        console.log(err)
        respones.send(errMessage)
    })
})
// 关闭beta模式
app.post('/gateways_beta_disable', function(req, respones){
    sendPostAjax('/gateways.beta.disable', req.headers, req.body).then(res=>{
        respones.send(res.data)
        // console.log(res);
    }).catch(err=>{
        // console.log(err)
        respones.send(errMessage)
    })
})
// 删除网关  未作处理  未测试
app.post('/gateways_remove', function(req, respones){
    sendPostAjax('/gateways.remove', req.headers, req.body).then(res=>{
        respones.send(res.data)
    }).catch(err=>{
        // console.log(err)
        respones.send(errMessage)
    })
})
//获取APP列表 未作处理 未测试
app.get('/store_list', function(req, respones){
    sendGetAjax('/store.list', req.headers).then(res=>{
    // sendGetAjax('/applications.list', req.headers).then(res=>{
        respones.send(res.data)
    }).catch(err=>{
        respones.send(err.data)
    })
})
// 安装APP okokok
app.post('/gateways_applications_install', function(req, response){
    console.log(req.body);
    axios({
        url: path + '/gateways.applications.install',
        method: 'POST',
        data: req.body,
        headers: req.headers
    }).then(res=>{
        response.send({data: res.data, ok: true})
    })
})
app.post('/gateways_applications_remove', function(req, respones){
    sendPostAjax('/gateways.applications.remove', req.headers, req.body).then(res=>{
        respones.send(res.data)
    }).catch(err=>{
        // console.log(err)
        respones.send(errMessage)    
    })
})
// 设置网关应用option
app.post('/gateways_applications_option', function(req, respones){
    sendPostAjax('/gateways.applications.option', req.headers, req.body).then(res=>{
        respones.send(res.data)
    }).catch(err=>{
        respones.send(errMessage)
    })
})
// 删除APP 未做处理 未测试
// app.post('/gateways_applications_remove', function(req, respones){
//     sendPostAjax('/gateways.applications.remove', req.headers, req.body).then(res=>{
//         respones.send(res.data)
//     }).catch(err=>{
        //console.log(err)
//         respones.send(err)
//     })
// })
// 网关操作指令结果查询  接口API没写对 传递参数是id
app.get('/gateways_exec_result', function(req, respones){
    sendGetAjax('/gateways.exec_result', req.headers, req.query).then(res=>{
        // console.log(res);
        respones.send(res.data)
    }).catch(err=>{
        // console.log(err)
        respones.send(errMessage)
    })
})
// 网关信息查询 未做处理 未测试
app.post('/gateways_info', function(req, respones){
    sendPostAjax('/gateways.info', req.headers, req.body).then(res=>{
        respones.send(res.data)
    }).catch(err=>{
        respons.send(err)
    })
})
// 获取应用下的设备数
// app.get('/gateways_app_dev_len', function(req, respones){
//     if (req.query.name){
//         client.getDevLen(req.query.name).then(res=>{
//             respones.send(res);
//         })
//     } else {
//         respones.send(errMessage)
//     }
// })
// 获取  未处理 未测试
app.get('/gateway_devf_data', function(req, respones){
    sendGetAjax('/gateways.devices.data', req.headers, req.query).then(res=>{
        // console.log(res);
        res.data && res.data.length > 0 && res.data.map((item)=>{
                    if (!item.vt){
                        item.vt = 'float'
                    }
                })
        respones.send(res.data);
    })
})
app.get('/store_read', function(req, respones){
    sendGetAjax('/store.read', req.headers, req.query).then(res=>{
        // console.log(res)
        respones.send(res.data)
    })
})
// 修改最小上传等级
app.post('/gateways_enable_event', function(req, respones){
    sendPostAjax('/gateways.enable_event', req.headers, req.body).then(res=>{
        respones.send(res.data)
    }).catch(err=>{
        respones.send(errMessage)
    })
})
// 修改云配置项
app.post('/gateways_cloud_conf', function(req, respones){
    sendPostAjax('/gateways.cloud_conf', req.headers, req.body).then(res=>{
        respones.send(res.data)
    }).catch(err=>{
        respones.send(errMessage)
    })
})
// 开启网关设备上送分析数据
app.post('/gateways_stat_enable', function(req, respones){
    sendPostAjax('/gateways.enable_stat', req.headers, req.body).then(res=>{
        respones.send(res.data)
    }).catch(err=>{
        respones.send(errMessage)
    })
})
// 重启设备
app.post('/gateways_reboot', function(req, respones){
    sendPostAjax('/gateways.reboot', req.headers, req.body).then(res=>{
        respones.send(res.data)
    }).catch(err=>{
        respones.send(errMessage)
    })
})
// 重启FreeIOE(只重启软件)
app.post('/gateways_restart', function(req, respones){
    sendPostAjax('/gateways.restart', req.headers, req.body).then(res=>{
        respones.send(res.data)
    }).catch(err=>{
        respones.send(errMessage)
    })
})

// 设定设备输出项数据

app.post('/gateways_dev_outputs', function(req, respones){
    sendPostAjax('/gateways.devices.output', req.headers, req.body).then(res=>{
        // console.log(res)
        respones.send(res.data);
    }).catch(err=>{
        // console.log(err)
        respones.send(errMessage)
    })
});
app.listen(8881, '127.0.0.1', function(){
    console.log('this port is 8881....')
})    

