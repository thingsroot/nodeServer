const express = require('express');
const app = express.Router();
const InfluxClient = require('./influx');
const client = require('./redis');
const axios = require('axios');
const http = require('../common/http');
const {sendGetAjax, sendPostAjax, errMessage} = require('../common/sendAjax');
const {path} = require('../config/env');
// 修改最小上传等级
app.post('/gateways_enable_event', function(req, response){
    sendPostAjax('/gateways.enable_event', req.headers, req.body, response, true)
})
// 修改云配置项
app.post('/gateways_cloud_conf', function(req, response){
    sendPostAjax('/gateways.cloud_conf', req.headers, req.body, response, true)
})
// 开启网关设备上送分析数据
app.post('/gateways_stat_enable', function(req, response){
    sendPostAjax('/gateways.enable_stat', req.headers, req.body, response, true)
})
// 重启设备
app.post('/gateways_reboot', function(req, response){
    sendPostAjax('/gateways.reboot', req.headers, req.body, response, true)
})
// 重启FreeIOE(只重启软件)
app.post('/gateways_restart', function(req, response){
    sendPostAjax('/gateways.restart', req.headers, req.body, response, true)
})

// 设定设备输出项数据
app.post('/gateways_dev_outputs', function(req, response){
    sendPostAjax('/gateways.devices.output', req.headers, req.body, response, true)
});

// 发送设备控制指令
app.post('/gateways_dev_commands', function(req, response){
    sendPostAjax('/gateways.devices.command', req.headers, req.body, response, true)
});
// 安装APP okokok
app.post('/gateways_applications_install', function(req, response){
    sendPostAjax('/gateways.applications.install', req.headers, req.body, response, true)
})
app.post('/gateways_applications_remove', function(req, response){
    sendPostAjax('/gateways.applications.remove', req.headers, req.body, response, true)
})
// 设置网关应用option
app.post('/gateways_applications_option', function(req, response){
    sendPostAjax('/gateways.applications.option', req.headers, req.body, response, true)
})
// 网关操作指令结果查询  接口API没写对 传递参数是id
app.get('/gateways_exec_result', function(req, response){
    sendGetAjax('/gateways.exec_result', req.headers, req.query, response, true)
})
// 网关信息查询
app.post('/gateways_info', function(req, response){
    sendPostAjax('/gateways.info', req.headers, req.body, response, true)
})
// 获取
app.get('/gateway_devf_data', function(req, response){
    sendGetAjax('/gateways.devices.data', req.headers, req.query, response).then(res=>{
        res.data && res.data.length > 0 && res.data.map((item)=>{
                    if (!item.vt){
                        item.vt = 'float'
                    }
                })
        response.send(res.data);
    }).catch(()=>{
        response.send(errMessage)
    })
})
// 获取网关设备SN
app.get('/gateways_devices_list', function(req, response){
    sendGetAjax('/gateways.devices.list', req.headers, req.query, response, true)
})
// 获取网关采集设备中的实时数据
app.get('/gateways_dev_data', function(req, response){
    sendGetAjax('/gateways.devices.data', req.headers, req.query, response, true)
})
// 获取网关历史数据
app.get('/gateways_historical_data', function(req, response){
	// FIXME: Check gateway permission before read history data
    const obj = req.query;
    client.getInfluxDB(obj.sn).then(index=>{
        let field = '';
        if (obj.vt === 'string') {
            field = 'string_value';
        } else if(obj.vt === 'int') {
            field = 'int_value';
        } else {
            field = 'value';
        }
		let func = obj.value_method && obj.value_method !== 'raw' ? obj.value_method : undefined
		let group_time = func ? `time(${obj.group_time_span})` : undefined
		let conditions = {
			device: obj.vsn,
		}
		let set = {
			start: obj.start,
		}
		if (obj.end !== undefined) {
			set['end'] = obj.end
		} else {
			set['end'] = '-0m' /* In case there is any timestamp bigger than real time */
		}
		InfluxClient.query(index, obj.tag, func, field, conditions, group_time, set, function(result){
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
			response.send({data: data, ok: true})
		})
    }).catch(()=>{
        response.send(errMessage)
    })
})
// 刷新网关应用列表
app.post('/gateways_applications_refresh', function(req, response){
    sendPostAjax('/gateways.applications.refresh', req.headers, req.body, response, true)
})
// 要求网关上传设备日志
app.post('/gateways_enable_log', function(req, response){
    sendPostAjax('/gateways.enable_log', req.headers, req.body, response, true)
})
// 要求网关上传设备报文
app.post('/gateways_enable_comm', function(req, response){
    sendPostAjax('/gateways.enable_comm', req.headers, req.body, response, true)
})
// 获取网关设备列表
app.get('/gateways_dev_list', function(req, response){
    const arr = [];
    function getDevicesList (index, item){
        if (index >= item.length){
            response.send({data: arr, ok: true})
            return false;
        } else {
            http.get(path + '/gateways.devices.read?gateway=' + req.query.gateway + '&name=' + item[index], {headers:req.headers}).then(res=>{
				response.setHeader('set-cookie', res.headers['set-cookie'])
                const data = res.data.data;
                data.meta.sn = item[index];
                arr.push(data);
                getDevicesList(index + 1, item, req.headers)
            }).catch(()=>{
                response.send(errMessage)
            })
        }
    }
        sendGetAjax('/gateways.devices.list', req.headers, req.query).then(res=>{
			response.setHeader('set-cookie', res.headers['set-cookie'])
            if (res.data.data){
                getDevicesList(0, res.data.data)
            } else {
                response.send({data: [], ok: true})
            }
        }).catch(()=>{
            response.send(errMessage)
        })
})

// 查询beta模式
app.get('/gateways_beta_read', function(req, response){
    sendGetAjax('/gateways.beta.read', req.headers, req.query, response, true)
})
// 开启数据上送
app.post('/gateways_data_enable', function(req, response){
    sendPostAjax('/gateways.enable_data', req.headers, req.body, response, true)
})
// 数据临时上送
app.post('/gateways_enable_data_one_short', function(req, response){
	sendPostAjax('/gateways.enable_data_one_short', req.headers, req.body, response, true)

})
// 数据快照
app.post('/gateways_data_snapshot', function(req, response){
	sendPostAjax('/gateways.data_snapshot', req.headers, req.body, response, true)
})
// 数据缓存刷新
app.post('/gateways_data_flush', function(req, response){
	sendPostAjax('/gateways.data_flush', req.headers, req.body, response, true)

})
// 开启beta模式
app.post('/gateways_beta_enable', function(req, response){
    sendPostAjax('/gateways.beta.enable', req.headers, req.body, response, true)
})
// 網關應用升級
app.post('/gateways_applications_upgrade', function(req, response){
    sendPostAjax('/gateways.applications.upgrade', req.headers, req.body, response, true)
})
// 关闭beta模式
app.post('/gateways_beta_disable', function(req, response){
    sendPostAjax('/gateways.beta.disable', req.headers, req.body, response, true)
})
// 删除网关  未作处理  未测试
app.post('/gateways_remove', function(req, response){
    sendPostAjax('/gateways.remove', req.headers, req.body, response, true)
})
// 增加gateways网关
app.post('/gateways_create', function(req, response){
    sendPostAjax('/gateways.create', req.headers, req.body, response, true)
})
app.get('/gateways_applications_list', function (req, response) {
    sendGetAjax('/gateways.applications.list', req.headers, req.query, response, true)
})
// 获取网关信息
app.get('/gateways_read', function(req, response){
    sendGetAjax('/gateways.read', req.headers, req.query).then(res=>{
		response.setHeader('set-cookie', res.headers['set-cookie'])
		if (!res.data.ok) {
			response.send(res.data)
			return
		}

		let result_data = res.data.data;
		result_data.use_beta = result_data.use_beta ? Boolean(result_data.use_beta) : false;
		result_data.ioe_network = false;
		result_data.ioe_frpc = false;

        client.getStatus(req.query.name).then(result=>{
			result.data_upload = result.data_upload? Boolean(result.data_upload): false;
			result.stat_upload = result.stat_upload? Boolean(result.stat_upload): false;

            client.getNetManager(req.query.name).then(data=>{
				for (let [inst_name, inst_data] of Object.entries(data)) {
					if (inst_name === 'ioe_frpc' && inst_data.name === 'frpc') {
                        result_data.ioe_frpc = true;
					}
					if (inst_name === 'ioe_network' && inst_data.name === 'network_uci') {
                        result_data.ioe_network = true;
					}

				}
                response.send({ok: true, data: Object.assign(result_data, {data: result})})
            }).catch(()=>{
                response.send(errMessage)
            })
        }).catch(()=>{
            response.send(errMessage)
        })
    }).catch(()=>{
        response.send(errMessage)
    })
})
// 获取应用最新版本号
app.get('/gateways_app_version_latest', function(req, response){
    sendGetAjax('/applications.versions.latest', req.headers, req.query, response, true)
})
// 获取网关临时共享列表
app.get('/gateways_shares_list', function(req, response){
    sendGetAjax('/gateways.shares.list', req.headers, req.query, response, true)
})
// 新建网关临时共享
app.post('/gateways_shares_create', function(req, response){
    sendPostAjax('/gateways.shares.create', req.headers, req.body, response, true)
})
// 新建网关临时共享
app.post('/gateways_shares_update', function(req, response){
    sendPostAjax('/gateways.shares.update', req.headers, req.body, response, true)
})
// 删除网关临时共享
app.post('/gateways_shares_remove', function(req, response){
    sendPostAjax('/gateways.shares.remove', req.headers, req.body, response, true)
})
// 查询网关信息
app.get('/gateways_info_read', function(req, response){
    sendGetAjax('/gateways.read', req.headers, req.query, response, true)
})
// 获取App列表
app.get('/gateways_app_list', function(req, response){
    client.getMeta(req.query.gateway)
    const arr = [];
    const name = [];
    function getDevList (){
        return new Promise((resolve, reject)=>{
            const arr = [];
            function getDevicesList (index, item){
                if (item && index >= item.length){
                    resolve(arr)
                    return false;
                } else {
                    http.get(path + '/gateways.devices.read?gateway=' + req.query.gateway + '&name=' + item[index], {headers:req.headers}).then(res=>{
						response.setHeader('set-cookie', res.headers['set-cookie'])
						if (res.data.ok) {
							const data = res.data.data;
							data.meta.sn = item[index];
							arr.push(data);
							getDevicesList(index + 1, item, req.headers)
						}
                    }).catch(err=>{
                        reject(err)
                    })
                }
            }
                sendGetAjax('/gateways.devices.list', req.headers, req.query).then(res=>{
					response.setHeader('set-cookie', res.headers['set-cookie'])
                    if (res.data.data){
                        getDevicesList(0, res.data.data)
                    } else {
                        response.send(errMessage)
                    }
                }).catch(()=>{
                    response.send(errMessage)
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
                })
                arr.map((item, key)=>{
                    item.devs_len = obj[item.inst_name]
                    if (!item.devs_len){
                        item.devs_len = 0;
                    }
                })
                response.send({data: arr, ok: true})
                return false;
            } else {
                name.push(item[index].name)
                axios.all([
                    http.get(path + '/store.read?name=' + item[index].name, req.headers),
                    http.get(path + '/applications.versions.latest?beta=' + req.query.beta + '&app=' + item[index].name, {headers: req.headers}),
                    http.get(path + '/applications.versions.beta?app=' + item[index].name + '&version=' + item[index].version, {headers: req.headers})
                ]).then(axios.spread((res, version, beta)=>{
                    if(res.data.ok){
                        item[index].data = res.data.data;
                        if (item[index].data.icon_image !== undefined){
                            item[index].data.icon_image = item[index].data.icon_image;
                        } else {
                            item[index].data.icon_image = '/assets/app_center/img/logo.png';
                        }
                    }
					if (version.data.ok) {
						item[index].latestVersion = version.data.data;
					}
					if (beta.data.ok) {
						item[index].beta = beta.data.data
					}
                    arr.push(item[index]);
                    getAppList(index + 1, item);
                })).catch(()=>{
                    response.send(errMessage)
                })
            }
        }
        sendGetAjax('/gateways.applications.list', req.headers, req.query).then(res=>{
            response.setHeader('set-cookie', res.headers['set-cookie'])
			if (res.data.ok) {
				const data = res.data.data;
				const keys = Object.keys(data)
				const values = Object.values(data)
				values.map((item, key)=>{
					if (item.running){
						item.status = 'running';
					} else {
						item.status = 'stoped';
					}
					item.inst_name = keys[key];
				})
				getAppList(0, values)
			} else {
				response.send(res.data)
			}
        }).catch(err=>{
            response.send(errMessage)
        })
    }).catch(()=>{
        response.send(errMessage)
    })
    
})
// 网关应用更改名称
app.post('/gateways_applications_rename', function(req, response){
    sendPostAjax('/gateways.applications.rename', req.headers, req.body, response, true)
})
// 网关应用开启
app.post('/gateways_applications_start', function(req, response){
    sendPostAjax('/gateways.applications.start', req.headers, req.body, response, true)
})
// 网关应用配置
app.post('/gateways_applications_conf', function(req, response){
    sendPostAjax('/gateways.applications.conf', req.headers, req.body, response, true)
})
// 网关应用关闭
app.post('/gateways_applications_stop', function(req, response){
    sendPostAjax('/gateways.applications.stop', req.headers, req.body, response, true)
})
// 网关应用重启
app.post('/gateways_applications_restart', function(req, response){
    sendPostAjax('/gateways.applications.restart', req.headers, req.body, response, true)
})
// 更新网关信息
app.post('/gateways_update', function(req, response){
    sendPostAjax('/gateways.update', req.headers, req.body, response, true)
})
// influxdb 获取在线Ip记录
app.get('/gateway_online_record', function(req, response){
	const client = InfluxClient.getClient('gates_trace');
    client.query(req.query.type)
        // .where(' and "device"="' + req.query.sn + '"')
        .where('time > now() - 7d ')
        .where('iot', req.query.sn)
        .addFunction('ipaddr')
        .then(res=>{
        if (res.results[0].series) {
            response.send({data: res.results[0].series[0].values, ok: true})
        } else {
            response.send({data: [], ok: false})
        }
    }).catch(()=>{
        response.send(errMessage)
    })
})
// redis获取网关列表
app.get('/gateways_list', function(req, response){
    const arr = [];
    let cookie = [];
    function queryGateway (index, item, shared) {
        if (index >= item.length){
            response.setHeader('set-cookie', cookie)
            response.send({data: arr, ok: true})
        } else {
            http.get(path + '/gateways.read?name=' + escape(item[index]), {headers: req.headers}).then(res=>{
				response.setHeader('set-cookie', res.headers['set-cookie'])
				if (res.data.ok) {
					let data = res.data.data;
					if (shared && shared.indexOf(item[index]) >= 0) {
						data['is_shared'] = true
					}
					client.getDevLen(item[index]).then(DevLen=>{
						data.device_devs_num = DevLen;
						client.getAppLen(item[index]).then(AppLen=>{
							data.device_apps_num = AppLen;
							data.last_updated = data.modified.slice(0, -7)
							arr.push(data)
							queryGateway(index + 1, item, shared)
						}).catch(()=>{
                            response.send(errMessage)
                        })
					}).catch(()=>{
                        response.send(errMessage)
                    })
				} else {
					queryGateway(index + 1, item, shared)
				}
            }).catch(()=>{
                response.send(errMessage)
            })
        }
    }
    sendGetAjax('/gateways.list', req.headers).then(res=>{
        if (!res.data.ok) {
            response.setHeader('set-cookie', res.headers['set-cookie'])
            response.send(errMessage)
            return false;
        }
        cookie = res.headers['set-cookie']
        let data = [];
        const company_devices = res.data.data.company_devices ? res.data.data.company_devices : null;
        const shared_devices = res.data.data.shared_devices;
        const private_devices = res.data.data.private_devices;
		data = private_devices ? private_devices : [];
		let shared = []
		for (let group of shared_devices) {
			data = data.concat(group.devices)
			shared = shared.concat(group.devices)
		}
		for (let group of company_devices) {
			data = data.concat(group.devices)
		}
            
        function promise () {
            const ONLINE = [];
            const OFFLINE = [];
            const NullData = [];
            return new Promise((resolve, reject)=>{
                function dataMap (index, item) {
                    if (index >= item.length) {
                        if (true){
                            resolve({
                                ONLINE: ONLINE,
                                OFFLINE: OFFLINE,
                                NullData: NullData
                            })
                        } else {
                            reject(null)
                        }
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
                        }).catch(()=>{
                            response.send(errMessage)
                        })
                    }
                }
                dataMap(0, data)
            })
        }
        promise().then(res=>{
            const all = res.ONLINE.concat(res.OFFLINE.concat(res.NullData))
            const status = req.query.status;
            if (status === 'online'){
                queryGateway(0, res.ONLINE, shared)
            } else if (status === 'offline'){
                queryGateway(0, res.OFFLINE, shared)
            } else {
                queryGateway(0, all, shared)
            }
        }).catch(()=>{
            response.send(errMessage)
        })
    }).catch(()=>{
        response.send(errMessage)
    })
})
// 网关应用更新
app.post('/gateways_upgrade', function(req, response){
    sendPostAjax('/gateways.upgrade', req.headers, req.body, response, true)
})
module.exports = app;