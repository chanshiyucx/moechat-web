const isDev = /^(192\.168|localhost)/.test(window.location.host)
if (!isDev) {
  console.log = () => {}
  console.info = () => {}
  console.warn = () => {}
}

let baseURL, imURL
if (isDev) {
  baseURL = 'http://192.168.100.147:8000'
  imURL = 'ws://192.168.100.147:8002/chat'
} else {
  baseURL = 'http://192.168.100.147:8000'
  imURL = 'ws://192.168.100.147:8002/chat'
}

export default {
  baseURL,
  imURL,
  imgurAPI: 'https://api.imgur.com/3/image',
  imgurID: '842b0a2e058d98b',
}
