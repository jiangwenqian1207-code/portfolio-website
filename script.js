(() => {
  const projects = window.PORTFOLIO_PROJECTS || [];
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const tag = (label) => `<span class="project-tag">${label}</span>`;
  const infoCard = ([title, body]) => `<article class="info-card"><h3>${title}</h3><p>${body.replace(/\n/g, "<br>")}</p></article>`;
  const posterStack = (assets, label = "POSTER") => `
    <div class="poster-stack artwork-stack" tabindex="0" role="button" aria-label="点击切换下一张海报">
      ${assets.slice(0, 3).map((src, index) => `<figure class="poster-card" data-order="${index}"><img src="${src}" alt="${label} ${String(index + 1).padStart(2, "0")}" draggable="false"></figure>`).join("")}
    </div>`;

  function phoneMockup([label, src, initial = 0], className = "") {
    return `<figure class="phone-mockup ${className}">
      <div class="phone-shell"><span class="dynamic-island"></span><div class="phone-screen" tabindex="0" data-initial-scroll="${initial}" aria-label="${label}，可在手机屏幕内上下滚动"><img src="${src}" alt="${label} 长图"></div><span class="phone-home"></span></div>
      <figcaption>${label}</figcaption>
    </figure>`;
  }

  function tabletMockup([label, src, initial = 0], className = "") {
    return `<figure class="tablet-mockup ${className}">
      <div class="tablet-shell"><span class="tablet-camera"></span><div class="tablet-screen" tabindex="0" data-initial-scroll="${initial}" aria-label="${label}，可在 iPad 屏幕内上下滚动"><img src="${src}" alt="${label} 长图"></div></div>
      <figcaption>${label}</figcaption>
    </figure>`;
  }

  function remainingDesigns(project) {
    if (!project.remaining?.length) return "";
    return `<section class="remaining-section remaining-${project.number} ${project.number === "02" ? "section-light" : "section-lavender"}"><h2 class="detail-heading reveal">REMAINING DESIGNS</h2><div class="remaining-grid">${project.remaining.map((src, index) => `<img src="${src}" alt="${project.title} remaining design ${index + 1}">`).join("")}</div></section>`;
  }

  function nextProject(project) {
    const index = projects.indexOf(project);
    const isLast = index === projects.length - 1;
    const next = projects[(index + 1) % projects.length];
    return `<a class="next-project" href="${isLast ? "./index.html#works" : `./${next.file}`}"><span>${isLast ? "END OF PROJECT / 05" : `NEXT PROJECT / ${next.number}`}</span><strong>${isLast ? "BACK TO SELECTED WORKS" : next.title}</strong><b>↗</b></a>`;
  }

  function mobileProjectDetail(project) {
    const screenPhones = project.screens.map((screen) => screen[3] === "tablet" ? tabletMockup(screen, "screen-tablet") : phoneMockup(screen)).join("");
    return `
      <section class="detail-hero section-dark">
        <a class="back-button" href="./index.html#works">← BACK TO WORKS</a>
        <p class="detail-intro">${project.intro}</p>
        <p class="detail-meta">${project.year}<br>${project.title}</p>
        <div class="detail-keywords left">${project.keywordsLeft.join("<br>")}</div>
        <div class="detail-keywords right">${project.keywordsRight.join("<br>")}</div>
        <div class="detail-background-title">${project.background}</div>
        ${project.heroDevice === "tablet" ? tabletMockup(project.heroScreen, "hero-tablet") : phoneMockup(project.heroScreen, "hero-phone")}
        <div class="detail-tag">${tag(project.type)}</div><strong class="detail-number">${project.number}</strong>
      </section>
      <section class="detail-overview section-light">
        <h2 class="detail-heading reveal">PROJECT OVERVIEW</h2>
        <div class="info-grid">${project.overview.map(infoCard).join("")}</div>
        <div class="tool-row">${project.tools.map(tag).join("")}</div>
      </section>
      <section class="screens-section section-dark">
        <h2 class="detail-heading reveal">SCREENS DISPLAY</h2>
        <p class="section-note">04 KEY FLOWS / HORIZONTAL DISPLAY / REPLACE SCREEN FRAMES</p>
        <div class="phone-track drag-scroll">${screenPhones}</div>
      </section>
      <section class="stack-section ${project.stackTheme === "light" ? "section-light" : "section-lavender"}">
        <div class="stack-copy"><h2 class="detail-heading reveal">POSTER STACK</h2><p>点击最上层海报循环浏览。每张卡片保留独立旋转、缩放和层级，过渡时长 420ms。</p><small>ARRAY ORDER · Z-INDEX · TRANSFORM · TRANSITION</small></div>
        ${posterStack(project.posters, "POSTER")}
      </section>
      ${remainingDesigns(project)}
      <section class="next-section section-dark">${nextProject(project)}</section>`;
  }

  function posterProjectDetail(project) {
    return `
      <section class="poster-hero section-lavender">
        <a class="back-button" href="./index.html#works">← BACK TO WORKS</a>
        <p class="detail-intro">${project.intro}</p><p class="detail-meta">${project.year}<br>${project.title}<br>${project.type}</p>
        <div class="poster-hero-title">GRAPHIC<br>POSTER</div>
        <figure class="hero-artwork"><img src="${project.cover}" alt="Graphic Poster 主视觉"></figure>
        <div class="detail-keywords left">POSTER DESIGN<br>TYPOGRAPHY<br>VISUAL EXPERIMENT</div>
        <div class="detail-tag">${tag("GRAPHIC POSTER")}</div><strong class="detail-number">04</strong>
      </section>
      <section class="poster-gallery section-light"><h2 class="detail-heading reveal">POSTER GALLERY</h2><p class="section-note">05 WORKS / STAGGERED EXHIBITION LAYOUT / REPLACE POSTER FRAMES</p><div class="staggered-posters">${project.posters.map((src, index) => `<figure><img src="${src}" alt="Poster ${index + 1}"></figure>`).join("")}</div></section>
      <section class="poster-description section-dark"><h2 class="detail-heading reveal">PROJECT DESCRIPTION</h2><div class="info-grid">${project.details.map(infoCard).join("")}</div><p class="description-footer">ART DIRECTION · TYPOGRAPHY · IMAGE MAKING · POST PRODUCTION</p></section>
      ${remainingDesigns(project)}
      <section class="next-section section-dark">${nextProject(project)}</section>`;
  }

  function videoBlock([title, meta, src]) {
    return `<article class="video-card"><header><h3>${title}</h3><p>${meta}</p></header><div class="video-media"><video src="${src}" preload="auto" playsinline></video><button class="video-play" type="button" aria-label="播放 ${title}">▶</button></div></article>`;
  }

  function modelingProjectDetail(project) {
    return `
      <section class="modeling-hero section-dark">
        <a class="back-button" href="./index.html#works">← BACK TO WORKS</a><p class="detail-intro">${project.intro}</p><p class="detail-meta">${project.year}<br>${project.title}<br>${project.type}</p>
        <div class="detail-background-title">${project.background}</div><figure class="modeling-artwork"><img src="${project.cover}" alt="3D Modeling 主视觉"></figure>
        <div class="detail-keywords left">AIGC<br>POSTER<br>MOTION<br>VISUAL EXPERIMENT</div><div class="detail-tag">${["C4D", "POSTER", "MOTION", "VISUAL EXPERIMENT"].map(tag).join("")}</div><strong class="detail-number">05</strong>
      </section>
      <section class="stack-section section-lavender"><div class="stack-copy"><h2 class="detail-heading reveal">POSTER STACK</h2><p>点击最上层海报：当前卡片轻微滑出并进入底层，下一张成为主视觉。</p><small>ARRAY ORDER · Z-INDEX · TRANSFORM · TRANSITION 420MS</small></div>${posterStack(project.posters, "POSTER")}</section>
      <section class="motion-section section-dark"><h2 class="detail-heading reveal">MOTION WORKS</h2><p class="section-note">02 FILMS / HTML5 VIDEO / LOCAL ASSETS</p><div class="video-grid">${project.videos.map(videoBlock).join("")}</div><div class="motion-statement">POSTER BECOMES FRAME.<br>FRAME BECOMES MOTION.</div></section>
      <section class="process-section section-light"><h2 class="detail-heading reveal">PROCESS / CONCEPT</h2><div class="process-grid">${project.process.map(([title, body]) => `<article><h3>${title}</h3><p>${body}</p><span></span></article>`).join("")}</div></section>
      <section class="next-section section-dark">${nextProject(project)}</section>`;
  }

  function renderDetail() {
    const root = $("#project-root");
    if (!root) return;
    const project = projects.find((item) => item.id === document.body.dataset.project);
    if (!project) return;
    if (project.id === "graphic-poster") root.innerHTML = posterProjectDetail(project);
    else if (project.id === "3d-modeling") root.innerHTML = modelingProjectDetail(project);
    else root.innerHTML = mobileProjectDetail(project);
  }

  function initLoading() {
    // Loading is an overlay: it never changes the Figma page proportions below it.
    const screen = $(".loading-screen");
    if (!screen) return;
    const fill = $(".loading-fill", screen);
    const percent = $(".loading-percent", screen);
    let value = 0;
    const timer = setInterval(() => {
      value = Math.min(100, value + Math.ceil((100 - value) * 0.12) + 1);
      fill.style.width = `${value}%`;
      percent.textContent = `LOADING ${value}%`;
      if (value === 100) {
        clearInterval(timer);
        setTimeout(() => { screen.classList.add("is-complete"); document.body.classList.add("is-loaded"); }, 220);
        setTimeout(() => screen.remove(), 950);
      }
    }, 45);
  }

  function initMenu() {
    const toggle = $(".menu-toggle");
    const header = $(".home-nav");
    if (!toggle || !header) return;
    toggle.addEventListener("click", () => {
      const open = header.classList.toggle("menu-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    $$("nav a", header).forEach((link) => link.addEventListener("click", () => header.classList.remove("menu-open")));
  }

  function initDragScroll() {
    // Pointer drag, trackpad and touch all operate on the existing horizontal strips.
    $$(".drag-scroll").forEach((track) => {
      let active = false, startX = 0, scrollLeft = 0, moved = false;
      track.addEventListener("pointerdown", (event) => { active = true; moved = false; startX = event.clientX; scrollLeft = track.scrollLeft; track.classList.add("is-dragging"); });
      track.addEventListener("pointermove", (event) => {
        if (!active) return;
        const distance = event.clientX - startX;
        if (!moved && Math.abs(distance) > 10) {
          moved = true;
          track.setPointerCapture(event.pointerId);
        }
        track.scrollLeft = scrollLeft - distance;
      });
      track.addEventListener("pointerup", () => { active = false; track.classList.remove("is-dragging"); });
      track.addEventListener("pointercancel", () => { active = false; track.classList.remove("is-dragging"); });
      track.addEventListener("click", (event) => {
        if (moved) { event.preventDefault(); moved = false; return; }
        const link = event.target.closest("a[href]");
        if (link && event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
          event.preventDefault();
          window.location.assign(link.href);
        }
      }, true);
      track.addEventListener("wheel", (event) => { if (Math.abs(event.deltaY) > Math.abs(event.deltaX) && track.scrollWidth > track.clientWidth) { event.preventDefault(); track.scrollLeft += event.deltaY; } }, { passive: false });
    });
  }

  function initDesktopScale() {
    // The source artwork is 1440px wide. Above that breakpoint, scale it as one
    // canvas so the new 1920px design keeps the exact original proportions.
    const canvas = document.body.dataset.page === "home" ? $("main") : $("#project-root");
    const header = $(".home-nav");
    if (!canvas) return;
    const apply = () => {
      const scale = window.innerWidth > 1440 ? window.innerWidth / 1440 : 1;
      if (scale > 1) {
        canvas.style.width = "1440px";
        canvas.style.zoom = String(scale);
        if (header) {
          header.style.width = "1312px";
          header.style.zoom = String(scale);
        }
      } else {
        canvas.style.width = "";
        canvas.style.zoom = "";
        if (header) {
          header.style.width = "";
          header.style.zoom = "";
        }
      }
    };
    apply();
    window.addEventListener("resize", apply, { passive: true });
  }

  function updateStack(stack) {
    $$(".poster-card", stack).forEach((card) => card.style.setProperty("--order", card.dataset.order));
  }

  function cycleStack(stack) {
    // The DOM order stays stable; data-order controls z-index/transform and rotates cyclically.
    if (stack.classList.contains("is-animating")) return;
    const cards = $$(".poster-card", stack);
    const top = cards.find((card) => Number(card.dataset.order) === 0);
    stack.classList.add("is-animating"); top.classList.add("is-exiting");
    setTimeout(() => {
      cards.forEach((card) => { const order = Number(card.dataset.order); card.dataset.order = String(order === 0 ? cards.length - 1 : order - 1); });
      top.classList.remove("is-exiting"); updateStack(stack);
      requestAnimationFrame(() => setTimeout(() => stack.classList.remove("is-animating"), 440));
    }, 260);
  }

  function initPosterStacks() {
    $$(".poster-stack").forEach((stack) => {
      $$(".poster-card", stack).forEach((card) => {
        const image = $("img", card);
        const preserveRatio = () => {
          if (!image?.naturalWidth || !image?.naturalHeight) return;
          const ratio = image.naturalWidth / image.naturalHeight;
          const maxHeight = 470;
          const maxWidth = 430;
          const width = Math.min(maxWidth, maxHeight * ratio);
          const height = width / ratio;
          card.style.width = `${width}px`;
          card.style.height = `${height}px`;
        };
        image?.complete ? preserveRatio() : image?.addEventListener("load", preserveRatio, { once: true });
      });
      updateStack(stack);
      stack.addEventListener("click", () => cycleStack(stack));
      stack.addEventListener("keydown", (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); cycleStack(stack); } });
    });
  }

  function initVideos() {
    // Custom play control delegates playback to the local HTML5 video element.
    $$(".video-card").forEach((card) => {
      const video = $("video", card); const button = $(".video-play", card);
      const toggle = () => video.paused ? video.play() : video.pause();
      button.addEventListener("click", toggle); video.addEventListener("click", toggle);
      video.addEventListener("loadeddata", () => { if (video.currentTime === 0) video.currentTime = 0.05; }, { once: true });
      video.addEventListener("play", () => card.classList.add("is-playing"));
      ["pause", "ended"].forEach((name) => video.addEventListener(name, () => card.classList.remove("is-playing")));
    });
  }

  function initPhoneScreens() {
    $$(".phone-screen, .tablet-screen").forEach((screen) => {
      const image = $("img", screen);
      const position = Number(screen.dataset.initialScroll || 0);
      const apply = () => { screen.scrollTop = Math.max(0, (screen.scrollHeight - screen.clientHeight) * position); };
      image?.complete ? apply() : image?.addEventListener("load", apply, { once: true });
    });
  }

  function initReveal() {
    const items = $$(".reveal, .info-card, .process-grid article");
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return items.forEach((item) => item.classList.add("is-visible"));
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); } }), { threshold: 0.08, rootMargin: "0px 0px -40px" });
    items.forEach((item) => observer.observe(item));
  }

  function initContact() {
    const form = $(".contact-form"); const toast = $(".toast");
    if (!form || !toast) return;
    form.addEventListener("submit", (event) => { event.preventDefault(); toast.classList.add("is-visible"); setTimeout(() => toast.classList.remove("is-visible"), 2400); });
  }

  if (document.body.dataset.page === "detail") renderDetail();
  initDesktopScale(); initLoading(); initMenu(); initDragScroll(); initPosterStacks(); initVideos(); initPhoneScreens(); initReveal(); initContact();
})();
