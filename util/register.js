let buffer = {};
const index = 65536;


function unique(obj) {
    let stack = [];
    let target = {};
    const keys = Object.keys(obj);
    if (keys.length > 1) {
        keys.sort((a, b) => {
            return obj[a].index - obj[b].index;
        });
    }

    //
    keys.forEach(key => {
        // 第一层
        let arr = Array.isArray(obj[key].path) ? Array.from(new Set(obj[key].path)) : obj[key].path;
        if (!arr.length) {
            return;
        }
        let lArr = [];
        let rArr = [];

        // 第二层
        for (let str of arr) {
            if (/\?\?/.test(str)) {
                const dir = str.split('??')[0];
                str = str.replace(/\?\?/g, '');
                str.split(',').map((s, i) => {
                    if (i !== 0) {
                        s = dir + s;
                    }
                    !~stack.indexOf(s) && rArr.push(s);
                });
            } else {
                !~stack.indexOf(str) && lArr.push(str);
            }
        }

        // 第三层
        arr = Array.from(new Set(lArr.concat(rArr)));
        if (!arr.length) {
            return;
        }

        stack = stack.concat(arr);

        obj[key].path = arr;
        target[key] = obj[key];
    });

    return target;
}

function reset(current, target) {
    for(const obj of current){

    }
}

function clear(id, type) {

}

function set(id, type, ...opts) {

}

function get(id, type) {

}

module.exports = {
    clear,
    set,
    get
};
