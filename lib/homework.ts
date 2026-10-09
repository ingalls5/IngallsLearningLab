import {ensureJacob} from './student';

// Student tabs and report ownership come from approved server-side identities.
export async function homeworkStudents(db:any,member:any){
 if(member.role==='teacher'){
  const rows=await db.prepare("SELECT m.user_id AS id,m.name,l.username FROM teacher_students t JOIN family_members m ON m.user_id = t.student_id JOIN student_logins l ON l.user_id = m.user_id WHERE t.user_id = ? AND m.role = 'student' AND m.status = 'approved' AND l.username IN ('jacob','owen')").bind(member.user_id).all();
  return rows.results.map(studentProfile);
 }
 if(member.role!=='parent'&&member.role!=='owner'){const login=await db.prepare('SELECT username FROM student_logins WHERE user_id = ?').bind(member.user_id).first();return [studentProfile({id:member.user_id,name:member.name,username:login?.username})];}
 await ensureJacob(db);
 const rows=await db.prepare("SELECT m.user_id AS id,m.name,l.username FROM family_members m JOIN student_logins l ON l.user_id = m.user_id WHERE l.username IN ('jacob','owen') AND m.role = 'student' AND m.status = 'approved' ORDER BY CASE l.username WHEN 'jacob' THEN 0 ELSE 1 END").all();
 return rows.results.map(studentProfile);
}

export async function homeworkSubmitter(db:any,member:any,studentId:unknown){
 if(member?.role==='teacher'&&studentId===undefined){const allowed=await homeworkStudents(db,member);if(allowed.length!==1)throw new Error('Ask the Owner to assign your student.');return allowed[0].id;}
 if(studentId===undefined)return member?.user_id||null;
 if(typeof studentId!=='string')throw new Error('Choose a student from Homework.');
 const allowed=await homeworkStudents(db,member);
 if(!allowed.some((student:any)=>student.id===studentId))throw new Error('Your account cannot open homework for this student.');
 return studentId;
}

function studentProfile(student:any){return{id:student.id,name:student.name,subjects:student.username==='owen'?['tracing','flashcards']:['math','reading','penmanship']}}
