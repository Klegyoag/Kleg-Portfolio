/* Portfolio Studio — authenticated content editor. All writes are enforced by Supabase RLS. */
(() => {
  'use strict';
  const $ = (selector,root=document)=>root.querySelector(selector);
  const $$ = (selector,root=document)=>[...root.querySelectorAll(selector)];
  const clone = value => JSON.parse(JSON.stringify(value));
  const defaults = window.PORTFOLIO_DEFAULTS;
  const conf = window.CMS_CONFIG || {};
  const baseUrl = String(conf.supabaseUrl || '').replace(/\/$/,'');
  const apiKey = String(conf.publishableKey || '');
  const connected = /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(baseUrl) && !!apiKey;
  const storageKey = 'klegar-cms-auth-session';
  const field = (key,label,type='text',hint='') => ({key,label,type,hint});
  const collection = (key,label,fields,description='') => ({key,label,fields,description,kind:'collection'});
  const inputGroup = (label,fields) => ({label,fields,kind:'fields'});
  const sections = [
    {id:'overview',title:'Overview',icon:'▦',description:'Your content at a glance.'},
    {id:'site',title:'Profile & links',icon:'◉',description:'Your identity, social links, photos and downloadable CV.',groups:[
      inputGroup('Identity',[field('ownerName','Full name'),field('shortName','Display name'),field('role','Professional role'),field('companyRole','Company / position'),field('location','Location')]),
      inputGroup('Media',[field('portraitUrl','Profile portrait','image','Upload a portrait or paste a valid image URL.'),field('cvUrl','Downloadable CV','file','PDF file URL, or upload a PDF.')]),
      inputGroup('Contact & social links',[field('whatsappNumber','WhatsApp number (digits only)'),field('whatsappDisplay','Display number'),field('githubUrl','GitHub profile','url'),field('linkedinUrl','LinkedIn profile','url'),field('instagramUrl','Instagram profile','url')])
    ]},
    {id:'hero',title:'Homepage hero',icon:'✧',description:'First impressions, headline, introduction and ticker.',groups:[
      inputGroup('Hero identity',[field('badge','Status badge'),field('eyebrow','Greeting'),field('description','Hero description','textarea'),field('focus','Primary focus'),field('buttonText','Main CTA label')]),
      inputGroup('Main headline',[field('line1','Headline row 1 — regular'),field('accent1','Headline row 1 — accent'),field('line2','Headline row 2 — regular'),field('accent2','Headline row 2 — accent'),field('line3','Headline row 3 — regular'),field('accent3','Headline row 3 — accent')]),
      inputGroup('Scrolling expertise ticker',[field('ticker','Ticker items — one per line','lines')])
    ]},
    {id:'about',title:'About & story',icon:'☷',description:'About me, your process, toolkit and quick facts.',groups:[
      inputGroup('Section introduction',[field('heading1','Heading — regular'),field('heading2','Heading — accent'),field('description','Introduction','textarea'),field('storyTitle','My story title'),field('storyBody','My story','textarea')]),
      inputGroup('Additional headings',[field('processTitle','Process heading'),field('toolsTitle','Toolkit heading'),field('factsTitle','Quick facts heading')]),
      collection('milestones','Story highlights',[field('title','Title'),field('description','Description','textarea')]),
      collection('steps','Development process',[field('title','Step title'),field('description','Description','textarea')]),
      inputGroup('Toolkit chips',[field('tools','Tools — one per line','lines')]),
      collection('facts','Quick facts',[field('label','Label'),field('value','Value')])
    ]},
    {id:'projects',title:'Projects',icon:'◇',description:'Add projects, screenshots, technology stacks and live/GitHub links.',groups:[
      inputGroup('Portfolio showcase',[field('heading1','Section heading — regular'),field('heading2','Section heading — accent'),field('description','Section introduction','textarea')]),
      collection('items','Project cards',[field('title','Project name'),field('category','Category'),field('description','Short project description','textarea'),field('stack','Technologies — one per line','lines'),field('imageUrl','Screenshot / cover image','image'),field('liveUrl','Live demo link','url'),field('githubUrl','GitHub repository link','url'),field('featured','Featured project','checkbox'),field('visible','Visible on portfolio','checkbox')], 'Projects remain hidden from your site until you add at least one visible project.')
    ]},
    {id:'services',title:'Services',icon:'⌘',description:'Manage your service offerings and calls to action.',groups:[
      inputGroup('Section introduction',[field('heading1','Heading — regular'),field('heading2','Heading — accent'),field('description','Description','textarea')]),
      collection('items','Service cards',[field('title','Service name'),field('description','Description','textarea'),field('cta','Call-to-action text'),field('icon','Short text symbol / icon')])
    ]},
    {id:'skills',title:'Skills & toolkit',icon:'✳',description:'Update the interactive skills universe and proficiency.',groups:[
      inputGroup('Section header',[field('heading1','Heading — regular'),field('heading2','Heading — accent'),field('stack','Technology chips — one per line','lines')]),
      collection('items','Interactive skills',[field('icon','Main icon text'),field('short','Short label'),field('category','Category'),field('name','Skill name'),field('description','Description','textarea'),field('meter','Skill meter (0–100)','number'),field('level','Proficiency label')])
    ]},
    {id:'journey',title:'Journey',icon:'◷',description:'Edit your timeline, experience and achievements.',groups:[
      inputGroup('Timeline introduction',[field('heading1','Heading — regular'),field('heading2','Heading — accent'),field('description','Description','textarea')]),
      collection('items','Timeline milestones',[field('year','Year'),field('category','Category'),field('title','Milestone title'),field('description','Description','textarea'),field('tags','Tags — one per line','lines')])
    ]},
    {id:'contact',title:'Contact',icon:'✉',description:'The introduction above the WhatsApp enquiry form.',groups:[
      inputGroup('Contact page copy',[field('heading1','Heading — regular'),field('heading2','Heading — accent'),field('description','Description','textarea')]),
      inputGroup('Project enquiry form choices',[field('serviceOptions','Service choices — one per line','lines'),field('budgetOptions','Budget choices — one per line','lines'),field('timelineOptions','Timeline choices — one per line','lines'),field('stageOptions','Project stage choices — one per line','lines')])
    ]},
    {id:'extras',title:'Design & principles',icon:'◫',description:'Design lab, collaboration principles and footer copy.',groups:[
      inputGroup('Live design lab',[field('labHeading1','Heading — regular'),field('labHeading2','Heading — accent'),field('labDescription','Description','textarea')]),
      inputGroup('Working principles',[field('principlesHeading1','Heading — regular'),field('principlesHeading2','Heading — accent'),field('principlesDescription','Description','textarea'),field('footerDescription','Footer description','textarea')]),
      collection('principles','Principle cards',[field('quote','Principle statement','textarea'),field('description','Supporting description','textarea'),field('label','Category label')])
    ]},
    {id:'assistant',title:'Portfolio assistant',icon:'✦',description:'Custom answers for the existing on-site portfolio assistant.',groups:[
      inputGroup('Assistant messages',[field('intro','Welcome message','textarea'),field('fallback','Response when no answer matches','textarea')]),
      collection('faqs','Custom questions and answers',[field('question','Question'),field('answer','Answer','textarea')], 'Custom questions will be considered first.'),
      collection('knowledge','Original assistant knowledge',[field('id','Intent ID'),field('examples','Example questions — one per line','lines'),field('keywords','Keywords — one per line','lines'),field('answer','Answer text','textarea')], 'Edit the built-in question groups and their answers. This is the original assistant knowledge from your current portfolio.')
    ]},
    {id:'seo',title:'SEO & sharing',icon:'⌕',description:'Browser title, metadata and social sharing image.',groups:[
      inputGroup('Page metadata',[field('title','Browser tab title'),field('description','Search description','textarea'),field('keywords','Search keywords','textarea'),field('ogImage','Social sharing image URL','image')])
    ]}
  ];
  const state={session:null,section:'overview',draft:clone(defaults),savedDraft:clone(defaults),published:clone(defaults),dirty:false,draftSavedAt:null,publishedAt:null,previewOpen:false,history:[],authBusy:false,busy:false};
  const message=(text,type='')=>{
    const el=$('#notice');el.hidden=false;el.className=`notice ${type}`;el.textContent=text;
    clearTimeout(message.timer);message.timer=setTimeout(()=>el.hidden=true,6500);
  };
  const toast=(text)=>{const n=$('#toast');n.textContent=text;n.classList.add('visible');clearTimeout(toast.timer);toast.timer=setTimeout(()=>n.classList.remove('visible'),2600);};
  function copyToState(value){ if (!value || typeof value!=='object' || Array.isArray(value)) return clone(defaults);return Object.fromEntries(Object.entries(defaults).map(([k,v])=>[k, {...clone(v),...(value[k] && typeof value[k]==='object' ? clone(value[k]) : {})}])); }
  const headers=(token,contentType)=>{const h={apikey:apiKey,Accept:'application/json'};if(token)h.Authorization=`Bearer ${token}`;if(contentType)h['Content-Type']=contentType;return h;};
  async function request(path, {method='GET',body, token=null,raw=false,retry=true}={}){
    if(!connected)throw new Error('CMS not configured. Add the Supabase project URL and publishable key to cms-config.js.');
    const useSession=token===null && !!state.session;
    if(useSession)await ensureFreshToken();
    const jwt=token===false?null:token || (useSession?state.session?.access_token:null);
    const requestHeaders=headers(jwt,body===undefined?null:raw?null:'application/json');
    if(path.includes('on_conflict='))requestHeaders.Prefer='resolution=merge-duplicates,return=minimal';
    const res=await fetch(`${baseUrl}${path}`,{method,headers:requestHeaders,body:body===undefined?undefined:raw?body:JSON.stringify(body),cache:'no-store'});
    if(res.status===401 && useSession && retry && state.session?.refresh_token){await refreshSession();return request(path,{method,body,raw,retry:false});}
    if(!res.ok){let error={};try{error=await res.json();}catch{}throw new Error(error.msg || error.message || error.error_description || error.error || `Request failed (${res.status})`);}
    if(res.status===204)return null;
    const contentType=res.headers.get('content-type')||'';
    if(contentType.includes('json'))return res.json();
    return res.text();
  }
  function storeSession(session){state.session=session;sessionStorage.setItem(storageKey,JSON.stringify(session));}
  async function refreshSession(){
    const refreshToken=state.session?.refresh_token;if(!refreshToken)throw new Error('Your session has ended. Please log in again.');
    const next=await request('/auth/v1/token?grant_type=refresh_token',{method:'POST',body:{refresh_token:refreshToken},token:false});
    storeSession({...state.session,...next,expires_at:Math.floor(Date.now()/1000)+Number(next.expires_in||3600)});
  }
  async function ensureFreshToken(){if(state.session?.expires_at && state.session.expires_at<Math.floor(Date.now()/1000)+75)await refreshSession();}
  async function hasAdminPermission(userId){
    const admins=await request(`/rest/v1/cms_admins?user_id=eq.${encodeURIComponent(userId)}&select=user_id&limit=1`);
    return Array.isArray(admins) && admins.length>0;
  }
  async function signedIn(){
    const result=await request('/auth/v1/user');const user=result?.id?result:result?.user;
    if(!user?.id)throw Error('Could not verify your account');
    if(!await hasAdminPermission(user.id))throw Error('This account is not on the CMS administrator allowlist.');
    state.session.user=user;
    $('#userEmail').textContent=user.email || 'Admin';
    $('#loginScreen').hidden=true;$('#dashboard').hidden=false;
    await loadContent();
  }
  async function login(e){
    e.preventDefault();if(!connected)return;
    const button=$('#loginButton');button.disabled=true;$('#loginError').textContent='';
    try{
      const result=await request('/auth/v1/token?grant_type=password',{method:'POST',body:{email:$('#loginEmail').value.trim(),password:$('#loginPassword').value},token:false});
      storeSession({...result,expires_at:Math.floor(Date.now()/1000)+Number(result.expires_in||3600)});
      $('#loginPassword').value='';await signedIn();
    }catch(err){sessionStorage.removeItem(storageKey);state.session=null;$('#loginError').textContent=err.message;}
    finally{button.disabled=false;}
  }
  function logout(){state.session=null;sessionStorage.removeItem(storageKey);$('#dashboard').hidden=true;$('#loginScreen').hidden=false;$('#loginPassword').value='';$('#sidebar').classList.remove('open');toast('Signed out');}
  async function getRow(key){const rows=await request(`/rest/v1/cms_content?key=eq.${key}&select=payload,updated_at&limit=1`);return Array.isArray(rows)?rows[0]||null:null;}
  async function loadContent(){
    try{
      const [published,draft]=await Promise.all([getRow('published'),getRow('draft')]);
      state.published=copyToState(published?.payload);state.publishedAt=published?.updated_at || null;
      state.draft=copyToState(draft?.payload || published?.payload);
      state.savedDraft=clone(state.draft);state.draftSavedAt=draft?.updated_at||null;state.dirty=false;
      $('#connectionLabel').textContent='Live CMS';render();await loadHistory();
    }catch(err){message(`Could not load CMS data: ${err.message}`);throw err;}
  }
  async function upsertContent(key,payload,isPublished){
    const record={key,payload,is_published:isPublished,updated_by:state.session.user.id};
    const rows=await request('/rest/v1/cms_content?on_conflict=key',{method:'POST',body:record});
    return rows;
  }
  async function saveDraft({quiet=false}={}){
    if(state.busy)return false;
    try{
      validateContent(state.draft);state.busy=true;updateButtons();await upsertContent('draft',state.draft,false);
      state.savedDraft=clone(state.draft);state.dirty=false;state.draftSavedAt=new Date().toISOString();updateButtons();
      if(!quiet){toast('Draft saved privately');message('Draft saved. Your live website has not changed.','success');}
      return true;
    }catch(err){message(`Draft save failed: ${err.message}`);return false;}
    finally{state.busy=false;updateButtons();}
  }
  async function publish(){
    if(state.busy)return;
    if(state.dirty && !(await saveDraft({quiet:true})))return;
    if(!window.confirm('Publish your current draft to the live portfolio?'))return;
    state.busy=true;updateButtons();
    try{
      validateContent(state.draft);
      await upsertContent('published',state.draft,true);
      state.published=clone(state.draft);state.publishedAt=new Date().toISOString();
      // Version history is optional for the publish action; a failed history record must not undo a successful publish.
      try{await request('/rest/v1/cms_revisions',{method:'POST',body:{payload:state.published,published_by:state.session.user.id}});}catch(err){console.warn('Publication succeeded, but history write failed:',err);}
      renderOverview();await loadHistory();
      message('Published! Your live portfolio will fetch the new content on refresh.','success');toast('Website content published');
    }catch(err){message(`Publish failed: ${err.message}`);}
    finally{state.busy=false;updateButtons();}
  }
  function validateContent(data){
    for(const section of sections.filter(s=>s.groups))for(const group of section.groups){
      if(group.kind==='fields'){for(const field of group.fields){const value=data[section.id]?.[field.key];if(field.type==='url' && value && !safeUrl(value))throw Error(`${field.label} needs a valid http(s) URL.`);}}
      else for(const item of data[section.id]?.[group.key]||[])for(const field of group.fields){const value=item?.[field.key];if(field.type==='url' && value && !safeUrl(value))throw Error(`${field.label} needs a valid URL.`);}
    }
  }
  const safeUrl=value=>{try{const url=new URL(value);return ['http:','https:'].includes(url.protocol);}catch{return false;}};
  function updateButtons(){
    $('#publishButton').disabled=state.busy;
    $('#saveButton').disabled=state.busy || !state.dirty;
    $('#discardButton').disabled=state.busy || !state.dirty;
    $('#publishStatus').textContent=state.dirty?'Unsaved changes':state.draftSavedAt?'Draft ready':'No pending edits';
  }
  function markDirty(){state.dirty=true;updateButtons();renderStats();sendPreview();}
  function render(){renderNavigation();renderOverview();if(state.section!=='overview')renderEditor();updateButtons();}
  function renderNavigation(){
    const nav=$('#sideNav');nav.replaceChildren();
    sections.forEach(section=>{
      const button=document.createElement('button');button.className=`nav-item${state.section===section.id?' active':''}`;button.type='button';button.dataset.section=section.id;
      const ico=document.createElement('span');ico.className='nav-icon';ico.textContent=section.icon;
      const label=document.createElement('span');label.textContent=section.title;button.append(ico,label);
      if(['projects','skills','services','journey'].includes(section.id)){
        const count=document.createElement('small');count.className='nav-count';count.textContent=state.draft[section.id]?.items?.length||0;button.append(count);
      }
      nav.append(button);
    });
  }
  function switchSection(id){
    const section=sections.find(s=>s.id===id);if(!section)return;
    state.section=id;$('#breadcrumbTitle').textContent=section.title;
    $('#overviewView').hidden=id!=='overview';$('#editorView').hidden=id==='overview';
    renderNavigation();if(id==='overview')renderOverview();else renderEditor();
    $('#sidebar').classList.remove('open');window.scrollTo({top:0,behavior:'instant'});
  }
  function renderStats(){
    for(const [id,section] of [['statProjects','projects'],['statServices','services'],['statSkills','skills'],['statJourney','journey']]){
      $('#'+id).textContent=section==='projects'?(state.draft.projects?.items||[]).filter(x=>x.visible!==false).length:state.draft[section]?.items?.length||0;
    }
  }
  function renderOverview(){
    renderStats();updateButtons();
    $('#lastPublished').textContent=state.publishedAt?new Date(state.publishedAt).toLocaleString():'No published content yet';
    const quick=$('#quickGrid');quick.replaceChildren();
    ['site','hero','projects','services','skills','journey'].forEach(id=>{
      const section=sections.find(x=>x.id===id),b=document.createElement('button');b.className='quick-card';b.type='button';b.dataset.section=id;
      const ico=document.createElement('span');ico.className='quick-icon';ico.textContent=section.icon;
      const copy=document.createElement('span');const label=document.createElement('strong');label.textContent=section.title;const hint=document.createElement('small');hint.textContent='Edit section';copy.append(label,hint);
      const arrow=document.createElement('span');arrow.className='arrow';arrow.textContent='↗';b.append(ico,copy,arrow);quick.append(b);
    });
  }
  function e(tag,cls='',content=null){const node=document.createElement(tag);if(cls)node.className=cls;if(content!==null)node.textContent=String(content);return node;}
  function renderEditor(){
    const section=sections.find(s=>s.id===state.section);if(!section?.groups)return;
    $('#editorEyebrow').textContent='CONTENT / '+section.title.toUpperCase();$('#editorTitle').textContent=section.title;$('#editorDescription').textContent=section.description;
    $('#guideTitle').textContent=section.title;$('#guideDescription').textContent=section.description;
    const form=$('#editorForm');form.replaceChildren();
    section.groups.forEach(group=>{
      const block=e('section','editor-block');const head=e('div','editor-block-heading');const wrap=e('div');wrap.append(e('h2','',group.label));if(group.description)wrap.append(e('p','',group.description));head.append(wrap);block.append(head);
      if(group.kind==='fields'){
        const columns=e('div', 'form-columns');group.fields.forEach(f=>columns.append(renderField(state.section,f,state.draft[state.section]?.[f.key])));block.append(columns);
      }else{
        const toolbar=e('div','collection-toolbar');const add=e('button','',`+ Add ${group.label.toLowerCase().replace(/ cards| milestones| highlights| steps| skills| questions and answers/i,'').replace(/s$/,'')}`);
        add.type='button';add.dataset.action='add';add.dataset.collection=group.key;toolbar.append(add);block.append(toolbar);
        const list=state.draft[state.section]?.[group.key]||[];
        if(!list.length)block.append(e('p','collection-empty','No items yet. Add your first one to get started.'));
        list.forEach((item,index)=>{
          const details=e('details','collection-item');if(index===0)details.open=true;
          const title=e('summary');const name=item.title||item.name||item.question||item.quote||item.label||item.id||item.year||`Item ${index+1}`;
          const titleName=e('strong','',`${String(index+1).padStart(2,'0')}   ${String(name).slice(0,65)}`);const hint=e('small','','Edit details ▾');title.append(titleName,hint);details.append(title);
          const content=e('div','collection-item-fields');
          const grid=e('div','form-columns');group.fields.forEach(f=>grid.append(renderField(state.section,f,item?.[f.key],group.key,index)));content.append(grid);
          const buttons=e('div','item-buttons');[['up','↑ Move up'],['down','↓ Move down'],['delete','× Remove']].forEach(([act,label])=>{const b=e('button',act==='delete'?'danger':'',label);b.type='button';b.dataset.action=act;b.dataset.collection=group.key;b.dataset.index=index;if(act==='up' && index===0 || act==='down' && index===list.length-1)b.disabled=true;buttons.append(b);});content.append(buttons);details.append(content);block.append(details);
        });
      }
      form.append(block);
    });
    const actions=e('div','form-actions-bottom');const save=e('button','top-btn top-btn-primary','✓ Save draft');save.type='button';save.dataset.action='save';actions.append(save);form.append(actions);
  }
  function renderField(section,f,value,collectionKey=null,index=null){
    const wrapper=e((f.type==='image'||f.type==='file')?'div':'label','field');if(f.type==='checkbox')wrapper.classList.add('field-checkbox');
    const title=e('span','field-title',f.label);
    let input;
    if(f.type==='checkbox'){
      input=e('input');input.type='checkbox';input.checked=value!==false;wrapper.append(input,title);
    }else{
      wrapper.append(title);
      if(f.type==='textarea'||f.type==='lines'){
        input=e('textarea');input.rows=f.type==='textarea'?4:3;input.value=f.type==='lines'?(Array.isArray(value)?value.join('\n'):''):String(value??'');
        if(f.type==='lines')input.placeholder='One entry per line';
      }else{
        input=e('input');input.type=f.type==='number'?'number':'text';input.value=value??'';
        if(f.type==='number'){input.min='0';input.max='100';input.step='1';}
        if(f.type==='url'||f.type==='image'||f.type==='file')input.placeholder='https://...';
      }
      wrapper.append(input);
    }
    input.setAttribute('aria-label',f.label);
    input.dataset.field=f.key;input.dataset.fieldType=f.type;input.dataset.section=section;
    if(collectionKey!==null){input.dataset.collection=collectionKey;input.dataset.index=index;}
    if(f.hint)wrapper.append(e('div','field-hint',f.hint));
    if(f.type==='image'||f.type==='file'){
      const row=e('div','upload-row');const label=e('label','upload-button',f.type==='file'?'↑ Upload PDF':'↑ Upload image');
      const fileInput=e('input');fileInput.type='file';fileInput.accept=f.type==='file'?'application/pdf':'image/png,image/jpeg,image/webp,image/gif';fileInput.dataset.upload='1';fileInput.dataset.field=f.key;fileInput.dataset.section=section;
      if(collectionKey!==null){fileInput.dataset.collection=collectionKey;fileInput.dataset.index=index;}
      label.append(fileInput);row.append(label);
      if(f.type==='image' && value && /^https?:\/\//.test(String(value))){const preview=e('img','upload-preview');preview.alt='Selected image';preview.src=value;row.append(preview);}
      wrapper.append(row);
    }
    return wrapper;
  }
  function valueFromInput(node){const t=node.dataset.fieldType;return t==='checkbox'?node.checked:t==='lines'?node.value.split('\n').map(v=>v.trim()).filter(Boolean):t==='number'?Math.min(100,Math.max(0,Number(node.value)||0)):node.value;}
  function setField(section,fieldName,value,collectionKey,index){
    if(collectionKey!==undefined){const item=state.draft[section][collectionKey]?.[Number(index)];if(item)item[fieldName]=value;}
    else state.draft[section][fieldName]=value;
    markDirty();
  }
  function emptyItem(fields){return Object.fromEntries(fields.map(f=>[f.key,f.type==='checkbox'?true:f.type==='number'?80:f.type==='lines'?[]:'']));}
  function handleCollection(action,collectionKey,index){
    const section=sections.find(s=>s.id===state.section);const group=section?.groups.find(g=>g.key===collectionKey);if(!group)return;
    const arr=state.draft[state.section][collectionKey];if(!Array.isArray(arr))return;
    if(action==='add')arr.push(emptyItem(group.fields));
    if(action==='delete'){if(!confirm('Remove this item from your draft?'))return;arr.splice(index,1);}
    if(action==='up' && index>0)[arr[index-1],arr[index]]=[arr[index],arr[index-1]];
    if(action==='down' && index<arr.length-1)[arr[index+1],arr[index]]=[arr[index],arr[index+1]];
    markDirty();renderEditor();renderNavigation();
  }
  async function upload(file,node){
    if(!state.session)throw Error('Sign in before uploading.');
    const mime=file.type;const permitted=['image/png','image/jpeg','image/webp','image/gif','application/pdf'];
    if(!permitted.includes(mime))throw Error('Upload PNG, JPG, WebP, GIF or PDF files only.');
    if(file.size>5*1024*1024)throw Error('Maximum file size is 5 MB.');
    if(node.dataset.field==='cvUrl' && mime!=='application/pdf')throw Error('Please upload a PDF for your CV.');
    if(node.dataset.field!=='cvUrl' && mime==='application/pdf')throw Error('Please upload an image for this field.');
    await ensureFreshToken();
    const ext=({ 'image/png':'png','image/jpeg':'jpg','image/webp':'webp','image/gif':'gif','application/pdf':'pdf' })[mime];
    const filename=`${state.session.user.id}/${Date.now()}-${crypto.randomUUID()}.${ext}`;
    const result=await fetch(`${baseUrl}/storage/v1/object/portfolio-media/${filename}`,{method:'POST',headers:{apikey:apiKey,Authorization:`Bearer ${state.session.access_token}`,'Content-Type':mime,'Cache-Control':'3600'},body:file});
    if(!result.ok){let error={};try{error=await result.json();}catch{}throw Error(error.message || error.error || `Upload failed: ${result.status}`);}
    const url=`${baseUrl}/storage/v1/object/public/portfolio-media/${filename}`;
    setField(node.dataset.section,node.dataset.field,url,node.dataset.collection,node.dataset.index);
    renderEditor();toast('Media uploaded. Save your draft to keep the link.');
  }
  async function loadHistory(){
    try{
      const rows=await request('/rest/v1/cms_revisions?select=id,payload,published_at&order=published_at.desc&limit=10');
      state.history=Array.isArray(rows)?rows:[];
    }catch(err){console.warn('History not available',err);state.history=[];}
    const list=$('#historyList');list.replaceChildren();
    if(!state.history.length){list.append(e('p','empty-text','No publications yet. Publish your first update to create a restore point.'));return;}
    state.history.forEach((rev,i)=>{
      const row=e('div','history-row');const detail=e('div');detail.append(e('strong','',i===0?'Most recent publication':'Previous publication'));detail.append(e('small','',new Date(rev.published_at).toLocaleString()));
      const button=e('button','','Restore to draft');button.type='button';button.dataset.restore=rev.id;row.append(detail,button);list.append(row);
    });
  }
  function restoreRevision(id){const rev=state.history.find(r=>r.id===id);if(!rev?.payload)return;
    if(!confirm('Load this version into your local draft? It will not be published until you save and publish it.'))return;
    state.draft=copyToState(rev.payload);state.dirty=true;render();toast('Previous version loaded into draft');}
  function sendPreview(){if(!state.previewOpen)return;try{$('#previewFrame').contentWindow.postMessage({type:'portfolio-cms-preview',content:state.draft},location.origin);}catch(err){console.warn('Preview could not update',err);}}
  function preview(open){state.previewOpen=open;$('#previewOverlay').hidden=!open;if(open){const iframe=$('#previewFrame');iframe.src=`/?cms_preview=${Date.now()}`;iframe.addEventListener('load',()=>{sendPreview();setTimeout(sendPreview,350);},{once:true});} }
  function downloadBackup(){
    const blob=new Blob([JSON.stringify(state.draft,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const link=e('a');link.href=url;link.download=`klegar-portfolio-draft-${new Date().toISOString().slice(0,10)}.json`;link.click();setTimeout(()=>URL.revokeObjectURL(url),500);toast('Draft backup downloaded');
  }
  function importBackup(file){
    if(!file || file.size>2*1024*1024){message('Backup must be a JSON file under 2 MB.');return;}
    file.text().then(text=>{const data=JSON.parse(text);if(!data.site || !data.hero || !data.projects)throw Error('Not a Portfolio Studio backup');if(!confirm('Replace your local draft with this backup?'))return;state.draft=copyToState(data);state.dirty=true;render();toast('Backup imported into local draft');}).catch(err=>message(`Import failed: ${err.message}`));
  }
  function addBackupControls(){
    const panel=$('#overviewView .recent-panel');const row=e('div','collection-toolbar');
    const exportButton=e('button','','↓ Export draft JSON');exportButton.type='button';exportButton.onclick=downloadBackup;
    const label=e('label','upload-button','↑ Import backup JSON');const file=e('input');file.type='file';file.accept='application/json,.json';file.onchange=()=>importBackup(file.files[0]);label.append(file);
    row.append(exportButton,label);panel.append(row);
  }
  function bindEvents(){
    $('#loginForm').addEventListener('submit',login);
    $('#logoutButton').addEventListener('click',logout);
    $('#sideNav').addEventListener('click',ev=>{const button=ev.target.closest('[data-section]');if(button)switchSection(button.dataset.section);});
    $('#quickGrid').addEventListener('click',ev=>{const button=ev.target.closest('[data-section]');if(button)switchSection(button.dataset.section);});
    $('#mobileMenu').addEventListener('click',()=>$('#sidebar').classList.toggle('open'));
    $('#editorForm').addEventListener('input',ev=>{const t=ev.target;if(!t.dataset.field||t.dataset.upload)return;if(t.dataset.fieldType==='checkbox')return;setField(t.dataset.section,t.dataset.field,valueFromInput(t),t.dataset.collection,t.dataset.index);});
    $('#editorForm').addEventListener('change',async ev=>{
      const node=ev.target;
      if(node.dataset.upload){const file=node.files?.[0];if(!file)return;try{await upload(file,node);}catch(err){message(err.message);}return;}
      if(node.dataset.fieldType==='checkbox')setField(node.dataset.section,node.dataset.field,node.checked,node.dataset.collection,node.dataset.index);
    });
    $('#editorForm').addEventListener('click',ev=>{
      const b=ev.target.closest('button[data-action]');if(!b)return;
      if(b.dataset.action==='save'){saveDraft();return;}
      handleCollection(b.dataset.action,b.dataset.collection,Number(b.dataset.index));
    });
    $('#editorForm').addEventListener('submit',ev=>ev.preventDefault());
    $('#saveButton').addEventListener('click',()=>saveDraft());$('#publishButton').addEventListener('click',publish);
    $('#discardButton').addEventListener('click',()=>{if(confirm('Discard your unsaved local edits? Saved drafts will be kept.')){state.draft=clone(state.savedDraft);state.dirty=false;render();toast('Unsaved edits discarded');}});
    $('#previewButton').addEventListener('click',()=>preview(true));$('#sectionPreview').addEventListener('click',()=>preview(true));
    $('#previewClose').addEventListener('click',()=>preview(false));
    $('#previewOverlay').addEventListener('click',ev=>{if(ev.target.id==='previewOverlay')preview(false);});
    $('#previewDesktop').addEventListener('click',()=>{$('.iframe-wrap').classList.remove('mobile');$('#previewDesktop').classList.add('active');$('#previewMobile').classList.remove('active');});
    $('#previewMobile').addEventListener('click',()=>{$('.iframe-wrap').classList.add('mobile');$('#previewMobile').classList.add('active');$('#previewDesktop').classList.remove('active');});
    $('#refreshHistory').addEventListener('click',()=>loadHistory());
    $('#historyList').addEventListener('click',ev=>{const button=ev.target.closest('[data-restore]');if(button)restoreRevision(button.dataset.restore);});
    document.addEventListener('keydown',ev=>{if(ev.key==='Escape' && state.previewOpen)preview(false);});
    window.addEventListener('beforeunload',ev=>{if(state.dirty){ev.preventDefault();ev.returnValue='';}});
  }
  async function init(){
    bindEvents();addBackupControls();updateButtons();renderNavigation();renderOverview();
    if(!connected){
      const msg=$('#setupMessage');msg.hidden=false;msg.textContent='Setup needed: configure cms-config.js with your Supabase project URL and publishable (anon) key, and run the included SQL setup. See ADMIN-SETUP.md.';
      $('#loginButton').disabled=true;return;
    }
    try{
      const existing=JSON.parse(sessionStorage.getItem(storageKey)||'null');if(existing?.access_token && existing?.refresh_token){state.session=existing;await signedIn();}
    }catch(err){sessionStorage.removeItem(storageKey);state.session=null;$('#loginError').textContent='Please sign in again. '+err.message;}
  }
  init();
})();
