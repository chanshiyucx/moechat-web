module.exports = {
  productionSourceMap: false,
  publicPath: '/',
  chainWebpack(config) {
    const cdn = {
      css: ['//fonts.googleapis.com/css?family=Fira+Mono|Noto+Serif+SC&display=swap'],
    }
    config.plugin('html').tap((args) => {
      args[0].cdn = cdn
      return args
    })
  },
  css: {
    loaderOptions: {
      sass: {
        additionalData: `
          @import "~@/styles/variables.scss";
          @import "~@/styles/mixin.scss";
        `,
      },
    },
  },
}