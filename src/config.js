const isDev = /^(192\.168|localhost)/.test(window.location.host)
if (!isDev) {
  console.log = () => {}
  console.info = () => {}
  console.warn = () => {}
}

let baseURL, imURL
if (isDev) {
  baseURL = 'http://127.0.0.1:8000'
  imURL = 'ws://127.0.0.1:8002/chat'
} else {
  baseURL = 'http://127.0.0.1:8000'
  imURL = 'ws://127.0.0.1:8002/chat'
}

export default {
  baseURL,
  imURL,
}
