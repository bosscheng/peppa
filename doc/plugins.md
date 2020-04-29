# plugins
1. onerror 统一异常处理
2. session session实现
3. i18n 多语言
4. watcher 文件和文件夹监控
5. multipart 文件流式上传
6. security 安全
7. development 开发环境配置
8. logrotator 日志切割
9. schedule 定时任务
10. static 静态服务器
11. jsonp jsonp支持
12. view 模板引擎


## onerror

主要是通过 try{await next()}cache(e){}

## session

对于session的实现，主要借助于，cookie 存储session 信息。

或者提供外部的接口方式。

## i18n 多语言


## watcher

还是借助 fs.watch 接口实现的。 


## multipart

获取到上传流的信息，然后调用存储路径地址，通过fs.createWriteStream()

## security

## development

## logrotator

## schedule

## static

## jsonp

## view