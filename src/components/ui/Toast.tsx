import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'

interface ToastMessage {
  id: number
  text: string
}

interface ToastValue {
  push: (text: string) => void
}

const ToastContext = createContext<ToastValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ToastMessage[]>([])
  const counter = useRef(0)

  const push = useCallback((text: string) => {
    counter.current += 1
    const id = counter.current
    setMessages((previous) => [...previous, { id, text }])
    window.setTimeout(() => {
      setMessages((previous) => previous.filter((message) => message.id !== id))
    }, 2600)
  }, [])

  const value = useMemo<ToastValue>(() => ({ push }), [push])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex flex-col items-center gap-2 px-6 lg:bottom-10"
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className="animate-rise rounded-sm border border-divider bg-deep/95 px-4 py-2 text-[12.5px] tracking-[0.04em] text-starlight shadow-[0_10px_30px_-12px_rgba(0,0,0,0.8)] backdrop-blur"
          >
            {message.text}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastValue {
  const value = useContext(ToastContext)
  if (!value) throw new Error('useToast must be used inside <ToastProvider>')
  return value
}
