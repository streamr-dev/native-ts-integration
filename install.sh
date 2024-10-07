#!/bin/bash
set -e

if [ ! -d "network" ]; then
    git clone https://github.com/streamr-dev/network.git
    cd network
    npm run bootstrap
    cd ..
    npm install
fi
