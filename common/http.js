const axios = require('axios');
const http = {};
axios.defaults.withCredentials=true;
axios.interceptors.response.use(config => {
    // console.log(config.config.headers.cookie)
    http.cookie  = config.headers['set-cookie'].join();
    
    // const cookie  = config.config.headers.cookie;
    // const cookie = config.headers['set-cookie'];
    // console.log(cookie)
    // const obj = {};
    // if (cookie && cookie.length > 0){
    //     cookie.map((item)=>{
    //         if (item.indexOf('sid=') !== 1){
    //             obj.sid = item.split(';')[0]
    //             console.log(item.indexOf('sid=Guest'))
    //         }
    //     })
    // }
    // console.log(obj)
    // // const arr = cookie.split(';');
    // // let obj = {};
    // // arr.map(item=>{
    // //   obj[item.split('=')[0].trim()] = item.split('=')[1];
    // // })
    // // console.log(obj)
    // console.log(config)
    // config.headers.common['auto_token'] = _getCookie('auto_token');
    // config.headers.common['full_name'] = _getCookie('full_name');
    // config.headers.common['sid'] = _getCookie('sid');
    // config.headers.common['system'] = _getCookie('system');
    // config.headers.common['user_id'] = _getCookie('user_id');
    // config.headers.common['user_image'] = _getCookie('user_image');
    return config;
  });
http.get = async (url, option)=>{
    return new Promise((resolve, reject)=>{
         axios(url, {
            method: 'GET',
            data: option.data || '',
            headers: option.headers || {
                Accept: 'application/json; charset=utf-8',
                'Content-Type': 'application/json; charset=utf-8',
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
            headers:option.headers || {
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