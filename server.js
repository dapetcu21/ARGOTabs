#!/usr/bin/env node
var express = require('express');
var app = express();

app.use(express.static('public'))
app.listen(process.env.PORT || 3000);
