import {env} from 'cloudflare:workers';
import {familyAPI} from '../../../../lib/family';
import {guardFamily} from '../../../../lib/access';
const handle=(request:Request)=>guardFamily(request,env,familyAPI);
export const GET=handle;
export const POST=handle;
export const DELETE=handle;
