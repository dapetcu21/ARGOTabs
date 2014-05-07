var connect = require('connect');
var Roots = require('roots');

proj = new Roots(__dirname);
proj.on('error', console.log.bind(console))
    .on('done', function() {
        console.log('Compilation done. Starting server')
        connect().use(connect.logger('dev'))
          .use(connect.static('public'))
          .listen(process.env.PORT || 3000);
    });
console.log('Compiling project');
proj.compile();
