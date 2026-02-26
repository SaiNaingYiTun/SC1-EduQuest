import Phaser from 'phaser';
import { BaseCharacter } from './BaseCharacter';

const FORREST_BOSS_IDLE_SHEET = 'forrest_boss_idle';
const FORREST_BOSS_SPELL_SHEET = 'forrest_boss_spell';
const FORREST_BOSS_THORN_SHEET = 'forrest_boss_thorn';
const FORREST_BOSS_TELEPORT_OUT_SHEET = 'forrest_boss_teleport_out';
const FORREST_BOSS_TELEPORT_IN_SHEET = 'forrest_boss_teleport_in';
const FORREST_BOSS_DEATH_SHEET = 'forrest_boss_death';
const FORREST_BOSS_PROJECTILE_MOVE_SHEET = 'forrest_boss_projectile_move';
const FORREST_BOSS_PROJECTILE_EXPLODE_SHEET = 'forrest_boss_projectile_explode';

const FORREST_BOSS_IDLE_ANIM = 'forrest_boss_idle_anim';
const FORREST_BOSS_SPELL_ANIM = 'forrest_boss_spell_anim';
const FORREST_BOSS_THORN_ANIM = 'forrest_boss_thorn_anim';
const FORREST_BOSS_TELEPORT_OUT_ANIM = 'forrest_boss_teleport_out_anim';
const FORREST_BOSS_TELEPORT_IN_ANIM = 'forrest_boss_teleport_in_anim';
const FORREST_BOSS_DEATH_ANIM = 'forrest_boss_death_anim';
const FORREST_BOSS_PROJECTILE_MOVE_ANIM = 'forrest_boss_projectile_move_anim';
const FORREST_BOSS_PROJECTILE_EXPLODE_ANIM = 'forrest_boss_projectile_explode_anim';
const FORREST_SPELL_SFX_KEY = 'forrest_spell_sfx';

const FORREST_BOSS_SCALE = 2.3;
const FORREST_BOSS_ATTACK_DAMAGE = 52;

export class ForrestBoss extends BaseCharacter {
  constructor(scene, x, y) {
    super(scene, x, y, {
      physics: {
        bodySize: { width: 36, height: 56 },
        bodyOffset: { x: 44, y: 6 },
      },
      combat: {
        attacks: [
          { key: FORREST_BOSS_SPELL_ANIM, damage: FORREST_BOSS_ATTACK_DAMAGE },
          { key: FORREST_BOSS_THORN_ANIM, damage: FORREST_BOSS_ATTACK_DAMAGE + 4 },
        ],
      },
      scale: FORREST_BOSS_SCALE,
    });
  }

  static preload(scene) {
    scene.load.spritesheet(FORREST_BOSS_IDLE_SHEET, 'assets/sprites/forrest_boss/forrest_mage_idle.png', {
      frameWidth: 123,
      frameHeight: 62,
    });
    scene.load.spritesheet(FORREST_BOSS_SPELL_SHEET, 'assets/sprites/forrest_boss/forrest_mage_spell.png', {
      frameWidth: 123,
      frameHeight: 62,
    });
    scene.load.spritesheet(FORREST_BOSS_THORN_SHEET, 'assets/sprites/forrest_boss/forrest_mage_thorns.png', {
      frameWidth: 123,
      frameHeight: 62,
    });
    scene.load.spritesheet(FORREST_BOSS_TELEPORT_OUT_SHEET, 'assets/sprites/forrest_boss/forrest_mage_teleport1.png', {
      frameWidth: 123,
      frameHeight: 62,
    });
    scene.load.spritesheet(FORREST_BOSS_TELEPORT_IN_SHEET, 'assets/sprites/forrest_boss/forrest_mage_teleport2.png', {
      frameWidth: 123,
      frameHeight: 62,
    });
    scene.load.spritesheet(FORREST_BOSS_DEATH_SHEET, 'assets/sprites/forrest_boss/forrest_mage_death.png', {
      frameWidth: 123,
      frameHeight: 62,
    });
    scene.load.spritesheet(FORREST_BOSS_PROJECTILE_MOVE_SHEET, 'assets/sprites/forrest_boss/forrest_mage_thorns.png', {
      frameWidth: 123,
      frameHeight: 62,
    });
    scene.load.spritesheet(FORREST_BOSS_PROJECTILE_EXPLODE_SHEET, 'assets/sprites/forrest_boss/explosion.png', {
      frameWidth: 123,
      frameHeight: 62,
    });
    scene.load.audio(FORREST_SPELL_SFX_KEY, 'assets/sounds/forrest_spell.mp3');
    scene.load.audio('teleport', 'assets/sounds/teleport.mp3');
    scene.load.audio('female_hurt', 'assets/sounds/female_hurt.mp3');
  }

  static createAnimations(scene) {
    if (!scene.anims.exists(FORREST_BOSS_IDLE_ANIM)) {
      scene.anims.create({
        key: FORREST_BOSS_IDLE_ANIM,
        frames: scene.anims.generateFrameNumbers(FORREST_BOSS_IDLE_SHEET, { start: 0, end: 5 }),
        frameRate: 10,
        repeat: -1,
      });
    }

    if (!scene.anims.exists(FORREST_BOSS_SPELL_ANIM)) {
      scene.anims.create({
        key: FORREST_BOSS_SPELL_ANIM,
        frames: scene.anims.generateFrameNumbers(FORREST_BOSS_SPELL_SHEET, { start: 0, end: 5 }),
        frameRate: 12,
        repeat: 0,
      });
    }

    if (!scene.anims.exists(FORREST_BOSS_THORN_ANIM)) {
      scene.anims.create({
        key: FORREST_BOSS_THORN_ANIM,
        frames: scene.anims.generateFrameNumbers(FORREST_BOSS_THORN_SHEET, { start: 0, end: 6 }),
        frameRate: 12,
        repeat: 0,
      });
    }

    if (!scene.anims.exists(FORREST_BOSS_TELEPORT_OUT_ANIM)) {
      scene.anims.create({
        key: FORREST_BOSS_TELEPORT_OUT_ANIM,
        frames: scene.anims.generateFrameNumbers(FORREST_BOSS_TELEPORT_OUT_SHEET, { start: 0, end: 4 }),
        frameRate: 14,
        repeat: 0,
      });
    }

    if (!scene.anims.exists(FORREST_BOSS_TELEPORT_IN_ANIM)) {
      scene.anims.create({
        key: FORREST_BOSS_TELEPORT_IN_ANIM,
        frames: scene.anims.generateFrameNumbers(FORREST_BOSS_TELEPORT_IN_SHEET, { start: 0, end: 5 }),
        frameRate: 14,
        repeat: 0,
      });
    }

    if (!scene.anims.exists(FORREST_BOSS_DEATH_ANIM)) {
      scene.anims.create({
        key: FORREST_BOSS_DEATH_ANIM,
        frames: scene.anims.generateFrameNumbers(FORREST_BOSS_DEATH_SHEET, { start: 0, end: 5 }),
        frameRate: 10,
        repeat: 0,
      });
    }

    if (!scene.anims.exists(FORREST_BOSS_PROJECTILE_MOVE_ANIM)) {
      scene.anims.create({
        key: FORREST_BOSS_PROJECTILE_MOVE_ANIM,
        frames: scene.anims.generateFrameNumbers(FORREST_BOSS_PROJECTILE_MOVE_SHEET, { start: 0, end: 6 }),
        frameRate: 16,
        repeat: -1,
      });
    }

    if (!scene.anims.exists(FORREST_BOSS_PROJECTILE_EXPLODE_ANIM)) {
      scene.anims.create({
        key: FORREST_BOSS_PROJECTILE_EXPLODE_ANIM,
        frames: scene.anims.generateFrameNumbers(FORREST_BOSS_PROJECTILE_EXPLODE_SHEET, { start: 0, end: 3 }),
        frameRate: 18,
        repeat: 0,
      });
    }
  }

  create(x, y) {
    this.sprite = this.scene.physics.add.sprite(x, y, FORREST_BOSS_IDLE_SHEET);
    this.sprite.setOrigin(0.5, 1);
    this.sprite.setScale(this.config.scale);
    this.sprite.setDepth(5);
    this.sprite.setFlipX(false);

    this.sprite.body.setSize(this.config.physics.bodySize.width, this.config.physics.bodySize.height);
    this.sprite.body.setOffset(this.config.physics.bodyOffset.x, this.config.physics.bodyOffset.y);

    if (this.scene.anims.exists(FORREST_BOSS_IDLE_ANIM)) {
      this.sprite.play(FORREST_BOSS_IDLE_ANIM);
    }
  }

  canFight() {
    return !this.isDead;
  }

  update() {
    if (!this.sprite || this.isDead || this.isAttacking || this.isTakingHit) return;
    if (this.scene.anims.exists(FORREST_BOSS_IDLE_ANIM)) {
      const currentKey = this.sprite.anims?.currentAnim?.key;
      if (currentKey !== FORREST_BOSS_IDLE_ANIM) {
        this.sprite.play(FORREST_BOSS_IDLE_ANIM, true);
      }
    }
  }

  attack(onComplete, preferredAttackKey = null) {
    if (!this.canFight()) return;
    if (!this.sprite || this.isAttacking || this.isTakingHit) return;

    const attackKey =
      preferredAttackKey && this.scene.anims.exists(preferredAttackKey)
        ? preferredAttackKey
        : FORREST_BOSS_SPELL_ANIM;

    if (!this.scene.anims.exists(attackKey)) {
      if (onComplete) onComplete(FORREST_BOSS_ATTACK_DAMAGE);
      return;
    }

    this.isAttacking = true;
    this.sprite.play(attackKey);

    const eventKey = Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + attackKey;
    const done = () => {
      this.isAttacking = false;
      if (!this.isDead && this.scene.anims.exists(FORREST_BOSS_IDLE_ANIM)) {
        this.sprite.play(FORREST_BOSS_IDLE_ANIM, true);
      }
      if (onComplete) onComplete(FORREST_BOSS_ATTACK_DAMAGE);
    };

    this.sprite.once(eventKey, done);
    this.scene.time.delayedCall(1200, () => {
      if (this.isAttacking) {
        this.sprite.off(eventKey, done);
        done();
      }
    });
  }

  takeDamage(_amount) {
    if (!this.sprite || this.isDead || this.isTakingHit) return;
    this.isTakingHit = true;
    this.playSound('female_hurt', { volume: 0.45 });
    // Take-hit is a red body flash, not teleport sprites.
    this.sprite.setTint(0xef4444);
    this.scene.time.delayedCall(150, () => {
      if (this.sprite?.active) {
        this.sprite.clearTint();
      }
      this.isTakingHit = false;
    });
  }

  teleportNear(x, y, onComplete) {
    if (!this.sprite || this.isDead || this.isTakingHit || this.isAttacking) {
      if (onComplete) onComplete();
      return;
    }

    this.isAttacking = true;
    this.playSound('teleport', { volume: 0.45 });
    const finish = () => {
      this.isAttacking = false;
      if (!this.isDead && this.scene.anims.exists(FORREST_BOSS_IDLE_ANIM)) {
        this.sprite.play(FORREST_BOSS_IDLE_ANIM, true);
      }
      if (onComplete) onComplete();
    };

    const playTeleportIn = () => {
      this.sprite.setPosition(x, y);
      if (this.scene.anims.exists(FORREST_BOSS_TELEPORT_IN_ANIM)) {
        this.sprite.play(FORREST_BOSS_TELEPORT_IN_ANIM);
        const inKey = Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + FORREST_BOSS_TELEPORT_IN_ANIM;
        this.sprite.once(inKey, finish);
        this.scene.time.delayedCall(520, () => {
          if (this.isAttacking) finish();
        });
      } else {
        finish();
      }
    };

    if (this.scene.anims.exists(FORREST_BOSS_TELEPORT_OUT_ANIM)) {
      this.sprite.play(FORREST_BOSS_TELEPORT_OUT_ANIM);
      const outKey = Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + FORREST_BOSS_TELEPORT_OUT_ANIM;
      this.sprite.once(outKey, playTeleportIn);
      this.scene.time.delayedCall(420, () => {
        if (this.isAttacking) playTeleportIn();
      });
    } else {
      playTeleportIn();
    }
  }

  die(onComplete) {
    if (this.isDead) return;
    this.isDead = true;
    this.isAttacking = false;
    this.isTakingHit = false;

    if (this.scene.anims.exists(FORREST_BOSS_DEATH_ANIM)) {
      this.sprite.play(FORREST_BOSS_DEATH_ANIM);
      const eventKey = Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + FORREST_BOSS_DEATH_ANIM;
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
}
