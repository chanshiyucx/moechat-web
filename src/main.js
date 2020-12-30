import Vue from 'vue'
import Toasted from 'vue-toasted'
import App from './App.vue'
import Time from '@/utils/time'

// Layout and Font
import '@/styles/index.scss'
import '@/assets/font/fontello.scss'
import 'viewerjs/dist/viewer.css'

Vue.config.productionTip = false

// 全局时间格式化过滤器
Vue.filter('formatTime', (time) => {
  const messageTime = new Date(time)
  const nowTime = new Date()
  if (Time.isToday(nowTime, messageTime)) {
    return Time.getHourMinute(messageTime)
  }
  if (Time.isYesterday(nowTime, messageTime)) {
    return `昨天${Time.getHourMinute(messageTime)}`
  }
  return `${Time.getMonthDate(messageTime)} ${Time.getHourMinute(messageTime)}`
})

Vue.use(Toasted, { theme: 'bubble', position: 'top-center', duration: 3000 })

new Vue({
  render: (h) => h(App),
}).$mount('#app')
