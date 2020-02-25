---
title: CommonJS规范
date: 2020-01-19 13:11:46
tags: nodejs commonjs
---

### 概述
Node 应用由模块组成，采用 CommonJS 模块规范
每个文件有自己的模块，有自己的作用域。在一个模块里面定义的变量、函数、类、都是私有的，对其他文件不可见。
```js
var x = 5
var addX = function (value) {
    return value + x;
}
```

<!-- more -->

上面代码中，变量x和函数addX，是当前文件example.js私有的，其他文件不可见。
如果想在多个文件分享变量，必须定义为global对象的属性。
```js
global.warning = false
```
上面代码的warning变量，可以被所有文件读取。当然，这样写法是不推荐的。

CommonJS规范规定，每一个`module`代表当前模块。这个变量是一个对象，它的`exports`属性（即`modules.exports`）是对外的接口。加载一个模块，其实是加载该模块的`module.exports`属性

```js
var x = 5
var addX = function (value) {
    return value + x;
}

module.exports.x = x
module.exports.addX = addX
上面代码通过`module.exports`输出变量`x`和函数`addX`。
```

`require`方法用于加载模块
```js
var example = require('./index')

console.log(example.x)
console.log(example.addX(1))
console.log(global)
```

CommonJS模块特点如下：
0. 所有代码都在模块里加载，不会污染全局作用域
0. 模块可以多次加载，只会运行一次，然后结果被缓存起来，以后再加载，就直接读取缓存结果。想让模块再次运行，必选清除缓存。
0. 模块加载的循序，按其在代码中出现的顺序。

### module 对象
`Node` 内部提供 `Module` 构造函数，所有模块都是`Module`的实例
```js
function Module(id, parent) {
  this.id = id
  this.exports = {}
  this.parent = parent
  // ...
}
```

每个模块内部都有 `module` 对象，以下是它的属性：

0. `module.id` 模块的标识符，通常是带有绝对路径的模块文件名
0. `module.filename` 模块的文件名，带有绝对路径
0. `module.loaded` 返回一个布尔值，表示模块是否加载完成
0. `module.parent` 返回一个对象，表示调用该模块的对象
0. `module.children` 返回一个数组，表示该模块调用了哪些其他模块
0. `module.exports` 表示该模块对外输出的值。

```js
Module {
  id: '.',
  exports: {},
  parent: null,
  filename:
   'C:\\Users\\menghuan\\Desktop\\test\\commonjs 规范\\example.js',
  loaded: false,
  children:
   [ Module {
       id: 'C:\\Users\\menghuan\\Desktop\\test\\commonjs 规范\\index.js',
       exports: [Object],
       parent: [Circular],
       filename: 'C:\\Users\\menghuan\\Desktop\\test\\commonjs 规范\\index.js',
       loaded: true,
       children: [Array],
       paths: [Array] } ],
  paths:
   [ 'C:\\Users\\menghuan\\Desktop\\test\\commonjs 规范\\node_modules',
     'C:\\Users\\menghuan\\Desktop\\test\\node_modules',
     'C:\\Users\\menghuan\\Desktop\\node_modules',
     'C:\\Users\\menghuan\\node_modules',
     'C:\\Users\\node_modules',
     'C:\\node_modules' ] 
}
```
如果在命令行下调用某个模块，比如`node something.js`，那么`module.parent`就是`nul`l。如果是在脚本之中调用，比如`require('./something.js')`，那么`module.parent`就是调用它的模块。利用这一点，可以判断当前模块是否为入口脚本。
```js
if(!module.parent) {
  // run with `node something.js`
  app.listen(8888, function () {
    console.log('app listening on port 8088');
  })
} else {
  // use with `require('./something.js')`
  module.exports = app
}
```

#### module.exports 属性
`module.exports` 属性表示当前模块对外输出的接口，其他文件加载该模块，实际上就是读取 `module.exports` 变量。
```js
let app = require('./example')

app.on('ready', function () {
  console.log('module app is ready')
})
```

### exports 属性
为了方便，`Node` 为每个模块添加了 `exports` 变量，指向`module.exports`。这等同于在每个模块头部，有这样一行命令。
```js
var exports = module.exports
```
以致于在对外输出模块接口时，可以向 `exports` 对象添加属性方法。
```js
exports.area = function (r) {
  return Math.PI * r * r
}

exports.hello = function () {
  console.log('hello world!')
}
```
注意，不能直接给`exports` 赋值，这等于改变了`exports` 对 `module.exports` 的指向
```js
exports = function area (r) {
  return Math.PI * r * r
}
```
上面这样的写法是无效的，因为`exports`不再指向`module.exports`了
下面的写法也是无效的
```js
exports.area = function (r) {
  return Math.PI * r * r
}

module.exports = 'hello world'
```
上面代码中，`area` 函数是无法对外输出的，因为 `module.exports` 被重新赋值了。

这意味着，如果一个模块的对外接口，就是一个单一的值，不能使用`exports`输出，只能使用 `module.exports`输出
```js
module.exports = function area (r) { return Math.PI * r * r }
```
如果觉得 `exports` 和 `module.exports` 之间的区别很难区分，一个简单的处理方法就是，不使用 `exports`，只使用 `module.exports`

### AMD规范和CommonJS规范的兼容性
CommonJS规范加载模块是同步的，也就是说，只有加载完成，才能进行后面的操作。AMD规范则是非同步加在模块，允许指定回调函数。由于 NodeJs 主要用于服务器编程，模块文件一般都已经存储在于本地硬盘，所以加载起来比较快，不用考虑非同步加载的方式，所以CommonJS规范比较适用。但是，如果是浏览器环境，要从服务端加载模块，这时就必须采用非同步模式，因此浏览器端比较适用AND规范。

AMD 规范适用 define 方法定义模块，下面就是一个例子
```js
define(['package/lib'], function (lib) {
  function hello() {
    lib.log('hello world!')
  }

  return {
    hello
  }
})
```

AMD规范允许输出的模块兼容CommonJS规范，这时 `defined` 方法必须写成下面这样
```js
define(function (require, exports, module) {
  const app = require('app')

  app.hello();
  app.name = 'app'

  module.exports = app
})
```

### require命令

#### 基本用法
Node 使用 CommonJS 规范，内置的 `require` 命令用来加载模块文件
`require`命令的基本功能是，读取并执行一个JavaScript文件，然后返回该模块的module.exports对象。如果没有发现指定模块，会报错。
```js
// config.js
let name = 'shopApp'
let title = 'index'

module.exports = {
  name, title
}
```
运行下面的命令，可以输出 module.exports 对象。
```js
let config = require('./config')

console.log(config)
// node index.js
// { name: 'shopApp', title: 'index' }
```

如果模块输出的是一个函数，那就不能定义在exports对象上面，而要定义在`module.exports`变量上面。
```js
// example.js
module.exports = function () {
  console.log('hello world')
}

require('./example')()
// hello world
```
上面代码中，require命令调用自身，等于是执行`module.exports`，因此会输出 hello world。

#### 加载规则
`require` 命令用于加载文件，后缀名默认为`.js`。
```js
var foo = require('foo');
//  等同于
var foo = require('foo.js');
```
根据参数的不同格式，`require`命令去不同路径寻找模块文件。

0. 如果参数字符串以"/"开头，则表示加载的是一个位于绝对路径的模块文件，比如，`require('/home/marco/foo.js')`将加载`/home/marco/foo.js`。
（2）如果参数字符串以“./”开头，则表示加载的是一个位于相对路径（跟当前执行脚本的位置相比）的模块文件。比如，`require('./circle')`将加载当前脚本同一目录的`circle.js`。
（3）如果参数字符串不以“./“或”/“开头，则表示加载的是一个默认提供的核心模块（位于Node的系统安装目录中），或者一个位于各级node_modules目录的已安装模块（全局安装或局部安装）。

举例来说，脚本`/home/user/projects/foo.js`执行了`require('bar.js')`命令，Node会依次搜索以下文件。
0. /usr/local/lib/node/bar.js
0. /home/user/projects/node_modules/bar.js
0. /home/user/node_modules/bar.js
0. /home/node_modules/bar.js
0. /node_modules/bar.js

这样设计的目的是，使得不同的模块可以将所依赖的模块本地化。
（4）如果参数字符串不以“./“或”/“开头，而且是一个路径，比如`require('example-module/path/to/file')`，则将先找到`example-module`的位置，然后再以它为参数，找到后续路径。

(5) 如果指定的模块文件没有发现，Node会尝试为文件名添加`.js`、`.json`、`.node`后，在去搜索，`.js`文件会以JavaScript脚本文件解析，`.json`文件会以JSON格式的文本文件解析，`.node`文件会以编译后的二进制文件解析

(6) 如果想得到 `require` 命令加载的确切文件名，使用 `require.resolve()` 方法。

#### 目录的加载规则
通常，我们会把相关的文件会放在一个目录里，便于组织。这时，最好为该目录设置一个入口文件，让`require`方法可以通过这个入口文件，加载整个目录。

在目录中放置一个`package.json`文件，并将入口文件写入`main`字段。下面是一个例子
```package.json
{
  "name": "commonjs",
  "main": "index.js",
}
```
`require` 发现参数字符串指向一个目录以后，会自动查看该目录的`package.json`文件，然后加载`main`字段指定的入口文件，如果`package.json`文件没有`main`字段，或者根本没有`package.json`文件，则会加载该目录下的`index.js`文件或`index.node`文件

#### 模块的缓存
第一次加载某个模块时，Node会缓存该模块，以后在加载该模块，就直接从缓存取出该模块的 `module.exports` 属性。
```js
require('./config')
require('./config').message = 'hello'
console.log(require('./config').message)
// hello
```
上面代码中，连续三次使用`require`命令，加载同一个模块。第二次加载的时候，为输出的对象添加了一个`message`属性。但第三次加载的时候，这个message属性依然存在，这证明`require`命令并没有重新加载这个模块，而是输出了缓存。

如果想要多次执行某个函数，可以让该模块输出一个函数，然后每次`require`这个模块的时候，重新执行一下输出的函数。

所有缓存的模块保存在`require.cache`之中，如果想要删除模块的缓存，可以像下面这样写
```js
// 删除指定模块的缓存
delete require.cache[moduleName]

// 删除所有模块的缓存
Object.keys(require.cache).forEach(function (key) {
  delete require.cache[key]
})
```
注意：缓存是根据绝对路径识别模块的

#### 模块的循环加载
如果发生模块的循环加载，即A加载B，B又加载A，即B将加载A的不完全版本。
```js
// a.js
exports.x = 'a1'
console.log('b.js: ', require('./b.js').x)
exports.x = 'a2'

// b.js
exports.x = 'b1'
console.log('a.js: ', require('./a.js').x)
exports.x = 'b2'

// main.js
console.log('main.js: ' + require('./a').x)
console.log('main.js: ' + require('./b').x)

// a.js: a1
// b.js: b2
// main.js: a2
// main.js: b2
```
上面代码是三个JavaScript文件，其中，a.js加载了b.js，而b.js又加载a.js，这时，Node 返回 a.js 的不完整版本，所以执行效果如下
```text
$ node main.js
a.js:  a1
b.js:  b2
main.js: a2
main.js: b2
```
修改 main.js，再次加载 a.js 和 b.js
```js
// main.js
console.log('main.js: ' + require('./a').x)
console.log('main.js: ' + require('./b').x)
console.log('main.js: ' + require('./a').x)
console.log('main.js: ' + require('./b').x)
```
执行上面代码，结果如下。
```text
$ node main.js
a.js a1
b.js b2v
main.js：a2
main.js：b2
main.js：a2
main.js：b2
```
上面代码中，第二次加载a.js和b.js，会直接从缓存读取exports属性，所以a.js和b.js内部的console.log语句都不会执行了。

#### require.main
`require` 方法有一个 `main` 属性，可以用来判断模块是直接执行，还是被调用执行。
直接执行的时候(`node module.js`), `require.main` 属性指向模块本身
```js
require.main === module
// true
```
调用执行的时候(通过 `require` 加载该脚本执行)，上面表达式返回flase。

### 模块的加载机制
CommonJS模块的加载机制是，加载模块的值是缓存起来的 `module.exports` 的值的拷贝，也就是说，一旦输出一个值，模块内部的变化就影响办不到这个值。


#### 5.1 require的内部处理方式
`require` 命令是CommonJS规范之中，用来加载其他模块的命令。它其实不是一个全局命令，而是指向当前模块的`module.require`命令，而后者又调用Node的内部命令`Module._load`。
```js
Module._load = function (request, parent, isMain) {
  // 1. 检查 Module._cache, 是否缓存之中有指定的模块
  // 2. 如果缓存之中没有，就创建一个新的Module实例
  // 3. 将它保存到缓存
  // 4. 使用 module.load() 加载指定的模块文件，
  //    读取文件内容之后，使用 module.compile() 执行文件代码
  // 5. 如果加载/解析过程报错，就从缓存删除该模块
  // 6. 返回该模块的 module.exports
}
```

上面的第4步，采用 `module.compile()` 执行指定模块的脚本，逻辑如下：
```js
Module.prototype._compile = function (content, filename) {
  // 1. 生成一个 require 函数，指向 module.require
  // 2. 加载其他辅助方法到require
  // 3. 将文件内容放在一个函数之中，该函数可调用 require
  // 4. 执行该函数
}
```
上面第1步和第2步，`require` 函数及其辅助方法主要如下

0. `require()`：加载外部模块
0. `require.resolve()`：加载外部模块，并返回绝对路径
0. `require.main`：指向主模块
0. `require.cache`：指向所有缓存模块
0. `require.extensions`：根据文件后缀名，调用不同的执行函数

一旦 `require` 函数准备完毕，整个所要加载的脚本内容，就被放入一个新的函数之中，这样可以避免污染全局环境。该函数的参数包括 `require`、`module`、`exports`，以及其他一些参数。
```js
(function (exports, require, module, __filename, __dirname) {
  // YOUR CODE INJECTED HERE!
})
```
`Module._compile` 方法是同步执行的，所以 `Module._load` 方法要等它执行完成，才能向用户返回 `module.exports` 的值。


### 6. 参考链接

> [CommonJS规范](https://javascript.ruanyifeng.com/nodejs/module.html) https://javascript.ruanyifeng.com/nodejs/module.html