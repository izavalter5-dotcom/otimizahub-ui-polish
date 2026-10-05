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
    const money = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    const updateCustomPlan = () => {
      const inputs = Array.from(root.querySelectorAll<HTMLInputElement>('.custom-plan-service'))
      const selected = inputs.filter(input => input.checked)
      const totalEl = root.querySelector<HTMLElement>('#custom-plan-total strong')
      const itemsEl = root.querySelector<HTMLElement>('#custom-plan-items')
      const summary = root.querySelector<HTMLElement>('#custom-plan-summary')
      const maintenanceNote = root.querySelector<HTMLElement>('#custom-plan-maintenance')
      let total = 0
      let hasQuote = false
      const rows: string[] = []

      root.querySelectorAll<HTMLElement>('.custom-plan-months-wrap').forEach(wrap => {
        const group = wrap.dataset['monthsFor'] || ''
        const maintenanceInput = root.querySelector<HTMLInputElement>(`.custom-plan-service[data-kind="maintenance"][data-group="${group}"]`)
        const select = wrap.querySelector<HTMLSelectElement>('select')
        const visible = Boolean(maintenanceInput?.checked)
        wrap.classList.toggle('hidden', !visible)
        if (visible && select && select.value === '0') select.value = '1'
      })

      selected.forEach(input => {
        const kind = input.dataset['kind'] || 'setup'
        const rawPrice = input.dataset['price'] || ''
        const price = rawPrice === '' ? null : Number(rawPrice)

        if (price === null || Number.isNaN(price)) {
          hasQuote = true
          rows.push(`<div class="flex justify-between gap-3 text-sm text-navy"><span>${input.value}</span><strong>Sob consulta</strong></div>`)
          return
        }

        if (kind === 'maintenance') {
          const group = input.dataset['group'] || ''
          const select = root.querySelector<HTMLSelectElement>(`select[data-months-group="${group}"]`)
          const months = Number(select?.value || 0)
          if (months > 0) {
            const maintenanceTotal = price * months * 0.85
            total += maintenanceTotal
            rows.push(`<div class="flex justify-between gap-3 text-sm text-navy"><span>${input.value} · ${months} mês(es)</span><strong>${money(maintenanceTotal)}</strong></div>`)
          }
          return
        }

        if (kind === 'monthly') {
          total += price
          rows.push(`<div class="flex justify-between gap-3 text-sm text-navy"><span>${input.value}</span><strong>${money(price)}/mês</strong></div>`)
          return
        }

        total += price
        rows.push(`<div class="flex justify-between gap-3 text-sm text-navy"><span>${input.value}</span><strong>${money(price)}</strong></div>`)
      })

      if (totalEl) totalEl.textContent = money(total)
      if (itemsEl) itemsEl.innerHTML = rows.length ? rows.join('') : '<p class="text-xs text-muted">Nenhum serviço selecionado.</p>'
      if (summary) {
        summary.innerHTML = selected.length
          ? `<strong>Total estimado: ${money(total)}</strong>${hasQuote ? ' <span class="text-xs text-muted">+ serviço sob consulta</span>' : ''}`
          : 'Selecione pelo menos um serviço para montar sua solicitação.'
      }
      if (maintenanceNote) {
        maintenanceNote.textContent = selected.some(input => input.dataset['kind'] === 'maintenance')
          ? 'Cada gestão mensal é calculada separadamente. Para 2 ou 3 meses, aplica-se 15% de desconto ao período.'
          : ''
      }
    }

    // Event delegation: funciona mesmo se a seção for re-renderizada pelo preview.
    on(root, 'change', (event) => {
      const target = event.target as HTMLElement | null
      if (target?.matches('.custom-plan-service, .custom-plan-months')) updateCustomPlan()
    })
    updateCustomPlan()

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
