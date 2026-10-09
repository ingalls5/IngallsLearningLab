import fs from 'node:fs';import ts from 'typescript';
let source=fs.readFileSync('lib/reading.ts','utf8');
source=source.replace("import aff from '../assets/spelling/en.aff?raw';",'const aff='+JSON.stringify(fs.readFileSync('assets/spelling/en.aff','utf8'))+';').replace("import dic from '../assets/spelling/en.dic?raw';",'const dic='+JSON.stringify(fs.readFileSync('assets/spelling/en.dic','utf8'))+';').replace("import rubrics from '../assets/reading-rubrics.json';",'const rubrics='+fs.readFileSync('assets/reading-rubrics.json','utf8')+';');
fs.writeFileSync('.sites-runtime/reading-compiled.mjs',ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText);
