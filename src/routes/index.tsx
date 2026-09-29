import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import rawPage from '../content/otimizahub.html?raw'
import { Globe } from '../components/Globe'

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

function Index() {
  const container = useRef<HTMLDivElement>(null)
  const [globeTarget, setGlobeTarget] = useState<HTMLElement | null>(null)
  useEffect(() => {
    const root = container.current
    if (!root) return
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
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('in'); observer.unobserve(entry.target) }
    }), { threshold: .08 })
    root.querySelectorAll('.reveal').forEach(el => observer.observe(el))
    root.querySelectorAll<HTMLElement>('.showcase-tab').forEach(tab => on(tab, 'click', () => {
      const key = tab.dataset.showcase
      root.querySelectorAll<HTMLElement>('.showcase-tab').forEach(item => {
        const active = item.dataset.showcase === key
        item.classList.toggle('active', active); item.setAttribute('aria-selected', String(active))
      })
      root.querySelectorAll<HTMLElement>('.showcase-panel').forEach(panel => {
        const active = panel.id === `preview-${key}`
        panel.classList.toggle('active', active); panel.hidden = !active
      })
    }))
    root.querySelectorAll<HTMLElement>('.plano-cta').forEach(el => on(el, 'click', () => {
      const select = query<HTMLSelectElement>('#servico')
      if (select && el.dataset.plano) select.value = el.dataset.plano
    }))
    const year = query('#ano')
    if (year) year.textContent = String(new Date().getFullYear())
    const banner = query('#cookie-banner')
    try { if (localStorage.getItem('otimizahub-cookie-consent') === 'accepted') banner?.remove() } catch { /* storage may be blocked */ }
    on(query('#cookie-accept'), 'click', () => {
      try { localStorage.setItem('otimizahub-cookie-consent', 'accepted') } catch { /* storage may be blocked */ }
      banner?.remove()
    })
    const globeEl = query<HTMLElement>('#oh-globe-root')
    setGlobeTarget(globeEl)
    return () => { observer.disconnect(); events.forEach(off => off()); setGlobeTarget(null) }
  }, [])
  return <><div ref={container} className="oh-page" dangerouslySetInnerHTML={{ __html: rawPage }} />{globeTarget && createPortal(<Globe />, globeTarget)}</>
}
