const axios = require('axios');
const http = {};
http.get = (url, option)=>{
    return new Promise((resolve, reject)=>{
         axios(url, {
            method: 'GET',
            data: option.data || '',
            headers: option.headers || {
                Accept: 'application/json; charset=utf-8',
                'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
                'dataType': 'json'
            }
        }).then((res)=>{
            resolve(res)
        }).catch((error)=>{
            reject(error)
        })
    })
}
http.post = async (url, option)=>{
    return new Promise((resolve, reject) => {
        axios(url, {
            method: 'POST',
            data: JSON.stringify(option.data) || '',
            headers:option.headrs || {
                Accept: 'application/json; charset=utf-8',
                'Content-Type': 'application/json; charset=utf-8',
                'dataType': 'json'
            }
        }).then((res) => {
            resolve(res)
        }, err=>{
            reject(err)
        })
    })
}


module.exports = http;