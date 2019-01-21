const path = require('path');
const send = require('koa-send');

module.exports = (root, config = {}) => {

    config.root = path.resolve(root);

    //
    if (!config.suffix) {
        config.suffix = [];
    }

    //
    if (config.index !== false) {
        config.index = config.index || 'index.html';
    }

    // defer
    if (!config.defer) {
        return async (ctx, next) => {

            const suffix = path.parse(ctx.path).ext;
            let done = false;

            // head  or  get
            if (ctx.method === 'HEAD' || ctx.method === 'GET') {
                try {
                    done = await send(ctx, ctx.path, config);
                } catch (e) {
                    if (e.status !== 404) {
                        throw e;
                    } else if (config.suffix.indexOf(suffix) !== -1) {
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
            await send(ctx, ctx.path, config);
        } catch (err) {
            if (err.status !== 404) {
                throw err;
            }
        }
    }
};
