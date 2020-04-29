const bodyParser = require('koa-bodyparser');
const compress = require('koa-compress');
const static2 = require('../middleware/static');
const env = require('../util/env');
const isDev = env === 'development';
const logger = isDev ? require('koa-logger') : require('../middleware/access');
const exception = require('../middleware/exception');
const PeppaPlugin = require('../plugin');
const path = require('path');

module.exports = class extends PeppaPlugin {
    constructor(opt, ...middleware) {
        super(opt);
        this.middlewares = [];

        // exception 异常捕获
        if (opt.exception !== false) {
            this.middlewares.push(exception(opt.exception));
        }

        // 静态资源
        if (opt.publicPath) {
            this.middlewares.push(static2(path.resolve(opt.publicPath)));
        }

        // compress
        if (opt.compress !== false) {
            this.middlewares.push(compress(opt.compress))
        }

        // logger
        if (opt.logger !== false) {
            this.middlewares.push(logger());
        }

        // body parser
        if (opt.bodyParser !== false) {
            this.middlewares.push(bodyParser(opt.bodyParser));
        }

        this.middlewares.push(...middleware);
    }

    onStart(peppa) {
        // peppa.use()  其实调用的是 koa.use();
        this.middlewares.forEach(m => peppa.use(m));
    }
};
