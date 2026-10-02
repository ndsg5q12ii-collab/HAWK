import { createContext, useContext, useEffect, useState, type ReactNode, type MouseEvent } from 'react'

// Minimal hash router — keeps the prototype dependency-free while matching the spec route map.
type RouteCtx = { path: string; navigate: (to: string) => void; back: () => void }
const Ctx = createContext<RouteCtx>({ path: '/', navigate: () => {}, back: () => {} })

const read = () => window.location.hash.replace(/^#/, '') || '/'

export function RouterProvider({ children }: { children: ReactNode }) {
  const [path, setPath] = useState(read)
  useEffect(() => {
    const on = () => {
      setPath(read())
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  const navigate = (to: string) => {
    window.location.hash = to
  }
  const back = () => window.history.back()
  return <Ctx.Provider value={{ path, navigate, back }}>{children}</Ctx.Provider>
}

export const useRouter = () => useContext(Ctx)

export function matchPath(pattern: string, path: string): Record<string, string> | null {
  const p = pattern.split('/').filter(Boolean)
  const a = path.split('?')[0].split('/').filter(Boolean)
  if (p.length !== a.length) return null
  const params: Record<string, string> = {}
  for (let i = 0; i < p.length; i++) {
    if (p[i].startsWith(':')) params[p[i].slice(1)] = decodeURIComponent(a[i])
    else if (p[i] !== a[i]) return null
  }
  return params
}

export function Link({ to, className, children, ...rest }: { to: string; className?: string; children: ReactNode; 'aria-label'?: string }) {
  const { navigate } = useRouter()
  return (
    <a
      href={`#${to}`}
      className={className}
      onClick={(e: MouseEvent) => {
        e.preventDefault()
        navigate(to)
      }}
      {...rest}
    >
      {children}
    </a>
  )
}
