const http = require('./http');
const path = 'http://ioe.thingsroot.com/api/v1';
const errMessage = {error: 'Unknown Error', ok: false}
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
module.exports = {sendGetAjax, sendPostAjax, errMessage, path}