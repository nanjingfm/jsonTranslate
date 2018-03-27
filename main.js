const fs = require('fs');
const _ = require('lodash')
const md5 = require('md5');
const rp = require('request-promise');
const translate = require('translate-api');

let file = "1.json";
let outfile = "2.json";
let source = JSON.parse(fs.readFileSync(file));

let baiduAcount = {
    appid: '201803139984',
    secret: 'HBszn4agRosg5'
};

let fetchObject = async function(source) {
    let dest = _.clone(source);
    for (let index in source) {
        if ( typeof source[index] == 'object') {
            dest[index] = await fetchObject(source[index]);
        } else {
            dest[index] = await fanyi(source[index]);
        }
    }
    console.log(dest);
    return dest
}

var fanyi = async function(content) {
    return await baiduFanyi(content);
    // return await googleFanyi(content);
}

var baiduFanyi = async function(content, callback) {
    content = content.toString('utf-8');
    let salt = Date.parse(new Date());
    let sign = md5(baiduAcount.appid + '' + content + salt + baiduAcount.secret);
    let result = await rp({
        uri: 'http://api.fanyi.baidu.com/api/trans/vip/translate',
        qs: {
            from: 'zh',
            to: 'cht',
            q: content,
            appid: baiduAcount.appid,
            salt: salt,
            sign: sign,
        },
        json: true // Automatically parses the JSON string in the response
    })
    return result['trans_result'][0]['dst']
}

var googleFanyi = async function(content) {
    return await translate.getText(content,{to: 'zh-TW'});
}

fetchObject(source).then((result) => {
    fs.writeFileSync(outfile, JSON.stringify(result));

    console.log("==============-> 完毕 <-===============");
})