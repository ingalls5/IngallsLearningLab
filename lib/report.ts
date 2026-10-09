import {PDFDocument, StandardFonts, rgb} from 'pdf-lib';
const printable=(value:unknown)=>String(value??'').replace(/[‘’]/g,"'").replace(/[“”]/g,'"').replace(/[−–—]/g,'-').replace(/×/g,'x').replace(/÷/g,'/').replace(/→/g,' -> ').replace(/…/g,'...').replace(/·/g,' - ').normalize('NFKD').replace(/[^\x20-\x7e\n]/g,'');
export async function activityPDF(activity:any){
 const student=printable(activity.student_name||'Jacob');const pdf=await PDFDocument.create();pdf.setTitle(`${student}'s work - ${printable(activity.title)}`);pdf.setAuthor("Ingalls Learning Lab");
 const font=await pdf.embedFont(StandardFonts.Helvetica),bold=await pdf.embedFont(StandardFonts.HelveticaBold);
 let page:any,y=750;
 function newPage(){page=pdf.addPage([612,792]);y=750}
 function ensure(height:number){if(!page||y-height<42)newPage()}
 function text(value:unknown,size=12,strong=false){
  const selected=strong?bold:font,lines:string[]=[];
  for(const paragraph of printable(value).split('\n')){let line='';for(const word of paragraph.split(/\s+/)){if(!word)continue;const candidate=line?line+' '+word:word;if(selected.widthOfTextAtSize(candidate,size)<=532){line=candidate;continue}if(line)lines.push(line);line='';for(const char of word){if(selected.widthOfTextAtSize(line+char,size)>532){lines.push(line);line=''}line+=char}}lines.push(line)}
  for(const line of lines){ensure(size+7);page.drawText(line,{x:40,y:y-size,size,font:selected,color:rgb(.08,.15,.29)});y-=size+7}
 }
 async function drawing(image:string,label:string){const bytes=Uint8Array.from(atob(image.split(',')[1]),c=>c.charCodeAt(0));const embedded=await pdf.embedJpg(bytes);const width=Math.min(440,embedded.width,embedded.width*350/embedded.height),height=embedded.height*width/embedded.width;ensure(height+34);text(label,12,true);page.drawImage(embedded,{x:40,y:y-height,width,height});y-=height+12}
 const review=activity.questions.filter((q:any)=>q.status==='review').length,wrong=activity.questions.filter((q:any)=>!q.firstTryCorrect&&q.status!=='review').length;
 newPage();text("Ingalls Learning Lab - completed work",18,true);text(`${student} - ${activity.title}`,15,true);text(activity.subject==='flashcards'?`${activity.total} flash cards viewed | No score`:['tracing','penmanship'].includes(activity.subject)?`${activity.total} ${activity.subject==='flashcards'?'flash cards':activity.subject==='penmanship'?'penmanship pages':'tracing items'} completed`:`${activity.subject} | ${activity.score}/${activity.total} correct | ${wrong} wrong${review?` | ${review} need review`:''}`);if(activity.subject==='flashcards')text(activity.elapsed_seconds!=null?`Elapsed time: ${Math.floor(activity.elapsed_seconds/60)} min ${activity.elapsed_seconds%60} sec`:'Elapsed time: not recorded');text(`Completed: ${new Date(activity.created_at).toISOString().replace('T',' ').slice(0,16)} UTC`);y-=10;
 for(let i=0;i<activity.questions.length;i++){
  const q=activity.questions[i];if(activity.subject==='flashcards'){ensure(28);text(`${i+1}. ${q.question}`,12);continue}if(i>0&&['math','tracing','penmanship'].includes(activity.subject))newPage();ensure(110);
  text(`${i+1}. ${q.question}`,14,true);text(q.status==='practice'?(activity.subject==='flashcards'?'FLASH CARD PRACTICE':'WRITING PRACTICE'):q.status==='review'?'NEEDS PARENT REVIEW':q.firstTryCorrect?'CORRECT':q.gradingReason==='spelling'?'WRONG - SPELLING ERROR':'WRONG ANSWER',12,true);
  if(q.parentReview)text(`Parent review: ${q.parentReview.decision==='correct'?'Correct':'Wrong'} - ${q.parentReview.reviewerName} (${q.parentReview.reviewerRole}) | ${q.parentReview.reviewedAt}`,10);
  text(`${student}'s answer${q.attempts.length>1?'s':''}: ${q.attempts.length?q.attempts.join(' -> '):'No answer entered'}`);text(`${q.status==='practice'?(activity.subject==='flashcards'?'Card name':'Writing guide'):q.typed?'Sample answer':'Correct answer'}: ${q.correctAnswer}`);if(q.misspelledWords?.length)text(`Spelling errors: ${q.misspelledWords.join(', ')}`);y-=8;
  if(q.guideImage)await drawing(q.guideImage,`${student}'s guided tracing`);
  if(q.workImage)await drawing(q.workImage,`${student}'s ${q.status==='practice'?(activity.subject==='penmanship'?'copied writing':'tracing'):'scratch work'}`);
  if(q.answerImage)await drawing(q.answerImage,q.status==='practice'?`${student}'s independent writing`:'Handwritten answer');
  if(!q.workImage&&!q.answerImage&&activity.subject==='math')text('No drawing was saved for this question.',10);
  y-=16;
 }
 const pages=pdf.getPages();pages.forEach((p,i)=>p.drawText(`${student}'s work | Page ${i+1} of ${pages.length}`,{x:40,y:22,size:9,font,color:rgb(.35,.4,.5)}));
 return pdf.save();
}
