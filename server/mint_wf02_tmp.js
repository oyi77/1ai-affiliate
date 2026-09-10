const fs=require('fs');
const path=require('path');
const jwt=require('jsonwebtoken');
const env=fs.readFileSync('/home/openclaw/projects/1ai-affiliate/.env','utf8').split('\n').reduce((a,l)=>{const m=l.match(/^([A-Z0-9_]+)=(.*)$/);if(m)a[m[1]]=m[2].replace(/\s#.*$/,'');
return a;},{});
const JWT_SECRET=env.JWT_SECRET;
const token=jwt.sign({id:1,email:'vilona@local',role:'admin',affiliateId:13},JWT_SECRET,{expiresIn:'1h'});
(async()=>{
  const resp=await fetch('http://127.0.0.1:3001/api/smartlink/generate',{
    method:'POST',
    headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},
    body:JSON.stringify({offer_id:713})
  });
  const data=await resp.json();
  console.log('HTTP',resp.status);
  console.log(JSON.stringify(data,null,2));
  if(data.url) fs.writeFileSync('/tmp/wf02_smartlink.json',JSON.stringify({url:data.url,slug:data.slug,short_url:data.short_url},null,2));
})().catch(e=>{console.error('ERR',e.message);process.exit(1);});
