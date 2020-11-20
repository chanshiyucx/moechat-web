<template>
  <div id="app">
    <div :style="chatStyle">
      <Sidebar />
      <Group :chatList="chatList" />
      <Chat :userInfo="userInfo" @togglePanel="togglePanel" />
      <Panel :showPanel="showPanel" @togglePanel="togglePanel" @login="login" />
    </div>
  </div>
</template>

<script>
import config from './config'
import IM, { CMD } from '@/IM'
import { getWidthPercent, getHeightPercent } from '@/utils/device'
import Sidebar from '@/components/Sidebar'
import Group from '@/components/Group'
import Chat from '@/components/Chat'
import Panel from '@/components/Panel'
import { localSave, localRead } from '@/utils'

export default {
  name: 'App',
  components: { Sidebar, Group, Chat, Panel },
  data() {
    return {
      ImSocket: null,
      width: getWidthPercent(),
      height: getHeightPercent(),
      showPanel: false,
      userInfo: {},
      chatList: []
    }
  },
  created() {
    this.init()
  },
  computed: {
    chatStyle() {
      return {
        width: `${this.width * 100}%`,
        height: `${this.height * 100}%`,
        left: `${((1 - this.width) / 2) * 100}%`,
        top: `${((1 - this.height) / 2) * 100}%`
      }
    }
  },
  mounted() {
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
  },
  methods: {
    // 窗口监听
    handleResize() {
      this.width = getWidthPercent()
      this.height = getHeightPercent()
    },
    init() {
      this.ImSocket = new IM({
        url: config.imURL,
        onconnect: this.login,
        ondisconnect: () => {},
        onerror: () => {},
        handleResponseEvent: this.handleResponseEvent
      })
    },
    login(user = {}) {
      const msg = {
        command: CMD.LOGIN_REQUEST,
        data: {
          ...user,
          token: localRead('token')
        }
      }
      this.handleRequestEvent(msg)
    },
    loginSuccess(data) {
      this.userInfo = data
      this.showPanel = false
      localSave('token', data.token)
    },
    close() {
      this.ImSocket.closeSocket()
    },
    handleRequestEvent(msg) {
      this.ImSocket.handleRequestEvent(msg)
    },
    handleResponseEvent({ command, data }) {
      console.log('msg========', command, data)
      switch (command) {
        case CMD.LOGIN_RESPONSE:
          this.loginSuccess(data)
          break
        case CMD.ERROR_OPERATION_RESPONSE:
          this.$toasted.error(data.message)
          if (data.close) {
            this.close()
          }
          break
        case CMD.CHAT_HISTORY_RESPONSE:
          this.chatList = data.chatList
          break
        default:
          break
      }
    },
    togglePanel(status) {
      this.showPanel = status
    }
  }
}
</script>

<style lang="scss" scope>
#app {
  background-image: url('./assets/images/bg.jpg');
  background-repeat: no-repeat;

  > div {
    position: absolute;
    display: flex;
    border-radius: 10px;
    box-shadow: 0px 0px 60px rgba(0, 0, 0, 0.5);
  }
}
</style>
