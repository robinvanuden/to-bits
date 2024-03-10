# To-Bits ChangeLog

## 0.6

The HUD update. More coming soon!

- Player text lines (join, death, etc)

## 0.5

The Item update. More coming soon!

- More items spawns, textures, etc.

### Added

- [ ] Interface elements for the player.
    - [ ] The players name
    - [ ] Inventory items
    - [ ] All players

### Changed

- [ ] Moved player-items to their own repository.

## 0.4

The Map update.

- More tiles, better build-up and more interaction.

### Added

- [ ] Using TILED JSON files for the map data.
- [ ] More map textures.
    - [ ] Stone textures
    - [ ] Connected textures
    - [ ] Bridges
- [ ] Repository for the map data with better control of the tiles.

### Changed

- [ ] Moved tile-items to their own repository.
- [ ] The background of the player name-tags is now totally black.
- [ ] Update only the movement of players but not all the player data.
- [ ] Event separation
    - [ ] Events for joining or disconnecting players.
    - [ ] Events for projectiles
    - [ ] Events for player movement

### Fixed

- [ ] Fixed losing the cookie ID after refreshing resulting in permanent Conflict of duplicate
  characters.

## 0.3

Character personalization/randomness update.

### Added

- [x] More character variations
    - [x] T-shape helmet
    - [x] Eyes-hole helmet
    - [x] Eye-line helmet
- [x] A walking animation for the character

### Changed

- [x] The favicon changes to the players character instead of the default knight.
- [x] Improved the image generation.
    - [x] Asset loading for different image layers.
    - [x] Layering assets on top of each other.
    - [x] Color tint manipulation of character feather.
- [x] The order which players are rendered is changed so the playing character is always on top.

### Fixed

- [x] Character image loading-glitch at first load, blinking character when changing direction.
- [x] 2 people can't join from the same IP.
    - [x] Better IP blocking using cookies to verify players.
- [x] After disconnecting, the player's ghost will be visible for certain players.
    - [x] Players are only added to the render list but not removed.