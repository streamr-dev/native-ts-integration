#!/bin/bash
set -e

if [ ! -d "network" ]; then
    git clone https://github.com/streamr-dev/network.git
    cd network
    git checkout c4e111442
    npm run bootstrap
    cd ..
    npm install
fi
