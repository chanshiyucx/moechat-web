<template>
  <div id="app">
    <button @click="login">登录</button>
    <button @click="close">断开</button>
  </div>
</template>

<script>
import IM, { CMD } from '@/IM'
import config from './config'

export default {
  name: 'App',
  data() {
    return {
      ImSocket: null
    }
  },
  created() {
    this.init()
  },
  methods: {
    init() {
      this.ImSocket = new IM({
        url: config.imURL,
        onconnect: this.onconnect, // 服务器连接成功
        ondisconnect: () => {}, // 服务器已断开连接
        onerror: () => {}, // 服务器连接发生错误
        handleResponseEvent: this.handleResponseEvent // 消息业务处理
      })
    },
    onconnect() {},
    login() {
      const msg = {
        command: CMD.LOGIN_REQUEST,
        data: {
          username: 'shiyu',
          password: '124'
        }
      }
      this.handleRequestEvent(msg)
    },
    close() {
      this.ImSocket.closeSocket()
    },
    handleRequestEvent(msg) {
      this.ImSocket.handleRequestEvent(msg)
    },
    handleResponseEvent(msg) {
      console.log('msg========', msg)
    }
  }
}
</script>
