const Type = require('./typies');

let cache = {};
let deadline = {};

function ensureObject(o, key) {
    if (!o[key]) {
        o[key] = Object.create(null);
    }
}

const handle = {
    set(type, key, value, opts) {
        switch (arguments.length) {
            case 2:
                cache[type] = key;
                break;
            case 3:
                ensureObject(cache, type);
                if (Type.is(value, 'object')) {
                    if (value.expires) {
                        cache[type] = key;
                        this.setExpires(type, key, value.expires);
                    } else {
                        ensureObject(cache[type], key);
                        cache[type][key] = value;
                    }
                } else {
                    ensureObject(cache[type], key);
                    cache[type][key] = value;
                }
                break;
            case 4:
                ensureObject(cache, type);
                ensureObject(cache[type], key);
                cache[type][key] = value;
                if (opts.expires) {
                    this.setExpires(type, key, opts.expires);
                }
                break;
        }
    },
    get(type, key) {
        function _get(cache, deadline, key) {
            if (deadline && deadline[type] < +(new Date())) {
                if (cache) {
                    delete cache[key];
                }
                delete deadline[key];
                return null;
            } else {
                return cache && cache[key];
            }
        }

        return key ? _get(cache[type], deadline[type], key) : _get(cache, deadline, type);
    },
    // expires
    setExpires(type, key, maxAge) {
        switch (arguments.length) {
            case 1:
                deadline[type] = +(new Date()) + key * 1000;
                break;
            case 2:
                ensureObject(deadline, type);
                deadline[type][key] = +(new Date()) + maxAge * 1000;
                break;
        }
    }
};


module.exports = Object.freeze(handle);
