#!/bin/bash

case "$1" in
  all )
    deno test --allow-net --allow-env --allow-write --allow-read --allow-run --unstable
    ;;
  core )
    OCEAN_CORE=1 deno test --allow-net --allow-env --allow-write --allow-read --allow-run --unstable
    ;;
  worker )
    deno test --allow-net --allow-env --allow-write --allow-read --allow-run --unstable test/worker.test.js
    ;;
esac