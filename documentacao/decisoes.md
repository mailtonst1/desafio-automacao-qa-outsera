# Decisions

| ID | Decision | Rationale |
| --- | --- | --- |
| ADR-001 | Use a monorepo rooted at the existing `outsera` folder. | Keeps the challenge cohesive and matches the requested repository shape. |
| ADR-002 | Pin ServeRest to `paulogoncalvesbh/serverest:3.2.0`. | Avoids non-determinism from floating tags. |
| ADR-003 | Keep Mobile APK out of Git. | Prevents binary drift and keeps the repository lightweight. |
| ADR-004 | Keep CI documented but not implemented in this phase. | Matches the requested phase boundary. |

