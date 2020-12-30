<template>
  <div id="group">
    <ul>
      <li
        v-for="it in chatList"
        :key="`${it.type}_${it.id}`"
        @click="handleChat(it)"
        :class="it.id === chat.id && it.type === chat.type ? 'active' : ''"
      >
        <Avatar class="avatar" :userId="it.id" :avatar="it.avatar" />
        <div>
          <div class="head">
            <p class="name">{{ it.name }}</p>
            <p class="time">15:18</p>
          </div>
          <div class="preview">
            <p>摸鱼打卡</p>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import Avatar from '../Avatar'

export default {
  name: 'Group',
  components: { Avatar },
  props: {
    chatList: {
      type: Array,
      defalt: () => [],
    },
    chat: {
      type: Object,
      defalt: () => {},
    },
  },
  data() {
    return {}
  },

  methods: {
    handleChat(chat) {
      this.$emit('setChat', chat)
    },
  },
}
</script>

<style lang="scss" scope>
@import './index.scss';
</style>
