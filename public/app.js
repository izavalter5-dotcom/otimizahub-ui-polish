const WHATSAPP_URL = ""; // Cole aqui o link do WhatsApp quando estiver disponível.

document.querySelectorAll("[data-whatsapp]").forEach((link)=>{
  link.href = WHATSAPP_URL || "#agendamento";
  if(!WHATSAPP_URL) link.addEventListener("click",(e)=>{
    e.preventDefault();
    document.querySelector("#agendamento")?.scrollIntoView({behavior:"smooth"});
  });
});

document.querySelectorAll("[data-service]").forEach((link)=>{
  link.addEventListener("click",()=>{
    const select = document.querySelector('[name="service"]');
    if(select) select.value = link.dataset.service;
  });
});

const dateInput = document.querySelector('[name="date"]');
if(dateInput){
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  dateInput.min = now.toISOString().slice(0,10);
}

const form = document.querySelector("#booking-form");
const status = document.querySelector("#form-status");
form?.addEventListener("submit", async (event)=>{
  event.preventDefault();
  status.textContent = "Enviando sua solicitação…";
  status.className = "form-status loading";
  const data = Object.fromEntries(new FormData(form).entries());
  try{
    const response = await fetch("/api/appointments",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify(data)
    });
    const result = await response.json();
    if(!response.ok) throw new Error(result.error || "Não foi possível enviar.");
    status.textContent = result.message;
    status.className = "form-status success";
    form.reset();
    if(dateInput){
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      dateInput.min = now.toISOString().slice(0,10);
    }
  }catch(error){
    status.textContent = error.message;
    status.className = "form-status error";
  }
});
\nconst reviewsRoot = document.querySelector("#google-reviews");
const googleLink = document.querySelector("#google-link");
if(reviewsRoot){
  fetch("/api/reviews").then(r=>r.json()).then(data=>{
    if(!data.configured){
      reviewsRoot.innerHTML='<div class="review-empty">A integração com o Google será ativada após a configuração do perfil.</div>';
      return;
    }
    reviewsRoot.innerHTML = `<div class="rating-summary"><strong>${data.rating ? data.rating.toFixed(1) : "—"}</strong><span>★</span><small>${data.count || 0} avaliações</small></div>` +
      (data.reviews||[]).slice(0,6).map(review=>`<article class="review-card"><div class="review-stars">${"★".repeat(Math.round(review.rating))}</div><strong>${escapeHtml(review.author)}</strong><small>${escapeHtml(review.relativeTime)}</small><p>${escapeHtml(review.text)}</p></article>`).join("");
    if(data.mapsUrl){googleLink.href=data.mapsUrl;googleLink.hidden=false;}
  }).catch(()=>{reviewsRoot.innerHTML='<div class="review-empty">Não foi possível carregar as avaliações agora.</div>';});
}
function escapeHtml(value){
  return String(value).replace(/[&<>"']/g, char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[char]));
}
