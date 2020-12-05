<template>
  <div id="panel" v-show="showPanel">
    <div class="mask" @click="hidePanel"></div>
    <div class="container">
      <div class="wrapper">
        <div class="short-line">
          <div></div>
          <div></div>
        </div>
        <div class="main">
          <div class="header">
            <div class="inner">注册或登录</div>
          </div>
          <div class="body" v-if="showPanel">
            <div><b>用户名</b><input type="text" v-model="username" /></div>
            <div><b>密码</b><input type="password" v-model="password" /></div>
          </div>
          <div class="footer">
            <div class="cursor" @click="login">注册或登录</div>
          </div>
        </div>
        <div class="long-line">
          <div></div>
          <div></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { localSave, localRead } from '@/utils'

export default {
  name: 'Panel',
  props: {
    showPanel: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      username: localRead('username'),
      password: '',
    }
  },
  mounted() {},
  methods: {
    login() {
      const regex = /^[a-zA-Z0-9._-]{3,12}$/
      if (!regex.test(this.username) || !regex.test(this.password)) {
        this.$toasted.error('用户名和密码必须为3-12位数字字母下划线组合！')
        return
      }
      localSave('username', this.username)
      this.$emit('login', { username: this.username, password: this.password })
    },
    // 关闭面板
    hidePanel() {
      this.$emit('togglePanel', false)
    },
  },
}
</script>

<style lang="scss" scoped>
@import './index.scss';
</style>
