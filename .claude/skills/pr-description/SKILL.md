---
name: pr-description
description: Writes pull request descriptions. Use when create a PR, writing a PR, or when the user ask to summarize changes for a pull request.
---

When writing a PR description:

1. Run `git diff origin/beta-manga-store...HEAD` to see all changes on this branch
   (feature branches target `beta-manga-store`; for a release PR `beta-manga-store → main` use `origin/main...HEAD`)
2. Write a description following this format:

## What
One sentence explaining what this PR does.

## Why
Brief context on why this change is needed

## Changes
- Bullet points of specific changes made
- Group related changes together
- Mention any files deleted or renamed