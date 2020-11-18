<template>
  <div id="app">
    <div class="container" :style="chatStyle">
      <Sidebar />
      <Group />
    </div>
  </div>
</template>

<script>
import config from './config'
import IM, { CMD } from '@/IM'
import { getWidthPercent, getHeightPercent } from '@/utils/device'
import Sidebar from '@/components/Sidebar'
import Group from '@/components/Group'

export default {
  name: 'App',
  components: { Sidebar, Group },
  data() {
    return {
      ImSocket: null,
      width: getWidthPercent(),
      height: getHeightPercent()
    }
  },
  created() {
    this.init()
  },
  computed: {
    chatStyle() {
      return {
        width: `${this.width * 100}%`,
        height: `${this.height * 100}%`,
        left: `${((1 - this.width) / 2) * 100}%`,
        top: `${((1 - this.height) / 2) * 100}%`
      }
    }
  },
  mounted() {
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
  },
  methods: {
    // 窗口监听
    handleResize() {
      this.width = getWidthPercent()
      this.height = getHeightPercent()
    },
    init() {
      this.ImSocket = new IM({
        url: config.imURL,
        onconnect: this.onconnect,
        ondisconnect: () => {},
        onerror: () => {},
        handleResponseEvent: this.handleResponseEvent
      })
    },
    onconnect() {},
    login() {
      const msg = {
        command: CMD.LOGIN_REQUEST,
        data: {
          username: 'shiyu',
          password: '124'
        }
      }
      this.handleRequestEvent(msg)
    },
    close() {
      this.ImSocket.closeSocket()
    },
    handleRequestEvent(msg) {
      this.ImSocket.handleRequestEvent(msg)
    },
    handleResponseEvent(msg) {
      console.log('msg========', msg)
    }
  }
}
</script>

<style lang="scss" scope>
#app {
  background-image: url('./assets/images/bg.jpg');
  background-repeat: no-repeat;
}

.container {
  position: absolute;
  display: flex;
  border-radius: 10px;
  box-shadow: 0px 0px 60px rgba(0, 0, 0, 0.5);
}
</style>
