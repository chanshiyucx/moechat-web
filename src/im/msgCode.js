import CryptoJS from 'crypto-js'

// 加解密配置
const defaultKey = 'vViwLY9Auz1wd9SU' // 密钥
const defaultIV = '0XiT4j0ZelK4CjHe' // 密钥偏移量
const key = CryptoJS.enc.Utf8.parse(defaultKey)
const iv = CryptoJS.enc.Utf8.parse(defaultIV)

/**
 * 消息加密
 * @param {*} msgStr
 */
export const encodeMsg = msgStr => {
  return msgStr
  // const encrypted = CryptoJS.AES.encrypt(msgStr, key, { iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 })
  // const encryptedStr = encrypted.toString()
  // return encryptedStr
}

/**
 * 消息解密
 * @param {*} msgStr
 */
export const decodeMsg = msgStr => {
  return msgStr
  // const decrypted = CryptoJS.AES.decrypt(msgStr, key, { iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 })
  // const decryptedStr = decrypted.toString(CryptoJS.enc.Utf8)
  // return decryptedStr.toString()
}
