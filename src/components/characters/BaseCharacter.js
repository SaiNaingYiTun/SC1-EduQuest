export class BaseCharacter {
  constructor(scene, x, y, config) {
    this.scene = scene;
    this.sprite = null;
    this.config = config;
    this.movementSpeedMultiplier = 1;
    this.isAttacking = false;
    this.isDead = false;
    this.isTakingHit = false;
    this.currentAnim = null;
  }

  preload() {
    // Override in child classes
  }

  create(x, y) {
    // Override in child classes
  }

  setupPhysics(groundLayer) {
    if (!this.sprite) return;
    
    this.scene.physics.add.collider(this.sprite, groundLayer);
    this.sprite.body.setCollideWorldBounds(false);
  }

  playAnimation(animKey) {
    if (!this.sprite || !this.scene.anims.exists(animKey)) {
      console.error(`Animation "${animKey}" does not exist`);
      return false;
    }

    if (this.currentAnim !== animKey) {
      this.sprite.play(animKey);
      this.currentAnim = animKey;
      return true;
    }
    return false;
  }

  attack(onComplete) {
    // Override in child classes
  }

  playSound(key, config = {}) {
    if (!key || !this.scene?.sound) return;
    if (!this.scene.cache?.audio?.exists(key)) return;
    this.scene.sound.play(key, config);
  }

  takeDamage(amount) {
    // Override in child classes
  }

  update() {
    // Override in child classes
  }

  destroy() {
    if (this.sprite) {
      this.sprite.destroy();
      this.sprite = null;
    }
  }

  getSprite() {
    return this.sprite;
  }

  setPosition(x, y) {
    if (this.sprite) {
      this.sprite.setPosition(x, y);
    }
  }

  getPosition() {
    return this.sprite ? { x: this.sprite.x, y: this.sprite.y } : null;
  }

  setMovementSpeedMultiplier(multiplier = 1) {
    if (!Number.isFinite(multiplier) || multiplier <= 0) {
      this.movementSpeedMultiplier = 1;
      return;
    }
    this.movementSpeedMultiplier = multiplier;
  }

  getMoveSpeed() {
    const baseMoveSpeed = Number(this.config?.physics?.moveSpeed) || 0;
    return baseMoveSpeed * this.movementSpeedMultiplier;
  }
}
