# RISA Computing Lab

## MVP

The public route `/computing-lab` introduces CS101 through two browser-based
simulations: unsigned byte representation and digital logic gates. The lab is a
practice resource, not a substitute for approved course content.

- Binary: toggle eight bit positions, inspect decimal and hexadecimal values,
  and complete three automatically marked questions.
- Logic: select AND, OR, NOT, NAND, NOR or XOR, change inputs, inspect the
  truth table and complete three automatically marked questions.
- Progress: each checkpoint requires all three correct answers. State is
  intentionally session-only and is not a verified academic record.

No new dependencies, backend endpoints, user data storage or authentication
changes are introduced.

## Verification

Run `npm run check` and `npm run test:e2e` before merging. Unit tests cover
all 256 unsigned bytes, invalid values, bit toggling and all six truth tables.

Future work: CPU and encoding simulations, a circuit builder, authenticated
student progress, question banks and approved competency assessments.
