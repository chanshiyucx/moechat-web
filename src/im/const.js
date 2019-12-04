// 魔法常量
export const PACKET = {
  VERSION: 1, // 协议版本
  SERIALIZE: 1 // 序列化 json = 1
}

/**
 * 消息命令字
 */
export const CMD = {
  HEARTBEAT_REQUEST: 1, // 心跳请求
  HEARTBEAT_RESPONSE: 2, // 心跳响应
  LOGIN_REQUEST: 3, // 登录请求
  LOGIN_RESPONSE: 4, // 登录响应
  MESSAGE_REQUEST: 5, // 发送消息
  MESSAGE_RESPONSE: 6, // 响应消息
  ACCEPT_MESSAGE_RESPONSE: 7, // 接收消息
  ONLINE_USER_RESPONSE: 8 // 在线列表
}

/**
 * 消息类型
 */
export const TYPES = {
  HINT: 1, // 系统提示
  TEXT: 2, // 文本消息
  PICTURE: 3, // 图片消息
  VOICE: 4, // 语音消息
  VEDIO: 5 // 视频消息
}
