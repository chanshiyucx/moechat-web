<template>
  <div class="chat">
    <div class="header">
      <h3>{{ chat.name }}</h3>
      <div v-if="userInfo.tourist">
        <i class="icon icon-share" @click="handleShare"></i>
        <i class="icon icon-users" @click="handleMembers"></i>
      </div>
    </div>
    <div class="body"></div>
    <div class="footer">
      <p v-if="userInfo.tourist" class="guest">
        游客朋友你好, 请<b class="guestLogin" role="button" @click="login">登录</b>后参与聊天
      </p>
      <div v-else>
        <input id="inputArea" type="text" v-model="message" />
        <button :disabled="!chat.id" @click="sendMessage">发送</button>
      </div>
    </div>
    <div :class="['members', visible.members && 'show']">
      <div class="head">
        <p class="title">群组信息</p>
      </div>
      <ul>
        <li v-for="user in listMembers" :key="user.id">
          {{ user }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { CMD, TYPES, CHAT } from '@/IM'
import emoji from '@/assets/emoji.json'

export default {
  name: 'Chat',
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
  },
  data() {
    return {
      emoji,
      emojiList: [],
      message: '',
      index: 0,
      visible: {
        members: false,
      },
    }
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
    handleShare() {},
    handleMembers() {
      this.getListMembers()
      this.visible.members = true
    },
    getListMembers() {
      if (!this.chat) return
      const data = { id: this.chat.id, type: this.chat.type }
      const msg = { command: CMD.LIST_MEMBERS_REQUEST, data }
      this.$emit('sendMessage', msg)
    },

    sendMessage() {
      if (this.message.trim() === '') {
        return this.$toast.error('请先输入要发送的消息内容')
      }
      const data = {
        index: ++this.index,
        from: this.userInfo.userId,
        to: this.chat.id,
        type: this.chat.type,
        message: { contentType: TYPES.TEXT, text: this.message },
      }
      const msg = { command: CMD.MESSAGE_REQUEST, data }
      this.$emit('sendMessage', msg)
      this.message = ''
    },
  },
}
</script>

<style lang="scss" scope>
@import './index.scss';
</style>
