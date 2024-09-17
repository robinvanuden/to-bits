import pack from "../package.json"

export const VERSION: string = pack.version || "?.?.?"

export const TICKS: number = 60
export const TICK_SPEED = 1000 / TICKS
export const GRAVITY = 0.00982

export const COOKIE_PLAYER_ID = "to_bits_player"