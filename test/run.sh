#!/bin/sh

set -euo pipefail
[ -n "${DEBUG:-}" ] && set -x

cur_dir=$(cd "$(dirname "$0")"; pwd)

# build
cd "${cur_dir}/../"
yarn
yarn build
cp dist/index.js test/index.js
cp package.json test/package.json
cp package-lock.json test/package-lock.json
cd test


docker compose -f "${cur_dir}/docker-compose.yml" up -d
docker compose logs client
docker compose -f "${cur_dir}/docker-compose.yml" down
rm -rf index.js package.json package-lock.json
