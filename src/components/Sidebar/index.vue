<template>
  <div id="sidebar">
    <div v-if="!userInfo.tourist" class="header" @click="toggleEdit(true)">
      <Avatar class="avatar" :userId="userInfo.userId" :avatar="userInfo.avatar" />
      <span :class="['dot', online && 'active']"></span>
    </div>
    <ul>
      <li>
        <i class="icon icon-github-circled" @click="handleMenu('code')"></i>
        <span>源码</span>
      </li>
      <li>
        <i class="icon icon-info" @click="handleMenu('statistics')"></i>
        <span>关于</span>
      </li>
      <li>
        <i class="icon icon-cog" @click="handleMenu('setting')"></i>
        <span>设置</span>
      </li>
      <li v-if="!userInfo.tourist">
        <i class="icon icon-off" @click="handleMenu('logout')"></i>
        <span>退出登录</span>
      </li>
    </ul>

    <div class="edit dialog" v-show="visible.edit">
      <div class="mask" @click="toggleEdit(false)"></div>
      <div class="content">
        <div class="head">
          <h3>个人信息设置</h3>
          <i class="icon icon-cancel-outline" @click="toggleEdit(false)"></i>
        </div>
        <div class="body i-scroll">
          <div class="block">
            <p>修改头像</p>
            <div class="avatar-wrapper">
              <Avatar
                id="pick-avatar"
                :class="['avatar', loading && 'blur']"
                :userId="userInfo.userId"
                :avatar="userInfo.avatar"
              />
              <Loading v-show="loading" />
            </div>
            <Cropper
              trigger="#pick-avatar"
              @uploading="handleUploading"
              @uploaded="handleUploaded"
              @error="handlerError"
            />
          </div>
          <div class="block">
            <p>修改昵称</p>
            <input type="text" v-model="nickname" placeholder="昵称" />
            <button @click="handleSure(2)">确认修改</button>
          </div>
          <div class="block">
            <p>修改密码</p>
            <input
              type="password"
              v-model="oldPassword"
              placeholder="旧密码"
              minlength="3"
              maxlength="12"
              autocomplete="new-password"
            />
            <input type="password" v-model="newPassword" placeholder="新密码" minlength="3" maxlength="12" />
            <button @click="handleSure(3)">确认修改</button>
          </div>
        </div>
      </div>
    </div>

    <div class="statistics dialog" v-show="visible.statistics">
      <div class="mask" @click="toggleStatittics(false)"></div>
      <div class="content">
        <div class="head">
          <h3>关于</h3>
          <i class="icon icon-cancel-outline" @click="toggleStatittics(false)"></i>
        </div>
        <div class="body">
          <p>萌聊已经萌萌哒运行了{{ statistics.diffTime }}<span class="my-face">(●'◡'●)ﾉ♥</span></p>
          <p>总共注册用户{{ statistics.totalRegisterUser }}人，发送消息{{ statistics.totalSendMessage }}条。</p>
          <p>今日注册用户{{ statistics.todayRegisterUser }}人，发送消息{{ statistics.todaySendMessage }}条。</p>
          <p>Made with by <a href="https://github.com/chanshiyucx" target="_blank">蝉时雨</a>.</p>
        </div>
      </div>
    </div>

    <div class="setting dialog" v-show="visible.setting">
      <div class="mask" @click="toggleSetting(false)"></div>
      <div class="content">
        <div class="head">
          <h3>设置</h3>
          <i class="icon icon-cancel-outline" @click="toggleSetting(false)"></i>
        </div>
        <div class="body">
          <div class="block">
            <p>开关</p>
            <div class="switch">
              <div>
                <span>桌面提醒</span>
                <ToggleButton
                  :value="setting.notice"
                  :width="55"
                  :labels="{ checked: 'ON', unchecked: 'OFF' }"
                  color="rgba(5, 159, 149, 0.8)"
                  @change="onNoticeChange"
                />
              </div>
              <div>
                <span>语音播报</span>
                <ToggleButton
                  :value="setting.sound"
                  :width="55"
                  :labels="{ checked: 'ON', unchecked: 'OFF' }"
                  color="rgba(5, 159, 149, 0.8)"
                  @change="onSoundChange"
                />
              </div>
            </div>
          </div>
          <div class="block">
            <p>主题</p>
            <ul class="theme">
              <li v-for="th in themeList" :key="th.name" @click="setTheme(th)">
                <div :class="th.name === theme.name && 'active'">
                  <img :src="th.src" />
                </div>
                <p>{{ th.name }}</p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { CMD } from '@/IM'
import Avatar from '../Avatar'
import Loading from '../Loading'
import Cropper from '../Cropper'
import { validNameOrPW, validContent } from '@/utils'

export default {
  name: 'Sidebar',
  components: { Cropper, Avatar, Loading },
  props: {
    online: {
      type: Boolean,
      default: false,
    },
    userInfo: {
      type: Object,
      default: () => {},
    },
    statistics: {
      type: Object,
      default: () => {},
    },
    setting: {
      type: Object,
      default: () => {},
    },
    themeList: {
      type: Array,
      default: () => [],
    },
    theme: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      visible: {
        edit: false,
        statistics: false,
        setting: false,
      },
      loading: false,
      avatar: '',
      nickname: '',
      oldPassword: '',
      newPassword: '',
    }
  },
  watch: {
    userInfo(val) {
      const { avatar = '', nickname } = val
      this.avatar = avatar
      this.nickname = nickname
    },
  },
  methods: {
    setTheme(theme) {
      this.$emit('update:theme', theme)
    },
    toggleEdit(state) {
      this.visible.edit = state
    },
    toggleStatittics(state) {
      this.visible.statistics = state
    },
    toggleSetting(state) {
      this.visible.setting = state
    },
    onNoticeChange(e) {
      this.$emit('update:setting', { ...this.setting, notice: e.value })
    },
    onSoundChange(e) {
      this.$emit('update:setting', { ...this.setting, sound: e.value })
    },
    handleUploading(form, xhr) {
      this.loading = true
    },
    handleUploaded(response) {
      if (response.success) {
        this.avatar = response.data.link
        this.handleSure(1)

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
      let data
      if (type === 1) {
        // 修改头像
        if (this.avatar === '') {
          this.$toasted.error('请先上传头像！')
          return
        }
        data = { avatar: this.avatar }
      } else if (type === 2) {
        // 修改昵称
        const nickname = this.nickname.trim()
        if (!validContent(nickname)) {
          this.$toasted.error('昵称必须为1-12位中文数字字母下划线组合！')
          return
        }
        data = { nickname }
      } else if (type === 3) {
        // 修改密码
        const oldPassword = this.oldPassword.trim()
        const newPassword = this.newPassword.trim()
        if (oldPassword === '') {
          this.$toasted.error('旧密码不能为空！')
          return
        }
        if (oldPassword === newPassword) {
          this.$toasted.error('新密码不能与旧密码相同！')
          return
        }
        if (!validNameOrPW(newPassword)) {
          this.$toasted.error('新密码必须为3-12位数字字母下划线组合！')
          return
        }
        data = { oldPassword, newPassword }
      }
      const msg = { command: CMD.UPDATE_USER_REQUEST, data }
      this.$emit('handleRequestEvent', msg)
    },
    handleMenu(option) {
      switch (option) {
        case 'code':
          window.open('https://github.com/chanshiyucx/moechat', '_blank')
          break
        case 'statistics':
          this.handleStatistics()
          break
        case 'setting':
          this.handleSetting()
          break
        case 'logout':
          this.$emit('logout')
          break
        default:
          break
      }
    },
    handleStatistics() {
      const msg = { command: CMD.STATISTICS_REQUEST, data: {} }
      this.$emit('handleRequestEvent', msg)
      this.visible.statistics = true
    },
    handleSetting() {
      this.visible.setting = true
    },
  },
}
</script>

<style lang="scss" scope>
@import './index.scss';
</style>
