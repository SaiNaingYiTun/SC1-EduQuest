import Phaser from 'phaser';

export class BaseCharacter {
  constructor(scene, x, y, config) {
    this.scene = scene;
    this.sprite = null;
    this.config = config;
    this.isAttacking = false;
    this.isDead = false;
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
}