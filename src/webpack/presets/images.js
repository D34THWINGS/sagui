export default {
  name: 'images',
  configure () {
    return {
      module: {
        loaders: [
          {
            test: /\.(png|jpg|jpeg|gif|svg)$/,
            loader: 'url-loader?limit=8192&name=[name]-[hash].[ext]'
          }
        ]
      }
    }
  }
}
