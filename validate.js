/*!
 * validate v1.1.0 by Ivan Yan 2014-02-26
 * https://github.com/yanxyz/jquery.validate
 * MIT License
 */

/**
 * 注意：
 * radio group 只取第一项
 * checkbox group same name, 处理同 radio group, 只取第一项； 选中一项即验证通过
 *
 */

;(function (factory) {
  if (typeof define === 'function' && define.amd) {
    define(['jquery'], factory)
  } else {
    factory(jQuery)
  }
}(function($) {
  'use strict';

  var Validator = function(options) {
    this.options = options
    this.fields = [] // 待验证的表单字段
    this.invalids = {} // 没通过验证的 name
    this.fatal = false // 插件致命错误
  }

  // 默认选项
  Validator.defaults = {
    debug: false, // 是否调试。不支持 console 的不要开启。
    onblur: true, // 是否在失去焦点时验证
    validClass: 'valid',
    errorClass: 'error',
    formValid: null, // 表单验证通过时回调
    formSubmit: null, // 自定义表单提交事件处理器
    formInvalid: null // 表单验证没通过时回调
    // 必须指定的 options
    // classPlace: '.kv' //  selector 上面 class 放置位置(closest)
    // errorPlace: '.kv-error' // selector 错误消息放置位置 (closest)
    // errors: { // 错误消息，name 指定了要验证的表单项
    //   email: {
    //      required: '请填写邮箱',
    //      email: '邮箱格式错误'
    //   }
    // }
  }

  Validator.methods = {
    required: function(value, field) {
      var type = field.type
      var form = field.form

      function check(els) {
        var checked = false

        for (var i=0, len=els.length; i<len; i++) {
          if (el[i].checked) {
            checked = true
            break
          }
        }

        return checked
      }

      // radio group
      // checkbox group 相同 name, 只要选中一项即通过
      if (type === 'checkbox' || type === 'radio') {
        var el = form[field.name]
        if (el.length > 1) {
          return check(el)
        } else {
          return el.checked
        }
      } else {
        return value.length > 0
      }
    },

    email: function(value) {
      return /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i.test(value)
    },

    number: function(value) {
      return /^-?(?:\d+|\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/.test(value)
    },

    digits: function(value) {
      return /^\d+$/.test(value)
    }
  }

  $.extend(Validator.prototype, {
    fieldValid: function(field) {
      var options = this.options
      var $place = $(field).closest(options.classPlace)
      delete this.invalids[field.name]
      $place.removeClass(options.errorClass).addClass(options.validClass)
    },
    fieldInvalid: function(field, msg) {
      var options = this.options
      var $place = $(field).closest(options.classPlace)
      var $errorEl = $place.find(options.errorPlace)

      this.invalids[field.name] = true
      $place.removeClass(options.validClass).addClass(options.errorClass)
      $errorEl.html(msg)
    },
    fieldValue: function(field) {
      var type = field.type
      var value = field.value

      switch (type) {
        // password 不去除头尾空白
        case 'password':
          return value
        default:
          return $.trim(value)
      }
    },
    validateField: function(field) {
      // var self = this
      var name = field.name
      var options = this.options
      var rules = options.errors[name]
      var msg = ''

      // 字段的 name 与 id 不同，或者没有 name, 但是 .errors 用的是 id
      // 跳过这个字段
      if (!rules) {
        if (options.debug) {
          msg = field.tagName.toLowerCase() + '#' + field.id +
            ' should use name instead of id'
          this.fatal = true
          console.error(msg)
        } else {
          valid = false
        }
        return
      }

      var value = this.fieldValue(field)
      var valid = true
      var $field = $(field)
      var p, result

      // 确保最先验证 required
      // keys() 不能保证顺序。可在选项中用属性 _rules 指定规则顺序
      var arr = rules._rules || $field.data()._rules || []
      if (!arr.length) {
        for (p in rules) {
          if (rules.hasOwnProperty(p) && p !== '_rules') {
            p === 'required' ? arr.unshift(p) : arr.push(p)
          }
        }
        $field.data('_rules', arr)
      }

      for (var i=0, len=arr.length; i<len; i++) {
        p = arr[i]
        switch (typeof rules[p]) {
          // 内部规则
          case 'string':
            // required 需要传递 field 参数
            if (!Validator.methods[p](value, field)) {
              // valid = false
              this.fieldInvalid(field, rules[p])
              // 没通过则不再验证其它规则
              return
            }

            break

          // 自定义规则, 与内部规则同名则覆盖内部规则
          // 要求：满足规则时返回 true，不满足规则时返回错误消息 string
          case 'function':
            valid = false;
            // 对于延时操作可能返回 undefined， 目前是让规则自己处理验证回调
            result = rules[p](field, this)
            if (typeof result === 'string') {
              this.fieldInvalid(field, result)
              return
            }
            break

          // 规则类型错误
          default:
            msg = name + '["' + p + '"] type error'
            this.fatal = true
            console.error(msg)
        }
      }

      valid && this.fieldValid(field)
    },
    removeErrorClass: function(field) {
      var options = this.options
      var $place = $(field).closest(options.classPlace)
      $place.removeClass(options.errorClass)
    },
    removeValidClass: function(field) {
      var options = this.options
      var $place = $(field).closest(options.classPlace)
      $place.removeClass(options.validClass)
    },
    // 取消字段验证状态
    resetField: function(field) {
      var options = this.options
      var $place = $(field).closest(options.classPlace)
      var name = field.name

      if (this.invalids[name]) {
        $place.removeClass(options.errorClass)
        delete this.invalids[name]
      } else {
        $place.removeClass(options.validClass)
      }
    },
    // 取消表单验证状态
    resetForm: function() {
      for (var i = 0, len = this.fields.length; i < len; i++) {
        this.resetField(this.fields[i])
      }
    },
    invalidsLen: function() {
      var count = 0
      for (var k in this.invalids) {
        if (this.invalids.hasOwnProperty(k)) {
          ++count
        }
      }
      return count
    }
  })

  $.fn.validate = function(options) {
    // 下面选项必须指定
    if (!(typeof options.classPlace === 'string' &&
        typeof options.errorPlace === 'string' &&
        $.isPlainObject(options.errors))) {
      throw new Error('lack required options')
    }

    return this.each(function() {
      var form = this
      var $form = $(this)
      var v, settings, $fields, selectors

      // 必须是表单
      if (!$form.is('form')) return

      v = $form.data('validator')
      if (v) return
      settings = $.extend({}, Validator.defaults, typeof options === 'object' && options)
      v = new Validator(settings)
      $form.data('validator', v)

      // 取消浏览器的验证
      $form.attr('novalidate', 'true')

      // 待验证的表单字段，options.errors 指定它们的 name
      // 不支持不在表单内的表单字段（由 form 特性指定），因为不能冒泡到 form
      ;(function() {
        var item, name, el, names = [], fields = []

        for (name in options.errors) {
          if (options.errors.hasOwnProperty(name)) {
            // form.elements 不包含 input[type="image"]
            // http://www.w3.org/TR/html5/forms.html#dom-form-elements
            el = form.elements[name]
            // 忽略不存在的表单字段，方便不定项，比如验证码启用或不启用
            if (el) {
              item = '[name="' + name + '"]'
              names.push(item)

              // 正常情况下只应有 radio group
              // TODO：处理错误：不同表单字段 id/name 一致
              if (el.length > 1) {
                fields.push(el[0])
              } else {
                fields.push(el)
              }
            }
          }
        }

        selectors = names.join(',')
        v.fields = fields
        $fields = $(fields)
      }())

      // 在表单字段失去焦点时验证
      if (settings.onblur) {
        $form.on('blur', selectors, function() {
          v.validateField(this)
        })
      }

      // 聚焦到某个表单字段时取消其错误提示
      $form.on('focusin', selectors, function() {
        v.removeErrorClass(this)
      })

      // 始终在表单提交时验证
      $form.on('submit.validator', function(e) {

        $fields.each(function() {
          // 没通过验证的表单字段不再验证，避免已验证的来不及再次验证
          if (!v.invalids[this.name]) {
            v.validateField(this)
          }
        })

        // 插件发生致命错误时不提交表单，这时应开启调试排查问题
        if (v.fatal) {
          return false
        }

        if (!v.invalidsLen()) {
          // 表单验证成功回调，回调函数参数 event, validator
          if (typeof settings.formValid === 'function') {
            settings.formValid.call(v, e, v)
          }

          // 使用自定义的表单提交处理程序
          if (typeof settings.formSubmit === 'function') {
            e.preventDefault()
            settings.formSubmit.call(v, form)
          }

          // 不支持 console 的, 比如 IE<8，不要开启调试
          if (settings.debug) {
            console.log('form valid')
            e.preventDefault()
          }
        } else {
          e.preventDefault()
          // 表单验证失败回调，回调函数参数 event, validator
          if (typeof settings.formInValid === 'function') {
            settings.formInvalid.call(v, e, v)
          }
          if (settings.debug) {
            console.log('form invalid')
          }
        }

      })
    })
  }

  $.fn.validate.Constructor = Validator

}))
