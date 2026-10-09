let celebrationAudioContext,celebrationSoundBuffer;
const celebratedActivities=new Set();
// Unlock audio during a tap so the later asynchronous save can play on iPad.
function prepareCelebrationSound(){try{const AudioContext=window.AudioContext||window.webkitAudioContext;if(!AudioContext)return;celebrationAudioContext||=new AudioContext();celebrationAudioContext.resume().catch(()=>{});if(!celebrationSoundBuffer){celebrationSoundBuffer=fetch('/celebration-recorded-horn-cheer.mp3').then(r=>{if(!r.ok)throw Error('Sound unavailable');return r.arrayBuffer()}).then(b=>celebrationAudioContext.decodeAudioData(b)).catch(()=>null)}}catch{}}
document.addEventListener('pointerdown',prepareCelebrationSound,{once:true});
document.addEventListener('keydown',prepareCelebrationSound,{once:true});
function shouldCelebrateActivity(activity,data){return ['math','reading'].includes(activity.subject)&&homeworkStudents.some(s=>s.id===activity.studentId&&s.name==='Jacob')&&data.total>0&&data.score===data.total&&(!data.grades||data.grades.every(g=>g.status==='correct'))&&!celebratedActivities.has(activity.id)}
function celebratePerfectActivity(activity,data){if(!shouldCelebrateActivity(activity,data))return;celebratedActivities.add(activity.id);launchPerfectCelebration();}
async function playCelebrationSound(){try{prepareCelebrationSound();const buffer=await celebrationSoundBuffer;if(!buffer||celebrationAudioContext?.state!=='running')return;const source=celebrationAudioContext.createBufferSource(),gain=celebrationAudioContext.createGain();source.buffer=buffer;gain.gain.value=.85;source.connect(gain);gain.connect(celebrationAudioContext.destination);source.start()}catch{}}
function launchPerfectCelebration(){
 document.getElementById('perfectCelebration')?.remove();
 const overlay=document.createElement('div');overlay.id='perfectCelebration';overlay.style.cssText='position:fixed;inset:0;z-index:10000;pointer-events:none;overflow:hidden';
 const message=document.createElement('div');message.setAttribute('role','status');message.textContent='All correct! Great work, Jacob!';message.style.cssText='position:absolute;top:18%;left:50%;transform:translateX(-50%);width:max-content;max-width:90%;padding:20px 26px;border-radius:20px;background:#2551da;color:white;text-align:center;font:bold clamp(20px,5vw,32px) system-ui;box-shadow:0 8px 35px #14264b44';overlay.append(message);document.body.append(overlay);playCelebrationSound();
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 const canvas=document.createElement('canvas');canvas.setAttribute('aria-hidden','true');canvas.style.cssText='position:absolute;inset:0;width:100%;height:100%';overlay.prepend(canvas);const ctx=canvas.getContext('2d');
 const w=window.innerWidth,h=window.innerHeight,dpr=Math.min(window.devicePixelRatio||1,2);canvas.width=w*dpr;canvas.height=h*dpr;ctx.scale(dpr,dpr);
 const colors=['#ffca38','#ff578b','#35d7c7','#7858ef','#3e9aff','#ffffff'];
 const pieces=Array.from({length:reduced?45:230},()=>({x:Math.random()*w,y:reduced?Math.random()*h:-Math.random()*h,vx:(Math.random()-.5)*2.8,vy:2+Math.random()*3.4,size:5+Math.random()*6,angle:Math.random()*6.3,spin:(Math.random()-.5)*.15,color:colors[Math.floor(Math.random()*colors.length)]}));
 let last,start;function frame(now){if(!overlay.isConnected)return;start??=now;const dt=Math.min((now-(last||now))/16.67,3);last=now;ctx.clearRect(0,0,w,h);for(const p of pieces){if(!reduced){p.x+=p.vx*dt;p.y+=p.vy*dt;p.angle+=p.spin*dt;}ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.angle);ctx.fillStyle=p.color;ctx.fillRect(-p.size/2,-p.size/2,p.size,p.size*.6);ctx.restore()}if(!reduced&&now-start<6500)requestAnimationFrame(frame)}requestAnimationFrame(frame);setTimeout(()=>overlay.remove(),6700);
}
