<template>
  <div id="app">
    <div id="chat">
      <div class="left">
        <div v-if="userInfo" class="l-user">
          <span>ID：{{ userInfo.id }}</span>
          <span>用户名：{{ userInfo.username }}</span>
          <span>昵称：{{ userInfo.nickname }}</span>
          <span>注册时间：{{ userInfo.createTime }}</span>
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
        <div class="l-list"></div>
      </div>
      <div class="right"></div>
    </div>
  </div>
</template>

<script>
import IM, { CMD, TYPES } from '@/im'
import config from '@/config'
import { localSave, localRead } from '@/utils'
import request from '@/utils/request'
import { validateUsername, validateNickname, validatePassword } from '@/utils/validate'

const localUser = localRead('userInfo')

export default {
  name: 'app',
  data() {
    return {
      ImSocket: null,
      userInfo: localUser ? JSON.parse(localUser) : null,
      imInfo: null,
      visible: {
        mask: true
      },
      state: {
        scrollTop: 0, // 0: 滚动到顶部 1: 滚动到底部
        history: 0 // 0: 正在拉取 1: 拉取历史消息 2: 暂无历史消息
      },
      chatMsgList: [],
      userFormType: 'login',
      userForm: {
        username: '',
        nickname: '',
        password: '',
        rePassword: ''
      },
      userFormError: ''
    }
  },
  created() {
    this.init()
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
        ondisconnect: () => {}, // 服务器已断开连接
        onerror: () => {}, // 服务器连接发生错误
        onreconnect: () => {}, // 服务器开始重连
        handleResponseEvent: this.handleResponseEvent // 消息业务处理
      })
    },
    onconnect() {
      this.linkStart()
    },
    linkStart() {
      // IM 登录
      if (this.userInfo) {
        const { id, username, nickname } = this.username
        const data = { id, username, nickname }
        this.handleRequestEvent('login', data)
      }
      // 获取聊天记录
      this.getHistory()
    },
    linkSuccess(data) {
      if (data.success) {
        this.visible.mask = false
        this.imInfo = data
      }
    },
    async getHistory(topState) {
      this.state.scrollTop = topState
      this.state.history = 0
      const lastMsg = this.chatMsgList[0]
      const req = { lastMsgId: lastMsg ? lastMsg.id : 0 }
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
      this.chatMsgList = data.concat(this.chatMsgList)
      const { pageNum, pageSize, total } = attributes
      this.state.history = pageNum * pageSize < total ? 1 : 2 // 1: 拉取历史消息 2: 暂无历史消息
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
      } catch (error) {
        this.userFormError = error.response.data.message
      }
    },
    /**
     * 统一处理数据请求逻辑 【工作台 ===》IM】
     * 将不同消息类型转换成对应的消息关键字
     * @param { String } type 消息类型
     * @param { Object } data 消息内容
     */
    handleRequestEvent(type, data) {
      let command, newData
      switch (type) {
        case 'login': // 登录请求
          command = CMD.LOGIN_REQUEST
          newData = { ...data }
          break
        default:
          return
      }
      const msg = { command, data: newData }
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
    background-color: $chat-mask;
  }
  .right {
    flex: 1;
  }
  .l-user {
    display: flex;
    flex-direction: column;
    padding: 6px 10px;
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
}
</style>
