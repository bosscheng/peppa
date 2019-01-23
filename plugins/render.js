const extend = require('extend');
const register = require('../util/register');
const cache = require('../util/cache');
const koa_ejs = require('../ejs/koa_ejs');

const PeppaPlugin = require('../plugin');

//
const regexp = /^\//;

const registerMethods = {
    css: 'registerCss',
    js: 'registerJs'
};

const placeholders = {
    css: '{{{CSS_PLACEHOLDER}}}',
    js: '{{{JS_PLACEHOLDER}}}'
};

const isDev = process.env.NODE_ENV === 'development';

//
function getRenderId() {
    return +(new Date()) + Math.random().toString(16).substr(2, 8);
}

function getRegisteredResource(type, params, renderId) {
    const version = params.version;
    const res = params.res || {};

    // tpl
    const template = {
        css: {
            version: isDev ? '' : '?v=' + version,
            tpl: '<link type="text/css" rel="stylesheet" href="{URL}">'
        },
        js: {
            version: isDev ? '' : '?v=' + version,
            tpl: '<script src="{URL}"></script> '
        }
    };

    const tpl = template[type].tpl;
    // 获取已注册静态资源
    const resource = register.get(renderId, type);
    const keys = Object.keys(resource);

    let url = '';

    for (const key of keys) {
        const obj = resource[key];
        let src = '';
        for (const resourcePath of obj.path) {
            let link = '';
            let paths = resourcePath.split(',');

            for (let href of paths) {

                //
                if (isDev) {
                    if (regexp.test(href)) {
                        href = (res.backup || '') + href.replace(regexp, '');
                    } else {
                        href = (res.url || '') + href;
                    }
                    link += tpl.replace('{URL}', href);
                } else {
                    if (regexp.test(href)) {
                        let str = href.replace(regexp, '');
                        link += str + '';
                    } else {
                        link += (res.dir || '') + '/' + href + ','
                    }
                }
            }
            src += link;
        }

        if (!isDev) {
            let v = '';

            if (version) {
                v = '?v=' + version;
            }

            src = src.replace(/,$/, '');
            src = tpl.replace('{URL}', res.url + src + v);
        }

        url += src;
    }

    return url;
}

// 返回需要渲染链接资源的函数
// 如果已经有缓存则不进行渲染
function renderResource(params) {
    const renderId = getRenderId();

    const getResource = Object.create(placeholders);
    const replacer = ['css', 'js'].reduce((result, type) => {
        //
        if (params.resourceCache && params.resourceCache[type] && (getResource[type] = cache.get(type, params.content))) {
            params[registerMethods[type]] = () => {
            };
        } else {
            delete getResource[type];

            params[registerMethods[type]] = (...opt) => register.set(renderId, type, ...opt);

            let tempFunc = html => {
                const url = getRegisteredResource(type, params, renderId);
                cache.set(type, params.content, url, {expires: params.expires});
                register.clear(renderId, type);
                return html.replace(placeholders[type], url);
            };
            result.push(tempFunc);
        }
        return result;
    }, []);

    params.getResource = type => getResource[type];

    return html => replacer.reduce((html, replace) => replace(html), html)
}


module.exports = class extends PeppaPlugin {
    onStart(peppa) {
        const opt = this.config;
        const ejsRender = koa_ejs(peppa, opt);
        peppa.context.render = async function (view, _context) {
            _context = extend(true, {content: view}, peppa.locals, this.state, opt.locals, _context);
            const renderRes = renderResource(_context);
            this.body = renderRes(await ejsRender(view, _context));
            if (_context.maxAge >= 0) {
                this.set('Cache-Control', (_context.maxAge ? '' : 'no-cache,no-store,') + `max-age=${_context.maxAge}`);
            }
        }
    }
};

