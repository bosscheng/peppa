module.exports = (config) => {

    //
    return async (ctx, next) => {

        if ('/env' === ctx.url) {
            return ctx.render(config.v404, {maxAge: 0});
        } else {
            return await next();
        }
    }
};
