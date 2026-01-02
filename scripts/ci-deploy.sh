#!/bin/bash
set -e
# CI deploy script for GitLab Pages (docs)
rm -rf public
cp -r apps/docs/.output/public public
echo "✅ Docs deployed to public/"
