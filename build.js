const fs = require('fs-extra');
const path = require('path');

// Clean dist folder
fs.emptyDirSync('dist');

// Copy manifest.json
fs.copySync('manifest.json', 'dist/manifest.json');

// Copy HTML files
fs.copySync('popup.html', 'dist/popup.html');

// Copy any other static assets you might have
if (fs.existsSync('icons')) {
  fs.copySync('icons', 'dist/icons');
}

console.log('Static assets copied to dist/'); 