(() => {
  'use strict';

  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];
  const root = document.documentElement;
  const body = document.body;
  const storage = {
    get(key) { try { return window.localStorage.getItem(key); } catch (_) { return null; } },
    set(key, value) { try { window.localStorage.setItem(key, value); } catch (_) {} }
  };
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const config = window.SITE_CONFIG || { whatsappNumber: '94703185080', whatsappDisplay: '+94 70 318 5080', contactApiEndpoint: '' };
  const focusableSelector = 'a[href],button:not([disabled]),input:not([disabled]):not([type=\"hidden\"]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex=\"-1\"])';
  const trapFocus = (container, event) => {
    if (event.key !== 'Tab' || !container || container.hidden) return;
    const items = $$(focusableSelector, container).filter(item => item.offsetParent !== null);
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  };

  const showToast = (message) => {
    const toast = $('#toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('visible');
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove('visible'), 2600);
  };

  // Premium signature preloader: visible, but never slows access to the content.
  const preloader = $('#preloader');
  const loaderPercent = $('#loaderPercent');
  const loaderStartedAt = performance.now();
  let loaderValue = 0;
  const loaderTimer = window.setInterval(() => {
    loaderValue = Math.min(94, loaderValue + Math.max(3, Math.round((100 - loaderValue) * .18)));
    if (loaderPercent) loaderPercent.textContent = `${loaderValue}%`;
  }, 45);
  let loaderClosed = false;
  const closePreloader = () => {
    if (loaderClosed) return;
    loaderClosed = true;
    window.clearInterval(loaderTimer);
    if (loaderPercent) loaderPercent.textContent = '100%';
    const elapsed = performance.now() - loaderStartedAt;
    const delay = reducedMotion ? 0 : Math.max(0, 420 - elapsed);
    window.setTimeout(() => preloader?.classList.add('hidden'), delay);
    window.setTimeout(() => preloader?.remove(), delay + (reducedMotion ? 30 : 620));
  };
  if (document.readyState === 'complete') closePreloader();
  else window.addEventListener('load', closePreloader, { once: true });
  window.setTimeout(closePreloader, 1200);

  // Current year and Sri Lanka local time
  const updateTime = () => {
    const time = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Colombo', hour: '2-digit', minute: '2-digit', hour12: false
    }).format(new Date());
    const target = $('#localTime');
    if (target) target.textContent = `${time} LK`;
  };
  updateTime();
  setInterval(updateTime, 30000);
  if ($('#currentYear')) $('#currentYear').textContent = new Date().getFullYear();

  // Theme system
  const themes = ['neon', 'light', 'gold'];
  const themeNames = { neon: 'Crimson Night', light: 'Royal Gold', gold: 'Copper Bronze' };
  const themeMeta = $('meta[name="theme-color"]');
  const themeColours = { neon: '#0A0A0A', light: '#050505', gold: '#0A0908' };
  const savedTheme = storage.get('chris-klegar-theme');
  let currentTheme = themes.includes(savedTheme) ? savedTheme : 'neon';

  const applyTheme = (theme, announce = false) => {
    if (!themes.includes(theme)) return;
    currentTheme = theme;
    root.dataset.theme = theme;
    storage.set('chris-klegar-theme', theme);
    themeMeta?.setAttribute('content', themeColours[theme]);
    $$('[data-set-theme]').forEach(button => button.classList.toggle('active', button.dataset.setTheme === theme));
    if (announce) showToast(`${themeNames[theme]} theme activated`);
  };
  applyTheme(currentTheme);

  const cycleTheme = () => {
    const next = themes[(themes.indexOf(currentTheme) + 1) % themes.length];
    applyTheme(next, true);
  };

  const themeButton = $('#themeButton');
  const themeMenu = $('#themeMenu');
  const closeThemeMenu = () => {
    if (!themeMenu) return;
    themeMenu.hidden = true;
    themeButton?.setAttribute('aria-expanded', 'false');
  };
  themeButton?.addEventListener('click', (event) => {
    event.stopPropagation();
    themeMenu.hidden = !themeMenu.hidden;
    themeButton.setAttribute('aria-expanded', String(!themeMenu.hidden));
  });
  $$('[data-set-theme]').forEach(button => button.addEventListener('click', () => {
    applyTheme(button.dataset.setTheme, true);
    closeThemeMenu();
  }));
  document.addEventListener('click', (event) => {
    if (!event.target.closest('.theme-switcher')) closeThemeMenu();
  });
  $('#footerTheme')?.addEventListener('click', cycleTheme);

  // Mobile navigation
  const menuToggle = $('#menuToggle');
  const navLinks = $('#navLinks');
  const closeMenu = () => {
    navLinks?.classList.remove('open');
    menuToggle?.setAttribute('aria-expanded', 'false');
    body.classList.remove('menu-open');
  };
  menuToggle?.addEventListener('click', () => {
    const open = !navLinks.classList.contains('open');
    navLinks.classList.toggle('open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
    body.classList.toggle('menu-open', open);
  });
  $$('.nav-link').forEach(link => link.addEventListener('click', closeMenu));

  // Global scroll behaviours
  const siteHeader = $('#siteHeader');
  const scrollProgress = $('#scrollProgress');
  const backToTop = $('#backToTop');
  const navSectionLinks = $$('.nav-link[href^="#"]');
  const sections = navSectionLinks.map(link => $(link.getAttribute('href'))).filter(Boolean);

  const updateScrollUI = () => {
    const y = window.scrollY;
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    if (scrollProgress) scrollProgress.style.width = `${(y / max) * 100}%`;
    siteHeader?.classList.toggle('scrolled', y > 30);
    backToTop?.classList.toggle('visible', y > 650);

    let current = 'home';
    sections.forEach(section => {
      if (y >= section.offsetTop - 180) current = section.id;
    });
    navSectionLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${current}`));

    const journey = $('#journeyLine');
    const journeyProgress = $('#journeyProgress');
    if (journey && journeyProgress) {
      const rect = journey.getBoundingClientRect();
      const start = window.innerHeight * .65;
      const total = rect.height;
      const completed = Math.min(total, Math.max(0, start - rect.top));
      journeyProgress.style.height = `${completed}px`;
    }
  };
  updateScrollUI();
  window.addEventListener('scroll', updateScrollUI, { passive: true });
  backToTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' }));

  // Reveal and counters
  const revealItems = $$('.reveal');
  const animateCounter = (element) => {
    if (element.dataset.counted) return;
    element.dataset.counted = 'true';
    const target = Number(element.dataset.target || 0);
    if (reducedMotion) {
      element.textContent = target;
      return;
    }
    const duration = 1200;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = Math.round(target * eased);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  if ('IntersectionObserver' in window && !reducedMotion) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        $$('.counter', entry.target).forEach(animateCounter);
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: .12 });
    revealItems.forEach(item => revealObserver.observe(item));

    const heroCounterObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) $$('.counter', entry.target).forEach(animateCounter);
      });
    }, { threshold: .25 });
    if ($('#heroStage')) heroCounterObserver.observe($('#heroStage'));
  } else {
    revealItems.forEach(item => item.classList.add('visible'));
    $$('.counter').forEach(animateCounter);
  }

  // Custom cursor and magnetic elements
  const finePointer = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  if (finePointer) {
    const dot = $('.cursor-dot');
    const ring = $('.cursor-ring');
    let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;
    document.addEventListener('mousemove', event => {
      mouseX = event.clientX; mouseY = event.clientY;
      dot.style.transform = `translate(${mouseX}px,${mouseY}px) translate(-50%,-50%)`;
      body.classList.add('cursor-ready');
    });
    const animateCursor = () => {
      ringX += (mouseX - ringX) * .16;
      ringY += (mouseY - ringY) * .16;
      ring.style.transform = `translate(${ringX}px,${ringY}px) translate(-50%,-50%)`;
      requestAnimationFrame(animateCursor);
    };
    animateCursor();

    $$('a,button,input,textarea,select').forEach(item => {
      item.addEventListener('mouseenter', () => body.classList.add('cursor-hover'));
      item.addEventListener('mouseleave', () => body.classList.remove('cursor-hover'));
    });

    $$('.magnetic').forEach(element => {
      element.addEventListener('mousemove', event => {
        const rect = element.getBoundingClientRect();
        const x = (event.clientX - rect.left - rect.width / 2) * .16;
        const y = (event.clientY - rect.top - rect.height / 2) * .16;
        element.style.transform = `translate(${x}px,${y}px)`;
      });
      element.addEventListener('mouseleave', () => { element.style.transform = ''; });
    });
  }

  // Hero parallax and card tilt
  const heroStage = $('#heroStage');
  if (heroStage && finePointer && !reducedMotion) {
    heroStage.addEventListener('mousemove', event => {
      const rect = heroStage.getBoundingClientRect();
      const nx = (event.clientX - rect.left) / rect.width - .5;
      const ny = (event.clientY - rect.top) / rect.height - .5;
      const portrait = $('.portrait-card', heroStage);
      portrait.style.transform = `translateX(-50%) rotateY(${nx * 7}deg) rotateX(${-ny * 6}deg)`;
      $$('[data-depth]', heroStage).forEach(item => {
        const depth = Number(item.dataset.depth || 10);
        item.style.transform = `translate(${nx * depth}px,${ny * depth}px)`;
      });
    });
    heroStage.addEventListener('mouseleave', () => {
      $('.portrait-card', heroStage).style.transform = 'translateX(-50%)';
      $$('[data-depth]', heroStage).forEach(item => { item.style.transform = ''; });
    });
  }

  // Workspace tabs with mouse and keyboard support
  const workspaceTabs = $$('[data-workspace-tab]');
  const activateWorkspaceTab = (button, moveFocus = false) => {
    const tab = button?.dataset.workspaceTab;
    if (!tab) return;
    workspaceTabs.forEach((item, index) => {
      const active = item === button;
      item.classList.toggle('active', active);
      item.setAttribute('aria-selected', String(active));
      item.tabIndex = active ? 0 : -1;
      item.id ||= `workspace-tab-${index + 1}`;
    });
    $$('[data-workspace-panel]').forEach((panel, index) => {
      const active = panel.dataset.workspacePanel === tab;
      panel.classList.toggle('active', active);
      panel.hidden = !active;
      panel.setAttribute('role', 'tabpanel');
      panel.id ||= `workspace-panel-${index + 1}`;
      const owner = workspaceTabs.find(item => item.dataset.workspaceTab === panel.dataset.workspacePanel);
      if (owner) { owner.setAttribute('aria-controls', panel.id); panel.setAttribute('aria-labelledby', owner.id); }
    });
    if (moveFocus) button.focus();
  };
  workspaceTabs.forEach((button, index) => {
    button.addEventListener('click', () => activateWorkspaceTab(button));
    button.addEventListener('keydown', event => {
      if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
      event.preventDefault();
      let next = index;
      if (event.key === 'ArrowRight') next = (index + 1) % workspaceTabs.length;
      if (event.key === 'ArrowLeft') next = (index - 1 + workspaceTabs.length) % workspaceTabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = workspaceTabs.length - 1;
      activateWorkspaceTab(workspaceTabs[next], true);
    });
  });
  if (workspaceTabs.length) activateWorkspaceTab(workspaceTabs.find(item => item.classList.contains('active')) || workspaceTabs[0]);

  // Design-to-code comparison
  const compareRange = $('#compareRange');
  const compareAfter = $('#compareAfter');
  const compareHandle = $('#compareHandle');
  const updateCompare = () => {
    const value = Number(compareRange?.value || 52);
    if (compareAfter) compareAfter.style.clipPath = `inset(0 0 0 ${value}%)`;
    if (compareHandle) compareHandle.style.left = `${value}%`;
  };
  compareRange?.addEventListener('input', updateCompare);
  updateCompare();

  // Skill universe
  const skillData = {
    dotnet: { icon: '.NET', category: 'Web framework', name: 'ASP.NET Core Development', description: 'Building MVC applications and REST APIs with structured C# code, validation and maintainable project organisation.', meter: 90, level: 'Strong practical skill' },
    csharp: { icon: 'C#', category: 'Programming language', name: 'C# Development', description: 'Writing object-oriented application logic, services, models and backend workflows with readable and reusable code.', meter: 88, level: 'Strong practical skill' },
    sql: { icon: 'SQL', category: 'Database', name: 'SQL Server & T-SQL', description: 'Designing relational schemas, queries, stored procedures and data flows for dependable application behaviour.', meter: 85, level: 'Project-ready skill' },
    api: { icon: 'API', category: 'Backend services', name: 'REST API Development', description: 'Creating structured endpoints with validation, error handling, data access and workflow-focused API design.', meter: 86, level: 'Strong practical skill' },
    frontend: { icon: '</>', category: 'Frontend', name: 'HTML, CSS & JavaScript', description: 'Building responsive interfaces, dashboards, data tables and interactions with semantic frontend technologies.', meter: 84, level: 'Strong practical skill' },
    git: { icon: 'Git', category: 'Development tools', name: 'Git, GitHub & Visual Studio', description: 'Organising projects, managing source code and working efficiently with the Microsoft development toolchain.', meter: 82, level: 'Daily workflow' }
  };
  const renderSkill = (key) => {
    const skill = skillData[key];
    if (!skill) return;
    $('#skillIcon').textContent = skill.icon;
    $('#skillCategory').textContent = skill.category;
    $('#skillName').textContent = skill.name;
    $('#skillDescription').textContent = skill.description;
    $('#skillMeter').style.width = `${skill.meter}%`;
    $('#skillLevel').textContent = skill.level;
  };
  $$('.skill-node').forEach(button => button.addEventListener('click', () => {
    $$('.skill-node').forEach(item => item.classList.toggle('active', item === button));
    renderSkill(button.dataset.skill);
  }));

  // Live design lab
  const labPreview = $('#labPreview');
  const labInputs = {
    accent: $('#accentRange'), radius: $('#radiusRange'), blur: $('#blurRange')
  };
  const labOutputs = {
    accent: $('#accentOutput'), radius: $('#radiusOutput'), blur: $('#blurOutput')
  };
  const updateLab = () => {
    if (!labPreview) return;
    const accent = Number(labInputs.accent.value);
    const radius = Number(labInputs.radius.value);
    const blur = Number(labInputs.blur.value);
    labPreview.style.setProperty('--lab-hue', accent);
    labPreview.style.setProperty('--lab-radius', `${radius}px`);
    labPreview.style.setProperty('--lab-blur', `${blur}px`);
    labOutputs.accent.textContent = `${accent}°`;
    labOutputs.radius.textContent = `${radius}px`;
    labOutputs.blur.textContent = `${blur}px`;
  };
  Object.values(labInputs).forEach(input => input?.addEventListener('input', updateLab));
  const labPresets = {
    minimal: { accent: 210, radius: 8, blur: 4 },
    neon: { accent: 270, radius: 24, blur: 20 },
    luxury: { accent: 42, radius: 17, blur: 14 }
  };
  $$('[data-lab-preset]').forEach(button => button.addEventListener('click', () => {
    const preset = labPresets[button.dataset.labPreset];
    labInputs.accent.value = preset.accent;
    labInputs.radius.value = preset.radius;
    labInputs.blur.value = preset.blur;
    $$('[data-lab-preset]').forEach(item => item.classList.toggle('active', item === button));
    updateLab();
  }));
  $('#resetLab')?.addEventListener('click', () => {
    labInputs.accent.value = 270; labInputs.radius.value = 24; labInputs.blur.value = 20;
    $$('[data-lab-preset]').forEach(item => item.classList.toggle('active', item.dataset.labPreset === 'neon'));
    updateLab();
    showToast('Design lab reset');
  });
  updateLab();

  // Feedback slider
  const feedbackCards = $$('.feedback-card');
  let feedbackIndex = 0;
  const renderFeedback = () => feedbackCards.forEach((card,index) => card.classList.toggle('active', index === feedbackIndex));
  $('#feedbackPrev')?.addEventListener('click', () => { feedbackIndex = (feedbackIndex - 1 + feedbackCards.length) % feedbackCards.length; renderFeedback(); });
  $('#feedbackNext')?.addEventListener('click', () => { feedbackIndex = (feedbackIndex + 1) % feedbackCards.length; renderFeedback(); });

  // WhatsApp-first contact form with an optional same-origin API endpoint.
  const contactForm = $('#contactForm');
  const formStatus = $('#formStatus');
  const formConfirmation = $('#formConfirmation');
  const whatsappContinue = $('#whatsappContinue');
  const submitButton = $('.submit-project', contactForm || document);

  const validPhone = value => /^[+\d][\d\s()\-]{7,20}$/.test(String(value || '').trim());
  const buildWhatsAppMessage = data => [
    'Hello Chris,',
    '',
    `My name is ${data.name}.`,
    `WhatsApp number: ${data.phone}`,
    '',
    `Service: ${data.service}`,
    `Budget range: ${data.budget}`,
    `Preferred timeline: ${data.timeline}`,
    `Project stage: ${data.stage}`,
    '',
    'Project details:',
    data.message,
    '',
    'Sent from the Chris Klegar Yoag portfolio.'
  ].join('\n');

  const setFormStatus = (message, type = '') => {
    if (!formStatus) return;
    formStatus.textContent = message;
    formStatus.className = `form-status ${type}`.trim();
  };

  contactForm?.addEventListener('submit', async event => {
    event.preventDefault();
    const formData = new FormData(contactForm);
    if (String(formData.get('website') || '').trim()) return;

    let valid = true;
    $$('[required]', contactForm).forEach(field => {
      let fieldValid = field.type === 'checkbox' ? field.checked : field.checkValidity() && field.value.trim() !== '';
      if (field.name === 'phone') fieldValid = fieldValid && validPhone(field.value);
      field.classList.toggle('invalid', !fieldValid);
      if (!fieldValid) valid = false;
    });
    if (!valid) {
      setFormStatus('Please complete every required field. Use a valid WhatsApp number.', 'error');
      return;
    }

    const payload = Object.fromEntries([...formData.entries()].filter(([key]) => key !== 'consent' && key !== 'website'));
    const fallbackUrl = `https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent(buildWhatsAppMessage(payload))}`;
    let whatsappUrl = fallbackUrl;
    const popup = window.open('about:blank', '_blank');
    if (popup) popup.opener = null;

    submitButton?.setAttribute('disabled', '');
    submitButton?.classList.add('is-loading');
    setFormStatus('Preparing your secure WhatsApp enquiry…');
    if (formConfirmation) formConfirmation.hidden = true;

    try {
      if (config.contactApiEndpoint && location.protocol !== 'file:') {
        const controller = new AbortController();
        const timeout = window.setTimeout(() => controller.abort(), 5000);
        const response = await fetch(config.contactApiEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(payload),
          signal: controller.signal
        });
        window.clearTimeout(timeout);
        if (!response.ok) throw new Error(`Contact API returned ${response.status}`);
        const result = await response.json();
        if (result.whatsappUrl) whatsappUrl = result.whatsappUrl;
      }
      if (whatsappContinue) whatsappContinue.href = whatsappUrl;
      if (formConfirmation) formConfirmation.hidden = false;
      setFormStatus('Enquiry prepared successfully. Review the message in WhatsApp, then tap Send.', 'success');
      showToast('WhatsApp enquiry prepared');
      contactForm.reset();
      if (popup) popup.location.href = whatsappUrl;
    } catch (error) {
      console.warn('Contact API unavailable; using the WhatsApp fallback.', error);
      if (whatsappContinue) whatsappContinue.href = fallbackUrl;
      if (formConfirmation) formConfirmation.hidden = false;
      setFormStatus('The contact API was unavailable, so the WhatsApp fallback is ready.', 'success');
      showToast('WhatsApp fallback prepared');
      if (popup) popup.location.href = fallbackUrl;
    } finally {
      submitButton?.removeAttribute('disabled');
      submitButton?.classList.remove('is-loading');
      if (!popup) whatsappContinue?.focus();
    }
  });
  $$('input,textarea,select', contactForm || document).forEach(field => field.addEventListener('input', () => field.classList.remove('invalid')));

  // Portfolio assistant: 200+ example questions mapped to grounded predefined answers.
  const assistantPanel = $('#assistantPanel');
  const assistantMessages = $('#assistantMessages');
  const assistantInput = $('#assistantInput');
  const assistantKnowledge = Array.isArray(window.PORTFOLIO_ASSISTANT) ? window.PORTFOLIO_ASSISTANT : [];
  const assistantLauncher = $('#assistantLauncher');
  let assistantLastFocus = null;

  const normaliseQuestion = value => String(value || '')
    .toLowerCase()
    .replace(/asp\s*net/g, 'asp.net')
    .replace(/c\s*sharp/g, 'c#')
    .replace(/co\s*founder/g, 'founder')
    .replace(/[^a-z0-9#.+\-\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const stopWords = new Set(['a','an','the','is','are','am','i','me','my','you','your','what','where','when','why','how','can','could','would','do','does','did','tell','about','please','to','of','for','in','on','with']);
  const tokens = value => normaliseQuestion(value).split(' ').filter(token => token && !stopWords.has(token));
  const bigrams = value => {
    const compact = ` ${normaliseQuestion(value)} `;
    const grams = [];
    for (let i = 0; i < compact.length - 1; i += 1) grams.push(compact.slice(i, i + 2));
    return grams;
  };
  const dice = (left, right) => {
    const a = bigrams(left); const b = bigrams(right);
    if (!a.length || !b.length) return 0;
    const counts = new Map();
    a.forEach(g => counts.set(g, (counts.get(g) || 0) + 1));
    let matches = 0;
    b.forEach(g => { const count = counts.get(g) || 0; if (count > 0) { matches += 1; counts.set(g, count - 1); } });
    return (2 * matches) / (a.length + b.length);
  };
  const assistantReply = question => {
    const q = normaliseQuestion(question);
    const qTokens = tokens(q);
    let best = null;
    let bestScore = 0;
    assistantKnowledge.forEach(intent => {
      const keywordMatches = (intent.keywords || []).filter(keyword => q.includes(normaliseQuestion(keyword))).length;
      const exampleScore = Math.max(0, ...(intent.examples || []).map(example => {
        const e = normaliseQuestion(example);
        if (q === e) return 8;
        if (q.includes(e) || e.includes(q)) return 5.5;
        const eTokens = new Set(tokens(e));
        const overlap = qTokens.filter(token => eTokens.has(token)).length;
        return dice(q, e) * 3.2 + overlap * 1.2;
      }));
      const score = exampleScore + keywordMatches * 2.1;
      if (score > bestScore) { bestScore = score; best = intent; }
    });
    if (best && bestScore >= 2.35) return best.answer;
    return 'I could not match that precisely. Ask about Chris, X10 THINK, technologies, services, pricing, timeline, deployment or WhatsApp contact.';
  };
  const addAssistantMessage = (text, type) => {
    const message = document.createElement('div');
    message.className = `assistant-message ${type}`;
    message.textContent = text;
    assistantMessages?.appendChild(message);
    if (assistantMessages) assistantMessages.scrollTop = assistantMessages.scrollHeight;
  };
  const handleAssistantQuestion = question => {
    const text = String(question || '').trim();
    if (!text) return;
    addAssistantMessage(text, 'user');
    window.setTimeout(() => addAssistantMessage(assistantReply(text), 'bot'), reducedMotion ? 0 : 280);
  };
  const openAssistant = () => {
    if (!assistantPanel) return;
    assistantLastFocus = document.activeElement;
    assistantPanel.hidden = false;
    assistantLauncher?.setAttribute('aria-expanded', 'true');
    window.setTimeout(() => assistantInput?.focus(), 80);
  };
  const closeAssistant = () => {
    if (!assistantPanel) return;
    assistantPanel.hidden = true;
    assistantLauncher?.setAttribute('aria-expanded', 'false');
    if (assistantLastFocus instanceof HTMLElement) assistantLastFocus.focus();
  };
  assistantLauncher?.setAttribute('aria-expanded', 'false');
  assistantLauncher?.setAttribute('aria-controls', 'assistantPanel');
  assistantLauncher?.addEventListener('click', () => assistantPanel?.hidden ? openAssistant() : closeAssistant());
  $('#assistantClose')?.addEventListener('click', closeAssistant);
  $('#assistantForm')?.addEventListener('submit', event => {
    event.preventDefault();
    handleAssistantQuestion(assistantInput?.value);
    if (assistantInput) assistantInput.value = '';
  });
  $$('.assistant-suggestions button').forEach(button => button.addEventListener('click', () => handleAssistantQuestion(button.textContent)));

  // Command palette
  const commandPalette = $('#commandPalette');
  const commandSearch = $('#commandSearch');
  const commandButtons = $$('#commandList button');
  let selectedCommand = 0;
  let commandLastFocus = null;

  const visibleCommands = () => commandButtons.filter(button => !button.hidden);
  const updateCommandSelection = () => {
    commandButtons.forEach(button => button.classList.remove('selected'));
    const list = visibleCommands();
    if (!list.length) return;
    selectedCommand = Math.max(0, Math.min(selectedCommand, list.length - 1));
    list[selectedCommand].classList.add('selected');
  };
  const openCommand = () => {
    commandLastFocus = document.activeElement;
    commandPalette.hidden = false;
    body.classList.add('modal-open');
    commandSearch.value = '';
    commandButtons.forEach(button => { button.hidden = false; });
    $('#commandEmpty').hidden = true;
    selectedCommand = 0;
    updateCommandSelection();
    window.setTimeout(() => commandSearch.focus(), 80);
  };
  const closeCommand = () => {
    commandPalette.hidden = true;
    body.classList.remove('modal-open');
    if (commandLastFocus instanceof HTMLElement) commandLastFocus.focus();
  };
  const scrollToSection = (selector) => {
    closeCommand();
    $(selector)?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
  };
  const executeCommand = (command) => {
    switch (command) {
      case 'theme': closeCommand(); cycleTheme(); break;
      case 'contact': scrollToSection('#contact'); break;
      case 'lab': scrollToSection('#lab'); break;
      case 'assistant': closeCommand(); openAssistant(); break;
    }
  };
  $('#commandButton')?.addEventListener('click', openCommand);
  $('#footerCommand')?.addEventListener('click', openCommand);
  $$('[data-close-command]').forEach(item => item.addEventListener('click', closeCommand));
  commandButtons.forEach(button => button.addEventListener('click', () => executeCommand(button.dataset.command)));
  commandSearch?.addEventListener('input', () => {
    const query = commandSearch.value.trim().toLowerCase();
    let visible = 0;
    commandButtons.forEach(button => {
      const matches = !query || `${button.textContent} ${button.dataset.keywords}`.toLowerCase().includes(query);
      button.hidden = !matches;
      if (matches) visible += 1;
    });
    $('#commandEmpty').hidden = visible !== 0;
    selectedCommand = 0;
    updateCommandSelection();
  });
  commandSearch?.addEventListener('keydown', event => {
    const list = visibleCommands();
    if (event.key === 'ArrowDown' && list.length) { event.preventDefault(); selectedCommand = (selectedCommand + 1) % list.length; updateCommandSelection(); }
    if (event.key === 'ArrowUp' && list.length) { event.preventDefault(); selectedCommand = (selectedCommand - 1 + list.length) % list.length; updateCommandSelection(); }
    if (event.key === 'Enter' && list.length) { event.preventDefault(); executeCommand(list[selectedCommand].dataset.command); }
  });

  document.addEventListener('keydown', event => {
    if (!commandPalette?.hidden) trapFocus(commandPalette, event);
    const typing = ['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName);
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      commandPalette.hidden ? openCommand() : closeCommand();
      return;
    }
    if (event.key === 'Escape') {
      if (!commandPalette.hidden) closeCommand();
      if (!assistantPanel.hidden) closeAssistant();
      closeThemeMenu();
      closeMenu();
      return;
    }
    if (typing || event.ctrlKey || event.metaKey || event.altKey) return;
    const key = event.key.toLowerCase();
    if (key === 't') cycleTheme();
  });

  // PWA service worker: hosted HTTPS or localhost only.
  const canUseServiceWorker = location.protocol === 'https:' || ['localhost','127.0.0.1'].includes(location.hostname);
  if ('serviceWorker' in navigator && canUseServiceWorker) {
    window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js', { scope: './' }).catch(error => console.warn('Service worker registration skipped.', error)), { once: true });
  }
})();
