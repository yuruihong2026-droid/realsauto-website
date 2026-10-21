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

const productPageTitle=document.querySelector('.page-hero h1')?.textContent.trim();
const productSelectValue={
  'Automotive PET Fleece Tape for Wire Harness':'LY6531 Fleece Tape',
  'Automotive Polyester Fabric Tape for Wire Harness':'LY6524 Fabric Tape',
  'Automotive PVC Wire Harness Tape':'LY6512 PVC Tape',
  'Aluminum Foil Fiberglass Tape for High-Temperature Harness Protection':'LY6632 Aluminum Foil Tape',
  'Automotive Cable Clips & Cable Ties':'Cable Clips & Ties',
  'Expandable Braided Sleeving & Self-Wrap Sleeve':'Protective Sleeving'
}[productPageTitle];
if(productSelectValue){
  const inquiryUrl=`contact.html?product=${encodeURIComponent(productSelectValue)}&source=product-page#samples`;
  const technicalCta=document.querySelector('.product-detail-copy .download-row a[href*="contact.html"]');
  if(technicalCta){technicalCta.href=inquiryUrl;technicalCta.textContent='Request TDS & Sample';technicalCta.dataset.track='sample_request';technicalCta.dataset.source='product-page'}
  const bottomCta=document.querySelector('.cta .btn');
  if(bottomCta){bottomCta.href=inquiryUrl;bottomCta.textContent='Get TDS & Samples';bottomCta.dataset.track='sample_request';bottomCta.dataset.source='product-page-cta'}
  const ctaTitle=document.querySelector('.cta h2');
  if(ctaTitle) ctaTitle.textContent=`Need ${productSelectValue} technical data or samples?`;
  document.querySelectorAll('a[href^="https://wa.me/"]').forEach(link=>{
    const message=encodeURIComponent(`Hello REALS, I am interested in ${productSelectValue}. Please share technical data and sample information.`);
    link.href=`https://wa.me/8613207664600?text=${message}`;
  });
}

const productCardValues={ly6531:'LY6531 Fleece Tape',ly6524:'LY6524 Fabric Tape',ly6512:'LY6512 PVC Tape',ly6632:'LY6632 Aluminum Foil Tape','clips-ties':'Cable Clips & Ties',sleeving:'Protective Sleeving'};
Object.entries(productCardValues).forEach(([id,product])=>{
  const card=document.getElementById(id);
  const sampleLink=card?.querySelector('a[href*="contact.html"]');
  if(sampleLink){
    sampleLink.href=`contact.html?product=${encodeURIComponent(product)}&source=product-grid#samples`;
    sampleLink.textContent='Request TDS & Sample';
    sampleLink.dataset.track='sample_request';
    sampleLink.dataset.source='product-grid';
  }
});

const form=document.querySelector('#inquiry-form');
const params=new URLSearchParams(window.location.search);
const selectedProduct=params.get('product');
if(form&&selectedProduct){
  const productSelect=form.querySelector('#product');
  if(productSelect){
    [...productSelect.options].forEach(option=>{if(option.value===selectedProduct) productSelect.value=selectedProduct});
  }
}
if(form){
  let formStarted=false;
  form.addEventListener('focusin',()=>{
    if(!formStarted&&typeof window.gtag==='function'){
      formStarted=true;
      window.gtag('event','form_start',{product:form.querySelector('#product')?.value || 'not_set'});
    }
  });
}

document.querySelectorAll('[data-track], a[href^="https://wa.me/"], a[href^="mailto:"]').forEach(link=>{
  link.addEventListener('click',()=>{
    if(typeof window.gtag==='function'){
      const eventName=link.dataset.track || (link.href.startsWith('https://wa.me/') ? 'whatsapp_click' : 'email_click');
      window.gtag('event',eventName,{link_url:link.href,source:link.dataset.source || window.location.pathname});
    }
  });
});

if(form){form.addEventListener('submit',async(e)=>{
  e.preventDefault();
  const status=document.querySelector('.form-status');
  const btn=form.querySelector('button[type="submit"]');
  if(form.querySelector('input[name="access_key"]').value.startsWith('YOUR_')){
    status.style.display='block';
    status.textContent='Form service key not configured yet. Please contact us directly at ryan@realsauto.com';
    return;
  }
  btn.disabled=true; btn.textContent='Sending...';
  if(typeof window.gtag==='function') window.gtag('event','form_submit_attempt',{product:form.querySelector('#product')?.value || 'not_set'});
  const data=new FormData(form);
  data.append('botcheck','');
  data.append('landing_page',window.location.href);
  data.append('referrer',document.referrer || 'direct');
  try{
    const res=await fetch(form.action,{method:'POST',body:data,headers:{'Accept':'application/json'}});
    const json=await res.json();
    if(json.success){
      if(typeof window.gtag==='function') window.gtag('event','generate_lead',{product:form.querySelector('#product')?.value || 'not_set'});
      status.style.display='block'; status.style.color='var(--green)';
      status.textContent='Thank you! Your inquiry has been sent. We will reply within one business day. For urgent requests, please use WhatsApp.';
      form.reset();
    }else{
      status.style.display='block'; status.style.color='#d42020';
      status.textContent='There was an error sending your message. Please try again or email ryan@realsauto.com';
    }
  }catch(err){
    status.style.display='block'; status.style.color='#d42020';
    status.textContent='Network error. Please try again or email ryan@realsauto.com';
  }
  btn.disabled=false; btn.textContent='Submit Inquiry';
})}

const fallbackEmail='yu.ruihong@tjlanyu.com.cn';
const web3FormsKey='3834b9e2-8924-48f9-9637-74b026008419';

async function submitWeb3Form(formElement){
  const data=new FormData(formElement);
  data.set('access_key',web3FormsKey);
  data.set('source',window.location.pathname);
  data.append('botcheck','');
  const response=await fetch('https://api.web3forms.com/submit',{method:'POST',body:data,headers:{Accept:'application/json'}});
  const result=await response.json();
  if(!response.ok||!result.success) throw new Error('Web3Forms submission failed');
  return result;
}

document.querySelectorAll('.product-inquiry-form').forEach(inquiryForm=>{
  const source=inquiryForm.querySelector('input[name="source"]');
  if(source) source.value=window.location.pathname;
  inquiryForm.addEventListener('submit',async event=>{
    event.preventDefault();
    const button=inquiryForm.querySelector('button[type="submit"]');
    const status=inquiryForm.querySelector('.form-status');
    const originalLabel=button.textContent;
    button.disabled=true; button.textContent='Sending...';
    try{
      await submitWeb3Form(inquiryForm);
      const product=inquiryForm.querySelector('input[name="product"]')?.value||'General inquiry';
      if(typeof window.gtag==='function') window.gtag('event','inquiry_submit',{product});
      inquiryForm.reset();
      if(source) source.value=window.location.pathname;
      status.style.display='block'; status.style.color='var(--green)';
      status.textContent='Thanks — we reply within 1 business day.';
    }catch(error){
      status.style.display='block'; status.style.color='#ff8b8b';
      status.innerHTML=`Sorry, the form could not be sent. Please email <a href="mailto:${fallbackEmail}">${fallbackEmail}</a>.`;
    }finally{button.disabled=false;button.textContent=originalLabel}
  });
});

document.querySelectorAll('.tds-trigger[data-dialog]').forEach(trigger=>{
  trigger.addEventListener('click',()=>document.getElementById(trigger.dataset.dialog)?.showModal());
});
document.querySelectorAll('.tds-dialog').forEach(dialog=>{
  dialog.querySelector('.tds-close')?.addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',event=>{if(event.target===dialog) dialog.close()});
});
document.querySelectorAll('.tds-form').forEach(tdsForm=>{
  tdsForm.addEventListener('submit',async event=>{
    event.preventDefault();
    const button=tdsForm.querySelector('button[type="submit"]');
    const status=tdsForm.querySelector('.tds-confirmation');
    const originalLabel=button.textContent;
    button.disabled=true; button.textContent='Sending...';
    try{
      await submitWeb3Form(tdsForm);
      const product=tdsForm.querySelector('input[name="product"]')?.value||'not_set';
      if(typeof window.gtag==='function') window.gtag('event','tds_request',{product});
      status.textContent='We received your request and will reply within 24 hours. Your download is starting.';
      const download=document.createElement('a');
      download.href=tdsForm.dataset.pdf; download.download=''; document.body.appendChild(download); download.click(); download.remove();
      tdsForm.reset();
    }catch(error){
      status.innerHTML=`Sorry, the form could not be sent. Please email <a href="mailto:${fallbackEmail}">${fallbackEmail}</a>.`;
    }finally{button.disabled=false;button.textContent=originalLabel}
  });
});

document.querySelectorAll('.video-frame').forEach(async frame=>{
  const video=frame.querySelector('video');
  const source=video?.querySelector('source');
  if(!video||!source) return;
  try{
    const response=await fetch(source.src,{method:'HEAD',cache:'no-store'});
    if(!response.ok) return;
    frame.classList.add('is-ready'); video.load();
  }catch(error){/* The poster placeholder remains visible until the MP4 exists. */}
  video.addEventListener('play',()=>{
    if(video.dataset.playTracked) return;
    video.dataset.playTracked='true';
    if(typeof window.gtag==='function') window.gtag('event','video_play',{video_name:video.dataset.videoName||source.src.split('/').pop()});
  });
});
