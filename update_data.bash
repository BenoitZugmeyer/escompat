#!/bin/bash

set -euo pipefail

BASE_URL=https://raw.githubusercontent.com/kangax/compat-table/gh-pages
FILES=(
    data-es5.js
    data-es6.js
    data-es7.js
    data-esintl.js
    data-non-standard.js
)

for file in ${FILES[@]}; do
    url=$BASE_URL/$file
    (
        echo "// Downloaded on $(LANG=C TZ=UTC date) from $url"
        curl $url
    ) >| src/data/$file
done
