import { getCollection, type CollectionEntry } from 'astro:content'
import { ImageResponse } from '@vercel/og'
import sharp from 'sharp'

export async function getStaticPaths() {
  const posts = await getCollection('seasons')
  const sorted = [...posts].sort((a, b) => a.id.localeCompare(b.id))
  return sorted.map((post, index) => ({
    params: { id: post.id },
    props: { post, seasonNumber: index + 1 },
  }))
}

type Props = {
  post: CollectionEntry<'seasons'>
  seasonNumber: number
}

type SatoriStyle = Record<string, string | number>

type SatoriNode = {
  type: string
  props: {
    tw?: string
    style?: SatoriStyle
    src?: string
    children?: SatoriNode | SatoriNode[] | string
  }
}

let typekitCssCache: string | null = null

const loadTypekitCss = async () => {
  if (typekitCssCache) return typekitCssCache
  typekitCssCache = await fetch('https://use.typekit.net/tai1czq.css').then((r) =>
    r.text(),
  )
  return typekitCssCache
}

const extractOpentypeUrl = (css: string, family: string, weight: number): string => {
  const blocks = css.matchAll(/@font-face\s*\{([^}]+)\}/g)
  for (const match of blocks) {
    const block = match[1]
    if (!block?.includes(`font-family:"${family}"`)) continue
    if (!block.includes(`font-weight:${String(weight)}`)) continue
    const url = /url\("([^"]+)"\) format\("opentype"\)/.exec(block)?.[1]
    if (url) return url
  }
  throw new Error(
    `${family} weight ${String(weight)} opentype URL not found in typekit CSS`,
  )
}

let liebedoniCache: ArrayBuffer | null = null
let openSansCache: ArrayBuffer | null = null

const loadLiebedoni = async () => {
  if (liebedoniCache) return liebedoniCache
  const css = await loadTypekitCss()
  const url = extractOpentypeUrl(css ?? '', 'liebedoni-outline', 400)
  liebedoniCache = await fetch(url).then((r) => r.arrayBuffer())
  return liebedoniCache
}

const loadOpenSans = async () => {
  if (openSansCache) return openSansCache
  const css = await loadTypekitCss()
  const url = extractOpentypeUrl(css ?? '', 'open-sans', 300)
  openSansCache = await fetch(url).then((r) => r.arrayBuffer())
  return openSansCache
}

export async function GET({ props }: { props: Props }) {
  const { post, seasonNumber } = props
  const [liebedoniData, openSansData] = await Promise.all([
    loadLiebedoni(),
    loadOpenSans(),
  ])

  const element: SatoriNode = {
    type: 'div',
    props: {
      tw: 'flex w-full h-full relative',
      style: { border: '8px solid white', borderRadius: 16, overflow: 'hidden' },
      children: [
        {
          type: 'img',
          props: {
            src: post.data.cover.replace(
              '/upload/',
              '/upload/c_fill,w_1200,h_630,q_80,f_jpg/',
            ),
            tw: 'absolute inset-0 w-full h-full',
            style: { objectFit: 'cover' },
          },
        },
        {
          type: 'div',
          props: {
            tw: 'absolute inset-0',
            style: {
              background:
                'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0) 100%)',
            },
          },
        },
        {
          type: 'div',
          props: {
            tw: 'absolute flex flex-col',
            style: { bottom: 28, left: 34 },
            children: [
              {
                type: 'span',
                props: {
                  style: {
                    fontFamily: 'liebedoni-outline',
                    fontSize: 88,
                    color: 'white',
                    lineHeight: 1.2,
                    letterSpacing: '-0.02em',
                    textShadow: '0 2px 12px rgba(0,0,0,0.8)',
                  },
                  children: 'Malý festival',
                },
              },
              {
                type: 'span',
                props: {
                  style: {
                    fontFamily: 'liebedoni-outline',
                    fontSize: 52,
                    color: 'white',
                    lineHeight: 1.2,
                    textShadow: '0 2px 12px rgba(0,0,0,0.8)',
                  },
                  children: 'na velké zahradě',
                },
              },
              {
                type: 'span',
                props: {
                  style: {
                    fontFamily: 'open-sans',
                    fontWeight: 300,
                    fontSize: 28,
                    color: 'white',
                    marginTop: 20,
                    letterSpacing: '0.02em',
                    textShadow: '0 2px 8px rgba(0,0,0,0.8)',
                  },
                  children: `${String(seasonNumber)}. ročník,  ${post.data.startDate.toLocaleDateString('cs-CZ')},  Řevnice`,
                },
              },
            ],
          },
        },
      ],
    },
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const png = await new ImageResponse(element as any, {
    width: 1200,
    height: 630,
    fonts: [
      { name: 'liebedoni-outline', data: liebedoniData!, style: 'normal', weight: 400 },
      { name: 'open-sans', data: openSansData!, style: 'normal', weight: 300 },
    ],
  }).arrayBuffer()

  const jpeg = await sharp(Buffer.from(png)).jpeg({ quality: 85 }).toBuffer()

  return new Response(jpeg, {
    headers: { 'Content-Type': 'image/jpeg' },
  })
}
