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
}));

const form=document.querySelector('#inquiry-form');
if(form){form.addEventListener('submit',(e)=>{
  e.preventDefault();
  const data=new FormData(form);
  const subject=encodeURIComponent(`REALS Website Inquiry - ${data.get('company')||'New Customer'}`);
  const body=encodeURIComponent(`Name: ${data.get('name')}\nCompany: ${data.get('company')}\nCountry: ${data.get('country')}\nEmail: ${data.get('email')}\nProduct: ${data.get('product')}\nAnnual quantity: ${data.get('quantity')}\n\nApplication / message:\n${data.get('message')}`);
  const status=document.querySelector('.form-status');
  status.style.display='block';
  status.textContent='Your email application will open. Please attach drawings or specifications before sending.';
  setTimeout(()=>{window.location.href=`mailto:sales@realsauto.com?subject=${subject}&body=${body}`},450);
})}
