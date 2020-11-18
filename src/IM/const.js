/**
 * 消息命令字
 */
export const CMD = {
  // 心跳
  HEARTBEAT_REQUEST: 1,
  HEARTBEAT_RESPONSE: 2,

  // 登陆
  LOGIN_REQUEST: 3,
  LOGIN_RESPONSE: 4,

  // 登出
  LOGOUT_REQUEST: 5,
  LOGOUT_RESPONSE: 6,

  // 消息
  MESSAGE_REQUEST: 7,
  MESSAGE_RESPONSE: 8,

  // 创建群聊
  CREATE_GROUP_REQUEST: 9,
  CREATE_GROUP_RESPONSE: 10,

  // 加入群聊
  JOIN_GROUP_REQUEST: 11,
  JOIN_GROUP_RESPONSE: 12,

  // 退出群聊
  QUIT_GROUP_REQUEST: 13,
  QUIT_GROUP_RESPONSE: 14,

  // 群成员
  LIST_GROUP_MEMBERS_REQUEST: 15,
  LIST_GROUP_MEMBERS_RESPONSE: 16,

  // 群聊消息
  GROUP_MESSAGE_REQUEST: 17,
  GROUP_MESSAGE_RESPONSE: 18,
}

/**
 * 消息类型
 */
export const TYPES = {
  HINT: 1, // 系统提示
  TEXT: 2, // 文本消息
  PICTURE: 3, // 图片消息
  VOICE: 4, // 语音消息
  VEDIO: 5, // 视频消息
}
