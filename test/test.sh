#!/bin/sh

set -eu
[ -n "${DEBUG:-}" ] && set -x

cur_dir=$(cd "$(dirname "$0")"; pwd)

export GITHUB_WORKSPACE="${cur_dir}"
export SOURCE="package.json"
export TARGETS="test@server01:/usr/share/nginx/html/test;test2@server01:22:/usr/share/nginx/html/test2;"
export SSH_PRIVATE_KEY=$(cat "${cur_dir}/keys/id_rsa")
node index.js

curl -v http://server01/test/package.json

curl -v http://server01/test2/package.json
