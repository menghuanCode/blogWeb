---
title: 'Svg — 更优雅的使用icon '
date: 2020-02-25 23:09:55
tags: svg icon
---

> 最近在帮朋友做项目中，需要引入iconfont，突然有感而发，有没有更好的方式使用 svg icon

### 起因
工欲善其事必先利其器，更好的引入iconfont，更优雅的使用方式，必能使今后更加轻松

<!-- more -->

### 效果
1. 按需加载
3. 可自定义
4. 压缩svg

* **按需加载**, iconfont 的 svg 是用一段 js 代码生成的，要使用就必须全部引入，无法根据我们使用了哪些 svg 动态生成 `svg-sprite`.
* **可自定义**, 每次添加和删除一些自定义的 svg 图标，都必须和原有的图标放在一个项目库中，之后重新下载下来覆盖，一脸尼克问号？？？
* **压缩**, 通常导出的 svg 包含大量无用的信息，例如编辑器源信息、注释等等。通常都是不影响渲染结果可以移除的。

### 使用 svg-sprite-loader， 按需制作 svg-sprite
使用 `svg-sprite-loader` 可以将多个 `svg` 按需打包成 `svg-sprite`。

我们是在 `vue-cli` 的基础上进行改造的，加入 `svg-sprite-loader`。
`vue-cli` 默认情况下使用 `url-loader` 对 svg 进行处理，会将它放在`/img` 目录下，所以我们直接引入 `svg-sprite-loader` 会引发一些冲突。

```js
//默认`vue-cli` 对svg做的处理，正则匹配后缀名为.svg的文件，匹配成功之后使用 url-loader 进行处理。
 {
    test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
    loader: 'url-loader',
    options: {
      limit: 10000,
      name: utils.assetsPath('img/[name].[hash:7].[ext]')
    }
}
```
最简单的方法莫过于去掉将`test` 的 `svg` 去掉，这样就不会对 svg 做任何处理了，不过这样做很不友好
* 我们无法保证所有的 svg 都是 icon， 可能是第三方，也可能真的是图片

最安全的做法是运用 webpack 的 exclude 和 include， 让 `svg-sprite-loader` 只处理你指定文件夹下的 svg，比如 `src/icons`, `url--loader` 则排除这个文件夹，这样就能完美的解决问题了.
```js
// webpack 3
{
  test: /\.svg$/,
  loader: 'svg-sprite-loader',
  include: [resolve('src/icons')],
  options: {
    symboId: 'icon-name'
  }
},
{
  test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
  loader: 'url-loader',
  exclude: [resolve('src/icons')],
  options: {
    limit: 10000,
    name: utils.assetsPath('img/[name].[hash:7].[ext]')
  }
}
```
上面的是 webpack 3 的 写法，在 `vue-cli` 里面的写法就不太一样了
```js
chainWebpack(config) {
  let { module } = config

  // svg-sprite-loader
  module.rule('svg').exclude.add(resolve('src/icons')).end();
  module
    .rule('icons')
    .test(/\.svg$/)
    .include.add(resolve('src/icons')).
    end()
    .use('svg-sprite-loader')
    .loader('svg-sprite-loader')
    .options({
      symbolId: 'icon-[name]'
    })
    .end()
}
```

这样配置好了，只要引入svg之后填写类名就可以了，根据引用的 svg 的自动生成 `svg-sprite` 了。
```js
import '@/src/icons/qq.svg; //引入图标
<svg><use xlink:href="#qq" /></svg>  //使用图标
```
不过一个项目几百个iconfont，然后我们要一个一个导入吗，这可不行，**偷懒是人进步的阶梯**

### 自动导入
所有的 svg icon 都放在 `@/src/icons` 文件夹里，我们利用 webpack 的 [**require.context**](https://webpack.js.org/guides/dependency-management/#require-context)自动导入所有指定目录下的 icon
```js
// 语法
// 传递给的参数require.context必须是文字！
require.context(directory, useSubdirectories = true, regExp = /^\.\/.*$/, mode = 'sync');
// directory 指定的目录
// useSubdirectories 是否检索子目录，默认 true
// regExp 匹配文件的正则表达式
// mode 执行方式，默认 sync 还有 async
require.context('./test', false, /\.test\.js$/);
// 一个上下文，其中包含来自 test 目录的文件，请求结尾是 ".test.js"。
```
require.context 有三个参数：
* directory 指定的目录
* useSubdirectories 是否检索子目录
* regExp 匹配文件的正则表达式

了解这些之后，我们就可以这样写来自动引入 @/src/icons 下面所有的图标了

```js
const cache = {}
function importAll(r) {
  return r.keys().forEach(key => cache[key] = r(key))
}
importAll(require.context('./svg', false, /\.svg$/))
```
之后我们增删改图标直接文件夹下对应的图标就好了，什么都不管，他会自动生成 `syg symbol` 了。
这里用到了 `cache` 把它们缓存起来，之后调用会用到。

这里就完了吗，笑话，我们要更进一步的优化自己的svg

### 更进一步优化自己的 svg
iconfont 的 svg 虽然蛮精简的，但看过了就会发现其实还有很多无用的信息冗余。更不要说其他的网站了，虽然 `svg-sprite-loader` 也做了一定的优化，但是还不够，这时我们要引入更好用的东西了 svgo

> svgo的作用：SVG文件，尤其是从各种编辑器导出的文件，通常包含许多冗余和无用的信息。这可以包括编辑器元数据，注释，隐藏元素，默认值或非最佳值以及可以安> 全删除或转换而不会影响SVG渲染结果的其他内容。

他有几十种优化项，非常强大，详情操作可以参照 [官方文档](https://github.com/svg/svgo) [张鑫旭大大的文章](https://www.zhangxinxu.com/wordpress/2016/02/svg-compress-tool-svgo-experience/)(这位是大佬)。

这里使用默认配置就好了。

[手摸手，带你优雅的使用 icon](https://juejin.im/post/59bb864b5188257e7a427c09)
[SVG精简压缩工具svgo简介和初体验](https://www.zhangxinxu.com/wordpress/2016/02/svg-compress-tool-svgo-experience/)