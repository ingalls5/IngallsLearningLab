import {env} from 'cloudflare:workers';
import {membership,signedInUser,waitingPage} from '../../lib/access';
export const dynamic='force-dynamic';
export async function GET(request:Request){
 const member=await membership(request,env.DB),user=signedInUser(request);
 if(member?.status==='approved'&&!member.password_required)return new Response(null,{status:303,headers:{Location:'/','Cache-Control':'no-store'}});
 if(member?.password_required)return new Response(null,{status:303,headers:{Location:'/student','Cache-Control':'no-store'}});
 return new Response(waitingPage(user,member).replace('</main>','<p><a href="/">Back to Home</a></p></main>'),{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','Vary':'Cookie','X-Content-Type-Options':'nosniff'}});
}
