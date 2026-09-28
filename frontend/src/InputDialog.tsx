import { useEffect, useRef, useState } from 'react'
import { ArrowRight, Camera, Check, Code2, FileUp, Mic, MicOff, X } from 'lucide-react'
import type { Example, Scenario } from './types'
import { evaluate } from './api'

type SpeechResultEvent = {
  results: { isFinal: boolean; [index: number]: { transcript: string } }[]
}
type SpeechRecognition = {
  lang: string
  interimResults: boolean
  continuous: boolean
  onresult: ((event: SpeechResultEvent) => void) | null
  onerror: ((event: { error: string }) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
}
type SpeechWindow = Window & {
  SpeechRecognition?: new () => SpeechRecognition
  webkitSpeechRecognition?: new () => SpeechRecognition
}

// Deliberately narrow, deterministic parser. Always reviewed before use; not an LLM.
export function extractDescription(text: string): {
  commodity?: Scenario['commodity']
  shipment_kg?: number
  travel_hours?: number
  temperature_c?: number
} {
  const t = text.toLowerCase().replace(/[०-९]/g, (d) => String('०१२३४५६७८९'.indexOf(d)))
  const commodity = /broccoli|ब्रोकली|ब्रोकोली/.test(t)
    ? 'broccoli'
    : /peanut|groundnut|मूंगफली/.test(t)
      ? 'peanuts'
      : /chips|crisps|चिप्स/.test(t)
        ? 'chips'
        : /tomato|टमाटर/.test(t)
          ? 'tomato'
          : undefined
  const mass = t.match(/(\d+(?:\.\d+)?)\s*(?:kg|kilo(?:gram)?s?|किलो(?:ग्राम)?)/),
    time = t.match(/(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|घंटे|घंटा)/),
    temp = t.match(/(-?\d+(?:\.\d+)?)\s*(?:°\s*c|degrees?(?:\s*c(?:elsius)?)?|डिग्री)/)
  return {
    commodity,
    ...(mass ? { shipment_kg: Number(mass[1]) } : {}),
    ...(time ? { travel_hours: Number(time[1]) } : {}),
    ...(temp ? { temperature_c: Number(temp[1]) } : {}),
  }
}

export function InputDialog({
  mode,
  examples,
  onClose,
  onScenario,
}: {
  mode: 'voice' | 'import' | 'photo'
  examples: Example[]
  onClose: () => void
  onScenario: (s: Scenario) => void
}) {
  const dialog = useRef<HTMLDialogElement>(null),
    speech = useRef<SpeechRecognition | null>(null),
    [text, setText] = useState(''),
    [error, setError] = useState(''),
    [listening, setListening] = useState(false),
    [language, setLanguage] = useState('en-IN'),
    [busy, setBusy] = useState(false),
    [photo, setPhoto] = useState(''),
    [photoCommodity, setPhotoCommodity] = useState<Scenario['commodity']>('tomato')
  useEffect(() => {
    dialog.current?.showModal()
    return () => speech.current?.stop()
  }, [])
  useEffect(
    () => () => {
      if (photo) URL.revokeObjectURL(photo)
    },
    [photo],
  )
  const recognised = extractDescription(text),
    recognizer =
      (window as SpeechWindow).SpeechRecognition ?? (window as SpeechWindow).webkitSpeechRecognition
  const start = () => {
    setError('')
    if (!recognizer) {
      setError(
        'Speech recognition is unavailable in this browser. Type your description below; the same flow still works.',
      )
      return
    }
    if (listening) {
      speech.current?.stop()
      return
    }
    const rec = new recognizer()
    speech.current = rec
    rec.lang = language
    rec.interimResults = false
    rec.continuous = false
    rec.onresult = (e) => {
      setText(e.results[0][0].transcript)
    }
    rec.onerror = (e) => {
      setError(`Speech could not complete (${e.error}). You can type instead.`)
      setListening(false)
    }
    rec.onend = () => setListening(false)
    try {
      rec.start()
      setListening(true)
    } catch {
      setError('Microphone access could not start. Type your description instead.')
    }
  }
  const base = (commodity: Scenario['commodity']): Scenario => {
    const seed = structuredClone(
      examples.find((e) => e.scenario.commodity === commodity)?.scenario ?? examples[2].scenario,
    )
    return {
      ...seed,
      title: 'My packaging plan',
      commodity,
      shipment_kg: 0,
      pack_mass_kg: null,
      area_m2: null,
      maturity: 'unknown' as const,
      rough_handling: false,
      budget_basis: 'unknown' as const,
      allowable_moisture_gain_g: null,
      oxygen_budget_ml: null,
      initial_oxygen_ml: null,
      stages: seed.stages.map((st) => ({ ...st, hours: 0, temperature_c: null, rh_percent: null })),
    }
  }
  const useText = () => {
    if (!recognised.commodity) {
      setError(
        'Mention tomatoes, broccoli, roasted peanuts or potato chips. You can also start with the ordinary food picker.',
      )
      return
    }
    const s = base(recognised.commodity)
    if (recognised.shipment_kg !== undefined) s.shipment_kg = recognised.shipment_kg
    if (recognised.travel_hours !== undefined) s.stages[1].hours = recognised.travel_hours
    if (recognised.temperature_c !== undefined) s.stages[1].temperature_c = recognised.temperature_c
    onScenario(s)
  }
  const importJson = async () => {
    setBusy(true)
    setError('')
    try {
      if (new TextEncoder().encode(text).length > 65536)
        throw new Error('Keep the scenario below 64 KB.')
      const raw = JSON.parse(text)
      const input = raw.scenario ?? raw
      const result = await evaluate(input)
      onScenario(result.scenario)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not import this scenario.')
    } finally {
      setBusy(false)
    }
  }
  return (
    <dialog className="input-dialog" ref={dialog} onCancel={onClose} aria-labelledby="input-title">
      <div className="modal-top">
        <span className="eyebrow">
          {mode === 'voice'
            ? 'START IN YOUR OWN WORDS'
            : mode === 'photo'
              ? 'A VISUAL STARTING POINT'
              : 'FOR TECHNICAL USERS'}
        </span>
        <button className="icon-button" onClick={onClose} aria-label="Close input dialog">
          <X />
        </button>
      </div>
      <h2 id="input-title">
        {mode === 'voice'
          ? 'Tell us about your shipment.'
          : mode === 'photo'
            ? 'Look. Confirm. Plan.'
            : 'Bring your own data.'}
      </h2>
      {mode === 'voice' && (
        <>
          <p>
            Say or type the food, total weight, travel hours and temperature. You will review every
            extracted value.
          </p>
          <div className="voice-controls">
            <button className={`button ${listening ? 'listening' : 'primary'}`} onClick={start}>
              {listening ? <MicOff size={19} /> : <Mic size={19} />}{' '}
              {listening ? 'Stop listening' : 'Use microphone'}
            </button>
            <label className="sr-only" htmlFor="speech-language">
              Speech language
            </label>
            <select
              id="speech-language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="en-IN">English (India)</option>
              <option value="hi-IN">हिन्दी</option>
            </select>
          </div>
          <small className="privacy-note">
            Microphone starts only when tapped. Your browser's speech service may process audio
            online. Packora does not save audio.
          </small>
          <label className="field">
            <span>Your description</span>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={2000}
              rows={4}
              placeholder="100 kg tomatoes, 12 hours travel at 25 degrees"
            />
          </label>
          {text && (
            <div className="extracted">
              <span className="eyebrow">RECOGNIZED DETAILS · CONFIRM NEXT</span>
              <div>
                {recognised.commodity && (
                  <span>
                    <Check size={14} />
                    {recognised.commodity}
                  </span>
                )}
                {recognised.shipment_kg !== undefined && <span>{recognised.shipment_kg} kg</span>}
                {recognised.travel_hours !== undefined && (
                  <span>{recognised.travel_hours} travel hours</span>
                )}
                {recognised.temperature_c !== undefined && (
                  <span>{recognised.temperature_c} °C in transit</span>
                )}
              </div>
              <small>
                Limited phrase matching, not a language model. Missing values stay unknown.
              </small>
            </div>
          )}
          <button className="button primary wide" onClick={useText}>
            Review these details
            <ArrowRight size={18} />
          </button>
        </>
      )}
      {mode === 'photo' && (
        <>
          <p>
            Use a photo to help you confirm the product. This prototype does not automatically
            identify foods or measure their properties from an image.
          </p>
          <label className="photo-upload">
            <Camera size={26} />
            <strong>Choose or take a photo</strong>
            <small>JPEG, PNG or WebP · up to 5 MB · stays in this browser</small>
            <input
              aria-label="Choose produce photo"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              capture="environment"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (!file) return
                if (
                  !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) ||
                  file.size > 5 * 1024 * 1024
                ) {
                  setError('Use a JPEG, PNG or WebP photo smaller than 5 MB.')
                  return
                }
                setError('')
                setPhoto(URL.createObjectURL(file))
              }}
            />
          </label>
          {photo && (
            <img
              className="photo-preview"
              src={photo}
              alt="Your selected produce; confirm its identity below"
            />
          )}
          <label className="field">
            <span>Confirm what is in your photo</span>
            <select
              value={photoCommodity}
              onChange={(e) => setPhotoCommodity(e.target.value as Scenario['commodity'])}
            >
              <option value="tomato">Tomatoes</option>
              <option value="broccoli">Broccoli</option>
              <option value="peanuts">Roasted peanuts</option>
              <option value="chips">Potato chips</option>
            </select>
          </label>
          <button className="button primary wide" onClick={() => onScenario(base(photoCommodity))}>
            Continue with confirmed food
            <ArrowRight size={18} />
          </button>
        </>
      )}
      {mode === 'import' && (
        <>
          <p>
            Paste a scenario or a Packora result export. The server validates it before opening the
            editor.
          </p>
          <div className="import-actions">
            <label className="button secondary file-label">
              <FileUp size={17} />
              Choose JSON
              <input
                aria-label="Choose JSON file"
                type="file"
                accept=".json,application/json"
                onChange={async (e) => {
                  const f = e.target.files?.[0]
                  if (!f) return
                  if (f.size > 65536) {
                    setError('Keep the file below 64 KB.')
                    return
                  }
                  setText(await f.text())
                  setError('')
                }}
              />
            </label>
            <button
              className="text-button"
              onClick={() => setText(JSON.stringify(examples[1].scenario, null, 2))}
            >
              <Code2 size={17} />
              Insert example
            </button>
          </div>
          <label className="field">
            <span>Scenario JSON</span>
            <textarea
              className="code-input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={65536}
              rows={10}
              spellCheck={false}
              placeholder={'{ "commodity": "broccoli", ... }'}
            />
          </label>
          <button
            className="button primary wide"
            disabled={busy || !text.trim()}
            onClick={importJson}
          >
            {busy ? 'Validating…' : 'Validate & review'}
            <ArrowRight size={18} />
          </button>
        </>
      )}
      {error && (
        <p className="error-banner" role="alert">
          {error}
        </p>
      )}
    </dialog>
  )
}
