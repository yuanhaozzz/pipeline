


function isJsonString(str) {
  try {
    // 字符串转换为JSON
    let json = eval('(' + str + ')');
    if (typeof json === "object") {
      return true;
    }
  } catch (e) {
    return false;
  }
  return false;
}

export const validator = {
  timeout: (info, value, required) => {
    if (required === false && !value) {
      return Promise.resolve()
    }
    const regex = /^[0-9]+$/
    if (!regex.test(value)) {
      return Promise.reject('字段只能包含数字')
    }
    if (value <= 0) {
      return Promise.reject('请输入大于0的整数')
    }
    if (value > 28800) {
      return Promise.reject('超时时间最多只能设置20天(28800分钟)')
    }
    return Promise.resolve()
  },
  depth: (info, value, callback) => {
    // const regex = /^[0-9]+$/
    // if (!regex.test(value)) {
    //   return Promise.reject('字段只能包含数字')
    // }
    if (!value) {
      return Promise.resolve()
    }
    if (value < 1) {
      return Promise.reject('请输入大于0的整数')
    }
    return Promise.resolve()
  },
  triggerHook: (info, value, callback, form) => {
    const git_url = form.getFieldValue('git_url');
    const ref = form.getFieldValue('ref');
    if (git_url && !ref) {
      return Promise.reject('请填写分支名称')
    }
    if (!git_url && ref) {
      return Promise.reject('请填写代码仓库')
    }
    return Promise.resolve()
  },
  limitNumber: (info, value, callback, form, componentConfig) => {
    const { field } = info
    if (!value) {
      if (field === 'KUBERNETES_CPU_LIMIT' || field === 'KUBERNETES_MEMORY_LIMIT') {
        return Promise.resolve()
      }
    }
    const { min, max } = componentConfig
    if ((value + '').length > 1) {
      if (value[0] === '0') {
        return Promise.reject(`请输入${min} ~ ${max}的整数`)
      }
    }
    if (value > max || value < min) {
      return Promise.reject(`请输入${min} ~ ${max}的整数`)
    }
    // debugger
    if ((value + '').includes('.')) {
      return Promise.reject(`请输入${min} ~ ${max}的整数`)
    }
    return Promise.resolve()
  },
  stringNotEmpty: (info, value) => {
    if (!value || !value.trim()) {
      return Promise.reject('不能为空')
    }
    return Promise.resolve()
  },
  stringEnglish: (info, value) => {
    if (!value || !value.trim()) {
      return Promise.reject('不能为空')
    }
    const reg = /[\u4e00-\u9fa5]/
    if (reg.test(text)) {
      return Promise.reject('不能输入中文')
    }
    return Promise.resolve()
  },
  stringEnglishNotRequired: (info, value) => {
    const reg = /[\u4e00-\u9fa5]/
    if (reg.test(value)) {
      return Promise.reject('不能输入中文')
    }
    return Promise.resolve()
  },
  vaildJSON: (info, value) => {
    if (!isJsonString(value)) {
      return Promise.reject('该字符串不是 JSON 格式')
    }
    return Promise.resolve()
  },
  outVariablesVaild: (list, info, value) => {
    for (let i = 0; i < list.length; i++) {
      let v = list[i]
      // 兼容处理
      if (typeof v !== 'string') {
        v = v.key
      }
      if (!v) {
        return Promise.reject('Key 不能为空')
      }
    }
    return Promise.resolve()
  },
}