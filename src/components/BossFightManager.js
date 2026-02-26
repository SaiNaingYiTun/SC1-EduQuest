import Phaser from 'phaser';
import { Warrior } from './characters/Warrior';
import { Mage } from './characters/Mage';
import { Archer } from './characters/Archer';
import { Witch } from './characters/Witch';
import { Boss } from './characters/Boss';
import { FireBoss } from './characters/FireBoss';
import { ForrestBoss } from './characters/ForrestBoss';

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
    this.bossVariant = config.bossVariant || {};
    this.bossType = this.bossVariant.bossType || config.bossType || 'demon';
    this.mapKey = this.bossVariant.mapKey || config.mapKey || 'bmap1';
    this.bossFightTitle = this.bossVariant.title || config.bossFightTitle || 'FINAL BOSS FIGHT!';
    this.playerAttackMultiplier = Number.isFinite(config.playerAttackMultiplier) ? config.playerAttackMultiplier : 1;
    this.playerBaseAttackScale = Number.isFinite(config.playerBaseAttackScale) ? config.playerBaseAttackScale : 1;
    this.playerDamageReduction = Number.isFinite(config.playerDamageReduction) ? config.playerDamageReduction : 0;
    this.playerSpeedMultiplier = Number.isFinite(config.playerSpeedMultiplier) ? config.playerSpeedMultiplier : 1;

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
    this.bossBgm = null;
    this.bossBgmKey = 'boss_fight_bgm';
    
    // Hit detection
    this.playerAttackHitbox = null;
    this.bossAttackHitbox = null;
    this.forrestThornHitbox = null;
    this.lastPlayerAttackTime = 0;
    this.lastBossAttackTime = 0;
    this.bossAttackTimer = 0;
    this.bossAttackCooldown = 3600; // Slower cadence so attacks feel heavier
    this.bossChaseSpeed = 125;
    this.bossDashSpeed = 240;
    this.bossJumpVelocity = -420;
    this.bossJumpHeightThreshold = 220;
    this.bossMeleeRange = 150;
    this.bossAwakenTriggerDistance = config.bossAwakenTriggerDistance || 420;
    this.bossDashRange = 320;
    this.bossApproachRange = 560;
    this.bossStopRange = 95;
    this.lockBossToSpawn = false;
    this.bossActionLocked = false;
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
    this.activeFireProjectiles = [];
    this.fireProjectileSpeed = 260;
    this.fireProjectileLifetimeMs = 2600;
    this.fireProjectileHitbox = { width: 20, height: 20 };
    this.fireProjectileScale = 1.8;
    this.fireSingleShotRange = 220;
    this.activeForrestProjectiles = [];
    this.forrestProjectileSpeed = 300;
    this.forrestProjectileLifetimeMs = 2800;
    this.forrestProjectileHitbox = { width: 38, height: 22 };
    this.forrestProjectileScale = 1.2;
    this.forrestRangeAttackIntervalMs = 5000;
    this.forrestRangeAttackTimer = 0;
    this.forrestFarDistanceThreshold = 620;
    this.forrestFarDurationMs = 8000;
    this.forrestFarTimer = 0;
    this.forrestTeleportOffsetX = 140;
    this.forrestTeleportOffsetY = -40;
    this.forrestTeleportOffsetYByClass = {
      Warrior: 0,
      Mage: 0,
      Archer: 0,
      Witch: 0,
    };
    this.forrestThornDamage = 18;
    this.forrestThornRange = 185;
    this.forrestSpellRange = 180;
    this.forrestThornHitboxSize = { width: 170, height: 100 };
    this.forrestThornHitboxOffset = { x: 85, y: 4 };
    this.forrestThornAttackActive = false;
    this.forrestThornAttackHasHit = false;

    // Boss fight spawn points (edit these to move spawn locations).
    this.spawnPoints = this.bossVariant.spawnPoints || config.spawnPoints || {
      player: { x: 50, y: 410 },
      boss: { x: 1100, y: 530 },
    };
    this.applyBossAIConfig(this.bossVariant.ai || config.ai || {});
  }

  applyBossAIConfig(aiConfig) {
    if (!aiConfig || typeof aiConfig !== 'object') return;
    if (Number.isFinite(aiConfig.bossAttackCooldown)) this.bossAttackCooldown = aiConfig.bossAttackCooldown;
    if (Number.isFinite(aiConfig.bossChaseSpeed)) this.bossChaseSpeed = aiConfig.bossChaseSpeed;
    if (Number.isFinite(aiConfig.bossDashSpeed)) this.bossDashSpeed = aiConfig.bossDashSpeed;
    if (Number.isFinite(aiConfig.bossJumpVelocity)) this.bossJumpVelocity = aiConfig.bossJumpVelocity;
    if (Number.isFinite(aiConfig.bossJumpHeightThreshold)) this.bossJumpHeightThreshold = aiConfig.bossJumpHeightThreshold;
    if (Number.isFinite(aiConfig.bossMeleeRange)) this.bossMeleeRange = aiConfig.bossMeleeRange;
    if (Number.isFinite(aiConfig.bossAwakenTriggerDistance)) this.bossAwakenTriggerDistance = aiConfig.bossAwakenTriggerDistance;
    if (Number.isFinite(aiConfig.bossDashRange)) this.bossDashRange = aiConfig.bossDashRange;
    if (Number.isFinite(aiConfig.bossApproachRange)) this.bossApproachRange = aiConfig.bossApproachRange;
    if (Number.isFinite(aiConfig.bossStopRange)) this.bossStopRange = aiConfig.bossStopRange;
    if (Number.isFinite(aiConfig.forrestRangeAttackIntervalMs)) this.forrestRangeAttackIntervalMs = aiConfig.forrestRangeAttackIntervalMs;
    if (Number.isFinite(aiConfig.forrestFarDistanceThreshold)) this.forrestFarDistanceThreshold = aiConfig.forrestFarDistanceThreshold;
    if (Number.isFinite(aiConfig.forrestFarDurationMs)) this.forrestFarDurationMs = aiConfig.forrestFarDurationMs;
    if (Number.isFinite(aiConfig.forrestTeleportOffsetX)) this.forrestTeleportOffsetX = aiConfig.forrestTeleportOffsetX;
    if (Number.isFinite(aiConfig.forrestTeleportOffsetY)) this.forrestTeleportOffsetY = aiConfig.forrestTeleportOffsetY;
    if (aiConfig.forrestTeleportOffsetYByClass && typeof aiConfig.forrestTeleportOffsetYByClass === 'object') {
      this.forrestTeleportOffsetYByClass = {
        ...this.forrestTeleportOffsetYByClass,
        ...aiConfig.forrestTeleportOffsetYByClass,
      };
    }
    if (Number.isFinite(aiConfig.forrestThornDamage)) this.forrestThornDamage = aiConfig.forrestThornDamage;
    if (Number.isFinite(aiConfig.forrestThornRange)) this.forrestThornRange = aiConfig.forrestThornRange;
    if (Number.isFinite(aiConfig.forrestSpellRange)) this.forrestSpellRange = aiConfig.forrestSpellRange;
    if (Number.isFinite(aiConfig.forrestThornHitboxWidth)) this.forrestThornHitboxSize.width = aiConfig.forrestThornHitboxWidth;
    if (Number.isFinite(aiConfig.forrestThornHitboxHeight)) this.forrestThornHitboxSize.height = aiConfig.forrestThornHitboxHeight;
    if (Number.isFinite(aiConfig.forrestThornHitboxOffsetX)) this.forrestThornHitboxOffset.x = aiConfig.forrestThornHitboxOffsetX;
    if (Number.isFinite(aiConfig.forrestThornHitboxOffsetY)) this.forrestThornHitboxOffset.y = aiConfig.forrestThornHitboxOffsetY;
    if (typeof aiConfig.lockToSpawn === 'boolean') this.lockBossToSpawn = aiConfig.lockToSpawn;
  }

  startBossBgm() {
    if (!this.scene?.sound || !this.scene?.cache?.audio?.exists(this.bossBgmKey)) return;
    if (!this.bossBgm || this.bossBgm.isDestroyed) {
      this.bossBgm = this.scene.sound.add(this.bossBgmKey, {
        loop: true,
        volume: 0.35,
      });
    }
    if (!this.bossBgm.isPlaying) {
      this.bossBgm.play();
    }
  }

  stopBossBgm() {
    if (!this.bossBgm || this.bossBgm.isDestroyed) return;
    if (this.bossBgm.isPlaying) {
      this.bossBgm.stop();
    }
    this.bossBgm.destroy();
    this.bossBgm = null;
  }

  playSfx(key, config = {}) {
    if (!key || !this.scene?.sound) return;
    if (!this.scene.cache?.audio?.exists(key)) return;
    this.scene.sound.play(key, config);
  }

  isPlayerInBossAttackRange() {
    const playerSprite = this.playerCharacter?.sprite;
    const bossSprite = this.bossCharacter?.sprite;
    if (!playerSprite || !bossSprite) return false;

    const distanceX = Math.abs(playerSprite.x - bossSprite.x);
    const distanceY = Math.abs(playerSprite.y - bossSprite.y);
    return distanceX <= this.bossMeleeRange && distanceY <= 140;
  }

  canBossStartAttack() {
    const playerSprite = this.playerCharacter?.sprite;
    const bossSprite = this.bossCharacter?.sprite;
    if (!playerSprite || !bossSprite) return false;

    if (this.bossType === 'fire') {
      const distanceX = Math.abs(playerSprite.x - bossSprite.x);
      const distanceY = Math.abs(playerSprite.y - bossSprite.y);
      return distanceX <= this.bossApproachRange && distanceY <= 220;
    }
    if (this.bossType === 'forest') {
      const distanceX = Math.abs(playerSprite.x - bossSprite.x);
      const distanceY = Math.abs(playerSprite.y - bossSprite.y);
      return distanceX <= this.bossApproachRange && distanceY <= 260;
    }

    return this.isPlayerInBossAttackRange();
  }

  shouldFireBossUseSingleShot() {
    if (this.bossType !== 'fire') return false;
    const playerSprite = this.playerCharacter?.sprite;
    const bossSprite = this.bossCharacter?.sprite;
    if (!playerSprite || !bossSprite) return false;

    const distanceX = Math.abs(playerSprite.x - bossSprite.x);
    const distanceY = Math.abs(playerSprite.y - bossSprite.y);
    return distanceX <= this.fireSingleShotRange && distanceY <= 220;
  }

  start() {
    this.scene.children.removeAll(true);
    this.startBossBgm();

    // ✅ Create debug graphics
    if (this.showDebugHitboxes) {
      this.debugGraphics = this.scene.add.graphics();
      this.debugGraphics.setDepth(1000);
    }

    // Tilemap setup
    const map = this.scene.make.tilemap({ key: this.mapKey });
    const bwtiles1 = map.addTilesetImage('bwtiles1', 'bwtiles1');
    const door = map.addTilesetImage('door', 'door');
    const bg2Tileset = map.addTilesetImage('bg2', 'bg2');
    const tree = map.addTilesetImage('tree', 'tree');
    const extra = map.addTilesetImage('extra', 'extra');
    const extra2 = map.addTilesetImage('extra2', 'extra2');
    const tilesets = [bwtiles1, door, bg2Tileset, tree, extra, extra2].filter(Boolean);

    this.addImageLayersFromMapData();

    const bg1Layer = map.createLayer('bg1', tilesets, 0, 0);
    const bg2Layer = map.createLayer('bg2', tilesets, 0, 0);
    const bgLayer = map.createLayer('bg', tilesets, 0, 0);
    this.chestLayer = map.createLayer('chest', tilesets, 0, 0);
    const ground2Layer = map.createLayer('ground2', tilesets, 0, 0);
    const groundLayer = map.createLayer('ground', tilesets, 0, 0);

    if (bg1Layer) bg1Layer.setDepth(-7);
    if (bg2Layer) bg2Layer.setDepth(-6);
    if (bgLayer) bgLayer.setDepth(-6);
    if (this.chestLayer) {
      this.chestLayer.setDepth(-5);
      this.chestLayer.setVisible(false);
    }
    if (ground2Layer) {
      ground2Layer.setDepth(-4);
      ground2Layer.setCollisionByProperty({ collides: true });
      ground2Layer.setCollisionByExclusion([-1]);
    }
    if (groundLayer) {
      groundLayer.setDepth(-3);
      groundLayer.setCollisionByProperty({ collides: true });
      groundLayer.setCollisionByExclusion([-1]);
    }

    this.scene.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    // Spawn positions
    const playerSpawnX = this.spawnPoints.player.x;
    const playerSpawnY = this.spawnPoints.player.y;
    const bossSpawnX = this.spawnPoints.boss.x;
    const bossSpawnY = this.spawnPoints.boss.y;

    // Background
    const bg = this.scene.add.rectangle(640, 320, 1280, 640, 0x1a0d2e);
    bg.setDepth(-10);

    this.scene.add
      .text(640, 612, this.bossFightTitle, {
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
    this.bossCharacter = this.createBossCharacter(bossSpawnX, bossSpawnY);
    this.bossCharacter.create(bossSpawnX, bossSpawnY);
    this.bossCharacter.setupPhysics(groundLayer);

    // Create player based on class
    this.createPlayer(playerSpawnX, playerSpawnY, groundLayer);
    if (ground2Layer && this.playerCharacter?.sprite) {
      this.scene.physics.add.collider(this.playerCharacter.sprite, ground2Layer);
    }

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

  addImageLayersFromMapData() {
    const mapCacheEntry = this.scene.cache.tilemap.get(this.mapKey);
    const mapData = mapCacheEntry?.data;
    if (!mapData?.layers || !Array.isArray(mapData.layers)) return;

    mapData.layers
      .filter((layer) => layer.type === 'imagelayer' && layer.visible !== false && layer.image)
      .forEach((layer, index) => {
        const imagePath = String(layer.image);
        const imageFile = imagePath.split('/').pop() || '';
        const textureKey = imageFile.replace(/\.[^.]+$/, '');
        if (!textureKey || !this.scene.textures.exists(textureKey)) return;

        const image = this.scene.add.image(layer.x || 0, layer.y || 0, textureKey);
        image.setOrigin(0, 0);
        image.setDepth(-8 + index);
        if (Number.isFinite(layer.opacity)) {
          image.setAlpha(layer.opacity);
        }
      });
  }

  createBossCharacter(spawnX, spawnY) {
    if (this.bossType === 'fire') {
      return new FireBoss(this.scene, spawnX, spawnY);
    }
    if (this.bossType === 'forest') {
      return new ForrestBoss(this.scene, spawnX, spawnY);
    }
    return new Boss(this.scene, spawnX, spawnY);
  }

  getBossIdleAnimationKey() {
    if (this.bossType === 'fire') return 'fire_boss_idle_anim';
    if (this.bossType === 'forest') return 'forrest_boss_idle_anim';
    return 'boss_idle_anim';
  }

  setBossFacingDirection(dir) {
    if (!this.bossCharacter?.sprite) return;
    if (this.bossType === 'fire') {
      // Fire boss source art faces opposite to demon boss.
      this.bossCharacter.sprite.setFlipX(dir < 0);
      return;
    }
    if (this.bossType === 'forest') {
      this.bossCharacter.sprite.setFlipX(dir < 0);
      return;
    }
    this.bossCharacter.sprite.setFlipX(dir > 0);
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
    if (typeof this.playerCharacter.setMovementSpeedMultiplier === 'function') {
      this.playerCharacter.setMovementSpeedMultiplier(this.playerSpeedMultiplier);
    }
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
    this.bossAttackHitbox = this.scene.add.rectangle(0, -20, 300, 300);
    this.bossAttackHitbox.setAlpha(0);
    this.scene.physics.add.existing(this.bossAttackHitbox);
    this.bossAttackHitbox.body.setAllowGravity(false);
    this.bossAttackHitbox.body.setEnable(false);

    // Forrest thorn strike hitbox (debug-drawn when active).
    this.forrestThornHitbox = this.scene.add.rectangle(
      0,
      0,
      this.forrestThornHitboxSize.width,
      this.forrestThornHitboxSize.height
    );
    this.forrestThornHitbox.setAlpha(0);
    this.scene.physics.add.existing(this.forrestThornHitbox);
    this.forrestThornHitbox.body.setAllowGravity(false);
    this.forrestThornHitbox.body.setEnable(false);
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

    this.scene.physics.add.overlap(
      this.forrestThornHitbox,
      this.playerCharacter.sprite,
      this.handleForrestThornHit,
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

  spawnFireProjectileTowardPlayer(damage, angleOffset = 0) {
    const bossSprite = this.bossCharacter?.sprite;
    const playerSprite = this.playerCharacter?.sprite;
    if (!bossSprite || !playerSprite || !this.scene.textures.exists('fire_boss_projectile_move')) return;

    const bossCenter = this.getBodyCenter(bossSprite);
    const playerCenter = this.getBodyCenter(playerSprite);
    if (!bossCenter || !playerCenter) return;

    const direction = playerCenter.x >= bossCenter.x ? 1 : -1;
    const startX = bossCenter.x + direction * 42;
    const startY = bossCenter.y - 18;

    const projectile = this.scene.physics.add.sprite(startX, startY, 'fire_boss_projectile_move');
    projectile.setDepth(8);
    projectile.setScale(this.fireProjectileScale);
    projectile.body.setAllowGravity(false);
    projectile.body.setSize(this.fireProjectileHitbox.width, this.fireProjectileHitbox.height, true);
    projectile.setData('damage', damage);
    projectile.setData('state', 'moving');
    projectile.setData('spawnTime', this.scene.time.now);

    if (this.scene.anims.exists('fire_boss_projectile_move_anim')) {
      projectile.play('fire_boss_projectile_move_anim');
    }

    const angle = Phaser.Math.Angle.Between(startX, startY, playerCenter.x, playerCenter.y) + angleOffset;
    const velocityX = Math.cos(angle) * this.fireProjectileSpeed;
    const velocityY = Math.sin(angle) * this.fireProjectileSpeed;
    projectile.body.setVelocity(velocityX, velocityY);
    projectile.setRotation(angle);
    projectile.setFlipY(direction < 0);

    this.scene.physics.add.overlap(
      projectile,
      playerSprite,
      () => this.handleFireProjectileHit(projectile),
      null,
      this
    );

    this.activeFireProjectiles.push(projectile);
  }

  spawnFireProjectileVolley(damage) {
    // Three-way spread: center + slight left/right angles.
    const spread = 0.17;
    this.spawnFireProjectileTowardPlayer(damage, -spread);
    this.spawnFireProjectileTowardPlayer(damage, 0);
    this.spawnFireProjectileTowardPlayer(damage, spread);
  }

  spawnForrestProjectileTowardPlayer(damage) {
    const bossSprite = this.bossCharacter?.sprite;
    const playerSprite = this.playerCharacter?.sprite;
    if (!bossSprite || !playerSprite || !this.scene.textures.exists('forrest_boss_projectile_move')) return;

    const bossCenter = this.getBodyCenter(bossSprite);
    const playerCenter = this.getBodyCenter(playerSprite);
    if (!bossCenter || !playerCenter) return;

    const direction = playerCenter.x >= bossCenter.x ? 1 : -1;
    const startX = bossCenter.x + direction * 36;
    const startY = bossCenter.y - 36;

    const projectile = this.scene.physics.add.sprite(startX, startY, 'forrest_boss_projectile_move');
    projectile.setDepth(8);
    projectile.setScale(this.forrestProjectileScale);
    projectile.body.setAllowGravity(false);
    projectile.body.setSize(this.forrestProjectileHitbox.width, this.forrestProjectileHitbox.height, true);
    projectile.setData('damage', damage);
    projectile.setData('state', 'moving');
    projectile.setData('spawnTime', this.scene.time.now);

    if (this.scene.anims.exists('forrest_boss_projectile_move_anim')) {
      projectile.play('forrest_boss_projectile_move_anim');
    }

    const angle = Phaser.Math.Angle.Between(startX, startY, playerCenter.x, playerCenter.y);
    const velocityX = Math.cos(angle) * this.forrestProjectileSpeed;
    const velocityY = Math.sin(angle) * this.forrestProjectileSpeed;
    projectile.body.setVelocity(velocityX, velocityY);
    projectile.setRotation(angle);
    projectile.setFlipY(direction < 0);

    this.scene.physics.add.overlap(
      projectile,
      playerSprite,
      () => this.handleForrestProjectileHit(projectile),
      null,
      this
    );

    this.activeForrestProjectiles.push(projectile);
  }

  handleForrestProjectileHit(projectile) {
    if (!projectile || !projectile.active) return;
    if (projectile.getData('state') !== 'moving') return;

    const damage = Number(projectile.getData('damage')) || 0;
    this.applyDamageToPlayer(damage);
    this.explodeForrestProjectile(projectile);
  }

  explodeForrestProjectile(projectile) {
    if (!projectile || !projectile.active) return;
    projectile.setData('state', 'exploding');
    projectile.body.setVelocity(0, 0);
    projectile.body.setEnable(false);
    projectile.setRotation(0);
    projectile.setFlipY(false);

    if (this.scene.anims.exists('forrest_boss_projectile_explode_anim')) {
      projectile.play('forrest_boss_projectile_explode_anim');
      const eventKey = Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + 'forrest_boss_projectile_explode_anim';
      const done = () => this.cleanupForrestProjectile(projectile);
      projectile.once(eventKey, done);
      this.scene.time.delayedCall(420, () => {
        if (projectile.active) {
          projectile.off(eventKey, done);
          done();
        }
      });
    } else {
      this.cleanupForrestProjectile(projectile);
    }
  }

  cleanupForrestProjectile(projectile) {
    if (!projectile) return;
    this.activeForrestProjectiles = this.activeForrestProjectiles.filter((p) => p !== projectile);
    if (projectile.active) {
      projectile.destroy();
    }
  }

  spawnForrestExplosionOnPlayer(damage) {
    const playerSprite = this.playerCharacter?.sprite;
    if (!playerSprite) return;

    const center = this.getBodyCenter(playerSprite);
    if (!center) return;
    this.playSfx('forrest_spell', { volume: 0.45 });

    const explosion = this.scene.physics.add.sprite(center.x, center.y - 8, 'forrest_boss_projectile_explode');
    explosion.setDepth(9);
    explosion.setScale(1.35);
    explosion.body.setAllowGravity(false);
    explosion.body.setEnable(false);
    if (this.scene?.sound && this.scene.cache?.audio?.exists('forrest_spell_sfx')) {
      this.scene.sound.play('forrest_spell_sfx', { volume: 0.45 });
    }

    if (this.scene.anims.exists('forrest_boss_projectile_explode_anim')) {
      explosion.play('forrest_boss_projectile_explode_anim');
      const eventKey = Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + 'forrest_boss_projectile_explode_anim';
      explosion.once(eventKey, () => {
        if (explosion.active) explosion.destroy();
      });
      this.scene.time.delayedCall(420, () => {
        if (explosion.active) explosion.destroy();
      });
    } else {
      this.scene.time.delayedCall(300, () => {
        if (explosion.active) explosion.destroy();
      });
    }

    this.applyDamageToPlayer(damage);
  }

  activateForrestThornHitbox() {
    const bossSprite = this.bossCharacter?.sprite;
    if (!bossSprite || !bossSprite.body || !this.forrestThornHitbox?.body) return;

    const dir = bossSprite.flipX ? -1 : 1;
    const center = this.getBodyCenter(bossSprite);
    if (!center) return;

    const offsetX = this.forrestThornHitboxOffset.x * dir;
    const hitboxX = center.x + offsetX;
    const hitboxY = center.y + this.forrestThornHitboxOffset.y;

    this.forrestThornHitbox.setPosition(hitboxX, hitboxY);
    this.forrestThornHitbox.body.setSize(
      this.forrestThornHitboxSize.width,
      this.forrestThornHitboxSize.height,
      true
    );
    this.forrestThornAttackActive = true;
    this.forrestThornAttackHasHit = false;
    this.forrestThornHitbox.body.updateFromGameObject();
    this.forrestThornHitbox.body.setEnable(true);

    this.scene.time.delayedCall(220, () => {
      this.forrestThornAttackActive = false;
      if (this.forrestThornHitbox?.body) {
        this.forrestThornHitbox.body.setEnable(false);
      }
    });
  }

  handleForrestThornHit() {
    if (!this.forrestThornAttackActive || this.forrestThornAttackHasHit) return;
    this.forrestThornAttackHasHit = true;
    this.applyDamageToPlayer(this.forrestThornDamage);
  }

  resolveForrestThornStrike() {
    // Thorn strike uses a configurable hitbox in front of the boss.
    this.activateForrestThornHitbox();
  }

  triggerForrestRangeSpellAttack() {
    if (this.bossType !== 'forest') return;
    if (!this.bossCharacter || !this.playerCharacter) return;
    if (this.bossActionLocked || this.bossCharacter.isAttacking || this.bossCharacter.isTakingHit) return;

    const bossSprite = this.bossCharacter.sprite;
    const playerSprite = this.playerCharacter.sprite;
    if (!bossSprite || !playerSprite) return;
    const distanceToPlayer = Phaser.Math.Distance.Between(
      playerSprite.x,
      playerSprite.y,
      bossSprite.x,
      bossSprite.y
    );
    if (distanceToPlayer > this.forrestSpellRange) return;

    const dir = playerSprite.x >= bossSprite.x ? 1 : -1;
    this.setBossFacingDirection(dir);
    bossSprite.body.setVelocityX(0);

    this.bossActionLocked = true;
    this.bossCharacter.attack((damage) => {
      this.spawnForrestExplosionOnPlayer(damage);
      this.bossActionLocked = false;
    }, 'forrest_boss_spell_anim');

    this.scene.time.delayedCall(1800, () => {
      if (this.bossActionLocked && this.bossCharacter && !this.bossCharacter.isAttacking) {
        this.bossActionLocked = false;
      }
    });
  }

  triggerForrestTeleportThornAttack() {
    if (this.bossType !== 'forest') return;
    if (!this.bossCharacter || !this.playerCharacter) return;
    if (this.bossActionLocked || this.bossCharacter.isAttacking || this.bossCharacter.isTakingHit) return;

    const bossSprite = this.bossCharacter.sprite;
    const playerSprite = this.playerCharacter.sprite;
    if (!bossSprite || !playerSprite || !bossSprite.body) return;

    const dir = playerSprite.x >= bossSprite.x ? 1 : -1;
    const worldWidth = this.scene.physics.world.bounds.width || 1280;
    const worldHeight = this.scene.physics.world.bounds.height || 640;
    const teleportX = Phaser.Math.Clamp(
      playerSprite.x - dir * this.forrestTeleportOffsetX,
      48,
      worldWidth - 48
    );
    const teleportY = Phaser.Math.Clamp(
      playerSprite.y + this.getForrestTeleportYOffsetForClass(),
      48,
      worldHeight - 16
    );

    this.bossActionLocked = true;
    const afterTeleport = () => {
      this.setBossFacingDirection(dir);
      this.bossCharacter.attack(() => {
        this.resolveForrestThornStrike();
        this.bossActionLocked = false;
      }, 'forrest_boss_thorn_anim');
    };

    if (typeof this.bossCharacter.teleportNear === 'function') {
      this.bossCharacter.teleportNear(teleportX, teleportY, afterTeleport);
    } else {
      bossSprite.body.setVelocity(0, 0);
      bossSprite.setPosition(teleportX, teleportY);
      afterTeleport();
    }

    this.scene.time.delayedCall(1800, () => {
      if (this.bossActionLocked && this.bossCharacter && !this.bossCharacter.isAttacking) {
        this.bossActionLocked = false;
      }
    });
  }

  getForrestTeleportYOffsetForClass() {
    const className = this.character?.class;
    const classOffset = Number(this.forrestTeleportOffsetYByClass?.[className]);
    return this.forrestTeleportOffsetY + (Number.isFinite(classOffset) ? classOffset : 0);
  }

  updateForrestAttackPattern(delta) {
    if (this.bossType !== 'forest') return;
    if (this.bossDefeated || !this.bossCharacter || !this.playerCharacter) return;
    if (typeof this.bossCharacter.canFight === 'function' && !this.bossCharacter.canFight()) return;

    const bossSprite = this.bossCharacter.sprite;
    const playerSprite = this.playerCharacter.sprite;
    if (!bossSprite || !playerSprite) return;

    const safeDelta = Number.isFinite(delta) ? delta : 0;
    const distanceToPlayer = Phaser.Math.Distance.Between(
      playerSprite.x,
      playerSprite.y,
      bossSprite.x,
      bossSprite.y
    );
    const canAct = !this.bossActionLocked && !this.bossCharacter.isAttacking && !this.bossCharacter.isTakingHit;

    if (distanceToPlayer >= this.forrestFarDistanceThreshold) {
      this.forrestFarTimer += safeDelta;
    } else {
      this.forrestFarTimer = 0;
    }

    if (canAct && this.forrestFarTimer >= this.forrestFarDurationMs) {
      this.forrestFarTimer = 0;
      this.forrestRangeAttackTimer = 0;
      this.triggerForrestTeleportThornAttack();
      return;
    }

    this.forrestRangeAttackTimer += safeDelta;
    if (canAct && this.forrestRangeAttackTimer >= this.forrestRangeAttackIntervalMs) {
      const isSpellInRange = distanceToPlayer <= this.forrestSpellRange;
      if (isSpellInRange) {
        this.forrestRangeAttackTimer = 0;
        this.triggerForrestRangeSpellAttack();
      }
    }
  }

  handleFireProjectileHit(projectile) {
    if (!projectile || !projectile.active) return;
    if (projectile.getData('state') !== 'moving') return;

    const damage = Number(projectile.getData('damage')) || 0;
    this.applyDamageToPlayer(damage);
    this.explodeFireProjectile(projectile);
  }

  explodeFireProjectile(projectile) {
    if (!projectile || !projectile.active) return;
    projectile.setData('state', 'exploding');
    projectile.body.setVelocity(0, 0);
    projectile.body.setEnable(false);
    projectile.setRotation(0);
    projectile.setFlipY(false);

    if (this.scene.anims.exists('fire_boss_projectile_explode_anim')) {
      projectile.play('fire_boss_projectile_explode_anim');
      const eventKey = Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + 'fire_boss_projectile_explode_anim';
      const done = () => this.cleanupFireProjectile(projectile);
      projectile.once(eventKey, done);
      this.scene.time.delayedCall(420, () => {
        if (projectile.active) {
          projectile.off(eventKey, done);
          done();
        }
      });
    } else {
      this.cleanupFireProjectile(projectile);
    }
  }

  cleanupFireProjectile(projectile) {
    if (!projectile) return;
    this.activeFireProjectiles = this.activeFireProjectiles.filter((p) => p !== projectile);
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
    if (this.activeFireProjectiles.length > 0) {
      this.activeFireProjectiles.forEach((projectile) => {
        if (projectile?.active) projectile.destroy();
      });
      this.activeFireProjectiles = [];
    }
    if (this.activeForrestProjectiles.length > 0) {
      this.activeForrestProjectiles.forEach((projectile) => {
        if (projectile?.active) projectile.destroy();
      });
      this.activeForrestProjectiles = [];
    }

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

  applyDamageToPlayer(damage) {
    if (!this.playerCharacter || !this.playerCharacter.sprite) return;
    if (this.playerHP <= 0) return;

    const clampedReduction = Phaser.Math.Clamp(this.playerDamageReduction, 0, 0.95);
    const mitigatedDamage = Math.max(1, Math.round(damage * (1 - clampedReduction)));
    this.playerHP -= mitigatedDamage;
    if (this.playerHP < 0) this.playerHP = 0;
    this.playerCharacter.takeDamage(mitigatedDamage);

    this.scene.tweens.add({
      targets: this.playerCharacter.sprite,
      alpha: 0.5,
      duration: 100,
      yoyo: true,
    });

    this.updateHPBars();

    if (this.playerHP <= 0) {
      if (this.playerCharacter && typeof this.playerCharacter.die === 'function') {
        this.playerCharacter.die(() => {
          this.scene.time.delayedCall(400, () => this.complete(false));
        });
      } else {
        this.scene.time.delayedCall(1200, () => this.complete(false));
      }
    }
  }

  handleBossAttackHit() {
    if (!this.bossAttackActive || this.bossAttackHasHit) return;
    if (!this.playerCharacter || !this.playerCharacter.sprite) return;

    const damage = this.pendingBossDamage;
    this.bossAttackHasHit = true;
    this.applyDamageToPlayer(damage);
    if (this.playerHP <= 0) {
      this.bossAttackActive = false;
      this.bossAttackHitbox.body.setEnable(false);
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

    // Cleanup Fire projectiles after timeout/out of world bounds.
    if (this.activeFireProjectiles.length > 0) {
      const worldWidth = this.scene.physics.world.bounds.width;
      const worldHeight = this.scene.physics.world.bounds.height;
      const now = this.scene.time.now;
      this.activeFireProjectiles = this.activeFireProjectiles.filter((projectile) => {
        if (!projectile || !projectile.active) return false;
        if (projectile.getData('state') === 'exploding') return true;

        const spawnTime = Number(projectile.getData('spawnTime')) || now;
        const expired = now - spawnTime > this.fireProjectileLifetimeMs;
        const offWorld =
          projectile.x < -50 ||
          projectile.x > worldWidth + 50 ||
          projectile.y < -50 ||
          projectile.y > worldHeight + 50;

        if (expired || offWorld) {
          this.explodeFireProjectile(projectile);
        }
        return projectile.active;
      });
    }

    // Cleanup Forrest projectiles after timeout/out of world bounds.
    if (this.activeForrestProjectiles.length > 0) {
      const worldWidth = this.scene.physics.world.bounds.width;
      const worldHeight = this.scene.physics.world.bounds.height;
      const now = this.scene.time.now;
      this.activeForrestProjectiles = this.activeForrestProjectiles.filter((projectile) => {
        if (!projectile || !projectile.active) return false;
        if (projectile.getData('state') === 'exploding') return true;

        const spawnTime = Number(projectile.getData('spawnTime')) || now;
        const expired = now - spawnTime > this.forrestProjectileLifetimeMs;
        const offWorld =
          projectile.x < -50 ||
          projectile.x > worldWidth + 50 ||
          projectile.y < -50 ||
          projectile.y > worldHeight + 50;

        if (expired || offWorld) {
          this.explodeForrestProjectile(projectile);
        }
        return projectile.active;
      });
    }

    // Boss stays dormant until player is close enough, then awakens.
    if (!this.bossDefeated && this.bossCharacter && this.playerCharacter?.sprite && this.bossCharacter?.sprite) {
      const isAwake = typeof this.bossCharacter.canFight === 'function' ? this.bossCharacter.canFight() : true;
      const isAwakening = Boolean(this.bossCharacter.isAwakening);
      if (!isAwake && !isAwakening) {
        const distanceX = Math.abs(this.playerCharacter.sprite.x - this.bossCharacter.sprite.x);
        if (distanceX <= this.bossAwakenTriggerDistance && typeof this.bossCharacter.triggerAwaken === 'function') {
          this.bossCharacter.triggerAwaken();
        }
      }
    }

    this.updateBossAI(delta);

    if (this.bossType === 'forest') {
      this.updateForrestAttackPattern(delta);
    }

    // Update boss AI attack timer
    if (!this.bossDefeated && this.bossType !== 'forest') {
      this.bossAttackTimer += Number.isFinite(delta) ? delta : 0;
      if (
        this.bossAttackTimer >= this.bossAttackCooldown &&
        this.canBossStartAttack() &&
        (typeof this.bossCharacter.canFight !== 'function' || this.bossCharacter.canFight()) &&
        !this.bossCharacter.isAttacking &&
        !this.bossCharacter.isTakingHit &&
        !this.bossActionLocked
      ) {
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

        if (this.bossType === 'forest' && this.forrestSpellRange > 0) {
          const center = this.getBodyCenter(this.bossCharacter.sprite);
          if (center) {
            this.debugGraphics.lineStyle(2, 0x22c55e, 0.9);
            this.debugGraphics.strokeCircle(center.x, center.y, this.forrestSpellRange);
          }
        }
      }

      // Draw attack hitboxes when active
      if (this.playerAttackHitbox.body.enable) {
        this.drawDebugBox(this.debugGraphics, this.playerAttackHitbox, 0x00ffff);
      }
      if (this.bossAttackHitbox.body.enable) {
        this.drawDebugBox(this.debugGraphics, this.bossAttackHitbox, 0xff00ff);
      }
      if (this.forrestThornHitbox?.body?.enable) {
        this.drawDebugBox(this.debugGraphics, this.forrestThornHitbox, 0x84cc16);
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
      if (this.activeFireProjectiles.length > 0) {
        this.activeFireProjectiles.forEach((projectile) => {
          if (projectile && projectile.active && projectile.body && projectile.body.enable) {
            this.drawDebugBox(this.debugGraphics, projectile, 0xf97316);
          }
        });
      }
      if (this.activeForrestProjectiles.length > 0) {
        this.activeForrestProjectiles.forEach((projectile) => {
          if (projectile && projectile.active && projectile.body && projectile.body.enable) {
            this.drawDebugBox(this.debugGraphics, projectile, 0x65a30d);
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
    if (!this.playerCharacter || !this.playerCharacter.sprite) return;
    if (this.playerCharacter.isDead || this.playerCharacter.isTakingHit) return;
    if (this.playerCharacter.isAttacking) return;

    const baseDamage = this.playerCharacter.getDamage();
    const damage = Math.max(
      1,
      Math.round(baseDamage * this.playerBaseAttackScale * this.playerAttackMultiplier)
    );

    const playerSprite = this.playerCharacter.sprite;
    const playerCenter = this.getBodyCenter(playerSprite);
    if (!playerCenter) return;

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
    if (!this.bossCharacter || this.bossCharacter.isAttacking || this.bossActionLocked) return;
    if (typeof this.bossCharacter.canFight === 'function' && !this.bossCharacter.canFight()) return;
    if (!this.canBossStartAttack()) return;

    const playerSprite = this.playerCharacter?.sprite;
    const bossSprite = this.bossCharacter.sprite;
    if (!playerSprite || !bossSprite) return;

    this.bossActionLocked = true;
    const bossDirection = playerSprite.x >= bossSprite.x ? 1 : -1;
    this.setBossFacingDirection(bossDirection);
    bossSprite.body.setVelocityX(0);

    const { attackKey, hitboxDuration, cooldown } = this.pickBossAttackProfile();
    this.executeBossAttack(attackKey, hitboxDuration, () => {
      this.bossActionLocked = false;
    });
    this.bossAttackCooldown = cooldown;
  }

  pickBossAttackProfile() {
    if (this.bossType === 'fire') {
      return {
        attackKey: 'fire_boss_attack_anim',
        hitboxDuration: 180,
        cooldown: 5000,
      };
    }
    if (this.bossType === 'forest') {
      return {
        attackKey: 'forrest_boss_spell_anim',
        hitboxDuration: 180,
        cooldown: 3200,
      };
    }

    const attackKey = Math.random() < 0.4 ? 'boss_attack_2_anim' : 'boss_attack_1_anim';
    return {
      attackKey,
      hitboxDuration: attackKey === 'boss_attack_2_anim' ? 190 : 140,
      cooldown: attackKey === 'boss_attack_2_anim' ? 2600 : 2200,
    };
  }

  updateBossAI(_delta) {
    if (this.bossDefeated || !this.bossCharacter || !this.playerCharacter) return;
    if (typeof this.bossCharacter.canFight === 'function' && !this.bossCharacter.canFight()) return;
    const bossSprite = this.bossCharacter.sprite;
    const playerSprite = this.playerCharacter.sprite;
    if (!bossSprite || !playerSprite || !bossSprite.body) return;
    if (this.lockBossToSpawn) {
      bossSprite.body.setVelocityX(0);
      return;
    }

    const dx = playerSprite.x - bossSprite.x;
    const distanceX = Math.abs(dx);
    const dir = dx >= 0 ? 1 : -1;
    this.setBossFacingDirection(dir);

    if (this.bossCharacter.isAttacking || this.bossCharacter.isTakingHit || this.bossCharacter.isDead || this.bossActionLocked) {
      bossSprite.body.setVelocityX(0);
      return;
    }

    if (this.bossType === 'fire') {
      const preferredRange = 280;
      const tolerance = 45;

      if (distanceX > preferredRange + tolerance) {
        bossSprite.body.setVelocityX(dir * this.bossChaseSpeed);
      } else if (distanceX < preferredRange - tolerance) {
        bossSprite.body.setVelocityX(-dir * this.bossChaseSpeed);
      } else {
        bossSprite.body.setVelocityX(0);
      }
      return;
    }
    if (this.bossType === 'forest') {
      // Forest boss should not chase; it only teleports for thorn attacks.
      bossSprite.body.setVelocityX(0);
      return;
    }

    if (distanceX > this.bossMeleeRange) {
      bossSprite.body.setVelocityX(dir * this.bossChaseSpeed);
      return;
    }

    bossSprite.body.setVelocityX(0);
  }

  executeBossAttack(attackKey, hitboxDuration = 140, onDone) {
    if (!this.bossCharacter || this.bossCharacter.isAttacking) {
      if (onDone) onDone();
      return;
    }
    if (typeof this.bossCharacter.canFight === 'function' && !this.bossCharacter.canFight()) {
      if (onDone) onDone();
      return;
    }

    const bossSprite = this.bossCharacter.sprite;
    const bossCenter = this.getBodyCenter(bossSprite);
    if (!bossCenter) {
      if (onDone) onDone();
      return;
    }
    if (!this.canBossStartAttack()) {
      if (onDone) onDone();
      return;
    }

    const playerSprite = this.playerCharacter?.sprite;
    const bossHitboxHalfWidth = this.bossAttackHitbox.width / 2;
    const bossBodyHalfWidth = bossSprite.body.width / 2;
    const bossDirection = playerSprite && playerSprite.x >= bossSprite.x ? 1 : -1;
    const offsetX = bossDirection * (bossBodyHalfWidth + bossHitboxHalfWidth + 10);

    this.bossAttackHitbox.setPosition(bossCenter.x + offsetX, bossCenter.y);

    const wasAttacking = this.bossCharacter.isAttacking;
    this.bossCharacter.attack((damage) => {
      if (this.bossType === 'fire') {
        if (this.shouldFireBossUseSingleShot()) {
          this.spawnFireProjectileTowardPlayer(damage, 0);
        } else {
          this.spawnFireProjectileVolley(damage);
        }
      } else if (this.bossType === 'forest') {
        this.spawnForrestProjectileTowardPlayer(damage);
      } else {
        this.pendingBossDamage = damage;
        this.activateBossHitbox(hitboxDuration);
      }

      const idleKey = this.getBossIdleAnimationKey();
      if (this.bossCharacter.sprite && this.scene.anims.exists(idleKey)) {
        this.bossCharacter.sprite.play(idleKey, true);
      }
      if (onDone) onDone();
    }, attackKey);

    // If attack didn't actually start, unlock so AI doesn't get stuck.
    if (wasAttacking === this.bossCharacter.isAttacking && !this.bossCharacter.isAttacking) {
      if (onDone) onDone();
    }
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
    this.stopBossBgm();
    this.playSfx(victory ? 'victory' : 'defeat', { volume: 0.55 });
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
    this.stopBossBgm();
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
    if (this.forrestThornHitbox) {
      this.forrestThornHitbox.destroy();
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
    if (this.activeFireProjectiles.length > 0) {
      this.activeFireProjectiles.forEach((projectile) => {
        if (projectile && projectile.active) {
          projectile.destroy();
        }
      });
      this.activeFireProjectiles = [];
    }
    if (this.activeForrestProjectiles.length > 0) {
      this.activeForrestProjectiles.forEach((projectile) => {
        if (projectile && projectile.active) {
          projectile.destroy();
        }
      });
      this.activeForrestProjectiles = [];
    }
  }
}
