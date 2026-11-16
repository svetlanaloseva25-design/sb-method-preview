/* Forward previously shared invitations to the current SB METHOD landing. */
(()=>{'use strict';
 const current=new URL(location.href);
 const code=current.searchParams.get('ref')||'';
 const ticket=current.searchParams.get('invite')||'';
 const validCode=/^(?:[a-f0-9]{16}|[A-Za-z0-9_-]{22})$/.test(code);
 const validTicket=ticket.length<400&&/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(ticket);
 if(!/\/day\.html$/.test(current.pathname)&&!validCode&&!validTicket)return;
 const target=new URL('https://app.sb-method.space/pwa-install.html');
 if(validCode)target.searchParams.set('ref',code);
 if(validTicket)target.searchParams.set('invite',ticket);
 for(const key of ['utm_source','utm_medium','utm_campaign','utm_content','utm_term']){
  const value=current.searchParams.get(key);if(value)target.searchParams.set(key,value.slice(0,300));
 }
 if(current.hash==='#install')target.hash='#install';
 const fallback=document.getElementById('current-landing');
 if(fallback)fallback.href=target.href;
 location.replace(target.href);
})();

