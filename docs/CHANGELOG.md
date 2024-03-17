# To-Bits ChangeLog

## 0.6

The HUD update. More coming soon!

### Added

- [ ] Interface elements for the player.
  - [ ] The players name
  - [ ] Inventory items
  - [ ] All players
- [ ] Backend event separation
  - [ ] Events for joining or disconnecting players.
  - [ ] Events for projectiles
  - [ ] Events for player movement
- [ ] Event messages on screen (join, death, etc)
- [ ] Added lobbies instead of a fixed world.

### Changed

- [ ] Update only the movement of players but not all the player data.
- [ ] Update only tiles that are affected to change, not the entire layer
- [ ] Moved the world-loader to the lobby

## 0.5

The Item update. More coming soon!

- More items spawns, textures, etc.

### Added

- [ ] More textures
  - [ ] Bow
    - [ ] Item
    - [ ] Player holding
    - [ ] Projectile texture for the arrow
  - [ ] Fireball
    - [ ] Item
    - [ ] Player holding
    - [ ] Projectile texture
  - [ ] Bomb
    - [ ] Item
    - [ ] Player holding
    - [ ] Projectile texture
  - [ ] Boomerang
    - [ ] Item
    - [ ] Player holding
    - [ ] Projectile texture for the arrow
  - [ ] Sword
    - [ ] Item
    - [ ] Player holding
    - [ ] Projectile texture for the arrow
- [ ] Projectile class for items.
- [ ] Added melee logic to punch other players

### Changed

- [ ] Moved player-items to their own repository.
- [ ] Moved player and projectile loop methods to a separate file
- [ ] The background of the player name-tags is now totally black.
- [ ] Player color picking now checks existing player colors
  - Before some players had the same color which could be confusing
- [ ] Animated the items that spawn on the map

## 0.4

The Map update.

- More tiles, better build-up and more interaction.

### Added

- [x] Using TILED JSON files for the map data.
- [x] More map textures.
  - [x] Stone textures
  - [x] Connected textures
  - [x] Bridges
- [x] Repository for the map data with better control of the tiles.
- [x] Added layers to render the map

### Changed

- [x] Moved tile-items to their own repository.

### Fixed

- [x] Fixed losing the cookie ID after refreshing
  - This results in permanent Conflict error or duplicate characters.
- [x] Fixed letting the character moonwalk when pushing 2 directions at once.

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