// Share the welcome content and responsive styling without shipping homework
// controls, account data, or authenticated client code to signed-out visitors.
export function publicHomepage(template:string,photo:string){
 const head=template.slice(0,template.indexOf('<main>'));
 const start=template.indexOf('<section id="home">');
 const end=template.indexOf('<section id="homework"');
 const welcome=template.slice(start,end)
  .replace('__FAMILY_PHOTO__',()=>photo)
  .replace('<button onclick="showTab(\'homework\')">Open Homework</button>','<a class="login-button" href="/login">Log in to open Homework</a>');
 return head.replace('</style>','.login-button{display:inline-flex;align-items:center;justify-content:center;min-height:48px;padding:13px 20px;background:#2551da;color:white;font-weight:700;border-radius:12px;text-decoration:none}.login-button:focus-visible{outline:3px solid #ffb629;outline-offset:3px}.account-entry{margin:0 0 24px}</style>')+'<main><p class="account-entry"><a class="login-button" href="/login">Log in</a></p>'+welcome+'</main></body></html>';
}
