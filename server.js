var connect = require('connect');
var Roots = require('roots');

(new Roots(__dirname)).compile()
    .on('error', console.log.bind(console))
    .on('done', function() {
        console.log('Compilation done. Starting server')
        connect().use(connect.logger('dev'))
          .use(connect.static('public'))
          .listen(process.env.PORT || 3000);
    });
