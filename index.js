/**
 * peppa
 * */
// NODE_ENV
if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'development';
}
// un caught exception
process.on('uncaughtException', console.error);
// un handled rejection
process.on('unhandledRejection', (reason, p) => {
    console.log('unhandled Rejection at:', p, 'reason:', reason);
});

const path = require('path');
const fs = require('fs');
const assert = require('assert');
const Koa = require('koa');
const ip = require('ip');
const extend = require('extend');
const ENV = process.env.NODE_ENV;
const HANDLE_HOOK = Symbol('Peppa#Handle#Hook');
const LOADER = Symbol('Peppa#Loader');

class Peppa extends Koa {

    constructor(options = {}) {
        super();
        // config
        this.config = options;
        // root dir
        this.root = this.config.root || process.cwd();
        // modules dir
        this.modules = this.config.modules || process.cwd();
        assert(typeof this.root === 'string', 'config.root required,and must be a string');
        assert(fs.existsSync(this.root), `Directory ${this.root} is not exist`);
        assert(fs.statSync(this.root).isDirectory(), `Directory ${this.root} is not a directory`);
        // plugins
        this.plugins = [];
        // hooks
        this.hooks = {
            onStart: [],
            onStarted: []
        };
        // locals
        this.locals = {
            env: ENV,
            resourceCache: {
                css: true,
                js: true
            }
        };

        this.proxy = true;
        this.set('env', ENV);
        // koa.use();
        this.use((ctx, next) => {
            ctx.set('X-Powered-By', 'Peppa');
            ctx.peppa = this;
            return next();
        });
        // run loader
        this[LOADER]();
    }
    get(name) {
        return this[name];
    }
    set(name, value) {
        this[name] = value;
    }
    // start
    start(port, fn, ...args) {
        // run hooks
        this[HANDLE_HOOK]('onStart');

        if (!port) {
            port = this.config.port;
        }

        assert(typeof port === 'number', `Application server port: ${port} must be a Number!`);

        const rawArgv = arguments;

        const msg = `[INFO] ip: "${ip.address()}", process.pid : "${process.pid}",env:"${ENV}", server has started on port:"${port}"`;
        // listen
        this.listen(port, () => {
            this[HANDLE_HOOK]('onStarted');

            if (rawArgv.length === 0) {
                console.log(msg);
            } else if (rawArgv.length === 1) {
                if (typeof port === 'function') {
                    return port(ip.address());
                }
                console.log(msg);
            } else {
                if (typeof fn === 'function') {
                    return fn(ip.address());
                }
                console.log(`[INFO] server has started on port:${port}, ${fn}`, ...args);
            }
        });
    }
    // run hooks
    [HANDLE_HOOK](name) {
        this.hooks[name].forEach(plugin => {
            assert(typeof plugin[name] === 'function', 'Plugin muse be an function!');
            plugin[name](this);
        });
    }
    [LOADER]() {

    }

    // use plugin
    usePlugin(plugin, opt, ...middleware) {
        if (this.plugins.indexOf(plugin) === -1) {
            assert(typeof plugin === 'function', 'Plugin muse be an function!');
            this.plugins.push(plugin);
            // register hooks
            plugin = new plugin(extend(true, opt, this.config), ...middleware);
            for (let key in this.hooks) {
                if (typeof plugin[key] === 'function') {
                    this.hooks[key].push(plugin);
                }
            }
        }
        return this;
    }

    // use bucket
    useBucket(...middleware) {
        const rootPath = this.config.rootPath || '';
        let publicPath = this.config.publicPath || 'public';
        publicPath = path.resolve(rootPath, publicPath);
        // middleware
        this.usePlugin(require('./plugins/middlewares'), {
            exception: {
                v500: 'exception/500',
                v404: 'exception/404',
            },
            publicPath: publicPath
        }, ...middleware);
        // render
        this.usePlugin(require('./plugins/render'), {
            viewPath: path.resolve(rootPath, 'view'),
            cache: ENV !== 'development'
        });
        // request
        this.usePlugin(require('./plugins/request'));
        // router
        this.usePlugin(require('./plugins/router'), {
            controllerPath: path.resolve(rootPath, 'controller'),
            routePath: path.resolve(rootPath, 'route'),
            filterPath: path.resolve(rootPath, 'filter')
        });
    }
}
module.exports = Peppa;
