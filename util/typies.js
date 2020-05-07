const types = ['String', 'Number', 'Boolean', 'Undefined', 'Null', 'Object', 'Array', 'Function', 'Set', 'Map', 'RegExp', 'Symbol'];


let objs = {};

types.forEach(type => {
    objs[`[object ${type}]`] = type;
});

const toString = Object.prototype.toString;

function type(value) {
    const result = toString.call(value);
    return objs[result];
}

//
type.is = (current, target) => {
    if (type(target) !== 'String') {
        return new Error('type.is() second argument type must be String');
    }
    //
    return type(current) === (target.slice(0, 1).toUpperCase() + target.slice(1).toLowerCase());
};

// 检查数据类型。
module.exports = type;
