#!/bin/bash
set -e
rm -rf public
cp -r .output/public public
echo "Deployed!"
