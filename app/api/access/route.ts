import {env} from 'cloudflare:workers';
import {accessAPI} from '../../../lib/access';
export const GET=(request:Request)=>accessAPI(request,env);
export const POST=(request:Request)=>accessAPI(request,env);
