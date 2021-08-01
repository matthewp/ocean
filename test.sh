#!/bin/bash

case "$1" in
  all )
    deno test --allow-net --allow-env --allow-write --allow-read --allow-run --unstable
    ;;
  core )
    echo "Cannot only test core at this time"
    ;;
  worker )
    deno test --allow-net --allow-env --allow-write --allow-read --allow-run --unstable test/worker.test.js
    ;;
esac