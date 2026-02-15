export const CHARACTER_CONFIG = {
  Warrior: {
    spriteKey: 'warrior',
    animations: {
      idle: { key: 'warrior_idle_anim', sheet: 'warrior_idle', frameRate: 10, repeat: -1 },
      run: { key: 'warrior_run_anim', sheet: 'warrior_run', frameRate: 12, repeat: -1, frames: { start: 0, end: 5 } },
      jump: { key: 'warrior_jump_anim', sheet: 'warrior_jump', frameRate: 10, repeat: 0, frames: { start: 0, end: 5 } },
      fall: { key: 'warrior_fall_anim', sheet: 'warrior_fall', frameRate: 10, repeat: 0, frames: { start: 0, end: 5 } },
      attack1: { key: 'warrior_attack_1', sheet: 'warrior_attack1', frameRate: 12, repeat: 0 },
      attack2: { key: 'warrior_attack_2', sheet: 'warrior_attack2', frameRate: 12, repeat: 0 },
      attack3: { key: 'warrior_attack_3', sheet: 'warrior_attack3', frameRate: 10, repeat: 0 },
    },
    sprites: {
      idle: { path: 'assets/sprites/warrior/Idle.png', frameWidth: 135, frameHeight: 135 },
      run: { path: 'assets/sprites/warrior/Run.png', frameWidth: 135, frameHeight: 135 },
      jump: { path: 'assets/sprites/warrior/Jump.png', frameWidth: 135, frameHeight: 135 },
      fall: { path: 'assets/sprites/warrior/Fall.png', frameWidth: 135, frameHeight: 135 },
      attack1: { path: 'assets/sprites/warrior/Attack1.png', frameWidth: 135, frameHeight: 135 },
      attack2: { path: 'assets/sprites/warrior/Attack2.png', frameWidth: 135, frameHeight: 135 },
      attack3: { path: 'assets/sprites/warrior/Attack3.png', frameWidth: 135, frameHeight: 135 },
    },
    physics: {
      bodySize: { width: 5, height: 40 },
      bodyOffset: { x: 65, y: 45 },
      drag: 200,
      maxVelocity: { x: 250, y: 800 },
      moveSpeed: 210,
      jumpVelocity: -500,
    },
    combat: {
      damage: 50,
      attackRate: 900,
      attacks: ['warrior_attack_1', 'warrior_attack_2', 'warrior_attack_3'],
    },
    scale: 2,
  },

  Mage: {
    spriteKey: 'mage',
    combat: {
      damage: 70,
      attackRate: 1200,
    },
    scale: 2,
  },

  Rogue: {
    spriteKey: 'rogue',
    combat: {
      damage: 40,
      critChance: 0.35,
      attackRate: 600,
    },
    scale: 2,
  },

  Cleric: {
    spriteKey: 'cleric',
    combat: {
      damage: 30,
      heal: 25,
      attackRate: 1000,
    },
    scale: 2,
  },
};

export const BOSS_CONFIG = {
  spriteKey: 'boss',
  animations: {
    idle: { key: 'boss_idle_anim', sheet: 'boss_idle', frameRate: 8, repeat: -1, frames: { start: 0, end: 7 } },
    attack1: { key: 'boss_attack_1_anim', sheet: 'boss_attack_1', frameRate: 12, repeat: 0, frames: { start: 0, end: 5 } },
    attack2: { key: 'boss_attack_2_anim', sheet: 'boss_attack_2', frameRate: 12, repeat: 0, frames: { start: 0, end: 5 } },
  },
  sprites: {
    idle: { path: 'assets/sprites/war_boss/Idle.png', frameWidth: 200, frameHeight: 200 },
    attack1: { path: 'assets/sprites/war_boss/Attack1.png', frameWidth: 200, frameHeight: 200 },
    attack2: { path: 'assets/sprites/war_boss/Attack2.png', frameWidth: 200, frameHeight: 200 },
  },
  physics: {
    bodySize: { width: 80, height: 120 },
    bodyOffset: { x: 60, y: 15 },
  },
  combat: {
    attacks: [
      { key: 'boss_attack_1_anim', damage: 40 },
      { key: 'boss_attack_2_anim', damage: 60 },
    ],
  },
  scale: 2.5,
};