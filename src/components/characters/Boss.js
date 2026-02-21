import { BaseCharacter } from './BaseCharacter';
import { BOSS_CONFIG } from './constants/characterConfig';
import Phaser from 'phaser';

export class Boss extends BaseCharacter {
  constructor(scene, x, y) {
    super(scene, x, y, BOSS_CONFIG);
  }

  static preload(scene) {
    console.log('=== BOSS PRELOAD START ===');
    
    // Load boss sprites with exact keys matching config
    scene.load.spritesheet('boss_idle', 'assets/sprites/war_boss/Idle.png', {
      frameWidth: 200,
      frameHeight: 200,
    });

    scene.load.spritesheet('boss_attack_1', 'assets/sprites/war_boss/Attack1.png', {
      frameWidth: 200,
      frameHeight: 200,
    });

    scene.load.spritesheet('boss_attack_2', 'assets/sprites/war_boss/Attack2.png', {
      frameWidth: 200,
      frameHeight: 200,
    });

    scene.load.spritesheet('boss_take_hit', 'assets/sprites/war_boss/Take_Hit.png', {
      frameWidth: 200,
      frameHeight: 200,
    });

    scene.load.spritesheet('boss_death', 'assets/sprites/war_boss/Death.png', {
      frameWidth: 200,
      frameHeight: 200,
    });

    console.log('Boss sprites queued for loading');
  }

  static createAnimations(scene) {
    console.log('=== BOSS ANIMATIONS CREATE START ===');
    
    // Wait for textures to be ready
    const idleTex = scene.textures.get('boss_idle');
    const attack1Tex = scene.textures.get('boss_attack_1');
    const attack2Tex = scene.textures.get('boss_attack_2');
    const takeHitTex = scene.textures.get('boss_take_hit');
    const deathTex = scene.textures.get('boss_death');

    console.log('Boss texture info:', {
      idle: idleTex.frameTotal,
      attack1: attack1Tex.frameTotal,
      attack2: attack2Tex.frameTotal,
      takeHit: takeHitTex.frameTotal,
      death: deathTex.frameTotal
    });

    // Create idle animation
    if (!scene.anims.exists('boss_idle_anim') && idleTex.frameTotal > 1) {
      scene.anims.create({
        key: 'boss_idle_anim',
        frames: scene.anims.generateFrameNumbers('boss_idle', { start: 0, end: Math.min(7, idleTex.frameTotal - 1) }),
        frameRate: 8,
        repeat: -1,
      });
      console.log('✅ Created boss_idle_anim');
    }

    // Create attack 1 animation
    if (!scene.anims.exists('boss_attack_1_anim') && attack1Tex.frameTotal > 1) {
      scene.anims.create({
        key: 'boss_attack_1_anim',
        frames: scene.anims.generateFrameNumbers('boss_attack_1', { start: 0, end: Math.min(5, attack1Tex.frameTotal - 1) }),
        frameRate: 12,
        repeat: 0,
      });
      console.log('✅ Created boss_attack_1_anim with', Math.min(5, attack1Tex.frameTotal - 1) + 1, 'frames');
    } else {
      console.error('❌ Cannot create boss_attack_1_anim - frameTotal:', attack1Tex.frameTotal);
    }

    // Create attack 2 animation
    if (!scene.anims.exists('boss_attack_2_anim') && attack2Tex.frameTotal > 1) {
      scene.anims.create({
        key: 'boss_attack_2_anim',
        frames: scene.anims.generateFrameNumbers('boss_attack_2', { start: 0, end: Math.min(5, attack2Tex.frameTotal - 1) }),
        frameRate: 12,
        repeat: 0,
      });
      console.log('✅ Created boss_attack_2_anim with', Math.min(5, attack2Tex.frameTotal - 1) + 1, 'frames');
    } else {
      console.error('❌ Cannot create boss_attack_2_anim - frameTotal:', attack2Tex.frameTotal);
    }

    // Create take hit animation
    if (!scene.anims.exists('boss_take_hit_anim') && takeHitTex.frameTotal > 1) {
      scene.anims.create({
        key: 'boss_take_hit_anim',
        frames: scene.anims.generateFrameNumbers('boss_take_hit', { start: 0, end: Math.min(2, takeHitTex.frameTotal - 1) }),
        frameRate: 10,
        repeat: 0,
      });
      console.log('✅ Created boss_take_hit_anim');
    }

    // Create death animation
    if (!scene.anims.exists('boss_death_anim') && deathTex.frameTotal > 1) {
      scene.anims.create({
        key: 'boss_death_anim',
        frames: scene.anims.generateFrameNumbers('boss_death', { start: 0, end: Math.min(5, deathTex.frameTotal - 1) }),
        frameRate: 8,
        repeat: 0,
      });
      console.log('✅ Created boss_death_anim');
    }
  }

  create(x, y) {
    this.sprite = this.scene.physics.add.sprite(x, y, 'boss_idle');
    this.sprite.setOrigin(0.5, 1);
    this.sprite.setScale(this.config.scale);
    this.sprite.setFlipX(true);
    this.sprite.setDepth(5);

    // Physics setup
    const physics = this.config.physics;
    this.sprite.body.setSize(physics.bodySize.width, physics.bodySize.height);
    this.sprite.body.setOffset(physics.bodyOffset.x, physics.bodyOffset.y);

    if (this.scene.anims.exists('boss_idle_anim')) {
      this.sprite.play('boss_idle_anim');
      console.log('Playing boss idle animation');
    } else {
      console.error('boss_idle_anim does not exist!');
    }
  }

  update() {
    if (!this.sprite || this.isDead) return;

    // Keep idle animation playing when not attacking
    if (!this.isAttacking && !this.isTakingHit) {
      const currentKey = this.sprite.anims.currentAnim?.key;
      if (!this.sprite.anims.isPlaying || currentKey !== 'boss_idle_anim') {
        if (this.scene.anims.exists('boss_idle_anim')) {
          this.sprite.play('boss_idle_anim');
        }
      }
    }
  }

  attack(onComplete) {
    if (!this.sprite || this.isAttacking || this.isDead || this.isTakingHit) return;

    this.isAttacking = true;
    console.log('🔥 Boss attack initiated');

    // Get available attacks
    const availableAttacks = this.config.combat.attacks.filter(atk => 
      this.scene.anims.exists(atk.key)
    );

    if (availableAttacks.length === 0) {
      console.error('❌ No boss attack animations available!');
      this.isAttacking = false;
      // Still deal damage even without animation
      if (onComplete) onComplete(40);
      return;
    }

    const attack = Phaser.Utils.Array.GetRandom(availableAttacks);
    console.log('Playing boss attack:', attack.key);

    // Play attack animation
    this.sprite.play(attack.key);

    // Listen for specific attack completion
    const eventKey = Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + attack.key;
    
    const completeHandler = () => {
      console.log('✅ Boss attack animation completed:', attack.key);
      this.isAttacking = false;
      
      // Return to idle
      if (this.scene.anims.exists('boss_idle_anim')) {
        this.sprite.play('boss_idle_anim', true);
      }

      if (onComplete) {
        onComplete(attack.damage);
      }
    };

    this.sprite.once(eventKey, completeHandler);

    // Fallback timeout
    this.scene.time.delayedCall(2000, () => {
      if (this.isAttacking) {
        console.warn('⚠️ Boss attack timeout, forcing completion');
        this.sprite.off(eventKey, completeHandler);
        completeHandler();
      }
    });
  }

  takeDamage(amount) {
    if (!this.sprite || this.isDead || this.isTakingHit) return;

    console.log(`Boss took ${amount} damage`);
    
    this.isTakingHit = true;

    // Play take hit animation if available
    if (this.scene.anims.exists('boss_take_hit_anim')) {
      this.sprite.play('boss_take_hit_anim');
      
      const eventKey = Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + 'boss_take_hit_anim';
      
      const completeHandler = () => {
        this.isTakingHit = false;
        
        // Return to idle or stay dead
        if (!this.isDead && this.scene.anims.exists('boss_idle_anim')) {
          this.sprite.play('boss_idle_anim', true);
        }
      };

      this.sprite.once(eventKey, completeHandler);

      // Fallback
      this.scene.time.delayedCall(500, () => {
        if (this.isTakingHit) {
          this.sprite.off(eventKey, completeHandler);
          completeHandler();
        }
      });
    } else {
      // No animation, just flash
      this.isTakingHit = false;
    }
  }

  die(onComplete) {
    if (this.isDead) return;

    this.isDead = true;
    this.isAttacking = false;
    this.isTakingHit = false;

    console.log('💀 Boss death initiated');

    // Play death animation if available
    if (this.scene.anims.exists('boss_death_anim')) {
      this.sprite.play('boss_death_anim');
      
      const eventKey = Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + 'boss_death_anim';
      
      const completeHandler = () => {
        console.log('✅ Boss death animation completed');
        if (onComplete) onComplete();
      };

      this.sprite.once(eventKey, completeHandler);

      // Fallback
      this.scene.time.delayedCall(1500, () => {
        this.sprite.off(eventKey, completeHandler);
        completeHandler();
      });
    } else {
      // No animation, immediate callback
      if (onComplete) onComplete();
    }
  }

  getAttacks() {
    return this.config.combat.attacks;
  }
}