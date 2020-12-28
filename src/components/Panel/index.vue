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
            <div><b>用户名</b><input type="text" v-model="username" minlength="3" maxlength="12" /></div>
            <div><b>密码</b><input type="password" v-model="password" minlength="3" maxlength="12" /></div>
          </div>
          <div class="footer">
            <button @click="login">注册或登录</button>
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
import { localSave, localRead, validNameOrPW } from '@/utils'

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
      if (!validNameOrPW(this.username) || !validNameOrPW(this.password)) {
        this.$toasted.error('用户名和密码必须为3-12位数字字母下划线组合！')
        return
      }
      localSave('username', this.username)
      this.$emit('login', { username: this.username, password: this.password })
    },
    // 关闭面板
    hidePanel() {
      this.$emit('update:showPanel', false)
    },
  },
}
</script>

<style lang="scss" scoped>
@import './index.scss';
</style>
