export type Mood = 'idle' | 'thinking' | 'writing'

declare module 'claude-code' {
  interface PluginState {
    'peach-buddy': { mood: Shaped<Mood> }
  }
}
