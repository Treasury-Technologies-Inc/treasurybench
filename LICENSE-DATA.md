# Data license — CC BY 4.0

The benchmark **data** and Treasury's **own** run artifacts are licensed under the
Creative Commons Attribution 4.0 International License (CC BY 4.0).

Full text: https://creativecommons.org/licenses/by/4.0/legalcode
Summary: https://creativecommons.org/licenses/by/4.0/

## What this covers

- Personas, tasks, planted opportunities, rubrics, and the locked-fact table
  (`src/data/**`)
- Prompt manifests under `artifacts/prompts/**`
- Treasury's own captures, judge prompts, judgments and results — every run
  directory beginning `treasury-full-*`
- The documentation in this package

## What it means in practice

You may copy, redistribute, remix and build on this material, including
commercially, provided you give appropriate credit and indicate if changes were
made. Attribution should name TreasuryBench and link to
https://treasury.sh/benchmarks.

If you republish a score, please also carry its measurement date. Every run in
this repository is dated, and Treasury's current run (August 2026) and the
competitor runs (June 2026) are **not** contemporaneous.

## What it does NOT cover

- Code (`src/**`) — MIT, see LICENSE
- Captures reproduced from third-party products — not Treasury's to license,
  see THIRD_PARTY_CONTENT.md
- The Treasury name, logo and other Treasury Technologies, Inc. trademarks.
  Nothing here grants any trademark right. Competitor names appear nominatively,
  to identify the products measured.

## Why data is licensed separately from code

A benchmark's value is in being cited accurately. CC BY makes attribution a
condition of reuse for the numbers and fixtures, which is what we care about,
while MIT keeps the harness maximally reusable without attribution friction in
downstream source files.
