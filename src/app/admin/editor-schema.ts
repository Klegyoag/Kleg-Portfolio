import { SectionKey } from '../models/content';
export type FieldType = 'text' | 'textarea' | 'number' | 'lines' | 'checkbox' | 'url' | 'image' | 'file';
export interface FieldDef { key: string; label: string; type: FieldType; }
export interface GroupDef { title: string; kind: 'fields' | 'collection'; fields: FieldDef[]; property?: string; description?: string; }
export interface SectionDef { id: SectionKey; label: string; icon: string; description: string; groups: GroupDef[]; }
const f = (key: string, label: string, type: FieldType = 'text'): FieldDef => ({ key, label, type });
const fields = (title: string, list: FieldDef[]): GroupDef => ({ title, kind: 'fields', fields: list });
const collection = (property: string, title: string, list: FieldDef[]): GroupDef => ({ title, property, kind: 'collection', fields: list });

export const EDITOR_SECTIONS: SectionDef[] = [
  { id:'site', label:'Profile & links', icon:'◉', description:'Personal identity, profile photo, CV, contact and socials.', groups:[
    fields('Identity',[f('ownerName','Full name'),f('shortName','Display name'),f('role','Professional headline'),f('companyRole','Company and title'),f('location','Location')]),
    fields('Profile media',[f('portraitUrl','General profile portrait','image'),f('heroCutoutUrl','Homepage transparent portrait (PNG recommended)','image'),f('cvUrl','Downloadable CV','file')]),
    fields('Social and contact',[f('whatsappNumber','WhatsApp number (digits only)'),f('whatsappDisplay','Phone display text'),f('githubUrl','GitHub URL','url'),f('linkedinUrl','LinkedIn URL','url'),f('instagramUrl','Instagram URL','url')])
  ] },
  { id:'hero', label:'Homepage hero', icon:'✧', description:'Main headline, introduction, buttons and technology ticker.', groups:[
    fields('New homepage',[f('introShort','Short introduction','textarea'),f('primaryCtaText','Main button text')]),
    fields('Hero text',[f('badge','Status badge'),f('eyebrow','Greeting'),f('description','Introduction paragraph','textarea'),f('focus','Key focus'),f('buttonText','Primary button label')]),
    fields('Headline',[f('line1','Line 1 text'),f('accent1','Line 1 highlighted'),f('line2','Line 2 text'),f('accent2','Line 2 highlighted'),f('line3','Line 3 text'),f('accent3','Line 3 highlighted')]),
    fields('Moving ticker',[f('ticker','Technologies — one per line','lines')])
  ] },
  { id:'about', label:'About & story', icon:'▤', description:'Bio, processes, toolkit and milestones.', groups:[
    fields('Design headline',[f('displayHeading1','First line'),f('displayHeading2','Accent text')]),
    fields('About section',[f('heading1','Heading'),f('heading2','Highlighted heading'),f('description','Introduction','textarea'),f('storyTitle','Story headline'),f('storyBody','Story content','textarea'),f('processTitle','Process headline'),f('toolsTitle','Tools headline'),f('factsTitle','Facts headline')]),
    collection('milestones','Milestones',[f('title','Title'),f('description','Description','textarea')]),
    collection('steps','Process steps',[f('title','Step title'),f('description','Description','textarea')]),
    fields('Tools',[f('tools','Technology names — one per line','lines')]),
    collection('facts','Quick facts',[f('label','Label'),f('value','Value')])
  ] },
  { id:'projects', label:'Projects', icon:'◇', description:'Publish project cards and case studies with image, links and stack.', groups:[
    fields('Design headline',[f('displayHeading1','First line'),f('displayHeading2','Accent text')]),
    fields('Projects introduction',[f('heading1','Heading'),f('heading2','Highlighted heading'),f('description','Description','textarea')]),
    collection('items','Project cards',[f('title','Project title'),f('category','Category'),f('description','Description','textarea'),f('stack','Technologies — one per line','lines'),f('imageUrl','Cover image','image'),f('liveUrl','Live URL','url'),f('githubUrl','GitHub URL','url'),f('featured','Featured','checkbox'),f('visible','Visible','checkbox')])
  ] },
  { id:'services', label:'Services', icon:'▦', description:'Service cards, descriptions and actions.', groups:[
    fields('Design headline',[f('displayHeading1','First line'),f('displayHeading2','Accent text')]),
    fields('Section headline',[f('heading1','Heading'),f('heading2','Highlighted heading'),f('description','Introduction','textarea')]),
    collection('items','Service cards',[f('title','Service name'),f('description','Description','textarea'),f('cta','Call to action'),f('icon','Short icon text')])
  ] },
  { id:'skills', label:'Skills', icon:'✳', description:'Skill explorer content and proficiency indicators.', groups:[
    fields('Design headline',[f('displayHeading1','First line'),f('displayHeading2','Accent text')]),
    fields('Section heading',[f('heading1','Heading'),f('heading2','Highlighted heading'),f('stack','Technology tags — one per line','lines')]),
    collection('items','Skills',[f('icon','Icon text'),f('short','Short label'),f('category','Category'),f('name','Skill name'),f('description','Description','textarea'),f('meter','Skill meter 0–100','number'),f('level','Proficiency text')])
  ] },
  { id:'journey', label:'Journey', icon:'◷', description:'Experience and learning timeline.', groups:[
    fields('Design headline',[f('displayHeading1','First line'),f('displayHeading2','Accent text')]),
    fields('Timeline introduction',[f('heading1','Heading'),f('heading2','Highlighted heading'),f('description','Introduction','textarea')]),
    collection('items','Timeline entries',[f('year','Year'),f('category','Category'),f('title','Title'),f('description','Description','textarea'),f('tags','Tags — one per line','lines')])
  ] },
  { id:'contact', label:'Contact & form', icon:'✉', description:'Contact section and project enquiry options.', groups:[
    fields('Design headline',[f('displayHeading1','First line'),f('displayHeading2','Accent text')]),
    fields('Contact introduction',[f('heading1','Heading'),f('heading2','Highlighted heading'),f('description','Description','textarea')]),
    fields('Form choices',[f('serviceOptions','Services — one per line','lines'),f('budgetOptions','Budget ranges — one per line','lines'),f('timelineOptions','Timelines — one per line','lines'),f('stageOptions','Stages — one per line','lines')])
  ] },
  { id:'extras', label:'Design & principles', icon:'◫', description:'UI lab descriptions, working principles and footer.', groups:[
    fields('Design lab',[f('labHeading1','Heading'),f('labHeading2','Highlighted heading'),f('labDescription','Description','textarea')]),
    fields('Principles and footer',[f('principlesHeading1','Heading'),f('principlesHeading2','Highlighted heading'),f('principlesDescription','Description','textarea'),f('footerDescription','Footer text','textarea')]),
    collection('principles','Principle cards',[f('quote','Principle','textarea'),f('description','Description','textarea'),f('label','Category')])
  ] },
  { id:'assistant', label:'Assistant', icon:'✦', description:'FAQs and original portfolio assistant knowledge.', groups:[
    fields('Messages',[f('intro','Greeting','textarea'),f('fallback','No-match response','textarea')]),
    collection('faqs','Custom Q&A',[f('question','Question'),f('answer','Answer','textarea')]),
    collection('knowledge','Original answer library',[f('id','Intent key'),f('examples','Example questions — one per line','lines'),f('keywords','Keywords — one per line','lines'),f('answer','Answer','textarea')])
  ] },
  { id:'seo', label:'SEO & sharing', icon:'⌕', description:'Browser title, description and share card.', groups:[
    fields('Search appearance',[f('title','Page title'),f('description','Meta description','textarea'),f('keywords','Keywords','textarea'),f('ogImage','Social image','image')])
  ] }
];
