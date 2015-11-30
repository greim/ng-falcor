#!/bin/sh

# See mit-license.txt for license info

babel src --out-dir lib
mkdir -p dist
browserify lib/index.js --standalone ngFalcor > dist/ng-falcor.js
uglifyjs dist/ng-falcor.js > dist/ng-falcor.min.js
