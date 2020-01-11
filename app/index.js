const Koa = require('koa')
const koaStatic = require('koa-static')
const app = new Koa()
const path = require('path')

app.use(koaStatic(path.join(__dirname, 'public/hexo/public')))

app.listen(3001, () => console.log('程序监听 3001 端口，程序一起动'))
