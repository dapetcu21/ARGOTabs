#!/usr/bin/env node
var connect = require('connect');
var srv = connect()
srv.use(connect.static('public'))
srv.listen(process.env.PORT || 3000);
