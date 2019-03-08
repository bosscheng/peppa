let cache = {};

function now() {
    return (new Date()).getTime();
}

let debug = false;
// hit count
let hitCount = 0;
// miss count
let missCount = 0;

let size = 0;

function noop() {
}


function put(options) {
    options = options || {};

    if (debug) {
        console.log(`caching: ${options.key} = ${options.value},time: ${options.time}`);
    }

    let _key = options.key || '';
    let _value = options.value || '';

    if (!(_key && _value)) {
        return false;
    }

    let _timeout = options.timeout;
    let _timeoutCallback = options.timeoutCallback || noop;


    let oldOne = cache[_key];
    if (oldOne) {
        clearTimeout(oldOne.timeout);
    } else {
        size++;
    }

    let expire = _timeout + now();
    let record = {
        value: _value,
        expire: expire
    };

    if (!isNaN(expire)) {
        let timeout = setTimeout(function () {
            del(_key);
            if (typeof _timeoutCallback === 'function') {
                _timeoutCallback(options.key);
            }
        }, _timeout);
        record.timeout = timeout;
    }

    cache[_key] = record;
}

function del(key) {
    let canDel = true;
    let oldOne = cache[key];
    if (oldOne) {
        clearTimeout(oldOne.timeout);
        // 已经过期的数据
        if (!isNaN(oldOne.expire) && oldOne.expire < now()) {
            canDel = false;
        }
    } else {
        canDel = false;
    }

    if (canDel) {
        size--;
        delete cache[key]
    }

    return canDel;
}

function clear() {
    Object.keys(cache).forEach(key => {
        let oldOne = cache[key];
        if (oldOne) {
            clearTimeout(oldOne.timeout);
        }
    });

    size = 0;
    cache = {};
    if (debug) {
        hitCount = 0;
        missCount = 0;
    }
}

function get(key) {
    if (!key) {
        return null;
    }

    let record = cache[key];

    if (typeof record !== 'undefined') {

        if (isNaN(record.expire) || record.expire >= now()) {
            if (debug) {
                hitCount++;
            }
            return record.value;
        } else {
            if (debug) {
                missCount++;
            }
            size--;
            delete cache[key];
        }
    }

    //
    if (debug) {
        missCount++;
    }

    return null;
}

function size() {
    return size;
}

function memsize() {
    let size = 0;
    Object.keys(cache).forEach(key => {
        if (cache.hasOwnProperty(key)) {
            size++;
        }
    });
    return size;
}

function debug(flag) {
    debug = flag;
}

function hits() {
    return hitCount;
}

function misses() {
    return missCount;
}

//
function keys() {
    return Object.keys(cache);
}

module.exports = {
    put,
    del,
    clear,
    get,
    size,
    memsize,
    debug,
    hits,
    misses,
    keys
};
