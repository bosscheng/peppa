const isDev = process.env.NODE_ENV === 'development';


// error handle middleware
// 1. not found
// 2. code error
// 3. 500 exception
module.exports = (options = {}) => {
    if (!options.v404 || (isDev && !options.v500)) {
        throw 'exception middleware need v500 and v404 options';
    }
    let msg = null;
    let params = {};

    //
    return async (ctx, next) => {
        try {
            await next();
        } catch (err) {
            ctx.status = err.statusCode || err.status || 500;
            msg = err.stack || err.toString();
            console.error(msg);
        }

        const status = ctx.status;
        if (status < 400) {
            return;
        }

        params.code = status;
        params.msg = msg || 'page not found!';
        // 或者是其他静态资源 .js .css
        if (ctx.url === '/favicon.ico') {
            return ctx.throw(404);
        }
        if (status !== 404) {
            return ctx.render(options.v500, params);
        } else {
            if ((ctx.url.indexOf('.js') !== -1) || (ctx.url.indexOf('.css') !== -1)) {
                return ctx.throw(404);
            } else {
                return ctx.render(options.v404);
            }

        }
    }
};
