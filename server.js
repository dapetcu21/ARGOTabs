#!/usr/bin/env node
var connect = require('connect');

function startServer() {
  connect().use(connect.logger('dev'))
    .use(connect.static('public'))
    .listen(process.env.PORT || 3000);
}

if (process.env.PRODUCTION) {
  console.log('Skipping compilation. Starting server');
  startServer();
} else {
  var Roots = require('roots');
  proj = new Roots(__dirname);
  proj.on('error', console.log.bind(console));
  proj.on('done', function() {
      console.log('Compilation done. Starting server');
      startServer();
  });

  console.log('Compiling project');
  proj.compile();
}

