import { BaseCharacter } from './BaseCharacter';
import { CHARACTER_CONFIG } from './constants/characterConfig';
import Phaser from 'phaser';

export class Mage extends BaseCharacter {
  constructor(scene, x, y) {
    super(scene, x, y, CHARACTER_CONFIG.Mage);

    this.movementState = {
      isRunning: false,
      direction: 0,
      currentAnim: 'mage_idle_anim',
    };

    this.controls = {
      aKey: null,
      dKey: null,
      wKey: null,
      aPressed: false,
      dPressed: false,
    };
  }

  static preload(scene) {
    const config = CHARACTER_CONFIG.Mage;
    Object.entries(config.sprites).forEach(([key, spriteData]) => {
      scene.load.spritesheet(`mage_${key}`, spriteData.path, {
        frameWidth: spriteData.frameWidth,
        frameHeight: spriteData.frameHeight,
      });
    });
    scene.load.audio('mage_attack_sfx', 'assets/sounds/mage_attack.mp3');
  }

  static createAnimations(scene) {
    const config = CHARACTER_CONFIG.Mage;

    Object.entries(config.animations).forEach(([_, animData]) => {
      if (scene.anims.exists(animData.key)) return;

      const texture = scene.textures.get(animData.sheet);
      if (!texture || !texture.frameTotal || texture.frameTotal <= 1) return;

      let frames;
      if (animData.frames) {
        const start = animData.frames.start;
        const end = Math.min(animData.frames.end, texture.frameTotal - 1);
        if (start > end || end >= texture.frameTotal) return;
        frames = scene.anims.generateFrameNumbers(animData.sheet, { start, end });
      } else {
        frames = scene.anims.generateFrameNumbers(animData.sheet, { start: 0, end: texture.frameTotal - 1 });
      }

      if (!frames || frames.length === 0) return;

      scene.anims.create({
        key: animData.key,
        frames,
        frameRate: animData.frameRate,
        repeat: animData.repeat,
      });
    });
  }

  create(x, y) {
    this.sprite = this.scene.physics.add.sprite(x, y, 'mage_idle');
    this.sprite.setOrigin(0.5, 1);
    this.sprite.setScale(this.config.scale);
    this.sprite.setDepth(5);

    const physics = this.config.physics;
    this.sprite.body.setSize(physics.bodySize.width, physics.bodySize.height);
    this.sprite.body.setOffset(physics.bodyOffset.x, physics.bodyOffset.y);
    this.sprite.body.setDrag(physics.drag);
    this.sprite.body.setMaxVelocity(physics.maxVelocity.x, physics.maxVelocity.y);

    this.setupControls();
    this.playAnimation('mage_idle_anim');
  }

  setupControls() {
    this.controls.aKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.controls.dKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.controls.wKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);

    this.controls.aKey.on('down', () => {
      this.controls.aPressed = true;
      this.movementState.direction = -1;
      this.controls.dPressed = false;
    });

    this.controls.aKey.on('up', () => {
      this.controls.aPressed = false;
      if (!this.controls.dPressed) this.movementState.direction = 0;
    });

    this.controls.dKey.on('down', () => {
      this.controls.dPressed = true;
      this.movementState.direction = 1;
      this.controls.aPressed = false;
    });

    this.controls.dKey.on('up', () => {
      this.controls.dPressed = false;
      if (!this.controls.aPressed) this.movementState.direction = 0;
    });

    this.controls.wKey.on('down', () => {
      this.jump();
    });
  }

  jump() {
    if (!this.sprite) return;
    const body = this.sprite.body;
    if (body.blocked.down || body.touching.down) {
      body.setVelocityY(this.config.physics.jumpVelocity);
    }
  }

  update() {
    if (!this.sprite || this.isDead) return;

    const body = this.sprite.body;
    if (this.isAttacking || this.isTakingHit) {
      body.setVelocityX(0);
      return;
    }

    if (this.movementState.direction === -1) {
      body.setVelocityX(-this.getMoveSpeed());
      this.sprite.setFlipX(true);
      this.movementState.isRunning = true;
    } else if (this.movementState.direction === 1) {
      body.setVelocityX(this.getMoveSpeed());
      this.sprite.setFlipX(false);
      this.movementState.isRunning = true;
    } else {
      body.setVelocityX(0);
      this.movementState.isRunning = false;
    }

    const isGrounded = body.blocked.down || body.touching.down;
    if (!isGrounded) {
      if (body.velocity.y < 0) this.playAnimation('mage_jump_anim');
      else this.playAnimation('mage_fall_anim');
      return;
    }

    if (this.movementState.isRunning) this.playAnimation('mage_run_anim');
    else this.playAnimation('mage_idle_anim');
  }

  attack(onComplete) {
    if (this.isAttacking || this.isTakingHit || this.isDead || !this.sprite) return;

    const currentKey = this.sprite.anims?.currentAnim?.key || '';
    if (this.sprite.anims?.isPlaying && currentKey.includes('_attack')) return;

    this.isAttacking = true;
    const attackAnim = Phaser.Utils.Array.GetRandom(this.config.combat.attacks);

    if (!this.scene.anims.exists(attackAnim)) {
      this.isAttacking = false;
      if (onComplete) onComplete();
      return;
    }

    this.sprite.play(attackAnim);
    this.currentAnim = attackAnim;
    this.playSound('mage_attack_sfx', { volume: 0.4 });

    const completeHandler = () => {
      this.isAttacking = false;
      this.playAnimation('mage_idle_anim');
      if (onComplete) onComplete();
    };

    const eventKey = Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + attackAnim;
    this.sprite.once(eventKey, completeHandler);

    const anim = this.scene.anims.get(attackAnim);
    const fallbackMs = Math.max(250, Math.ceil(((anim?.msPerFrame || (1000 / (anim?.frameRate || 10))) * (anim?.frames?.length || 1)) + 100));

    this.scene.time.delayedCall(fallbackMs, () => {
      if (this.isAttacking) {
        this.sprite.off(eventKey, completeHandler);
        completeHandler();
      }
    });
  }

  getDamage() {
    return this.config.combat.damage;
  }

  getAttackRate() {
    return this.config.combat.attackRate;
  }

  takeDamage(amount) {
    console.log(`Mage took ${amount} damage`);
    if (!this.sprite || this.isDead || this.isTakingHit) return;
    this.playSound('male_hurt', { volume: 0.45 });

    this.isTakingHit = true;
    this.isAttacking = false;
    this.sprite.body.setVelocityX(0);

    if (this.scene.anims.exists('mage_take_hit_anim')) {
      this.sprite.play('mage_take_hit_anim');

      const eventKey = Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + 'mage_take_hit_anim';
      const completeHandler = () => {
        this.isTakingHit = false;
        if (!this.isDead) this.playAnimation('mage_idle_anim');
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
    if (this.isDead || !this.sprite) return;

    this.isDead = true;
    this.isAttacking = false;
    this.isTakingHit = false;
    this.sprite.body.setVelocity(0, 0);

    if (this.scene.anims.exists('mage_death_anim')) {
      this.sprite.play('mage_death_anim');

      const eventKey = Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + 'mage_death_anim';
      let done = false;
      const completeHandler = () => {
        if (done) return;
        done = true;
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

  destroy() {
    if (this.controls.aKey) this.controls.aKey.removeAllListeners();
    if (this.controls.dKey) this.controls.dKey.removeAllListeners();
    if (this.controls.wKey) this.controls.wKey.removeAllListeners();

    super.destroy();
  }
}



