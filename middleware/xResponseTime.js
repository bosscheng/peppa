// 废弃不用的。使用 access 中间件
// X-Response-Time
module.exports = (options = {}) => {
    //
    return async (ctx, next) => {
        // start time
        const start = new Date();
        await next();
        // end time
        const ms = (new Date()) - start;
        ctx.set('X-Response-Time', `${ms}ms`);
    }
};
