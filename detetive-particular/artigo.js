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
  const ano = document.getElementById("ano");
  if (ano) ano.textContent = new Date().getFullYear();
})();
