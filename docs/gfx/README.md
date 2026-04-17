# Design assets (`docs/gfx`) ↔ Figma ↔ app

Exported PNGs in this tree are **reference art and slice exports** from the same product design as the live Figma file. They are **not** loaded by the PWA at runtime; the game serves built assets from `apps/game/public/assets/`. Use this README to find which folder matches which screen when comparing Figma to code.

## Figma source

|                        |                                                                                                                                                                      |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **File**               | [Riddle Rush](https://www.figma.com/design/hINuFPjeXxAZVlbEQghd11/Riddle-Rush)                                                                                       |
| **fileKey**            | `hINuFPjeXxAZVlbEQghd11`                                                                                                                                             |
| **Example frame link** | [node `11:56` (11-56)](https://www.figma.com/design/hINuFPjeXxAZVlbEQghd11/Riddle-Rush?node-id=11-56) — replace with links copied from each frame in Figma as needed |

Frames in Figma should align **by screen name** with the folders below (same flow as [WORKFLOW.md](../WORKFLOW.md)).

## Map: folder → mockup → implementation

| Flow / screen                | `docs/gfx` folder                   | Reference composite                        | Primary app entry                                            |
| ---------------------------- | ----------------------------------- | ------------------------------------------ | ------------------------------------------------------------ |
| Splash                       | `splash/`                           | `Splash screen.png`, `mockup`-style pieces | `apps/game/pages/splash.vue`                                 |
| Language (first run)         | `language/`                         | `Mockup.png`                               | `apps/game/pages/language.vue`                               |
| Main menu                    | `Main Menu/`                        | `mockup.png`                               | `apps/game/pages/index.vue`                                  |
| Settings                     | `settings/`                         | `settings.png`, `options.png`              | `apps/game/pages/settings.vue`                               |
| Players                      | `players/`                          | `mockup.png`                               | `apps/game/pages/players.vue`                                |
| Round / letter / category UI | `alphabets/`                        | `alphabet.png`, `ROUND 01.png`, …          | `apps/game/pages/round-start.vue` (fortune flow)             |
| In-round play                | _(uses shared HUD pieces in figma)_ | —                                          | `apps/game/pages/game/[[gameId]].vue`                        |
| Pause                        | `paused/`                           | `mockup.png`                               | `apps/game/components/PauseModal.vue`                        |
| Win / round celebration      | `you win/`                          | `mockup.png`                               | Results flow: `apps/game/pages/results/[[gameId]].vue`       |
| Scoring / round results      | `scoring/`                          | `mockup.png`                               | `apps/game/pages/results/[[gameId]].vue`                     |
| Leaderboard                  | `Leaderboard/`                      | `leaderboard.png`, `ranking.png`           | `apps/game/pages/leaderboard.vue`                            |
| Profile (design vision)      | `profile/`                          | `profile mockup.png`                       | _(no dedicated page yet; see [WORKFLOW.md](../WORKFLOW.md))_ |
| Quit confirm                 | `quit game/`                        | `QUIT GAME.png`, `Are you sure…png`        | `apps/game/components/QuitModal.vue`                         |

## Detailed asset lists

Slice-level filenames (buttons, bars, backgrounds) are documented per flow in [WORKFLOW.md](../WORKFLOW.md).

## Adding a new screen

1. In Figma: finish the frame → **Copy link** (captures `node-id`).
2. Export slices into a **new subfolder** under `docs/gfx/<Screen Name>/` (match naming style above).
3. Add a row to the table in this README and extend [WORKFLOW.md](../WORKFLOW.md) if behavior/navigation changes.
