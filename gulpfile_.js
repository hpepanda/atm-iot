var gulp = require('gulp');
var path = require('path');
var gulpTasks = require('grommet/utils/gulp/gulp-tasks');

var opts = {
  base: '.',
  dist: path.resolve(__dirname, 'dist/'),
  copyAssets: [
    'src/index.html',
    {
      asset: 'src/img/**',
      dist: 'dist/img/'
    }
  ],
  scssAssets: ['src/scss/**/*.scss'],
  jsAssets: ['src/js/**/*.js'],
  mainJs: 'src/js/index.js',
  mainScss: 'src/scss/index.scss',
  webpack: {
    resolve: {
      // alias: { // TODO: remove, just for local dev
      //   'grommet-index/scss': path.resolve(__dirname, '../grommet-index/src/scss'),
      //   'grommet-index': path.resolve(__dirname, '../grommet-index/src/js'),
      //   'grommet/scss': path.resolve(__dirname, '../grommet/src/scss'),
      //   'grommet': path.resolve(__dirname, '../grommet/src/js')
      // },
      root: [
        path.resolve(__dirname, 'src/js'),
        path.resolve(__dirname, 'src/scss'),
        path.resolve(__dirname, 'node_modules')
      ]
    }
  },
  devServerPort: 9040,
  // The 8010 port number needs to align with hostName in index.js
  devServerProxy: {
    "/rest/*": 'http://localhost:8040'
  },
  websocketHost: 'localhost:8040'
};

gulpTasks(gulp, opts);
