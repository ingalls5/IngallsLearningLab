import home from '../assets/home.html?raw';
import familyPhoto from '../assets/family-placeholder.svg?inline';
import family from '../public/family.js?raw';
import celebrationClient from '../public/celebration.js?raw';
import penmanshipClient from '../public/penmanship.js?raw';
// Keep inline styles as a text asset: a .css import makes Vite's RSC loader
// wrap this HTTP handler as a React component instead of returning a Response.
import flashcardStyles from '../assets/flashcards-styles.txt?raw';
import flashcardClient from '../public/flashcards.js?raw';
import tracingClient from '../public/tracing.js?raw';
import assignmentClient from '../public/assignments.js?raw';
import accessClient from '../public/access.js?raw';
import {env} from 'cloudflare:workers';
import {membership,signedInUser,waitingPage,escapeText,memberRole} from '../lib/access';
import {homeworkStudents} from '../lib/homework';
import {publicHomepage} from '../lib/public-home';
export const dynamic='force-dynamic';
// Ship the UI and its saving code atomically: a cached older script must not
// interpret written answers as the indexes used by the former choice buttons.
export async function GET(request:Request){try{
 const member=await membership(request,env.DB),user=signedInUser(request)||(member?{id:member.user_id,email:member.email||member.name,name:member.name}:null);
 if(!user&&!member)return html(publicHomepage(home,familyPhoto));
 if(!member||member.status!=='approved')return html(waitingPage(user,member).replace('</main>','<p><a class="button" href="/student">Student sign-in</a></p></main>'));
 if(new URL(request.url).searchParams.has('preview'))return new Response(null,{status:303,headers:{Location:'/?homework=1','Cache-Control':'no-store'}});
 if(member.password_required)return new Response(null,{status:303,headers:{Location:'/student','Cache-Control':'no-store'}});
 const role=memberRole(member),owner=role==='owner',label=owner?'Owner':role==='parent'?'Parent':role==='teacher'?'Teacher':'Student';
 const students=await homeworkStudents(env.DB,{...member,role});if(role==='teacher'&&students.length!==1)return html('<!doctype html><html lang="en"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Teacher access · Ingalls Learning Lab</title><body style="font:18px system-ui;padding:24px"><h1>Your student access is unavailable</h1><p>Ask the Owner to check your student assignment and approval.</p><a href="/">Check access again</a><p><a href="/signout-with-chatgpt?return_to=%2Fteacher" target="_top">Sign out</a></p></body></html>');const studentJSON=JSON.stringify(students).replace(/</g,'\\u003c');
 let page=home.replace('</head>',()=>'<style>'+flashcardStyles+'</style></head>').replace('__FAMILY_PHOTO__',()=>familyPhoto).replace('<script src="/family.js?v=3"></script>',()=>'<script>const canAssignHomework='+(role==='owner'||role==='parent')+';const siteOwner='+owner+';const siteUserId='+JSON.stringify(member.user_id).replace(/</g,'\\u003c')+';const homeworkStudents='+studentJSON+';'+celebrationClient.replace(/<\/script/gi,'<\\/script')+family.replace(/<\/script/gi,'<\\/script')+flashcardClient.replace(/<\/script/gi,'<\\/script')+tracingClient.replace(/<\/script/gi,'<\\/script')+penmanshipClient.replace(/<\/script/gi,'<\\/script')+assignmentClient.replace(/<\/script/gi,'<\\/script')+accessClient.replace(/<\/script/gi,'<\\/script')+'</script>');
 page=page.replace('<!-- homework-student-tabs -->',()=>'<div class="actions homework-students" role="group" aria-label="Homework students">'+students.map((student:any,index:number)=>'<button id="studentChoice-'+index+'" type="button" aria-pressed="'+(index===0)+'" onclick="chooseHomeworkStudent('+index+')">'+escapeText(student.name)+'</button>').join('')+'</div><h3 id="studentHomeworkTitle" style="margin-top:20px">'+(students[0]?escapeText(students[0].name)+'’s homework':'No student homework is available')+'</h3>');
 const localStudent=!member.email;
 page=page.replace('<main>',()=>'<main><p class="muted"><strong>'+label+'</strong> · '+escapeText(member.email||member.name)+' · '+(localStudent?'<button class="secondary" onclick="studentSignOut()">Sign out</button>':'<a href="/signout-with-chatgpt?return_to=%2F" target="_top">Sign out</a>')+'</p>');
 if(role==='teacher')page=page.replace('Completed work',escapeText(students[0].name)+'’s completed work');
 if(role==='student')page=page.replace('Completed work','My completed work');
 if(owner){
  page=page.replace('</nav>','<button id="accountTab" aria-selected="false" onclick="showTab(\'account\')">Accounts &amp; access</button></nav>');
  page=page.replace('<footer>','<section id="account" class="hidden"><h2>Accounts &amp; access</h2><div class="panel"><h3>Your account: Owner</h3><p>You have full access. Only you can close or reopen accounts, assign roles, and manage settings.</p><p><strong>Parent:</strong> homework and all results; no account or settings changes.</p><p><strong>Teacher:</strong> only their approved student’s homework and results; no account or settings changes.</p><p><strong>Student:</strong> homework and their own results; no account or settings changes.</p><p><strong>Student sign-in: Jacob and Owen.</strong> Each child taps their name to open their assigned homework. No password or first-time code is needed. Student sign-in always stays at the lowest access level. Anyone with the site link can use the student buttons. Sign out all devices below to end a student’s active sessions.</p><p><a href="/signout-with-chatgpt?return_to=%2Fstudent" target="_top">Sign out and open Student sign-in on this device</a></p><p>Close account blocks access immediately. Existing reports stay saved, and only you can reopen the account.</p></div><div class="actions"><button class="secondary" onclick="loadPeople()">Refresh accounts</button></div><p id="peopleStatus" role="status"></p><p id="studentCodeStatus" class="written-answer" role="status"></p><div id="peopleList" class="reading-list"></div></section><footer>');
 }else page=page.replace('id="alertsTab"','hidden id="alertsTab"');
 return html(page);
 }catch(error){console.error('Home access failed',error);return html('<!doctype html><html lang="en"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Please try again</title><body style="font:18px system-ui;padding:24px"><h1>The site is temporarily unavailable</h1><p>Your work has not been changed. Please try again.</p><a href="/">Try again</a></body></html>',503)}}
function html(page:string,status=200){return new Response(page,{status,headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','Vary':'Cookie','X-Content-Type-Options':'nosniff'}})}
