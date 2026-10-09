let digitModel=null,inkTimer,inkSuggestion=null,inkStrokes=[],inkActive=null;
fetch('/digit-model-v3.json').then(r=>{if(!r.ok)throw Error();return r.json()}).then(m=>digitModel=m).catch(()=>{const status=document.getElementById('inkStatus');if(status)status.textContent='The handwriting reader could not load. Please type your answer below.'});
function classifyDigit(features){let a=features;for(let layer=0;layer<digitModel.weights.length;layer++){const w=digitModel.weights[layer],b=digitModel.biases[layer];a=b.map((v,j)=>{for(let i=0;i<w.length;i++)v+=a[i]*w[i][j];return layer===digitModel.weights.length-1?v:Math.max(0,v)})}const max=Math.max(...a),exp=a.map(v=>Math.exp(v-max)),total=exp.reduce((s,v)=>s+v,0);const digit=a.indexOf(max);return {digit,confidence:exp[digit]/total,probabilities:exp.map(v=>v/total)}}
function resetInkReading(){
 document.getElementById('answer').value='';inkSuggestion=null;
 document.getElementById('inkReview').replaceChildren();
}
function redrawInk(){
 const pad=document.getElementById('inkPad'),ctx=pad.getContext('2d');
 ctx.clearRect(0,0,pad.width,pad.height);
 ctx.lineWidth=3;ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle='#14264b';ctx.fillStyle='#14264b';
 for(const stroke of inkStrokes){
  const first=stroke[0];ctx.beginPath();ctx.arc(first.x,first.y,1.5,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.moveTo(first.x,first.y);
  for(const p of stroke.slice(1))ctx.lineTo(p.x,p.y);
  ctx.stroke();
 }
}
function initInk(){
 const pad=document.getElementById('inkPad');if(!pad||!pad.getContext('2d'))return;
 clearTimeout(inkTimer);inkStrokes=[];inkActive=null;
 const point=e=>{const r=pad.getBoundingClientRect();return {x:(e.clientX-r.left)*pad.width/r.width,y:(e.clientY-r.top)*pad.height/r.height}};
 const append=e=>{
  const samples=e.getCoalescedEvents?.()||[];
  for(const sample of [...samples,e]){
   const p=point(sample),stroke=inkStrokes[inkStrokes.length-1],last=stroke[stroke.length-1];
   if(p.x!==last.x||p.y!==last.y)stroke.push(p);
  }
  redrawInk();
 };
 pad.onpointerdown=e=>{
  if(session.checked||inkActive!==null)return;
  e.preventDefault();pad.setPointerCapture(e.pointerId);inkActive=e.pointerId;
  clearTimeout(inkTimer);resetInkReading();inkStrokes.push([point(e)]);redrawInk();
  document.getElementById('inkStatus').textContent='Finish writing, then tap Read my answer.';
 };
 pad.onpointermove=e=>{if(e.pointerId!==inkActive||session.checked)return;e.preventDefault();append(e)};
 const finish=e=>{
  if(e.pointerId!==inkActive)return;
  if(!session.checked&&e.type!=='pointercancel'&&e.type!=='lostpointercapture')append(e);
  inkActive=null;
  document.getElementById('inkStatus').textContent='Tap Read my answer when you have finished writing.';
 };
 pad.onpointerup=finish;pad.onpointercancel=finish;pad.onlostpointercapture=finish;
}
// Filter isolated specks before finding column gaps or normalizing digit crops.
// Keep every substantial component: a handwritten 4 or 5 can use separate strokes.
function cleanInkPixels(data,width,height){
 const clean=new Uint8ClampedArray(data),seen=new Uint8Array(width*height),components=[];
 for(let i=0;i<seen.length;i++){
  if(seen[i]||data[i*4+3]<=40)continue;
  const pixels=[i];seen[i]=1;
  for(let k=0;k<pixels.length;k++){
   const at=pixels[k],x=at%width,y=Math.floor(at/width);
   for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
    const nx=x+dx,ny=y+dy,next=ny*width+nx;
    if(nx<0||nx>=width||ny<0||ny>=height||seen[next]||data[next*4+3]<=40)continue;
    seen[next]=1;pixels.push(next);
   }
  }
  components.push(pixels);
 }
 const largest=components.reduce((max,p)=>Math.max(max,p.length),0),minimum=Math.max(3,Math.min(12,largest*.01));
 for(const pixels of components)if(pixels.length<minimum)for(const i of pixels)clean[i*4+3]=0;
 return clean;
}
function splitInk(data,width,height,gap=3){
 const boxes=[];let start=-1,last=-1;
 for(let x=0;x<width;x++){
  let has=false;for(let y=0;y<height;y++)if(data[(y*width+x)*4+3]>40){has=true;break}
  if(has){if(start<0)start=x;last=x}
  else if(start>=0&&x-last>=gap){boxes.push({left:start,right:last});start=-1}
 }
 if(start>=0)boxes.push({left:start,right:last});
 return boxes.map(box=>{
  let top=height,bottom=-1,area=0;
  for(let x=box.left;x<=box.right;x++)for(let y=0;y<height;y++)if(data[(y*width+x)*4+3]>40){top=Math.min(top,y);bottom=Math.max(bottom,y);area++}
  return {...box,top,bottom,area};
 }).filter(box=>box.bottom-box.top>=4&&box.area>=12);
}
function inkFeatures(box,target=.08){const pad=document.getElementById('inkPad'),source=pad.getContext('2d').getImageData(box.left,box.top,box.right-box.left+1,box.bottom-box.top+1),w=source.width,h=source.height;if(box.pixels){for(let y=0;y<h;y++)for(let x=0;x<w;x++)source.data[(y*w+x)*4+3]=box.pixels[((box.top+y)*pad.width+box.left+x)*4+3]}let area=0,edges=0;const mask=new Uint8Array(w*h);for(let i=0;i<mask.length;i++)if(source.data[i*4+3]>40){mask[i]=1;area++}for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(mask[y*w+x]){for(const [dx,dy] of [[-1,0],[1,0],[0,-1],[0,1]]){let nx=x+dx,ny=y+dy;if(nx<0||nx>=w||ny<0||ny>=h||!mask[ny*w+nx])edges++}}const thickness=edges?2*area/edges:1,radius=Math.max(0,Math.min(6,Math.round((h*target-thickness)/2))),rw=w+radius*2,rh=h+radius*2;const thick=document.createElement('canvas');thick.width=rw;thick.height=rh;const tc=thick.getContext('2d'),image=tc.createImageData(rw,rh);for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(mask[y*w+x])for(let dy=-radius;dy<=radius;dy++)for(let dx=-radius;dx<=radius;dx++){let k=((y+radius+dy)*rw+x+radius+dx)*4;image.data[k+3]=radius===0?source.data[(y*w+x)*4+3]:255}tc.putImageData(image,0,0);const small=document.createElement('canvas');small.width=20;small.height=20;const c=small.getContext('2d'),scale=16/Math.max(rw,rh),dw=Math.max(1,Math.round(rw*scale)),dh=Math.max(1,Math.round(rh*scale));c.drawImage(thick,0,0,rw,rh,Math.floor((20-dw)/2),Math.floor((20-dh)/2),dw,dh);const pixels=c.getImageData(0,0,20,20).data;return Array.from({length:400},(_,i)=>pixels[i*4+3]/255)}
function rankInkDigits(box){
 const variants=[0,.05,.08].map(target=>classifyDigit(inkFeatures(box,target))),weights=[.25,.45,.30];
 const scores=Array.from({length:10},(_,digit)=>({digit,confidence:variants.reduce((sum,r,i)=>sum+weights[i]*r.probabilities[digit],0)})).sort((a,b)=>b.confidence-a.confidence);
 return {choices:scores,consistent:variants.every(r=>r.digit===scores[0].digit)};
}
function wholeAnswerChoices(readings){
 let candidates=[{answer:'',confidence:1}];
 for(const reading of readings){const options=reading.choices.filter((r,i)=>i===0||(i<3&&r.confidence>=.035));candidates=candidates.flatMap(c=>options.map(r=>({answer:c.answer+r.digit,confidence:c.confidence*r.confidence}))).sort((a,b)=>b.confidence-a.confidence).slice(0,3)}
 return candidates;
}
function inkAnswerReadings(pixels,width,height){
 const clean=cleanInkPixels(pixels,width,height),normal=splitInk(clean,width,height),close=splitInk(clean,width,height,1);
 const layouts=normal.length===close.length?[normal]:[normal,close];
 const cache=new Map();
 return layouts.filter(boxes=>boxes.length&&boxes.length<=10).map(boxes=>{
  const readings=boxes.map(box=>{
   const key=[box.left,box.right,box.top,box.bottom].join(',');
   if(!cache.has(key))cache.set(key,rankInkDigits({...box,pixels:clean}));
   return cache.get(key);
  });
  const choices=wholeAnswerChoices(readings).map(c=>({...c,confidence:Math.pow(c.confidence,1/readings.length)}));
  return {readings,choices};
 }).sort((a,b)=>b.choices[0].confidence-a.choices[0].confidence);
}
function recognizeInk(){
 clearTimeout(inkTimer);if(session.checked)return;const status=document.getElementById('inkStatus');
 if(inkActive!==null){status.textContent='Finish writing before reading your answer.';return}
 resetInkReading();
 if(!digitModel){status.textContent='The number reader is loading. You can still type your answer.';return}
 const pad=document.getElementById('inkPad'),pixels=pad.getContext('2d').getImageData(0,0,pad.width,pad.height).data;
 const layouts=inkAnswerReadings(pixels,pad.width,pad.height);
 if(!layouts.length){status.textContent='Write your whole answer in one row, with a small space between digits.';return}
 const {readings,choices}=layouts[0],answer=choices[0].answer,review=document.getElementById('inkReview');
 // Preserve the best reading from each spacing interpretation in the review.
 const alternatives=[...layouts.map(l=>l.choices[0]),...layouts.flatMap(l=>l.choices.slice(1))];
 const unique=alternatives.filter((c,i)=>alternatives.findIndex(other=>other.answer===c.answer)===i).slice(0,3);
 if(layouts.length>1||readings.some(r=>!r.consistent||r.choices[0].confidence<.98)){
  status.textContent=`I think you wrote ${answer}. Choose the whole answer you wrote, or type it below.`;
  inkSuggestion=answer;
  for(const candidate of unique){const use=document.createElement('button');use.type='button';use.className='secondary';use.textContent=`Use ${candidate.answer}`;use.onclick=()=>{if(session.checked||inkSuggestion!==answer)return;document.getElementById('answer').value=candidate.answer;status.textContent='Check the answer below before submitting.';inkSuggestion=null;review.replaceChildren()};review.append(use)}
  return;
 }
 document.getElementById('answer').value=answer;status.textContent=`I read ${answer}. Check the whole answer below before submitting.`;
}
function undoInk(){
 if(session.checked||inkActive!==null)return;
 clearTimeout(inkTimer);inkStrokes.pop();redrawInk();resetInkReading();
 document.getElementById('inkStatus').textContent=inkStrokes.length?'Tap Read my answer when you have finished writing.':'Write your whole answer in one row, with a small space between digits.';
}
function clearInk(){
 if(session.checked||inkActive!==null)return;
 clearTimeout(inkTimer);inkStrokes=[];redrawInk();resetInkReading();
 document.getElementById('inkStatus').textContent='Write your whole answer in one row, with a small space between digits.';
}
let workStrokes=[],workActive=null;
function initWorkPad(){const p=document.getElementById('workPad');if(!p)return;const c=p.getContext('2d');if(!c)return;workStrokes=[];workActive=null;const point=e=>{const r=p.getBoundingClientRect();return {x:(e.clientX-r.left)/r.width,y:(e.clientY-r.top)/r.height}};p.onpointerdown=e=>{if(session.checked||workActive!==null)return;e.preventDefault();p.setPointerCapture(e.pointerId);workActive=e.pointerId;workStrokes.push([point(e)]);redrawWork()};p.onpointermove=e=>{if(session.checked||e.pointerId!==workActive)return;e.preventDefault();workStrokes[workStrokes.length-1].push(point(e));redrawWork()};const finish=e=>{if(e.pointerId===workActive)workActive=null};p.onpointerup=finish;p.onpointercancel=finish;}
function redrawWork(){const p=document.getElementById('workPad');if(!p)return;const c=p.getContext('2d'),r=p.getBoundingClientRect();c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,p.width,p.height);c.setTransform(p.width/r.width,0,0,p.height/r.height,0,0);c.strokeStyle='#2551da';c.fillStyle='#2551da';c.lineCap='round';c.lineJoin='round';c.lineWidth=2.5;for(const path of workStrokes){if(!path.length)continue;c.beginPath();c.arc(path[0].x*r.width,path[0].y*r.height,1.25,0,Math.PI*2);c.fill();c.beginPath();c.moveTo(path[0].x*r.width,path[0].y*r.height);for(const q of path.slice(1))c.lineTo(q.x*r.width,q.y*r.height);c.stroke()}}
function undoWork(){if(session.checked||workActive!==null)return;workStrokes.pop();redrawWork()}
function clearWork(){if(session.checked||workActive!==null)return;workStrokes=[];redrawWork()}
