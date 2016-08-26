const HTMLWebpack = require('html-webpack-plugin')
const ExtractText = require('extract-text-webpack-plugin')
const webpack = require('webpack')
const autoprefixer = require('autoprefixer')
const AppCachePlugin = require('appcache-webpack-plugin')

const debug = process.env.NODE_ENV !== 'production'
const localIdentName = debug ? 'localIdentName=[name]__[local]___[hash:base64:5]' : 'localIdentName=[hash:base64:5]'

const config = {
  entry: {
    main: ['babel-polyfill', './client']
  },
  output: {
    path: './public',
    filename: '[name].js',
    publicPath: process.env.PUBLIC_PATH || '/'
  },
  devtool: debug ? '#source-map' : null,
  module: {
    loaders: [
      { test: /\.jsx?$/, loader: 'babel-loader', exclude: /node_modules|web_modules/ },
      { test: /\.json$/, loader: 'json' },
      { test: /\.jade$/, loader: 'jade' },
      { test: /\.scss$/, loader: ExtractText.extract('style', `css-loader?sourceMap&${localIdentName}!postcss!sass`) },
      { test: /\.sass$/, loader: ExtractText.extract('style', `css-loader?sourceMap&${localIdentName}!postcss!sass?indentedSyntax=true`) },
      { test: /\.styl$/, loader: ExtractText.extract('style', `css-loader?sourceMap&${localIdentName}!postcss!stylus`) },
      { test: /\.css$/, loader: ExtractText.extract('style', `css-loader?sourceMap&${localIdentName}!postcss`) },
      { test: /\.(png|jpg|woff2?|ttf|eot|svg)(\?|$)/, loader: 'file' }
    ]
  },
  postcss () {
    return [autoprefixer]
  },
  resolve: {
    extensions: ['', '.js', '.jsx', '.json']
  },
  babel: {
    presets: ['es2015', 'react', 'stage-0'],
    plugins: ['transform-decorators-legacy']
  },
  plugins: [
    new ExtractText('bundle.css', { disable: debug, allChunks: true }),
    new HTMLWebpack({
      inject: true,
      template: 'client/core/assets/index.html'
    }),
    new webpack.DefinePlugin({
      __DEV__: debug
    })
  ],
  devServer: {
    historyApiFallback: true
  }
}

if (debug) {
  config.babel.plugins.push(
    ['react-transform', {
      'transforms': [{
        'transform': 'react-transform-hmr',
        'imports': ['react'],
        'locals': ['module']
      }, {
        'transform': 'react-transform-catch-errors',
        'imports': ['react', 'redbox-react']
      }]
    }]
  )
} else {
  config.plugins.push(new webpack.optimize.UglifyJsPlugin())
  config.plugins.push(new webpack.optimize.OccurenceOrderPlugin(true))
  config.plugins.push(new AppCachePlugin({
    settings: ['prefer-online'],
    output: 'manifest.appcache'
  }))
}

module.exports = config
