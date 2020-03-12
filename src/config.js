const isDev = /^(192\.168|localhost)/.test(window.location.host)
let baseURL, imWSURL
if (!isDev) {
  baseURL = 'http://localhost:8090'
  imWSURL = 'ws://localhost:7002/chat'
} else {
  baseURL = 'http://moechat.com'
  imWSURL = 'ws://moechat.com/chat'
}

export default {
  baseURL,
  imWSURL
}
