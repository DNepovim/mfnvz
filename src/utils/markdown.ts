import { Marked, Renderer } from 'marked'

const renderer = new Renderer()
renderer.link = ({ href, text }) => {
  const isExternal = /^https?:\/\//.test(href)
  const attrs = isExternal ? ' target="_blank" rel="noopener noreferrer"' : ''
  return `<a href="${href}"${attrs}>${text}</a>`
}

const marked = new Marked({ renderer })

export const renderMarkdown = (text: string): string => marked.parse(text) as string
