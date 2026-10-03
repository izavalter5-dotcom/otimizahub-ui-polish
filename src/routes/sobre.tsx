import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useMemo, useRef } from 'react'
import rawPage from '../content/otimizahub.html?raw'
import goldLogo from '../assets/otimizahub-logo-gold-cropped.png'

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
    const about = extractElement(html, '#sobre')
    const team = extractElement(html, '#equipe')
    const footer = extractTag(html, 'footer')
    return { __html: header + about + team + footer }
  }, [])

  useEffect(() => {
    const root = container.current
    if (!root) return
    const dark = (value: boolean) => {
      root.classList.toggle('theme-dark', value)
      try { localStorage.setItem('otimizahub-theme', value ? 'dark' : 'light') } catch {}
      const icon = root.querySelector('#theme-icon'); if (icon) icon.textContent = value ? '☀' : '☾'
      root.querySelectorAll('#theme-toggle, #theme-toggle-mobile').forEach(el => el.setAttribute('aria-label', value ? 'Ativar tema claro' : 'Ativar tema escuro'))
    }
    try { dark(localStorage.getItem('otimizahub-theme') === 'dark') } catch { dark(false) }
    const offs: Array<() => void> = []
    const on=(el:Element|null,event:string,fn:EventListener)=>{ if(el){el.addEventListener(event,fn);offs.push(()=>el.removeEventListener(event,fn))} }
    root.querySelectorAll('#theme-toggle, #theme-toggle-mobile').forEach(el=>on(el,'click',()=>dark(!root.classList.contains('theme-dark'))))
    const menu=root.querySelector('#mobile-menu'), menuBtn=root.querySelector('#menu-btn'), open=root.querySelector('#icon-open'), close=root.querySelector('#icon-close')
    on(menuBtn,'click',()=>{const isOpen=menu?.classList.contains('hidden');menu?.classList.toggle('hidden',!isOpen);open?.classList.toggle('hidden',Boolean(isOpen));close?.classList.toggle('hidden',!Boolean(isOpen));menuBtn?.setAttribute('aria-expanded',String(Boolean(isOpen)))})
    root.querySelectorAll('#mobile-menu a').forEach(el=>on(el,'click',()=>{menu?.classList.add('hidden');open?.classList.remove('hidden');close?.classList.add('hidden')}))
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('in');observer.unobserve(entry.target)}}),{threshold:.08})
    root.querySelectorAll('.reveal').forEach(el=>observer.observe(el))
    return ()=>{observer.disconnect();offs.forEach(off=>off())}
  }, [])
  return <div ref={container} className="oh-page" dangerouslySetInnerHTML={markup} />
}

export const Route = createFileRoute('/sobre')({
  ssr: false,
  head: () => ({ meta: [
    { title: 'Sobre — OtimizaHub' },
    { name: 'description', content: 'Conheça as pessoas, o propósito e a forma de trabalho da OtimizaHub.' },
  ] }),
  component: StandalonePage,
})
