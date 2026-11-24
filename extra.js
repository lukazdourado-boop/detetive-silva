/* Detetive Silva · movimento extra (roda depois do app.js) */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const pequena = matchMedia("(max-width: 860px)");
  const mouse = matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ── Títulos: palavra por palavra ───────────────────────────────────── */
  $$("[data-palavras]").forEach((el) => {
    const texto = el.textContent.trim();
    el.setAttribute("aria-label", texto);
    el.innerHTML = texto.split(/\s+/).map((w, i) => `<span class="w" aria-hidden="true"><span style="--i:${i}">${w}</span></span>`).join(" ");
  });
  const ioTitulos = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("dito"); ioTitulos.unobserve(e.target); }
  }), { threshold: 0.4 });
  $$("[data-palavras]").forEach((el) => { if (!el.closest(".momento")) ioTitulos.observe(el); });

  /* ── Manifesto: palavras acendem ────────────────────────────────────── */
  const manifesto = $("#manifesto");
  let palavras = [];
  if (manifesto) {
    const alvo = $("[data-acender]", manifesto);
    const envolver = (no) => {
      const frag = document.createDocumentFragment();
      no.childNodes.forEach((n) => {
        if (n.nodeType === 3) {
          n.textContent.split(/(\s+)/).forEach((parte) => {
            if (!parte) return;
            if (/^\s+$/.test(parte)) { frag.append(" "); return; }
            const s = document.createElement("span");
            s.className = "pl"; s.textContent = parte; frag.append(s); palavras.push(s);
          });
        } else {
          const c = n.cloneNode(false);
          c.append(envolver(n));
          frag.append(c);
        }
      });
      return frag;
    };
    const copia = alvo.cloneNode(true);
    alvo.textContent = "";
    alvo.append(envolver(copia));
  }

  /* ── Serviços: faixa horizontal ─────────────────────────────────────── */
  const hz = $("#servicos.hz");
  const trilho = hz && $(".hz-trilho", hz);
  const barraHz = hz && $(".hz-barra i", hz);
  let maxHz = 0;
  const medirHz = () => {
    if (!hz) return;
    if (pequena.matches) { hz.style.height = ""; trilho.style.transform = ""; maxHz = 0; return; }
    maxHz = Math.max(0, trilho.offsetWidth - innerWidth);
    hz.style.height = `${innerHeight + maxHz * 1.05}px`;
  };

  /* ── Digital desenhada ──────────────────────────────────────────────── */
  const digital = $(".digital");
  let aneis = [];
  if (digital) {
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", "0 0 200 240");
    for (let i = 0; i < 13; i++) {
      const rx = 7 + i * 7.4, ry = rx * 1.22, base = 160;
      const p = document.createElementNS(ns, "path");
      p.setAttribute("d", `M ${100 - rx} 232 L ${100 - rx} ${base} A ${rx} ${ry} 0 0 1 ${100 + rx} ${base} L ${100 + rx} 232`);
      p.setAttribute("pathLength", "1");
      p.style.strokeDasharray = "1";
      p.style.strokeDashoffset = "1";
      p.style.opacity = String(0.95 - i * 0.045);
      svg.append(p); aneis.push(p);
    }
    digital.append(svg);
  }

  /* ── Passos ─────────────────────────────────────────────────────────── */
  const passos = $(".passos");
  const itens = passos ? $$("li", passos) : [];

  /* ── Faixa: acelera com a rolagem ───────────────────────────────────── */
  const trilhoFaixa = $(".faixa-trilho");
  let animFaixa = null;

  /* ── Lupa e brilho nos painéis ──────────────────────────────────────── */
  const lupa = $(".lupa");
  let mx = innerWidth / 2, my = innerHeight / 2, lx = mx, ly = my;
  if (mouse && lupa) {
    addEventListener("mousemove", (e) => {
      mx = e.clientX; my = e.clientY; lupa.classList.add("viva");
      const painel = e.target.closest && e.target.closest(".painel");
      if (painel) {
        const r = painel.getBoundingClientRect();
        painel.style.setProperty("--mx", `${e.clientX - r.left}px`);
        painel.style.setProperty("--my", `${e.clientY - r.top}px`);
      }
      lupa.classList.toggle("grande", !!(e.target.closest && e.target.closest("a, button, summary, input, select, textarea, .hz-item")));
    }, { passive: true });
    document.addEventListener("mouseleave", () => lupa.classList.remove("viva"));
  }

  /* ── Link do WhatsApp nos contatos ──────────────────────────────────── */
  const S = window.SITE || {};
  const zap = $("[data-whats]");
  const zap2 = $("[data-whats2]");
  if (zap2 && S.whatsapp2) zap2.href = `https://wa.me/${String(S.whatsapp2.numero).replace(/\D/g, "")}?text=${encodeURIComponent(S.whatsapp2.mensagem || "")}`;
  if (zap && S.whatsapp) zap.href = `https://wa.me/${String(S.whatsapp.numero).replace(/\D/g, "")}?text=${encodeURIComponent(S.whatsapp.mensagem || "")}`;

  /* ── Passos com o mesmo "andamento" ─────────────────────────────────── */
  /* ── Cena 2: segundo vídeo que toca na rolagem ──────────────────────── */
  const campo = $("#campo");
  const campoCanvas = campo && $(".cine-canvas", campo);
  const campoTempo = campo && $("[data-tempo2]", campo);
  const momentosCampo = campo ? $$(".momento", campo) : [];
  let c2 = null, t2 = "";
  if (campo && campoCanvas && S.frames2) {
    const ctx = campoCanvas.getContext("2d"), total = S.frames2.total;
    const padrao = pequena.matches ? S.frames2.mobile : S.frames2.desktop;
    const quadros = new Array(total);
    let atual = 0, desenhado = -1, iniciou = false;
    const src = (i) => padrao.replace("{n}", String(i + 1).padStart(4, "0"));
    const pronto = (i) => quadros[i] && quadros[i].complete && quadros[i].naturalWidth;
    const proximo = (i) => { for (let d = 0; d < total; d++) { if (pronto(i - d)) return i - d; if (pronto(i + d)) return i + d; } return -1; };
    const carregar = (i) => {
      if (quadros[i]) return;
      const im = new Image(); im.decoding = "async"; im.src = src(i);
      im.onload = () => { if (desenhado === -1) desenhar(i, true); };
      quadros[i] = im;
    };
    function desenhar(i, forcar) {
      const j = proximo(i);
      if (j < 0 || (j === desenhado && !forcar)) return;
      const im = quadros[j], cw = campoCanvas.width, ch = campoCanvas.height;
      const e = Math.max(cw / im.naturalWidth, ch / im.naturalHeight);
      const w = im.naturalWidth * e, h = im.naturalHeight * e;
      ctx.drawImage(im, (cw - w) / 2, (ch - h) / 2, w, h);
      desenhado = j;
    }
    const ajustar = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      campoCanvas.width = Math.round(campoCanvas.clientWidth * dpr);
      campoCanvas.height = Math.round(campoCanvas.clientHeight * dpr);
      desenhado = -1; desenhar(Math.round(atual), true);
    };
    const iniciar = () => {
      if (iniciou) return; iniciou = true;
      const fila = [];
      for (const passo of [8, 4, 2, 1]) for (let i = 0; i < total; i += passo) if (!fila.includes(i)) fila.push(i);
      let k = 0;
      const lote = () => { for (let n = 0; n < 6 && k < fila.length; n++) carregar(fila[k++]); if (k < fila.length) setTimeout(lote, 40); };
      lote();
    };
    carregar(0);
    new IntersectionObserver(([e]) => { if (e.isIntersecting) iniciar(); }, { rootMargin: "250% 0px" }).observe(campo);
    addEventListener("resize", ajustar);
    ajustar();
    c2 = { passo(p) { const alvo = p * (total - 1); atual += (alvo - atual) * 0.18; if (Math.abs(alvo - atual) < 0.05) atual = alvo; desenhar(Math.round(atual)); return atual / (total - 1); } };
  }

  const cine = $(".cine");
  const barra = $(".progresso i");
  const tempo = $("[data-tempo]");
  const fmt = (s) => `00:${String(Math.floor(s)).padStart(2, "0")}`;
  let ultimoY = scrollY, vel = 0, tTexto = "";

  const tick = () => {
    const y = scrollY, h = innerHeight;
    vel += (Math.abs(y - ultimoY) - vel) * 0.12; ultimoY = y;

    // barra de progresso da página
    const total = document.documentElement.scrollHeight - h;
    if (barra) barra.style.transform = `scaleX(${total > 0 ? clamp(y / total) : 0})`;

    // abertura
    if (cine) {
      const r = cine.getBoundingClientRect();
      const p = clamp(-r.top / ((cine.offsetHeight - h) || 1));
      cine.style.setProperty("--p", p.toFixed(4));
      const t = fmt(p * 8);
      if (tempo && t !== tTexto) { tempo.textContent = t; tTexto = t; }
    }

    // cena 2 (em campo)
    if (campo) {
      const r = campo.getBoundingClientRect();
      const p = clamp(-r.top / ((campo.offsetHeight - h) || 1));
      campo.style.setProperty("--p", p.toFixed(4));
      if (c2) {
        const pp = c2.passo(p);
        momentosCampo.forEach((m) => {
          const de = parseFloat(m.dataset.de || 0), ate = parseFloat(m.dataset.ate || 1);
          m.classList.toggle("ativo", pp >= de && (pp < ate || (ate >= 1 && pp >= 1)));
        });
      }
      const tt = fmt(p * 8);
      if (campoTempo && tt !== t2) { campoTempo.textContent = tt; t2 = tt; }
    }

    // faixa de serviços: velocidade acompanha a rolagem
    if (trilhoFaixa) {
      if (!animFaixa && trilhoFaixa.getAnimations) animFaixa = trilhoFaixa.getAnimations()[0];
      if (animFaixa) animFaixa.playbackRate = 1 + Math.min(vel / 6, 7);
    }

    // manifesto
    if (manifesto && palavras.length) {
      const r = manifesto.getBoundingClientRect();
      const p = clamp(-r.top / ((manifesto.offsetHeight - h) || 1));
      manifesto.style.setProperty("--p", p.toFixed(4));
      const alvo = p * 1.15 * palavras.length;
      for (let i = 0; i < palavras.length; i++) palavras[i].classList.toggle("acesa", i < alvo);
    }

    // serviços na horizontal
    if (hz && !pequena.matches && maxHz > 0) {
      const r = hz.getBoundingClientRect();
      const p = clamp(-r.top / ((hz.offsetHeight - h) || 1));
      trilho.style.transform = `translate3d(${(-p * maxHz).toFixed(1)}px,0,0)`;
      if (barraHz) barraHz.style.transform = `scaleX(${p.toFixed(4)})`;
    }

    // digital
    if (digital && aneis.length) {
      const r = digital.getBoundingClientRect();
      const p = clamp((h * 0.92 - r.top) / (h * 0.9 + r.height * 0.3));
      aneis.forEach((a, i) => { a.style.strokeDashoffset = String(1 - clamp(p * 1.9 - i * 0.07)); });
    }

    // passos
    if (passos) {
      const r = passos.getBoundingClientRect();
      const p = clamp((h * 0.72 - r.top) / (r.height * 0.95));
      passos.style.setProperty("--p", p.toFixed(4));
      itens.forEach((li, i) => li.classList.toggle("on", p > (i + 0.35) / itens.length - 0.05));
    }

    // lupa
    if (mouse && lupa) {
      lx += (mx - lx) * 0.2; ly += (my - ly) * 0.2;
      lupa.style.transform = `translate3d(${lx.toFixed(1)}px, ${ly.toFixed(1)}px, 0)`;
    }
    requestAnimationFrame(tick);
  };

  /* ── Guia de rolagem: chama atenção se a pessoa não rolar, e rola ao clicar ── */
  const guia = $(".guia");
  if (guia) {
    setTimeout(() => { if (scrollY < 20) guia.classList.add("guia--chama"); }, 5000);
    addEventListener("scroll", () => { if (scrollY > 20) guia.classList.remove("guia--chama"); }, { passive: true });
    guia.addEventListener("click", () => {
      const c = $(".cine");
      scrollTo({ top: c.offsetTop + (c.offsetHeight - innerHeight) * 0.32, behavior: "smooth" });
    });
  }

  addEventListener("resize", medirHz);
  addEventListener("load", medirHz);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(medirHz);
  medirHz();
  requestAnimationFrame(tick);
})();

/* ── Menu (celular), link ativo e avisos de rolagem ─────────────────────── */
(() => {
  const botao = document.querySelector(".menu-botao"), menu = document.querySelector("#menu");
  if (botao && menu) {
    const fechar = () => { menu.classList.remove("aberto"); botao.setAttribute("aria-expanded", "false"); botao.setAttribute("aria-label", "Abrir menu"); document.body.style.overflow = ""; };
    botao.addEventListener("click", () => {
      const abrir = !menu.classList.contains("aberto");
      menu.classList.toggle("aberto", abrir);
      botao.setAttribute("aria-expanded", String(abrir));
      botao.setAttribute("aria-label", abrir ? "Fechar menu" : "Abrir menu");
      document.body.style.overflow = abrir ? "hidden" : "";
    });
    menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", fechar));
    addEventListener("keydown", (e) => { if (e.key === "Escape") fechar(); });
    addEventListener("resize", () => { if (innerWidth > 760) fechar(); });
  }

  // link da seção atual fica destacado
  const links = [...document.querySelectorAll('.menu a[href^="#"]')].filter((a) => !a.classList.contains("menu-cta"));
  const secoes = links.map((a) => document.querySelector(a.getAttribute("href"))).filter(Boolean);
  const marcar = () => {
    let atual = null;
    for (const s of secoes) if (s.getBoundingClientRect().top <= innerHeight * 0.4) atual = s.id;
    links.forEach((a) => a.classList.toggle("ativo", a.getAttribute("href") === "#" + atual));
  };
  addEventListener("scroll", marcar, { passive: true }); marcar();

  // aviso "continue descendo" enquanto a cena fixa estiver rolando
  const cenas = [...document.querySelectorAll(".aviso")].map((el) => ({ el, cena: el.closest(".cine, .manifesto") })).filter((c) => c.cena);
  const atualizarAvisos = () => {
    for (const { el, cena } of cenas) {
      const r = cena.getBoundingClientRect(), curso = cena.offsetHeight - innerHeight;
      const p = -r.top / (curso || 1);
      el.classList.toggle("on", p > 0.01 && p < 0.9);
    }
  };
  addEventListener("scroll", atualizarAvisos, { passive: true }); atualizarAvisos();
})();
