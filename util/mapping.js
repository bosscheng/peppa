const path = require('path');
const fs = require('fs');
const extend = require('extend');
const Type = require('./typies');

const reg = /\.js$/;

// load files
function load(filePath) {

    let obj = require(filePath);

    //
    if (!Type.is(obj, 'object')) {
        obj = {};
    }
    return obj;
}

// mapping dir path
function mappings(dirPath) {
    //
    if (!fs.existsSync(dirPath)) {
        return;
    }

    // 读取 dir 目录
    return fs.readdirSync(dirPath).reduce((stack, fileName) => {
        // file path
        let filePath = path.join(dirPath, fileName);

        let stat = fs.statSync(filePath);
        // 是否是js 文件
        if (stat.isFile() && reg.test(filePath)) {
            stack.push(load(filePath));
        }
        // 如果是目录 就继续
        if (stat.isDirectory()) {
            // mapping
            stack.push(...mappings(filePath));
        }

        return stack;
    }, []);

}

module.exports = function (dirPath) {
    return extend(true, {}, ...mappings(dirPath));
};
