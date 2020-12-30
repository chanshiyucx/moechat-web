import UAParser from 'ua-parser-js'

const UA = window.navigator.userAgent

export const isiOS = /iPhone/i.test(UA)

export const isAndroid = /android/i.test(UA)

export const isMobile = isiOS || isAndroid

/**
 * 获取窗口宽度百分比
 */
export const getWidthPercent = () => {
  let width = 0.6
  if (isMobile) {
    width = 1
  } else if (window.innerWidth < 1000) {
    width = 0.9
  } else if (window.innerWidth < 1300) {
    width = 0.8
  } else if (window.innerWidth < 1600) {
    width = 0.7
  } else {
    width = 0.6
  }
  return width
}

/**
 * 获取窗口高度百分比
 */
export const getHeightPercent = () => {
  let height = 0.8
  if (isMobile) {
    height = 1
  } else if (window.innerHeight < 1000) {
    height = 0.9
  } else {
    height = 0.8
  }
  return height
}

/**
 * 获取设置信息
 */
export const getDeviceInfo = () => {
  const result = new UAParser().getResult()
  return `${result.browser.name}${result.browser.major} ${result.os.name}${result.os.version}`
}
