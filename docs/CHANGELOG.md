# To-Bits ChangeLog

## 0.7

The HUD update. More coming soon!

## 0.7

The player update!

### Added

- [ ] Backend event separation
    - [ ] Events for joining or disconnecting players.
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
- [ ] Interface elements for the player.
    - [ ] The players name
    - [ ] Inventory items
    - [ ] All players
- [ ] Added lobbies instead of a fixed world.

### Changed

- [ ] Update only the movement of players but not all the player data.
- [ ] Update only tiles that are affected to change, not the entire map layer
- [ ] Events are more separated. Only push small updates
    - Players join/leave
-

## 0.6

The Item update.

### Added

- [x] Projectile class for entities other than players.
- [x] Added melee logic to punch other players
- [x] Added damage attribute to players (no instant kills)
- [ ] Add uses to items
- [ ] More powers:
    - [ ] Bow
        - [x] Item texture
        - [ ] Player holding
        - [x] ItemProjectile texture for the arrow
            - [x] Logic to shoot an arrow
    - [ ] Fireball
        - [x] Item texture
        - [ ] Player holding
        - [x] ItemProjectile texture
            - [x] Logic to shoot a fireball
    - [ ] Bomb
        - [x] Item texture
        - [ ] Player holding
        - [x] ItemProjectile texture
            - [x] Logic to drop a bomb and it explodes
    - [ ] Boomerang
        - [x] Item texture
        - [ ] Player holding
        - [x] ItemProjectile texture
            - [x] Logic to throw a rotating boomerang and it comes back
    - [ ] Sword
        - [ ] Item texture
        - [ ] Player holding
      - [ ] ItemProjectile texture
          - [x] Logic to deal damage another player
    - [ ] Hammer
        - [ ] Item texture
        - [ ] Player holding
      - [ ] ItemProjectile texture
          - [x] Logic to deal more damage another player
    - [ ] Lightsaber
        - [ ] Item texture
        - [ ] Player holding
      - [ ] ItemProjectile texture
          - [ ] Logic to damage a player
    - [ ] Magic Wand
        - [ ] Item texture
        - [ ] Player holding
      - [ ] ItemProjectile texture for the magic bolt
          - [ ] Logic to shoot a bolt that follows the player slowly
    - [ ] Mjolnir
        - [ ] Item texture
        - [ ] Player holding
      - [ ] ItemProjectile texture for the thunderbolt
          - [ ] Logic to shoot a thunderbolt in front of the player
    - [ ] Shield
        - [ ] Item texture
        - [ ] Player holding
      - [ ] ItemProjectile texture
          - [ ] Logic to shield a player from damage

### Changed

- [ ] Moved player-items to their own repository.
- [ ] Moved player loop methods to a separate file
- [ ] The background of the player name-tags is now totally black.
- [ ] Player color picking now checks existing player colors
    - Before some players had the same color which could be confusing
- [ ] Moved the world to the lobby

## 0.5

The unpredicted map updated

### Added

- [x] Created an entity class which acts as a base for all tiles
- [x] Added projectiles

### Changed

- [x] Moved projectile loop methods to a separate file
- [x] Merged all duplicate logic in the entity class
- [x] Changed sizes of the tiles to 16x16 and adjusted the jumping and velocity
- [x] Updated gravity logic

### Removed

- [x] Removed radians and degrees when clicking the mouse.
    - Players now only shoot items with the space-bar

### Fixed

- [x] Players can now drop down semi-solid tiles.
- [x] PLayers don't fall through semi-solid tiles

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
- [ ] Fixed letting the character moonwalk when pushing 2 directions at once.

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