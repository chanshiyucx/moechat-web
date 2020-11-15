import { encodeMsg, decodeMsg } from './handleMsg'
import { CMD as COMMAND } from './const'
export { CMD, TYPES } from './const'

/**
 * =====================================================
 *             IM 只做消息收发，不处理业务逻辑
 * =====================================================
 */
export default class IM {
  constructor(options) {
    // 初始化配置
    this.options = options

    // 内部变量
    this.socket = null // websocket 实例
    this.pingTimeout = 8000 // 发送心跳包间隔
    this.pingTimer = null // 心跳包定时器
    this.reconnectLimit = 10 // 最大重连次数
    this.reconnectCount = 0 // 当前的重连次数
    this.forbidReconnect = false // 禁止重连
    this.handers = {} // 事件广播

    // Let's go
    this._init()
  }

  /**
   * ===================================================
   *             Websocket Event 【内部模块】
   * ===================================================
   */

  // 创建 socket 实例
  _init() {
    this.socket = new WebSocket(this.options.url)
    this.socket.onclose = () => this._onclose()
    this.socket.onerror = () => this._onerror()
    this.socket.onopen = () => this._onopen()
    this.socket.onmessage = event => this._onmessage(event)
  }

  // 连接关闭
  _onclose() {
    console.log('====== 连接关闭')
    setTimeout(() => {
      this._clearAllTimer()
      this._reconnect()
      this.options.ondisconnect()
    }, 300)
  }

  // 连接错误
  _onerror() {
    console.log('====== 连接错误')
    this.options.onerror()
  }

  // 连接成功
  _onopen() {
    console.log('====== 连接成功')
    this._resetStatus()
    this.options.onconnect()
  }

  // 接收消息
  async _onmessage(event) {
    const msg = await decodeMsg(event.data)
    this.handleResponseEvent(msg)
  }

  /**
   * ====================================================
   *                 心跳与重连【内部模块】
   * ====================================================
   */

  // 清空所有定时器
  _clearAllTimer() {
    clearTimeout(this.pingTimer)
    this.pingTimer = null
  }

  // 重置状态
  _resetStatus() {
    this._clearAllTimer()
    this._heartBeat(true)
    this.reconnectCount = 0
  }

  // 重连
  _reconnect() {
    if (this.forbidReconnect) return
    if (this.reconnectCount > this.reconnectLimit) return
    console.log('====== 重连', this.reconnectCount)
    this.reconnectCount += 1
    this._init()
  }

  // 发送心跳包
  _heartBeat(immediate) {
    const msg = { command: COMMAND.HEARTBEAT_REQUEST, data: {} }
    this.pingTimer = setTimeout(
      () => {
        this._sendMessage(msg)
        this._heartBeat()
      },
      immediate ? 1000 : this.pingTimeout
    )
  }

  // 发送消息
  _sendMessage(msg) {
    this.socket.send(encodeMsg(msg))
  }

  /**
   * ====================================================
   *                  事件广播【外部模块】
   * ====================================================
   */
  on(eventName, fn) {
    if (!eventName) {
      throw new Error('事件名无效')
    }
    if (!(typeof fn === 'function')) {
      throw new Error('必须提供事件函数')
    }
    this.handers[eventName] = fn
  }

  emit(eventName, data) {
    if (!eventName) {
      throw new Error('事件名无效')
    }
    const handle = this.handers[eventName]
    handle && handle(data)
  }

  /**
   * ============================================================
   *      统一处理内外部消息通信【外部模块】
   *      IM 只暴露给外部三个方法可使用
   *      handleRequestEvent   : 数据请求
   *      handleResponseEvent  : 数据接收
   *      closeSocket          : 关闭连接
   * ============================================================
   */

  // 处理外部请求命令
  handleRequestEvent(msg) {
    console.log('%c发送消息', 'color:#F2C047;', { ...msg })
    this._sendMessage(msg)
  }

  // 处理消息回调给外部
  handleResponseEvent(msg) {
    // 过滤心跳响应
    if (msg.command === COMMAND.HEARTBEAT_RESPONSE) return
    console.log('%c接收消息', 'color:#CD5DA0;', msg)
    this.options.handleResponseEvent(msg)
  }

  // 手动关闭连接
  closeSocket() {
    this._clearAllTimer()
    this.forbidReconnect = true
    this.socket && this.socket.close()
    this.socket = null
  }
}
