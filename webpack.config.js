const HTMLWebpack = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const webpack = require('webpack')
const autoprefixer = require('autoprefixer')
const AppCachePlugin = require('appcache-webpack-plugin')
const path = require('path')

const debug = process.env.NODE_ENV !== 'production'

const browserList = [
  '> 1%',
  'last 2 versions',
  'IE >= 11',
  'Firefox ESR',
  'iOS >= 9.3'
]

const babelLoader = {
  loader: 'babel-loader',
  options: {
    presets: [
      ['env', {
        browsers: browserList,
        modules: false
      }],
      'react'
    ],
    plugins: ['transform-class-properties']
  }
}

const postCssLoader = {
  loader: 'postcss-loader',
  options: {
    plugins: () => (
      [autoprefixer({
        browsers: browserList
      })]
    )
  }
}

const cssLoader = {
  loader: 'css-loader',
  options: {
    localIdentName: debug ? '[name]__[local]___[hash:base64:5]' : '[hash:base64:5]',
    sourceMap: true
  }
}

const config = {
  entry: {
    main: ['babel-polyfill', path.resolve(__dirname, 'client')]
  },
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: '[name].js',
    publicPath: process.env.PUBLIC_PATH || '/'
  },
  devtool: debug ? '#source-map' : false,
  resolve: {
    extensions: ['*', '.js', '.jsx', '.json'],
    modules: ['web_modules', 'node_modules'],
    alias: {
      angular: path.resolve(__dirname, 'client', 'web_modules', 'angular.js')
    }
  },
  module: {
    rules: [
      { test: /\.jsx?$/, use: babelLoader, exclude: /node_modules|web_modules/ },
      { test: /\.json$/, use: 'json-loader' },
      { test: /\.jade$/, use: 'jade-loader' },
      {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [cssLoader, postCssLoader, 'sass-loader']
        })
      }, {
        test: /\.sass$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [cssLoader, postCssLoader, 'sass-loader?indentedSyntax=true']
        })
      }, {
        test: /\.styl$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [cssLoader, postCssLoader, 'stylus-loader']
        })
      }, {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [cssLoader, postCssLoader]
        })
      },
      { test: /\.(png|jpg|woff2?|ttf|eot|svg)(\?|$)/, use: 'file-loader' }
    ]
  },
  plugins: [
    new ExtractTextPlugin({ filename: 'bundle.css', disable: debug, allChunks: true }),
    new HTMLWebpack({
      inject: true,
      template: 'client/core/assets/index.html'
    }),
    new webpack.DefinePlugin({
      __DEV__: debug,
      'process.env.NODE_ENV': JSON.stringify(debug ? 'development' : 'production')
    })
  ],
  devServer: {
    historyApiFallback: true
  }
}

if (debug) {
  babelLoader.options.plugins.push(
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
