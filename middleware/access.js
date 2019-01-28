const onFinished = require('on-finished');

// 主要借助于 onfinished 插件 来 异步的实现，监听整个请求-响应所消耗的事件。
module.exports = (options = {}) => {

    //
    return async (ctx, next) => {
        //
        const startDate = +(new Date());
        //
        onFinished(ctx.res, err => {
            if (err) {
                return ctx.throw(500, err);
            }
            const time = +(new Date()) - startDate + 'ms';

            const opts = {
                'hostname': ctx.request.hostname,
                'remote-addr': ctx.ip || ctx.ips[0] || ctx.req.connection.remoteAddress,
                'method': ctx.req.method,
                'url': ctx.req.url,
                'status': ctx.status,
                'response-time': time,
                'http-version': ctx.req.httpVersion,
                'user-agent': ctx.req.headers['user-agent']
            };

            opts['remote-addr'] = opts['remote-addr'].replace('::ffff:', '');

            console.log(JSON.stringify(opts));
        });
        return await next();
    }

};
