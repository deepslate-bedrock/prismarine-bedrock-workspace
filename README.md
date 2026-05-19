# prismarine-bedrock-workspace

Workspace repo for developing the base `prismarine-bedrock` library and the AI packet-parity lab together.

## Layout

```text
repos/
  prismarine-bedrock/     # base library
  prismarine-bedrock-ai/  # agent workflow and recorded-BDS lab
```

Both entries are Git submodules pinned to migration branches for review:

- `repos/prismarine-bedrock` tracks `migration/base-cleanup`
- `repos/prismarine-bedrock-ai` tracks `migration/initial-ai-split`

## Setup

```powershell
git submodule update --init --recursive
pnpm install
pnpm run ref:install
```

The root `pnpm-workspace.yaml` links the two packages locally, so the AI lab can resolve `prismarine-bedrock` from the sibling base checkout.

`pnpm run ref:install` clones optional, gitignored reference repositories into `ref/`:

- `minecraft-data` from `PrismarineJS/minecraft-data`
- Bedrock protocol docs from `Mojang/bedrock-protocol-docs`
- `gophertunnel` from `Sandertv/gophertunnel`
- `geyser` from `GeyserMC/Geyser`
- `boar` from `Oryxel/Boar`

Use `pnpm run ref:status` to show their current heads and `pnpm run ref:update` to fast-forward them.

## Common Commands

```powershell
pnpm --dir repos/prismarine-bedrock run test:static
pnpm --dir repos/prismarine-bedrock run test:fake-world
pnpm --dir repos/prismarine-bedrock-ai run test:static
pnpm run ref:status
```
