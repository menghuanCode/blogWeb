---
title: CSS3 回流，重绘，混合总结
date: 2020-01-29 18:39:29
tags: CSS3、性能优化
---

> [CSS Triggers](https://csstriggers.com/) 可查看 CSS 样式在各个内核浏览器的 layout(回流)、paint(重绘)、Composite(混合)影响
> [让网络更快一些——最小化浏览器中的回流(reflow)](https://www.zhangxinxu.com/wordpress/2009/10/attention-reflow-to-make-web-faster/)
> [回流与重绘：CSS性能让JavaScript变慢？](https://www.zhangxinxu.com/wordpress/2010/01/%E5%9B%9E%E6%B5%81%E4%B8%8E%E9%87%8D%E7%BB%98%EF%BC%9Acss%E6%80%A7%E8%83%BD%E8%AE%A9javascript%E5%8F%98%E6%85%A2%EF%BC%9F/)

先上一段定义：**回流一定会触发重绘，重绘不一定触发回流**

![image](https://raw.githubusercontent.com/menghuanCode/picture/master/hexo/broswer/core.jpg)

### 浏览器渲染机智
浏览器采用流式布局（**Flow Based Layout**） 
HTML 解析成 **DOM**, CSS 解析成 **CSSOM**, DOM 和 CSSOM 合并成渲染树(**Render Tree**)
有了 RenderTree, 我们就知道了所有节点的位置，然后计算他们在页面上的大小几何图形和位置，最后把节点绘制到页面上。
由于浏览器使用流式布局，对 Render Tree 的计算通常只需要遍历一遍就可以完成，**但 table 及他的内部元素除外，大概需要花费多3倍的时间，这就是不用table布局的原因**

<!-- more -->

### 重绘
由于节点的几何属性发生改变或者由于样式发生改变而不影响布局的，称之为重绘，例如**outline**, **visibility**, **color**, **background-color**等，重绘的代价是高昂的，因为浏览器必须验证DOM树上其他节点的正确性。

### 回流
回流是布局或者几何属性需要改变就成为回流。回流是影响浏览器性能的关键因素，因为其变化涉及到部分页面（或者整个页面）的布局更新，一个元素的更新可能导致其所有子元素，兄弟元素，祖先元素的随后的回流。

### 浏览器优化
现代浏览器大多通过队列机制来批量更新布局：浏览器会把修改操作放在队列中，至少一个浏览器刷新（即16.6ms）才会刷新队列，但当你**获取布局信息的时候，队列可能会影响这些属性或方法返回值的操作，即使没有，浏览器也会强制清空队列，触发回流和重绘来确保返回正确的值。**

主要包括以下属性和方法：
**offsetTop**, **offsetLeft**, **offsetWidth**, **offsetHeight**
**scrollTop**, **scrollLeft**, **scrollWidth**, **scrollHeight**
**clientTop**, **clientLeft**, **clientWidth**, **clientHeight**
**width**, **height**
**getComputedStyle()**
**getBoundingClientRect()**


### 如何减少页面的回流(reflow)
0. **尽可能在DOM树的最末端改变class**
0. **减少不必要的DOM深度**
0. **精简CSS，去除没有用的css**
0. **如果你想让复杂的表现发生改变，例如动画效果，那么请在这个流动线之外实现它。使用position-absolute或position-fixed来实现它。**
0. **使用 transform 实现动画效果**
0. **避免不必要的复杂CSS选择符，尤其是使用子选择器，或消耗更多的CPU去做选择器匹配。**
0. **牺牲平滑度换取速度**
0. 将频繁重绘或者回流的节点设置为图层，图层能够阻止该节点的渲染行为影响别的节点，例如**will-change**、**video**、**iframe**等标签，浏览器会自动将该节点变为图层。
0. **CSS3 硬件加速（GPU加速）**


### Javascript
0. **避免频繁操作样式**，最好一次性重写style属性，或者将样式列表定义为class并一次性更改class属性。
0. **避免频繁操作DOM**，创建一个documentFragment，在它上面应用所有DOM操作，最后再把它添加到文档中。
0. **避免频繁读取会引发回流/重绘的属性**，如果确实需要多次使用，就用一个变量缓存起来。
0. **对具有复杂动画的元素使用绝对定位**，使它脱离文档流，否则会引起父元素及后续元素频繁回流。
