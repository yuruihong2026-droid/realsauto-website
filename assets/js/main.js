const observer = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('in-view');observer.unobserve(entry.target)}})
},{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));

const toggle=document.querySelector('.menu-toggle');
const nav=document.querySelector('.desktop-nav');
if(toggle&&nav){toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')==='true';toggle.setAttribute('aria-expanded',String(!open));nav.style.display=open?'none':'flex';if(!open){nav.style.position='fixed';nav.style.inset='68px 0 auto 0';nav.style.flexDirection='column';nav.style.padding='30px';nav.style.background='#061018';nav.style.alignItems='center'}})}

document.querySelectorAll('.app-chip').forEach(chip=>chip.addEventListener('click',()=>{
  document.querySelectorAll('.app-chip').forEach(c=>c.classList.remove('active'));
  chip.classList.add('active');
  const img=document.querySelector('#app-scene');
  const caption=document.querySelector('#app-caption');
  if(img&&chip.dataset.image){
    img.style.opacity=0;
    setTimeout(()=>{
      img.src=`assets/img/${chip.dataset.image}`;
      img.style.opacity=1;
      if(caption) caption.textContent=chip.dataset.label;
    },200);
  }
}));

const form=document.querySelector('#inquiry-form');
if(form){form.addEventListener('submit',async(e)=>{
  e.preventDefault();
  const status=document.querySelector('.form-status');
  const btn=form.querySelector('button[type="submit"]');
  if(form.querySelector('input[name="access_key"]').value.startsWith('YOUR_')){
    status.style.display='block';
    status.textContent='Form service key not configured yet. Please contact us directly at yu.ruihong@tjlanyu.com.cn';
    return;
  }
  btn.disabled=true; btn.textContent='Sending...';
  const data=new FormData(form);
  data.append('botcheck','');
  try{
    const res=await fetch(form.action,{method:'POST',body:data,headers:{'Accept':'application/json'}});
    const json=await res.json();
    if(json.success){
      status.style.display='block'; status.style.color='var(--green)';
      status.textContent='Thank you! Your inquiry has been sent. We will reply within one business day.';
      form.reset();
    }else{
      status.style.display='block'; status.style.color='#d42020';
      status.textContent='There was an error sending your message. Please try again or email yu.ruihong@tjlanyu.com.cn';
    }
  }catch(err){
    status.style.display='block'; status.style.color='#d42020';
    status.textContent='Network error. Please try again or email yu.ruihong@tjlanyu.com.cn';
  }
  btn.disabled=false; btn.textContent='Submit Inquiry';
})}
