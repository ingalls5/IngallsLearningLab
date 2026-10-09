import nspell from 'nspell';
import aff from '../assets/spelling/en.aff?raw';
import dic from '../assets/spelling/en.dic?raw';
import rubrics from '../assets/reading-rubrics.json';
let spelling:any;
const normalized=(s:string)=>s.toLowerCase().replace(/[‘’]/g,"'").replace(/[^a-z0-9']/g,' ').replace(/\s+/g,' ').trim();
function checker(){if(!spelling){spelling=nspell(aff,dic);for(const name of ['Jacob','Owen','Maya','Liam','Ava','Ingalls','Boston']){for(const word of [name,name.toLowerCase(),name+"'s",name.toLowerCase()+"'s"])spelling.add(word)}}return spelling}
export function gradeReading(id:string,question:string,answer:string){
 const rubric=rubrics.find(r=>r.id===id);if(!rubric||rubric.question!==question)throw new Error('This reading question could not be verified. Reload before starting a new story.');
 const spell=checker(),words=answer.replace(/[‘’]/g,"'").match(/[A-Za-z]+(?:'[A-Za-z]+)*/g)||[];
 const misspelledWords=[...new Set(words.filter(word=>!spell.correct(word)&&!spell.correct(word.toLowerCase())))];
 if(misspelledWords.length)return{correctAnswer:rubric.answer,status:'incorrect',reason:'spelling',misspelledWords};
 const value=normalized(answer);
 if(!value||/^(i don'?t know|idk|no idea|nothing|i do not know)$/.test(value))return{correctAnswer:rubric.answer,status:'incorrect',reason:'answer',misspelledWords:[]};
 const exact=value===normalized(rubric.answer);
 const ideas=rubric.ideas.every(pattern=>new RegExp('\\b(?:'+pattern+')\\w*\\b','i').test(value));
 const negated=/\b(not|never|no|isn't|aren't|wasn't|weren't|don't|doesn't|didn't|cannot|can't)\b/.test(value);
 const status=exact||(ideas&&!negated)?'correct':'review';
 return{correctAnswer:rubric.answer,status,reason:status==='review'?'wording':'answer',misspelledWords:[]};
}
