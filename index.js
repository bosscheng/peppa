/**
 *
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
    usePlugin(plugin, opt, ...args) {
        if (this.plugins.indexOf(plugin) === -1) {
            assert(typeof plugin === 'function', 'Plugin muse be an function!');
            this.plugins.push(plugin);
            plugin = new plugin(extend(true, opt, this.config), ...args);
            for (let key in this.hooks) {
                if (typeof plugin[key] === 'function') {
                    this.hooks[key].push(plugin);
                }
            }
        }
        return this;
    }

    // use all
    useAll(...middleware) {

    }
}



