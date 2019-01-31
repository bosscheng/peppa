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
        this.config = options;
        this.root = this.config.root || process.cwd();
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

        //
        this.locals = {
            env: ENV,
            resourceCache: {
                css: true,
                js: true
            }
        };

        this.proxy = true;

        this.set('env', ENV);
        this.use((ctx, next) => {
            ctx.set('X-Powered-By', 'Peppa');
            ctx.peppa = this;
            return next();
        });

        this[LOADER]();
    }

    get(name) {
        return this[name];
    }

    set(name, value) {
        this[name] = value;
    }

    start(port, fn, ...args) {
        this[HANDLE_HOOK]('onStart');

        if (!port) {
            port = this.config.port;
        }

        assert(typeof port === 'number', `Application server port: ${port} must be a Number!`);

        const rawArgv = arguments;

        const msg = `[INFO] ip: "${ip.address()}", process.pid : "${process.pid}",env:"${ENV}", server has started on port:"${port}"`;

        //
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
        //
        this.usePlugin(require('./plugins/middlewares'), {
            exception: {
                v500: 'exception/500',
                v404: 'exception/404',
            },
            publicPath: ENV === 'development' ? path.resolve(rootPath, 'public') : null
        }, ...middleware);

        //
        this.usePlugin(require('./plugins/render'), {
            viewPath: path.resolve(rootPath, 'view'),
            cache: ENV !== 'development'
        });

        //
        this.usePlugin(require('./plugins/request'));

        //
        this.usePlugin(require('./plugins/router'), {
            controllerPath: path.resolve(rootPath, 'controller'),
            routePath: path.resolve(rootPath, 'route'),
            filterPath: path.resolve(rootPath, 'filter')
        });
    }
}


module.exports = Peppa;
