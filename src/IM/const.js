/**
 * 消息命令字
 */
export const CMD = {
  /**
   * 心跳
   */
  HEARTBEAT_REQUEST: 1,
  HEARTBEAT_RESPONSE: 2,

  /**
   * 登陆
   */
  LOGIN_REQUEST: 3,
  LOGIN_RESPONSE: 4,

  /**
   * 登出
   */
  LOGOUT_REQUEST: 5,
  LOGOUT_RESPONSE: 6,

  /**
   * 消息
   */
  MESSAGE_REQUEST: 7,
  MESSAGE_RESPONSE: 8,

  /**
   * 添加好友
   */
  ADD_FRIEND_REQUEST: 9,
  ADD_FRIEND_RESPONSE: 10,

  /**
   * 移除好友
   */
  REMOVE_FRIEND_REQUEST: 11,
  REMOVE_FRIEND_RESPONSE: 12,

  /**
   * 创建群聊
   */
  CREATE_GROUP_REQUEST: 13,
  CREATE_GROUP_RESPONSE: 14,

  /**
   * 加入群聊
   */
  JOIN_GROUP_REQUEST: 15,
  JOIN_GROUP_RESPONSE: 16,

  /**
   * 退出群聊
   */
  QUIT_GROUP_REQUEST: 17,
  QUIT_GROUP_RESPONSE: 18,

  /**
   * 群成员
   */
  LIST_MEMBERS_REQUEST: 19,
  LIST_MEMBERS_RESPONSE: 20,

  /**
   * 聊天列表
   */
  CHAT_HISTORY_REQUEST: 21,
  CHAT_HISTORY_RESPONSE: 22,

  /**
   * 最近聊天记录
   */
  CHAT_RECENT_REQUEST: 23,
  CHAT_RECENT_RESPONSE: 24,

  /**
   * 历史消息
   */
  CHAT_MESSAGE_REQUEST: 25,
  CHAT_MESSAGE_RESPONSE: 26,

  /**
   * 更新用户信息
   */
  UPDATE_USERINFO_REQUEST: 27,
  UPDATE_USERINFO_RESPONSE: 28,

  /**
   * 消息发送成功
   */
  MESSAGE_SUCCESS_RESPONSE: 101,

  /**
   * 错误消息
   */
  ERROR_OPERATION_RESPONSE: 102,
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

/**
 * 聊天类型
 */
export const CHAT = {
  CHANNEL: 1, // 世界频道
  GROUP: 2, // 群组
  USER: 3, // 用户
}
