<template>
  <div id="chat">
    <div class="header">
      <h3>{{ chat.name }}</h3>
      <div v-if="!userInfo.tourist">
        <i v-if="chat.type === CHAT.GROUP" class="icon icon-share" @click="handleShare"></i>
        <i class="icon icon-users" @click="handleMenu"></i>
      </div>
    </div>
    <ul ref="messageList" class="message-list i-scroll" @scroll="handleScroll">
      <li v-for="msg in messageList" :key="msg.id" :class="['msg', msg.sender === userInfo.userId ? 'me' : 'user']">
        <Avatar class="avatar" :userId="msg.sender" :avatar="msg.avatar" />
        <div :class="['right', getClass(msg.index)]">
          <div class="info">
            <span class="nickname">{{ msg.nickname || msg.username }}</span>
            <span class="time">{{ msg.createTime | formatTime }}</span>
          </div>
          <div class="content">
            <div v-if="msg.message.type === TYPES.TEXT" v-html="toHtml(msg.message.text)"></div>
            <div v-else-if="msg.message.type === TYPES.PICTURE">
              <div v-if="msg.message.type === TYPES.TEXT" v-html="toHtml(msg.message.text)"></div>
              <LazyImg className="img-zoomable" :src="msg.message.url" @onload="scrollToBottom" />
            </div>
          </div>
        </div>
      </li>
    </ul>
    <div class="footer">
      <p v-if="userInfo.tourist" class="guest">
        游客朋友你好, 请<b class="guestLogin" role="button" @click="login">登录</b>后参与聊天
      </p>
      <div v-else class="chat-input">
        <Transition name="fade-transform" mode="out-in">
          <ul v-show="visible.emoji" class="emoji-box i-scroll">
            <li v-for="emoji in emojiList" :key="emoji.name" @click="handleEmoji(emoji)">
              <img :src="require(`@/assets/emoji/${emoji.name}.png`)" />
            </li>
          </ul>
        </Transition>
        <div :class="['menu', visible.emoji && 'active']">
          <i class="icon icon-emo-devil" @click="toggleEmoji"></i>
        </div>
        <div class="menu">
          <i class="icon icon-picture"></i>
          <input
            id="file-input"
            type="file"
            title=""
            accept="image/gif,image/png,image/jpeg"
            @change="uploadImage($event)"
          />
        </div>
        <input id="message-input" type="text" v-model="message" placeholder="说点什么吧~" maxlength="2048" />
        <div class="menu">
          <i class="icon icon-paper-plane" @click="sendMessage"></i>
        </div>
      </div>
    </div>
    <div :class="['members', visible.members && 'show']">
      <p class="title">群组信息</p>
      <div class="content">
        <template v-if="chatInfo.type === CHAT.GROUP && chatInfo.createUser === userInfo.username">
          <div class="block">
            <p class="subtitle">修改群名称</p>
            <input class="name-input" type="text" v-model="nickname" placeholder="请输入群名称" />
            <button @click="handleSure(1)">确认修改</button>
          </div>
          <div class="block">
            <p class="subtitle">修改群头像</p>
            <div class="avatar-wrapper">
              <Avatar id="chat-avatar" :class="['avatar', loading && 'blur']" :userId="chat.id" :avatar="chat.avatar" />
              <Loading v-show="loading" />
            </div>
            <Cropper
              trigger="#chat-avatar"
              @uploading="handleUploading"
              @uploaded="handleUploaded"
              @error="handlerError"
            />
          </div>
        </template>
        <div class="block">
          <p class="subtitle">在线成员 {{ chatInfo.userList.length }}</p>
          <ul class="i-scroll">
            <li v-for="user in chatInfo.userList" :key="user.id">
              <div @click="handleMember(user)">
                <Avatar class="avatar" :userId="user.id" :avatar="user.avatar" />
                <p>{{ user.nickname }}</p>
              </div>
              <p>{{ user.device }}</p>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div class="friend" v-show="friend">
      <div class="mask" @click="friend = ''"></div>
      <div class="content">
        <div class="head">
          <Avatar class="avatar" :userId="friend.id" :avatar="friend.avatar" />
          <p>{{ friend.nickname }}</p>
          <i class="icon icon-cancel-outline" @click="friend = ''"></i>
        </div>
        <div class="footer">
          <button :class="option === 'remove' && 'red'" @click="handleFriend">
            {{ option === 'add' ? '加为好友' : '删除好友' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Viewer from 'viewerjs'
import * as imageConversion from 'image-conversion'
import { CMD, TYPES, CHAT } from '@/IM'
import emoji from '@/assets/emoji.json'
import Avatar from '../Avatar'
import Loading from '../Loading'
import LazyImg from '../LazyImg'
import Cropper from '../Cropper'
import { validContent } from '@/utils'

export default {
  name: 'Chat',
  components: { Avatar, Loading, LazyImg, Cropper },
  props: {
    visible: {
      type: Object,
      default: () => {},
    },
    userInfo: {
      type: Object,
      default: () => {},
    },
    chat: {
      type: Object,
      default: () => {},
    },
    chatInfo: {
      type: Object,
      default: () => {},
    },
    messageList: {
      type: Array,
      default: () => [],
    },
    msgMq: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      TYPES,
      CHAT,
      emoji,
      emojiList: [],
      loading: false,
      isFetching: false,
      toBottom: false,
      option: '',
      friend: '',
      message: '',
      avatar: '',
      nickname: '',
    }
  },
  watch: {
    messageList(val, oldVal) {
      if (oldVal.length === 0 || this.toBottom) {
        this.scrollToBottom()
      } else {
        this.calcSrcoll()
      }

      if (val.length) {
        this.$nextTick(() => this.viewer.update())
      }
    },
    'userInfo.tourist': {
      immediate: true,
      handler(val) {
        if (!val) {
          this.bindKeyBoard()
        }
      },
    },
    chat(val) {
      this.avatar = val.avatar
      this.nickname = val.name
    },
  },
  mounted() {
    // 处理表情包数据
    this.emojiList = Object.keys(emoji).map((o) => {
      return { name: emoji[o], val: o }
    })

    this.initViewer()
  },
  methods: {
    bindKeyBoard() {
      // ENTER 键发送消息
      const messageInput = document.getElementById('message-input')
      if (!messageInput) return
      messageInput.onkeydown = (event) => {
        const e = event || window.event
        if (e.keyCode === 13) {
          e.preventDefault()
          this.sendMessage()
        }
      }
    },
    initViewer() {
      this.viewer = new Viewer(document.querySelector('.message-list'), {
        filter(image) {
          return image.className.includes('img-zoomable')
        },
      })
    },
    getClass(index) {
      if (!index) return 0
      const item = this.msgMq[index]
      if (!item) return 0
      if (item.type === TYPES.PICTURE) {
        return item.count > 30 ? 'failed' : 'loading'
      } else {
        return item.count > 3 ? 'failed' : 'success'
      }
    },
    scrollToBottom() {
      this.$nextTick(() => {
        this.toBottom = false
        this.$refs.messageList.scrollTop = this.$refs.messageList.scrollHeight
      })
    },
    calcSrcoll() {
      const scrollTop = this.$refs.messageList.scrollTop
      const scrollHeight = this.$refs.messageList.scrollHeight
      const clientHeight = this.$refs.messageList.clientHeight
      // 当滚动距离距底部 100 以内时自动滚动到底部
      const bottomDistance = scrollHeight - scrollTop - clientHeight
      if (bottomDistance < 100) {
        this.scrollToBottom()
      } else {
        this.$nextTick(() => {
          this.$refs.messageList.scrollTop = this.$refs.messageList.scrollHeight - clientHeight - bottomDistance
        })
      }
    },
    login() {
      this.$emit('update:visible', { ...this.visible, panel: true })
    },
    handleScroll(e) {
      const $div = e.target
      if ($div.scrollTop === 0 && $div.scrollHeight > $div.clientHeight) {
        this.getChatMessage()
      }
    },
    handleShare() {
      if (!this.chat) return
      if (this.chat.type !== CHAT.GROUP) return
      console.log('this.chat', this.chat)
      // invite::fiora
      // const invite =
    },
    handleMenu(event) {
      event.stopPropagation()
      if (!this.chat) return
      if (this.chat.type === CHAT.USER) {
        if (this.chat.temp) {
          this.handleMember({ ...this.chat, userId: this.chat.id, nickname: this.chat.name })
        } else {
          this.option = 'remove'
          this.friend = this.chat
        }
      } else {
        this.getChatInfo()
        this.$emit('update:visible', { ...this.visible, members: true, emoji: false })
      }
    },
    handleMember(user) {
      if (user.tourist) return
      if (user.userId === this.userInfo.userId) return
      this.option = 'add'
      this.friend = user
    },
    handleFriend() {
      if (!this.friend) return
      const data = { userId: this.friend.userId || this.friend.id }
      const command = this.option === 'add' ? CMD.ADD_FRIEND_REQUEST : CMD.REMOVE_FRIEND_REQUEST
      const msg = { command, data }
      this.$emit('handleRequestEvent', msg)
      this.friend = ''
    },
    getChatInfo() {
      const data = { id: this.chat.id, type: this.chat.type }
      const msg = { command: CMD.CHAT_INFO_REQUEST, data }
      this.$emit('handleRequestEvent', msg)
    },
    getChatMessage() {
      if (!this.chat) return
      this.isFetching = true
      setTimeout(() => {
        this.isFetching = false
      }, 2000)

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
      this.toBottom = true
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
    toggleEmoji(event) {
      event.stopPropagation()
      this.$emit('update:visible', { ...this.visible, members: false, emoji: !this.visible.emoji })
    },
    handleEmoji(emoji) {
      this.message += [emoji.val]
    },
    async uploadImage(event) {
      let file = event.target.files[0]
      const fileSize = Math.ceil(file.size / 1024)
      const maxSize = 50
      if (fileSize > maxSize) {
        file = await imageConversion.compressAccurately(file, maxSize)
      }
      const reader = new FileReader()
      reader.onload = (e) => {
        const fileValue = e.target.result
        this.$emit('sendMessage', { type: TYPES.PICTURE, url: fileValue }, file)
      }
      reader.readAsDataURL(file)
    },
    handleUploading(form, xhr) {
      this.loading = true
    },
    handleUploaded(response) {
      if (response.success) {
        this.avatar = response.data.link
        this.handleSure(2)

        const img = new Image()
        img.onload = img.onerror = () => {
          this.loading = false
        }
        img.src = this.avatar
      } else {
        this.loading = false
        this.$toasted.error('上传失败')
      }
    },
    handlerError(message, type, xhr) {
      this.loading = false
      this.$toasted.error('上传失败')
    },
    handleSure(type) {
      let data = { id: this.chat.id }
      if (type === 1) {
        // 修改昵称
        const nickname = this.nickname.trim()
        if (!validContent(nickname)) {
          this.$toasted.error('群名称必须为1-12位中文数字字母下划线组合！')
          return
        }
        data.name = nickname
      } else if (type === 2) {
        // 修改头像
        if (this.avatar === '') {
          this.$toasted.error('请先上传头像！')
          return
        }
        data.avatar = this.avatar
      }
      const msg = { command: CMD.UPDATE_GROUP_REQUEST, data }
      this.$emit('handleRequestEvent', msg)
    },
  },
}
</script>

<style lang="scss" scope>
@import './index.scss';
</style>
