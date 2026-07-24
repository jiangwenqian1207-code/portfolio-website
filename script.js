(() => {
  const projects = window.PORTFOLIO_PROJECTS || [];
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const tag = (label) => `<span class="project-tag">${label}</span>`;
  const infoCard = ([title, body]) => `<article class="info-card"><h3>${title}</h3><p>${body.replace(/\n/g, "<br>")}</p></article>`;
  const posterStack = (assets, label = "POSTER", className = "") => `
    <div class="poster-stack artwork-stack ${className}" tabindex="0" role="button" aria-label="点击切换下一张海报">
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

  function heroVisual(project) {
    if (project.heroDevice === "artwork") {
      return `<figure class="hero-artwork-card ${project.heroVariant || ""}"><img src="${project.heroScreen[1]}" alt="${project.heroScreen[0]}"></figure>`;
    }
    return project.heroDevice === "tablet" ? tabletMockup(project.heroScreen, "hero-tablet") : phoneMockup(project.heroScreen, "hero-phone");
  }

  function remainingDesigns(project) {
    if (!project.remaining?.length) return "";
    return `<section class="remaining-section remaining-${project.number} ${project.number === "02" ? "section-light" : "section-lavender"}"><h2 class="detail-heading reveal">REMAINING DESIGNS</h2><div class="remaining-grid">${project.remaining.map((src, index) => `<img src="${src}" alt="${project.title} remaining design ${index + 1}">`).join("")}</div></section>`;
  }

  function screensSections(project) {
    const groups = project.screenGroups?.length ? project.screenGroups : [{ title: "SCREENS DISPLAY", note: "04 KEY FLOWS / HORIZONTAL DISPLAY", screens: project.screens || [] }];
    return groups.map((group) => {
      const screenPhones = group.screens.map((screen) => screen[3] === "tablet" ? tabletMockup(screen, "screen-tablet") : phoneMockup(screen)).join("");
      return `
      <section class="screens-section section-dark">
        <h2 class="detail-heading reveal">${group.title}</h2>
        <p class="section-note">${group.note}</p>
        <div class="phone-track drag-scroll">${screenPhones}</div>
      </section>`;
    }).join("");
  }

  function nextProject(project) {
    const index = projects.indexOf(project);
    const isLast = index === projects.length - 1;
    const next = projects[(index + 1) % projects.length];
    return `<a class="next-project" href="${isLast ? "./index.html#works" : `./${next.file}`}"><span>${isLast ? "END OF PROJECT / 05" : `NEXT PROJECT / ${next.number}`}</span><strong>${isLast ? "BACK TO SELECTED WORKS" : next.title}</strong><b class="arrow-icon" aria-hidden="true"></b></a>`;
  }

  function previousProjectHref(project) {
    const index = projects.indexOf(project);
    if (index <= 0) return "./index.html#works";
    return `./${projects[index - 1].file}`;
  }

  function mobileProjectDetail(project) {
    return `
      <section class="detail-hero section-dark">
        <a class="back-button" href="${previousProjectHref(project)}">← 返回上一页</a>
        <p class="detail-intro">${project.intro}</p>
        <p class="detail-meta">${project.year}<br>${project.title}</p>
        <div class="detail-keywords left">${project.keywordsLeft.join("<br>")}</div>
        <div class="detail-keywords right">${project.keywordsRight.join("<br>")}</div>
        <div class="detail-background-title">${project.background}</div>
        ${heroVisual(project)}
        <div class="detail-tag">${tag(project.type)}</div><strong class="detail-number">${project.number}</strong>
      </section>
      <section class="detail-overview section-light">
        <h2 class="detail-heading reveal">PROJECT OVERVIEW</h2>
        <div class="info-grid">${project.overview.map(infoCard).join("")}</div>
        <div class="tool-row">${project.tools.map(tag).join("")}</div>
      </section>
      ${screensSections(project)}
      <section class="stack-section ${project.stackTheme === "light" ? "section-light" : "section-lavender"}">
        <div class="stack-copy"><h2 class="detail-heading reveal">POSTER STACK</h2><p>${(project.stackDescription || "点击最上层海报循环浏览。每张卡片保留独立旋转、缩放和层级，过渡时长 420ms。").replace(/\n/g, "<br>")}</p><small>${project.stackNote || "ARRAY ORDER · Z-INDEX · TRANSFORM · TRANSITION 350MS"}</small></div>
        ${posterStack(project.posters, "POSTER", project.stackVariant || "")}
      </section>
      ${remainingDesigns(project)}
      <section class="next-section section-dark">${nextProject(project)}</section>`;
  }

  function posterProjectDetail(project) {
    return `
      <section class="poster-hero section-lavender">
        <a class="back-button" href="${previousProjectHref(project)}">← 返回上一页</a>
        <p class="detail-intro">${project.intro}</p><p class="detail-meta">${project.year}<br>${project.title}<br>${project.type}</p>
        <div class="poster-hero-title">${project.background.replace(/\n/g, "<br>")}</div>
        <figure class="hero-artwork"><img src="${project.cover}" alt="Graphic Poster 主视觉"></figure>
        <div class="detail-keywords left">POSTER DESIGN<br>TYPOGRAPHY<br>VISUAL EXPERIMENT</div>
        <div class="detail-tag">${tag("GRAPHIC POSTER")}</div><strong class="detail-number">04</strong>
      </section>
      <section class="poster-gallery section-light"><h2 class="detail-heading reveal">POSTER GALLERY</h2><p class="section-note">${project.galleryNote || "05 WORKS / STAGGERED EXHIBITION LAYOUT"}</p><div class="staggered-posters">${project.posters.map((src, index) => `<figure><img src="${src}" alt="Poster ${index + 1}"></figure>`).join("")}</div></section>
      <section class="poster-description section-dark"><h2 class="detail-heading reveal">PROJECT DESCRIPTION</h2><div class="info-grid">${project.details.map(infoCard).join("")}</div><p class="description-footer">ART DIRECTION · TYPOGRAPHY · IMAGE MAKING · POST PRODUCTION</p></section>
      ${remainingDesigns(project)}
      <section class="next-section section-dark">${nextProject(project)}</section>`;
  }

  function videoBlock([title, meta, src]) {
    return `<article class="video-card"><header><h3>${title}</h3><p>${meta}</p></header><div class="video-media"><video src="${src}" preload="auto" playsinline></video><button class="video-play" type="button" aria-label="播放 ${title}"></button></div></article>`;
  }

  function modelingProjectDetail(project) {
    return `
      <section class="modeling-hero section-dark">
        <a class="back-button" href="${previousProjectHref(project)}">← 返回上一页</a><p class="detail-intro">${project.intro}</p><p class="detail-meta">${project.year}<br>${project.title}<br>${project.type}</p>
        <div class="detail-background-title">${project.background}</div><figure class="modeling-artwork"><img src="${project.cover}" alt="3D Modeling 主视觉"></figure>
        <div class="detail-keywords left">3D<br>POSTER<br>MOTION<br>VISUAL EXPERIMENT</div><div class="detail-tag">${["Blender", "POSTER", "MOTION", "VISUAL EXPERIMENT"].map(tag).join("")}</div><strong class="detail-number">05</strong>
      </section>
      <section class="stack-section section-lavender"><div class="stack-copy"><h2 class="detail-heading reveal">POSTER STACK</h2><p>${(project.stackDescription || "").replace(/\n/g, "<br>")}</p><small>${project.stackNote || "3D ART · HEALING · DREAMLIKE · INTERACTION"}</small></div>${posterStack(project.posters, "POSTER")}</section>
      <section class="motion-section section-dark"><h2 class="detail-heading reveal">MOTION WORKS</h2><p class="section-note">02 FILMS / 16:9 / LOCAL VIDEO ASSETS</p><div class="video-grid">${project.videos.map(videoBlock).join("")}</div>${project.videoCopy?.length ? `<div class="video-copy-grid">${project.videoCopy.map((item) => `<p>${item.replace(/\n/g, "<br>")}</p>`).join("")}</div>` : ""}<div class="motion-statement">POSTER BECOMES FRAME.<br>FRAME BECOMES MOTION.</div></section>
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
      track.addEventListener("pointerdown", (event) => {
        if (event.target.closest(".phone-screen, .tablet-screen")) return;
        active = true; moved = false; startX = event.clientX; scrollLeft = track.scrollLeft; track.classList.add("is-dragging");
      });
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
      track.addEventListener("wheel", (event) => {
        if (event.target.closest(".phone-screen, .tablet-screen")) return;
        if (Math.abs(event.deltaY) > Math.abs(event.deltaX) && track.scrollWidth > track.clientWidth) { event.preventDefault(); track.scrollLeft += event.deltaY; }
      }, { passive: false });
    });
  }

  function initExperienceCards() {
    const items = $$(".experience-item");
    if (!items.length) return;

    const data = {
      newrank: {
        number: "01",
        title: "UI 设计 / 新榜",
        meta: ["2025.11-2026.03", "上海新榜信息技术股份有限公司", "UI 设计实习生"],
        label: "工作描述",
        details: [
          "负责公司网页端、手机端的 UI 设计工作，根据需求对用户视觉体验进行优化，提供页面设计创意方案；",
          "配合运营完成活动页面的出图工作，包括落地页、banner、榜单、海报等。"
        ]
      },
      xgimi: {
        number: "02",
        title: "视觉营销设计 / 极米",
        meta: ["2026.04-至今", "极米科技股份有限公司", "平面设计实习生"],
        label: "工作描述",
        details: [
          "协助完成投影新品海内外营销平面设计工作：国内负责小红书平台海报、微信公众号推文设计，完成新品上市、618 大促、以旧换新等活动物料。海外协助输出 Ins、Twitter 社媒海报、亚马逊产品详情页、EDM 推广邮件，适配海外平台视觉规范；",
          "协助新品发布会、线下品牌活动物料设计，完成主视觉延展、活动配套宣传物料制作。"
        ]
      },
      school: {
        number: "03",
        title: "课程设计 / 学校",
        meta: ["2024.9-至今", "成都大学", "视觉传达设计（硕士研究生）"],
        label: "学习经历",
        details: [
          "<strong>主修课程：</strong>新媒体艺术设计实践（90），图像及符号研究（91），广告设计实践（90）等。",
          "<strong>获得奖项：</strong>2025 年第十一届四川省大学生广告艺术大赛“二等奖”、学业奖学金“二等奖”等。"
        ]
      }
    };

    const modal = document.createElement("div");
    modal.className = "experience-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-hidden", "true");
    document.body.appendChild(modal);

    const close = () => {
      modal.classList.remove("is-visible");
      modal.setAttribute("aria-hidden", "true");
    };

    const open = (key) => {
      const item = data[key];
      if (!item) return;
      modal.innerHTML = `
        <article class="experience-card">
          <button class="experience-card-close" type="button" aria-label="关闭经历卡片">×</button>
          <div class="experience-card-head">
            ${item.meta.map((text) => `<span>${text}</span>`).join("")}
          </div>
          <h3>${item.number} / ${item.title}</h3>
          <h4>${item.label}</h4>
          ${key === "school"
            ? `<ul>${item.details.map((text) => `<li>${text}</li>`).join("")}</ul>`
            : `<ol>${item.details.map((text) => `<li>${text}</li>`).join("")}</ol>`}
        </article>
      `;
      modal.classList.add("is-visible");
      modal.setAttribute("aria-hidden", "false");
      $(".experience-card-close", modal)?.focus();
    };

    items.forEach((item) => item.addEventListener("click", () => open(item.dataset.experience)));
    modal.addEventListener("click", (event) => {
      if (event.target === modal || event.target.closest(".experience-card-close")) close();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && modal.classList.contains("is-visible")) close();
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
      if (stack.classList.contains("single-poster")) return;
      stack.addEventListener("click", () => cycleStack(stack));
      stack.addEventListener("keydown", (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); cycleStack(stack); } });
    });
  }

  function initPosterCycleHint() {
    if (matchMedia("(pointer: coarse)").matches) return;
    const stacks = $$(".poster-stack:not(.single-poster)");
    if (!stacks.length) return;

    const hint = document.createElement("div");
    hint.className = "poster-cycle-hint";
    hint.textContent = "点击查看下一张";
    document.body.appendChild(hint);

    const show = (event) => {
      hint.style.left = `${event.clientX + 18}px`;
      hint.style.top = `${event.clientY + 18}px`;
      hint.classList.add("is-visible");
    };
    const hide = () => hint.classList.remove("is-visible");

    stacks.forEach((stack) => {
      stack.addEventListener("pointermove", (event) => {
        if (!event.target.closest(".poster-card")) {
          hide();
          return;
        }
        show(event);
      });
      stack.addEventListener("pointerleave", hide);
      stack.addEventListener("click", hide);
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

  function initClickSpark() {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const canvas = document.createElement("canvas");
    canvas.className = "click-spark-canvas";
    canvas.setAttribute("aria-hidden", "true");
    document.body.appendChild(canvas);

    const ctx = canvas.getContext("2d");
    const sparks = [];
    const config = {
      sparkColor: "#f4f1ff",
      accentColor: "#b8a7ff",
      sparkSize: 15,
      sparkRadius: 34,
      sparkCount: 8,
      duration: 420,
      extraScale: 1.05,
    };
    let animationId = 0;

    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const easeOut = (t) => t * (2 - t);

    const draw = (timestamp) => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      for (let index = sparks.length - 1; index >= 0; index -= 1) {
        const spark = sparks[index];
        const elapsed = timestamp - spark.startTime;
        if (elapsed >= config.duration) {
          sparks.splice(index, 1);
          continue;
        }

        const progress = elapsed / config.duration;
        const eased = easeOut(progress);
        const distance = eased * config.sparkRadius * config.extraScale;
        const lineLength = config.sparkSize * (1 - eased);
        const alpha = 1 - progress;
        const x1 = spark.x + distance * Math.cos(spark.angle);
        const y1 = spark.y + distance * Math.sin(spark.angle);
        const x2 = spark.x + (distance + lineLength) * Math.cos(spark.angle);
        const y2 = spark.y + (distance + lineLength) * Math.sin(spark.angle);

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = spark.index % 2 ? config.accentColor : config.sparkColor;
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.shadowBlur = 10;
        ctx.shadowColor = config.accentColor;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.restore();
      }

      if (sparks.length) {
        animationId = requestAnimationFrame(draw);
      } else {
        animationId = 0;
      }
    };

    const addSpark = (event) => {
      const now = performance.now();
      for (let index = 0; index < config.sparkCount; index += 1) {
        sparks.push({
          x: event.clientX,
          y: event.clientY,
          angle: (2 * Math.PI * index) / config.sparkCount,
          startTime: now,
          index,
        });
      }
      if (!animationId) animationId = requestAnimationFrame(draw);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas, { passive: true });
    document.addEventListener("click", addSpark, true);
  }

  function initPosterGallery() {
    $$(".staggered-posters figure").forEach((card) => {
      card.tabIndex = 0;
      card.setAttribute("role", "button");
      const toggle = () => {
        if (card.dataset.suppressClick === "true") {
          card.dataset.suppressClick = "false";
          return;
        }
        const selected = card.classList.contains("is-selected");
        $$(".staggered-posters figure").forEach((item) => item.classList.remove("is-selected"));
        if (!selected) card.classList.add("is-selected");
      };
      card.addEventListener("click", toggle);
      card.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") { event.preventDefault(); toggle(); }
      });
    });
  }

  function initDraggablePosters() {
    let topLayer = 40;
    $$(".staggered-posters figure").forEach((card) => {
      let active = false, moved = false, startX = 0, startY = 0, baseX = 0, baseY = 0;
      const readOffset = (name) => Number.parseFloat(card.style.getPropertyValue(name)) || 0;
      card.addEventListener("pointerdown", (event) => {
        if (event.pointerType === "mouse" && event.button !== 0) return;
        active = true;
        moved = false;
        startX = event.clientX;
        startY = event.clientY;
        baseX = readOffset("--drag-x");
        baseY = readOffset("--drag-y");
        card.classList.add("is-dragging");
        card.style.zIndex = String(++topLayer);
        card.setPointerCapture(event.pointerId);
        event.preventDefault();
      });
      card.addEventListener("pointermove", (event) => {
        if (!active) return;
        const dx = event.clientX - startX;
        const dy = event.clientY - startY;
        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) moved = true;
        card.style.setProperty("--drag-x", `${baseX + dx}px`);
        card.style.setProperty("--drag-y", `${baseY + dy}px`);
      });
      const endDrag = (event) => {
        if (!active) return;
        active = false;
        card.classList.remove("is-dragging");
        if (moved) card.dataset.suppressClick = "true";
        if (card.hasPointerCapture(event.pointerId)) card.releasePointerCapture(event.pointerId);
      };
      card.addEventListener("pointerup", endDrag);
      card.addEventListener("pointercancel", endDrag);
    });
  }

  function initPosterDragHint() {
    const gallery = $(".staggered-posters");
    if (!gallery || matchMedia("(pointer: coarse)").matches) return;

    const hint = document.createElement("div");
    hint.className = "poster-drag-hint";
    hint.textContent = "拖拽海报试试";
    document.body.appendChild(hint);

    let started = false;
    let expired = false;
    let inside = false;
    let timer = 0;

    const hide = () => hint.classList.remove("is-visible");
    const expire = () => {
      expired = true;
      hide();
      if (timer) clearTimeout(timer);
    };
    const start = () => {
      if (started) return;
      started = true;
      timer = setTimeout(expire, 15000);
    };
    const move = (event) => {
      if (!started || expired || !inside) return;
      hint.style.left = `${event.clientX + 18}px`;
      hint.style.top = `${event.clientY + 18}px`;
      hint.classList.add("is-visible");
    };

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        start();
        observer.disconnect();
      }
    }, { threshold: 0.18 });

    observer.observe(gallery);
    gallery.addEventListener("pointerenter", (event) => {
      inside = true;
      start();
      move(event);
    });
    gallery.addEventListener("pointermove", move);
    gallery.addEventListener("pointerleave", () => {
      inside = false;
      hide();
    });
    gallery.addEventListener("pointerdown", expire, true);
  }

  if (document.body.dataset.page === "detail") renderDetail();
  initDesktopScale(); initLoading(); initMenu(); initExperienceCards(); initClickSpark(); initDragScroll(); initPosterStacks(); initPosterCycleHint(); initDraggablePosters(); initPosterDragHint(); initPosterGallery(); initVideos(); initPhoneScreens(); initReveal(); initContact();
})();
