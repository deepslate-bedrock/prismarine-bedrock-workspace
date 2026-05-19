#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { spawnSync } = require('child_process')

const ROOT = path.resolve(__dirname, '..')
const REF_DIR = path.join(ROOT, 'ref')

const REPOS = [
  {
    name: 'minecraft-data',
    url: 'https://github.com/PrismarineJS/minecraft-data.git',
    path: 'minecraft-data',
    note: 'Bedrock data source repository; installed node_modules data remains the serializer source of truth.'
  },
  {
    name: 'bedrock-protocol-docs',
    url: 'https://github.com/Mojang/bedrock-protocol-docs.git',
    path: 'bedrock-protocol-docs',
    note: 'Mojang Bedrock protocol semantics and generated packet docs.'
  },
  {
    name: 'gophertunnel',
    url: 'https://github.com/Sandertv/gophertunnel.git',
    path: 'gophertunnel',
    note: 'Go Bedrock protocol implementation for packet/action/status semantics.'
  },
  {
    name: 'geyser',
    url: 'https://github.com/GeyserMC/Geyser.git',
    path: 'geyser',
    note: 'Java/Bedrock translation behavior and inventory/movement translators.'
  },
  {
    name: 'boar',
    url: 'https://github.com/Oryxel/Boar.git',
    path: 'boar',
    note: 'Geyser Bedrock-player prediction anticheat and movement reference.'
  }
]

const COMMANDS = new Set(['list', 'status', 'install', 'update'])
const command = process.argv[2] || 'list'
const selected = process.argv.slice(3)

if (!COMMANDS.has(command)) {
  fail(`Unknown command "${command}". Use one of: ${[...COMMANDS].join(', ')}`)
}

const repos = selected.length > 0
  ? selected.map(findRepo)
  : REPOS

if (command === 'list') {
  for (const repo of repos) {
    console.log(`${repo.name}`)
    console.log(`  url: ${repo.url}`)
    console.log(`  dir: ${path.join('ref', repo.path)}`)
    console.log(`  note: ${repo.note}`)
  }
  process.exit(0)
}

ensureGit()
if (command === 'install') fs.mkdirSync(REF_DIR, { recursive: true })

for (const repo of repos) {
  if (command === 'status') status(repo)
  if (command === 'install') install(repo)
  if (command === 'update') update(repo)
}

function findRepo (name) {
  const repo = REPOS.find(repo => repo.name === name || repo.path === name)
  if (!repo) fail(`Unknown reference "${name}". Known references: ${REPOS.map(repo => repo.name).join(', ')}`)
  return repo
}

function repoDir (repo) {
  return path.join(REF_DIR, repo.path)
}

function status (repo) {
  const dir = repoDir(repo)
  if (!fs.existsSync(dir)) {
    console.log(`${repo.name}: missing (${path.relative(ROOT, dir)})`)
    return
  }
  if (!isGitRepo(dir)) {
    console.log(`${repo.name}: present but not a git checkout (${path.relative(ROOT, dir)})`)
    return
  }
  const head = run('git', ['-C', dir, 'log', '-1', '--format=%h %ad %s', '--date=short'], { quiet: true }).stdout.trim()
  const branch = run('git', ['-C', dir, 'branch', '--show-current'], { quiet: true }).stdout.trim() || 'detached'
  const dirty = run('git', ['-C', dir, 'status', '--short'], { quiet: true }).stdout.trim()
  console.log(`${repo.name}: ${branch} ${head}${dirty ? ' (dirty)' : ''}`)
}

function install (repo) {
  const dir = repoDir(repo)
  if (fs.existsSync(dir)) {
    console.log(`${repo.name}: already present (${path.relative(ROOT, dir)})`)
    return
  }
  console.log(`${repo.name}: cloning ${repo.url}`)
  run('git', ['clone', '--depth', '1', repo.url, dir])
}

function update (repo) {
  const dir = repoDir(repo)
  if (!isGitRepo(dir)) {
    console.log(`${repo.name}: missing; cloning instead`)
    fs.mkdirSync(REF_DIR, { recursive: true })
    run('git', ['clone', '--depth', '1', repo.url, dir])
    return
  }
  console.log(`${repo.name}: fetching latest`)
  run('git', ['-C', dir, 'pull', '--ff-only'])
}

function isGitRepo (dir) {
  if (!fs.existsSync(dir)) return false
  const result = spawnSync('git', ['-C', dir, 'rev-parse', '--is-inside-work-tree'], {
    cwd: ROOT,
    encoding: 'utf8'
  })
  return result.status === 0 && result.stdout.trim() === 'true'
}

function ensureGit () {
  const result = spawnSync('git', ['--version'], { cwd: ROOT, encoding: 'utf8' })
  if (result.status !== 0) fail('git is required to manage reference checkouts')
}

function run (cmd, args, options = {}) {
  const result = spawnSync(cmd, args, {
    cwd: ROOT,
    encoding: 'utf8',
    stdio: options.quiet ? 'pipe' : 'inherit'
  })
  if (result.status !== 0) {
    const detail = options.quiet ? `${result.stderr || result.stdout}`.trim() : ''
    fail(`${cmd} ${args.join(' ')} failed${detail ? `: ${detail}` : ''}`)
  }
  return result
}

function fail (message) {
  console.error(message)
  process.exit(1)
}
