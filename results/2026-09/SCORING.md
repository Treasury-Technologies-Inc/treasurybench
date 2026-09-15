# Scoring rubric for these results

Scores describe answer quality on these 59 synthetic financial questions. They
are not percentages of correct answers. All products use the same task rubric.

## Four quality dimensions

- **Grounding:** uses the scenario's financial numbers and context accurately.
- **Correctness:** gets the math, financial facts and eligibility rules right.
- **Resolution:** answers the question with a useful conclusion and next steps.
- **Prudence:** handles uncertainty, material conditions, tradeoffs and downside.

[Rubric data](rubric.json) specifies each question's criteria and points.
The answer files contain the awarded points and maximum for each dimension.
Dimension scores in `scores.json` average the per-answer percentage of available
points. They are separate from the composite overall score.

## Composite task score

The final task score combines deterministic financial checks with the rubric
judge's score using these weights:

| Task type | Financial checks | Judge |
| --- | ---: | ---: |
| Data retrieval | 50% | 50% |
| Insight discovery | 15% | 85% |
| Domain advice | 20% | 80% |
| Prioritization | 15% | 85% |
| What-if | 25% | 75% |

The blend rounds to a whole point. If the financial-check score exceeds the
judge score by at least 30 points, the judge score replaces the blend.
The lowest applicable cap then applies:

- Dangerous contradiction of a reference fact: 40.
- Multiple material contradictions of reference facts: 55.
- One material contradiction of a reference fact: 65.
- Multiple stale/wrong current facts, or claiming a specified IRS limit has not
  been announced: 70.
- Other critical stale/wrong current fact: 75.
- Other stale/wrong current fact: 80.
- Judge-identified incomplete or truncated answer: 85.

Unknown or unverified claims alone do not trigger the reference-fact caps.
The recorded final scores are published without rescoring after redaction.

## Aggregation

For this release, overall score is the arithmetic mean of the 59 final task
scores. Category scores average the tasks in that category. Displayed aggregate
scores round to the nearest integer, with halves rounding up. These definitions
apply specifically to this results package; older framework documents may use
other aggregation conventions.

These files expose the questions, answer text, awarded scores and rubric. They
do not include the full financial context or evaluation inputs needed to
independently reproduce each judgment.
