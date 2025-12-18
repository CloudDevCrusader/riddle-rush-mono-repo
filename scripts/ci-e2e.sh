#!/bin/bash
set -e
npm run generate
npx playwright test || true
