# Virtual DOM 和 diff 算法实现

## 如何理解本仓库的代码

- 阅读以下两篇文章了解Virtual DOM的实现（英文）
    1. [Create your own virtual DOM to understand it (Part 1)](https://aibolik.github.io/blog/create-your-own-virtual-dom-to-understand-it-part-1)
    2. [Create your own virtual DOM to understand it (Part 2)](https://aibolik.github.io/blog/create-your-own-virtual-dom-to-understand-it-part-2)

- 阅读以下文章了解diff算法的分析（中文）
    1. https://github.com/aooy/blog/issues/2

## 构建

```shel
npm install
npm run build
```

## 运行

构建成功之后，在 `dist` 会生成一个 `bundle.js` 文件，此时在浏览器打开 文件夹中的`index.html`。

## 即将看到效果

为了确确实实看到diff的效果，还需要一些设置。

F12 -> 开发者工具 -> More(开发者工具右上角 `...` 图标) -> More tools -> Rendering

把 `Paint flashing` 勾上~

![setting-1](https://github.com/xubaifuCode/virtual-dom-and-diff-implementation/raw/master/images/rendering-setting-guide-1.png)

![setting-2](https://github.com/xubaifuCode/virtual-dom-and-diff-implementation/raw/master/images/rendering-setting-guide-2.png)

完成设置之后，按下 `F5` 刷新页面

## 效果如下

- 初始值

```JavaScript
list = ['a1', 'b2', 'c3', 'd4', 'e5']
```

![result-1](https://github.com/xubaifuCode/virtual-dom-and-diff-implementation/raw/master/images/step-1.png)

- 2秒后改变为

```JavaScript
list = ['a1', 'd4', 'b2', 'c3', 'e5', 'f6']
```

![result-2](https://github.com/xubaifuCode/virtual-dom-and-diff-implementation/raw/master/images/step-2.png)

- 5秒后改变为

```JavaScript
list = ['e5', 'd4', 'f6', 'c3', 'a1', 'b2']
```

![result-3](https://github.com/xubaifuCode/virtual-dom-and-diff-implementation/raw/master/images/step-3.png)

## 最后

欢迎 `fork` 回去修改成自定义的DOM玩~
