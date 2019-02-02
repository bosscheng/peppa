## security 安全

### csp 

> 内容安全策略   (CSP) 是一个额外的安全层，用于检测并削弱某些特定类型的攻击，包括跨站脚本 (XSS) 和数据注入攻击等。无论是数据盗取、网站内容污染还是散发恶意软件，这些攻击都是主要的手段。

> CSP 的主要目标是减少和报告 XSS 攻击 ，XSS 攻击利用了浏览器对于从服务器所获取的内容的信任。恶意脚本在受害者的浏览器中得以运行，因为浏览器信任其内容来源，即使有的时候这些脚本并非来自于它本该来的地方。

> CSP通过指定有效域——即浏览器认可的可执行脚本的有效来源——使服务器管理者有能力减少或消除XSS攻击所依赖的载体。一个CSP兼容的浏览器将会仅执行从白名单域获取到的脚本文件，忽略所有的其他脚本 (包括内联脚本和HTML的事件处理属性)。
  
  
链接 https://developer.mozilla.org/zh-CN/docs/Web/HTTP/CSP




### csrf (cross site request forgery)

> 跨请求伪造

需要借助于 csrf 库来实现，

```js
var Tokens = require('csrf');
```

### dta （directory traversal attack ）

> 目录遍历攻击

需要检查 url 中是否是 安全的路径。



### hsts（strict transport security header）

>  HTTP Strict Transport Security（通常简称为HSTS）是一个安全功能，它告诉浏览器只能通过HTTPS访问当前资源，而不是HTTP。

网址可以通过 http strict transport security 通知浏览器，这个网址禁止使用 http 方式加载，浏览器应该自动把所有尝试使用HTTP的请求自动替换为HTTPS请求。

> 注意: Strict-Transport-Security 在通过 HTTP 访问时会被浏览器忽略; 因为攻击者可以通过中间人攻击的方式在连接中修改、注入或删除它.  只有在你的网站通过HTTPS访问并且没有证书错误时, 浏览器才认为你的网站支持HTTPS 然后使用 Strict-Transport-Security 的值 .
  
一般都是通过在 head头部添加 `strict-transport-security` key. 

### methodnoallow

> cross site tracing

如果 http method 是 trace 或者是 track 的话，则返回 405 状态。

### noopen

> 针对于 ie 的处理。

### nosniff

在header 头部添加 `X-Content-Type-Options: nosniff` 

告诉浏览器 不要嗅探资源的类型 比如，可能是 html，js，img 等。


### referrerPollicy

> Referrer-Policy 首部用来监管哪些访问来源信息——会在 Referer  中发送——应该被包含在生成的请求当中。
  
同样的在header头部添加 `referrer-policy`
  



### xframe

https://developer.mozilla.org/zh-CN/docs/Web/HTTP/X-Frame-Options
在header 头部添加 `x-frame-options` key

拥有的值有：

- DENY
- SAMEORIGIN
- ALLOW-FROM uri

nginx 配置

```nginx
add_header X-Frame-Options SAMEORIGIN;
```


### xssProtection

https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/X-XSS-Protection


> 在 header 头部添加 `x-xss-protection` key 

#### xss 攻击原理

就是在可输入的 input 或者 textare上面输入类似于 输入 <script>alert('xxx')</script>


