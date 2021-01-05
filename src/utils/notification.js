let notification = {}

notification.install = function (Vue, options) {
  Vue.prototype.$notification = (title, options) => {
    // 先检查浏览器是否支持
    if (!('Notification' in window)) {
      alert('很抱歉当前浏览器不支持桌面通知！')
    } else if (Notification.permission === 'granted') {
      // 检查用户是否同意接受通知
      notification = new Notification(title, options)
      notification.onclick = function () {
        window.focus()
      }
    } else if (Notification.permission !== 'denied') {
      // 否则我们需要向用户获取权限
      Notification.requestPermission(function (permission) {
        // 如果用户同意，就可以向他们发送通知
        if (permission === 'granted') {
          notification = new Notification(title, options)
          notification.onclick = function () {
            window.focus()
          }
        }
      })
    }
  }
}

export default notification
