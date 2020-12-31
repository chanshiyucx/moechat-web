/**
 * 验证用户名或密码
 */
export const validNameOrPW = (str) => {
  const reg = /^[a-zA-Z0-9_]{3,12}$/
  return reg.test(str)
}

/**
 * 验证昵称
 */
export const validNickname = (str) => {
  const reg = /^[a-zA-Z0-9_\u4e00-\u9fa5]{1,12}$/
  return reg.test(str)
}

/**
 * 生成范围内随机整数
 */
export const random = (a, b) => parseInt(Math.random() * (b - a + 1) + a, 10)

/**
 * 日期转换
 */
export const parseTime = (time, format = '{y}-{m}-{d} {h}:{i}:{s}') => {
  const date = new Date(time)
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay(),
  }
  const time_str = format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
    let value = formatObj[key]
    if (key === 'a') {
      return ['日', '一', '二', '三', '四', '五', '六'][value]
    }
    if (result.length > 0 && value < 10) {
      value = '0' + value
    }
    return value || 0
  })
  return time_str
}

/**
 * 计算距当前时间差
 */
export const diffTime = (dateBegin) => {
  const dateDiff = Date.now() - dateBegin
  const days = Math.floor(dateDiff / (24 * 3600 * 1000))
  const leave1 = dateDiff % (24 * 3600 * 1000)
  const hours = Math.floor(leave1 / (3600 * 1000))
  const leave2 = leave1 % (3600 * 1000)
  const minutes = Math.floor(leave2 / (60 * 1000))
  const leave3 = leave2 % (60 * 1000)
  const seconds = Math.round(leave3 / 1000)
  return `${days}天${hours}小时${minutes}分钟${seconds}秒`
}

/**
 * 写入缓存
 */
export const localSave = (key, value) => {
  localStorage.setItem(key, value)
}

/**
 * 读取缓存
 */
export const localRead = (key, defaultValue = '') => {
  return localStorage.getItem(key) || defaultValue
}

/**
 * 读取移除
 */
export const localRemove = (key) => {
  return localStorage.removeItem(key)
}
