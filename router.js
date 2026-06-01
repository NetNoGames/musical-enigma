const router = {
  currentPage: null,
  currentParams: {},

  init() {
    this.route();
    window.addEventListener('popstate', () => this.route());
  },

  go(page, params = {}) {
    const url = new URL(window.location);
    url.searchParams.set('page', page);
    url.searchParams.delete('id');
    Object.entries(params).forEach(([k, v]) => { if (v) url.searchParams.set(k, v); });
    window.history.pushState({}, '', url);
    this.route();
  },

  route() {
    const params = new URLSearchParams(window.location.search);
    const page = params.get('page') || 'home';
    this.currentParams = {};
    for (const [k, v] of params) this.currentParams[k] = v;
    this.currentPage = this.pages[page] ? page : 'home';
    this.render();
  },

  render() {
    const app = document.getElementById('app-content');
    if (!app) return;
    const page = this.pages[this.currentPage];
    app.innerHTML = page.render(this.currentParams);
    document.title = page.title(this.currentParams);
    if (page.init) page.init.call(this.pages[this.currentPage], this.currentParams);
    window.scrollTo(0, 0);
    window.dispatchEvent(new Event('pagechange'));
  },

  pages: {
    home: {
      title: () => 'NetNo Games | Overview & Studios',
      render() {
        return `
<section class="relative w-full min-h-[60vh] flex items-center px-margin-mobile md:px-margin-desktop py-8 overflow-hidden" style="background-color: var(--surface-dim);">
  <div class="absolute inset-0 z-0">
    <img alt="" class="w-full h-full object-cover opacity-15" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCk8J14iBcY3E0xN5_xVxXdbmaVxmK27sHS5veeVa9dXn7Naq8SSH-q1rHFl9f2D14sADSKYOFY-wdQ0QQ1Cui7WlqhtnDKnuUg6N7AoVEtE0DzoRCB3NfraEAO3frAhE9MkzzM5likVw5Wj0NEGQzCcjcY8lnsoghXMAYbdwKlIHtrSGPKOzzu9KGd1bWIuVhgXpzqRaWZ5jtS9jfSGMn5jPUIuDqZK0QsQHlhoQef_1IeWlycZiqslG87mY_wB61SVu0AC6MyBF8"/>
    <div class="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/40"></div>
    <div class="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
  </div>
  <div class="absolute top-0 right-[15%] w-px h-full bg-gradient-to-b from-transparent via-primary-color/20 to-transparent transform rotate-12 pointer-events-none hidden lg:block"></div>
  <div class="absolute top-0 right-[35%] w-px h-full bg-gradient-to-b from-transparent via-secondary-color/10 to-transparent transform -rotate-6 pointer-events-none hidden lg:block"></div>
  <div class="relative z-10 max-w-3xl fade-in">
    <div class="inline-flex items-center gap-3 mb-6">
      <div class="w-10 h-px bg-primary-color"></div>
      <span class="text-primary-color font-display font-semibold tracking-[0.2em] text-[10px] uppercase">NetNo Interactive</span>
    </div>
    <h1 class="font-display text-5xl md:text-7xl lg:text-[5.5rem] font-extrabold leading-[1.05] tracking-tight text-on-surface mb-5">
      THE NEXT EVOLUTION<br/>
      <span class="text-primary-color text-glow">OF INDIE HORROR</span>
    </h1>
    <p class="font-body text-base md:text-lg text-on-surface-variant max-w-lg mb-6 leading-relaxed font-light">
      Deep-sea anomalies. Synthetic threats. Forest-based psychological mysteries. Where organic terror meets digital precision.
    </p>
    <div class="flex flex-col sm:flex-row gap-4">
      <a href="games.html" class="btn-glow-primary bg-primary-color text-on-primary font-display font-bold uppercase tracking-wider text-xs px-8 py-4 rounded text-center inline-flex items-center justify-center gap-2">
        Explore Games
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/></svg>
      </a>
      <a href="#studio-philosophy" class="btn-glow-outline text-primary-color font-display font-bold uppercase tracking-wider text-xs px-8 py-4 rounded text-center">
        Our Philosophy
      </a>
    </div>
    <div class="flex gap-10 mt-8 pt-6 border-t border-outline-variant/20">
      <div>
        <span class="block font-display text-2xl font-bold text-primary-color">3</span>
        <span class="text-[10px] text-on-surface-variant/60 uppercase tracking-widest font-display">Titles</span>
      </div>
      <div>
        <span class="block font-display text-2xl font-bold text-secondary-color">100+</span>
        <span class="text-[10px] text-on-surface-variant/60 uppercase tracking-widest font-display">Community</span>
      </div>
      <div>
        <span class="block font-display text-2xl font-bold text-on-surface">2026</span>
        <span class="text-[10px] text-on-surface-variant/60 uppercase tracking-widest font-display">Est.</span>
      </div>
    </div>
  </div>
</section>
<div class="w-full overflow-hidden border-y border-outline-variant/15 py-3" style="background-color: var(--surface-color);">
  <div class="marquee-track flex items-center gap-12 whitespace-nowrap">
    <span class="font-display text-[10px] uppercase tracking-[0.3em] text-on-surface-variant/40">Abyssal Cord</span>
    <span class="text-primary-color/30">●</span>
    <span class="font-display text-[10px] uppercase tracking-[0.3em] text-on-surface-variant/40">Verdant Node</span>
    <span class="text-primary-color/30">●</span>
    <span class="font-display text-[10px] uppercase tracking-[0.3em] text-on-surface-variant/40">Silicone Vein</span>
    <span class="text-primary-color/30">●</span>
    <span class="font-display text-[10px] uppercase tracking-[0.3em] text-on-surface-variant/40">Psychological Horror</span>
    <span class="text-primary-color/30">●</span>
    <span class="font-display text-[10px] uppercase tracking-[0.3em] text-on-surface-variant/40">Deep Sea Anomalies</span>
    <span class="text-primary-color/30">●</span>
    <span class="font-display text-[10px] uppercase tracking-[0.3em] text-on-surface-variant/40">Digital Decay</span>
    <span class="text-primary-color/30">●</span>
    <span class="font-display text-[10px] uppercase tracking-[0.3em] text-on-surface-variant/40">Organic Terror</span>
    <span class="text-primary-color/30">●</span>
    <span class="font-display text-[10px] uppercase tracking-[0.3em] text-on-surface-variant/40">Abyssal Cord</span>
    <span class="text-primary-color/30">●</span>
    <span class="font-display text-[10px] uppercase tracking-[0.3em] text-on-surface-variant/40">Verdant Node</span>
    <span class="text-primary-color/30">●</span>
    <span class="font-display text-[10px] uppercase tracking-[0.3em] text-on-surface-variant/40">Silicone Vein</span>
    <span class="text-primary-color/30">●</span>
    <span class="font-display text-[10px] uppercase tracking-[0.3em] text-on-surface-variant/40">Psychological Horror</span>
    <span class="text-primary-color/30">●</span>
    <span class="font-display text-[10px] uppercase tracking-[0.3em] text-on-surface-variant/40">Deep Sea Anomalies</span>
    <span class="text-primary-color/30">●</span>
    <span class="font-display text-[10px] uppercase tracking-[0.3em] text-on-surface-variant/40">Digital Decay</span>
    <span class="text-primary-color/30">●</span>
    <span class="font-display text-[10px] uppercase tracking-[0.3em] text-on-surface-variant/40">Organic Terror</span>
    <span class="text-primary-color/30">●</span>
  </div>
</div>
<section class="w-full max-w-screen-2xl mx-auto px-margin-mobile md:px-margin-desktop py-20">
  <div class="flex justify-between items-end mb-12">
    <div>
      <div class="inline-flex items-center gap-3 mb-3">
        <div class="w-8 h-px bg-primary-color"></div>
        <span class="text-primary-color font-display font-semibold tracking-[0.2em] text-[10px] uppercase">Curated Catalog</span>
      </div>
      <h2 class="font-display text-3xl md:text-4xl font-bold text-on-surface">Featured Titles</h2>
    </div>
    <a class="font-display text-xs font-semibold text-on-surface-variant hover:text-primary-color transition-colors flex items-center gap-2 group" href="games.html">
      VIEW ALL <span class="material-symbols-outlined text-[14px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
    </a>
  </div>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6" id="featured-games-container">
    <div class="h-[400px] rounded-lg border border-outline-variant/30 overflow-hidden bg-surface flex flex-col p-4 gap-4">
      <div class="h-48 rounded skeleton"></div><div class="h-6 w-3/4 rounded skeleton"></div><div class="h-4 w-1/2 rounded skeleton"></div><div class="h-16 rounded skeleton mt-auto"></div>
    </div>
    <div class="h-[400px] rounded-lg border border-outline-variant/30 overflow-hidden bg-surface flex flex-col p-4 gap-4">
      <div class="h-48 rounded skeleton"></div><div class="h-6 w-3/4 rounded skeleton"></div><div class="h-4 w-1/2 rounded skeleton"></div><div class="h-16 rounded skeleton mt-auto"></div>
    </div>
    <div class="h-[400px] rounded-lg border border-outline-variant/30 overflow-hidden bg-surface flex flex-col p-4 gap-4">
      <div class="h-48 rounded skeleton"></div><div class="h-6 w-3/4 rounded skeleton"></div><div class="h-4 w-1/2 rounded skeleton"></div><div class="h-16 rounded skeleton mt-auto"></div>
    </div>
  </div>
</section>
<section id="studio-philosophy" class="w-full py-24 relative overflow-hidden" style="background-color: var(--surface-color);">
  <div class="absolute -right-32 top-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-primary-color/5 rounded-full pointer-events-none hidden lg:block"></div>
  <div class="absolute -right-16 top-1/2 -translate-y-1/2 w-[350px] h-[350px] border border-primary-color/8 rounded-full pointer-events-none hidden lg:block"></div>
  <div class="absolute left-0 top-0 w-full h-px bg-gradient-to-r from-transparent via-outline-variant/20 to-transparent"></div>
  <div class="max-w-screen-2xl mx-auto px-margin-mobile md:px-margin-desktop relative z-10">
    <div class="mb-16">
      <div class="inline-flex items-center gap-3 mb-3">
        <div class="w-8 h-px bg-primary-color"></div>
        <span class="text-primary-color font-display font-semibold tracking-[0.2em] text-[10px] uppercase">Architectural Ethos</span>
      </div>
      <h2 class="font-display text-3xl md:text-5xl font-bold text-on-surface max-w-2xl leading-tight">
        The <span class="text-primary-color text-glow">Verdant Matrix</span> Philosophy
      </h2>
    </div>
    <div class="flex flex-col lg:flex-row gap-16 items-start">
      <div class="lg:w-1/2 flex flex-col gap-6">
        <p class="font-body text-lg text-on-surface-variant leading-relaxed font-light">
          NetNo Games is pioneering a transition from primitive jumpscare frameworks to deeply atmospheric, high-fidelity psychological horror. We build systems situated at the collision interface of organic nature and digital decay.
        </p>
        <p class="font-body text-sm text-on-surface-variant/70 leading-relaxed">
          By utilising negative whitespace, clean minimalist HUD screens, and dark terminal designs, we invite players to immerse themselves in deep-sea anomalies and overgrown machinery where calm focus is the only path to survival.
        </p>
      </div>
      <div class="lg:w-1/2 w-full grid grid-cols-2 gap-4">
        <div class="corner-bracket bg-surface-dim/50 border border-outline-variant/20 p-6 flex flex-col justify-between h-40 transition-all duration-300 group hover:border-primary-color/30">
          <span class="material-symbols-outlined text-primary-color text-[28px]">psychology</span>
          <span class="font-display text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">Psychological Focus</span>
        </div>
        <div class="corner-bracket bg-surface-dim/50 border border-outline-variant/20 p-6 flex flex-col justify-between h-40 transition-all duration-300 group hover:border-secondary-color/30">
          <span class="material-symbols-outlined text-secondary-color text-[28px]">forest</span>
          <span class="font-display text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">Organic Environments</span>
        </div>
        <div class="corner-bracket bg-surface-dim/50 border border-outline-variant/20 p-6 flex flex-col justify-between h-40 col-span-2 transition-all duration-300 group hover:border-primary-color/30">
          <span class="material-symbols-outlined text-primary-color text-[28px]">memory</span>
          <span class="font-display text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">Digital Precision & HUD Screens</span>
        </div>
      </div>
    </div>
  </div>
</section>
<section class="w-full py-16" style="background-color: var(--surface-color);">
  <div class="max-w-screen-2xl mx-auto px-margin-mobile md:px-margin-desktop">
    <div class="flex flex-col mb-10">
      <div class="inline-flex items-center gap-3 mb-3">
        <div class="w-8 h-px bg-primary-color"></div>
        <span class="text-primary-color font-display font-semibold tracking-[0.2em] text-[10px] uppercase">Ecosystem Broadcast</span>
      </div>
      <h2 class="font-display text-3xl md:text-5xl font-bold text-on-surface">The Nexus Grid</h2>
      <p class="font-body text-sm text-on-surface-variant max-w-2xl mt-3 leading-relaxed font-light">
        Connect with the community, share theories, and stay updated on everything NetNo Games.
      </p>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
      <a href="https://discord.gg/PTbxu9nPZq" target="_blank" class="group relative overflow-hidden border border-[#5865F2]/20 p-8 flex items-center gap-6 transition-all duration-300 hover:border-[#5865F2]/50 hover:shadow-[0_0_30px_rgba(88,101,242,0.1)]" style="background-color: var(--surface-dim);">
        <div class="absolute -top-16 -right-16 w-40 h-40 bg-[#5865F2]/8 rounded-full blur-[50px] pointer-events-none transition-all duration-500 group-hover:bg-[#5865F2]/15"></div>
        <div class="relative z-10 flex-shrink-0 w-14 h-14 rounded-xl bg-[#5865F2]/15 border border-[#5865F2]/20 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
          <svg class="w-7 h-7" viewBox="0 0 71 55" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M60.1045 4.8978C55.5792 2.8214 50.7265 1.2916 45.6527 0.41542C45.5604 0.39851 45.468 0.440769 45.4204 0.525289C44.7963 1.6353 44.105 3.0834 43.6209 4.2216C38.1637 3.4046 32.7345 3.4046 27.3892 4.2216C26.905 3.0581 26.1886 1.6353 25.5617 0.525289C25.5141 0.443589 25.4218 0.40133 25.3294 0.41542C20.2584 1.2888 15.4057 2.8186 10.8776 4.8978C10.8384 4.9147 10.8048 4.9429 10.7825 4.9795C1.57795 18.7309 -0.143566 32.1443 0.231857 45.3914C0.246925 45.4562 0.292297 45.5182 0.354067 45.5471C6.45801 50.0588 12.3413 52.7847 18.1147 54.6471C18.2071 54.6713 18.3023 54.6386 18.3633 54.5719C19.7743 52.6396 21.0358 50.6237 22.1337 48.4531C22.2145 48.2932 22.1488 48.1013 21.989 48.0211C19.6306 47.0811 17.3864 45.8386 15.3009 44.3281C15.1489 44.2172 15.1367 44.0089 15.2762 43.8752C15.7712 43.3929 16.2664 42.8731 16.7392 42.3347C16.8112 42.2503 16.9344 42.2159 17.0452 42.2438C29.1332 47.8478 41.8985 47.8478 53.8958 42.2438C54.0078 42.2131 54.1326 42.2475 54.2046 42.3319C54.6774 42.8703 55.1726 43.3929 55.6654 43.8752C55.8062 44.0089 55.7968 44.2172 55.6421 44.3281C53.5566 45.8358 51.3124 47.0811 48.9566 48.0183C48.7968 48.1013 48.7338 48.2932 48.8134 48.4531C49.9522 50.6209 51.2138 52.6368 52.6218 54.5691C52.6828 54.6358 52.7794 54.6685 52.8704 54.6443C58.6629 52.7819 64.5461 50.056 70.6421 45.5499C70.7065 45.521 70.7506 45.4562 70.7644 45.3914C71.2257 30.1757 68.9647 16.8151 60.1045 4.8978C60.0767 4.88104 60.0489 4.86769 60.021 4.85769L60.1045 4.8978ZM23.7259 37.3253C20.2276 37.3253 17.3451 34.1136 17.3451 30.1693C17.3451 26.225 20.1717 23.0133 23.7259 23.0133C27.308 23.0133 30.1626 26.2532 30.1096 30.1693C30.1096 34.1136 27.28 37.3253 23.7259 37.3253ZM47.3178 37.3253C43.8196 37.3253 40.9371 34.1136 40.9371 30.1693C40.9371 26.225 43.7636 23.0133 47.3178 23.0133C50.9 23.0133 53.7545 26.2532 53.7015 30.1693C53.7015 34.1136 50.8973 37.3253 47.3178 37.3253Z" fill="#FFFFFF"/>
          </svg>
        </div>
        <div class="relative z-10 flex-grow">
          <h3 class="font-display text-base font-bold text-on-surface mb-1">Discord Server</h3>
          <p class="font-body text-xs text-on-surface-variant/70 font-light">Join live dev chats, get early access, and hang out with the community.</p>
        </div>
        <span class="relative z-10 flex-shrink-0 text-[#5865F2] font-display text-[10px] font-bold uppercase tracking-wider group-hover:translate-x-1 transition-transform duration-300">Join →</span>
      </a>
      <a href="https://www.reddit.com/r/NetNoGamesCommunity/" target="_blank" class="group relative overflow-hidden border border-[#FF4500]/20 p-8 flex items-center gap-6 transition-all duration-300 hover:border-[#FF4500]/50 hover:shadow-[0_0_30px_rgba(255,69,0,0.1)]" style="background-color: var(--surface-dim);">
        <div class="absolute -top-16 -right-16 w-40 h-40 bg-[#FF4500]/8 rounded-full blur-[50px] pointer-events-none transition-all duration-500 group-hover:bg-[#FF4500]/15"></div>
        <div class="relative z-10 flex-shrink-0 w-14 h-14 rounded-xl bg-[#FF4500]/15 border border-[#FF4500]/20 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
          <svg class="w-7 h-7" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="256" cy="256" r="256" fill="#FF4500"/>
            <path d="M458 256c0-21.5-17.5-39-39-39-10.6 0-20.2 4.2-27.2 11-27.5-19.5-65.2-32-107.3-33.5l18.5-87.5 61 14.3c0 17.7 14.3 32 32 32s32-14.3 32-32-14.3-32-32-32c-12.5 0-23.3 7.2-28.7 17.7L301 117c-3.2-0.5-6.5-1-9.7-1.5l18.5-87.5 61 14.3c0 17.7 14.3 32 32 32s32-14.3 32-32-14.3-32-32-32c-12.5 0-23.3 7.2-28.7 17.7l-22.8-5.3C353.5 9.5 362 9.5 366 9.5c11 0 20 7.5 22.8 17.5 1.8 6.5 0.7 13.2-2 19-1 2.3-2.3 4.5-3.7 6.5C396.5 57 419 82 419 112.5c0 17.7 14.3 32 32 32s32-14.3 32-32c0-37.3-28.5-68-64.5-71.7C318.5 5.5 318.3 3.7 318.3 2c0-23.3-19-42.3-42.3-42.3-15 0-28 8-35.3 19.8C327 30.3 308 24 287.5 24c-47 0-87.5 31-100.5 74.5-13.5-2-27-3.5-41-3.5-53 0-99.5 26.5-125 67C13.5 170 0 195 0 223.5c0 17.7 14.3 32 32 32h6c1.5 27.5 10 53 24 75.5-2 6-3 12.5-3 19 0 53 64 96 143 96s143-43 143-96c0-6.5-1-13-3-19 14-22.5 22.5-48 24-75.5h6c17.7 0 32-14.3 32-32 0-28.5-13.5-53.5-35-71.5zM183 303c-17.7 0-32-14.3-32-32s14.3-32 32-32 32 14.3 32 32-14.3 32-32 32zm189 128c-26.5 26.5-78 28.5-98 28.5s-71.5-2-98-28.5c-3-3-3-7.8 0-10.8s7.8-3 10.8 0c22 22 64 24 87.2 24s65.2-2 87.2-24c3-3 7.8-3 10.8 0s3 7.8 0 10.8zM331 303c-17.7 0-32-14.3-32-32s14.3-32 32-32 32 14.3 32 32-14.3 32-32 32z" fill="white"/>
          </svg>
        </div>
        <div class="relative z-10 flex-grow">
          <h3 class="font-display text-base font-bold text-on-surface mb-1">Subreddit</h3>
          <p class="font-body text-xs text-on-surface-variant/70 font-light">Explore fan theories, gameplay clips, and dive deep into the lore.</p>
        </div>
        <span class="relative z-10 flex-shrink-0 text-[#FF4500] font-display text-[10px] font-bold uppercase tracking-wider group-hover:translate-x-1 transition-transform duration-300">Visit →</span>
      </a>
    </div>
  </div>
</section>
<section class="w-full py-20 relative" style="background-color: var(--surface-dim);">
  <div class="absolute left-0 top-0 w-full h-px bg-gradient-to-r from-transparent via-outline-variant/20 to-transparent"></div>
  <div class="max-w-screen-2xl mx-auto px-margin-mobile md:px-margin-desktop">
    <div class="flex flex-col mb-12">
      <div class="inline-flex items-center gap-3 mb-3">
        <div class="w-8 h-px bg-primary-color"></div>
        <span class="text-primary-color font-display font-semibold tracking-[0.2em] text-[10px] uppercase">The Architects</span>
      </div>
      <h2 class="font-display text-3xl md:text-5xl font-bold text-on-surface">Meet the Team</h2>
      <p class="font-body text-sm text-on-surface-variant max-w-2xl mt-3 leading-relaxed font-light">
        The minds behind the Verdant Matrix. Each member shapes the digital ecosystems of NetNo Games.
      </p>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" id="team-container"></div>
  </div>
</section>`;
      },
      async init() {
        const container = document.getElementById("featured-games-container");
        if (!container) return;
        const games = (await window.db.getGames()).filter(g => g.visibility === 'Public');
        container.innerHTML = "";
        if (games.length === 0) {
          container.innerHTML = `<div class="col-span-3 text-center py-12 text-on-surface-variant">No games found.</div>`;
          return;
        }
        games.slice(0, 3).forEach(g => {
          const card = document.createElement("article");
          card.className = "corner-bracket bg-surface border border-outline-variant/20 overflow-hidden group hover:border-primary-color/30 transition-all duration-500 relative flex flex-col h-full";
          card.style.backgroundColor = "var(--surface-color)";
          const priceLabel = g.priceType === 'Free' ? 'FREE' : `₹${g.price}`;
          card.innerHTML = `
            <div class="absolute top-0 left-0 w-full h-px bg-primary-color scale-x-0 group-hover:scale-x-100 transition-transform origin-left z-10"></div>
            <div class="h-56 overflow-hidden relative bg-black/40">
              <img src="${g.thumbnail || 'https://via.placeholder.com/600x400'}" alt="${g.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-70 group-hover:opacity-100"/>
              <div class="absolute top-3 right-3 bg-background/80 border border-outline-variant/50 text-primary-color font-display text-[10px] font-bold px-2.5 py-1 uppercase tracking-wider backdrop-blur-sm">${g.genre.split('/')[0].trim()}</div>
            </div>
            <div class="p-6 flex flex-col flex-grow">
              <div class="flex items-center justify-between mb-3">
                <span class="text-secondary-color font-display text-[10px] font-bold uppercase tracking-[0.15em]">${g.theme.split('/')[0].trim()}</span>
                <span class="text-primary-color font-display text-xs font-bold bg-primary-color/10 px-2 py-0.5">${priceLabel}</span>
              </div>
              <h3 class="font-display text-xl font-bold text-on-surface group-hover:text-primary-color transition-colors duration-300 mb-3">${g.title}</h3>
              <p class="font-body text-sm text-on-surface-variant line-clamp-3 mb-6 flex-grow leading-relaxed font-light">${g.desc}</p>
              <a href="game-detail.html?id=${g.id}" class="btn-glow-primary w-full py-3 bg-surface-bright/40 text-on-surface border border-outline-variant/30 font-display text-xs font-semibold uppercase text-center transition-all duration-300 group-hover:bg-primary-color group-hover:text-on-primary group-hover:border-primary-color">View Details →</a>
            </div>
          `;
          container.appendChild(card);
        });
        if (typeof renderTeamSection === 'function') renderTeamSection("team-container");
      }
    },



    community: {
      title: () => 'NetNo Games | Community Feed',
      render() {
        return `
<header class="mb-10 text-center md:text-left">
  <div class="inline-flex items-center gap-3 mb-3">
    <div class="w-8 h-px bg-primary-color"></div>
    <span class="text-primary-color font-display font-semibold tracking-[0.2em] text-[10px] uppercase">Ecosystem Broadcast</span>
  </div>
  <h1 class="font-display text-3xl md:text-5xl font-bold text-on-surface">The Nexus Grid</h1>
  <p class="font-body text-sm text-on-surface-variant max-w-2xl mt-3 leading-relaxed font-light">Connect with the community, share theories, and stay updated on everything NetNo Games.</p>
</header>
<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
  <a href="https://discord.gg/PTbxu9nPZq" target="_blank" class="group relative overflow-hidden rounded-xl border border-[#5865F2]/30 bg-surface p-8 flex flex-col items-center text-center gap-5 transition-all duration-300 hover:border-[#5865F2]/60 hover:shadow-[0_0_30px_rgba(88,101,242,0.15)]" style="background-color: var(--surface-color);">
    <div class="absolute -top-16 -right-16 w-48 h-48 bg-[#5865F2]/8 rounded-full blur-[60px] pointer-events-none transition-all duration-500 group-hover:bg-[#5865F2]/15 group-hover:blur-[80px]"></div>
    <div class="relative z-10 w-20 h-20 rounded-2xl bg-[#5865F2]/15 border border-[#5865F2]/25 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
      <svg class="w-10 h-10" viewBox="0 0 71 55" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M60.1045 4.8978C55.5792 2.8214 50.7265 1.2916 45.6527 0.41542C45.5604 0.39851 45.468 0.440769 45.4204 0.525289C44.7963 1.6353 44.105 3.0834 43.6209 4.2216C38.1637 3.4046 32.7345 3.4046 27.3892 4.2216C26.905 3.0581 26.1886 1.6353 25.5617 0.525289C25.5141 0.443589 25.4218 0.40133 25.3294 0.41542C20.2584 1.2888 15.4057 2.8186 10.8776 4.8978C10.8384 4.9147 10.8048 4.9429 10.7825 4.9795C1.57795 18.7309 -0.143566 32.1443 0.231857 45.3914C0.246925 45.4562 0.292297 45.5182 0.354067 45.5471C6.45801 50.0588 12.3413 52.7847 18.1147 54.6471C18.2071 54.6713 18.3023 54.6386 18.3633 54.5719C19.7743 52.6396 21.0358 50.6237 22.1337 48.4531C22.2145 48.2932 22.1488 48.1013 21.989 48.0211C19.6306 47.0811 17.3864 45.8386 15.3009 44.3281C15.1489 44.2172 15.1367 44.0089 15.2762 43.8752C15.7712 43.3929 16.2664 42.8731 16.7392 42.3347C16.8112 42.2503 16.9344 42.2159 17.0452 42.2438C29.1332 47.8478 41.8985 47.8478 53.8958 42.2438C54.0078 42.2131 54.1326 42.2475 54.2046 42.3319C54.6774 42.8703 55.1726 43.3929 55.6654 43.8752C55.8062 44.0089 55.7968 44.2172 55.6421 44.3281C53.5566 45.8358 51.3124 47.0811 48.9566 48.0183C48.7968 48.1013 48.7338 48.2932 48.8134 48.4531C49.9522 50.6209 51.2138 52.6368 52.6218 54.5691C52.6828 54.6358 52.7794 54.6685 52.8704 54.6443C58.6629 52.7819 64.5461 50.056 70.6421 45.5499C70.7065 45.521 70.7506 45.4562 70.7644 45.3914C71.2257 30.1757 68.9647 16.8151 60.1045 4.8978C60.0767 4.88104 60.0489 4.86769 60.021 4.85769L60.1045 4.8978ZM23.7259 37.3253C20.2276 37.3253 17.3451 34.1136 17.3451 30.1693C17.3451 26.225 20.1717 23.0133 23.7259 23.0133C27.308 23.0133 30.1626 26.2532 30.1096 30.1693C30.1096 34.1136 27.28 37.3253 23.7259 37.3253ZM47.3178 37.3253C43.8196 37.3253 40.9371 34.1136 40.9371 30.1693C40.9371 26.225 43.7636 23.0133 47.3178 23.0133C50.9 23.0133 53.7545 26.2532 53.7015 30.1693C53.7015 34.1136 50.8973 37.3253 47.3178 37.3253Z" fill="#FFFFFF"/>
      </svg>
    </div>
    <div class="relative z-10 space-y-2">
      <h2 class="font-display text-xl font-bold text-on-surface">Discord Server</h2>
      <p class="font-body text-sm text-on-surface-variant leading-relaxed max-w-sm">Join live developer voice chats, discuss theories, get early access announcements, and hang out with the community.</p>
    </div>
    <span class="relative z-10 inline-flex items-center gap-2 px-6 py-3 bg-[#5865F2] text-white font-display font-bold uppercase tracking-wider text-xs rounded-lg transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(88,101,242,0.4)]">
      Join Server
      <svg class="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"/></svg>
    </span>
  </a>
  <a href="https://www.reddit.com/r/NetNoGamesCommunity/" target="_blank" class="group relative overflow-hidden rounded-xl border border-[#FF4500]/30 bg-surface p-8 flex flex-col items-center text-center gap-5 transition-all duration-300 hover:border-[#FF4500]/60 hover:shadow-[0_0_30px_rgba(255,69,0,0.15)]" style="background-color: var(--surface-color);">
    <div class="absolute -top-16 -right-16 w-48 h-48 bg-[#FF4500]/8 rounded-full blur-[60px] pointer-events-none transition-all duration-500 group-hover:bg-[#FF4500]/15 group-hover:blur-[80px]"></div>
    <div class="relative z-10 w-20 h-20 rounded-2xl bg-[#FF4500]/15 border border-[#FF4500]/25 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
      <svg class="w-10 h-10" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="256" cy="256" r="256" fill="#FF4500"/>
        <path d="M458 256c0-21.5-17.5-39-39-39-10.6 0-20.2 4.2-27.2 11-27.5-19.5-65.2-32-107.3-33.5l18.5-87.5 61 14.3c0 17.7 14.3 32 32 32s32-14.3 32-32-14.3-32-32-32c-12.5 0-23.3 7.2-28.7 17.7L301 117c-3.2-0.5-6.5-1-9.7-1.5l18.5-87.5 61 14.3c0 17.7 14.3 32 32 32s32-14.3 32-32-14.3-32-32-32c-12.5 0-23.3 7.2-28.7 17.7l-22.8-5.3C353.5 9.5 362 9.5 366 9.5c11 0 20 7.5 22.8 17.5 1.8 6.5 0.7 13.2-2 19-1 2.3-2.3 4.5-3.7 6.5C396.5 57 419 82 419 112.5c0 17.7 14.3 32 32 32s32-14.3 32-32c0-37.3-28.5-68-64.5-71.7 0.3-0.8 0.5-1.7 0.5-2.5 0-23.3-19-42.3-42.3-42.3-15 0-28 8-35.3 19.8C327 30.3 308 24 287.5 24c-47 0-87.5 31-100.5 74.5-13.5-2-27-3.5-41-3.5-53 0-99.5 26.5-125 67C13.5 170 0 195 0 223.5c0 17.7 14.3 32 32 32h6c1.5 27.5 10 53 24 75.5-2 6-3 12.5-3 19 0 53 64 96 143 96s143-43 143-96c0-6.5-1-13-3-19 14-22.5 22.5-48 24-75.5h6c17.7 0 32-14.3 32-32 0-28.5-13.5-53.5-35-71.5zM183 303c-17.7 0-32-14.3-32-32s14.3-32 32-32 32 14.3 32 32-14.3 32-32 32zm189 128c-26.5 26.5-78 28.5-98 28.5s-71.5-2-98-28.5c-3-3-3-7.8 0-10.8s7.8-3 10.8 0c22 22 64 24 87.2 24s65.2-2 87.2-24c3-3 7.8-3 10.8 0s3 7.8 0 10.8zM331 303c-17.7 0-32-14.3-32-32s14.3-32 32-32 32 14.3 32 32-14.3 32-32 32z" fill="white"/>
      </svg>
    </div>
    <div class="relative z-10 space-y-2">
      <h2 class="font-display text-xl font-bold text-on-surface">Subreddit</h2>
      <p class="font-body text-sm text-on-surface-variant leading-relaxed max-w-sm">Explore fan theories, share gameplay clips, post memes, and dive deep into the lore of every NetNo title.</p>
    </div>
    <span class="relative z-10 inline-flex items-center gap-2 px-6 py-3 bg-[#FF4500] text-white font-display font-bold uppercase tracking-wider text-xs rounded-lg transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(255,69,0,0.4)]">
      Visit Subreddit
      <svg class="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"/></svg>
    </span>
  </a>
</div>
<section class="w-full">
  <div class="flex flex-col mb-8">
    <span class="text-secondary-color font-display font-semibold tracking-wider text-xs uppercase">The Architects</span>
    <h2 class="font-display text-2xl md:text-3xl font-bold text-primary-color text-glow mt-1">Meet the Team</h2>
    <p class="font-body text-sm text-on-surface-variant max-w-2xl mt-2 leading-relaxed">The minds behind the Verdant Matrix. Each member shapes the digital ecosystems of NetNo Games.</p>
  </div>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" id="team-container"></div>
</section>
<section class="w-full mt-16">
  <div class="flex flex-col mb-8">
    <span class="text-secondary-color font-display font-semibold tracking-wider text-xs uppercase">Latest Transmissions</span>
    <h2 class="font-display text-2xl md:text-3xl font-bold text-primary-color text-glow mt-1">Announcements</h2>
  </div>
  <div class="relative group/scroll">
    <div class="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none"></div>
    <div class="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none"></div>
    <div id="announcements-scroll" class="flex gap-5 overflow-x-auto pb-4 no-scrollbar scroll-smooth snap-x snap-mandatory pl-14 pr-4">
      <div class="snap-start flex-shrink-0 w-[300px] md:w-[340px] bg-surface border border-outline-variant/30 rounded-xl overflow-hidden hover:border-primary-color/40 transition-all duration-300 group" style="background-color: var(--surface-color);">
        <div class="h-44 overflow-hidden relative">
          <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAGE1kwlDlDuhR8xdGKyVJ7f0HBtNnBLxRvRS5OH2EWH5WgcDlvS4KD2WggjVU0WoB7um1enm4H8t2vf8NeuIqCguz6XcHlOfavDMRnhXRkDQM8TFIr4Iil5zSuRXVZ8D1tmjlQklcbZ6JYa4e8MqiKAc5EMirjA3pWavThwcukaadjx5GdDEbmLygbUR_D0Hg2rEAICmFsoJ3p2409OMtq_5KB7oPZzGFj8UrYKgs_bO7zJxTgGyxCEjWgzKzUbfWlJvQRCL8enXM" alt="Announcement" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"/>
          <div class="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent" style="background-color: var(--surface-color);"></div>
          <span class="absolute top-3 left-3 bg-primary-color/90 text-on-primary font-display text-[9px] font-bold px-2.5 py-1 rounded uppercase tracking-wider">New Update</span>
        </div>
        <div class="p-5 space-y-3">
          <span class="text-[10px] text-on-surface-variant/60 font-body">May 28, 2026</span>
          <h3 class="font-display text-base font-bold text-on-surface leading-snug">Abyssal Cord v1.1 Patch Notes</h3>
          <p class="font-body text-xs text-on-surface-variant leading-relaxed line-clamp-3">Performance improvements, new sonar HUD calibrations, and expanded deep-sea anomaly encounters. Full patch notes inside.</p>
          <a href="#" class="inline-flex items-center gap-1.5 text-primary-color font-display text-[10px] font-bold uppercase tracking-wider hover:gap-2.5 transition-all">Read More <span class="material-symbols-outlined text-[14px]">arrow_forward</span></a>
        </div>
      </div>
      <div class="snap-start flex-shrink-0 w-[300px] md:w-[340px] bg-surface border border-outline-variant/30 rounded-xl overflow-hidden hover:border-primary-color/40 transition-all duration-300 group" style="background-color: var(--surface-color);">
        <div class="h-44 overflow-hidden relative">
          <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuApRwJ0k-Prs0v2pht90FfAMuLyIYeLVbaOT-pZeVtUeyVaV89lxy6dlkytOFbpP20UzyGSYwFTDFtPDnw7RW1bux9M3QyqiSSlYiZxXNaGC51k6doUdE3mw4FyBRUrsLg0zIiaMNV7IMPcjZdg_l8No2JLJBpmZDBT5hF9eXS50Dl24jBR19R6G6NV9AS1v02O9AacybFppY69hPNSn-5aANbzSvGI77wFl_MimoMMydXdPYdEG80d0EosvssOMJRGMbv76RXfwMQ" alt="Announcement" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"/>
          <div class="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent" style="background-color: var(--surface-color);"></div>
          <span class="absolute top-3 left-3 bg-secondary-color/90 text-on-secondary font-display text-[9px] font-bold px-2.5 py-1 rounded uppercase tracking-wider">Coming Soon</span>
        </div>
        <div class="p-5 space-y-3">
          <span class="text-[10px] text-on-surface-variant/60 font-body">May 22, 2026</span>
          <h3 class="font-display text-base font-bold text-on-surface leading-snug">Verdant Node Full Release Date Announced</h3>
          <p class="font-body text-xs text-on-surface-variant leading-relaxed line-clamp-3">The corrupted server farm opens its gates next month. Wishlist now and get exclusive launch cosmetics.</p>
          <a href="#" class="inline-flex items-center gap-1.5 text-primary-color font-display text-[10px] font-bold uppercase tracking-wider hover:gap-2.5 transition-all">Read More <span class="material-symbols-outlined text-[14px]">arrow_forward</span></a>
        </div>
      </div>
      <div class="snap-start flex-shrink-0 w-[300px] md:w-[340px] bg-surface border border-outline-variant/30 rounded-xl overflow-hidden hover:border-primary-color/40 transition-all duration-300 group" style="background-color: var(--surface-color);">
        <div class="h-44 overflow-hidden relative">
          <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDYqgxMMfP2it-NJjPdvzKOkGxd4E-LGBukX3Na9srhIy37fvu5BGjFZPSHdkvTvOpDGgwXkrvY7mY7YPC564vVs74IaAFrYnx6NVps1Yyx1yUZc_619TeZfbpaTKdDzdPQiXrvdklgxndVNhvv_EmR52TdscVlxg0PEX7jzSjBzaIGe1r03Q-6rTQqLi9gue6iKphFqst5Y16g3TBIxrHS2Ce0-tPYGiH0614Cn_1cKqHIKYiMJj-lUxShFPMyAUrg_QMm2hIwaVA" alt="Announcement" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"/>
          <div class="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent" style="background-color: var(--surface-color);"></div>
          <span class="absolute top-3 left-3 bg-primary-color/90 text-on-primary font-display text-[9px] font-bold px-2.5 py-1 rounded uppercase tracking-wider">Event</span>
        </div>
        <div class="p-5 space-y-3">
          <span class="text-[10px] text-on-surface-variant/60 font-body">May 18, 2026</span>
          <h3 class="font-display text-base font-bold text-on-surface leading-snug">Community Playtest Weekend #3</h3>
          <p class="font-body text-xs text-on-surface-variant leading-relaxed line-clamp-3">Join us for another weekend playtest session. Early access builds, dev Q&A, and exclusive behind-the-scenes content.</p>
          <a href="#" class="inline-flex items-center gap-1.5 text-primary-color font-display text-[10px] font-bold uppercase tracking-wider hover:gap-2.5 transition-all">Read More <span class="material-symbols-outlined text-[14px]">arrow_forward</span></a>
        </div>
      </div>
      <div class="snap-start flex-shrink-0 w-[300px] md:w-[340px] bg-surface border border-outline-variant/30 rounded-xl overflow-hidden hover:border-primary-color/40 transition-all duration-300 group" style="background-color: var(--surface-color);">
        <div class="h-44 overflow-hidden relative">
          <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCk8J14iBcY3E0xN5_xVxXdbmaVxmK27sHS5veeVa9dXn7Naq8SSH-q1rHFl9f2D14sADSKYOFY-wdQ0QQ1Cui7WlqhtnDKnuUg6N7AoVEtE0DzoRCB3NfraEAO3frAhE9MkzzM5likVw5Wj0NEGQzCcjcY8lnsoghXMAYbdwKlIHtrSGPKOzzu9KGd1bWIuVhgXpzqRaWZ5jtS9jfSGMn5jPUIuDqZK0QsQHlhoQef_1IeWlycZiqslG87mY_wB61SVu0AC6MyBF8" alt="Announcement" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"/>
          <div class="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent" style="background-color: var(--surface-color);"></div>
          <span class="absolute top-3 left-3 bg-secondary-color/90 text-on-secondary font-display text-[9px] font-bold px-2.5 py-1 rounded uppercase tracking-wider">Milestone</span>
        </div>
        <div class="p-5 space-y-3">
          <span class="text-[10px] text-on-surface-variant/60 font-body">May 10, 2026</span>
          <h3 class="font-display text-base font-bold text-on-surface leading-snug">1,000 Downloads Milestone Reached</h3>
          <p class="font-body text-xs text-on-surface-variant leading-relaxed line-clamp-3">A huge thank you to every player who has explored our worlds. We're just getting started — the Verdant Matrix awaits.</p>
          <a href="#" class="inline-flex items-center gap-1.5 text-primary-color font-display text-[10px] font-bold uppercase tracking-wider hover:gap-2.5 transition-all">Read More <span class="material-symbols-outlined text-[14px]">arrow_forward</span></a>
        </div>
      </div>
    </div>
  </div>
</section>`;
      },
      init() {
        if (typeof renderTeamSection === 'function') renderTeamSection("team-container");
      }
    },

    support: {
      title: () => 'NetNo Games | Support Desk',
      render() {
        return `
<header class="mb-10 text-center md:text-left">
  <div class="inline-flex items-center gap-3 mb-3">
    <div class="w-8 h-px bg-primary-color"></div>
    <span class="text-primary-color font-display font-semibold tracking-[0.2em] text-[10px] uppercase">Ecosystem Diagnostics</span>
  </div>
  <h1 class="font-display text-3xl md:text-5xl font-bold text-on-surface">Support Protocols</h1>
  <p class="font-body text-sm text-on-surface-variant max-w-2xl mt-3 leading-relaxed font-light">Check our FAQs, connect with the dev team on Discord for instant help, or submit a support ticket below.</p>
</header>
<div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
  <div class="lg:col-span-2 space-y-6">
    <div class="bg-surface border border-outline-variant/30 p-6 rounded-lg" style="background-color: var(--surface-color);">
      <h2 class="font-display text-lg font-bold text-on-surface uppercase tracking-wider mb-6 pb-2 border-b border-outline-variant/30">Frequently Consulted Protocols (FAQs)</h2>
      <div class="divide-y divide-outline-variant/20 space-y-4">
        <div class="pt-4 first:pt-0">
          <button onclick="toggleAccordion(this)" class="faq-trigger flex justify-between items-center w-full text-left font-display text-sm font-semibold text-on-surface hover:text-primary-color transition-colors py-2" aria-expanded="false">
            <span>How do I launch the NetNo Games on a local server?</span>
            <span class="material-symbols-outlined faq-icon transition-transform duration-300">expand_more</span>
          </button>
          <div class="faq-content transition-all duration-300">
            <p class="font-body text-xs text-on-surface-variant leading-relaxed py-3 pl-1">Ensure you possess the compiled assets folder structure. Launch a static HTTP hosting tool (such as Python \`http.server\`, \`npx serve\`, or Live Server plugin inside VS Code) from the project directory. Double-clicking raw HTML sheets directly in a web explorer might cause security limitations during script runs.</p>
          </div>
        </div>
        <div class="pt-4">
          <button onclick="toggleAccordion(this)" class="faq-trigger flex justify-between items-center w-full text-left font-display text-sm font-semibold text-on-surface hover:text-primary-color transition-colors py-2" aria-expanded="false">
            <span>Are my published game edits permanent without Firebase?</span>
            <span class="material-symbols-outlined faq-icon transition-transform duration-300">expand_more</span>
          </button>
          <div class="faq-content transition-all duration-300">
            <p class="font-body text-xs text-on-surface-variant leading-relaxed py-3 pl-1">Yes, but only in this specific browser and terminal context. All games created, review entries logged, and dashboard settings are saved locally into your explorer's localStorage memory database. Clearing your browser cache or opening in Private / Incognito layout will reset the database records to default indices.</p>
          </div>
        </div>
        <div class="pt-4">
          <button onclick="toggleAccordion(this)" class="faq-trigger flex justify-between items-center w-full text-left font-display text-sm font-semibold text-on-surface hover:text-primary-color transition-colors py-2" aria-expanded="false">
            <span>Can I upload raw video files for game trailers?</span>
            <span class="material-symbols-outlined faq-icon transition-transform duration-300">expand_more</span>
          </button>
          <div class="faq-content transition-all duration-300">
            <p class="font-body text-xs text-on-surface-variant leading-relaxed py-3 pl-1">To keep storage size constraints optimal, the portal accepts links for trailers (such as a YouTube embed link like https://www.youtube.com/embed/dQw4w9WgXcQ). Screenshots and thumbnails are processed as raw image streams and written into local databases using Base64 compression structures.</p>
          </div>
        </div>
        <div class="pt-4">
          <button onclick="toggleAccordion(this)" class="faq-trigger flex justify-between items-center w-full text-left font-display text-sm font-semibold text-on-surface hover:text-primary-color transition-colors py-2" aria-expanded="false">
            <span>Where can I review submitted support ticket queries?</span>
            <span class="material-symbols-outlined faq-icon transition-transform duration-300">expand_more</span>
          </button>
          <div class="faq-content transition-all duration-300">
            <p class="font-body text-xs text-on-surface-variant leading-relaxed py-3 pl-1">Any feedback submitted via the Contact Form is saved directly to local storage queries. Head over to the Developer Portal, input credentials, and check the "Client Queries" subpanel inside the Developer dashboard to see them.</p>
          </div>
        </div>
        <div class="pt-4">
          <button onclick="toggleAccordion(this)" class="faq-trigger flex justify-between items-center w-full text-left font-display text-sm font-semibold text-on-surface hover:text-primary-color transition-colors py-2" aria-expanded="false">
            <span>Can I get help directly from the dev team?</span>
            <span class="material-symbols-outlined faq-icon transition-transform duration-300">expand_more</span>
          </button>
          <div class="faq-content transition-all duration-300">
            <p class="font-body text-xs text-on-surface-variant leading-relaxed py-3 pl-1">Absolutely! Join our <a href="https://discord.gg/PTbxu9nPZq" target="_blank" class="text-[#5865F2] font-semibold hover:underline">Discord server</a> to chat directly with developers and the community. We're online daily and happy to help with any questions, bugs, or feedback — it's the fastest way to get support.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="space-y-6">
    <a href="https://discord.gg/PTbxu9nPZq" target="_blank" class="group relative block overflow-hidden rounded-xl border border-[#5865F2]/30 p-6 text-center gap-4 transition-all duration-300 hover:border-[#5865F2]/60 hover:shadow-[0_0_25px_rgba(88,101,242,0.12)]" style="background-color: var(--surface-color);">
      <div class="absolute -top-12 -right-12 w-32 h-32 bg-[#5865F2]/10 rounded-full blur-[50px] pointer-events-none transition-all duration-500 group-hover:bg-[#5865F2]/20 group-hover:blur-[60px]"></div>
      <div class="relative z-10 flex flex-col items-center gap-3">
        <div class="w-14 h-14 rounded-xl bg-[#5865F2]/15 border border-[#5865F2]/25 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
          <svg class="w-7 h-7" viewBox="0 0 71 55" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M60.1045 4.8978C55.5792 2.8214 50.7265 1.2916 45.6527 0.41542C45.5604 0.39851 45.468 0.440769 45.4204 0.525289C44.7963 1.6353 44.105 3.0834 43.6209 4.2216C38.1637 3.4046 32.7345 3.4046 27.3892 4.2216C26.905 3.0581 26.1886 1.6353 25.5617 0.525289C25.5141 0.443589 25.4218 0.40133 25.3294 0.41542C20.2584 1.2888 15.4057 2.8186 10.8776 4.8978C10.8384 4.9147 10.8048 4.9429 10.7825 4.9795C1.57795 18.7309 -0.143566 32.1443 0.231857 45.3914C0.246925 45.4562 0.292297 45.5182 0.354067 45.5471C6.45801 50.0588 12.3413 52.7847 18.1147 54.6471C18.2071 54.6713 18.3023 54.6386 18.3633 54.5719C19.7743 52.6396 21.0358 50.6237 22.1337 48.4531C22.2145 48.2932 22.1488 48.1013 21.989 48.0211C19.6306 47.0811 17.3864 45.8386 15.3009 44.3281C15.1489 44.2172 15.1367 44.0089 15.2762 43.8752C15.7712 43.3929 16.2664 42.8731 16.7392 42.3347C16.8112 42.2503 16.9344 42.2159 17.0452 42.2438C29.1332 47.8478 41.8985 47.8478 53.8958 42.2438C54.0078 42.2131 54.1326 42.2475 54.2046 42.3319C54.6774 42.8703 55.1726 43.3929 55.6654 43.8752C55.8062 44.0089 55.7968 44.2172 55.6421 44.3281C53.5566 45.8358 51.3124 47.0811 48.9566 48.0183C48.7968 48.1013 48.7338 48.2932 48.8134 48.4531C49.9522 50.6209 51.2138 52.6368 52.6218 54.5691C52.6828 54.6358 52.7794 54.6685 52.8704 54.6443C58.6629 52.7819 64.5461 50.056 70.6421 45.5499C70.7065 45.521 70.7506 45.4562 70.7644 45.3914C71.2257 30.1757 68.9647 16.8151 60.1045 4.8978C60.0767 4.88104 60.0489 4.86769 60.021 4.85769L60.1045 4.8978ZM23.7259 37.3253C20.2276 37.3253 17.3451 34.1136 17.3451 30.1693C17.3451 26.225 20.1717 23.0133 23.7259 23.0133C27.308 23.0133 30.1626 26.2532 30.1096 30.1693C30.1096 34.1136 27.28 37.3253 23.7259 37.3253ZM47.3178 37.3253C43.8196 37.3253 40.9371 34.1136 40.9371 30.1693C40.9371 26.225 43.7636 23.0133 47.3178 23.0133C50.9 23.0133 53.7545 26.2532 53.7015 30.1693C53.7015 34.1136 50.8973 37.3253 47.3178 37.3253Z" fill="#FFFFFF"/>
          </svg>
        </div>
        <div class="space-y-1">
          <h3 class="font-display text-sm font-bold text-on-surface">Talk to the Dev Team</h3>
          <p class="font-body text-xs text-on-surface-variant leading-relaxed">Need help fast? Connect directly with our developers and community on Discord. We're online daily.</p>
        </div>
        <span class="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#5865F2] text-white font-display font-bold uppercase tracking-wider text-[10px] rounded-lg transition-all duration-300 group-hover:shadow-[0_0_15px_rgba(88,101,242,0.4)]">
          Join Discord
          <svg class="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"/></svg>
        </span>
      </div>
    </a>
    <div class="bg-surface border border-outline-variant/30 p-6 rounded-lg" style="background-color: var(--surface-color);">
      <h2 class="font-display text-base font-bold text-on-surface uppercase tracking-wider pb-2 border-b border-outline-variant/30 mb-4">Create Support Ticket</h2>
      <form id="support-form" onsubmit="submitSupportTicket(event)" class="space-y-4">
        <div><label class="block text-[10px] text-on-surface-variant font-bold uppercase mb-1.5">Your Email Node</label><input type="email" id="sup-email" required class="w-full bg-background border border-outline-variant/40 rounded px-3 py-2.5 text-xs custom-input" placeholder="e.g. pilot@nexus.com"/></div>
        <div><label class="block text-[10px] text-on-surface-variant font-bold uppercase mb-1.5">Target Game Registry</label><select id="sup-game" class="w-full bg-background border border-outline-variant/40 rounded px-3 py-2.5 text-xs custom-input"><option value="General Ecosystem">General Ecosystem</option></select></div>
        <div><label class="block text-[10px] text-on-surface-variant font-bold uppercase mb-1.5">Subject Heading</label><input type="text" id="sup-subject" required class="w-full bg-background border border-outline-variant/40 rounded px-3 py-2.5 text-xs custom-input" placeholder="Summarize query status..."/></div>
        <div><label class="block text-[10px] text-on-surface-variant font-bold uppercase mb-1.5">Diagnostic Message</label><textarea id="sup-message" required rows="4" class="w-full bg-background border border-outline-variant/40 rounded px-3 py-2.5 text-xs custom-input resize-none" placeholder="Provide full details of technical blockages..."></textarea></div>
        <button type="submit" class="w-full py-3 bg-primary-color text-on-primary font-display font-bold uppercase tracking-wider text-xs rounded hover:bg-blue-400 hover:box-glow transition-all active:scale-95">Transmit Ticket Payload</button>
      </form>
    </div>
  </div>
</div>`;
      },
      init() {
        window.toggleAccordion = (btn) => {
          const isExpanded = btn.getAttribute("aria-expanded") === "true";
          btn.setAttribute("aria-expanded", !isExpanded);
        };

        window.submitSupportTicket = async (e) => {
          e.preventDefault();
          const email = document.getElementById("sup-email")?.value.trim();
          const game = document.getElementById("sup-game")?.value;
          const subject = document.getElementById("sup-subject")?.value.trim();
          const message = document.getElementById("sup-message")?.value.trim();
          if (!email || !subject || !message) return;
          await window.db.saveSupportQuery({ email, game, subject, message });
          window.toast("Support ticket payload successfully logged to database!", "success");
          document.getElementById("support-form")?.reset();
        };
      }
    }
  }
};
