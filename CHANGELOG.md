# To-Bits ChangeLog

## 0.6

The HUD update. More coming soon!

- Player text lines (join, death, etc)

## 0.5

The Item update. More coming soon!

- More items spawns, textures, etc.

## 0.4

The Map update. More coming soon!

- More tiles, better build-up and more interaction.

## 0.3

Character personalization/randomness update.

### Added

- [x] Added more character variations
  - [x] T-shape helmet
  - [x] Eyes-shape helmet
- [ ] A walking animation for the character

### Changed

- [x] Changed the favicon to the players character instead of the default knight.
- [x] Optimized colouring for the character tint.
- [x] Improved the image generation.
  - [x] Color tint manipulation.
  - [x] Asset loading.
  - [x] Layering assets.
- [x] All players are drawn based on join-time. But the player playing needs to be on top.

### Fixed

- [ ] Character image loading-glitch at first load.
- [x] 2 people can't join from the same IP.
  - [x] Better IP blocking using cookies to verify players.
- [x] After disconnecting, the player's ghost will be visible for certain players.