#!/bin/sh

# Backup
cp index.js index.js.bak

# Clone "swig" repository
if [ ! -d swig ]; then
  git clone https://github.com/paularmstrong/swig.git
fi
cd swig

# Checkout a specific version if specified
if [ "$1" != "" ]; then
  git checkout "$1"
fi

# Build for browser
npm install
make browser
cd ..

# Rebuild main script
echo '/*!' > index.js
grep -F '/*!' swig/dist/browser/swig.js | sed 's/\/\*\!\(.*\)\*\//  *\1/' >> index.js
echo '  */' >> index.js
echo '' >> index.js
echo '!function (_) {' >> index.js
sed 's/\/\*\!.*\*\///g' swig/dist/browser/swig.js >> index.js
echo '}(require("underscore"));' >> index.js

# Display differences with old version
diff -u index.js.bak index.js
