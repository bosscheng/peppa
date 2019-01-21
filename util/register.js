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
    for (const obj of current) {
        if (typeof obj === 'string') {
            target['default'].path.push(obj);
        } else if (Object.prototype.toString.call(obj) === '[object Object]') {
            if (obj.hasOwnProperty('path')) {
                if (obj.hasOwnProperty('type')) {
                    if (!target.hasOwnProperty(obj.type)) target[obj.type] = {
                        index: index,
                        path: []
                    };
                    if (obj.hasOwnProperty('index')) target[obj.type].index = obj.index;
                    target[obj.type].path = target[obj.type].path.concat(obj.path);
                } else {
                    target['default'].path = target['default'].path.concat(obj.path);
                }
            }
        }
    }
}

function clear(id, type) {

    if (!id && !type) {
        return;
    }
    if (!type && buffer.hasOwnProperty(id)) return delete buffer[id];
    if (type && buffer.hasOwnProperty(id)) return delete buffer[id][type];
}

function set(id, type, ...opts) {
    if (!buffer[id]) buffer[id] = {};
    if (!buffer[id][type]) buffer[id][type] = {};
    if (!buffer[id][type]['default']) buffer[id][type]['default'] = {
        index: index,
        path: []
    };
    reset(opts, buffer[id][type]);
}

function get(id, type) {
    if (!buffer[id] || !buffer[id][type]) return '';
    return unique(buffer[id][type]) || '';
}

module.exports = {
    clear,
    set,
    get
};
