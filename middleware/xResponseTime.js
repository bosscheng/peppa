// 废弃不用的。
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
