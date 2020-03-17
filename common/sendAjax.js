const http = require('./http');
const config = require('../config/env')
const errMessage = {error: 'Unknown Error', ok: false}
function sendGetAjax (url, headers, query, response, WhetherToSend){
    let pathname = ''; 
    if (query){
        let str = '';
        const name = Object.keys(query);
        if (name.length === 0) {
            pathname = config.path + url;
        } else {
            const querys = Object.values(query);
            name.map((item, key)=>{
                key === 0 ? str += (item + '=' + querys[key]) : str += ('&' + item + '=' + querys[key])
            })
            pathname = config.path + url + '?' + str;
        }
    } else {
        pathname = config.path + url;
    }
    return new Promise((resolve, reject)=>{
        http.get(pathname, {
            headers
        }).then(res=>{
            response && response.setHeader('set-cookie', res.headers['set-cookie'])
            // console.log(response, 'response')
            WhetherToSend && response.send(res.data)
            // console.log(response.send, 'send')
            resolve(res)
        }).catch(err=>{
            WhetherToSend && response.send(errMessage)
            reject(err)
        })
    })
}
// 封装ajax post方式
function sendPostAjax (url, headers, body, response, WhetherToSend){
    return new Promise((resolve, reject)=>{
        http.post(config.path + url, {
            headers: headers,
            data: body
        }) .then(res=>{
            response && response.setHeader('set-cookie', res.headers['set-cookie'])
            WhetherToSend && response.send(res.data)
            resolve(res)
        }).catch(err=>{
            WhetherToSend && response.send(errMessage)
            reject(err)
        })
    })
}
module.exports = {sendGetAjax, sendPostAjax, errMessage}