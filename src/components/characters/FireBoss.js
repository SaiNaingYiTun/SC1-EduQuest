import Phaser from 'phaser';
import { BaseCharacter } from './BaseCharacter';

const FIRE_BOSS_IDLE_SHEET = 'fire_boss_idle';
const FIRE_BOSS_RUN_SHEET = 'fire_boss_run';
const FIRE_BOSS_ATTACK_SHEET = 'fire_boss_attack';
const FIRE_BOSS_TAKE_HIT_SHEET = 'fire_boss_take_hit';
const FIRE_BOSS_DEATH_SHEET = 'fire_boss_death';
const FIRE_BOSS_PROJECTILE_MOVE_SHEET = 'fire_boss_projectile_move';
const FIRE_BOSS_PROJECTILE_EXPLODE_SHEET = 'fire_boss_projectile_explode';

const FIRE_BOSS_IDLE_ANIM = 'fire_boss_idle_anim';
const FIRE_BOSS_RUN_ANIM = 'fire_boss_run_anim';
const FIRE_BOSS_ATTACK_ANIM = 'fire_boss_attack_anim';
const FIRE_BOSS_TAKE_HIT_ANIM = 'fire_boss_take_hit_anim';
const FIRE_BOSS_DEATH_ANIM = 'fire_boss_death_anim';
const FIRE_BOSS_PROJECTILE_MOVE_ANIM = 'fire_boss_projectile_move_anim';
const FIRE_BOSS_PROJECTILE_EXPLODE_ANIM = 'fire_boss_projectile_explode_anim';

const FIRE_BOSS_SCALE = 3.5;
const FIRE_BOSS_ATTACK_DAMAGE = 48;

export class FireBoss extends BaseCharacter {
  constructor(scene, x, y) {
    super(scene, x, y, {
      physics: {
        bodySize: { width: 36, height: 28 },
        bodyOffset: { x: 28, y: 30 },
      },
      combat: {
        attacks: [{ key: FIRE_BOSS_ATTACK_ANIM, damage: FIRE_BOSS_ATTACK_DAMAGE }],
      },
      scale: FIRE_BOSS_SCALE,
    });
  }

  static preload(scene) {
    scene.load.spritesheet(FIRE_BOSS_IDLE_SHEET, 'assets/sprites/fire_boss/Idle.png', {
      frameWidth: 90,
      frameHeight: 90,
    });
    scene.load.spritesheet(FIRE_BOSS_RUN_SHEET, 'assets/sprites/fire_boss/Walk.png', {
      frameWidth: 90,
      frameHeight: 90,
    });
    scene.load.spritesheet(FIRE_BOSS_ATTACK_SHEET, 'assets/sprites/fire_boss/Attack.png', {
      frameWidth: 90,
      frameHeight: 90,
    });
    scene.load.spritesheet(FIRE_BOSS_TAKE_HIT_SHEET, 'assets/sprites/fire_boss/Get Hit.png', {
      frameWidth: 90,
      frameHeight: 90,
    });
    scene.load.spritesheet(FIRE_BOSS_DEATH_SHEET, 'assets/sprites/fire_boss/Death.png', {
      frameWidth: 90,
      frameHeight: 90,
    });
    scene.load.spritesheet(FIRE_BOSS_PROJECTILE_MOVE_SHEET, 'assets/sprites/fire_boss/Move.png', {
      frameWidth: 46,
      frameHeight: 46,
    });
    scene.load.spritesheet(FIRE_BOSS_PROJECTILE_EXPLODE_SHEET, 'assets/sprites/fire_boss/Explosion.png', {
      frameWidth: 46,
      frameHeight: 46,
    });
    scene.load.audio('fire_attack', 'assets/sounds/fire_attack.mp3');
    scene.load.audio('fire_hurt', 'assets/sounds/fire_hurt.mp3');
  }

  static createAnimations(scene) {
    if (!scene.anims.exists(FIRE_BOSS_IDLE_ANIM)) {
      scene.anims.create({
        key: FIRE_BOSS_IDLE_ANIM,
        frames: scene.anims.generateFrameNumbers(FIRE_BOSS_IDLE_SHEET, { start: 0, end: 8 }),
        frameRate: 10,
        repeat: -1,
      });
    }

    if (!scene.anims.exists(FIRE_BOSS_RUN_ANIM)) {
      scene.anims.create({
        key: FIRE_BOSS_RUN_ANIM,
        frames: scene.anims.generateFrameNumbers(FIRE_BOSS_RUN_SHEET, { start: 0, end: 8 }),
        frameRate: 14,
        repeat: -1,
      });
    }

    if (!scene.anims.exists(FIRE_BOSS_ATTACK_ANIM)) {
      scene.anims.create({
        key: FIRE_BOSS_ATTACK_ANIM,
        frames: scene.anims.generateFrameNumbers(FIRE_BOSS_ATTACK_SHEET, { start: 0, end: 15 }),
        frameRate: 16,
        repeat: 0,
      });
    }

    if (!scene.anims.exists(FIRE_BOSS_TAKE_HIT_ANIM)) {
      scene.anims.create({
        key: FIRE_BOSS_TAKE_HIT_ANIM,
        frames: scene.anims.generateFrameNumbers(FIRE_BOSS_TAKE_HIT_SHEET, { start: 0, end: 2 }),
        frameRate: 12,
        repeat: 0,
      });
    }

    if (!scene.anims.exists(FIRE_BOSS_DEATH_ANIM)) {
      scene.anims.create({
        key: FIRE_BOSS_DEATH_ANIM,
        frames: scene.anims.generateFrameNumbers(FIRE_BOSS_DEATH_SHEET, { start: 0, end: 7 }),
        frameRate: 10,
        repeat: 0,
      });
    }

    if (!scene.anims.exists(FIRE_BOSS_PROJECTILE_MOVE_ANIM)) {
      scene.anims.create({
        key: FIRE_BOSS_PROJECTILE_MOVE_ANIM,
        frames: scene.anims.generateFrameNumbers(FIRE_BOSS_PROJECTILE_MOVE_SHEET, { start: 0, end: 5 }),
        frameRate: 16,
        repeat: -1,
      });
    }

    if (!scene.anims.exists(FIRE_BOSS_PROJECTILE_EXPLODE_ANIM)) {
      scene.anims.create({
        key: FIRE_BOSS_PROJECTILE_EXPLODE_ANIM,
        frames: scene.anims.generateFrameNumbers(FIRE_BOSS_PROJECTILE_EXPLODE_SHEET, { start: 0, end: 6 }),
        frameRate: 20,
        repeat: 0,
      });
    }
  }

  create(x, y) {
    this.sprite = this.scene.physics.add.sprite(x, y, FIRE_BOSS_IDLE_SHEET);
    this.sprite.setOrigin(0.5, 1);
    this.sprite.setScale(this.config.scale);
    this.sprite.setFlipX(true);
    this.sprite.setDepth(5);

    this.sprite.body.setSize(this.config.physics.bodySize.width, this.config.physics.bodySize.height);
    this.sprite.body.setOffset(this.config.physics.bodyOffset.x, this.config.physics.bodyOffset.y);

    if (this.scene.anims.exists(FIRE_BOSS_IDLE_ANIM)) {
      this.sprite.play(FIRE_BOSS_IDLE_ANIM);
    }
  }

  canFight() {
    return !this.isDead;
  }

  update() {
    if (!this.sprite || this.isDead || this.isAttacking || this.isTakingHit) return;
    const body = this.sprite.body;
    if (!body) return;

    const isMoving = Math.abs(body.velocity.x) > 8;
    const targetAnim = isMoving ? FIRE_BOSS_RUN_ANIM : FIRE_BOSS_IDLE_ANIM;
    const currentKey = this.sprite.anims?.currentAnim?.key;

    if (currentKey !== targetAnim && this.scene.anims.exists(targetAnim)) {
      this.sprite.play(targetAnim, true);
    }
  }

  attack(onComplete, preferredAttackKey = null) {
    if (!this.canFight()) return;
    if (!this.sprite || this.isAttacking || this.isTakingHit) return;

    const attackKey =
      preferredAttackKey && this.scene.anims.exists(preferredAttackKey)
        ? preferredAttackKey
        : FIRE_BOSS_ATTACK_ANIM;

    if (!this.scene.anims.exists(attackKey)) {
      if (onComplete) onComplete(FIRE_BOSS_ATTACK_DAMAGE);
      return;
    }

    this.isAttacking = true;
    this.sprite.play(attackKey);
    this.playSound('fire_attack', { volume: 0.4 });

    const eventKey = Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + attackKey;
    const done = () => {
      this.isAttacking = false;
      if (!this.isDead && this.scene.anims.exists(FIRE_BOSS_IDLE_ANIM)) {
        this.sprite.play(FIRE_BOSS_IDLE_ANIM, true);
      }
      if (onComplete) onComplete(FIRE_BOSS_ATTACK_DAMAGE);
    };

    this.sprite.once(eventKey, done);
    this.scene.time.delayedCall(1300, () => {
      if (this.isAttacking) {
        this.sprite.off(eventKey, done);
        done();
      }
    });
  }

  takeDamage(_amount) {
    if (!this.sprite || this.isDead || this.isTakingHit) return;
    this.playSound('fire_hurt', { volume: 0.45 });
    this.isTakingHit = true;

    if (this.scene.anims.exists(FIRE_BOSS_TAKE_HIT_ANIM)) {
      this.sprite.play(FIRE_BOSS_TAKE_HIT_ANIM);
      const eventKey = Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + FIRE_BOSS_TAKE_HIT_ANIM;
      const done = () => {
        this.isTakingHit = false;
        if (!this.isDead && this.scene.anims.exists(FIRE_BOSS_IDLE_ANIM)) {
          this.sprite.play(FIRE_BOSS_IDLE_ANIM, true);
        }
      };
      this.sprite.once(eventKey, done);
      this.scene.time.delayedCall(500, () => {
        if (this.isTakingHit) {
          this.sprite.off(eventKey, done);
          done();
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

    if (this.scene.anims.exists(FIRE_BOSS_DEATH_ANIM)) {
      this.sprite.play(FIRE_BOSS_DEATH_ANIM);
      const eventKey = Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + FIRE_BOSS_DEATH_ANIM;
      const done = () => {
        if (onComplete) onComplete();
      };
      this.sprite.once(eventKey, done);
      this.scene.time.delayedCall(1400, () => {
        this.sprite.off(eventKey, done);
        done();
      });
      return;
    }

    if (onComplete) onComplete();
  }

  getIdleAnimationKey() {
    return FIRE_BOSS_IDLE_ANIM;
  }
}
