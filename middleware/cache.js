// cache 缓存设置
module.exports = (options = {}) => {

    //
    return async (ctx, next) => {
        return await next();
    }
};
