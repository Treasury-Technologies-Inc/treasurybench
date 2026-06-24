# Fixtures

These files are calibration and smoke-test fixtures for TreasuryBench tooling.
They are not official benchmark runs and should not be included in public
leaderboards.

## Contents

- `captures/`: small example assistant responses used to exercise deterministic
  evaluation and judge-prompt generation.
- `judgments/`: matching example judge outputs used for local validation and
  documentation.

The fixture providers intentionally use names such as `fixture_generic` and
`fixture_expert` so they cannot be confused with product contenders like
Treasury, Monarch, or Origin, or with the ChatGPT full-context reference
baseline.

Use fixtures to verify harness behavior, demonstrate scoring shape, and catch
regressions in smoke tests. Use `artifacts/` or future versioned `runs/`
directories for real benchmark evidence.
