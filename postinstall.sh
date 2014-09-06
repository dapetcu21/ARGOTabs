#!/bin/bash

if [ "$NODE_ENV" == "production" ]; then
    ./node_modules/roots/bin/roots compile
fi
