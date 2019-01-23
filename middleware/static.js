const path = require('path');
const send = require('koa-send');
const assert = require('assert');

module.exports = (root, options = {}) => {

    assert(root, 'root directory is required to serve files');

    options.root = path.resolve(root);

    // 文件后缀
    if (!options.suffix) {
        options.suffix = [];
    }

    //
    if (options.index !== false) {
        options.index = options.index || 'index.html';
    }

    // defer
    if (!options.defer) {
        return async (ctx, next) => {

            const suffix = path.parse(ctx.path).ext;
            let done = false;

            // head  or  get
            if (ctx.method === 'HEAD' || ctx.method === 'GET') {
                try {
                    done = await send(ctx, ctx.path, options);
                } catch (e) {
                    if (e.status !== 404) {
                        throw e;
                    } else if (options.suffix.indexOf(suffix) !== -1) {
                        done = true;
                    }
                }
            }

            //
            if (!done) {
                await next();
            }
        }
    }

    //
    return async (ctx, next) => {
        await next();

        if (ctx.method !== 'HEAD' && ctx.method !== 'GET') {
            return;
        }

        //
        if (ctx.body !== null || ctx.status !== 404) {
            return;
        }

        //
        try {
            await send(ctx, ctx.path, options);
        } catch (err) {
            if (err.status !== 404) {
                throw err;
            }
        }
    }
};
