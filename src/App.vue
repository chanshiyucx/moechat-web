<template>
  <div id="app">
    {{ visible }}
    <div :style="chatStyle">
      <Sidebar />
      <Group :chatList="chatList" :chat="chat" @setChat="setChat" />
      <Chat
        :visible.sync="visible"
        :userInfo="userInfo"
        :chat="chat"
        :listMembers="listMembers"
        :messageList="messageList"
        @togglePanel="togglePanel"
        @sendMessage="sendMessage"
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
      visible: {
        members: false,
        emoji: false,
      },
      showPanel: false,
      userInfo: {},
      chatList: [],
      chat: {},
      listMembers: [],
      chatMessage: {},
      index: 0,
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
    messageList() {
      if (!this.chat) return []
      const key = `${this.chat.id}_${this.chat.type}`
      return this.chatMessage[key] || []
    },
  },
  mounted() {
    window.addEventListener('resize', this.handleResize)
    document.addEventListener('click', this.handleClick)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
    document.removeEventListener('click', this.handleClick)
  },
  methods: {
    handleResize() {
      this.width = getWidthPercent()
      this.height = getHeightPercent()
    },
    handleClick(event) {
      const eventDom = event.target

      // emoji 弹框
      const emojiDom = document.querySelector('.emoji-box')
      if (!(eventDom === emojiDom || emojiDom.contains(eventDom))) {
        console.log('关闭弹窗')
        this.visible.emoji = false
      }

      // 群组信息
      // const membersDom
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
    loginResponse(data) {
      this.userInfo = data
      this.showPanel = false
      localSave('token', data.token)
    },
    listMembersResponse(data) {
      if (data.id === this.chat.id && data.type === this.chat.type) {
        this.listMembers = data.userList
      }
    },
    chatHistoryResponse(data) {
      this.chatList = data.chatList
      if (this.chatList.length) {
        this.chat = this.chatList[0]
      }
    },
    chatRecentResponse(data) {
      const chatMessage = {}
      data.recentMessageList.forEach((o) => {
        o.messageList.forEach((msg) => (msg.message = JSON.parse(msg.message)))
        const key = `${o.id}_${o.type}`
        chatMessage[key] = o.messageList.reverse()
      })
      this.chatMessage = chatMessage
    },
    chatMessageResponse(data) {
      if (data.id !== this.chat.id || data.type !== this.chat.type) return
      const key = `${this.chat.id}_${this.chat.type}`
      const chatMessageList = this.chatMessage[key]
      const seen = new Map()
      data.messageList.forEach((msg) => (msg.message = JSON.parse(msg.message)))
      const newChatMsg = data.messageList
        .reverse()
        .concat(chatMessageList)
        .filter((msg) => !seen.has(msg.id) && seen.set(msg.id, 1))
      this.$set(this.chatMessage, key, newChatMsg)
    },
    setChat(chat) {
      this.chat = chat
    },
    sendMessage(message) {
      if (!this.chat) return
      const { userId, nickname, avatar } = this.userInfo
      const data = {
        index: ++this.index,
        fromId: userId,
        toId: this.chat.id,
        toType: this.chat.type,
        message: JSON.stringify(message),
      }
      const msg = { command: CMD.MESSAGE_REQUEST, data }
      this.handleRequestEvent(msg)

      // state 0 发送中, 1 发送成功
      const localMsg = {
        ...data,
        message,
        fromNickname: nickname,
        fromAvatar: avatar,
        state: 0,
        createTime: new Date(),
      }
      const key = `${this.chat.id}_${this.chat.type}`
      this.chatMessage[key].push(localMsg)
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
          this.loginResponse(data)
          break
        case CMD.LIST_MEMBERS_RESPONSE:
          this.listMembersResponse(data)
          break
        case CMD.CHAT_HISTORY_RESPONSE:
          this.chatHistoryResponse(data)
          break
        case CMD.CHAT_RECENT_RESPONSE:
          this.chatRecentResponse(data)
          break
        case CMD.CHAT_MESSAGE_RESPONSE:
          this.chatMessageResponse(data)
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
