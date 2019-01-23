// 废弃不用的。
module.exports = (options = {}) => {

    //
    return async (ctx, next) => {

        if ('/env' === ctx.url) {
            return ctx.render(options.v404, {maxAge: 0});
        } else {
            return await next();
        }
    }
};
