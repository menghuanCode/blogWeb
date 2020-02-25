---
title: CSS世界：层叠上下文
date: 2020-01-30 11:47:33
tags: CSS3
---

> 在HTML的层，不止有x、y轴，还有z轴，构成了一个三维的世界
> z轴上的排序显示泛生出 2 个概念：**层叠上下文，层叠水平**；1 个规则：**层叠顺序**
> 层叠顺序有 7 个层次
> 总结： **2概念-1规则-7层次**

### 什么是层叠上下文
层叠上下文，英文称作"stacking context"，在HTML中的一个三维概念。
如果一个元素从普通元素含有层叠上下文，那它在 z 轴的位置就 "会上升"，就是层次提高。

### 什么是层叠水平
层叠水平。英文称作"stacking level"，决定同一个层叠上下文中元素在z轴上的显示顺序。

### 层叠顺序
"stacking order"
![image](https://raw.githubusercontent.com/menghuanCode/picture/master/hexo/broswer/stacking-order.png)

<!-- more -->
大家知道为什么定位元素会层叠在普通元素的上面吗？
其根本原因就在于，元素一旦成为定位元素，其**z-index**就会自动生效，此时其**z-index**就是默认的**auto**，也就是**0**级别，根据上面的层叠顺序表，就会覆盖**inline**或**block**或**float**元素。

### 务必牢记的层叠准则
1. **谁大谁上：**当具有明显的层叠水平标示的时候，如识别的z-indx值，在同一个层叠上下文领域，层叠水平值大的那一个覆盖小的那一个。通俗讲就是官大的压死官小的。
2. **后来居上：**层次相同，层叠顺序相同，后面的元素会覆盖前面的元素


### 层叠上下文的创建
由一些特定的CSS属性创建：一共三个途径：
1. 天生派：页面根元素天生具有层叠上下文，称之为"根层叠上下文"
2. 传统派：position 定位元素的 "传统层叠上下文"
3. 新生派：其他CSS3属性。

### CSS3 新时代的层叠上下文
1. **dipaly:flex 和 display:inline-flex**：会给子元素创建层级上下文 (**z-index 不为 auto**)，注意了，是子元素
2. **opacity**：当 **opacity** 的值不等于 **1** 时，创建层级层级上下文，与 **position** 定位元素 **z-index: 0** 或 **z-index: auto** 平级， 下面类同
3. 自身创建层叠上下文： 
    **transform**
    **mix-blend-mode**
    **filter**
    **isolaction:isolation**
    **will-change**
    **isolaction:isolation**


### 参考链接
> [深入理解CSS中的层叠上下文和层叠顺序](https://www.zhangxinxu.com/wordpress/2016/01/understand-css-stacking-context-order-z-index/) 


