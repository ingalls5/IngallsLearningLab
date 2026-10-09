import {env} from 'cloudflare:workers';
import {studentSessionAPI} from '../../../../lib/student';
export const POST=(request:Request)=>studentSessionAPI(request,env);
