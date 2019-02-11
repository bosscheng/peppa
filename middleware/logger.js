// 废弃不用的，使用 access 中间件
// logger
module.exports = (options = {}) => {

    return async (ctx, next) => {
        await next();
        const rt = ctx.response.get('X-Response-Time');
        console.log(`${ctx.method} ${ctx.url} - ${rt}`);
    }
};
