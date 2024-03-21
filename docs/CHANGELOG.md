# To-Bits ChangeLog

## 0.7

The HUD update. More coming soon!

## 0.6

The player update!

### Added

- [ ] Interface elements for the player_id.
    - [ ] The players name
    - [ ] Inventory items
    - [ ] All players
- [ ] Backend event separation
    - [ ] Events for joining or disconnecting players.
    - [ ] Events for entities
  - [ ] Events for player_id movement
- [ ] Event messages on screen (join, death, etc)
- [ ] Added lobbies instead of a fixed world.

### Changed

- [ ] Update only the movement of players but not all the player_id data.
- [ ] Update only tiles that are affected to change, not the entire layer
- [ ] Moved the world-loader to the lobby
    - [ ] Events for projectiles
    - [ ] Events for player movement
- [ ] Event messages on screen (join, death, etc)
- [ ] Background textures for the map
- [ ] Cave map blocks
    - [ ] Stone
    - [ ] Mossy stone
    - [ ] Crystals
- [ ] Lighting sources
    - [ ] Torches
    - [ ] Crystals
    - [ ] Lava
- [ ] Dashing movement for player by double-pressing a direction
- [ ] Double jumps
- [ ] Knight feather helicopter
- [ ] Player can stoop when holding down

### Changed

- [ ] Update only the movement of players but not all the player data.
- [ ] Update only tiles that are affected to change, not the entire map layer
- [ ] Events are more separated. Only push small updates
    - Players join/leave

## 0.5

The Item update.

### Added

- [ ] More textures
    - [ ] Bow
        - [ ] Item
        - [ ] Player holding
        - [ ] Entity texture for the arrow
    - [ ] Fireball
        - [ ] Item
        - [ ] Player holding
        - [ ] Entity texture
    - [ ] Bomb
        - [ ] Item
        - [ ] Player holding
        - [ ] Entity texture
    - [ ] Boomerang
        - [ ] Item
        - [ ] Player holding
        - [ ] Entity texture for the arrow
    - [ ] Sword
        - [ ] Item
        - [ ] Player holding
        - [ ] Entity texture for the arrow
- [ ] Entity class for items.
- [ ] Added melee logic to punch other players

### Changed

- [ ] Moved player_id-items to their own repository.
- [ ] Moved player_id and projectile loop methods to a separate file
- [ ] The background of the player_id name-tags is now totally black.
- [ ] Player color picking now checks existing player_id colors
    - Before some players had the same color which could be confusing
- [ ] Animated the items that spawn on the map
- [ ] Entity class for entities other than players.
- [ ] Added lobbies instead of a fixed world.
- [ ] Added melee logic to punch other players
- [ ] Added damage attribute to players (no instant kills)
- [ ] Interface elements for the player.
    - [ ] The players name
    - [ ] Inventory items
    - [ ] All players
- [ ] More powers:
    - [ ] Bow
        - [ ] Item texture
        - [ ] Player holding
        - [ ] Projectile texture for the arrow
        - [ ] Logic to shoot an arrow
    - [ ] Fireball
        - [ ] Item texture
        - [ ] Player holding
        - [ ] Projectile texture
        - [ ] Logic to shoot a fireball
    - [ ] Bomb
        - [ ] Item texture
        - [ ] Player holding
        - [ ] Projectile texture
        - [ ] Logic to drop a bomb and it explodes
    - [ ] Boomerang
        - [ ] Item texture
        - [ ] Player holding
        - [ ] Projectile texture
        - [ ] Logic to throw a rotating boomerang and it comes back
    - [ ] Sword
        - [ ] Item texture
        - [ ] Player holding
        - [ ] Projectile texture
        - [ ] Logic to damage a player
    - [ ] Lightsaber
        - [ ] Item texture
        - [ ] Player holding
        - [ ] Projectile texture
        - [ ] Logic to damage a player
    - [ ] Magic Wand
        - [ ] Item texture
        - [ ] Player holding
        - [ ] Projectile texture for the magic bolt
        - [ ] Logic to shoot a bolt that follows the mouse
    - [ ] Mjolnir
        - [ ] Item texture
        - [ ] Player holding
        - [ ] Projectile texture for the thunderbolt
        - [ ] Logic to shoot a thunderbolt on the mouse
    - [ ] Shield
        - [ ] Item texture
        - [ ] Player holding
        - [ ] Projectile texture
        - [ ] Logic to shield a player from damage

### Changed

- [ ] Moved player-items to their own repository.
- [ ] Moved player and projectile loop methods to a separate file
- [ ] The background of the player name-tags is now totally black.
- [ ] Player color picking now checks existing player colors
    - Before some players had the same color which could be confusing
- [ ] Moved the world to the lobby
- [ ] Players can now drop down semi-solid blocks.

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
- [x] After disconnecting, the player_id's ghost will be visible for certain players.
    - [x] Players are only added to the render list but not removed.