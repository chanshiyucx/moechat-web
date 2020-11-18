import Vue from 'vue'
import App from './App.vue'

// Layout and Font
import '@/styles/index.scss'

Vue.config.productionTip = false

new Vue({
  render: (h) => h(App),
}).$mount('#app')
