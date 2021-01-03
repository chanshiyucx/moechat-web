<template>
  <div id="group">
    <div class="search">
      <div :class="['search-form', visible.search && 'focus']">
        <i class="icon icon-search"></i>
        <input
          ref="searchInput"
          type="text"
          v-model="content"
          @focus="onFocus"
          @keyup.enter="handleSearch"
          placeholder="搜索群组/用户"
        />
        <i class="icon icon-cancel-outline" @click="handleClear"></i>
      </div>
      <div v-show="!visible.search" class="add">
        <i class="icon icon-plus-circled" @click="toggleGroup(true)"></i>
      </div>
      <div v-show="visible.search" class="search-result">
        <div class="head">
          <ul>
            <li @click="tab = 1">全部</li>
            <li @click="tab = 2">用户</li>
            <li @click="tab = 3">群组</li>
          </ul>
          <div :class="['line', `line-${tab}`]"></div>
        </div>
        <ul :class="['result', `result-${tab}`]">
          <li>
            <p>没有搜索到内容, 换个关键字试试吧~~</p>
          </li>
          <li>
            <p>没有搜索到内容, 换个关键字试试吧~~</p>
          </li>
          <li>
            <p>没有搜索到内容, 换个关键字试试吧~~</p>
          </li>
        </ul>
      </div>
    </div>
    <div class="group dialog" v-show="visible.group">
      <div class="mask" @click="toggleGroup(false)"></div>
      <div class="content">
        <div class="head">
          <h3>创建群组</h3>
          <i class="icon icon-cancel-outline" @click="toggleGroup(false)"></i>
        </div>
        <div class="body i-scroll">
          <input type="text" v-model="group" placeholder="请输入群组名" />
          <button @click="handleCreateGroup">创建</button>
        </div>
      </div>
    </div>
    <ul class="chat-list i-scroll">
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
            <p class="time">{{ it.updateTime | formatTime }}</p>
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
import { CMD } from '@/IM'
import Avatar from '../Avatar'
import { validContent } from '@/utils'

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
    visible: {
      type: Object,
      defalt: () => {},
    },
  },
  data() {
    return {
      result: [],
      tab: 1,
      content: '',
      group: '',
    }
  },
  methods: {
    handleChat(chat) {
      this.$emit('setChat', chat)
    },
    onFocus() {
      this.$emit('update:visible', { ...this.visible, search: true })
    },
    handleClear() {
      this.content = ''
      this.result = []
      this.$refs.searchInput.focus()
    },
    toggleGroup(state) {
      this.group = ''
      this.$emit('update:visible', { ...this.visible, group: state })
    },
    handleCreateGroup() {
      const name = this.group.trim()
      if (!validContent(name)) {
        this.$toasted.error('群名称必须为1-12位中文数字字母下划线组合！')
        return
      }
      const msg = { command: CMD.CREATE_GROUP_REQUEST, data: { name } }
      this.$emit('handleRequestEvent', msg)
    },
    handleSearch() {
      const search = this.content.trim()
      if (search === '') return
      const msg = { command: CMD.SEARCH_REQUEST, data: { keyword: search } }
      this.$emit('handleRequestEvent', msg)
    },
  },
}
</script>

<style lang="scss" scope>
@import './index.scss';
</style>
