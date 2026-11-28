import { CommonModule, DOCUMENT } from '@angular/common';
import { AfterViewInit, Component, DestroyRef, Inject, Input, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { CmsStoreService } from '../core/cms-store.service';
import { PortfolioContent, assetUrl, resolveCvUrl, safeUrl, slugify } from '../models/content';

interface ChatMessage { role: 'bot' | 'user'; text: string; }

@Component({
  selector: 'app-portfolio',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './portfolio.component.html'
})
export class PortfolioComponent implements OnInit, AfterViewInit {
  @Input() previewContent: PortfolioContent | null = null;
  private readonly store = inject(CmsStoreService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private hasHandledInitialSection = false;
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
  assistantOpen = false;
  ask = '';
  messages: ChatMessage[] = [];
  enquiryStatus = '';
  contactForm = { name: '', phone: '', service: '', budget: '', timeline: '', stage: '', message: '', consent: false };
  currentYear = new Date().getFullYear();

  constructor(@Inject(DOCUMENT) private document: Document) {}
  get data(): PortfolioContent { return this.previewContent || this.store.content(); }
  get cvDownloadUrl(): string { return resolveCvUrl(this.data.site); }
  get activeSection(): string { return this.route.snapshot.paramMap.get('section') || 'home'; }
  get heroSurname(): string {
    const fullName = String(this.data.site.ownerName || '').trim();
    const surname = fullName.split(/\s+/).pop() || '';
    const shortName = String(this.data.site.shortName || '');
    return surname && !shortName.toLowerCase().endsWith(surname.toLowerCase()) ? surname : '';
  }

  /**
   * The home hero has its own dedicated transparent image field.
   * Do not read site.portraitUrl here: existing published CMS rows may still
   * contain the older studio-background photograph.
   */
  get heroPortraitUrl(): string {
    return assetUrl(this.data.site.heroCutoutUrl)
      || '/assets/klegar-hero-transparent-v4.png';
  }

  /** Recover from a broken custom image without restoring the old portrait. */
  onHeroPortraitError(event: Event): void {
    const image = event.target as HTMLImageElement | null;
    const fallback = '/assets/klegar-hero-transparent-v4.png';
    if (image && !image.src.endsWith(fallback)) image.src = fallback;
  }
  get heroFirstName(): string {
    return String(this.data.site.shortName || this.data.site.ownerName || 'Chris').trim().split(/\s+/)[0] || 'Chris';
  }
  get heroSecondName(): string {
    const parts = String(this.data.site.shortName || this.data.site.ownerName || 'Chris Klegar').trim().split(/\s+/);
    return parts.slice(1).join(' ') || 'Klegar';
  }

  get visibleProjects(): any[] {
    return (this.data.projects.items || []).filter((item: any) => item && item.visible !== false);
  }
  get activeSkill(): any { return this.data.skills.items?.[this.selectedSkill] || this.data.skills.items?.[0]; }
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

  async ngOnInit(): Promise<void> {
    if (!this.previewContent) await this.store.loadPublished();
    if (!this.previewContent) {
      this.applySeo();
      // Content may load asynchronously, shifting section positions.
      this.scrollToSection(this.activeSection, false);
    }
    this.setTheme(this.theme);
    this.messages = [{ role: 'bot', text: this.data.assistant.intro || 'Welcome! Ask about my projects and skills.' }];
  }
  ngAfterViewInit(): void {
    // In the admin preview this component is embedded; never redirect it.
    if (this.previewContent) return;
    this.observeReveals();
    this.attachHeroDissolve();

    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => {
        const section = params.get('section') || 'home';
        this.scrollToSection(section, this.hasHandledInitialSection);
        this.hasHandledInitialSection = true;
      });
  }

  /** Native scroll-linked dissolve; uses rAF and skips movement when reduced motion is requested. */
  private attachHeroDissolve(): void {
    const view = this.document.defaultView;
    const hero = this.document.getElementById('home');
    if (!view || !hero || view.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let pending = 0;
    const update = () => {
      pending = 0;
      const rect = hero.getBoundingClientRect();
      const distance = Math.max(1, Math.min(hero.offsetHeight, view.innerHeight) * 0.72);
      const progress = Math.max(0, Math.min(1, -rect.top / distance));
      hero.style.setProperty('--hx-exit', progress.toFixed(3));
    };
    const schedule = () => {
      if (!pending) pending = view.requestAnimationFrame(update);
    };
    view.addEventListener('scroll', schedule, { passive: true });
    view.addEventListener('resize', schedule, { passive: true });
    update();
    this.destroyRef.onDestroy(() => {
      view.removeEventListener('scroll', schedule);
      view.removeEventListener('resize', schedule);
      if (pending) view.cancelAnimationFrame(pending);
    });
  }

  /** Progressive enhancement: elements remain visible if JS or observers fail. */
  private observeReveals(): void {
    const view = this.document.defaultView;
    if (!view || !('IntersectionObserver' in view)) return;
    if (view.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const root = this.document.querySelector('.nv-root');
    if (!root) return;
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('nv-inview');
          observer.unobserve(entry.target);
        }
      }
    }, { threshold: 0.08, rootMargin: '0px 0px 40px 0px' });
    root.querySelectorAll('.nv-reveal').forEach(item => observer.observe(item));
    // CMS content may arrive after this view is first rendered. Observe newly
    // inserted cards as well, so published projects never stay invisible.
    const mutations = new MutationObserver(records => {
      for (const record of records) {
        record.addedNodes.forEach(node => {
          if (!(node instanceof Element)) return;
          if (node.matches('.nv-reveal')) observer.observe(node);
          node.querySelectorAll('.nv-reveal').forEach(element => observer.observe(element));
        });
      }
    });
    mutations.observe(root, { childList: true, subtree: true });
    // Defer hiding elements until observers are listening.
    root.classList.add('nv-motion');
    this.destroyRef.onDestroy(() => {
      observer.disconnect();
      mutations.disconnect();
    });
  }

  /** Keep real /section URLs while smoothly moving within this portfolio. */
  navigateSection(event: MouseEvent, section: string): void {
    // Preserve the browser's open-in-new-tab and modified-click behavior.
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
    event.preventDefault();
    this.closeMenu();

    if (this.previewContent || this.activeSection === section) {
      this.scrollToSection(section, true);
      return;
    }

    void this.router.navigateByUrl('/' + section);
  }

  private scrollToSection(section: string, smooth: boolean): void {
    const view = this.document.defaultView;
    if (!view) return;

    view.requestAnimationFrame(() => {
      if (section === 'home') {
        view.scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'auto' });
        return;
      }
      this.document.getElementById(section)?.scrollIntoView({
        behavior: smooth ? 'smooth' : 'auto',
        block: 'start'
      });
    });
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
