/* Client-side presentation of PUBLISHED CMS data. No secret keys or write access. */
(() => {
  'use strict';
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => [...r.querySelectorAll(s)];
  const defaults = window.PORTFOLIO_DEFAULTS || {};
  const originalServiceDemos = $$('#services .service-card .service-demo').map(node=>node.cloneNode(true));
  const configuration = window.CMS_CONFIG || {};
  const set = (s, value, root=document) => { const el = $(s,root); if (el && value !== undefined && value !== null) el.textContent = String(value); };
  const cleanUrl = (url) => {
    if (!url || typeof url !== 'string') return '';
    const value = url.trim();
    if (!value || /[\u0000-\u001F]/.test(value)) return '';
    if (value.startsWith('#')) return /^#[a-zA-Z][\w-]*$/.test(value) ? value : '';
    if (value.startsWith('/') && !value.startsWith('//')) return value;
    if (/^[a-z0-9][\w.\-/%?=&+#]*$/i.test(value) && !value.includes(':')) return value;
    try { const parsed = new URL(value); return ['https:','http:'].includes(parsed.protocol) ? parsed.href : ''; } catch { return ''; }
  };
  const heading = (selector, first, accent) => {
    const el = $(selector); if (!el) return;
    el.replaceChildren(document.createTextNode(first || ''), document.createElement('br'));
    const em = document.createElement('em'); em.textContent = accent || ''; el.append(em);
  };
  const appendText = (tag, cls, value, parent) => { const n=document.createElement(tag); if(cls)n.className=cls; n.textContent=String(value || ''); parent.append(n); return n; };
  const putLink = (selector, url) => { const el=$(selector); const safe=cleanUrl(url); if(el && safe) el.href=safe; };
  const refreshList = (selector, items, tag='span') => {
    const root=$(selector); if (!root || !Array.isArray(items)) return;
    root.replaceChildren(); items.forEach(item => appendText(tag, '', item, root));
  };
  const renderServices = items => {
    const grid=$('#services .services-grid'); if(!grid || !Array.isArray(items)) return;
    grid.replaceChildren();
    items.forEach((item,i)=>{
      const a=document.createElement('article');a.className='service-card reveal visible';
      const head=appendText('div','service-head','',a);
      appendText('span','',String(i+1).padStart(2,'0'),head);
      appendText('i','',item.icon || '◇',head);
      appendText('h3','',item.title,a);
      appendText('p','',item.description,a);
      const originalDemo=originalServiceDemos[i]?.cloneNode(true);
      if(originalDemo)a.append(originalDemo);else {const visual=appendText('div','service-demo cms-service-demo','',a);appendText('span','',item.icon || '◈',visual);}
      const link=appendText('a','',`${item.cta || 'Discuss a project'} ↗`,a);link.href='#contact';
      grid.append(a);
    });
  };
  const renderTimeline = items => {
    const line=$('#journeyLine');if(!line || !Array.isArray(items))return;
    $$('.journey-item',line).forEach(el=>el.remove());
    items.forEach(item=>{
      const a=appendText('article','journey-item reveal visible','',line);
      appendText('div','journey-year',item.year,a);appendText('span','journey-dot','',a);
      const card=appendText('div','journey-card glass-panel','',a);
      appendText('small','',item.category,card);appendText('h3','',item.title,card);appendText('p','',item.description,card);
      const tags=appendText('div','','',card);(Array.isArray(item.tags)?item.tags:[]).forEach(t=>appendText('span','',t,tags));
    });
  };
  const renderProjects = data => {
    const section=$('#projects'), grid=$('#projectsGrid');if(!section || !grid || !data)return;
    heading('#projects h2',data.heading1,data.heading2);set('#projects .section-intro-text',data.description);
    grid.replaceChildren();
    const items=(Array.isArray(data.items)?data.items:[]).filter(x=>x && x.visible!==false);
    section.hidden = items.length===0;
    const nav=$('#cmsProjectsNav'), footer=$('#cmsProjectsFooterLink'); if(nav)nav.hidden=items.length===0;if(footer)footer.hidden=items.length===0;
    items.forEach(item=>{
      const card=appendText('article','cms-project-card reveal visible','',grid);
      const media=appendText('div','cms-project-media','',card);
      const imgUrl=cleanUrl(item.imageUrl);
      if(imgUrl){const img=document.createElement('img');img.src=imgUrl;img.alt=`Screenshot of ${item.title || 'project'}`;img.loading='lazy';media.append(img);}
      else appendText('span','cms-project-symbol','◈',media);
      if(item.featured)appendText('span','cms-project-featured','Featured',media);
      const body=appendText('div','cms-project-body','',card);
      appendText('p','cms-project-category',item.category,body);
      appendText('h3','',item.title,body);appendText('p','cms-project-description',item.description,body);
      const stack=appendText('div','cms-project-tags','',body);
      (Array.isArray(item.stack)?item.stack:[]).forEach(t=>appendText('span','',t,stack));
      const actions=appendText('div','cms-project-links','',body);
      [['liveUrl','Live site ↗'],['githubUrl','GitHub ↗']].forEach(([key,label])=>{
        const url=cleanUrl(item[key]);if(!url)return;
        const a=appendText('a','',label,actions);a.href=url;a.target='_blank';a.rel='noopener noreferrer';
      });
    });
  };
  const renderPrinciples = items => {
    const slider=$('#feedbackSlider'); if(!slider || !Array.isArray(items))return;
    slider.replaceChildren();items.forEach((item,i)=>{
      const a=appendText('article',`feedback-card glass-panel${i===0?' active':''}`,'',slider);
      appendText('span','',String(i+1).padStart(2,'0'),a);
      appendText('blockquote','',item.quote,a);appendText('p','',item.description,a);appendText('small','',item.label,a);
    });
    window.dispatchEvent(new CustomEvent('portfolio:principles'));
  };
  function apply(content) {
    if(!content || typeof content !== 'object' || Array.isArray(content))return;
    const data={...defaults,...content};
    const {site={},hero={},about={},services={},skills={},journey={},projects={},contact={},extras={},assistant={},seo={}}=data;
    if(window.SITE_CONFIG)Object.assign(window.SITE_CONFIG,site);
    set('.brand-copy strong',site.shortName);$$('.footer .brand-copy strong').forEach(n=>n.textContent=site.shortName || '');
    set('.profile-mini strong',site.ownerName);set('.profile-mini span',`${site.role || ''} · ${site.companyRole || ''}`);
    set('.profile-avatar', (site.shortName || 'CK').split(' ').map(x=>x[0]).join('').slice(0,2).toUpperCase());
    set('.hero-meta > div:first-child strong',site.location);
    set('.signature-name',(site.ownerName || '').replace(/\s/g,''));
    set('.signature-role',site.role || 'Software Developer');
    ['linkedin','github','instagram'].forEach(network=>{
      putLink(`[data-cms-social="${network}"]`,site[network+'Url']);
      putLink(`[data-cms-footer-social="${network}"]`,site[network+'Url']);
    });
    const digits=String(site.whatsappNumber || '').replace(/[^0-9]/g,'');
    if(digits){putLink('.footer a[href^="https://wa.me/"]',`https://wa.me/${digits}`);putLink('.contact-routes > a',`https://wa.me/${digits}`);}
    set('.contact-routes > a strong',site.whatsappDisplay);
    set('.contact-routes > div:nth-child(2) strong',site.location);
    set('.contact-routes > div:nth-child(3) strong',site.companyRole);
    const portrait=cleanUrl(site.portraitUrl);if(portrait){const img=$('.portrait-float img');if(img)img.src=portrait;}
    const cvUrl=cleanUrl(site.cvUrl);const cv=$('#cmsCvLink');if(cv){cv.hidden=!cvUrl;if(cvUrl)cv.href=cvUrl;}
    const pill=$('.status-pill');if(pill){pill.replaceChildren(document.createElement('span'),document.createTextNode(` ${hero.badge || ''}`));}set('.hero .eyebrow',hero.eyebrow);
    const h=$('.hero h1');if(h){h.replaceChildren();for(let i=1;i<=3;i++){if(i>1)h.append(document.createElement('br'));h.append(document.createTextNode(`${hero['line'+i] || ''} `));const em=document.createElement('em');em.textContent=hero['accent'+i] || '';h.append(em);}}
    set('.hero-description',hero.description);set('.hero-meta > div:last-child strong',hero.focus);
    const heroAction=$('.hero-actions a[href="#about"]');if(heroAction)heroAction.replaceChildren(document.createTextNode(`${hero.buttonText || 'About me'} `),document.createElement('span'));
    const heroArrow=heroAction?.querySelector('span');if(heroArrow)heroArrow.textContent='↗';
    const ticker=$('.ticker-track');if(ticker && Array.isArray(hero.ticker)){ticker.replaceChildren();[...hero.ticker,...hero.ticker].forEach(label=>{appendText('span','',label,ticker);appendText('i','','✦',ticker);});}
    heading('#about h2',about.heading1,about.heading2);set('#about .section-heading > p:not(.section-label)',about.description);
    set('[data-workspace-panel="story"] h3',about.storyTitle);set('[data-workspace-panel="story"] > p:not(.workspace-kicker)',about.storyBody);
    set('[data-workspace-panel="process"] h3',about.processTitle);
    set('[data-workspace-panel="tools"] h3',about.toolsTitle);
    set('[data-workspace-panel="facts"] h3',about.factsTitle);
    const milestoneRoot=$('.story-timeline');if(milestoneRoot && Array.isArray(about.milestones)){milestoneRoot.replaceChildren();about.milestones.forEach(item=>{const itemNode=appendText('span','','',milestoneRoot);appendText('i','','',itemNode);appendText('b','',item.title,itemNode);appendText('small','',item.description,itemNode);});}
    const steps=$('.process-grid');if(steps && Array.isArray(about.steps)){steps.replaceChildren();about.steps.forEach((item,i)=>{const a=appendText('article','','',steps);appendText('span','',String(i+1).padStart(2,'0'),a);appendText('strong','',item.title,a);appendText('p','',item.description,a);});}
    refreshList('.tool-cloud',about.tools);
    const facts=$('.fact-grid');if(facts && Array.isArray(about.facts)){facts.replaceChildren();about.facts.forEach(item=>{const a=appendText('article','','',facts);appendText('small','',item.label,a);appendText('strong','',item.value,a);});}
    heading('#services h2',services.heading1,services.heading2);set('#services .section-intro-text',services.description);renderServices(services.items);
    heading('#skills h2',skills.heading1,skills.heading2);refreshList('.skill-stack',skills.stack);
    if(Array.isArray(skills.items))window.dispatchEvent(new CustomEvent('portfolio:skills',{detail:skills.items}));
    heading('#journey h2',journey.heading1,journey.heading2);set('#journey .section-intro-text',journey.description);renderTimeline(journey.items);
    renderProjects(projects);
    heading('#contact h2',contact.heading1,contact.heading2);set('.contact-copy > p:not(.section-label)',contact.description);
    ['service','budget','timeline','stage'].forEach(key=>{
      const select=$(`#contactForm select[name="${key}"]`), values=contact[key+'Options'];
      if(!select || !Array.isArray(values) || !values.length)return;
      select.replaceChildren();values.forEach(value=>appendText('option','',value,select));
    });
    heading('.lab-controls h2',extras.labHeading1,extras.labHeading2);
    set('.lab-controls > p:not(.section-label)',extras.labDescription);
    heading('.feedback-section h2',extras.principlesHeading1,extras.principlesHeading2);
    set('.feedback-section .section-heading > p:not(.section-label)',extras.principlesDescription);
    renderPrinciples(extras.principles);
    set('.footer-grid > div:first-child > p',extras.footerDescription);
    if(assistant)window.dispatchEvent(new CustomEvent('portfolio:assistant',{detail:assistant}));
    if(seo.title)document.title=String(seo.title);
    [['meta[name="description"]',seo.description],['meta[name="keywords"]',seo.keywords],['meta[property="og:title"]',seo.title],['meta[property="og:description"]',seo.description]].forEach(([selector,value])=>{const element=$(selector);if(element && value)element.content=String(value);});
    if(seo.ogImage){const image=cleanUrl(seo.ogImage);if(image){$$('meta[property="og:image"],meta[name="twitter:image"]').forEach(n=>n.content=image);}}
  }
  window.PORTFOLIO_CMS_APPLY=apply;
  // The editor's same-origin preview may send unpublished content. Never uses write privileges.
  window.addEventListener('message',event=>{if(event.origin!==window.location.origin || window.parent===window || event.source!==window.parent)return;if(event.data?.type==='portfolio-cms-preview' && event.data.content)apply(event.data.content);});
  // The preview iframe receives private draft data from the same-origin admin page.
  // Skip the published fetch here to prevent it from replacing the draft mid-preview.
  if(new URLSearchParams(window.location.search).has('cms_preview'))return;
  const {supabaseUrl,publishableKey}=configuration;
  if(!/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(supabaseUrl||'') || !publishableKey)return;
  fetch(`${supabaseUrl.replace(/\/$/,'')}/rest/v1/cms_content?key=eq.published&select=payload&limit=1`,{
    headers:{apikey:publishableKey,Accept:'application/json'},cache:'no-store'
  }).then(async response=>{if(!response.ok)throw Error(`CMS unavailable (${response.status})`);return response.json();})
    .then(rows=>{if(rows[0]?.payload)apply(rows[0].payload);})
    .catch(error=>console.warn('Showing static portfolio content; CMS could not load.',error));
})();
