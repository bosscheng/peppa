const readFile = require('util').promisify(require('fs').readFile);
const ejs = require('./ejs');
const path = require('path');
/**
 * default render options
 * @type {Object}
 */
const defaultSettings = {
    cache: true,
    layout: null,
    viewExt: 'ejs',
    locals: {},
    compileDebug: false,
    debug: false,
};

/**
 * set app.context.render
 *
 * usage:
 * ```
 * await ctx.render('user', {name: 'dead_horse'});
 * ```
 * @param {Application} app koa application instance
 * @param {Object} settings user settings
 */
function koa_ejs(app, settings) {

    /**
     * cache the generate package
     * @type {Object}
     */
    const cache = Object.create(null);

    settings = Object.assign({}, defaultSettings, settings);
    if (settings.viewPath) settings.viewPath = path.resolve(process.cwd(), settings.viewPath);
    settings.viewExt = settings.viewExt ?
        '.' + settings.viewExt.replace(/^\./, '') :
        '';

    /**
     * generate html with view name and options
     * @param {String} view
     * @param {Object} options
     * @return {String} html
     */
    async function render(view, options) {
        if (!path.extname(view))
            view += settings.viewExt;
        const viewPath = settings.viewPath ? path.join(settings.viewPath, view) : path.resolve(view);
        // get from cache
        if (settings.cache && cache[viewPath]) {
            return cache[viewPath].call(options.scope, options);
        }

        const tpl = await readFile(viewPath, 'utf8');

        // override `ejs` node_module `resolveInclude` function
        // const parentResolveInclude = ejs.resolveInclude;
        // ejs.resolveInclude = function(name, filename, isDir) {
        //     if (!path.extname(name)) {
        //         name += settings.viewExt;
        //     }
        //     return parentResolveInclude(name, filename, isDir);
        // };

        const fn = ejs.compile(tpl, {
            filename: viewPath,
            _with: settings._with,
            compileDebug: settings.debug && settings.compileDebug,
            debug: settings.debug,
            delimiter: settings.delimiter,
            cache: settings.cache
        });
        if (settings.cache) {
            cache[viewPath] = fn;
        }

        return fn.call(options.scope, options);
    }


    return async function(view, context) {

        let html = await render(view, context);

        const layout = context.layout === false ? false : (context.layout || settings.layout);
        if (layout) {
            // if using layout
            context.body = html;
            html = await render(layout, context);
        }
        return html;
    };
}

module.exports = koa_ejs;
