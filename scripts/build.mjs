import { cpSync, mkdirSync, copyFileSync, readFileSync, writeFileSync } from 'node:fs';
const content=JSON.parse(readFileSync('content/site.json','utf8'));
if (!content.sections?.zh || !content.sections?.en || !Array.isArray(content.events)) throw new Error('Invalid site content');
mkdirSync('dist',{recursive:true});
copyFileSync('index.html','dist/index.html');
cpSync('assets','dist/assets',{recursive:true});
cpSync('content','dist/content',{recursive:true});
const rewrites=[
'/zh /index.html 200','/zh/ /index.html 200',
'/en /index.html 200','/en/ /index.html 200',
'/security/zh /index.html 200','/security/zh/ /index.html 200',
'/security/en /index.html 200','/security/en/ /index.html 200',
'/journal/zh /index.html 200','/journal/zh/ /index.html 200',
'/journal/en /index.html 200','/journal/en/ /index.html 200'
];
writeFileSync('dist/_redirects',rewrites.join('\n')+'\n');
console.log('RAVEN preview built: '+content.events.length+' event records; '+content.articles.length+' research references');
