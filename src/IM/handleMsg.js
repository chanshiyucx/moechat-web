import ByteBuffer from 'bytebuffer'
import CryptoJS from 'crypto-js'

/**
 * 魔法常量
 */
const WSENUM = {
  MAGIC_NUMBER: 0x12345678, // 魔法数字
  VERSION: 1, // 协议版本
  SERIALIZE: 1, // 序列化方式 json = 1
}

// 默认加解密
const DEFAULT_KEY = 'WnBkF4wsjVrcVHp8' // 密钥
const DEFAULT_IV = 'VJ8jbs14XNNnxDmY' // 偏移量

/**
 * 消息编码
 * @param { Number } command 命令字
 * @param { Object } data 消息内容
 */
export const encodeMsg = ({ command, data }) => {
  const dataHex = encode(JSON.stringify(data))
  const dataBytes = hexToBytes(dataHex)
  const dataArray = new Int8Array(dataBytes)
  const bufferData = new ByteBuffer()
    .writeInt(WSENUM.MAGIC_NUMBER) // magic number
    .writeByte(WSENUM.VERSION) // 协议版本
    .writeByte(WSENUM.SERIALIZE) // 序列化 json = 1
    .writeByte(command) // 命令字
    .writeInt(dataArray.length) // 包长度
    .append(dataArray.buffer) // 包
  return new Int8Array(bufferData.view.buffer)
}

/**
 * 消息解码
 * @param {*} bytes
 */
export const decodeMsg = async (blob) => {
  const bytes = await blob.arrayBuffer()
  const bufferData = ByteBuffer.wrap(bytes)
  bufferData
    .skip(4) // 跳过魔法数字
    .skip(1) // 跳过协议版本

  // 序列化算法
  const serializeAlgorithm = bufferData.readByte()
  // 指令
  const command = bufferData.readByte()
  // 数据包长度
  const length = bufferData.readInt()
  // 数据包
  const rest = new Int8Array(bufferData.view.slice(bufferData.offset, bufferData.offset + length))
  const dataHex = bytesToHex(rest)
  const data = decode(dataHex)
  // console.log('序列化算法:' + serializeAlgorithm + ' 指令:' + command + ' 数据包长度:' + length + ' 数据包:' + data)
  return {
    command,
    data: JSON.parse(data),
  }
}

const encode = (str) => {
  const key = CryptoJS.enc.Utf8.parse(DEFAULT_KEY)
  const iv = CryptoJS.enc.Utf8.parse(DEFAULT_IV)
  const encrypted = CryptoJS.AES.encrypt(str, key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  })
  return CryptoJS.enc.Hex.stringify(encrypted.ciphertext)
}

const decode = (str) => {
  str = CryptoJS.enc.Hex.parse(str).toString(CryptoJS.enc.Base64)
  const key = CryptoJS.enc.Utf8.parse(DEFAULT_KEY)
  const iv = CryptoJS.enc.Utf8.parse(DEFAULT_IV)
  const decrypt = CryptoJS.AES.decrypt(str, key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  })
  return decrypt.toString(CryptoJS.enc.Utf8)
}

function hexToBytes(hex) {
  const bytes = []
  for (let c = 0; c < hex.length; c += 2) {
    bytes.push(parseInt(hex.substr(c, 2), 16))
  }
  return bytes
}

function bytesToHex(bytes) {
  const hex = []
  for (let i = 0; i < bytes.length; i++) {
    let current = bytes[i] < 0 ? bytes[i] + 256 : bytes[i]
    hex.push((current >>> 4).toString(16))
    hex.push((current & 0xf).toString(16))
  }
  return hex.join('')
}
