<template>
  <div id="sidebar">
    <div v-if="!userInfo.tourist" class="header" @click="toggleEdit(true)">
      <Avatar class="avatar" :userId="userInfo.sender" :avatar="userInfo.avatar" />
      <span :class="['dot', online && 'active']"></span>
    </div>
    <ul></ul>
    <div class="edit" v-show="visible.edit">
      <div class="head">
        <h3>个人信息设置</h3>
        <i class="icon icon-cancel-outline" @click="toggleEdit(false)"></i>
      </div>
      <div class="body">
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
</template>

<script>
import { CMD } from '@/IM'
import Avatar from '../Avatar'
import { validNameOrPW, validNickname } from '@/utils'

export default {
  name: 'Sidebar',
  components: { Avatar },
  props: {
    online: {
      type: Boolean,
      default: false,
    },
    userInfo: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      visible: {
        edit: false,
      },
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
    toggleEdit(state) {
      this.visible.edit = state
    },
    handleSure(type) {
      let data
      if (type === 1) {
        // 修改头像
      } else if (type === 2) {
        // 修改昵称
        const nickname = this.nickname.trim()
        if (!validNickname(nickname)) {
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
      const msg = { command: CMD.UPDATE_USERINFO_REQUEST, data }
      console.log('msg', msg)
      this.$emit('handleRequestEvent', msg)
    },
  },
}
</script>

<style lang="scss" scope>
@import './index.scss';
</style>
