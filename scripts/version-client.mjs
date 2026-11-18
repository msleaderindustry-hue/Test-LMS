// Bump this release identifier whenever changing the coordinated client release.
import fs from 'node:fs';
const version='20261118-ai2';
const index=fs.readFileSync('index.html','utf8').replace(/((?:src|href)="[A-Za-z0-9_-]+\.(?:js|css))(?:\?v=[^"\s]*)?"/g,`$1?v=${version}"`);
fs.writeFileSync('index.html',index);
const app=fs.readFileSync('7_app.js','utf8').replace(/(20_word\.js|15_excel_trainer\.js)\?v=[^']+/g,`$1?v=${version}`);
fs.writeFileSync('7_app.js',app);
