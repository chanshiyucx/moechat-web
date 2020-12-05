<template>
  <div class="group">
    <ul>
      <li
        v-for="it in chatList"
        :key="`${it.type}_${it.id}`"
        @click="handleChat(it)"
        :class="it.id === chat.id && it.type === chat.type ? 'active' : ''"
      >
        <img class="avatar" :src="it.avatar" alt />
        <div>
          <div class="head">
            <p class="name">{{ it.name }}</p>
            <p class="time">15:18</p>
          </div>
          <div class="preview">
            <p>我是不想去上班</p>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'Group',
  props: {
    chatList: {
      type: Array,
      defalt: () => []
    },
    chat: {
      type: Object,
      defalt: () => {}
    }
  },
  data() {
    return {}
  },

  methods: {
    handleChat(chat) {
      this.$emit('setChat', chat)
    }
  }
}
</script>

<style lang="scss" scope>
@import './index.scss';
</style>
