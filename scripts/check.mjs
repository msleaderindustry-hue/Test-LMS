import fs from 'node:fs';
import {parse} from '@babel/parser';
import {execFileSync} from 'node:child_process';
const files=fs.readdirSync('.').filter(f=>f.endsWith('.js')),seen=new Set();let embedded=0;
function check(text,name){try{return parse(text,{sourceType:'unambiguous',plugins:['jsx']});}catch(e){throw Error(name+': '+e.message);}}
function walk(node,file){if(!node||typeof node!=='object')return;
  if(node.type==='StringLiteral'&&node.value.includes('<script'))for(const match of node.value.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)){if(/\bsrc=|application\/json/.test(match[1]))continue;const key=file+':'+match[2];if(seen.has(key))continue;seen.add(key);check(match[2],file+' embedded '+(++embedded));}
  for(const [key,v]of Object.entries(node)){if(['loc','start','end','extra','comments'].includes(key))continue;if(Array.isArray(v))v.forEach(x=>walk(x,file));else if(v&&typeof v==='object')walk(v,file);}}
for(const f of files)walk(check(fs.readFileSync(f,'utf8'),f),f);
for(const m of fs.readFileSync('index.html','utf8').matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi))if(!/\bsrc=/.test(m[1]))check(m[2],'index.html inline');
for(const dir of ['server','workers'])for(const f of fs.readdirSync(dir).filter(f=>f.endsWith('.mjs')))check(fs.readFileSync(dir+'/'+f,'utf8'),dir+'/'+f);
execFileSync(process.execPath,['scripts/sync-checkers.mjs','--check'],{stdio:'inherit'});
console.log(`Syntax OK: ${files.length} client files, ${embedded} embedded scripts, server and workers. Checkers are synchronized.`);
