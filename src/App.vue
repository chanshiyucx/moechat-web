<template>
  <div id="app">
    <div id="chat">
      <div class="left">
        <div v-if="userInfo" class="l-info">
          <img :src="getRandomAvatar(userInfo.id)" alt />
          <span>ID：{{ userInfo.id }}</span>
          <span>用户名：{{ userInfo.username }}</span>
          <span>昵称：{{ userInfo.nickname }}</span>
          <span>注册时间：{{ userInfo.createTime }}</span>
          <span>在线人数：{{ onlineUserList.length }}</span>
        </div>
        <div v-else class="l-login">
          <div class="l-login_form">
            <span class="l-login_textfield">
              <label>
                <i class="icon icon-user"></i>
                用户名
              </label>
              <input type="text" v-model="userForm.username" />
            </span>
            <span v-if="userFormType === 'register'" class="l-login_textfield">
              <label>
                <i class="icon icon-emo-devil"></i>
                昵称
              </label>
              <input type="text" v-model="userForm.nickname" />
            </span>
            <span class="l-login_textfield">
              <label>
                <i class="icon icon-lock"></i>
                密码
              </label>
              <input type="text" v-model="userForm.password" />
            </span>
            <span v-if="userFormType === 'register'" class="l-login_textfield">
              <label>
                <i class="icon icon-lock"></i>
                确认密码
              </label>
              <input type="text" v-model="userForm.rePassword" />
            </span>
          </div>
          <div class="l-login_error">{{ userFormError }}</div>
          <div class="l-login_option">
            <div @click="handleSwitch">
              <i class="icon icon-left-open-outline"></i>
              {{ userFormType === 'login' ? '注册' : '登录' }}
            </div>
            <div @click="handleUserForm">
              确认
              <i class="icon icon-right-open-outline"></i>
            </div>
          </div>
        </div>
        <ul class="l-list">
          <li v-for="(item, index) in onlineUserList" :key="`${item.id}-${index}`">
            <img :src="getRandomAvatar(item.id)" alt />
            <span>{{ item.nickname }}</span>
          </li>
        </ul>
      </div>
      <div class="right">
        <div ref="chat" class="l-chat">
          <div v-if="imInfo" class="l-history">
            <div v-if="state.history === 0">
              <img :src="loadingImg" width="18" height="18" alt />
            </div>
            <div v-else-if="state.history === 1" @click="getHistory">------------拉取历史消息------------</div>
            <div v-else>------------暂无历史消息------------</div>
          </div>
          <img class="l-kawaii" v-else :src="kawaiiImg" width="71" height="97" alt />
          <ul ref="chatList">
            <li v-for="(item, index) in chatMsgList" :key="index">
              <div :class="['l-msg', userInfo && item.userId === userInfo.id ? 'l-me' : 'l-user']">
                <div class="l-msg-wapper">
                  <img class="l-avatar" :src="getRandomAvatar(item.userId)" alt />
                  <div class="l-content">
                    <span class="l-nickname">{{ item.userNickname }}</span>
                    <div :class="['l-content-wrapper', item.state === 0 && 'l-content-wrapper-loading']">
                      <div v-if="item.msg.contentType === TYPES.TEXT" v-html="toHtml(item.msg.text)" />
                      <LazyImg
                        v-else-if="item.msg.contentType === TYPES.PICTURE"
                        class="l-preview-img"
                        :src="item.msg.url"
                        :width="item.msg.width"
                        :height="item.msg.height"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>
        <div class="l-input">
          <div v-show="visible.mask" class="l-input-mask" />
          <div class="l-input-tool">
            <div v-show="visible.emoji" class="l-emoji">
              <span v-for="item in emojiList" :key="item.name" @click="handleEmoji(item)">
                <img :src="require(`@/assets/emoji/${item.name}.png`)" />
              </span>
            </div>
            <ul class="l-input-menu">
              <li @click="toggleEmoji">
                <i class="icon icon-emo-tongue"></i>
              </li>
              <li>
                <i class="icon icon-picture"></i>
                <input ref="chatFile" type="file" accept="image/png, image/jpg, image/jpeg, image/gif" @change="handleFile" />
              </li>
              <li @click="handleScrollTo(0)">
                <i class="icon icon-up-outline"></i>
              </li>
              <li @click="handleScrollTo(1)">
                <i class="icon icon-down-outline"></i>
              </li>
            </ul>
          </div>
          <div id="inputArea" ref="inputArea" class="l-input-area" contenteditable="true" />
          <div class="l-input-send" @click="handleSendMsg">发送</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import LazyImg from '@/components/LazyImg'
import IM, { CMD, TYPES } from '@/im'
import config from '@/config'
import emoji from '@/assets/emoji.json'
import { localSave, localRead, formatHtml } from '@/utils'
import request from '@/utils/request'
import { validateUsername, validateNickname, validatePassword } from '@/utils/validate'

const localUser = localRead('userInfo')

export default {
  name: 'app',
  components: { LazyImg },
  data() {
    return {
      loadingImg: require('@/assets/images/loading.gif'),
      kawaiiImg: require('@/assets/images/kawaii.gif'),
      ImSocket: null,
      imInfo: null,
      userInfo: localUser ? JSON.parse(localUser) : null,
      TYPES,
      emoji,
      emojiList: [],
      visible: {
        mask: true,
        emoji: false
      },
      state: {
        scrollTop: 0, // 0: 滚动到顶部 1: 滚动到底部 2: 不做任何处理
        history: 0 // 0: 正在拉取 1: 拉取历史消息 2: 暂无历史消息
      },
      chatMsgList: [],
      onlineUserList: [],
      userFormType: 'login',
      userForm: {
        username: '',
        nickname: '',
        password: '',
        rePassword: ''
      },
      userFormError: '',
      inx: 0
    }
  },
  mounted() {
    this.init()

    // 处理表情包数据
    Object.keys(emoji).map(o => {
      this.emojiList.push({ name: emoji[o], val: o })
    })

    // ENTER 键发送消息
    const inputArea = document.getElementById('inputArea')
    inputArea.onkeydown = event => {
      const e = event || window.event
      if (e.keyCode === 13) {
        e.preventDefault()
        this.handleSendMsg()
      }
    }
  },
  watch: {
    chatMsgList: {
      deep: true,
      handler() {
        this.$nextTick(() => {
          this.handleScroll()
        })
      }
    }
  },
  methods: {
    init() {
      try {
        this.instaceIm()
      } catch (error) {
        this.$toast.fail('IM初始化失败')
      }
    },
    instaceIm() {
      this.ImSocket = new IM({
        url: config.imWSURL,
        onconnect: this.onconnect, // 服务器连接成功
        ondisconnect: () => (this.visible.mask = true), // 服务器已断开连接
        onerror: () => (this.visible.mask = true), // 服务器连接发生错误
        onreconnect: () => {}, // 服务器开始重连
        handleResponseEvent: this.handleResponseEvent // 消息业务处理
      })
    },
    onconnect() {
      this.linkStart()
    },
    linkStart() {
      // IM 登录
      this.handleLogin()
      // 获取聊天记录
      this.getHistory()
    },
    linkSuccess(data) {
      if (data.success) {
        this.visible.mask = false
        this.imInfo = data
      }
    },
    handleLogin() {
      if (!this.userInfo) return
      const { id, username, nickname } = this.userInfo
      const data = { id, username, nickname }
      this.handleRequestEvent('login', data)
    },
    async getHistory() {
      this.state.scrollTop = 0
      this.state.history = 0
      const lastMsg = this.chatMsgList[0]
      const req = { lastMsgId: lastMsg && lastMsg.id ? lastMsg.id : 0 }
      const res = await request({
        url: '/chat/msg',
        method: 'GET',
        params: req
      })
      const { data = [], attributes = {} } = res
      try {
        data.filter(o => o.msg).forEach(o => (o.msg = JSON.parse(o.msg)))
      } catch (error) {
        console.log('消息转换失败')
      }
      this.chatMsgList = data.reverse().concat(this.chatMsgList)
      const { pageNum, pageSize, total } = attributes
      this.state.history = pageSize < total ? 1 : 2 // 1: 拉取历史消息 2: 暂无历史消息
    },
    handleSwitch() {
      this.userFormError = ''
      this.userFormType = this.userFormType === 'login' ? 'register' : 'login'
    },
    async handleUserForm() {
      const { username, nickname, password, rePassword } = this.userForm
      // 验证用户名
      const valid1 = validateUsername(username)
      if (!valid1.valid) return (this.userFormError = valid1.message)
      // 验证密码
      const valid2 = validatePassword(password, this.userFormType === 'register' ? rePassword : password)
      if (!valid2.valid) return (this.userFormError = valid2.message)
      // 验证昵称
      if (this.userFormType === 'register') {
        const valid3 = validateNickname(nickname)
        if (!valid3.valid) return (this.userFormError = valid3.message)
      }
      const url = this.userFormType === 'register' ? '/account/register' : '/account/login'
      const req = { username, nickname, password }
      try {
        const res = await request({
          url,
          method: 'POST',
          data: req
        })
        this.userInfo = res.data
        localSave('userInfo', JSON.stringify(res.data))
        this.handleLogin()
      } catch (error) {
        this.userFormError = error.response.data.message
      }
    },
    getRandomAvatar(id) {
      return `http://www.gravatar.com/avatar/${id}?s=256&d=identicon`
    },
    handleSendMsg() {
      this.state.scrollTop = 1
      const sendMsgNodes = this.$refs.inputArea.childNodes
      const res = formatHtml(sendMsgNodes, TYPES)
      // 根据判断图片链接是否为 http 来判断图片是否上传成功
      const stat = !res.some(x => x.contentType === TYPES.PICTURE && x.url.indexOf('http') < 0)
      if (!stat || !res.length) return
      res.forEach(this.sendMsgTask)
      this.$refs.inputArea.innerText = ''
    },
    sendMsgTask(msg) {
      const inx = ++this.inx
      const data = { inx, msg: JSON.stringify(msg) }
      this.handleRequestEvent('sendMsg', data)
      const { id, nickname } = this.userInfo
      const chatMsg = { inx, msg, createTime: new Date(), state: 0, userNickname: nickname, userId: id }
      this.chatMsgList.push(chatMsg)
    },
    sendMsgSuccess(data) {
      const index = this.chatMsgList.findIndex(x => x.inx === data.inx)
      const msg = this.chatMsgList[index]
      msg.createTime = data.date || msg.createTime
      msg.state = 1
      this.$set(this.chatMsgList, index, { ...msg })
    },
    acceptMsg(data) {
      try {
        data.msg = JSON.parse(data.msg)
      } catch (error) {
        console.log('消息转换失败')
      }
      this.chatMsgList.push(data)
    },
    toHtml(text) {
      const str = text
        .replace(/(\[.*?\])/g, $1 => {
          if (this.emoji[$1]) {
            const url = require(`@/assets/emoji/${this.emoji[$1]}.png`)
            return `<img src="${url}" class="emoji" title="emoji" name="${$1}" style="user-select:none" oncontextmenu="return false"/>`
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
    handleEmoji(emoji) {
      const img = document.createElement('img')
      img.width = 30
      img.height = 30
      img.title = 'emoji'
      img.name = emoji.val
      img.src = require(`@/assets/emoji/${emoji.name}.png`)
      this.$refs.inputArea.append(img)
      this.visible.emoji = false
    },
    async handleFile() {
      const file = this.$refs.chatFile.files[0]
      if (!file) return
      const inputArea = document.getElementById('inputArea')
      const img = document.createElement('img')
      inputArea.append(img)
      img.src = this.loadingImg

      const apiUrl = 'https://api.imgur.com/3/image'
      const apiKey = '4433d0ee1f85168'
      const req = new FormData()
      req.append('image', file)
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          Authorization: `Client-ID ${apiKey}`
        },
        body: req
      })
      const data = await res.json()
      img.src = data.data.link
    },
    handleScrollTo(state) {
      this.state.scrollTop = state
      this.handleScroll()
    },
    handleScroll() {
      const height = this.$refs.chat.clientHeight
      const scrollTop = this.$refs.chat.scrollTop
      const scrollHeight = this.$refs.chatList.scrollHeight
      if (this.state.scrollTop === 0) {
        this.$refs.chat.scrollTop = 0
      } else if (this.state.scrollTop === 1 || height + scrollTop >= scrollHeight - 200) {
        this.$refs.chat.scrollTop = scrollHeight + 200
      }
      this.state.scrollTop = 2
    },
    /**
     * 统一处理数据请求逻辑 【工作台 ===》IM】
     * 将不同消息类型转换成对应的消息关键字
     * @param { String } type 消息类型
     * @param { Object } data 消息内容
     */
    handleRequestEvent(type, data) {
      let command
      switch (type) {
        case 'login': // 登录请求
          command = CMD.LOGIN_REQUEST
          break
        case 'sendMsg': // 发送消息
          command = CMD.MESSAGE_REQUEST
          break
        default:
          return
      }
      const msg = { command, data }
      this.ImSocket.handleRequestEvent(msg)
    },
    /**
     * 统一处理消息响应逻辑 【IM ===》工作台】
     * 将接收消息关键字触发不同的回调事件
     * @param { Enumerator } command 消息关键字
     * @param { Object } data 消息内容
     */
    handleResponseEvent(command, data) {
      switch (command) {
        case CMD.LOGIN_RESPONSE: // 响应登录成功
          this.linkSuccess(data)
          break
        case CMD.ONLINE_USER_RESPONSE: // 在线列表
          this.onlineUserList = data.userList
          break
        case CMD.MESSAGE_RESPONSE: // 发送消息成功
          this.sendMsgSuccess(data)
          break
        case CMD.ACCEPT_MESSAGE_RESPONSE: // 接收消息
          this.acceptMsg(data)
          break
        default:
          break
      }
    }
  }
}
</script>

<style lang="scss">
#app {
  display: flex;
  justify-content: center;
  align-items: center;
}

#chat {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 900px;
  height: 600px;
  border-radius: 3px;
  box-shadow: $chat-shadow;
  background-color: $chat-bg;
  > div {
    height: 100%;
  }
  .left {
    width: 260px;
    background-color: $chat-bg;
  }
  .right {
    display: flex;
    flex: 1;
    flex-direction: column;
  }
  .l-info {
    position: relative;
    display: flex;
    flex-direction: column;
    padding: 6px 14px;
    img {
      cursor: pointer;
      position: absolute;
      right: 40px;
      top: 10px;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      text-align: center;
      box-shadow: $chat-shadow;
      border: 4px solid $chat-bg;
      transition: transform 1s ease-out;

      &:hover {
        animation-play-state: paused;
        transform: rotateZ(360deg);
      }
    }
    > span {
      display: flex;
      align-items: center;
      line-height: $line-height-block;
      &::before {
        content: '';
        display: inline-block;
        margin-right: 7px;
        width: 5px;
        height: 5px;
        border-radius: 50%;
        background-color: greenyellow;
        border: 1px solid $purple-deep;
      }
    }
  }
  .l-login {
    .l-login_form {
      margin-top: 12px;
      .l-login_textfield {
        flex: 1;
        display: flex;
        margin: 6px 10px;
        padding: 6px 10px;
        border-radius: 2px;
        background-color: $chat-bg;
        &:last-child {
          margin-bottom: 0;
        }
        label {
          margin-right: 10px;
          width: 76px;
        }
        label i {
          width: 14px;
        }
        input {
          background-color: transparent;
        }
      }
    }
    .l-login_error {
      padding: 6px 14px 0;
      font-size: $font-size-small;
      color: $red;
    }
    .l-login_option {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 60px;
      > div {
        cursor: pointer;
        margin: 0 10px;
        width: 80px;
        height: 30px;
        line-height: 30px;
        color: $whitesmoke;
        text-align: center;
        letter-spacing: 2px;
        border-radius: 3px;
        box-shadow: $bottom-shadow;
        background-color: $purple-dark;
      }
    }
  }

  .l-list {
    list-style: none;
    display: flex;
    justify-content: flex-start;
    flex-wrap: wrap;
    margin: 12px;
    @include scrollBar;
    li {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin: 0 6px 8px;
      img {
        display: inline-block;
        margin-bottom: 2px;
        width: 46px;
        height: 46px;
        border-radius: 50%;
        box-shadow: $chat-shadow;
        border: 4px solid $chat-bg;
      }
      span {
        font-size: $font-size-small;
      }
    }
  }

  .l-chat {
    position: relative;
    height: 440px;
    border-bottom: 1px solid #ddd;
    overflow-y: auto;
    @include scrollBar;

    .l-history {
      cursor: pointer;
      height: 40px;
      line-height: 40px;
      text-align: center;
    }

    .l-kawaii {
      position: absolute;
      top: 50%;
      left: 50%;
      opacity: 0.8;
      transform: translate(-50%, -50%);
    }

    ul {
      list-style: none;
      .l-avatar {
        display: inline-block;
        margin: 4px 10px 2px;
        width: 46px;
        height: 46px;
        border-radius: 50%;
        box-shadow: $chat-shadow;
        border: 4px solid $chat-bg;
      }
      .l-msg {
        display: flex;
        position: relative;
        margin-bottom: 20px;
        text-align: left;
        .l-content {
          display: flex;
          flex-direction: column;
        }
        .l-content-wrapper {
          position: relative;
          padding: 10px 14px;
          max-width: 400px;
          border-radius: 10px;
          background-color: $chat-bg;
          box-shadow: $msg-shadow;
          overflow: hidden;
        }
        .l-content-wrapper-loading {
          background-color: $red !important;
        }
        .l-nickname {
          padding: 0 4px 2px;
          font-size: $font-size-small;
        }
        .l-preview-img {
          max-width: 300px;
          border-radius: 5px;
          overflow: hidden;
        }
      }
      .l-me {
        justify-content: flex-end;
        .l-msg-wapper {
          display: flex;
          flex-direction: row-reverse;
        }
        .l-content {
          align-items: flex-end;
        }
        .l-content-wrapper {
          color: $whitesmoke;
          background-color: $purple-dark;
          border-top-right-radius: 0;
        }
      }
      .l-user {
        justify-content: flex-start;
        .l-msg-wapper {
          display: flex;
          flex-direction: row;
        }
        .l-content {
          align-items: flex-start;
        }
        .l-content-wrapper {
          border-top-left-radius: 0;
        }
      }
    }
  }

  .l-input {
    flex: 1;
    position: relative;
    .l-input-mask {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      background-color: $mask-bg;
      z-index: $zindex-2;
    }
    .l-input-tool {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 12px;
      width: 100%;
      height: 36px;
      .l-emoji {
        position: absolute;
        top: 0;
        left: 0;
        padding: 8px 6px;
        width: 600px;
        height: 200px;
        overflow: auto;
        transform: translateY(-100%);
        background-color: $emoji-bg;
        user-select: none;
        box-shadow: 0 0 10px inset rgba(0, 0, 0, 0.1);
        @include scrollBar;

        img {
          cursor: pointer;
          margin: 0 4px;
          width: 28px;
          height: 28px;
        }
      }
      .l-input-menu {
        list-style: none;
        display: flex;
        li {
          cursor: pointer;
          margin-right: 16px;
          font-size: 18px;
        }
        li:nth-child(2) {
          position: relative;
          input {
            position: absolute;
            top: 0;
            left: 0;
            width: 20px;
            height: 20px;
            opacity: 0;
          }
        }
      }
    }
    .l-input-send {
      cursor: pointer;
      position: absolute;
      right: 16px;
      bottom: 14px;
      width: 70px;
      height: 30px;
      line-height: 30px;
      letter-spacing: 3px;
      text-align: center;
      color: $whitesmoke;
      border-radius: 3px;
      box-shadow: $bottom-shadow;
      background-color: $purple-dim;
    }
    .l-input-area {
      padding: 5px 10px;
      height: 100%;
      outline: none;
      @include scrollBar;
    }
  }
}
</style>
