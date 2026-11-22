import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, Inject, Input, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { CmsStoreService } from '../core/cms-store.service';
import { PortfolioContent, assetUrl, safeUrl, slugify } from '../models/content';

interface ChatMessage { role: 'bot' | 'user'; text: string; }

@Component({
  selector: 'app-portfolio',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './portfolio.component.html'
})
export class PortfolioComponent implements OnInit {
  @Input() previewContent: PortfolioContent | null = null;
  private readonly store = inject(CmsStoreService);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  readonly resourceUrl = assetUrl;
  readonly linkUrl = safeUrl;
  readonly slug = slugify;
  mobileMenuOpen = false;
  themeMenuOpen = false;
  theme: 'neon' | 'light' | 'gold' = 'neon';
  activeTab: 'story' | 'process' | 'tools' | 'facts' = 'story';
  selectedSkill = 0;
  principleIndex = 0;
  assistantOpen = false;
  ask = '';
  messages: ChatMessage[] = [];
  commandOpen = false;
  commandSearch = '';
  compare = 52;
  labHue = 355;
  labRadius = 22;
  labBlur = 20;
  enquiryStatus = '';
  contactForm = { name: '', phone: '', service: '', budget: '', timeline: '', stage: '', message: '', consent: false };
  currentYear = new Date().getFullYear();

  constructor(@Inject(DOCUMENT) private document: Document) {}
  get data(): PortfolioContent { return this.previewContent || this.store.content(); }
  get visibleProjects(): any[] {
    return (this.data.projects.items || []).filter((item: any) => item && item.visible !== false);
  }
  get activeSkill(): any { return this.data.skills.items?.[this.selectedSkill] || this.data.skills.items?.[0]; }
  get activePrinciple(): any { return this.data.extras.principles?.[this.principleIndex]; }
  get hasAssistantMessages(): boolean { return this.messages.length > 0; }
  get socialLinks(): { label: string; url: string }[] {
    return [
      { label: 'GitHub', url: safeUrl(this.data.site.githubUrl) },
      { label: 'LinkedIn', url: safeUrl(this.data.site.linkedinUrl) },
      { label: 'Instagram', url: safeUrl(this.data.site.instagramUrl) }
    ].filter(item => !!item.url);
  }
  get whatsapp(): string {
    return 'https://wa.me/' + String(this.data.site.whatsappNumber || '').replace(/\D/g, '');
  }
  get filteredCommands(): { label: string; href: string }[] {
    return [
      { label: 'Homepage', href: '#home' },
      { label: 'About me', href: '#about' },
      { label: 'Selected projects', href: '#projects' },
      { label: 'Services', href: '#services' },
      { label: 'Skills and toolkit', href: '#skills' },
      { label: 'Journey', href: '#journey' },
      { label: 'Contact', href: '#contact' }
    ].filter(item => item.label.toLowerCase().includes(this.commandSearch.toLowerCase()));
  }

  async ngOnInit(): Promise<void> {
    if (!this.previewContent) await this.store.loadPublished();
    if (!this.previewContent) this.applySeo();
    this.setTheme(this.theme);
    this.messages = [{ role: 'bot', text: this.data.assistant.intro || 'Welcome! Ask about my projects and skills.' }];
  }
  private applySeo(): void {
    const meta = this.data.seo;
    this.title.setTitle(meta.title || 'Chris Klegar Yoag — Portfolio');
    this.meta.updateTag({ name: 'description', content: meta.description || '' });
    this.meta.updateTag({ name: 'keywords', content: meta.keywords || '' });
    const image = assetUrl(meta.ogImage);
    if (image) this.meta.updateTag({ property: 'og:image', content: image });
  }
  setTheme(theme: 'neon' | 'light' | 'gold'): void {
    this.theme = theme;
    if (!this.previewContent) this.document.documentElement.setAttribute('data-theme', theme);
    this.themeMenuOpen = false;
  }
  closeMenu(): void { this.mobileMenuOpen = false; }
  stepPrinciple(delta: number): void {
    const count = this.data.extras.principles?.length || 0;
    if (count) this.principleIndex = (this.principleIndex + count + delta) % count;
  }
  resetLab(): void { this.labHue = 355; this.labRadius = 22; this.labBlur = 20; }
  sendQuestion(): void {
    const input = this.ask.trim();
    if (!input) return;
    this.messages.push({ role: 'user', text: input });
    const query = input.toLowerCase().replace(/[^a-z0-9\s]/gi, ' ').replace(/\s+/g, ' ').trim();
    const faqs: any[] = this.data.assistant.faqs || [];
    const knowledge: any[] = this.data.assistant.knowledge || [];
    const answerFaq = faqs.find(row => String(row.question || '').toLowerCase() === query)
      || faqs.find(row => query.includes(String(row.question || '').toLowerCase()) && String(row.question || '').length > 5);
    let response = answerFaq?.answer;
    if (!response) {
      const ranked = knowledge.map(item => {
        const examples: string[] = item.examples || [];
        const keywords: string[] = item.keywords || [];
        const score = examples.some(ex => String(ex).toLowerCase() === query) ? 25 :
          keywords.reduce((sum: number, term: string) => sum + (query.includes(String(term).toLowerCase()) ? 3 : 0), 0);
        return { item, score };
      }).sort((a, b) => b.score - a.score);
      if (ranked[0]?.score > 0) response = ranked[0].item.answer;
    }
    this.messages.push({ role: 'bot', text: response || this.data.assistant.fallback || 'Please use the contact form to ask Chris.' });
    this.ask = '';
  }
  sendSuggested(question: string): void { this.ask = question; this.sendQuestion(); }
  openCommand(href: string): void {
    this.commandOpen = false;
    if (typeof window !== 'undefined') {
      this.document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
    }
  }
  submitEnquiry(): void {
    const f = this.contactForm;
    if (!f.consent || f.name.trim().length < 2 || !/^\+?[\d\s()-]{8,20}$/.test(f.phone.trim()) || f.message.trim().length < 20) {
      this.enquiryStatus = 'Please complete your name, valid phone, project details (20+ characters), and consent.';
      return;
    }
    const lines = [
      'Hello Chris, I would like to discuss a project.', '',
      `Name: ${f.name}`, `Phone: ${f.phone}`, `Service: ${f.service || 'Discuss first'}`,
      `Budget: ${f.budget || 'Discuss first'}`, `Timeline: ${f.timeline || 'Flexible'}`,
      `Stage: ${f.stage || 'New idea'}`, '', `Project details:\n${f.message}`
    ];
    const url = `${this.whatsapp}?text=${encodeURIComponent(lines.join('\n'))}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    this.enquiryStatus = 'WhatsApp opened. Review your prepared message and tap Send.';
  }
}
