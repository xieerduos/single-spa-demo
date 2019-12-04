module.exports = {
  publicPath: '/',
  configureWebpack: config => {
    // https://cli.vuejs.org/zh/guide/webpack.html#%E7%AE%80%E5%8D%95%E7%9A%84%E9%85%8D%E7%BD%AE%E6%96%B9%E5%BC%8F
    if (process.env.NODE_ENV === 'production') {
      // 为生产环境修改配置...
      // 压缩后的文件 添加.min.js后缀
      // config.output.filename = 'assets/js/[name].[contenthash:8].min.js'
      // config.output.chunkFilename =
      //     'assets/js/[name].[contenthash:8].min.js'
    } else {
      // 为开发环境修改配置...

      // 解决 所有的文件都是基于 app.js 的路径的bug
      config.output.filename = '[name].js'
      config.output.chunkFilename =
              '[name].js'
      config.devtool = 'cheap-module-eval-source-map'
    }
  },
  devServer: {
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    open: false,
    port: '8800'
  },
  filenameHashing: false
}
