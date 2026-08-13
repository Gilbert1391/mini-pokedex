---
name: conventional-commits
description: "Enforce Conventional Commits format for this repo when creating git commits — type(scope): subject per commitlint rules. Use when staging changes, running git commit, or generating a commit message."
---

# Conventional Commits — Mini Pokédex

## When to Use

Before any `git commit` in this repo, or when asked to "commit"/"generate a commit message".

## Format

`<type>(<scope>): <subject>` + optional body (blank line, wrap ~72 chars, explain _why_) + optional footer (`Fixes #123`, `BREAKING CHANGE: ...`).

## Types

feat, fix, refactor, perf, test, docs, chore, style

## Scopes (this repo)

pokedex, teams, core, common, state, cache — combine with hyphens for sub-areas (e.g. `pokedex-table`).

## Subject Rules

- Max 100 chars total (including `type(scope): `)
- Lowercase, no trailing period
- Imperative mood ("add", not "added"/"adds")

## Examples

Good: `feat(pokedex): add debounced search selector`, `fix(teams): roll back optimistic create on mutation failure`
Bad: `Update stuff` (no type/scope), `feat(pokedex): Added search.` (capitalized, past tense, period)

## Procedure

1. Stage only files for one logical change.
2. Pick type + scope from the lists above.
3. Write subject: imperative, lowercase, no period, ≤100 chars.
4. For multi-part changes, add a body as a `- ` bullet list explaining why.
5. Commit.
