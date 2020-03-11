import Vue from 'vue'
import Toasted from 'vue-toasted'
import App from './App.vue'
import './styles/index.scss'
import './assets/font/fontello.scss'

Vue.use(Toasted, {
  theme: 'bubble',
  position: 'top-right',
  duration: 5000
})

Vue.config.productionTip = false

new Vue({
  render: h => h(App)
}).$mount('#app')
