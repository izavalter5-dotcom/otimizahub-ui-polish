(() => {
  "use strict";
  const config = window.GRAZI_CONFIG || {};
  const number = String(config.whatsappNumber || "").replace(/\D/g, "");
  const safeExternal = (url) => {
    try { const parsed = new URL(url); return ["https:", "http:"].includes(parsed.protocol) ? parsed.href : ""; }
    catch { return ""; }
  };
  const whatsappUrl = (message) => number.length >= 12 && number.length <= 15
    ? "https://wa.me/" + number + "?text=" + encodeURIComponent(message) : "";
  const float = document.getElementById("whatsapp-float");
  const footerWhatsapp = document.getElementById("footer-whatsapp");
  const setWhatsApp = (el, message) => {
    if (!el) return;
    const url = whatsappUrl(message);
    if (url) { el.href = url; el.target = "_blank"; el.rel = "noopener noreferrer"; }
    else { el.href = "#agendar"; el.removeAttribute("target"); el.addEventListener("click", (e) => { e.preventDefault(); document.getElementById("form-status").textContent = "O WhatsApp ainda não foi configurado. Use o formulário para preparar sua solicitação."; document.getElementById("agendar").scrollIntoView({behavior:"smooth"}); }); }
  };
  setWhatsApp(float, "Olá, Grazi! Gostaria de saber mais sobre os serviços.");
  setWhatsApp(footerWhatsapp, "Olá, Grazi! Gostaria de saber mais sobre os serviços.");
  const google = safeExternal(config.googleBusinessUrl);
  const googleLink = document.getElementById("google-link");
  if (google) { googleLink.href = google; googleLink.target = "_blank"; }
  else googleLink.addEventListener("click", e => { e.preventDefault(); alert("Adicione o link do perfil oficial do Google em config.js."); });
  const instagram = safeExternal(config.instagramUrl);
  const instagramLink = document.getElementById("instagram-link");
  if (instagram) { instagramLink.href = instagram; instagramLink.target = "_blank"; }
  else instagramLink.addEventListener("click", e => { e.preventDefault(); alert("Adicione o link do Instagram em config.js."); });
  const menuButton = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".nav");
  menuButton.addEventListener("click", () => { const open = nav.classList.toggle("open"); menuButton.setAttribute("aria-expanded", String(open)); menuButton.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu"); });
  nav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => { nav.classList.remove("open"); menuButton.setAttribute("aria-expanded","false"); }));
  document.querySelectorAll(".choose-service").forEach(button => button.addEventListener("click", () => { document.getElementById("service-select").value = button.dataset.service; document.getElementById("agendar").scrollIntoView({behavior:"smooth"}); document.getElementById("service-select").focus({preventScroll:true}); }));
  const dateInput = document.getElementById("date-input");
  const localToday = new Date(); dateInput.min = [localToday.getFullYear(), String(localToday.getMonth()+1).padStart(2,"0"), String(localToday.getDate()).padStart(2,"0")].join("-");
  const form = document.getElementById("booking-form");
  form.addEventListener("submit", event => {
    event.preventDefault();
    const status = document.getElementById("form-status");
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const date = String(data.get("date") || "");
    const [year, month, day] = date.split("-");
    const formattedDate = day && month && year ? day + "/" + month + "/" + year : date;
    const message = [
      "Olá, Grazi! Gostaria de solicitar um agendamento.",
      "",
      "Nome: " + String(data.get("name")).trim(),
      "WhatsApp: " + String(data.get("phone")).trim(),
      "Serviço: " + String(data.get("service")),
      "Data de preferência: " + formattedDate,
      "Horário: " + String(data.get("time")),
      "Observações: " + (String(data.get("notes") || "").trim() || "Não informado")
    ].join("\n");
    const url = whatsappUrl(message);
    if (!url) { status.textContent = "Para concluir, configure o número do WhatsApp em config.js. Nenhum dado foi enviado ou armazenado."; return; }
    const opened = window.open(url, "_blank", "noopener,noreferrer");
    if (!opened) { status.textContent = "O navegador bloqueou a nova aba. Permita pop-ups ou use o botão flutuante após configurar o WhatsApp."; return; }
    status.textContent = "Mensagem preparada. Revise e envie pelo WhatsApp para confirmar a solicitação.";
  });
  document.getElementById("year").textContent = String(new Date().getFullYear());
})();