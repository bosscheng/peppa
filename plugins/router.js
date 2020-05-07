const mappings = require('../util/mapping');
const path = require('path');
const fs = require('fs');
const Router = require('koa-router');
const PeppaPlugin = require('../plugin');

// 路由是否必须使用正则表达式匹配的
const regPath = /[:*?+()]/;
// 精准匹配中间件
let handlers = {};

// next
function gnext(h, ctx, next) {
    if (!h.next) return next;
    return () => h.next(ctx, gnext(h.next, ctx, next));
}


// 精准匹配中间件
function middleware(ctx, next) {
    //
    let h = handlers[ctx.method.toLowerCase()] || handlers.all;
    // ctx path
    let p = ctx.path;

    if (!p.endsWith('/')) {
        p += '/';
    }

    //
    if (h && h[p]) {
        h = h[p];
        return h(ctx, gnext(h, ctx, next));
    } else {
        return next();
    }
}

//
function addHandler(method, path, handler) {

    // 如果含有模糊匹配字符串，就不启动精确匹配
    if (regPath.test(path)) return false;

    //
    if (!path.endsWith('/')) {
        path += "/";
    }

    // 如果没有
    if (!handlers[method][path]) {
        handlers[method][path] = handler;
    } else {
        // 如果存在的话，则形成链式关系
        let head = handlers[method][path];
        while (head.next) head = head.next;
        head.next = handler;
    }
    return true;
}

//
module.exports = class extends PeppaPlugin {
    onStart(peppa) {
        //
        let {routePath, controllerPath, filterPath, disableAccurate} = this.config;

        if (!routePath) {
            throw new Error('please set routePath')
        }

        // koa router
        let router = new Router();

        // 通过读取文件信息，来实现对路由的配置
        // route mapping 信息
        const routeMappings = mappings(path.resolve(routePath));

        //
        if (controllerPath) {
            controllerPath = path.resolve(controllerPath);
        } else {
            controllerPath = '';
        }

        //
        Object.keys(routeMappings).forEach((method) => {

            const methodMappings = routeMappings[method];

            if (!disableAccurate && !handlers[method]) {
                handlers[method] = {};
            }

            Object.keys(methodMappings).forEach((pathname) => {
                try {
                    // handler
                    const handler = require(path.join(controllerPath, methodMappings[pathname]));
                    //
                    if (disableAccurate || !addHandler(method, pathname, handler)) {
                        router[method](pathname, handler);
                    }
                } catch (e) {
                    console.error(e);
                }
            });
        });

        // filter path
        if (filterPath) {
            filterPath = path.resolve(filterPath);

            // 是否存在
            if (fs.existsSync(filterPath)) {

                let router2 = new Router();

                fs.readdirSync(filterPath).forEach((fileName) => {
                    if (path.extname(fileName) === '.js') {
                        let filePath = path.join(filterPath, fileName);
                        try {
                            //
                            let filters = require(filePath);
                            filters.forEach(filter => {
                                router2[filter.method || 'all'](filter.path, filter.handler);
                            })
                        } catch (e) {
                            console.error(e);
                        }
                    }

                });
                //
                peppa.use(router2.routes());
            }
        }


        // 默认是开启的，除非禁止掉。
        if (!disableAccurate) {
            peppa.use(middleware);
        }

        //
        peppa.use(router.routes());
        peppa.use(router.allowedMethods());
    }
};
