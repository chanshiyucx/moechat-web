export const validateUsername = username => {
  if (!/^[a-zA-Z0-9]{4,12}$/.test(username)) {
    return {
      valid: false,
      message: '用户名必须为4-12位数字或字母'
    }
  }
  return { valid: true, message: 'ok' }
}

export const validateNickname = nickname => {
  if (!/^[a-zA-Z0-9\u4e00-\u9fa5]{1,12}$/.test(nickname)) {
    return {
      valid: false,
      message: '昵称必须为不长于12位数字字母或中文'
    }
  }
  return { valid: true, message: 'ok' }
}

export const validatePassword = (password, rePassword) => {
  if (!/^[a-zA-Z0-9]{4,12}$/.test(password)) {
    return {
      valid: false,
      message: '密码必须为4-12位数字或字母'
    }
  }
  if (password.trim() !== rePassword.trim()) {
    return {
      valid: false,
      message: '确认密码必须一致'
    }
  }
  return { valid: true, message: 'ok' }
}
