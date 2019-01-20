const path = require('path');
const fs = require('fs');
const extend = require('extend');
const Type = require('./typies');

const reg = /\.js$/;

function load(filePath) {
    let obj = require(filePath);
    if (!Type.is(obj, 'object')) {
        obj = {};
    }
    return obj;
}


// mapping dir path
function mappings(dirPath) {
    if (!fs.existsSync(dirPath)) {
        return;
    }

    return fs.readdirSync(dirPath).reduce((stack, fileName) => {
        let filePath = path.join(dirPath, fileName);
        let stat = fs.statSync(filePath);

        if (stat.isFile() && reg.test(filePath)) {
            stack.push(load(filePath));
        }
        if (stat.isDirectory()) {
            // 递归进去查找
            stack.push(...mappings(filePath));
        }

        return stack;
    }, []);

}

module.exports = function (dirPath) {
    return extend(true, {}, ...mappings(dirPath));
};
