import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { Mood } from '../types'

const PANE = 'peach-buddy'
const TITLE = 'Claude'

const mood = atom({ plugin: 'peach-buddy', key: 'mood' } as const, 'idle' as Mood, {
  shape: 'mood-1',
})

// Module copy of the mood, so the stream only writes when it changes.
let current: Mood = 'idle'

const setMood = async ($: EngineInterface, next: Mood) => {
  if (next === current) return
  current = next
  // A drawing nicety: never let it hold up or fail the session's work.
  await update($, mood, () => next).catch(() => {})
}

const BG = '#C4643F'
const PEACH = '#F7CDB0'
const PEACH_SHADE = '#EBAE8C'
const INK = '#2A1A15'
const ROSE = '#E3807A'

const svgFor = (m: Mood): string => {
  const eyesUp = m === 'thinking'
  const eyeY = eyesUp ? 100 : 114

  const mouth =
    m === 'writing'
      ? `<ellipse class="talk" cx="120" cy="146" rx="7" ry="6" fill="${INK}"/>`
      : m === 'thinking'
        ? `<path d="M113 147 Q120 149 127 147" stroke="${INK}" stroke-width="3.5" stroke-linecap="round" fill="none"/>`
        : `<path d="M106 141 Q120 155 134 141" stroke="${INK}" stroke-width="3.5" stroke-linecap="round" fill="none"/>`

  const dots =
    m === 'thinking'
      ? `<g class="orbit">
           <circle cx="120" cy="34" r="5" fill="${PEACH}"/>
           <circle cx="194.5" cy="163" r="5" fill="${PEACH}" opacity=".8"/>
           <circle cx="45.5" cy="163" r="5" fill="${PEACH}" opacity=".6"/>
         </g>`
      : ''

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="240" height="240">
  <style>
    .float { animation: float 4.5s ease-in-out infinite alternate; }
    .eyes { transform-box: fill-box; transform-origin: center; animation: blink 5.5s infinite; }
    .orbit { transform-origin: 120px 120px; animation: spin 7s linear infinite; }
    .talk { transform-box: fill-box; transform-origin: center; animation: talk .32s ease-in-out infinite alternate; }
    @keyframes float { from { transform: translateY(2px); } to { transform: translateY(-3px); } }
    @keyframes blink { 0%, 93%, 100% { transform: scaleY(1); } 96% { transform: scaleY(.1); } }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes talk { from { transform: scaleY(.35); } to { transform: scaleY(1); } }
    @media (prefers-reduced-motion: reduce) {
      * { animation: none !important; }
    }
  </style>
  <defs>
    <radialGradient id="orb" cx="40%" cy="35%" r="70%">
      <stop offset="0%" stop-color="#FCE3D0"/>
      <stop offset="65%" stop-color="${PEACH}"/>
      <stop offset="100%" stop-color="${PEACH_SHADE}"/>
    </radialGradient>
  </defs>
  <rect width="240" height="240" fill="${BG}"/>
  ${dots}
  <ellipse cx="120" cy="196" rx="38" ry="5" fill="#000" opacity=".12"/>
  <g class="float">
    <circle cx="120" cy="122" r="62" fill="url(#orb)"/>
    <ellipse cx="86" cy="136" rx="11" ry="7" fill="${ROSE}" opacity=".55"/>
    <ellipse cx="154" cy="136" rx="11" ry="7" fill="${ROSE}" opacity=".55"/>
    <g class="eyes">
      <ellipse cx="102" cy="${eyeY}" rx="7" ry="11" fill="${INK}"/>
      <ellipse cx="138" cy="${eyeY}" rx="7" ry="11" fill="${INK}"/>
    </g>
    ${mouth}
  </g>
</svg>`
}

const ALT: Record<Mood, string> = {
  idle: 'Claude, smiling and floating gently',
  thinking: 'Claude looking up, three dots circling: thinking',
  writing: 'Claude talking: writing a reply',
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'buddy',
      description: 'Show the animated Claude character pane',
    })
    void $.ui.open({ id: PANE, title: TITLE })
    current = await read($, mood)
    return next(e)
  })

  on('command.run', { command: 'buddy' }, async $ => {
    await $.ui.open({ id: PANE, title: TITLE })
    return { text: 'Claude pane opened.' }
  })

  on('turn.start', async ($, e, next) => {
    await setMood($, 'thinking')
    return next(e)
  })

  on('turn.step', async function* ($, e, next) {
    await setMood($, 'thinking')
    const stream = next(e)
    while (true) {
      const step = await stream.next()
      if (step.done) return step.value
      const chunk = step.value
      if (chunk.kind === 'text') await setMood($, 'writing')
      else if (chunk.kind === 'thinking' || chunk.kind === 'tool') await setMood($, 'thinking')
      yield chunk
    }
  })

  on('tool.call', async ($, e, next) => {
    void setMood($, 'thinking')
    return next(e)
  })

  on('turn.complete', async ($, e, next) => {
    await setMood($, 'idle')
    return next(e)
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box } = $.ui.resolve(e)
    const m = await read($, mood)
    if (e.surface === 'terminal') {
      const { Text } = $.ui.resolve(e)
      return <Text>{ALT[m]}</Text>
    }
    const { Svg } = $.ui.resolve(e)
    return (
      <Box flexDirection="column" alignItems="center" justifyContent="center" flexGrow={1} backgroundColor={BG}>
        <Svg source={svgFor(m)} alt={ALT[m]} isInteractive />
      </Box>
    )
  })
}
