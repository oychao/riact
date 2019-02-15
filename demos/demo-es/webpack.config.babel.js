import path from 'path';
import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import ScriptExtHtmlWebpackPlugin from 'script-ext-html-webpack-plugin';
import CleanWebpackPlugin from 'clean-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import OptimizeCSSAssetsPlugin from 'optimize-css-assets-webpack-plugin';
import UglifyJsPlugin from 'uglifyjs-webpack-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

// base config
const config = {
  mode: process.env.NODE_ENV,
  entry: ['@babel/polyfill', './index.jsx'],
  output: {
    filename: 'js/[name].[chunkhash:8].js',
    path: path.resolve('dist'),
    publicPath: '/'
  },
  resolve: {
    modules: [path.resolve('./src'), path.resolve('./node_modules')],
    extensions: ['.js', '.json', '.jsx', '.css']
  },
  module: {
    rules: [
      {
        test: /\.(css|less)$/,
        use: [
          {
            loader:
              process.env.NODE_ENV === 'development'
                ? 'style-loader'
                : MiniCssExtractPlugin.loader
          },
          {
            loader: 'css-loader'
          },
          {
            loader: 'less-loader'
          }
        ]
      },
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader'
          }
        ]
      },
      {
        test: /\.svg$/,
        use: [
          {
            loader: 'svg-inline-loader'
          }
        ]
      }
    ]
  },
  devtool: 'eval-source-map',
  devServer: {
    contentBase: './dist',
    hot: true,
    open: true
    // progress: true
  },
  externals: {
    // react: 'React',
    // 'react-dom': 'ReactDOM',
    // redux: 'Redux',
    // 'react-redux': 'ReactRedux'
  },
  plugins: [
    new CleanWebpackPlugin(['dist']),
    new HtmlWebpackPlugin({
      template: 'index.html'
    }),
    new ScriptExtHtmlWebpackPlugin({
      defaultAttribute: 'defer'
    })
  ]
};

// development config
if (process.env.NODE_ENV === 'development') {
  config.output.filename = 'js/[name].[hash:8].js';
  config.plugins.push(new webpack.HotModuleReplacementPlugin());
  config.optimization = {
    minimize: false
  };
}

// production config
if (process.env.NODE_ENV === 'production') {
  config.devtool = 'source-map';
  [
    new webpack.LoaderOptionsPlugin({
      minimize: true
    }),
    new MiniCssExtractPlugin({
      debug: false,
      filename: 'css/[name].[contenthash:8].css',
      chunkFilename: 'css/[name].[contenthash:8].css'
    }),
    new OptimizeCSSAssetsPlugin({})
  ].forEach(plugin => config.plugins.push(plugin));
  config.optimization = {
    minimize: true,
    minimizer: [
      new UglifyJsPlugin({
        cache: true,
        parallel: true,
        sourceMap: false
      })
    ],
    splitChunks: {
      chunks: 'all'
    }
  };
  config.performance = {
    hints: false
  };
}

// debug
if (process.env.WEBPACK_DEBUG) {
  config.plugins.push(new BundleAnalyzerPlugin());
}

export default config;
