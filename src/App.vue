<template>
  <div id="app">
    <div :style="chatStyle">
      <Sidebar />
      <Group :chatList="chatList" :chat="chat" @setChat="setChat" />
      <Chat
        :userInfo="userInfo"
        :chat="chat"
        :listMembers="listMembers"
        :messageList="messageList"
        @togglePanel="togglePanel"
        @handleRequestEvent="handleRequestEvent"
      />
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
      chatList: [],
      chat: {},
      listMembers: [],
      messageList: [],
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
        top: `${((1 - this.height) / 2) * 100}%`,
      }
    },
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
        handleResponseEvent: this.handleResponseEvent,
      })
    },
    login(user = {}) {
      const msg = {
        command: CMD.LOGIN_REQUEST,
        data: { ...user, token: localRead('token') },
      }
      this.handleRequestEvent(msg)
    },
    loginSuccess(data) {
      this.userInfo = data
      this.showPanel = false
      localSave('token', data.token)
    },
    listMembersOk(data) {
      console.log('this.members', data)
      if (data.id === this.chat.id && data.type === this.chat.type) {
        this.listMembers = data.userList
      }
    },
    chatHistoryOk(data) {
      this.chatList = data.chatList
      if (this.chatList.length) {
        this.chat = this.chatList[0]
      }
    },
    chatMessageOk(data) {
      if (data.id !== this.chat.id || data.type !== this.chat.type) return
      const seen = new Map()
      data.messageList.forEach((msg) => (msg.message = JSON.parse(msg.message)))
      this.messageList = data.messageList
        .reverse()
        .concat(this.messageList)
        .filter((msg) => !seen.has(msg.id) && seen.set(msg.id, 1))
    },
    setChat(chat) {
      this.chat = chat
    },
    getHistory(data) {
      const msg = { command: CMD.CHAT_HISTORY_REQUEST, data }
      this.handleRequestEvent(msg)
    },
    close() {
      this.ImSocket.closeSocket()
    },
    handleRequestEvent(msg) {
      this.ImSocket.handleRequestEvent(msg)
    },
    handleResponseEvent({ command, data }) {
      switch (command) {
        case CMD.LOGIN_RESPONSE:
          this.loginSuccess(data)
          break
        case CMD.LIST_MEMBERS_RESPONSE:
          this.listMembersOk(data)
          break
        case CMD.CHAT_HISTORY_RESPONSE:
          this.chatHistoryOk(data)
          break
        case CMD.CHAT_MESSAGE_RESPONSE:
          this.chatMessageOk(data)
          break
        case CMD.ERROR_OPERATION_RESPONSE:
          this.$toasted.error(data.message)
          if (data.close) {
            this.close()
          }
          break
        default:
          break
      }
    },
    togglePanel(status) {
      this.showPanel = status
    },
  },
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
