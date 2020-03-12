/**
 * @param {string} key
 * @param {string} value
 */
export const localSave = (key, value) => {
  localStorage.setItem(key, value)
}

/**
 * @param {string} key
 * @param {string} defaultValue
 */
export const localRead = (key, defaultValue = '') => {
  return localStorage.getItem(key) || defaultValue
}

/**
 * 处理输入内容
 * @param {*} arr
 * @param {*} TYPES
 */
export const formatHtml = (arr, TYPES) => {
  const data = []
  ;[...arr].forEach(o => {
    // 图片类型
    if (o.nodeType === 1 && o.nodeName === 'IMG') {
      if (o.title === 'emoji') {
        if (!data.length || data[data.length - 1].contentType !== TYPES.TEXT) {
          data.push({
            contentType: TYPES.TEXT,
            text: o.name
          })
        } else {
          data[data.length - 1].text = data[data.length - 1].text + o.name
        }
      } else {
        data.push({
          contentType: TYPES.PICTURE,
          url: o.src,
          width: o.naturalWidth,
          height: o.naturalHeight
        })
      }
    } else {
      const msg = o.textContent.replace(/(^\s*)|(\s*$)/g, '')
      if (!data.length || data[data.length - 1].contentType !== TYPES.TEXT) {
        data.push({
          contentType: TYPES.TEXT,
          text: msg
        })
      } else {
        data[data.length - 1].text = data[data.length - 1].text + `<br/>` + msg
      }
    }
  })

  return data
}

export function scrollTo(el, from = 0, to, duration = 500, endCallback) {
  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame =
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      window.msRequestAnimationFrame ||
      function(callback) {
        return window.setTimeout(callback, 1000 / 60)
      }
  }
  const difference = Math.abs(from - to)
  const step = Math.ceil((difference / duration) * 50)

  function scroll(start, end, step) {
    if (start === end) {
      endCallback && endCallback()
      return
    }

    let d = start + step > end ? end : start + step
    if (start > end) {
      d = start - step < end ? end : start - step
    }

    if (el === window) {
      window.scrollTo(d, d)
    } else {
      el.scrollTop = d
    }
    window.requestAnimationFrame(() => scroll(d, end, step))
  }
  scroll(from, to, step)
}
