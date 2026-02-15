import Phaser from 'phaser';
import { Warrior } from './characters/Warrior';
// import { Mage } from './characters/Mage';
// import { Rogue } from './characters/Rogue';
// import { Cleric } from './characters/Cleric';
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
    this.combatText = null;
  }

  start() {
    this.scene.children.removeAll(true);

    // Tilemap setup
    const map = this.scene.make.tilemap({ key: 'map1' });
    const tileset = map.addTilesetImage('bwtiles1', 'bwtiles1');
    const groundLayer = map.createLayer('ground', tileset, 0, 0);
    groundLayer.setDepth(-5);

    groundLayer.setCollision([1, 2, 3, 12, 13, 14, 23, 24, 25, 26, 34, 35, 36]);

    this.scene.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    // Spawn positions
    const playerSpawnX = 200;
    const playerSpawnY = 100;
    const bossSpawnX = 1100;
    const bossSpawnY = 100;

    // Background
    const bg = this.scene.add.rectangle(640, 360, 1280, 736, 0x1a0d2e);
    bg.setDepth(-10);

    this.scene.add
      .text(640, 60, 'FINAL BOSS FIGHT!', {
        fontSize: '52px',
        color: '#ef4444',
        fontFamily: 'monospace',
      })
      .setOrigin(0.5);

    this.combatText = this.scene.add
      .text(640, 530, 'Press ENTER to attack', {
        fontSize: '22px',
        color: '#fbbf24',
        fontFamily: 'monospace',
      })
      .setOrigin(0.5)
      .setDepth(20);

    // Create boss
    this.bossCharacter = new Boss(this.scene, bossSpawnX, bossSpawnY);
    this.bossCharacter.create(bossSpawnX, bossSpawnY);
    this.bossCharacter.setupPhysics(groundLayer);

    // Create player based on class
    this.createPlayer(playerSpawnX, playerSpawnY, groundLayer);

    // HP bars
    this.hpBarPlayer = this.scene.add.graphics();
    this.hpBarBoss = this.scene.add.graphics();

    this.playerHpLabel = this.scene.add
      .text(380, 570, `Player HP: ${this.playerHP}/${this.maxPlayerHP}`, {
        fontSize: '16px',
        color: '#ffffff',
        fontFamily: 'monospace',
      })
      .setOrigin(0.5);

    this.bossHpLabel = this.scene.add
      .text(900, 570, `Boss HP: ${this.bossHP}/${this.bossMaxHP}`, {
        fontSize: '16px',
        color: '#ffffff',
        fontFamily: 'monospace',
      })
      .setOrigin(0.5);

    this.updateHPBars();

    this.attackKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
  }

  createPlayer(spawnX, spawnY, groundLayer) {
    switch (this.character.class) {
      case 'Warrior':
        this.playerCharacter = new Warrior(this.scene, spawnX, spawnY);
        break;
      // case 'Mage':
      //   this.playerCharacter = new Mage(this.scene, spawnX, spawnY);
      //   break;
      // case 'Rogue':
      //   this.playerCharacter = new Rogue(this.scene, spawnX, spawnY);
      //   break;
      // case 'Cleric':
      //   this.playerCharacter = new Cleric(this.scene, spawnX, spawnY);
      //   break;
      default:
        this.playerCharacter = new Warrior(this.scene, spawnX, spawnY);
    }

    this.playerCharacter.create(spawnX, spawnY);
    this.playerCharacter.setupPhysics(groundLayer);
  }

  update() {
    if (this.playerCharacter) {
      this.playerCharacter.update();
    }

    if (this.bossCharacter) {
      this.bossCharacter.update();
    }

    if (!this.attackKey || this.isAttacking) return;

    if (Phaser.Input.Keyboard.JustDown(this.attackKey)) {
      this.playerAttack();
    }
  }

  playerAttack() {
    this.isAttacking = true;

    let damage = this.playerCharacter.getDamage();
    let isCrit = false;

    // Check for Rogue critical hit
    if (this.character.class === 'Rogue') {
      isCrit = Math.random() < this.playerCharacter.getCritChance();
      damage = this.playerCharacter.getDamage(isCrit);
      
      if (isCrit) {
        this.combatText.setText('CRITICAL HIT!');
      } else {
        this.combatText.setText(`${this.character.class} attacks!`);
      }
    } else {
      this.combatText.setText(`${this.character.class} attacks!`);
    }

    this.playerCharacter.attack(() => {
      this.bossHP -= damage;
      this.bossCharacter.takeDamage(damage);

      // Cleric healing
      if (this.character.class === 'Cleric') {
        const healAmount = this.playerCharacter.getHealAmount();
        this.playerHP = Math.min(this.maxPlayerHP, this.playerHP + healAmount);
      }

      this.updateHPBars();
      this.finishPlayerTurn(this.playerCharacter.getAttackRate());
    });
  }

  finishPlayerTurn(delay) {
    if (this.bossHP <= 0) {
      this.combatText.setText('Victory! Boss Defeated!');
      this.scene.time.delayedCall(1200, () => this.complete(true));
      return;
    }
    this.scene.time.delayedCall(delay, () => this.bossAttack());
  }

  bossAttack() {
    // ✅ Check if boss is already attacking
    if (!this.bossCharacter) return;
    const currentKey = this.bossCharacter.sprite?.anims?.currentAnim?.key;
    if (this.bossCharacter.sprite?.anims?.isPlaying && currentKey && currentKey !== 'boss_idle_anim') {
      console.log('Boss still animating:', currentKey);
      return;
    }

    this.combatText.setText('Boss attacks!');

    // ✅ Use the Boss class attack method with callback
    this.bossCharacter.attack((damage) => {
      this.playerHP -= damage;
      if (this.playerHP < 0) this.playerHP = 0;

      this.playerCharacter.takeDamage(damage);
      this.updateHPBars();

      // ✅ Return boss to idle AFTER attack completes
      if (this.bossCharacter.sprite && this.scene.anims.exists('boss_idle_anim')) {
        this.bossCharacter.sprite.play('boss_idle_anim', true);
      }

      if (this.playerHP <= 0) {
        this.combatText.setText('You have been defeated!');
        this.scene.time.delayedCall(1200, () => this.complete(false));
        return;
      }

      this.isAttacking = false;
      this.combatText.setText('Press ENTER to attack');
    });
  }

  updateHPBars() {
    // Player bar
    this.hpBarPlayer.clear();
    this.hpBarPlayer.fillStyle(0x1f2937, 1);
    this.hpBarPlayer.fillRect(80, 590, 600, 35);

    const playerFrac = this.maxPlayerHP ? this.playerHP / this.maxPlayerHP : 0;
    const pct = playerFrac * 100;
    const playerBarColor = pct > 50 ? 0x10b981 : pct > 25 ? 0xf59e0b : 0xef4444;

    this.hpBarPlayer.fillStyle(playerBarColor, 1);
    this.hpBarPlayer.fillRect(83, 593, Math.max(0, Math.min(1, playerFrac)) * 594, 29);

    if (this.playerHpLabel) {
      this.playerHpLabel.setText(`Player HP: ${Math.max(0, this.playerHP)}/${this.maxPlayerHP}`);
    }

    // Boss bar
    this.hpBarBoss.clear();
    this.hpBarBoss.fillStyle(0x1f2937, 1);
    this.hpBarBoss.fillRect(600, 590, 600, 35);

    const bossFrac = this.bossMaxHP ? this.bossHP / this.bossMaxHP : 0;
    const bpct = bossFrac * 100;
    const bossBarColor = bpct > 50 ? 0x10b981 : bpct > 25 ? 0xf59e0b : 0xef4444;

    this.hpBarBoss.fillStyle(bossBarColor, 1);
    this.hpBarBoss.fillRect(603, 593, Math.max(0, Math.min(1, bossFrac)) * 594, 29);

    if (this.bossHpLabel) {
      this.bossHpLabel.setText(`Boss HP: ${Math.max(0, this.bossHP)}/${this.bossMaxHP}`);
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
  }
}