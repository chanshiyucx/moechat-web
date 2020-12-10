<template>
  <div class="chat">
    <div class="header">
      <h3>{{ chat.name }}</h3>
      <div v-if="!userInfo.tourist">
        <i class="icon icon-share" @click="handleShare"></i>
        <i class="icon icon-users" @click="handleMembers"></i>
      </div>
    </div>
    <ul ref="messageList" class="message-list i-scroll" @scroll="handleScroll">
      <li v-for="msg in messageList" :key="msg.id" :class="['msg', msg.fromId === userInfo.userId ? 'me' : 'user']">
        <Avatar class="avatar" :userId="msg.fromId" :avatar="msg.fromAvatar" />
        <div class="right">
          <div class="info">
            <span class="nickname">{{ msg.fromNickname || msg.fromUsername }}</span>
            <span class="time">{{ msg.createTime | formatTime }}</span>
          </div>
          <div class="content">
            <div v-if="msg.message.type === TYPES.TEXT">{{ msg.message.text }}</div>
          </div>
        </div>
      </li>
    </ul>
    <div class="footer">
      <p v-if="userInfo.tourist" class="guest">
        游客朋友你好, 请<b class="guestLogin" role="button" @click="login">登录</b>后参与聊天
      </p>
      <div v-else class="chat-input">
        <div class="menu">
          <i class="icon icon-emo-devil" @click="toggleEmoji"></i>
        </div>
        <div class="menu">
          <i class="icon icon-picture" @click="toggleEmoji"></i>
        </div>
        <input id="inputArea" type="text" v-model="message" placeholder="说点什么吧~" maxlength="2048" />
        <div class="menu">
          <i class="icon icon-paper-plane" @click="sendMessage"></i>
        </div>
      </div>
    </div>
    <div :class="['members', visible.members && 'show']">
      <div class="head">
        <i class="icon icon-cancel-alt" @click="visible.members = false"></i>
        <p class="title">群组信息</p>
      </div>
      <ul>
        <li v-for="user in listMembers" :key="user.id">
          {{ user.nickname }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { CMD, TYPES, CHAT } from '@/IM'
import emoji from '@/assets/emoji.json'
import Time from '@/utils/time'
import Avatar from '../Avatar'

export default {
  name: 'Chat',
  components: { Avatar },
  filters: {
    formatTime(time) {
      const messageTime = new Date(time)
      const nowTime = new Date()
      if (Time.isToday(nowTime, messageTime)) {
        return Time.getHourMinute(messageTime)
      }
      if (Time.isYesterday(nowTime, messageTime)) {
        return `昨天${Time.getHourMinute(messageTime)}`
      }
      return `${Time.getMonthDate(messageTime)} ${Time.getHourMinute(messageTime)}`
    },
  },
  props: {
    userInfo: {
      type: Object,
      default: () => {},
    },
    chat: {
      type: Object,
      default: () => {},
    },
    listMembers: {
      type: Array,
      default: () => [],
    },
    messageList: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      TYPES,
      emoji,
      emojiList: [],
      visible: {
        members: false,
        emoji: false,
      },
      isFetching: false,
      message: '',
    }
  },
  watch: {
    messageList(val, oldVal) {
      if (oldVal.length === 0) {
        this.scrollToBottom()
      }
    },
  },
  mounted() {
    // 处理表情包数据
    this.emojiList = Object.keys(emoji).map((o) => {
      return { name: emoji[o], val: o }
    })

    const inputArea = document.getElementById('inputArea')
    // ENTER 键发送消息
    inputArea.onkeydown = (event) => {
      const e = event || window.event
      if (e.keyCode === 13) {
        // 如果是直接发送或者组合键
        e.preventDefault()
        this.sendMessage()
      }
    }
  },
  methods: {
    login() {
      this.$emit('togglePanel', true)
    },
    handleScroll(e) {
      const $div = e.target
      if ($div.scrollTop === 0 && $div.scrollHeight > $div.clientHeight) {
        this.getChatMessage()
      }
    },
    handleShare() {},
    handleMembers() {
      this.getListMembers()
      this.visible.members = true
    },
    getListMembers() {
      if (!this.chat) return
      const data = { id: this.chat.id, type: this.chat.type }
      const msg = { command: CMD.LIST_MEMBERS_REQUEST, data }
      this.$emit('handleRequestEvent', msg)
    },
    getChatMessage() {
      if (!this.chat) return
      this.isFetching = true
      setTimeout(() => {
        this.isFetching = false
      }, 3000)

      const lastMsg = this.messageList[this.messageList.length - 1]
      const data = { id: this.chat.id, type: this.chat.type, index: lastMsg ? lastMsg.index : 0 }
      const msg = { command: CMD.CHAT_MESSAGE_REQUEST, data }
      this.$emit('handleRequestEvent', msg)
    },
    sendMessage() {
      const message = this.message.trim()
      if (message === '') {
        return this.$toasted.error('请说点什么吧')
      }
      this.$emit('sendMessage', { type: TYPES.TEXT, text: message })
      this.message = ''
      this.scrollToBottom()
    },
    scrollToBottom() {
      this.$nextTick(() => {
        this.$refs.messageList.scrollTop = this.$refs.messageList.scrollHeight
      })
    },
    toHtml(text) {
      const str = text
        .replace(/(\[.*?\])/g, ($1) => {
          if (this.emoji[$1]) {
            let url = require(`@/assets/emoji/${this.emoji[$1]}.png`)
            return `<img src="${url}" class="emoji" name="${$1}"/>`
          } else {
            return $1
          }
        })
        .replace(/\n/g, '</br>')
      return str
    },
    toggleEmoji() {
      this.visible.emoji = !this.visible.emoji
    },
  },
}
</script>

<style lang="scss" scope>
@import './index.scss';
</style>
