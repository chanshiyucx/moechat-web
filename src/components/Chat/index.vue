<template>
  <div class="chat">
    <div class="header"></div>
    <div class="body"></div>
    <div class="footer">
      <p v-if="userInfo.tourist" class="guest">
        游客朋友你好, 请<b class="guestLogin" role="button" @click="login">登录</b>后参与聊天
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Chat',
  props: {
    userInfo: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {}
  },
  methods: {
    login() {
      this.$emit('togglePanel', true)
    }
  }
}
</script>

<style lang="scss" scope>
@import './index.scss';
</style>
