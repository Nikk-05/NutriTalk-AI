import { useEffect, useRef, useState } from 'react'

// Stepper — number incrementer with [-] [value] [+] buttons.
//
// Behaviour:
//   • Click +/- to step by `step` (supports decimals like 0.1).
//   • Hold +/- to repeat after a short delay.
//   • Focus the centre input to type freely. The value is NOT clamped while
//     you type — only on blur (or Enter). This avoids the "first keystroke
//     snaps to min" trap when replacing the current value digit-by-digit.
//   • Auto-select on focus so the first keystroke replaces cleanly.
//   • Escape reverts the in-flight edit.
//
// Props:
//   label    — caption above the control
//   unit     — short suffix (kg / cm) shown next to the label
//   value    — current numeric value (controlled by parent)
//   onChange — (newValue) => void — only called with clamped numbers
//   min, max — clamp bounds applied on commit
//   step     — increment per +/- click (default 1)
export default function Stepper({ label, unit, value, onChange, min = 0, max = 999, step = 1 }) {
  // ── Editing state ───────────────────────────────────────────────
  // `draft` holds the raw string the user is typing. While `editing` is
  // true, the <input> shows this draft (no clamping). On blur we parse +
  // clamp + commit once.
  const [editing, setEditing] = useState(false)
  const [draft,   setDraft]   = useState('')

  // ── Hold-to-repeat plumbing ─────────────────────────────────────
  const intervalRef = useRef(null)
  const timeoutRef  = useRef(null)

  // Round to the step's decimal precision so 70.1 + 0.1 = 70.2 (not 70.19999).
  const decimals = (step.toString().split('.')[1] || '').length
  const round    = (v) => Number(v.toFixed(decimals))
  const clamp    = (v) => Math.max(min, Math.min(max, round(v)))

  // ── +/- button handlers ─────────────────────────────────────────
  const bump = (delta) => onChange(clamp(Number(value) + delta))

  const startHold = (delta) => {
    bump(delta)
    // Small delay before kicking off the repeat — a single tap shouldn't
    // accidentally double-fire.
    timeoutRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => bump(delta), 80)
    }, 350)
  }

  const endHold = () => {
    clearTimeout(timeoutRef.current)
    clearInterval(intervalRef.current)
    timeoutRef.current  = null
    intervalRef.current = null
  }

  // Cancel any running interval if the component unmounts mid-hold.
  useEffect(() => endHold, [])

  // ── Free-typing commit ──────────────────────────────────────────
  // Called on blur / Enter. Parses the draft, clamps, and pushes up.
  // If the draft is invalid (empty / NaN), silently revert by ignoring.
  const commit = () => {
    const parsed = parseFloat(draft)
    if (Number.isFinite(parsed)) onChange(clamp(parsed))
    setEditing(false)
    setDraft('')
  }

  return (
    <div>
      <label className="font-label text-xs font-bold uppercase tracking-widest text-outline mb-2 block">
        {label} <span className="text-primary">({unit})</span>
      </label>
      <div className="flex items-center gap-2">
        <StepperButton icon="remove" onPressStart={() => startHold(-step)} onPressEnd={endHold} />
        <input
          type="number"
          inputMode="decimal"
          step={step}
          // Show the draft while editing so each keystroke is preserved
          // verbatim. Once committed, render the canonical clamped value.
          value={editing ? draft : value}
          onFocus={(e) => {
            setEditing(true)
            setDraft(String(value))
            // Pre-select so the first keystroke replaces the whole number.
            e.target.select()
          }}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') e.currentTarget.blur()
            else if (e.key === 'Escape') {
              setEditing(false)
              setDraft('')
              e.currentTarget.blur()
            }
          }}
          className="flex-1 text-center px-4 py-3 bg-surface-container-lowest rounded-2xl border-2 border-outline-variant/30 focus:outline-none focus:border-primary text-on-surface font-headline font-bold text-lg"
        />
        <StepperButton icon="add" onPressStart={() => startHold(step)} onPressEnd={endHold} />
      </div>
    </div>
  )
}

function StepperButton({ icon, onPressStart, onPressEnd }) {
  return (
    <button
      type="button"
      // Prevent the button from stealing focus from the input — otherwise
      // clicking +/- while typing would trigger a blur+commit cycle in the
      // middle of a keystroke.
      onMouseDown={(e) => { e.preventDefault(); onPressStart() }}
      onMouseUp={onPressEnd}
      onMouseLeave={onPressEnd}
      onTouchStart={(e) => { e.preventDefault(); onPressStart() }}
      onTouchEnd={onPressEnd}
      className="w-12 h-12 shrink-0 rounded-full bg-surface-container-high hover:bg-primary/10 active:scale-90 transition-all flex items-center justify-center text-on-surface"
    >
      <span className="material-symbols-outlined">{icon}</span>
    </button>
  )
}
