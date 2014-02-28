# jquery.validate

jquery 表单验证插件

要求 jquery 1.9+

## 使用

阅读 description.md 及源码了解插件原理。

```js
$('form').validate({
  debug: false, // 是否调试。不支持 console 的不要开启。
  onblur: true, // 是否在失去焦点时验证
  validClass: 'valid',
  errorClass: 'error',
  formValid: fn, // 表单验证通过时的回调，参数 (event, validator)
  formSubmit: fn, // 自定义表单提交事件侦听器
  formInvalid: fn, // 表单验证没通过时的回调, 参数 (event, validator)

  /* 下面选项必须指定 */

  classPlace: '.kv' // 有效性 class 放置位置(selector)
  errorPlace: '.kv-error' // 错误消息放置位置(selector)
  errors: { // 错误消息，
    email: { // key 值为表单字段 name， 不能是 id
       required: '请填写邮箱', // 必填
       email: '邮箱格式错误', //
       check: checkEmail // 自定义验证
    }
  }
})

```

test 目录下是示例。

build 目录下是压缩脚本。需要安装 uglifyjs `npm install -g uglify-js`

## 版权

MIT