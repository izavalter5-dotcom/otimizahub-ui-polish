import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useMemo, useRef, useState } from 'react'
import rawPage from '../content/otimizahub.html?raw'
import workspaceImage from '../assets/hero-workspace.jpg'
import contactImage from '../assets/contact-people.jpg'
import foodImage from '../assets/menu-food.jpg'
import goldLogo from '../assets/otimizahub-logo-gold-cropped.png'
import solucaoGoogleImage from '../assets/solucoes-google-otimizahub.png'
import solucaoLandingImage from '../assets/solucoes-landing-page-otimizahub.png'
import solucaoMetaAdsImage from '../assets/solucoes-meta-ads-otimizahub.png'
import solucaoInstagramImage from '../assets/solucoes-instagram-otimizahub.png'

const description = 'A OtimizaHub simplifica a presença digital de micro e pequenas empresas com Perfil da Empresa no Google, landing pages profissionais e páginas de vendas.'

export const Route = createFileRoute('/')({
  ssr: false,
  head: () => ({ meta: [
    { title: 'OtimizaHub — Visibilidade digital para pequenos negócios' },
    { name: 'description', content: description },
    { property: 'og:title', content: 'OtimizaHub — Visibilidade digital para pequenos negócios' },
    { property: 'og:description', content: description },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
  ] }),
  component: Index,
})

// Preview refresh marker
function Index() {
  const container = useRef<HTMLDivElement>(null)
  const pageMarkup = useMemo(() => {
    const html = rawPage
      .replaceAll('/media/otimizahub-logo-light.webp', goldLogo)
      .replaceAll('/media/otimizahub-logo-dark.webp', goldLogo)
    const withoutPlans = html.replace(/<section[^>]*\bid=["']planos["'][^>]*>[\s\S]*?<\/section>/i, '')
    return { __html: withoutPlans }
  }, [])
  const [imageReady, setImageReady] = useState(false)
  useEffect(() => {
    const root = container.current
    if (!root) return
    const previousScrollRestoration = window.history.scrollRestoration
    window.history.scrollRestoration = 'manual'
    if (!window.location.hash) window.scrollTo(0, 0)
    const scrollToHash = () => {
      const id = window.location.hash.replace(/^#/, '')
      if (!id) return
      requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
    }
    scrollToHash()
    window.addEventListener('hashchange', scrollToHash)
    const heroPhoto = root.querySelector<HTMLImageElement>('.oh-hero-media img')
    if (heroPhoto && Math.random() < .5) heroPhoto.src = workspaceImage
    const contactPhoto = root.querySelector<HTMLImageElement>('.oh-contact-media img')
    if (contactPhoto) contactPhoto.src = contactImage
    root.style.setProperty('--oh-menu-image', `url("${foodImage}")`)
    setImageReady(true)
    const query = <T extends Element>(selector: string) => root.querySelector<T>(selector)
    const events: Array<() => void> = []
    const on = (el: Element | null, event: string, fn: EventListener) => {
      el?.addEventListener(event, fn)
      if (el) events.push(() => el.removeEventListener(event, fn))
    }
    const dark = (value: boolean) => {
      root.classList.toggle('theme-dark', value)
      try { localStorage.setItem('otimizahub-theme', value ? 'dark' : 'light') } catch { /* storage may be blocked */ }
      const icon = query('#theme-icon')
      if (icon) icon.textContent = value ? '☀' : '☾'
      const mobile = query('#theme-toggle-mobile')
      if (mobile) mobile.textContent = value ? '☀ Tema claro' : '☾ Tema escuro'
      root.querySelectorAll('#theme-toggle, #theme-toggle-mobile').forEach(el => {
        el.setAttribute('aria-label', value ? 'Ativar tema claro' : 'Ativar tema escuro')
        el.setAttribute('title', value ? 'Ativar tema claro' : 'Ativar tema escuro')
      })
    }
    try { dark(localStorage.getItem('otimizahub-theme') === 'dark') } catch { dark(false) }
    root.querySelectorAll('#theme-toggle, #theme-toggle-mobile').forEach(el => on(el, 'click', () => dark(!root.classList.contains('theme-dark'))))
    const menu = query('#mobile-menu')
    const menuBtn = query('#menu-btn')
    const openIcon = query('#icon-open')
    const closeIcon = query('#icon-close')
    const closeMenu = () => {
      menu?.classList.add('hidden'); openIcon?.classList.remove('hidden'); closeIcon?.classList.add('hidden'); menuBtn?.setAttribute('aria-expanded', 'false')
    }
    on(menuBtn, 'click', () => {
      const open = menu?.classList.contains('hidden')
      menu?.classList.toggle('hidden', !open); openIcon?.classList.toggle('hidden', Boolean(open)); closeIcon?.classList.toggle('hidden', !open)
      menuBtn?.setAttribute('aria-expanded', String(Boolean(open)))
    })
    menu?.querySelectorAll('a').forEach(el => on(el, 'click', closeMenu))
    on(query('#voltar-topo'), 'click', () => window.scrollTo({ top: 0, behavior: 'smooth' }))
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('in'); observer.unobserve(entry.target) }
    }), { threshold: .08 })
    root.querySelectorAll('.reveal').forEach(el => observer.observe(el))
    root.querySelectorAll<HTMLElement>('.showcase-tab').forEach(tab => on(tab, 'click', () => {
      const key = tab.dataset['showcase']
      root.querySelectorAll<HTMLElement>('.showcase-tab').forEach(item => {
        const active = item.dataset['showcase'] === key
        item.classList.toggle('active', active); item.setAttribute('aria-selected', String(active))
      })
      root.querySelectorAll<HTMLElement>('.showcase-panel').forEach(panel => {
        const active = panel.id === `preview-${key}`
        panel.classList.toggle('active', active); panel.hidden = !active
      })
    }))
    const updateCustomPlan = () => {
      const selected = Array.from(root.querySelectorAll<HTMLInputElement>('.custom-plan-service')).filter(input => input.checked)
      const money = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
      const totalEl = query<HTMLElement>('#custom-plan-total strong')
      const items = query<HTMLElement>('#custom-plan-items')
      const summary = query<HTMLElement>('#custom-plan-summary')
      const maintenance = query<HTMLElement>('#custom-plan-maintenance')
      let total = 0
      let needsQuote = false
      const rows: string[] = []

      root.querySelectorAll<HTMLElement>('.custom-plan-months-wrap').forEach(wrap => {
        const group = wrap.dataset['monthsFor']
        const maintenanceInput = root.querySelector<HTMLInputElement>(`.custom-plan-service[data-kind="maintenance"][data-group="${group}"]`)
        const select = wrap.querySelector<HTMLSelectElement>('select')
        wrap.classList.toggle('hidden', !maintenanceInput?.checked)
        if (maintenanceInput?.checked && select && select.value === '0') select.value = '1'
      })

      selected.forEach(input => {
        const kind = input.dataset['kind'] || 'setup'
        const price = input.dataset['price'] ? Number(input.dataset['price']) : null
        if (price === null) {
          needsQuote = true
          rows.push('<div class="flex justify-between gap-4 text-sm text-navy"><span>'+input.value+'</span><strong>Sob consulta</strong></div>')
          return
        }
        if (kind === 'maintenance') {
          const group = input.dataset['group'] || ''
          const select = root.querySelector<HTMLSelectElement>(`select[data-months-group="${group}"]`)
          const months = Number(select?.value || 0)
          const discounted = price * months * 0.85
          if (months > 0) {
            total += discounted
            rows.push('<div class="flex justify-between gap-4 text-sm text-navy"><span>'+input.value+' · '+months+' mês(es)</span><strong>'+money(discounted)+'</strong></div>')
          }
        } else if (kind === 'monthly') {
          total += price
          rows.push('<div class="flex justify-between gap-4 text-sm text-navy"><span>'+input.value+'</span><strong>'+money(price)+'/mês</strong></div>')
        } else {
          total += price
          rows.push('<div class="flex justify-between gap-4 text-sm text-navy"><span>'+input.value+'</span><strong>'+money(price)+'</strong></div>')
        }
      })

      if (totalEl) totalEl.textContent = money(total)
      if (items) items.innerHTML = rows.length ? rows.join('') : ''
      if (!selected.length) {
        if (summary) summary.textContent = 'Selecione pelo menos um serviço para montar sua solicitação.'
        if (maintenance) maintenance.textContent = ''
      } else {
        if (summary) summary.innerHTML = '<strong>Total estimado: '+money(total)+'</strong>' + (needsQuote ? ' <span class="text-xs text-muted">+ serviço com valor sob consulta</span>' : '')
        if (maintenance) maintenance.textContent = selected.some(input => input.dataset['kind'] === 'maintenance') ? 'Manutenções calculadas com 15% de desconto para o período escolhido.' : ''
      }
    }
    root.querySelectorAll<HTMLInputElement>('.custom-plan-service').forEach(input => on(input, 'change', updateCustomPlan))
    root.querySelectorAll<HTMLSelectElement>('.custom-plan-months').forEach(select => on(select, 'change', updateCustomPlan))
    updateCustomPlan()

    root.querySelectorAll<HTMLElement>('.plano-cta').forEach(el => on(el, 'click', () => {
      const select = query<HTMLSelectElement>('#servico')
      if (select && el.dataset['plano']) select.value = el.dataset['plano']
    }))
    const year = query('#ano')
    if (year) year.textContent = String(new Date().getFullYear())
    const banner = query('#cookie-banner')
    try { if (localStorage.getItem('otimizahub-cookie-consent') === 'accepted') banner?.remove() } catch { /* storage may be blocked */ }
    on(query('#cookie-accept'), 'click', () => {
      try { localStorage.setItem('otimizahub-cookie-consent', 'accepted') } catch { /* storage may be blocked */ }
      banner?.remove()
    })
    return () => { observer.disconnect(); events.forEach(off => off()); window.removeEventListener('hashchange', scrollToHash); window.history.scrollRestoration = previousScrollRestoration }
  }, [])
  return <div ref={container} className="oh-page" data-images-ready={imageReady ? 'true' : undefined} dangerouslySetInnerHTML={pageMarkup} />
}
