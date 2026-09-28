import { useEffect, useRef, useState } from 'react'
import {
  ArrowDown,
  ArrowUp,
  BookOpen,
  CircleHelp,
  Home,
  Layers3,
  List,
  Orbit,
  Route,
  Save,
  X,
} from 'lucide-react'

export type Page = 'home' | 'plan' | 'materials' | 'evidence' | 'saved' | 'result' | 'methodology'
const items = [
  { page: 'home', label: 'Workspace', Icon: Home },
  { page: 'plan', label: 'New journey', Icon: Route },
  { page: 'materials', label: 'Materials', Icon: Layers3 },
  { page: 'evidence', label: 'Evidence', Icon: BookOpen },
  { page: 'saved', label: 'Saved plans', Icon: Save },
] as const
export function Navigation({ page, onNavigate }: { page: Page; onNavigate: (p: Page) => void }) {
  const [open, setOpen] = useState(false),
    [angle, setAngle] = useState(0),
    [list, setList] = useState(false)
  const dialog = useRef<HTMLDialogElement>(null),
    trigger = useRef<HTMLButtonElement>(null),
    drag = useRef<{ x: number; angle: number } | null>(null)
  useEffect(() => {
    if (open) dialog.current?.showModal()
    else dialog.current?.close()
  }, [open])
  const close = () => {
    setOpen(false)
    trigger.current?.focus()
  }
  const go = (p: Page) => {
    close()
    onNavigate(p)
  }
  return (
    <>
      <button
        className="orbit-trigger"
        ref={trigger}
        aria-label="Open navigation menu"
        aria-haspopup="dialog"
        onMouseEnter={() => {
          if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) setOpen(true)
        }}
        onClick={() => setOpen(true)}
      >
        <Orbit size={24} />
        <span>Menu</span>
      </button>
      <nav className="mobile-nav" aria-label="Main navigation">
        {items
          .filter((i) => i.page !== 'evidence')
          .map(({ page: p, label, Icon }) => (
            <button
              key={p}
              aria-label={label}
              className={p === page ? 'active' : ''}
              onClick={() => onNavigate(p)}
            >
              <Icon size={21} />
              <span>{label.split(' ')[0]}</span>
            </button>
          ))}
        <button aria-label="More navigation" onClick={() => setOpen(true)}>
          <Orbit size={21} />
          <span>More</span>
        </button>
      </nav>
      <dialog
        ref={dialog}
        className="orbit-dialog"
        onCancel={close}
        onClose={() => setOpen(false)}
        onClick={(e) => {
          if (e.target === e.currentTarget) close()
        }}
        aria-labelledby="menu-title"
      >
        <div className="orbit-panel">
          <div className="modal-top">
            <span className="eyebrow" id="menu-title">
              YOUR WORKSPACE, IN ORBIT
            </span>
            <button className="icon-button" aria-label="Close navigation" onClick={close}>
              <X />
            </button>
          </div>
          <div
            className={`orbit-wheel ${list ? 'as-list' : ''}`}
            onWheel={(e) => {
              setAngle((a) => a + (e.deltaY > 0 ? 18 : -18))
            }}
            onPointerDown={(e) => {
              if ((e.target as HTMLElement).closest('button')) return
              drag.current = { x: e.clientX, angle }
              e.currentTarget.setPointerCapture(e.pointerId)
            }}
            onPointerMove={(e) => {
              if (drag.current) setAngle(drag.current.angle + (e.clientX - drag.current.x) * 0.55)
            }}
            onPointerUp={() => {
              drag.current = null
            }}
            onPointerCancel={() => {
              drag.current = null
            }}
          >
            <div className="orbit-ring" />
            <div className="orbit-center">
              <Orbit size={30} />
              <strong>Where next?</strong>
              <small>Scroll or drag to rotate</small>
            </div>
            {items.map(({ page: p, label, Icon }, i) => {
              const rad = ((i * 72 - 90 + angle) * Math.PI) / 180
              return (
                <button
                  key={p}
                  className={`orbit-destination ${page === p ? 'selected' : ''}`}
                  style={
                    list
                      ? {}
                      : {
                          left: `calc(50% + ${Math.cos(rad) * 151}px)`,
                          top: `calc(50% + ${Math.sin(rad) * 151}px)`,
                        }
                  }
                  onClick={() => go(p)}
                >
                  <Icon size={23} />
                  <span>{label}</span>
                </button>
              )
            })}
          </div>
          <div className="orbit-controls">
            <button
              className="icon-button"
              aria-label="Rotate navigation counterclockwise"
              onClick={() => setAngle((a) => a - 72)}
            >
              <ArrowUp size={18} />
            </button>
            <button className="text-button" onClick={() => setList((v) => !v)}>
              <List size={17} />
              {list ? 'Wheel view' : 'List view'}
            </button>
            <button
              className="icon-button"
              aria-label="Rotate navigation clockwise"
              onClick={() => setAngle((a) => a + 72)}
            >
              <ArrowDown size={18} />
            </button>
          </div>
          <button className="method-link" onClick={() => go('methodology')}>
            <CircleHelp size={16} />
            How the calculations work
          </button>
        </div>
      </dialog>
    </>
  )
}
