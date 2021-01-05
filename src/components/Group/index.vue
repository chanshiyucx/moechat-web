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
        <i class="icon icon-cancel-outline" @click="handleClear(true)"></i>
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
          <li :class="['i-scroll', tab === 1 && 'active']">
            <div v-if="searchResult.length">
              <div v-if="searchUser.length">
                <p class="subtitle">用户</p>
                <ul>
                  <li
                    class="item"
                    v-for="it in searchUser.slice(0, 3)"
                    :key="`${it.type}_${it.id}`"
                    @click="handleMember(it)"
                  >
                    <Avatar class="avatar" :userId="it.id" :avatar="it.avatar" />
                    <p>{{ it.name }}</p>
                  </li>
                </ul>
                <p class="more" v-if="searchUser.length > 3" @click="tab = 2">查看更多</p>
              </div>
              <div v-if="searchGroup.length">
                <p class="subtitle">群组</p>
                <ul>
                  <li
                    class="item"
                    v-for="it in searchGroup.slice(0, 3)"
                    :key="`${it.type}_${it.id}`"
                    @click="handleMember(it)"
                  >
                    <Avatar class="avatar" :userId="it.id" :avatar="it.avatar" />
                    <p>{{ it.name }}</p>
                  </li>
                </ul>
                <p class="more" v-if="searchGroup.length > 3" @click="tab = 3">查看更多</p>
              </div>
            </div>
            <p v-else>没有搜索到内容, 换个关键字试试吧~~</p>
          </li>
          <li :class="['i-scroll', tab === 2 && 'active']">
            <div v-if="searchUser.length">
              <div v-if="searchUser.length">
                <ul>
                  <li class="item" v-for="it in searchUser" :key="`${it.type}_${it.id}`" @click="handleMember(it)">
                    <Avatar class="avatar" :userId="it.id" :avatar="it.avatar" />
                    <p>{{ it.name }}</p>
                  </li>
                </ul>
              </div>
            </div>
            <p v-else>没有搜索到内容, 换个关键字试试吧~~</p>
          </li>
          <li :class="['i-scroll', tab === 3 && 'active']">
            <div v-if="searchGroup.length">
              <div v-if="searchGroup.length">
                <ul>
                  <li class="item" v-for="it in searchGroup" :key="`${it.type}_${it.id}`" @click="handleMember(it)">
                    <Avatar class="avatar" :userId="it.id" :avatar="it.avatar" />
                    <p>{{ it.name }}</p>
                  </li>
                </ul>
              </div>
            </div>
            <p v-else>没有搜索到内容, 换个关键字试试吧~~</p>
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

    <div class="friend dialog" v-show="friend">
      <div class="mask" @click="friend = ''"></div>
      <div class="content">
        <div class="head">
          <Avatar class="avatar" :userId="friend.id" :avatar="friend.avatar" />
          <p>{{ friend.name }}</p>
          <i class="icon icon-cancel-outline" @click="friend = ''"></i>
        </div>
        <div class="footer">
          <button v-if="isInChat()" @click="handleSend">发送消息</button>
          <button v-else @click="handleFriend">{{ friend.type === CHAT.USER ? '加为好友' : '加入群组' }}</button>
        </div>
      </div>
    </div>

    <ul class="chat-list i-scroll">
      <li
        v-for="it in chatList"
        :key="`${it.type}_${it.id}`"
        @click="setChat(it)"
        :class="it.id === chat.id && it.type === chat.type ? 'active' : ''"
      >
        <div class="left">
          <Avatar class="avatar" :userId="it.id" :avatar="it.avatar" />
          <span v-if="it.type === CHAT.USER" :class="['dot', isOnline(it.id) && 'active']"></span>
        </div>
        <div>
          <div class="head">
            <div>
              <p class="name">{{ it.name }}</p>
              <p v-if="it.type !== CHAT.USER" :class="['label', it.type === CHAT.CHANNEL && 'channel-label']">
                {{ it.type === CHAT.CHANNEL ? '世界频道' : '群组' }}
              </p>
            </div>
            <p class="time">{{ it.updateTime | formatTime }}</p>
          </div>
          <div class="preview">
            <p>{{ lastMessage(it) }}</p>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import { CMD, TYPES, CHAT } from '@/IM'
import Avatar from '../Avatar'
import { validContent } from '@/utils'

export default {
  name: 'Group',
  components: { Avatar },
  props: {
    visible: {
      type: Object,
      defalt: () => {},
    },
    userInfo: {
      type: Object,
      default: () => {},
    },
    chatList: {
      type: Array,
      defalt: () => [],
    },
    chat: {
      type: Object,
      defalt: () => {},
    },
    chatMessage: {
      type: Object,
      default: () => {},
    },
    searchResult: {
      type: Array,
      defalt: () => [],
    },
    onlineUser: {
      type: Array,
      defalt: () => [],
    },
  },
  data() {
    return {
      CHAT,
      result: [],
      tab: 1,
      content: '',
      group: '',
      friend: '',
    }
  },
  computed: {
    searchUser() {
      return this.searchResult.filter((it) => it.type === CHAT.USER)
    },
    searchGroup() {
      return this.searchResult.filter((it) => it.type === CHAT.GROUP)
    },
  },
  methods: {
    isOnline(id) {
      return this.onlineUser.includes(id)
    },
    setChat(chat) {
      this.$emit('setChat', chat)
    },
    lastMessage(chat) {
      const key = `${chat.id}_${chat.type}`
      const messageList = this.chatMessage[key] || []
      const len = messageList.length
      if (!len) return '暂无消息'
      const message = messageList[len - 1].message
      if (message.type === TYPES.PICTURE) {
        return '[图片]'
      } else {
        return message.text
      }
    },
    onFocus() {
      this.$emit('update:visible', { ...this.visible, search: true })
    },
    handleClear(focus = false) {
      this.content = ''
      this.result = []
      this.friend = ''
      if (focus) {
        this.$refs.searchInput.focus()
      }
      this.$emit('update:visible', { ...this.visible, search: focus })
      this.$emit('update:searchResult', [])
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
    isInChat() {
      return this.chatList.find((o) => o.type === this.friend.type && o.id === this.friend.id)
    },
    handleMember(it) {
      this.friend = it
    },
    handleFriend() {
      let msg
      const id = this.friend.id
      if (this.friend.type === CHAT.USER) {
        msg = { command: CMD.ADD_FRIEND_REQUEST, data: { userId: id } }
      } else {
        msg = { command: CMD.JOIN_GROUP_REQUEST, data: { groupId: id } }
      }
      this.$emit('handleRequestEvent', msg)
      this.handleClear(false)
    },
    handleSend() {
      this.setChat(this.friend)
      this.handleClear(false)
    },
  },
}
</script>

<style lang="scss" scope>
@import './index.scss';
</style>
