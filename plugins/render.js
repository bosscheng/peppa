const extend = require('extend');
const register = require('../util/register');
const cache = require('../util/cache');
const koa_ejs = require('../ejs/koa_ejs');

const PappePlugin = require('../plugin');


//
const regexp = /^\//;

const registerMethods = {
    css: 'registerCss',
    js: 'registerJs'
};

const placeholders = {
    css: '{{CSS_PLACEHOLDER}}',
    js: '{{JS_PLACEHOLDER}}'
};

function getRenderId() {
    return +(new Date()) + Math.random().toString(16).substr(2, 8);
}

function getRegisteredResource(type,params,renderId) {

}

// 返回需要渲染链接资源的函数
// 如果已经有缓存则不进行渲染
function renderResource(params) {
    const renderId = getRenderId();

    const getResource = Object.create(placeholders);
    const replacer = ['css', 'js'].reduce((result, type) => {
        if (params.resourceCache && params.resourceCache[type]) {
            params[registerMethods[type]] = () => {
            };
        } else {
            delete getResource[type];
            params[registerMethods[type]] = (...opt) => register.set(renderId, type, ...opt);

            let tempFunc = html=>{
              const url = getRegisteredResource(type,params,renderId);
              cache.set()
            };
            result.push(tempFunc);
        }
    }, []);
}


module.exports = class extends PappePlugin {
    onStart(pappe) {
        const opt = this.config;
        const ejsRender = koa_ejs(pappe, opt);
        pappe.context.render = async function (view, _context) {
            _context = extend(true, {content: view}, pappe.locals, this.state, opt.locals, _context);
            const renderRes = renderResource(_context);
            this.body = renderRes(await ejsRender(view, _context));
            if (_context.maxAge >= 0) {
                this.set('Cache-Control',);
            }
        }
    }
};

