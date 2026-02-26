import { BaseCharacter } from './BaseCharacter';
import { BOSS_CONFIG } from './constants/characterConfig';
import Phaser from 'phaser';

const BOSS_IDLE_ANIM = 'boss_idle_anim';
const BOSS_RUN_ANIM = 'boss_run_anim';
const BOSS_AWAKEN_ANIM = 'boss_awaken_anim';
const BOSS_ATTACK_1_ANIM = 'boss_attack_1_anim';
const BOSS_ATTACK_2_ANIM = 'boss_attack_2_anim';
const BOSS_TAKE_HIT_ANIM = 'boss_take_hit_anim';
const BOSS_DEATH_ANIM = 'boss_death_anim';

const BOSS_IDLE_KEYS = Array.from({ length: 6 }, (_, i) => `boss_demon_idle_${i + 1}`);
const BOSS_WALK_KEYS = Array.from({ length: 12 }, (_, i) => `boss_demon_walk_${i + 1}`);
const BOSS_CLEAVE_KEYS = Array.from({ length: 15 }, (_, i) => `boss_demon_cleave_${i + 1}`);
const BOSS_TAKE_HIT_KEYS = Array.from({ length: 5 }, (_, i) => `boss_demon_take_hit_${i + 1}`);
const BOSS_DEATH_KEYS = Array.from({ length: 22 }, (_, i) => `boss_demon_death_${i + 1}`);
const BOSS_AWAKEN_START_TEXTURE = BOSS_DEATH_KEYS[BOSS_DEATH_KEYS.length - 1];

const makeFrames = (keys) => keys.map((key) => ({ key }));

export class Boss extends BaseCharacter {
  constructor(scene, x, y) {
    super(scene, x, y, BOSS_CONFIG);
    this.hasAwakened = false;
    this.isAwakening = false;
  }

  static preload(scene) {
    BOSS_IDLE_KEYS.forEach((key, i) => {
      scene.load.image(key, `assets/sprites/demon_boss/01_demon_idle/demon_idle_${i + 1}.png`);
    });
    BOSS_WALK_KEYS.forEach((key, i) => {
      scene.load.image(key, `assets/sprites/demon_boss/02_demon_walk/demon_walk_${i + 1}.png`);
    });
    BOSS_CLEAVE_KEYS.forEach((key, i) => {
      scene.load.image(key, `assets/sprites/demon_boss/03_demon_cleave/demon_cleave_${i + 1}.png`);
    });
    BOSS_TAKE_HIT_KEYS.forEach((key, i) => {
      scene.load.image(key, `assets/sprites/demon_boss/04_demon_take_hit/demon_take_hit_${i + 1}.png`);
    });
    BOSS_DEATH_KEYS.forEach((key, i) => {
      scene.load.image(key, `assets/sprites/demon_boss/05_demon_death/demon_death_${i + 1}.png`);
    });

    scene.load.audio('demon_attack', 'assets/sounds/demon_attack.mp3');
    scene.load.audio('demon_hurt', 'assets/sounds/demon_hurt.mp3');
  }

  static createAnimations(scene) {
    if (scene.anims.exists(BOSS_IDLE_ANIM)) scene.anims.remove(BOSS_IDLE_ANIM);
    if (scene.anims.exists(BOSS_RUN_ANIM)) scene.anims.remove(BOSS_RUN_ANIM);
    if (scene.anims.exists(BOSS_AWAKEN_ANIM)) scene.anims.remove(BOSS_AWAKEN_ANIM);
    if (scene.anims.exists(BOSS_ATTACK_1_ANIM)) scene.anims.remove(BOSS_ATTACK_1_ANIM);
    if (scene.anims.exists(BOSS_ATTACK_2_ANIM)) scene.anims.remove(BOSS_ATTACK_2_ANIM);
    if (scene.anims.exists(BOSS_TAKE_HIT_ANIM)) scene.anims.remove(BOSS_TAKE_HIT_ANIM);
    if (scene.anims.exists(BOSS_DEATH_ANIM)) scene.anims.remove(BOSS_DEATH_ANIM);

    if (BOSS_IDLE_KEYS.every((key) => scene.textures.exists(key))) {
      scene.anims.create({
        key: BOSS_IDLE_ANIM,
        frames: makeFrames(BOSS_IDLE_KEYS),
        frameRate: 10,
        repeat: -1,
      });
    }

    if (BOSS_WALK_KEYS.every((key) => scene.textures.exists(key))) {
      scene.anims.create({
        key: BOSS_RUN_ANIM,
        frames: makeFrames(BOSS_WALK_KEYS),
        frameRate: 14,
        repeat: -1,
      });
    }

    if (BOSS_CLEAVE_KEYS.every((key) => scene.textures.exists(key))) {
      scene.anims.create({
        key: BOSS_ATTACK_1_ANIM,
        frames: makeFrames(BOSS_CLEAVE_KEYS),
        frameRate: 16,
        repeat: 0,
      });
      scene.anims.create({
        key: BOSS_ATTACK_2_ANIM,
        frames: makeFrames(BOSS_CLEAVE_KEYS),
        frameRate: 12,
        repeat: 0,
      });
    }

    if (BOSS_TAKE_HIT_KEYS.every((key) => scene.textures.exists(key))) {
      scene.anims.create({
        key: BOSS_TAKE_HIT_ANIM,
        frames: makeFrames(BOSS_TAKE_HIT_KEYS),
        frameRate: 12,
        repeat: 0,
      });
    }

    if (BOSS_DEATH_KEYS.every((key) => scene.textures.exists(key))) {
      scene.anims.create({
        key: BOSS_AWAKEN_ANIM,
        frames: makeFrames([...BOSS_DEATH_KEYS].reverse()),
        frameRate: 12,
        repeat: 0,
      });
      scene.anims.create({
        key: BOSS_DEATH_ANIM,
        frames: makeFrames(BOSS_DEATH_KEYS),
        frameRate: 12,
        repeat: 0,
      });
    }
  }

  create(x, y) {
    this.sprite = this.scene.physics.add.sprite(x, y, BOSS_IDLE_KEYS[0]);
    this.sprite.setOrigin(0.5, 1);
    this.sprite.setScale(this.config.scale);
    this.sprite.setFlipX(true);
    this.sprite.setDepth(5);

    const physics = this.config.physics;
    this.sprite.body.setSize(physics.bodySize.width, physics.bodySize.height);
    this.sprite.body.setOffset(physics.bodyOffset.x, physics.bodyOffset.y);

    // Start dormant at the first frame of awakening (reversed death frame 22).
    this.hasAwakened = false;
    this.isAwakening = false;
    this.isAttacking = false;
    if (this.scene.textures.exists(BOSS_AWAKEN_START_TEXTURE)) {
      this.sprite.setTexture(BOSS_AWAKEN_START_TEXTURE);
    }
  }

  canFight() {
    return this.hasAwakened && !this.isAwakening && !this.isDead;
  }

  triggerAwaken(onComplete) {
    if (!this.sprite || this.isDead || this.isAwakening || this.hasAwakened) return false;

    if (!this.scene.anims.exists(BOSS_AWAKEN_ANIM)) {
      this.hasAwakened = true;
      if (this.scene.anims.exists(BOSS_IDLE_ANIM)) {
        this.sprite.play(BOSS_IDLE_ANIM, true);
      }
      if (onComplete) onComplete();
      return true;
    }

    this.isAwakening = true;
    this.isAttacking = true;
    this.sprite.play(BOSS_AWAKEN_ANIM);

    const eventKey = Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + BOSS_AWAKEN_ANIM;
    const finishAwaken = () => {
      this.isAwakening = false;
      this.hasAwakened = true;
      this.isAttacking = false;
      if (this.scene.anims.exists(BOSS_IDLE_ANIM)) {
        this.sprite.play(BOSS_IDLE_ANIM, true);
      }
      if (onComplete) onComplete();
    };

    this.sprite.once(eventKey, finishAwaken);
    this.scene.time.delayedCall(2400, () => {
      if (this.isAwakening) {
        this.sprite.off(eventKey, finishAwaken);
        finishAwaken();
      }
    });

    return true;
  }

  update() {
    if (!this.sprite || this.isDead) return;
    if (!this.hasAwakened || this.isAwakening) return;
    if (this.isAttacking || this.isTakingHit) return;

    const body = this.sprite.body;
    if (!body) return;
    const isMoving = Math.abs(body.velocity.x) > 8;
    const currentKey = this.sprite.anims?.currentAnim?.key;
    const targetAnim = isMoving && this.scene.anims.exists(BOSS_RUN_ANIM) ? BOSS_RUN_ANIM : BOSS_IDLE_ANIM;

    if (currentKey !== targetAnim && this.scene.anims.exists(targetAnim)) {
      this.sprite.play(targetAnim, true);
    }
  }

  attack(onComplete, preferredAttackKey = null) {
    if (!this.canFight()) return;
    if (!this.sprite || this.isAttacking || this.isDead || this.isTakingHit) return;

    this.isAttacking = true;

    const availableAttacks = this.config.combat.attacks.filter((atk) =>
      this.scene.anims.exists(atk.key)
    );

    if (availableAttacks.length === 0) {
      this.isAttacking = false;
      if (onComplete) onComplete(40);
      return;
    }

    const attack =
      (preferredAttackKey && availableAttacks.find((atk) => atk.key === preferredAttackKey)) ||
      Phaser.Utils.Array.GetRandom(availableAttacks);

    this.sprite.play(attack.key);
    this.playSound('demon_attack', { volume: 0.45 });

    const eventKey = Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + attack.key;

    const completeHandler = () => {
      this.isAttacking = false;
      if (this.scene.anims.exists(BOSS_IDLE_ANIM)) {
        this.sprite.play(BOSS_IDLE_ANIM, true);
      }
      if (onComplete) {
        onComplete(attack.damage);
      }
    };

    this.sprite.once(eventKey, completeHandler);

    this.scene.time.delayedCall(2000, () => {
      if (this.isAttacking) {
        this.sprite.off(eventKey, completeHandler);
        completeHandler();
      }
    });
  }

  takeDamage(_amount) {
    if (!this.hasAwakened) return;
    if (!this.sprite || this.isDead || this.isTakingHit) return;
    this.playSound('demon_hurt', { volume: 0.45 });
    this.isTakingHit = true;

    if (this.scene.anims.exists(BOSS_TAKE_HIT_ANIM)) {
      this.sprite.play(BOSS_TAKE_HIT_ANIM);
      const eventKey = Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + BOSS_TAKE_HIT_ANIM;
      const completeHandler = () => {
        this.isTakingHit = false;
        if (!this.isDead && this.scene.anims.exists(BOSS_IDLE_ANIM)) {
          this.sprite.play(BOSS_IDLE_ANIM, true);
        }
      };
      this.sprite.once(eventKey, completeHandler);
      this.scene.time.delayedCall(500, () => {
        if (this.isTakingHit) {
          this.sprite.off(eventKey, completeHandler);
          completeHandler();
        }
      });
      return;
    }

    this.isTakingHit = false;
  }

  die(onComplete) {
    if (this.isDead) return;

    this.isDead = true;
    this.isAttacking = false;
    this.isTakingHit = false;

    if (this.scene.anims.exists(BOSS_DEATH_ANIM)) {
      this.sprite.play(BOSS_DEATH_ANIM);
      const eventKey = Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + BOSS_DEATH_ANIM;
      const completeHandler = () => {
        if (onComplete) onComplete();
      };

      this.sprite.once(eventKey, completeHandler);
      this.scene.time.delayedCall(1500, () => {
        this.sprite.off(eventKey, completeHandler);
        completeHandler();
      });
      return;
    }

    if (onComplete) onComplete();
  }

  getAttacks() {
    return this.config.combat.attacks;
  }
}
