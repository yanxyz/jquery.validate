# jquery.validate

jquery 表单验证插件

要求 jquery 1.9+

## 说明

查看了几个表单验证插件源码：

<https://github.com/sofish/validator.js>

思路是将验证消息写在 HTML 中，这样比较灵活。不过只分为两种验证消息，如果两种以上就悲剧了，比如注册账户时填写邮箱需要验证 1）空 2）邮箱格式 3）是否注册过。另外在 CSS 中控制 .empty, .error 比较别扭。

<http://jqueryvalidation.org/>

写得比较复杂。通过配置生成验证消息 HTML 结构， 我不喜欢这样，代码繁杂又不灵活。验证规则写得比较强大。

我的思路：

- 在 HTML 中提供消息占位，由 js 来填充消息内容。
- 看过的插件基本上是搜索待验证的表单字段，但是又在配置中指定表单字段 name， 这样不重复吗？搜索效率又不好。因此我的思路是将指定的表单字段作为待验证的表单字段。

这个插件适合显示错误消息。更复杂的（显示正确消息，提示消息等） 或更简单的（只添加验证结果 class 来控制输入框颜色）建议改写。

## 使用

请参考 `test` 目录下的示例。

详细选项与 API 请参考源码。

## 压缩

build 目录 min.js 用来压缩插件。

```bash
cd path/to/build
npm install -g uglifyjs
node min
```

## 版权

MIT