// 还是依赖 request 请求模块
const utils = require('util');
const stealthyRequest = require('stealthy-require');
const isFunction = require('lodash/isFunction');
const isObjectLike = require('lodash/isObjectLike');

try {
    // require.cache
    // 被引入的模块会换成在这个对象中。从此对象中删除键值对会导致下一次的requre 重新加载被删除的模块。
    var requet = stealthyRequest(require.cache, function () {
        return require('request');
    }, function () {
        require('tough-cookie');
    }, module)
} catch (e) {
    /* istanbul ignore next */
    var EOL = require('os').EOL;
    /* istanbul ignore next */
    console.error(EOL + '###' + EOL + '### The "request" library is not installed automatically anymore.' + EOL + '### But required by "request-morelog".' + EOL + '###' + EOL + '### npm install request --save' + EOL + '###' + EOL);
    /* istanbul ignore next */
    throw err;
}


//
let originalInit = requet.Request.prototype.init;


requet.Request.prototype.init = function RP$initInterceptor(requestOptions) {

    if (isObjectLike(requestOptions) && !this._callback) {
        let {callback: _rp_callbackOrig, uri} = requestOptions;
        requestOptions.callback = this.callback = function RP$callback(err, response, body) {
            if (err) {
                err.uri = uri
            }
            if (isFunction(_rp_callbackOrig)) {
                if (_rp_callbackOrig.length > 3) {
                    let args = Array.prototype.slice.apply(arguments);
                    try {
                        let jsonp = /([^\(\)]+)\(.+\)/.exec(body)
                        if (jsonp) {
                            eval("var " + jsonp[1].trim() + "=v=>args.push(v);" + body)
                        } else
                            args.push(JSON.parse(body))
                    } catch (e) {
                        console.error(e);
                    }
                    _rp_callbackOrig.apply(requestOptions, args);
                } else {
                    _rp_callbackOrig.apply(requestOptions, arguments); // TODO: Apply to self mimics behavior of request@2
                }
            }
        };

    }


    return originalInit.apply(this, arguments);
};

module.exports = requet;
