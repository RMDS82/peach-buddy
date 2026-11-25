export type Mood = 'idle' | 'thinking' | 'writing'

/** The last question asked with `/buddy <question>` and where its answer stands. */
export type Bubble = {
  question: string
  status: 'asking' | 'answered' | 'failed'
  answer: string
}

declare module 'claude-code' {
  interface PluginState {
    'peach-buddy': { mood: Shaped<Mood>; bubble: Shaped<Bubble | null> }
  }
}
