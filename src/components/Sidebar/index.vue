<template>
  <div class="sidebar">
    <div class="head" @click="handleEdit">
      <Avatar class="avatar" :userId="userInfo.sender" :avatar="userInfo.avatar" />
      <span :class="['dot', online && 'active']"></span>
    </div>
    <ul></ul>
  </div>
</template>

<script>
import Avatar from '../Avatar'

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
  methods: {
    handleEdit() {},
  },
}
</script>

<style lang="scss" scope>
@import './index.scss';
</style>
