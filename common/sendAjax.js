const http = require('./http');
const path = 'http://ioe.thingsroot.com/api/v1';
const errMessage = {error: 'Unknown Error', ok: false}
function sendGetAjax (url, headers, query, response, WhetherToSend){
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
    return new Promise((resolve, reject)=>{
        http.get(pathname, {
            headers
        }).then(res=>{
            response && response.setHeader('set-cookie', res.headers['set-cookie'])
            WhetherToSend && response.send(res.data)
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
        http.post(path + url, {
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
module.exports = {sendGetAjax, sendPostAjax, errMessage, path}