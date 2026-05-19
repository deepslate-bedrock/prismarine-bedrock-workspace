# Agent Workflow

Start from this workspace when a task may involve both the base library and the AI packet-parity lab.

## Repos

- `repos/prismarine-bedrock`: reusable Bedrock bot/runtime library. Edit source, examples, library docs, and library tests here.
- `repos/prismarine-bedrock-ai`: Codex/agent workflow, durable task logs, recorded BDS scenarios, Endstone packet recorder, e2e launchers, and trace comparison tools.

## Rules

1. Run `git status --short` in the workspace and in each submodule before editing.
2. Keep edits in the repo that owns the behavior.
3. If a change crosses both repos, commit and push each submodule branch separately, then update the workspace submodule pointers.
4. Do not move packet-parity logs or task logs back into the base library.
5. Keep raw runtime artifacts in each repo's ignored `logs/`, `.e2e-servers/`, or `scripts/tmp/` directories.

## Reference Sources

The workspace owns shared external source checkouts under gitignored `ref/`. Use `pnpm run ref:install` to clone them, `pnpm run ref:status` to summarize current heads, and `pnpm run ref:update` to fast-forward existing checkouts.

- `node_modules/minecraft-data/minecraft-data/data/bedrock/<MC_VERSION>/`: installed Bedrock schema used by the local serializer.
- `ref/minecraft-data/`: upstream `PrismarineJS/minecraft-data` source for comparing Bedrock data changes.
- `ref/bedrock-protocol-docs/`: Mojang Bedrock protocol docs for packet and field semantics.
- `ref/gophertunnel/`: Go Bedrock protocol implementation for packet/action/status context.
- `ref/geyser/`: Java/Bedrock proxy translator behavior.
- `ref/boar/`: Geyser Bedrock-player anticheat and prediction/movement reference.

Prefer the installed `minecraft-data` schema for exact packet shapes, then use protocol docs, Gophertunnel, Geyser, and Boar to explain behavior. Treat all `ref/` checkouts as inspection-only external sources, not repo source.

## Tests

- Base static: `pnpm --dir repos/prismarine-bedrock run test:static`
- Base fake-world: `pnpm --dir repos/prismarine-bedrock run test:fake-world`
- AI lab static: `pnpm --dir repos/prismarine-bedrock-ai run test:static`
