export const flashSets:any={uppercase:Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ'),lowercase:Array.from('abcdefghijklmnopqrstuvwxyz'),numbers:Array.from({length:21},(_,i)=>String(i)),shapes:['circle','square','triangle','rectangle','oval','diamond','star','heart']};
export const flashLabels:any={uppercase:'Uppercase letters',lowercase:'Lowercase letters',numbers:'Numbers',shapes:'Shapes'};
export function validFlashCard(kind:unknown,target:unknown){return typeof kind==='string'&&Object.hasOwn(flashSets,kind)&&flashSets[kind].includes(target);}

export const flashDeck=Object.entries(flashSets).flatMap(([kind,targets])=>(targets as string[]).map(target=>({kind,target})));
