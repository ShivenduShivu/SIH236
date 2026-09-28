import { useEffect, useRef, useState } from 'react'
import {
  ArrowDownRight,
  ArrowRight,
  BookOpen,
  Camera,
  Check,
  ChevronRight,
  Code2,
  Leaf,
  LoaderCircle,
  Mic,
  Route,
  RotateCcw,
  X,
} from 'lucide-react'
import type { Catalog, Example, Result, Saved, Scenario } from './types'
import { download, evaluate, request } from './api'
import { Navigation } from './Navigation'
import type { Page } from './Navigation'
import { ProduceArt } from './Artwork'
import { Planner } from './Planner'
import { Results } from './Results'
import { Evidence, Materials, Methodology, SavedPlans } from './Library'
import { InputDialog } from './InputDialog'
import { readPlans, STORE } from './storage'

export default function App() {
  const [initialStorage] = useState(readPlans)
  const [catalog, setCatalog] = useState<Catalog | null>(null),
    [examples, setExamples] = useState<Example[]>([]),
    [loading, setLoading] = useState(true),
    [loadError, setLoadError] = useState(''),
    [page, setPage] = useState<Page>(location.pathname === '/methodology' ? 'methodology' : 'home'),
    [scenario, setScenario] = useState<Scenario | null>(null),
    [result, setResult] = useState<Result | null>(null),
    [previous, setPrevious] = useState<Result | null>(null),
    [plans, setPlans] = useState<Saved[]>(initialStorage.plans),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [toast, setToast] = useState(''),
    [inputMode, setInputMode] = useState<'voice' | 'import' | 'photo' | null>(null),
    [revision, setRevision] = useState(0)
  const generation = useRef(0),
    toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const notify = (message: string) => {
    setToast(message)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(''), 6500)
  }
  const load = async () => {
    setLoading(true)
    setLoadError('')
    try {
      const [c, e] = await Promise.all([
        request<Catalog>('/api/catalog'),
        request<Example[]>('/api/examples'),
      ])
      setCatalog(c)
      setExamples(e)
    } catch {
      setLoadError(
        'The local service is not reachable. Start Packora with the local launcher, then retry. Your saved plans remain in this browser.',
      )
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    void load()
    if (initialStorage.notice) notify(initialStorage.notice)
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current)
    }
  }, [])
  useEffect(() => {
    const titles: Record<Page, string> = {
      home: 'Workspace',
      plan: 'Plan a journey',
      result: 'Your packaging plan',
      materials: 'Materials',
      evidence: 'Evidence',
      saved: 'Saved plans',
      methodology: 'The method',
    }
    document.title = `${titles[page]} · Packora`
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [page])
  const changeScenario = (s: Scenario) => {
    generation.current++
    setScenario(s)
    setBusy(false)
    setError('')
  }
  const start = (s?: Scenario) => {
    generation.current++
    setBusy(false)
    setPrevious(null)
    setError('')
    setRevision((v) => v + 1)
    if (s) setScenario(structuredClone(s))
    else if (examples.length) {
      const seed = structuredClone(examples[0].scenario)
      setScenario({
        ...seed,
        title: 'My packaging plan',
        shipment_kg: 0,
        maturity: 'unknown',
        rough_handling: false,
        stages: seed.stages.map((st) => ({
          ...st,
          hours: 0,
          temperature_c: null,
          rh_percent: null,
        })),
      })
    } else {
      notify('Start the local service to create a new plan.')
      return
    }
    setPage('plan')
    setInputMode(null)
  }
  const navigate = (p: Page) => {
    if (p === 'plan') {
      start()
      return
    }
    generation.current++
    setBusy(false)
    setError('')
    setPage(p)
  }
  const run = async (s: Scenario, compare = false) => {
    const current = ++generation.current
    setBusy(true)
    setError('')
    try {
      const r = await evaluate(s)
      if (current !== generation.current) return
      setPrevious(compare ? result : null)
      setResult(r)
      setScenario(r.scenario)
      setPage('result')
      if (compare)
        notify('The changed condition has been recalculated. Review the inputs and checks below.')
    } catch (e) {
      if (current === generation.current)
        setError(e instanceof Error ? e.message : 'The local calculation failed. Please retry.')
    } finally {
      if (current === generation.current) setBusy(false)
    }
  }
  const persist = (next: Saved[]) => {
    try {
      localStorage.setItem(STORE, JSON.stringify(next))
      setPlans(next)
      return true
    } catch {
      notify('Browser storage is unavailable or full. Export JSON to keep your plan.')
      return false
    }
  }
  const save = () => {
    if (!result) return
    const next = [
      { id: result.fingerprint, savedAt: new Date().toISOString(), result },
      ...plans.filter((p) => p.id !== result.fingerprint),
    ].slice(0, 20)
    if (persist(next))
      notify(
        'Saved in this browser. Export a copy for another device. Up to 20 recent plans are kept.',
      )
  }
  const openSaved = (p: Saved) => {
    generation.current++
    setBusy(false)
    setError('')
    setPrevious(null)
    setScenario(p.result.scenario)
    setResult(p.result)
    setPage('result')
    notify('Opened a saved snapshot. Edit and recalculate to use the current engine and catalogue.')
  }
  const activeView =
    page === 'result'
      ? 'Your plan'
      : page === 'home'
        ? 'Workspace'
        : page === 'plan'
          ? 'New journey'
          : page.charAt(0).toUpperCase() + page.slice(1)
  return (
    <div className="app-shell">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <header className="site-header">
        <button className="brand" onClick={() => navigate('home')} aria-label="Packora workspace">
          <span className="brand-mark">
            <Leaf size={25} />
          </span>
          packora<span className="brand-dot">.</span>
        </button>
        <div className="header-divider" />
        <span className="header-context">{activeView}</span>
        <nav aria-label="Workspace shortcuts">
          <button className="header-link" onClick={() => navigate('methodology')}>
            The method
          </button>
          <button className="header-link" onClick={() => navigate('saved')}>
            Saved plans<span className="count">{plans.length}</span>
          </button>
          <span className="local-badge">
            <span />
            Local workspace
          </span>
        </nav>
      </header>
      <Navigation page={page} onNavigate={navigate} />
      {loading ? (
        <main className="loading-page" id="main-content">
          <LoaderCircle className="spin" />
          <p>Opening your workspace…</p>
        </main>
      ) : loadError ? (
        <main className="page" id="main-content">
          <div className="empty-state">
            <Route size={38} />
            <h1>Let's connect your workspace.</h1>
            <p>{loadError}</p>
            <button className="button primary" onClick={load}>
              <RotateCcw size={18} />
              Retry connection
            </button>
            {plans.length > 0 && (
              <button
                className="text-button"
                onClick={() =>
                  download(
                    'packora-saved-plans.json',
                    JSON.stringify(plans, null, 2),
                    'application/json',
                  )
                }
              >
                Export saved snapshots
              </button>
            )}
          </div>
        </main>
      ) : (
        <>
          {page === 'home' && (
            <main className="page home-page" id="main-content">
              <section className="hero">
                <div className="hero-copy">
                  <span className="eyebrow pill">
                    <span />
                    FROM FOOD TO A THOUGHTFUL PACK
                  </span>
                  <h1>
                    Your harvest.
                    <br />
                    Ready for the
                    <br />
                    <em>journey.</em>
                  </h1>
                  <p>
                    Tell us what you're packing, where the time goes, and how it will travel. Find a
                    packaging direction with the reasoning behind it.
                  </p>
                  <div className="hero-actions">
                    <button className="button primary large" onClick={() => start()}>
                      Plan a new journey
                      <ArrowRight size={20} />
                    </button>
                    <button
                      className="round-button"
                      aria-label="Speak your requirements"
                      title="Speak or type your requirements"
                      onClick={() => setInputMode('voice')}
                    >
                      <Mic size={24} />
                    </button>
                    <button
                      className="round-button"
                      aria-label="Start with a produce photo"
                      title="Use a photo and confirm the food"
                      onClick={() => setInputMode('photo')}
                    >
                      <Camera size={24} />
                    </button>
                  </div>
                  <small className="hero-helper">
                    No technical measurements? Start with what you know.
                  </small>
                </div>
                <div className="hero-art">
                  <div className="hero-art-top">
                    <span>FRESH THINKING</span>
                    <span>01 / THE JOURNEY</span>
                  </div>
                  <ProduceArt />
                  <div className="floating-route">
                    <Route size={23} />
                    <div>
                      <strong>Every stop matters.</strong>
                      <span>Before. During. After arrival.</span>
                    </div>
                    <ArrowDownRight size={22} />
                  </div>
                </div>
              </section>
              <section className="home-examples">
                <div className="section-bar">
                  <div>
                    <span className="eyebrow">TAKE IT FOR A SPIN</span>
                    <h2>Three foods. Three different questions.</h2>
                  </div>
                  <button className="text-button" onClick={() => setInputMode('import')}>
                    <Code2 size={17} />
                    Import JSON
                    <ArrowRight size={17} />
                  </button>
                </div>
                <div className="example-list">
                  {examples.map((ex, i) => (
                    <button className="example-card" key={ex.id} onClick={() => start(ex.scenario)}>
                      <span className="example-index">0{i + 1}</span>
                      <div className={`example-symbol ${ex.scenario.commodity}`}>
                        <ProduceArt kind={ex.scenario.commodity} small />
                      </div>
                      <span className="eyebrow">{ex.tag}</span>
                      <h3>{ex.label}</h3>
                      <p>{ex.description}</p>
                      <span className="example-open">
                        Explore this example
                        <ArrowRight size={17} />
                      </span>
                    </button>
                  ))}
                </div>
              </section>
              <section className="home-bottom">
                <div>
                  <BookOpen size={27} />
                  <h2>More than a material name.</h2>
                  <p>
                    Calculated requirements. Visible assumptions. Sources you can inspect. A
                    practical next step when the evidence runs out.
                  </p>
                  <button className="text-button" onClick={() => navigate('evidence')}>
                    Explore the evidence
                    <ArrowRight size={17} />
                  </button>
                </div>
                <div>
                  <span className="eyebrow">PICK UP WHERE YOU LEFT OFF</span>
                  {plans.length ? (
                    <button className="recent-plan" onClick={() => openSaved(plans[0])}>
                      <Route size={27} />
                      <span>
                        <strong>{plans[0].result.scenario.title}</strong>
                        <small>{plans[0].result.journey_hours} hours · Saved in this browser</small>
                      </span>
                      <ChevronRight size={20} />
                    </button>
                  ) : (
                    <div className="recent-empty">
                      <Leaf size={25} />
                      <p>
                        Your saved plans will appear here.
                        <br />
                        <small>Build a plan, then keep a copy.</small>
                      </p>
                    </div>
                  )}
                </div>
              </section>
            </main>
          )}
          {page === 'plan' && scenario && catalog && (
            <Planner
              key={revision}
              scenario={scenario}
              catalog={catalog}
              onChange={changeScenario}
              onEvaluate={() => void run(scenario)}
              busy={busy}
              error={error}
              onBack={() => navigate('home')}
            />
          )}
          {page === 'result' && result && (
            <>
              <Results
                key={result.fingerprint}
                result={result}
                previous={previous}
                busy={busy}
                onExplore={(s) => void run(s, true)}
                onEdit={() => {
                  generation.current++
                  setBusy(false)
                  setError('')
                  setRevision((v) => v + 1)
                  setPrevious(null)
                  setPage('plan')
                }}
                onHome={() => navigate('home')}
                onSave={save}
                onMethod={() => navigate('methodology')}
                saved={plans.some((p) => p.id === result.fingerprint)}
              />
              {error && (
                <div role="alert" className="page error-banner">
                  {error}
                </div>
              )}
            </>
          )}
          {page === 'materials' && catalog && <Materials catalog={catalog} />}
          {page === 'evidence' && catalog && (
            <Evidence catalog={catalog} onMethod={() => navigate('methodology')} />
          )}
          {page === 'methodology' && <Methodology />}
          {page === 'saved' && (
            <SavedPlans
              plans={plans}
              onOpen={openSaved}
              onDelete={(id) => {
                if (persist(plans.filter((p) => p.id !== id)))
                  notify('The saved plan was removed from this browser.')
              }}
              onStart={() => start()}
              onImport={() => setInputMode('import')}
            />
          )}
        </>
      )}
      <footer className="site-footer">
        <span>
          <Leaf size={15} /> Food, thoughtfully packed.
        </span>
        <button onClick={() => navigate('methodology')}>
          Decision support · not a shelf-life guarantee
        </button>
        <span>PACKORA / LOCAL PROTOTYPE</span>
      </footer>
      {toast && (
        <div className="toast" role="status">
          <Check size={19} />
          <span>{toast}</span>
          <button
            className="icon-button"
            aria-label="Dismiss notification"
            onClick={() => setToast('')}
          >
            <X size={17} />
          </button>
        </div>
      )}
      {inputMode && examples.length > 0 && (
        <InputDialog
          mode={inputMode}
          examples={examples}
          onClose={() => setInputMode(null)}
          onScenario={(s) => start(s)}
        />
      )}
    </div>
  )
}
