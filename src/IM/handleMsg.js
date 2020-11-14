import ByteBuffer from 'bytebuffer'
import CryptoJS from 'crypto-js'

/**
 * 魔法常量
 */
const WSENUM = {
  MAGIC_NUMBER: 0x12345678, // 魔法数字
  VERSION: 1, // 协议版本
  SERIALIZE: 1 // 序列化方式 json = 1
}

// 默认加解密
const DEFAULT_KEY = 'vViwLY9Auz1wd9SU' // 密钥
const DEFAULT_IV = '0XiT4j0ZelK4CjHe' // 偏移量

/**
 * 消息编码
 * @param { Number } command 命令字
 * @param { Object } data 消息内容
 */
export const encodeMsg = ({ command, data }) => {
  const dataStr = encode(JSON.stringify(data))
  const size = unescape(encodeURIComponent(dataStr)).length
  const bufferData = new ByteBuffer()
    .writeInt(WSENUM.MAGIC_NUMBER) // magic number
    .writeByte(WSENUM.VERSION) // 协议版本
    .writeByte(WSENUM.SERIALIZE) // 序列化 json = 1
    .writeByte(command) // 命令字
    .writeInt(size) // 包长度
    .writeString(dataStr) // 包
  return new TextDecoder('utf-8').decode(bufferData.view)
}

/**
 * 消息解码
 * @param {*} bytes
 */
export const decodeMsg = str => {
  const bytes = new TextEncoder('utf-8').encode(str)
  const bufferData = ByteBuffer.wrap(bytes)
  bufferData
    .skip(4) // 跳过 magic number
    .skip(1) // 跳过协议版本

  // 序列化算法
  const serializeAlgorithm = bufferData.readByte()
  // 指令
  const command = bufferData.readByte()
  // 数据包长度
  const length = bufferData.readInt()
  // 数据包
  const rest = bufferData.view.slice(bufferData.offset, bufferData.offset + length)
  const data = decode(new TextDecoder('utf-8').decode(rest))
  console.log('序列化算法:' + serializeAlgorithm + ' 指令:' + command + ' 数据包长度:' + length + ' 数据包:' + data)
  return {
    command,
    data: JSON.parse(data)
  }
}

const encode = str => {
  const key = CryptoJS.enc.Utf8.parse(DEFAULT_KEY)
  const iv = CryptoJS.enc.Utf8.parse(DEFAULT_IV)
  const encrypted = CryptoJS.AES.encrypt(str, key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  })
  return encrypted.toString()
}

const decode = str => {
  const key = CryptoJS.enc.Utf8.parse(DEFAULT_KEY)
  const iv = CryptoJS.enc.Utf8.parse(DEFAULT_IV)
  const decrypt = CryptoJS.AES.decrypt(str, key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  })
  return decrypt.toString(CryptoJS.enc.Utf8)
}
