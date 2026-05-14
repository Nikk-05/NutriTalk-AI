// ChatBubble.jsx — chat message components.
// AiMessage uses MarkdownText to render the AI's response cleanly.
// MarkdownText is a lightweight inline parser: no external dependencies.
// It handles: **bold**, *italic*, headings (#), bullet lists (*/- ), numbered lists, paragraphs.

// ── Inline parser — converts **bold** and *italic* within a string ──
// Returns an array of strings and React <strong>/<em> elements.
function parseInline(str) {
  const parts = []
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*)/g
  let last = 0
  let match

  while ((match = regex.exec(str)) !== null) {
    // Text before this match
    if (match.index > last) parts.push(str.slice(last, match.index))

    if (match[0].startsWith('**')) {
      // **bold**
      parts.push(
        <strong key={match.index} className="font-bold text-on-surface">
          {match[2]}
        </strong>
      )
    } else {
      // *italic*
      parts.push(
        <em key={match.index} className="italic">
          {match[3]}
        </em>
      )
    }
    last = match.index + match[0].length
  }

  if (last < str.length) parts.push(str.slice(last))
  return parts.length ? parts : [str]
}

// ── Block-level markdown renderer ──────────────────────────────────
// Splits text into lines, groups them into typed blocks, then renders.
function MarkdownText({ text }) {
  if (!text) return null

  const lines  = text.split('\n')
  const blocks = []
  let ulItems  = []
  let olItems  = []

  const flushUl = () => {
    if (ulItems.length) { blocks.push({ type: 'ul', items: [...ulItems] }); ulItems = [] }
  }
  const flushOl = () => {
    if (olItems.length) { blocks.push({ type: 'ol', items: [...olItems] }); olItems = [] }
  }

  for (const line of lines) {
    // Heading: # / ## / ###
    if (/^#{1,3}\s/.test(line)) {
      flushUl(); flushOl()
      blocks.push({ type: 'heading', text: line.replace(/^#+\s+/, '') })

    // Unordered list item: * item  or  - item
    } else if (/^[*\-]\s+/.test(line)) {
      flushOl()
      ulItems.push(line.replace(/^[*\-]\s+/, ''))

    // Ordered list item: 1. item
    } else if (/^\d+\.\s+/.test(line)) {
      flushUl()
      olItems.push(line.replace(/^\d+\.\s+/, ''))

    // Blank line — paragraph break
    } else if (line.trim() === '') {
      flushUl(); flushOl()
      // Only add a spacer if previous block wasn't already a spacer
      if (blocks.length && blocks[blocks.length - 1].type !== 'spacer') {
        blocks.push({ type: 'spacer' })
      }

    // Regular paragraph line
    } else {
      flushUl(); flushOl()
      blocks.push({ type: 'p', text: line })
    }
  }
  flushUl(); flushOl()

  return (
    <div className="space-y-1.5">
      {blocks.map((block, i) => {
        switch (block.type) {

          case 'heading':
            return (
              <p key={i} className="font-headline font-bold text-on-surface text-sm mt-3 first:mt-0">
                {parseInline(block.text)}
              </p>
            )

          case 'ul':
            return (
              <ul key={i} className="space-y-1 mt-1">
                {block.items.map((item, j) => (
                  <li key={j} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-[7px] flex-shrink-0" />
                    <span>{parseInline(item)}</span>
                  </li>
                ))}
              </ul>
            )

          case 'ol':
            return (
              <ol key={i} className="space-y-1 mt-1">
                {block.items.map((item, j) => (
                  <li key={j} className="flex items-start gap-2">
                    <span className="text-primary font-bold text-xs mt-0.5 flex-shrink-0 w-4 text-right">
                      {j + 1}.
                    </span>
                    <span>{parseInline(item)}</span>
                  </li>
                ))}
              </ol>
            )

          case 'spacer':
            return <div key={i} className="h-1.5" />

          case 'p':
          default:
            return <p key={i}>{parseInline(block.text)}</p>
        }
      })}
    </div>
  )
}

// ── AiMessage ─────────────────────────────────────────────────────────
// If children is a plain string, render it through MarkdownText.
// If it's a React element (e.g. the typing-dots spinner), render as-is.
export function AiMessage({ children }) {
  return (
    <div className="flex gap-4 max-w-3xl">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-container/20 flex items-center justify-center text-primary mt-1">
        <span className="material-symbols-outlined text-sm">robot_2</span>
      </div>
      <div className="bg-surface-container-low px-6 py-4 rounded-2xl rounded-tl-none text-on-surface-variant leading-relaxed text-sm">
        {typeof children === 'string'
          ? <MarkdownText text={children} />
          : children
        }
      </div>
    </div>
  )
}

// ── UserMessage ───────────────────────────────────────────────────────
export function UserMessage({ children }) {
  return (
    <div className="flex gap-4 max-w-3xl ml-auto flex-row-reverse">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary-container/20 flex items-center justify-center text-secondary mt-1">
        <span className="material-symbols-outlined text-sm">person</span>
      </div>
      <div className="bg-primary text-on-primary px-6 py-4 rounded-2xl rounded-tr-none shadow-primary-sm leading-relaxed text-sm">
        {children}
      </div>
    </div>
  )
}

// ── RecipeCard ────────────────────────────────────────────────────────
export function RecipeCard({ title, prep, image, protein, calories, fiber, description }) {
  return (
    <div className="bg-surface-container-lowest border border-surface-variant/20 rounded-lg p-6 shadow-ambient-sm overflow-hidden relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary-fixed/20 blur-3xl -mr-16 -mt-16 pointer-events-none" />
      <div className="flex flex-col md:flex-row gap-6 relative z-10">
        {image && (
          <img src={image} alt={title} className="w-full md:w-40 h-40 object-cover rounded-lg flex-shrink-0" />
        )}
        <div className="flex-grow">
          <div className="flex justify-between items-start mb-2 gap-2">
            <h3 className="font-headline font-bold text-lg text-primary leading-tight">{title}</h3>
            {prep && (
              <span className="bg-secondary-container text-on-secondary-container text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-tighter whitespace-nowrap flex-shrink-0">
                {prep}
              </span>
            )}
          </div>
          {description && <p className="text-sm text-on-surface-variant mb-4">{description}</p>}
          <div className="flex gap-6">
            {[
              { label: 'Protein',   val: protein  ? `${protein}g`  : '—', color: 'text-primary'    },
              { label: 'Calories',  val: calories ?? '—',                 color: 'text-on-surface'  },
              { label: 'Fiber',     val: fiber    ? `${fiber}g`    : '—', color: 'text-secondary'   },
            ].map(({ label, val, color }) => (
              <div key={label} className="text-center">
                <p className="text-[10px] font-bold text-outline uppercase">{label}</p>
                <p className={`font-headline font-bold ${color}`}>{val}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
