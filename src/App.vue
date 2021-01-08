<template>
  <div id="app" :style="bgStyle">
    <div :style="chatStyle">
      <Sidebar
        :online="online"
        :userInfo="userInfo"
        :statistics="statistics"
        :setting.sync="setting"
        :themeList="themeList"
        :theme.sync="theme"
        @logout="logout"
        @handleRequestEvent="handleRequestEvent"
      />
      <Group
        :visible.sync="visible"
        :userInfo="userInfo"
        :chatList="chatList"
        :chat="chat"
        :chatMessage="chatMessage"
        :searchResult.sync="searchResult"
        :onlineUser="onlineUser"
        @setChat="setChat"
        @handleRequestEvent="handleRequestEvent"
      />
      <Chat
        :visible.sync="visible"
        :userInfo="userInfo"
        :chat="chat"
        :chatInfo="chatInfo"
        :messageList="messageList"
        :msgMq="msgMq"
        @sendMessage="sendMessage"
        @handleRequestEvent="handleRequestEvent"
      />
      <Panel :showPanel.sync="visible.panel" @login="login" />
    </div>
  </div>
</template>

<script>
import config from './config'
import IM, { CMD, TYPES, CHAT } from '@/IM'
import Sidebar from '@/components/Sidebar'
import Group from '@/components/Group'
import Chat from '@/components/Chat'
import Panel from '@/components/Panel'
import { getWidthPercent, getHeightPercent, getDeviceInfo } from '@/utils/device'
import { localSave, localRead, localRemove, diffTime } from '@/utils'

const defaultSetting = { notice: true, sound: true }
let localSetting = localRead('setting')
try {
  localSetting = localSetting ? JSON.parse(localSetting) : defaultSetting
} catch (error) {
  localSetting = defaultSetting
}

const themeList = [
  { id: 'forest', name: '静谧之森', src: require('@/assets/images/forest.jpg') },
  { id: 'miku', name: '世界歌姬', src: require('@/assets/images/miku.jpg') },
  { id: 'touhou', name: '千年幻想', src: require('@/assets/images/touhou.jpg') },
]
const localTheme = localRead('theme')
const theme = themeList.find((o) => o.id === localTheme) || themeList[0]

export default {
  name: 'App',
  components: { Sidebar, Group, Chat, Panel },
  data() {
    return {
      themeList,
      theme,
      setting: localSetting,
      ImSocket: null,
      device: getDeviceInfo(),
      width: getWidthPercent(),
      height: getHeightPercent(),
      visible: {
        members: false,
        emoji: false,
        panel: false,
        search: false,
        group: false,
      },
      online: false,
      pageFocus: true,
      userInfo: {},
      chatList: [],
      chat: {},
      chatInfo: { userList: [] },
      chatMessage: {},
      index: 0,
      msgMq: {},
      statistics: {},
      searchResult: [],
      onlineUser: [],
    }
  },
  watch: {
    setting(val) {
      localSave('setting', JSON.stringify(val))
    },
    theme(val) {
      localSave('theme', val.id)
    },
  },
  created() {
    this.init()
  },
  computed: {
    bgStyle() {
      return `background-image: url(${this.theme.src});`
    },
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
    document.addEventListener('visibilitychange', this.handleVisibilityChange)

    this.msgTask()
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
    document.removeEventListener('click', this.handleClick)
    document.addEventListener('visibilitychange', this.handleVisibilityChange)
  },
  methods: {
    handleResize() {
      this.width = getWidthPercent()
      this.height = getHeightPercent()
    },
    handleClick(event) {
      const eventDom = event.target

      // 添加好友弹窗
      const friendDom = document.querySelector('.friend')
      if (friendDom && (eventDom === friendDom || friendDom.contains(eventDom))) return

      // 解散群组
      const dissolveDom = document.querySelector('.dissolve')
      if (dissolveDom && (eventDom === dissolveDom || dissolveDom.contains(eventDom))) return

      // emoji 弹窗
      const emojiDom = document.querySelector('.emoji-box')
      if (emojiDom && !(eventDom === emojiDom || emojiDom.contains(eventDom))) {
        this.visible.emoji = false
      }

      // 群组信息
      const membersDom = document.querySelector('.members')
      if (membersDom && !(eventDom === membersDom || membersDom.contains(eventDom))) {
        this.visible.members = false
      }

      // 搜索弹窗
      const searchDom = document.querySelector('.search')
      if (searchDom && !(eventDom === searchDom || searchDom.contains(eventDom))) {
        this.visible.search = false
      }
    },
    handleVisibilityChange() {
      this.pageFocus = !document.hidden
    },
    msgTask() {
      setTimeout(() => {
        const newMq = {}
        Object.keys(this.msgMq).forEach((k) => {
          const item = this.msgMq[k]
          if (item.count < 60) {
            item.count++
          }
          newMq[k] = item
        })
        this.msgMq = newMq
        this.msgTask()
      }, 1000)
    },
    notice(title, message) {
      if (this.pageFocus) return
      if (this.setting.notice) {
        this.$notification(title, {
          body: message,
          icon: 'static/favicon.png',
        })
      }
      if (this.setting.sound) {
        const text = `${title} ${message}`
        const speechInstance = new window.SpeechSynthesisUtterance(text)
        window.speechSynthesis.speak(speechInstance)
      }
    },
    init() {
      this.ImSocket = new IM({
        url: config.imURL,
        onconnect: this.login,
        ondisconnect: this.ondisconnect,
        onerror: () => {},
        handleResponseEvent: this.handleResponseEvent,
      })
    },
    login(user = {}) {
      const msg = {
        command: CMD.LOGIN_REQUEST,
        data: { ...user, token: localRead('token'), device: this.device },
      }
      this.handleRequestEvent(msg)
    },
    logout() {
      this.close()
      this.online = false
      this.userInfo = {}
      localRemove('token')
      this.init()
    },
    close() {
      this.ImSocket.closeSocket()
    },
    ondisconnect() {
      this.online = false
    },
    loginResponse(data) {
      this.online = true
      this.userInfo = data
      this.visible.panel = false
      localSave('token', data.token)
    },
    messageResponse(data) {
      data.message = JSON.parse(data.message)
      const key = `${data.type === CHAT.USER ? data.sender : data.receiver}_${data.type}`
      const list = this.chatMessage[key]
      if (list) {
        // 添加到已有队列
        list.push(data)
      } else {
        // 添加新聊天列表
        this.chatMessage[key] = [data]
        const chat = {
          id: data.sender,
          type: data.type,
          name: data.nickname,
          avatar: data.avatar,
          updateTime: data.createTime,
          temp: true,
        }
        // 插入到世界频道后
        const length = this.chatList.filter((o) => o.type === CHAT.CHANNEL).length
        this.chatList.splice(length, 1, chat)
      }

      let title
      if (data.type === CHAT.USER) {
        title = `${data.nickname} 对你说：`
      } else {
        const target = this.chatList.find((o) => o.type === data.type && o.id === data.receiver)
        title = `${data.nickname} 在 ${target.name} 对大家说：`
      }
      const message = data.message.type === TYPES.PICTURE ? '[图片]' : data.message.text
      this.notice(title, message)
    },
    addFriendResponse(data) {
      const { success, message, userId } = data
      if (data.success) {
        this.$toasted.success(message)
        const chat = this.chatList.find((o) => o.type === CHAT.USER && o.id === userId)
        if (chat) {
          this.chat = chat
        }
      } else {
        this.$toasted.error(message)
      }
    },
    createGroupResponse(data) {
      this.visible.group = false
      const { success, message, groupId } = data
      if (data.success) {
        this.$toasted.success(message)
        const chat = this.chatList.find((o) => o.type === CHAT.GROUP && o.id === groupId)
        if (chat) {
          this.setChat(chat)
        }
      } else {
        this.$toasted.error(message)
      }
    },
    joinGroupResponse(data) {
      const { success, message, groupId } = data
      if (data.success) {
        this.$toasted.success(message)
        const chat = this.chatList.find((o) => o.type === CHAT.GROUP && o.id === groupId)
        if (chat) {
          this.setChat(chat)
        }
      } else {
        this.$toasted.error(message)
      }
    },
    chatInfoResponse(data) {
      if (data.id === this.chat.id && data.type === this.chat.type) {
        this.chatInfo = data
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
      const chatMessageList = this.chatMessage[key] || []
      const seen = new Map()
      data.messageList.forEach((msg) => (msg.message = JSON.parse(msg.message)))
      const newChatMsg = data.messageList
        .reverse()
        .concat(chatMessageList)
        .filter((msg) => !seen.has(msg.id) && seen.set(msg.id, 1))
      this.$set(this.chatMessage, key, newChatMsg)
    },
    messageSuccessResponse(data) {
      delete this.msgMq[data.index]
    },
    updateUserResponse(data) {
      const { success, message, avatar, nickname } = data
      if (success) {
        this.$toasted.success(message)
        this.userInfo = { ...this.userInfo, avatar, nickname }
      } else {
        this.$toasted.error(message)
      }
    },
    updateGroupResponse(data) {
      const { success, message, avatar, name } = data
      if (success) {
        this.$toasted.success(message)
        const chat = this.chatList.find((o) => o.type === CHAT.GROUP && o.id === data.id)
        if (chat) {
          avatar && this.$set(chat, 'avatar', avatar)
          name && this.$set(chat, 'name', name)
        }
      } else {
        this.$toasted.error(message)
      }
    },
    searchResponse(data) {
      this.searchResult = data.chatList
    },
    statisticsResponse(data) {
      data.startTime = new Date(data.startDate).getTime()
      data.diffTime = diffTime(data.startTime)
      this.statistics = data
      clearTimeout(this.statisticsTimer)
      this.statisticsTask()
    },
    statisticsTask() {
      this.statisticsTimer = setTimeout(() => {
        this.statistics.diffTime = diffTime(this.statistics.startTime)
        this.statisticsTask()
      }, 1000)
    },
    onlineUserResponse(data) {
      this.onlineUser = data.onlineUser
    },
    setChat(chat) {
      this.chat = chat

      // 如果当前会话没有缓存消息列表，则拉取最新消息
      const key = `${chat.id}_${chat.type}`
      const chatMessageList = this.chatMessage[key]
      if (!chatMessageList) {
        const msg = { command: CMD.CHAT_MESSAGE_REQUEST, data: { id: chat.id, type: chat.type, index: 0 } }
        this.handleRequestEvent(msg)
      }
    },
    async sendMessage(message, file) {
      if (!this.chat) return
      const { userId, nickname, avatar } = this.userInfo
      const data = {
        index: ++this.index,
        sender: userId,
        receiver: this.chat.id,
        type: this.chat.type,
        message: JSON.stringify(message),
      }

      // 添加到本地消息列表
      const localMsg = {
        ...data,
        message,
        nickname,
        avatar,
        createTime: new Date(),
      }
      const key = `${this.chat.id}_${this.chat.type}`
      if (!this.chatMessage[key]) {
        this.chatMessage[key] = [localMsg]
      } else {
        this.chatMessage[key].push(localMsg)
      }

      // 设置消息状态计数
      this.msgMq[data.index] = { type: message.type, count: 0 }

      // 上传文件
      if (file) {
        try {
          const form = new FormData()
          form.append('image', file)
          const response = await fetch(config.imgurAPI, {
            method: 'POST',
            headers: {
              Authorization: 'Client-ID ' + config.imgurID,
            },
            body: form,
          })
          const result = await response.json()
          data.message = JSON.stringify({ ...message, url: result.data.link })
        } catch (error) {
          this.$toasted.error('上传失败')
          return
        }
      }

      // 发送
      const msg = { command: CMD.MESSAGE_REQUEST, data }
      this.handleRequestEvent(msg)
    },
    handleRequestEvent(msg) {
      this.ImSocket.handleRequestEvent(msg)
    },
    handleResponseEvent({ command, data }) {
      switch (command) {
        case CMD.LOGIN_RESPONSE:
          this.loginResponse(data)
          break
        case CMD.MESSAGE_RESPONSE:
          this.messageResponse(data)
          break
        case CMD.ADD_FRIEND_RESPONSE:
          this.addFriendResponse(data)
          break
        case CMD.CREATE_GROUP_RESPONSE:
          this.createGroupResponse(data)
          break
        case CMD.JOIN_GROUP_RESPONSE:
          this.joinGroupResponse(data)
          break
        case CMD.CHAT_INFO_RESPONSE:
          this.chatInfoResponse(data)
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
        case CMD.MESSAGE_SUCCESS_RESPONSE:
          this.messageSuccessResponse(data)
          break
        case CMD.UPDATE_USER_RESPONSE:
          this.updateUserResponse(data)
          break
        case CMD.UPDATE_GROUP_RESPONSE:
          this.updateGroupResponse(data)
          break
        case CMD.SEARCH_RESPONSE:
          this.searchResponse(data)
          break
        case CMD.STATISTICS_RESPONSE:
          this.statisticsResponse(data)
          break
        case CMD.ERROR_OPERATION_RESPONSE:
          this.$toasted.error(data.message)
          if (data.close) {
            this.close()
          }
          break
        case CMD.ONLINE_USER_RESPONSE:
          this.onlineUserResponse(data)
          break
        default:
          break
      }
    },
  },
}
</script>

<style lang="scss" scope>
#app {
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;

  > div {
    position: absolute;
    display: flex;
    border-radius: 10px;
    box-shadow: 0px 0px 60px rgba(0, 0, 0, 0.5);
  }
}
</style>
