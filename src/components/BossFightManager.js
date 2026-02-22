import Phaser from 'phaser';
import { Warrior } from './characters/Warrior';
import { Mage } from './characters/Mage';
import { Archer } from './characters/Archer';
import { Witch } from './characters/Witch';
import { Boss } from './characters/Boss';

export class BossFightManager {
  constructor(scene, config) {
    this.scene = scene;
    this.quest = config.quest;
    this.character = config.character;
    this.playerHP = config.playerHP;
    this.maxPlayerHP = config.maxPlayerHP;
    this.bossMaxHP = config.bossMaxHP;
    this.bossHP = this.bossMaxHP;
    this.onComplete = config.onComplete;

    this.isAttacking = false;
    this.playerCharacter = null;
    this.bossCharacter = null;
    this.attackKey = null;
    this.hpBarPlayer = null;
    this.hpBarBoss = null;
    this.playerHpLabel = null;
    this.bossHpLabel = null;
    this.bossHpBarIcon = null;
    this.bossHpBarX = 0;
    this.bossHpBarY = 0;
    this.bossHpBarWidth = 0;
    this.bossHpBarHeight = 0;
    this.bossHpBarDisplayWidth = 0;
    this.bossHpBarDisplayHeight = 0;
    this.combatText = null;
    this.debugGraphics = null;
    this.showDebugHitboxes = false;
    this.chestLayer = null;
    this.chestCollider = null;
    this.chestPromptText = null;
    this.bossDefeated = false;
    this.awaitingChestPickup = false;
    
    // Hit detection
    this.playerAttackHitbox = null;
    this.bossAttackHitbox = null;
    this.lastPlayerAttackTime = 0;
    this.lastBossAttackTime = 0;
    this.bossAttackTimer = 0;
    this.bossAttackCooldown = 3000; // Boss attacks every 3 seconds
    this.playerAttackActive = false;
    this.bossAttackActive = false;
    this.playerAttackHasHit = false;
    this.bossAttackHasHit = false;
    this.pendingPlayerDamage = 0;
    this.pendingBossDamage = 0;
    this.activeArcherArrows = [];
    this.archerArrowSpeed = 650;
    this.archerArrowRange = 900;
    this.archerArrowHitbox = { width: 28, height: 8, offsetX: 10, offsetY: 0 };
    this.activeWitchProjectiles = [];
    this.witchProjectileSpeed = 520;
    this.witchProjectileRange = 860;
    this.witchProjectileHitbox = { width: 20, height: 20, offsetX: 10, offsetY: 16 };
  }

  start() {
    this.scene.children.removeAll(true);

    // ✅ Create debug graphics
    if (this.showDebugHitboxes) {
      this.debugGraphics = this.scene.add.graphics();
      this.debugGraphics.setDepth(1000);
    }

    // Tilemap setup (new boss map)
    const map = this.scene.make.tilemap({ key: 'bmap1' });
    const bwtiles1 = map.addTilesetImage('bwtiles1', 'bwtiles1');
    const door = map.addTilesetImage('door', 'door');
    const bg2Tileset = map.addTilesetImage('bg2', 'bg2');
    const tree = map.addTilesetImage('tree', 'tree');
    const extra = map.addTilesetImage('extra', 'extra');
    const extra2 = map.addTilesetImage('extra2', 'extra2');
    const tilesets = [bwtiles1, door, bg2Tileset, tree, extra, extra2].filter(Boolean);

    const bg1Layer = map.createLayer('bg1', tilesets, 0, 0);
    const bg2Layer = map.createLayer('bg2', tilesets, 0, 0);
    this.chestLayer = map.createLayer('chest', tilesets, 0, 0);
    const groundLayer = map.createLayer('ground', tilesets, 0, 0);

    if (bg1Layer) bg1Layer.setDepth(-7);
    if (bg2Layer) bg2Layer.setDepth(-6);
    if (this.chestLayer) {
      this.chestLayer.setDepth(-5);
      this.chestLayer.setVisible(false);
    }
    if (groundLayer) {
      groundLayer.setDepth(-4);
      groundLayer.setCollisionByProperty({ collides: true });
      groundLayer.setCollisionByExclusion([-1]);
    }

    this.scene.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    // Spawn positions
    const playerSpawnX = 200;
    const playerSpawnY = 100;
    const bossSpawnX = 1100;
    const bossSpawnY = 100;

    // Background
    const bg = this.scene.add.rectangle(640, 320, 1280, 640, 0x1a0d2e);
    bg.setDepth(-10);

    this.scene.add
      .text(640, 612, 'FINAL BOSS FIGHT!', {
        fontSize: '22px',
        color: '#ef4444',
        fontFamily: 'monospace',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(35);

    // this.combatText = this.scene.add
    //   .text(640, 530, 'Press ENTER to attack', {
    //     fontSize: '22px',
    //     color: '#fbbf24',
    //     fontFamily: 'monospace',
    //   })
    //   .setOrigin(0.5)
    //   .setDepth(20);

    // Create boss
    this.bossCharacter = new Boss(this.scene, bossSpawnX, bossSpawnY);
    this.bossCharacter.create(bossSpawnX, bossSpawnY);
    this.bossCharacter.setupPhysics(groundLayer);

    // Create player based on class
    this.createPlayer(playerSpawnX, playerSpawnY, groundLayer);

    // Create attack hitboxes (invisible zones)
    this.createAttackHitboxes();
    this.createAttackOverlaps();

    // HP bars
    this.hpBarPlayer = this.scene.add.graphics();
    this.hpBarPlayer.setDepth(40);
    this.hpBarBoss = this.scene.add.graphics();
    this.hpBarBoss.setDepth(40);

    this.bossHpBarDisplayWidth = 360;
    this.bossHpBarDisplayHeight = 12;
    const hudCenterX = 640;
    this.bossHpBarY = 40;
    this.bossHpBarX = hudCenterX - this.bossHpBarDisplayWidth / 2;

    this.bossHpBarIcon = this.scene.add
      .image(this.bossHpBarX + 57, this.bossHpBarY, 'boss_healthbar_icon')
      .setOrigin(0.5, 0.5)
      .setScale(1)
      .setDisplaySize(200, 50)
      .setScrollFactor(0)
      .setDepth(41);

    this.playerHpLabel = this.scene.add
      .text(0, 0, `HP ${this.playerHP}/${this.maxPlayerHP}`, {
        fontSize: '14px',
        color: '#ffffff',
        fontFamily: 'monospace',
      })
      .setOrigin(0.5)
      .setDepth(41);

    this.bossHpLabel = this.scene.add
      .text(640, this.bossHpBarY + 22, `Boss HP: ${this.bossHP}/${this.bossMaxHP}`, {
        fontSize: '16px',
        color: '#ffffff',
        fontFamily: 'monospace',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(32);

    this.updateHPBars();

    this.attackKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
  }

  createPlayer(spawnX, spawnY, groundLayer) {
    switch (this.character.class) {
      case 'Warrior':
        this.playerCharacter = new Warrior(this.scene, spawnX, spawnY);
        break;
      case 'Mage':
        this.playerCharacter = new Mage(this.scene, spawnX, spawnY);
        break;
      case 'Archer':
        this.playerCharacter = new Archer(this.scene, spawnX, spawnY);
        break;
      case 'Witch':
        this.playerCharacter = new Witch(this.scene, spawnX, spawnY);
        break;
      default:
        this.playerCharacter = new Warrior(this.scene, spawnX, spawnY);
    }

    this.playerCharacter.create(spawnX, spawnY);
    this.playerCharacter.setupPhysics(groundLayer);
  }

  createAttackHitboxes() {
    // Player attack hitbox (in front of player)
    this.playerAttackHitbox = this.scene.add.rectangle(0, 0, 90, 80);
    this.playerAttackHitbox.setAlpha(0);
    this.scene.physics.add.existing(this.playerAttackHitbox);
    this.playerAttackHitbox.body.setAllowGravity(false);
    this.playerAttackHitbox.body.setEnable(false);

    // Boss attack hitbox (in front of boss)
    this.bossAttackHitbox = this.scene.add.rectangle(0, 0, 120, 100);
    this.bossAttackHitbox.setAlpha(0);
    this.scene.physics.add.existing(this.bossAttackHitbox);
    this.bossAttackHitbox.body.setAllowGravity(false);
    this.bossAttackHitbox.body.setEnable(false);
  }

  createAttackOverlaps() {
    this.scene.physics.add.overlap(
      this.playerAttackHitbox,
      this.bossCharacter.sprite,
      this.handlePlayerAttackHit,
      null,
      this
    );

    this.scene.physics.add.overlap(
      this.bossAttackHitbox,
      this.playerCharacter.sprite,
      this.handleBossAttackHit,
      null,
      this
    );
  }

  spawnArcherArrow(playerSprite, playerCenter, damage) {
    if (!this.scene.textures.exists('archer_arrowMove')) return;

    const direction = playerSprite.flipX ? -1 : 1;
    const startX = playerCenter.x + direction * 28;
    const startY = playerCenter.y - 8;

    const arrow = this.scene.physics.add.sprite(startX, startY, 'archer_arrowMove');
    arrow.setDepth(6);
    arrow.setScale(2);
    arrow.setFlipX(direction < 0);
    arrow.body.setAllowGravity(false);
    arrow.body.setSize(this.archerArrowHitbox.width, this.archerArrowHitbox.height);
    arrow.body.setOffset(this.archerArrowHitbox.offsetX, this.archerArrowHitbox.offsetY);
    arrow.body.setVelocityX(direction * this.archerArrowSpeed);
    if (this.scene.anims.exists('archer_arrow_move_anim')) {
      arrow.play('archer_arrow_move_anim');
    }

    arrow.setData('damage', damage);
    arrow.setData('startX', startX);
    arrow.setData('direction', direction);

    this.scene.physics.add.overlap(
      arrow,
      this.bossCharacter.sprite,
      () => this.handleArcherArrowHit(arrow),
      null,
      this
    );

    this.activeArcherArrows.push(arrow);
  }

  spawnWitchProjectile(playerSprite, playerCenter, damage) {
    if (!this.scene.textures.exists('witch_moving')) return;

    const direction = playerSprite.flipX ? -1 : 1;
    const startX = playerCenter.x + direction * 44;
    const startY = playerCenter.y - 12;

    const projectile = this.scene.physics.add.sprite(startX, startY, 'witch_moving');
    projectile.setDepth(6);
    projectile.setScale(1.3);
    projectile.setFlipX(direction < 0);
    projectile.body.setAllowGravity(false);
    projectile.body.setSize(this.witchProjectileHitbox.width, this.witchProjectileHitbox.height);
    projectile.body.setOffset(this.witchProjectileHitbox.offsetX, this.witchProjectileHitbox.offsetY);
    projectile.body.setVelocityX(direction * this.witchProjectileSpeed);
    projectile.setData('damage', damage);
    projectile.setData('startX', startX);
    projectile.setData('state', 'moving');

    if (this.scene.anims.exists('witch_projectile_move_anim')) {
      projectile.play('witch_projectile_move_anim');
    }

    this.scene.physics.add.overlap(
      projectile,
      this.bossCharacter.sprite,
      () => this.handleWitchProjectileHit(projectile),
      null,
      this
    );

    this.activeWitchProjectiles.push(projectile);
  }

  handleArcherArrowHit(arrow) {
    if (!arrow || !arrow.active || !this.bossCharacter || !this.bossCharacter.sprite) return;

    const damage = Number(arrow.getData('damage')) || 0;
    this.cleanupArcherArrow(arrow);

    this.bossHP -= damage;
    this.bossCharacter.takeDamage(damage);

    this.scene.tweens.add({
      targets: this.bossCharacter.sprite,
      alpha: 0.5,
      duration: 100,
      yoyo: true,
    });

    this.updateHPBars();

    if (this.bossHP <= 0) {
      this.triggerBossDefeatSequence();
    }
  }

  handleWitchProjectileHit(projectile) {
    if (!projectile || !projectile.active || !this.bossCharacter || !this.bossCharacter.sprite) return;
    if (projectile.getData('state') !== 'moving') return;

    const damage = Number(projectile.getData('damage')) || 0;
    projectile.setData('state', 'exploding');
    projectile.body.setVelocity(0, 0);
    projectile.body.setEnable(false);
    projectile.setFlipX(false);

    this.bossHP -= damage;
    this.bossCharacter.takeDamage(damage);
    this.scene.tweens.add({
      targets: this.bossCharacter.sprite,
      alpha: 0.5,
      duration: 100,
      yoyo: true,
    });
    this.updateHPBars();

    if (this.scene.anims.exists('witch_projectile_explode_anim')) {
      projectile.play('witch_projectile_explode_anim');
      const eventKey = Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + 'witch_projectile_explode_anim';
      const done = () => this.cleanupWitchProjectile(projectile);
      projectile.once(eventKey, done);
      this.scene.time.delayedCall(450, () => {
        if (projectile.active) {
          projectile.off(eventKey, done);
          done();
        }
      });
    } else {
      this.cleanupWitchProjectile(projectile);
    }

    if (this.bossHP <= 0) {
      this.triggerBossDefeatSequence();
    }
  }

  cleanupArcherArrow(arrow) {
    if (!arrow) return;
    this.activeArcherArrows = this.activeArcherArrows.filter((a) => a !== arrow);
    if (arrow.active) {
      arrow.destroy();
    }
  }

  cleanupWitchProjectile(projectile) {
    if (!projectile) return;
    this.activeWitchProjectiles = this.activeWitchProjectiles.filter((p) => p !== projectile);
    if (projectile.active) {
      projectile.destroy();
    }
  }

  // ✅ Helper function to draw debug boxes
  drawDebugBox(graphics, sprite, color) {
    if (!sprite || !sprite.body) return;

    const body = sprite.body;
    graphics.lineStyle(2, color, 1);
    graphics.strokeRect(
      body.x,
      body.y,
      body.width,
      body.height
    );
  }

  getBodyCenter(gameObject) {
    if (!gameObject || !gameObject.body) return null;
    const { center } = gameObject.body;
    return { x: center.x, y: center.y };
  }

  handlePlayerAttackHit() {
    if (!this.playerAttackActive || this.playerAttackHasHit) return;
    if (!this.bossCharacter || !this.bossCharacter.sprite) return;
    if (this.bossDefeated) return;

    const damage = this.pendingPlayerDamage;
    this.playerAttackHasHit = true;

    this.bossHP -= damage;
    this.bossCharacter.takeDamage(damage);

    this.scene.tweens.add({
      targets: this.bossCharacter.sprite,
      alpha: 0.5,
      duration: 100,
      yoyo: true,
    });

    this.updateHPBars();

    if (this.bossHP <= 0) {
      this.triggerBossDefeatSequence();
      this.playerAttackActive = false;
      this.playerAttackHitbox.body.setEnable(false);
    }
  }

  triggerBossDefeatSequence() {
    if (this.bossDefeated) return;
    this.bossDefeated = true;
    this.awaitingChestPickup = true;
    this.bossHP = 0;
    this.updateHPBars();

    this.playerAttackActive = false;
    if (this.playerAttackHitbox?.body) this.playerAttackHitbox.body.setEnable(false);
    this.bossAttackActive = false;
    if (this.bossAttackHitbox?.body) this.bossAttackHitbox.body.setEnable(false);

    const afterBossDeath = () => {
      if (!this.chestLayer || !this.playerCharacter?.sprite) {
        this.complete(true);
        return;
      }

      this.chestLayer.setVisible(true);
      this.chestLayer.setCollisionByExclusion([-1]);

      if (this.chestPromptText && this.chestPromptText.active) {
        this.chestPromptText.destroy();
      }
      this.chestPromptText = this.scene.add
        .text(640, 540, 'Chest unlocked! Go collide with it to finish.', {
          fontSize: '22px',
          color: '#fbbf24',
          fontFamily: 'monospace',
        })
        .setOrigin(0.5)
        .setDepth(30);

      this.chestCollider = this.scene.physics.add.collider(
        this.playerCharacter.sprite,
        this.chestLayer,
        () => this.handleChestCollected(),
        null,
        this
      );
    };

    if (this.bossCharacter && typeof this.bossCharacter.die === 'function') {
      this.bossCharacter.die(() => {
        this.scene.time.delayedCall(500, afterBossDeath);
      });
    } else {
      this.scene.time.delayedCall(500, afterBossDeath);
    }
  }

  handleChestCollected() {
    if (!this.awaitingChestPickup) return;
    this.awaitingChestPickup = false;

    if (this.chestCollider) {
      this.chestCollider.destroy();
      this.chestCollider = null;
    }
    if (this.chestPromptText && this.chestPromptText.active) {
      this.chestPromptText.destroy();
      this.chestPromptText = null;
    }

    this.complete(true);
  }

  handleBossAttackHit() {
    if (!this.bossAttackActive || this.bossAttackHasHit) return;
    if (!this.playerCharacter || !this.playerCharacter.sprite) return;

    const damage = this.pendingBossDamage;
    this.bossAttackHasHit = true;

    this.playerHP -= damage;
    if (this.playerHP < 0) this.playerHP = 0;
    this.playerCharacter.takeDamage(damage);

    this.scene.tweens.add({
      targets: this.playerCharacter.sprite,
      alpha: 0.5,
      duration: 100,
      yoyo: true,
    });

    this.updateHPBars();

    if (this.playerHP <= 0) {
      this.bossAttackActive = false;
      this.bossAttackHitbox.body.setEnable(false);
      if (this.playerCharacter && typeof this.playerCharacter.die === 'function') {
        this.playerCharacter.die(() => {
          this.scene.time.delayedCall(400, () => this.complete(false));
        });
      } else {
        this.scene.time.delayedCall(1200, () => this.complete(false));
      }
    }
  }

  activatePlayerHitbox(duration = 140) {
    this.playerAttackActive = true;
    this.playerAttackHasHit = false;
    this.playerAttackHitbox.body.updateFromGameObject();
    this.playerAttackHitbox.body.setEnable(true);

    this.scene.time.delayedCall(duration, () => {
      this.playerAttackActive = false;
      this.playerAttackHitbox.body.setEnable(false);
    });
  }

  activateBossHitbox(duration = 140) {
    this.bossAttackActive = true;
    this.bossAttackHasHit = false;
    this.bossAttackHitbox.body.updateFromGameObject();
    this.bossAttackHitbox.body.setEnable(true);

    this.scene.time.delayedCall(duration, () => {
      this.bossAttackActive = false;
      this.bossAttackHitbox.body.setEnable(false);
    });
  }

  update(time, delta) {
    if (this.playerCharacter) {
      this.playerCharacter.update();
    }

    if (this.bossCharacter) {
      this.bossCharacter.update();
    }

    this.updateHPBars();

    // Cleanup archer projectiles that traveled too far or out of world bounds
    if (this.activeArcherArrows.length > 0) {
      const worldWidth = this.scene.physics.world.bounds.width;
      this.activeArcherArrows = this.activeArcherArrows.filter((arrow) => {
        if (!arrow || !arrow.active) return false;

        const startX = Number(arrow.getData('startX')) || arrow.x;
        const traveled = Math.abs(arrow.x - startX);
        const offWorld = arrow.x < -50 || arrow.x > worldWidth + 50;
        if (traveled > this.archerArrowRange || offWorld) {
          arrow.destroy();
          return false;
        }
        return true;
      });
    }

    // Cleanup Witch projectiles that traveled too far or out of world bounds
    if (this.activeWitchProjectiles.length > 0) {
      const worldWidth = this.scene.physics.world.bounds.width;
      this.activeWitchProjectiles = this.activeWitchProjectiles.filter((projectile) => {
        if (!projectile || !projectile.active) return false;
        if (projectile.getData('state') === 'exploding') return true;

        const startX = Number(projectile.getData('startX')) || projectile.x;
        const traveled = Math.abs(projectile.x - startX);
        const offWorld = projectile.x < -50 || projectile.x > worldWidth + 50;
        if (traveled > this.witchProjectileRange || offWorld) {
          projectile.destroy();
          return false;
        }
        return true;
      });
    }

    // Update boss AI attack timer
    if (!this.bossDefeated) {
      this.bossAttackTimer += Number.isFinite(delta) ? delta : 0;
      if (this.bossAttackTimer >= this.bossAttackCooldown && !this.bossCharacter.isAttacking) {
        this.bossAttackTimer = 0;
        this.bossAttack();
      }
    }

    // ✅ Draw debug collision boxes
    if (this.showDebugHitboxes && this.debugGraphics) {
      this.debugGraphics.clear();

      // Draw player collision box (green)
      if (this.playerCharacter && this.playerCharacter.sprite) {
        this.drawDebugBox(this.debugGraphics, this.playerCharacter.sprite, 0x00ff00);
      }

      // Draw boss collision box (red)
      if (this.bossCharacter && this.bossCharacter.sprite) {
        this.drawDebugBox(this.debugGraphics, this.bossCharacter.sprite, 0xff0000);
      }

      // Draw attack hitboxes when active
      if (this.playerAttackHitbox.body.enable) {
        this.drawDebugBox(this.debugGraphics, this.playerAttackHitbox, 0x00ffff);
      }
      if (this.bossAttackHitbox.body.enable) {
        this.drawDebugBox(this.debugGraphics, this.bossAttackHitbox, 0xff00ff);
      }
      if (this.activeArcherArrows.length > 0) {
        this.activeArcherArrows.forEach((arrow) => {
          if (arrow && arrow.active && arrow.body) {
            this.drawDebugBox(this.debugGraphics, arrow, 0x22d3ee);
          }
        });
      }
      if (this.activeWitchProjectiles.length > 0) {
        this.activeWitchProjectiles.forEach((projectile) => {
          if (projectile && projectile.active && projectile.body && projectile.body.enable) {
            this.drawDebugBox(this.debugGraphics, projectile, 0xa855f7);
          }
        });
      }
    }

    if (!this.attackKey) return;

    if (Phaser.Input.Keyboard.JustDown(this.attackKey)) {
      this.playerAttack();
    }
  }

  playerAttack() {
    const now = Date.now();
    const attackRate = this.playerCharacter.getAttackRate();
    if (now - this.lastPlayerAttackTime < attackRate) return;

    const damage = this.playerCharacter.getDamage();

    const playerSprite = this.playerCharacter.sprite;
    const playerCenter = this.getBodyCenter(playerSprite);
    if (!playerCenter) return;

    this.isAttacking = true;
    this.lastPlayerAttackTime = now;

    const playerHitboxHalfWidth = this.playerAttackHitbox.width / 2;
    const playerBodyHalfWidth = playerSprite.body.width / 2;
    const playerDirection = playerSprite.flipX ? -1 : 1;
    const offsetX = playerDirection * (playerBodyHalfWidth + playerHitboxHalfWidth + 8);

    this.playerAttackHitbox.setPosition(playerCenter.x + offsetX, playerCenter.y);

    this.playerCharacter.attack(() => {
      if (this.character.class === 'Archer') {
        this.spawnArcherArrow(playerSprite, playerCenter, damage);
      } else if (this.character.class === 'Witch') {
        this.spawnWitchProjectile(playerSprite, playerCenter, damage);
      } else {
        this.pendingPlayerDamage = damage;
        this.activatePlayerHitbox(140);
      }
      this.isAttacking = false;

      const idleKey = this.character.class === 'Mage'
        ? 'mage_idle_anim'
        : this.character.class === 'Archer'
          ? 'archer_idle_anim'
          : this.character.class === 'Witch'
            ? 'witch_idle_anim'
          : 'warrior_idle_anim';
      if (this.playerCharacter.sprite && this.scene.anims.exists(idleKey)) {
        this.playerCharacter.sprite.play(idleKey, true);
      }
    });
  }
  bossAttack() {
    if (!this.bossCharacter || this.bossCharacter.isAttacking) return;

    const bossSprite = this.bossCharacter.sprite;
    const bossCenter = this.getBodyCenter(bossSprite);
    if (!bossCenter) return;

    const bossHitboxHalfWidth = this.bossAttackHitbox.width / 2;
    const bossBodyHalfWidth = bossSprite.body.width / 2;
    const bossDirection = bossSprite.flipX ? -1 : 1;
    const offsetX = bossDirection * (bossBodyHalfWidth + bossHitboxHalfWidth + 8);

    this.bossAttackHitbox.setPosition(bossCenter.x + offsetX, bossCenter.y);

    this.bossCharacter.attack((damage) => {
      this.pendingBossDamage = damage;
      this.activateBossHitbox(140);

      if (this.bossCharacter.sprite && this.scene.anims.exists('boss_idle_anim')) {
        this.bossCharacter.sprite.play('boss_idle_anim', true);
      }
    });
  }
  updateHPBars() {
    // Player bar (follows player)
    this.hpBarPlayer.clear();
    if (this.playerCharacter?.sprite?.body) {
      const body = this.playerCharacter.sprite.body;
      const barWidth = 92;
      const barHeight = 10;
      const barX = body.center.x - barWidth / 2;
      const barY = body.y - 18;

      const playerFrac = this.maxPlayerHP ? this.playerHP / this.maxPlayerHP : 0;
      const pct = playerFrac * 100;
      const playerBarColor = pct > 50 ? 0x10b981 : pct > 25 ? 0xf59e0b : 0xef4444;

      this.hpBarPlayer.fillStyle(0x111827, 0.95);
      this.hpBarPlayer.fillRect(barX, barY, barWidth, barHeight);
      this.hpBarPlayer.fillStyle(playerBarColor, 1);
      this.hpBarPlayer.fillRect(barX + 1, barY + 1, Math.max(0, Math.min(1, playerFrac)) * (barWidth - 2), barHeight - 2);

      if (this.playerHpLabel) {
        this.playerHpLabel.setPosition(body.center.x, barY - 10);
      }
    }

    // Boss bar (top HUD, red)
    const bossFrac = this.bossMaxHP ? this.bossHP / this.bossMaxHP : 0;
    if (this.hpBarBoss) {
      const clamped = Math.max(0, Math.min(1, bossFrac));
      this.hpBarBoss.clear();
      this.hpBarBoss.fillStyle(0x111827, 0.95);
      this.hpBarBoss.fillRect(this.bossHpBarX, this.bossHpBarY - this.bossHpBarDisplayHeight / 2, this.bossHpBarDisplayWidth, this.bossHpBarDisplayHeight);
      this.hpBarBoss.fillStyle(0xef4444, 1);
      this.hpBarBoss.fillRect(
        this.bossHpBarX + 1,
        this.bossHpBarY - this.bossHpBarDisplayHeight / 2 + 1,
        (this.bossHpBarDisplayWidth - 2) * clamped,
        this.bossHpBarDisplayHeight - 2
      );
    }

    if (this.bossHpLabel) {
      this.bossHpLabel.setText(`Boss HP: ${Math.max(0, this.bossHP)}/${this.bossMaxHP}`);
    }
    if (this.playerHpLabel) {
      this.playerHpLabel.setText(`HP ${Math.max(0, this.playerHP)}/${this.maxPlayerHP}`);
    }
  }

  complete(victory) {
    if (this.onComplete) {
      this.onComplete({
        victory,
        playerHP: this.playerHP,
        maxPlayerHP: this.maxPlayerHP,
      });
    }
  }

  getPlayerHP() {
    return this.playerHP;
  }

  destroy() {
    if (this.playerCharacter) {
      this.playerCharacter.destroy();
    }
    if (this.bossCharacter) {
      this.bossCharacter.destroy();
    }
    if (this.debugGraphics) {
      this.debugGraphics.destroy();
    }
    if (this.hpBarPlayer) {
      this.hpBarPlayer.destroy();
    }
    if (this.playerHpLabel) {
      this.playerHpLabel.destroy();
    }
    if (this.bossHpLabel) {
      this.bossHpLabel.destroy();
    }
    if (this.hpBarBoss) {
      this.hpBarBoss.destroy();
    }
    if (this.bossHpBarIcon) {
      this.bossHpBarIcon.destroy();
    }
    if (this.playerAttackHitbox) {
      this.playerAttackHitbox.destroy();
    }
    if (this.bossAttackHitbox) {
      this.bossAttackHitbox.destroy();
    }
    if (this.chestCollider) {
      this.chestCollider.destroy();
    }
    if (this.chestPromptText) {
      this.chestPromptText.destroy();
    }
    if (this.activeArcherArrows.length > 0) {
      this.activeArcherArrows.forEach((arrow) => {
        if (arrow && arrow.active) {
          arrow.destroy();
        }
      });
      this.activeArcherArrows = [];
    }
    if (this.activeWitchProjectiles.length > 0) {
      this.activeWitchProjectiles.forEach((projectile) => {
        if (projectile && projectile.active) {
          projectile.destroy();
        }
      });
      this.activeWitchProjectiles = [];
    }
  }
}


