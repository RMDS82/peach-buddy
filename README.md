# peach-buddy

A Claude Code mod that puts an animated Claude character in a side pane beside the chat: a soft peach orb with dark oval eyes, rosy cheeks and a mouth, on a terracotta background.

It reacts to what Claude is doing:

- **Idle / done:** smiles, floats gently and blinks now and then.
- **Thinking or running tools:** looks up while three small dots orbit it.
- **Writing a reply:** its mouth moves as the text streams in.

Ask it a quick question with `/buddy <question>`: Buddy answers in a speech bubble under the orb, in a short, friendly voice, using the same Claude model as your session. It doesn't see your conversation or files, so it's for quick side questions.

The motion is deliberately subtle, and all animation stops when the system's "Reduce motion" setting is on. Type `/buddy` on its own to reopen the pane if you close it. In a plain terminal, which can't draw vector graphics, the pane shows a one-line description of the current state instead.

## Install

At the prompt of a Claude Code terminal session:

```
/plugin install peach-buddy --marketplace RMDS82/peach-buddy
```

Answer `y` to add the marketplace, then pick a scope (user scope loads it in every session).

From a shell:

```bash
claude plugin install peach-buddy --marketplace RMDS82/peach-buddy
```

In the Claude desktop app, where `/plugin` does not run: click **+** next to the prompt box, then **Plugins**, **Add marketplace** with `RMDS82/peach-buddy`, then **Add plugin**.

## License

MIT
