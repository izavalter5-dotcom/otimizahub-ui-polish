import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useMemo, useRef } from 'react'
import rawPage from '../content/otimizahub.html?raw'
import goldLogo from '../assets/otimizahub-logo-gold-cropped.png'
import plansHeroImage from '../assets/hero-workspace.jpg'

function extractElement(html: string, selector: string) {
  const id = selector.replace(/^#/, '')
  const match = html.match(new RegExp(`<([a-z0-9]+)[^>]*\\bid=["']${id}["'][^>]*>[\\s\\S]*?<\\/\\1>`, 'i'))
  return match?.[0] ?? ''
}

function extractTag(html: string, tag: string) {
  return html.match(new RegExp(`<${tag}\\b[^>]*>[\\s\\S]*?<\\/${tag}>`, 'i'))?.[0] ?? ''
}

function StandalonePage() {
  const container = useRef<HTMLDivElement>(null)
  const markup = useMemo(() => {
    const html = rawPage
      .replaceAll('/media/otimizahub-logo-light.webp', goldLogo)
      .replaceAll('/media/otimizahub-logo-dark.webp', goldLogo)
    const header = extractTag(html, 'header')
    const plans = extractElement(html, '#planos').replaceAll('href="#contato"', 'href="/#contato"')
    const footer = extractTag(html, 'footer')
    const hero = `<section class="oh-plans-hero"><img src="${plansHeroImage}" alt="Ambiente profissional de trabalho da OtimizaHub"/><div class="oh-plans-hero-shade"></div><div class="oh-plans-hero-content"><span class="oh-kicker"><span class="oh-kicker-line"></span> SOLUÇÕES PARA CRESCER</span><h1>Serviços pensados para dar <em>visibilidade ao seu negócio.</em></h1><p>Escolha a estrutura que faz sentido para o momento da sua empresa, com clareza sobre o que está incluído e sem complicação.</p></div></section>`
    return { __html: header + hero + plans + footer }
  }, [])

  useEffect(() => {
    const root = container.current
    if (!root) return
    const dark = (value: boolean) => {
      root.classList.toggle('theme-dark', value)
      try { localStorage.setItem('otimizahub-theme', value ? 'dark' : 'light') } catch {}
      const icon = root.querySelector('#theme-icon'); if (icon) icon.textContent = value ? '☀' : '☾'
    }
    try { dark(localStorage.getItem('otimizahub-theme') === 'dark') } catch { dark(false) }
    const offs: Array<() => void> = []
    const on=(el:Element|null,event:string,fn:EventListener)=>{ if(el){el.addEventListener(event,fn);offs.push(()=>el.removeEventListener(event,fn))} }
    root.querySelectorAll('#theme-toggle, #theme-toggle-mobile').forEach(el=>on(el,'click',()=>dark(!root.classList.contains('theme-dark'))))
    const menu=root.querySelector('#mobile-menu'), menuBtn=root.querySelector('#menu-btn'), open=root.querySelector('#icon-open'), close=root.querySelector('#icon-close')
    on(menuBtn,'click',()=>{const isOpen=menu?.classList.contains('hidden');menu?.classList.toggle('hidden',!isOpen);open?.classList.toggle('hidden',Boolean(isOpen));close?.classList.toggle('hidden',!isOpen);menuBtn?.setAttribute('aria-expanded',String(Boolean(isOpen)))})
    root.querySelectorAll('#mobile-menu a').forEach(el=>on(el,'click',()=>{menu?.classList.add('hidden');open?.classList.remove('hidden');close?.classList.add('hidden')}))
    root.querySelectorAll<HTMLElement>('.showcase-tab').forEach(tab=>on(tab,'click',()=>{}))
    root.querySelectorAll<HTMLElement>('.plano-cta').forEach(el=>on(el,'click',()=>{const select=root.querySelector<HTMLSelectElement>('#servico');if(select&&el.dataset['plano'])select.value=el.dataset['plano']}))
    root.querySelectorAll<HTMLInputElement>('.custom-plan-service').forEach(el=>on(el,'change',()=>{
      el.closest('.plano-check-label')?.classList.toggle('selected',el.checked)
      const selected=[...root.querySelectorAll<HTMLInputElement>('.custom-plan-service:checked')].map(item=>item.value)
      const months=(root.querySelector<HTMLSelectElement>('#custom-plan-months')?.value ?? '0')
      const summary=root.querySelector('#custom-plan-summary')
      if(summary) summary.textContent=selected.length ? selected.join(' + ')+ (months!=='0' ? ` + manutenção por ${months} mês(es) com 15% de desconto` : ' + sem manutenção') : 'Selecione pelo menos um serviço para montar sua solicitação.'
    }))
    on(root.querySelector('#custom-plan-months'),'change',()=>root.querySelectorAll<HTMLInputElement>('.custom-plan-service').forEach(el=>el.dispatchEvent(new Event('change'))))
    on(root.querySelector('#custom-plan-submit'),'click',event=>{
      const selected=[...root.querySelectorAll<HTMLInputElement>('.custom-plan-service:checked')].map(item=>item.value)
      if(!selected.length){event.preventDefault();alert('Selecione pelo menos um serviço para montar seu plano personalizado.');return}
      const months=root.querySelector<HTMLSelectElement>('#custom-plan-months')?.value ?? '0'
      const maintenance=months==='0' ? 'sem manutenção' : `manutenção por ${months} mês(es), com 15% de desconto`
      const message=encodeURIComponent(`Olá! Quero montar um Plano Personalizado OtimizaHub. Serviços: ${selected.join(', ')}. Manutenção: ${maintenance}. Quero receber a confirmação do investimento e próximos passos.`)
      ;(event.currentTarget as HTMLAnchorElement).href=`https://wa.me/554196674017?text=${message}`
    })
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('in');observer.unobserve(entry.target)}}),{threshold:.08})
    root.querySelectorAll('.reveal').forEach(el=>observer.observe(el))
    return ()=>{observer.disconnect();offs.forEach(off=>off())}
  }, [])
  return <div ref={container} className="oh-page" dangerouslySetInnerHTML={markup} />
}

export const Route = createFileRoute('/planos')({
  ssr: false,
  head: () => ({ meta: [
    { title: 'Planos — OtimizaHub' },
    { name: 'description', content: 'Conheça os planos e opções personalizadas da OtimizaHub.' },
  ] }),
  component: StandalonePage,
})
