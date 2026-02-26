import { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { BossFightManager } from './BossFightManager';
import { Warrior } from './characters/Warrior';
import { Mage } from './characters/Mage';
import { Archer } from './characters/Archer';
import { Witch } from './characters/Witch';
import { Boss } from './characters/Boss';
import { FireBoss } from './characters/FireBoss';
import { ForrestBoss } from './characters/ForrestBoss';
import { CHARACTER_CONFIG } from './characters/constants/characterConfig';

const TIER_DROP_WEIGHTS = {
  rare: 75,
  epic: 20,
  legendary: 10,
  mythic: 1,
};

const CLASS_LOOT_DEFS = {
  warrior: {
    rare: ['bandit_sword', 'fine_boot', 'leather_armor', 'soldier_helmet'],
    epic: ['hero_sword', 'iron_armor', 'squire_helmet', 'swift_boot'],
    legendary: ['commander_helmet', 'demon_sword', 'flashy_boot', 'steel_armor'],
    mythic: ['berserker_helmet', 'excalibur_sword', 'golden_armor'],
  },
  mage: {
    rare: ['fine_boot', 'leather_armor', 'leather_hood', 'wooden_staff'],
    epic: ['iron_armor', 'mamba_headband', 'swift_boot', 'voodoo_staff'],
    legendary: ['flashy_boot', 'lunar_staff', 'magic_hat', 'steel_armor'],
    mythic: ['golden_armor', 'lightning_boot', 'sage_hat', 'sage_staff'],
  },
  archer: {
    rare: ['fine_boot', 'leather_armor', 'short_bow', 'soldier_helmet'],
    epic: ['iron_armor', 'long_bow', 'squire_helmet', 'swift_boot'],
    legendary: ['commander_helmet', 'elven_bow', 'flashy_boot', 'steel_armor'],
    mythic: ['berserker_helmet', 'golden_armor', 'jade_bow', 'lightning_boot'],
  },
  witch: {
    rare: ['fine_boot', 'leather_armor', 'leather_hood', 'wooden_staff'],
    epic: ['iron_armor', 'mamba_headband', 'swift_boot', 'voodoo_staff'],
    legendary: ['flashy_boot', 'lunar_staff', 'magic_hat', 'steel_armor'],
    mythic: ['golden_armor', 'lightning_boot', 'sage_hat', 'sage_staff'],
  },
};

const TIER_ICONS = {
  rare: '🔹',
  epic: '🟣',
  legendary: '🟡',
  mythic: '🌟',
};

const TIER_COLORS = {
  rare: '#60a5fa',
  epic: '#a78bfa',
  legendary: '#f59e0b',
  mythic: '#f472b6',
};

const WEAPON_BONUS_BY_TIER = {
  rare: 0.05,
  epic: 0.1,
  legendary: 0.3,
  mythic: 1,
};

const HEADWEAR_HP_BONUS_BY_TIER = {
  rare: 50,
  epic: 100,
  legendary: 200,
  mythic: 500,
};

const ARMOR_REDUCTION_BY_TIER = {
  rare: 0.03,
  epic: 0.05,
  legendary: 0.08,
  mythic: 0.15,
};

const BOOTS_SPEED_BONUS_BY_TIER = {
  rare: 0.05,
  epic: 0.1,
  legendary: 0.15,
  mythic: 0.3,
};

const toTitleCase = (value) =>
  String(value || '')
    .split('_')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

const inferItemType = (value) => {
  const text = String(value || '').toLowerCase();
  if (text.includes('sword') || text.includes('bow') || text.includes('staff')) return 'weapon';
  if (text.includes('helmet') || text.includes('hat') || text.includes('hood') || text.includes('headband')) return 'headwear';
  if (text.includes('armor')) return 'armor';
  if (text.includes('boot')) return 'boots';
  return 'misc';
};

const getTierKey = (item) => {
  const tier = String(item?.tier || item?.rarity || '').toLowerCase();
  return WEAPON_BONUS_BY_TIER[tier] !== undefined ? tier : 'rare';
};

const getEquipmentModifiers = (item) => {
  if (!item) {
    return {
      attackMultiplier: 1,
      hpBonus: 0,
      damageReduction: 0,
      speedMultiplier: 1,
    };
  }

  const tier = getTierKey(item);
  const type = String(item.itemType || inferItemType(item.name || item.slug)).toLowerCase();

  if (type === 'weapon') {
    return {
      attackMultiplier: 1 + WEAPON_BONUS_BY_TIER[tier],
      hpBonus: 0,
      damageReduction: 0,
      speedMultiplier: 1,
    };
  }
  if (type === 'headwear') {
    return {
      attackMultiplier: 1,
      hpBonus: HEADWEAR_HP_BONUS_BY_TIER[tier],
      damageReduction: 0,
      speedMultiplier: 1,
    };
  }
  if (type === 'armor') {
    return {
      attackMultiplier: 1,
      hpBonus: 0,
      damageReduction: ARMOR_REDUCTION_BY_TIER[tier],
      speedMultiplier: 1,
    };
  }
  if (type === 'boots') {
    return {
      attackMultiplier: 1,
      hpBonus: 0,
      damageReduction: 0,
      speedMultiplier: 1 + BOOTS_SPEED_BONUS_BY_TIER[tier],
    };
  }

  return {
    attackMultiplier: 1,
    hpBonus: 0,
    damageReduction: 0,
    speedMultiplier: 1,
  };
};

const getCharacterLootClass = (characterClass) => {
  const normalized = String(characterClass || '').toLowerCase();
  return CLASS_LOOT_DEFS[normalized] ? normalized : 'warrior';
};

const pickTierByWeight = () => {
  const entries = Object.entries(TIER_DROP_WEIGHTS);
  const totalWeight = entries.reduce((sum, [, weight]) => sum + weight, 0);
  let roll = Math.random() * totalWeight;

  for (const [tier, weight] of entries) {
    roll -= weight;
    if (roll <= 0) return tier;
  }

  return 'rare';
};

const createBossRewardItem = (characterClass) => {
  const classKey = getCharacterLootClass(characterClass);
  const classLoot = CLASS_LOOT_DEFS[classKey];
  let tier = pickTierByWeight();
  let tierItems = classLoot[tier] || [];

  if (tierItems.length === 0) {
    tier = 'rare';
    tierItems = classLoot.rare || [];
  }
  if (tierItems.length === 0) return null;

  const slug = tierItems[Math.floor(Math.random() * tierItems.length)];
  const name = toTitleCase(slug);
  const itemType = inferItemType(slug);

  return {
    id: `boss_item_${Date.now()}_${Math.floor(Math.random() * 1e6)}`,
    name,
    description: `${toTitleCase(tier)} ${name}`,
    icon: TIER_ICONS[tier],
    rarity: tier,
    tier,
    itemType,
    slug,
    equipped: false,
    sprite: `/assets/sprites/items/${classKey}/${tier}/${slug}.png`,
    source: 'boss_fight',
  };
};

export default function PhaserQuestGame({ quest, character, equipment, onQuestComplete, onBack }) {
  const gameRef = useRef(null);
  const phaserGameRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!gameRef.current) return;

    if (phaserGameRef.current) {
      phaserGameRef.current.destroy(true);
      phaserGameRef.current = null;
    }

    let currentQuestionIndex = 0;
    let score = 0;
    let timeRemaining = quest.timeLimit || 300;
    let gameState = 'intro';
    const equipmentStats = getEquipmentModifiers(equipment);
    const questionCount = Math.max(1, quest.questions.length || 0);
    const maxPlayerHP = (questionCount * 100) + equipmentStats.hpBonus;
    let playerHP = equipmentStats.hpBonus;
    const bossMaxHP = questionCount * 500;
    let itemsEarned = [];

    let quizPlayerCharacter = null;
    let quizPlayer = null;
    let quizNPC = null;
    let quizNpcTitleText = null;
    let answerObjects = [];
    let darkThings = [];
    let questionTextObj = null;
    let answerTextObjs = [];
    let currentQuestion = null;
    let hasAnswered = false;
    let questionShown = false;
    let doorUnlocked = false;
    let isTransitioning = false;
    let promptText = null;
    let quizGroundLayer = null;
    let quizDoorLayer = null;
    let quizDoorSummonIdleFx = null;
    let quizAttackKey = null;
    let quizAttackHitbox = null;
    let quizAttackActive = false;
    let quizAttackHasHit = false;
    let activeQuizArrows = [];
    let activeQuizProjectiles = [];
    let wasOverlappingQuestMaster = false;
    let debugGraphics = null;
    const showDebugHitboxes = false;

    let dialogueBox;
    let dialogueText;
    let timerText;

    let bossFightManager = null;
    let lastQuizMapKey = null;
    let lastBossVariantId = null;
    let quizBgm = null;
    const QUIZ_BGM_KEY = 'quiz_bgm';
    const DOOR_SUMMON_IDLE_SHEET_KEY = 'door_summon_idle_sheet';
    const DOOR_SUMMON_IDLE_ANIM_KEY = 'door_summon_idle_anim';
    const DOOR_SUMMON_FX_CONFIG = {
      offsetX: 0,
      offsetY: 0,
      scale: 0.085,
      depthOffset: 1,
    };

    const resolvedCharacterConfig = CHARACTER_CONFIG[character.class] || CHARACTER_CONFIG.Warrior;
    const QUEST_MASTER_CONFIG = {
      textureKey: 'qm_idle',
      animationKey: 'qm_idle_anim',
      spriteSheetPath: 'assets/sprites/quest_master/Idle.png',
      frameWidth: 155,
      frameHeight: 155,
      // If true, animation uses all available frames in the loaded sheet.
      useAutoFrameRange: true,
      animationStart: 0,
      animationEnd: 7,
      animationFrameRate: 8,
      scale: 1.2,
      bodySize: { width: 40, height: 84 },
      titleText: 'Quest Master',
      titleOffsetY: 64,
    };
    const QUIZ_MAP_CONFIG = {
      qmap1: {
        // Edit these manually per character for this map.
        // Warrior stays exactly the same as your current setup.
        playerSpawns: {
          Warrior: { x: 140, y: 620 },
          Mage: { x: 140, y: 580 },
          Archer: { x: 140, y: 600 },
          Witch: { x: 140, y:590 },
        },
        questMasterSpawn: { x: 280, y: 500 }, // same as current code
      },
      qmap2: {
        playerSpawns: {
          Warrior: { x: 60, y: 230 },
          Mage: { x: 60, y: 190 },
          Archer: { x: 60, y: 210 },
          Witch: { x: 60, y: 200 },
        },
        questMasterSpawn: { x: 340, y: 215 },
      },
      qmap3: {
        playerSpawns: {
          Warrior: { x: 480, y: 600 },
          Mage: { x: 480, y: 560 },
          Archer: { x: 480, y: 580 },
          Witch: { x: 480, y: 570 },
        },
        questMasterSpawn: { x: 620, y: 470 },
      },
    };
    const BOSS_VARIANT_CONFIG = [
      {
        id: 'demon_keep',
        bossType: 'demon',
        mapKey: 'bmap1',
        title: 'FINAL BOSS FIGHT! DEMON KEEP',
        spawnPoints: {
          player: { x: 50, y: 410 },
          boss: { x: 1080, y: 530 },
        },
        ai: {
          bossAttackCooldown: 2400,
          bossChaseSpeed: 125,
          bossMeleeRange: 150,
          bossAwakenTriggerDistance: 420,
        },
      },
      {
        id: 'fire_lair',
        bossType: 'fire',
        mapKey: 'bmap2',
        title: 'FINAL BOSS FIGHT! FIRE LAIR',
        spawnPoints: {
          player: { x: 640, y: 200 },
          boss: { x: 640, y: 520 },
        },
        ai: {
          bossAttackCooldown: 4000,
          bossChaseSpeed: 160,
          bossMeleeRange: 125,
          bossAwakenTriggerDistance: 0,
          lockToSpawn: true,
        },
      },
      {
        id: 'forest_realm',
        bossType: 'forest',
        mapKey: 'bmap3',
        title: 'FINAL BOSS FIGHT! FOREST REALM',
        spawnPoints: {
          player: { x: 1200, y: 300 },
          boss: { x: 480, y: 520 },
        },
        ai: {
          bossAttackCooldown: 3200,
          bossChaseSpeed: 120,
          bossMeleeRange: 120,
          bossAwakenTriggerDistance: 0,
          forrestRangeAttackIntervalMs: 5000,
          forrestFarDistanceThreshold: 200,
          forrestFarDurationMs: 4000,
          forrestTeleportOffsetX: 140,
          forrestTeleportOffsetY: -40,
          forrestTeleportOffsetYByClass: {
            Warrior: -60,
            Mage: 0,
            Archer: -40,
            Witch: 0,
          },
          forrestThornDamage: 18,
          forrestThornHitboxWidth: 300,
          forrestThornHitboxHeight: 100,
          forrestThornHitboxOffsetX: 25,
          forrestThornHitboxOffsetY: 4,
          forrestSpellRange: 180,
          lockToSpawn: false,
        },
      },
    ];

    const formatTime = (seconds) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const ensureQuizBgm = function () {
      if (!this.sound || !this.cache.audio.exists(QUIZ_BGM_KEY)) return null;
      if (!quizBgm || quizBgm.isDestroyed) {
        quizBgm = this.sound.add(QUIZ_BGM_KEY, {
          loop: true,
          volume: 0.35,
        });
      }
      return quizBgm;
    };

    const startQuizBgm = function () {
      const bgm = ensureQuizBgm.call(this);
      if (!bgm || bgm.isPlaying) return;
      bgm.play();
    };

    const stopQuizBgm = function () {
      if (!quizBgm || quizBgm.isDestroyed || !quizBgm.isPlaying) return;
      quizBgm.stop();
    };

    const destroyQuizBgm = function () {
      if (!quizBgm) return;
      if (quizBgm.isPlaying) {
        quizBgm.stop();
      }
      if (!quizBgm.isDestroyed) {
        quizBgm.destroy();
      }
      quizBgm = null;
    };

    const playSfx = function (key, config = {}) {
      if (!key || !this.sound || !this.cache?.audio?.exists(key)) return;
      this.sound.play(key, config);
    };

    const playQuestMasterTouchSequence = function () {
      if (!this.sound) return;
      if (!this.cache?.audio?.exists('touch_qm')) {
        playSfx.call(this, 'qm_speak', { volume: 0.5 });
        return;
      }

      const touchSound = this.sound.add('touch_qm', { volume: 0.5 });
      let hasPlayedSpeak = false;
      const playSpeak = () => {
        if (hasPlayedSpeak) return;
        hasPlayedSpeak = true;
        if (touchSound && !touchSound.isDestroyed) {
          touchSound.destroy();
        }
        playSfx.call(this, 'qm_speak', { volume: 0.5 });
      };

      touchSound.once('complete', playSpeak);
      touchSound.once('stop', playSpeak);
      touchSound.play();
    };

    const shuffleArray = (array) => {
      const arr = array.slice();
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    };

    const pickRandomQuizMapKey = () => {
      const keys = Object.keys(QUIZ_MAP_CONFIG);
      if (keys.length <= 1) return keys[0];
      const pool = lastQuizMapKey ? keys.filter((key) => key !== lastQuizMapKey) : keys;
      const next = Phaser.Utils.Array.GetRandom(pool);
      lastQuizMapKey = next;
      return next;
    };

    const pickRandomBossVariant = () => {
      if (BOSS_VARIANT_CONFIG.length <= 1) return BOSS_VARIANT_CONFIG[0];
      const pool = lastBossVariantId
        ? BOSS_VARIANT_CONFIG.filter((variant) => variant.id !== lastBossVariantId)
        : BOSS_VARIANT_CONFIG;
      const selected = Phaser.Utils.Array.GetRandom(pool);
      lastBossVariantId = selected.id;
      return selected;
    };

    const getMapPlayerSpawn = (mapConfig, className) => {
      if (!mapConfig) return { x: 140, y: 620 };
      const classSpawn = mapConfig.playerSpawns?.[className];
      if (classSpawn) return classSpawn;
      return mapConfig.playerSpawns?.Warrior || { x: 140, y: 620 };
    };

    const showIntroDialogue = function () {
      gameState = 'intro';

      dialogueBox = this.add.rectangle(640, 600, 1000, 200, 0x2d1b4e, 1);
      dialogueBox.setStrokeStyle(4, 0xa78bfa);

      const messages = [
        `Welcome, brave ${character.class}!`,
        `You have entered: ${quest.title}`,
        `${quest.description}`,
        `Answer ${quest.questions.length} questions correctly to gain HP!`,
        'Move with A/D and jump with W. Talk to NPC to get the question!',
        'Attack the correct dark thing with ENTER.',
        'If a dark thing touches you, you retry the question.',
        'After answering correctly, go collide with the door to continue.',
        'Finally face the BOSS!',
        'Click to begin your quest...',
      ];

      let messageIndex = 0;

      dialogueText = this.add
        .text(640, 600, messages[messageIndex], {
          fontSize: '18px',
          color: '#ffffff',
          fontFamily: 'monospace',
          align: 'center',
          wordWrap: { width: 950 },
        })
        .setOrigin(0.5);

      const continueText = this.add
        .text(1150, 600, 'v', {
          fontSize: '24px',
          color: '#fbbf24',
        })
        .setOrigin(0.5);

      this.tweens.add({
        targets: continueText,
        y: 610,
        duration: 500,
        yoyo: true,
        repeat: -1,
      });

      const advanceMessage = () => {
        messageIndex++;
        if (messageIndex < messages.length) {
          dialogueText.setText(messages[messageIndex]);
          this.input.once('pointerdown', advanceMessage);
        } else {
          dialogueBox.destroy();
          dialogueText.destroy();
          continueText.destroy();
          startQuizMiniGame.call(this);
        }
      };

      this.input.once('pointerdown', advanceMessage);
    };

    const drawDebugBox = function (graphics, sprite, color) {
      if (!sprite || !sprite.body) return;
      const body = sprite.body;
      graphics.lineStyle(2, color, 1);
      graphics.strokeRect(body.x, body.y, body.width, body.height);
    };

    const createQuizAttackHitbox = function () {
      quizAttackHitbox = this.add.rectangle(0, 0, 90, 80);
      quizAttackHitbox.setAlpha(0);
      this.physics.add.existing(quizAttackHitbox);
      quizAttackHitbox.body.setAllowGravity(false);
      quizAttackHitbox.body.setEnable(false);
    };

    const activateQuizHitbox = function (duration = 140) {
      if (!quizAttackHitbox || !quizAttackHitbox.body) return;
      quizAttackActive = true;
      quizAttackHasHit = false;
      quizAttackHitbox.body.updateFromGameObject();
      quizAttackHitbox.body.setEnable(true);

      this.time.delayedCall(duration, () => {
        quizAttackActive = false;
        if (quizAttackHitbox && quizAttackHitbox.body) {
          quizAttackHitbox.body.setEnable(false);
        }
      });
    };

    const hideAllDarkThings = function () {
      darkThings.forEach((darkThing) => {
        if (darkThing && darkThing.active) {
          darkThing.body.setEnable(false);
          darkThing.setVisible(false);
        }
      });
      answerObjects.forEach((obj) => {
        if (obj.indicator && obj.indicator.active) {
          obj.indicator.setVisible(false);
        }
      });
    };

    const clearDoorSummonFx = function () {
      if (quizDoorSummonIdleFx && quizDoorSummonIdleFx.active) {
        quizDoorSummonIdleFx.destroy();
      }
      quizDoorSummonIdleFx = null;
    };

    const getDoorSummonPosition = function () {
      if (!quizDoorLayer) return null;
      const layerWidth = quizDoorLayer.layer?.width || 0;
      const layerHeight = quizDoorLayer.layer?.height || 0;
      const doorTiles = quizDoorLayer.getTilesWithin(0, 0, layerWidth, layerHeight, { isNotEmpty: true }) || [];
      if (doorTiles.length === 0) return null;

      let anchorTile = doorTiles[0];
      if (quizPlayer?.body?.center) {
        const playerCenter = quizPlayer.body.center;
        anchorTile = doorTiles.reduce((closest, tile) => {
          const d1 = Phaser.Math.Distance.Between(playerCenter.x, playerCenter.y, tile.getCenterX(), tile.getCenterY());
          const d2 = Phaser.Math.Distance.Between(playerCenter.x, playerCenter.y, closest.getCenterX(), closest.getCenterY());
          return d1 < d2 ? tile : closest;
        }, doorTiles[0]);
      }

      return { x: anchorTile.getCenterX(), y: anchorTile.getCenterY() };
    };

    const spawnDoorSummonFx = function () {
      const pos = getDoorSummonPosition.call(this);
      if (!pos) return;
      clearDoorSummonFx.call(this);

      const summonX = pos.x + DOOR_SUMMON_FX_CONFIG.offsetX;
      const summonY = pos.y + DOOR_SUMMON_FX_CONFIG.offsetY;
      const summonDepth = (quizDoorLayer?.depth ?? -3) + DOOR_SUMMON_FX_CONFIG.depthOffset;

      quizDoorSummonIdleFx = this.add.sprite(summonX, summonY, DOOR_SUMMON_IDLE_SHEET_KEY);
      quizDoorSummonIdleFx.setScale(DOOR_SUMMON_FX_CONFIG.scale);
      quizDoorSummonIdleFx.setDepth(summonDepth);
      quizDoorSummonIdleFx.setBlendMode(Phaser.BlendModes.ADD);
      if (this.anims.exists(DOOR_SUMMON_IDLE_ANIM_KEY)) {
        quizDoorSummonIdleFx.play(DOOR_SUMMON_IDLE_ANIM_KEY);
      }
    };

    const beginRetryQuestion = function (message) {
      if (isTransitioning || gameState !== 'quiz') return;
      isTransitioning = true;

      if (quizPlayer && quizPlayer.body) {
        quizPlayer.body.setVelocity(0, 0);
      }

      const retryText = this.add
        .text(640, 400, message, {
          fontSize: '34px',
          color: '#ef4444',
          fontFamily: 'monospace',
          fontStyle: 'bold',
        })
        .setOrigin(0.5)
        .setDepth(200);

      this.tweens.add({
        targets: retryText,
        alpha: 0,
        duration: 1200,
        delay: 900,
      });

      this.time.delayedCall(1800, () => {
        retryText.destroy();
        startQuizMiniGame.call(this);
      });
    };

    const resolveAnswerHit = function (answerObj) {
      if (!answerObj || hasAnswered || isTransitioning || gameState !== 'quiz') return;

      const isCorrect = answerObj.isCorrect;
      hasAnswered = true;

      if (answerObj.indicator && answerObj.indicator.active) {
        answerObj.indicator.setColor(isCorrect ? '#10b981' : '#ef4444');
      }

      answerTextObjs.forEach((textObj, idx) => {
        if (!textObj || !textObj.active) return;
        if (idx === answerObj.index) {
          textObj.setBackgroundColor(isCorrect ? '#10b981' : '#ef4444');
        }
        if (answerObjects[idx]?.isCorrect) {
          textObj.setBackgroundColor('#10b981');
        }
      });

      if (isCorrect) {
        playSfx.call(this, 'correct', { volume: 0.55 });
        score += 1;
        playerHP = Math.min(maxPlayerHP, playerHP + 100);
        doorUnlocked = true;
        hideAllDarkThings.call(this);
        spawnDoorSummonFx.call(this);

        const okText = this.add
          .text(640, 400, 'CORRECT! Door unlocked. Go to the door.', {
            fontSize: '38px',
            color: '#10b981',
            fontFamily: 'monospace',
            fontStyle: 'bold',
          })
          .setOrigin(0.5)
          .setDepth(200);

        this.tweens.add({
          targets: okText,
          alpha: 0,
          duration: 1400,
          delay: 1100,
        });

        if (promptText) {
          promptText.setText('Correct. Go collide with the door to continue.');
          promptText.setColor('#22c55e');
        }
      } else {
        playSfx.call(this, 'incorrect', { volume: 0.55 });
        doorUnlocked = true;
        hideAllDarkThings.call(this);
        spawnDoorSummonFx.call(this);

        if (questionTextObj && questionTextObj.active) {
          questionTextObj.setVisible(false);
        }
        answerTextObjs.forEach((textObj) => {
          if (textObj && textObj.active) textObj.setVisible(false);
        });

        const wrongText = this.add
          .text(640, 400, 'WRONG! No HP gained. Go to the door.', {
            fontSize: '34px',
            color: '#f59e0b',
            fontFamily: 'monospace',
            fontStyle: 'bold',
          })
          .setOrigin(0.5)
          .setDepth(200);

        this.tweens.add({
          targets: wrongText,
          alpha: 0,
          duration: 1400,
          delay: 1100,
        });

        if (promptText) {
          promptText.setText('Wrong answer. No HP reward. Go collide with the door to continue.');
          promptText.setColor('#f59e0b');
        }
      }
    };

    const handleDarkThingContact = function () {
      if (hasAnswered || isTransitioning || gameState !== 'quiz' || !questionShown) return;
      hasAnswered = true;
      hideAllDarkThings.call(this);
      beginRetryQuestion.call(this, 'HIT BY DARK THING! Retrying question...');
    };

    const handleDarkThingMeleeHit = function (answerObj) {
      if (!quizAttackActive || quizAttackHasHit || hasAnswered || isTransitioning || !answerObj) return;
      quizAttackHasHit = true;
      resolveAnswerHit.call(this, answerObj);
    };

    const spawnQuizArcherArrow = function (playerSprite, playerCenter) {
      if (!this.textures.exists('archer_arrowMove')) return;

      const direction = playerSprite.flipX ? -1 : 1;
      const startX = playerCenter.x + direction * 28;
      const startY = playerCenter.y - 8;

      const arrow = this.physics.add.sprite(startX, startY, 'archer_arrowMove');
      arrow.setDepth(7);
      arrow.setScale(2);
      arrow.setFlipX(direction < 0);
      arrow.body.setAllowGravity(false);
      arrow.body.setVelocityX(direction * 650);
      arrow.body.setSize(28, 8);
      arrow.body.setOffset(10, 0);
      arrow.setData('startX', startX);

      if (this.anims.exists('archer_arrow_move_anim')) {
        arrow.play('archer_arrow_move_anim');
      }

      answerObjects.forEach((obj) => {
        if (!obj.sprite || !obj.sprite.active) return;
        this.physics.add.overlap(
          arrow,
          obj.sprite,
          () => {
            if (!arrow.active || hasAnswered || isTransitioning) return;
            arrow.destroy();
            activeQuizArrows = activeQuizArrows.filter((a) => a !== arrow);
            resolveAnswerHit.call(this, obj);
          },
          null,
          this
        );
      });

      activeQuizArrows.push(arrow);
    };

    const spawnQuizwitchProjectile = function (playerSprite, playerCenter) {
      if (!this.textures.exists('witch_moving')) return;

      const direction = playerSprite.flipX ? -1 : 1;
      const startX = playerCenter.x + direction * 44;
      const startY = playerCenter.y - 12;

      const projectile = this.physics.add.sprite(startX, startY, 'witch_moving');
      projectile.setDepth(7);
      projectile.setScale(1.3);
      projectile.setFlipX(direction < 0);
      projectile.body.setAllowGravity(false);
      projectile.body.setVelocityX(direction * 520);
      projectile.body.setSize(20, 20);
      projectile.body.setOffset(10, 16);
      projectile.setData('startX', startX);
      projectile.setData('state', 'moving');

      if (this.anims.exists('witch_projectile_move_anim')) {
        projectile.play('witch_projectile_move_anim');
      }

      answerObjects.forEach((obj) => {
        if (!obj.sprite || !obj.sprite.active) return;
        this.physics.add.overlap(
          projectile,
          obj.sprite,
          () => {
            if (!projectile.active || projectile.getData('state') !== 'moving' || hasAnswered || isTransitioning) return;
            projectile.setData('state', 'exploding');
            projectile.body.setEnable(false);
            projectile.body.setVelocity(0, 0);

            if (this.anims.exists('witch_projectile_explode_anim')) {
              projectile.play('witch_projectile_explode_anim');
              const eventKey = Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + 'witch_projectile_explode_anim';
              projectile.once(eventKey, () => {
                if (projectile.active) projectile.destroy();
              });
            } else {
              projectile.destroy();
            }

            activeQuizProjectiles = activeQuizProjectiles.filter((p) => p !== projectile);
            resolveAnswerHit.call(this, obj);
          },
          null,
          this
        );
      });

      activeQuizProjectiles.push(projectile);
    };

    const handleDoorCollision = function () {
      if (!doorUnlocked || isTransitioning || gameState !== 'quiz') return;
      isTransitioning = true;
      if (quizPlayer && quizPlayer.body) {
        quizPlayer.body.setVelocity(0, 0);
      }
      clearDoorSummonFx.call(this);
      nextQuestion.call(this);
    };

    const showQuestion = function () {
      if (hasAnswered || isTransitioning) return;

      if (!questionShown) {
        questionShown = true;
        if (promptText) {
          promptText.setText('Question revealed. Attack the correct dark thing.');
        }
      }

      if (!questionTextObj || !questionTextObj.active) {
        questionTextObj = this.add
          .text(640, 120, `Q${currentQuestionIndex + 1}: ${currentQuestion.question}`, {
            fontSize: '22px',
            color: '#ffffff',
            fontFamily: 'monospace',
            align: 'center',
            wordWrap: { width: 1100 },
            backgroundColor: '#2d1b4e',
            padding: { x: 20, y: 15 },
          })
          .setOrigin(0.5)
          .setDepth(100);
      }

      if (answerTextObjs.length === 0) {
        const startY = 200;
        const lineHeight = 35;

        answerObjects.forEach((answerObj, index) => {
          const answerText = this.add
            .text(100, startY + index * lineHeight, `${answerObj.letterChar}. ${answerObj.answerText}`, {
              fontSize: '18px',
              color: '#ffffff',
              fontFamily: 'monospace',
              backgroundColor: '#1a0d2e',
              padding: { x: 10, y: 5 },
            })
            .setDepth(100);

          answerTextObjs.push(answerText);
        });
      } else {
        answerTextObjs.forEach((textObj) => {
          if (textObj && textObj.active) {
            textObj.setVisible(true);
          }
        });
      }

      if (questionTextObj && questionTextObj.active) {
        questionTextObj.setVisible(true);
      }
    };

    const hideQuestion = function () {
      if (hasAnswered || isTransitioning) return;

      if (questionTextObj && questionTextObj.active) {
        questionTextObj.setVisible(false);
      }

      answerTextObjs.forEach((textObj) => {
        if (textObj && textObj.active) {
          textObj.setVisible(false);
        }
      });
    };

    const performQuizPlayerAttack = function () {
      if (!quizPlayerCharacter || !quizPlayer || gameState !== 'quiz' || isTransitioning || hasAnswered) return;
      if (quizPlayerCharacter.isDead || quizPlayerCharacter.isTakingHit || quizPlayerCharacter.isAttacking) return;
      const currentKey = quizPlayer.anims?.currentAnim?.key || '';
      if (quizPlayer.anims?.isPlaying && currentKey.includes('_attack')) return;

      const playerCenter = quizPlayer.body?.center
        ? { x: quizPlayer.body.center.x, y: quizPlayer.body.center.y }
        : { x: quizPlayer.x, y: quizPlayer.y };

      const target = answerObjects
        .filter((obj) => obj.sprite && obj.sprite.active)
        .sort((a, b) => Phaser.Math.Distance.Between(playerCenter.x, playerCenter.y, a.sprite.x, a.sprite.y) - Phaser.Math.Distance.Between(playerCenter.x, playerCenter.y, b.sprite.x, b.sprite.y))[0];

      if (!target) return;

      const hitboxHalfWidth = quizAttackHitbox.width / 2;
      const bodyHalfWidth = quizPlayer.body.width / 2;
      const direction = quizPlayer.flipX ? -1 : 1;
      const offsetX = direction * (bodyHalfWidth + hitboxHalfWidth + 8);
      quizAttackHitbox.setPosition(playerCenter.x + offsetX, playerCenter.y);

      quizPlayerCharacter.attack(() => {
        if (character.class === 'Archer') {
          spawnQuizArcherArrow.call(this, quizPlayer, playerCenter);
        } else if (character.class === 'Witch') {
          spawnQuizwitchProjectile.call(this, quizPlayer, playerCenter);
        } else {
          activateQuizHitbox.call(this, 140);
        }

      });
    };

    const updateQuizPlayerCombat = function () {
      if (!quizPlayerCharacter || !quizPlayer || !quizAttackKey || gameState !== 'quiz' || isTransitioning) return;
      if (hasAnswered) return;
      if (!Phaser.Input.Keyboard.JustDown(quizAttackKey)) return;
      performQuizPlayerAttack.call(this);
    };

    const startQuizMiniGame = function () {
      gameState = 'quiz';
      startQuizBgm.call(this);
      hasAnswered = false;
      questionShown = false;
      doorUnlocked = false;
      isTransitioning = false;
      activeQuizArrows = [];
      activeQuizProjectiles = [];
      wasOverlappingQuestMaster = false;
      clearDoorSummonFx.call(this);

      this.children.removeAll(true);
      darkThings = [];
      answerTextObjs = [];
      questionTextObj = null;

      if (showDebugHitboxes) {
        debugGraphics = this.add.graphics();
        debugGraphics.setDepth(1000);
      }

      this.physics.world.gravity.y = 600;

      const selectedQuizMapKey = pickRandomQuizMapKey();
      const selectedQuizMapConfig = QUIZ_MAP_CONFIG[selectedQuizMapKey] || QUIZ_MAP_CONFIG.qmap1;

      const map = this.make.tilemap({ key: selectedQuizMapKey });
      const bwtiles1 = map.addTilesetImage('bwtiles1', 'bwtiles1');
      const extra = map.addTilesetImage('extra', 'extra');
      const tree = map.addTilesetImage('tree', 'tree');
      const doorTiles = map.addTilesetImage('door', 'door');
      const tilesets = [bwtiles1, extra, tree, doorTiles].filter(Boolean);

      const mapBackgroundImage = this.add.image(0, 0, 'qmap_background');
      mapBackgroundImage.setOrigin(0, 0);
      mapBackgroundImage.setDepth(-6);

      const bgLayer = map.createLayer('bg', tilesets, 0, 0);
      quizGroundLayer = map.createLayer('ground', tilesets, 0, 0);
      quizDoorLayer = map.createLayer('door', tilesets, 0, 0);

      if (bgLayer) bgLayer.setDepth(-5);
      if (quizGroundLayer) {
        quizGroundLayer.setDepth(-4);
        quizGroundLayer.setCollisionByExclusion([-1]);
      }
      if (quizDoorLayer) {
        quizDoorLayer.setDepth(-3);
        quizDoorLayer.setCollisionByExclusion([-1]);
      }

      this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

      const bg = this.add.rectangle(640, 320, 1280, 640, 0x1a0d2e);
      bg.setDepth(-10);

      timerText = this.add
        .text(640, 40, `Time: ${formatTime(timeRemaining)}`, {
          fontSize: '28px',
          color: '#fbbf24',
          fontFamily: 'monospace',
        })
        .setOrigin(0.5)
        .setDepth(100);

      this.add
        .text(100, 40, `Question ${currentQuestionIndex + 1}/${quest.questions.length}`, {
          fontSize: '24px',
          color: '#ffffff',
          fontFamily: 'monospace',
        })
        .setOrigin(0, 0.5)
        .setDepth(100);

      const objectLayer = map.getObjectLayer('answers');
      const answerPositions = objectLayer?.objects?.map((obj) => ({ x: obj.x, y: obj.y })) || [];

      quizNPC = this.physics.add.sprite(
        selectedQuizMapConfig.questMasterSpawn.x,
        selectedQuizMapConfig.questMasterSpawn.y,
        QUEST_MASTER_CONFIG.textureKey
      );
      quizNPC.setScale(QUEST_MASTER_CONFIG.scale);
      quizNPC.body.setImmovable(true);
      quizNPC.body.setAllowGravity(false);
      // Centered body avoids hardcoded offsets breaking when spawn/scale changes.
      quizNPC.body.setSize(QUEST_MASTER_CONFIG.bodySize.width, QUEST_MASTER_CONFIG.bodySize.height, true);
      quizNPC.setDepth(5);

      if (this.anims.exists(QUEST_MASTER_CONFIG.animationKey)) {
        quizNPC.play(QUEST_MASTER_CONFIG.animationKey);
      }

      quizNpcTitleText = this.add
        .text(quizNPC.x, quizNPC.y - QUEST_MASTER_CONFIG.titleOffsetY, QUEST_MASTER_CONFIG.titleText, {
          fontSize: '20px',
          color: '#a78bfa',
          fontFamily: 'monospace',
          fontStyle: 'bold',
        })
        .setOrigin(0.5)
        .setDepth(6);

      const selectedPlayerSpawn = getMapPlayerSpawn(selectedQuizMapConfig, character.class);
      const playerStartX = selectedPlayerSpawn.x;
      const playerStartY = selectedPlayerSpawn.y;

      switch (character.class) {
        case 'Warrior':
          quizPlayerCharacter = new Warrior(this, playerStartX, playerStartY);
          break;
        case 'Mage':
          quizPlayerCharacter = new Mage(this, playerStartX, playerStartY);
          break;
        case 'Archer':
          quizPlayerCharacter = new Archer(this, playerStartX, playerStartY);
          break;
        case 'Witch':
          quizPlayerCharacter = new Witch(this, playerStartX, playerStartY);
          break;
        default:
          quizPlayerCharacter = new Warrior(this, playerStartX, playerStartY);
      }

      quizPlayerCharacter.create(playerStartX, playerStartY);
      if (typeof quizPlayerCharacter.setMovementSpeedMultiplier === 'function') {
        quizPlayerCharacter.setMovementSpeedMultiplier(equipmentStats.speedMultiplier);
      }
      quizPlayer = quizPlayerCharacter.sprite;
      quizPlayer.setScale(resolvedCharacterConfig.scale || 2.5);
      quizPlayer.body.setCollideWorldBounds(true);

      if (quizGroundLayer) {
        this.physics.add.collider(quizPlayer, quizGroundLayer);
      }
      if (quizDoorLayer) {
        this.physics.add.collider(quizPlayer, quizDoorLayer, () => handleDoorCollision.call(this), null, this);
      }

      quizAttackKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
      createQuizAttackHitbox.call(this);

      this.physics.add.overlap(quizPlayer, quizNPC, () => showQuestion.call(this), null, this);

      currentQuestion = quest.questions[currentQuestionIndex];
      const shuffledOptions = shuffleArray(currentQuestion.options.map((text, originalIndex) => ({ text, originalIndex })));

      answerObjects = [];

      shuffledOptions.forEach((opt, index) => {
        if (index >= answerPositions.length) return;

        const pos = answerPositions[index];
        const x = pos.x;
        const y = pos.y - 16;

        const indicator = this.add
          .text(x, y - 42, String.fromCharCode(65 + index), {
            fontSize: '34px',
            color: '#fbbf24',
            fontFamily: 'monospace',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4,
          })
          .setOrigin(0.5)
          .setDepth(8);

        const darkThing = this.physics.add.sprite(x, y, 'dark_thing');
        darkThing.setScale(1.5);
        darkThing.setDepth(6);
        darkThing.body.setAllowGravity(false);
        darkThing.body.setImmovable(true);
        darkThing.body.setSize(25, 21);
        darkThing.body.setOffset(2, 7);
        darkThing.play('dark_thing_row1_anim');

        this.tweens.add({
          targets: [darkThing, indicator],
          x: x + 24,
          duration: 700 + index * 80,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });

        const answerObj = {
          indicator,
          sprite: darkThing,
          isCorrect: opt.originalIndex === currentQuestion.correctAnswer,
          index,
          letterChar: String.fromCharCode(65 + index),
          answerText: opt.text,
        };

        answerObjects.push(answerObj);
        darkThings.push(darkThing);

        this.physics.add.overlap(quizAttackHitbox, darkThing, () => handleDarkThingMeleeHit.call(this, answerObj), null, this);
        this.physics.add.overlap(quizPlayer, darkThing, () => handleDarkThingContact.call(this), null, this);
      });

      promptText = this.add
        .text(640, 610, 'Move to the Quest Master to receive your question.', {
          fontSize: '20px',
          color: '#10b981',
          fontFamily: 'monospace',
        })
        .setOrigin(0.5)
        .setDepth(100);
    };

    const nextQuestion = function () {
      currentQuestionIndex++;
      if (currentQuestionIndex >= quest.questions.length) {
        startBossFight.call(this);
      } else {
        startQuizMiniGame.call(this);
      }
    };

    const startBossFight = function () {
      gameState = 'boss';
      stopQuizBgm.call(this);
      this.physics.world.gravity.y = 600;
      const selectedBossVariant = pickRandomBossVariant();

      bossFightManager = new BossFightManager(this, {
        quest,
        character,
        playerHP,
        maxPlayerHP,
        bossMaxHP,
        playerAttackMultiplier: equipmentStats.attackMultiplier,
        playerBaseAttackScale: questionCount,
        playerDamageReduction: equipmentStats.damageReduction,
        playerSpeedMultiplier: equipmentStats.speedMultiplier,
        bossVariant: selectedBossVariant,
        onComplete: (result) => {
          playerHP = result.playerHP;
          completeQuest.call(this, result.victory);
        },
      });

      bossFightManager.start();
    };

    const preloadQuestScene = function () {
      Warrior.preload(this);
      Mage.preload(this);
      Archer.preload(this);
      Witch.preload(this);
      Boss.preload(this);
      FireBoss.preload(this);
      ForrestBoss.preload(this);

      this.load.spritesheet(QUEST_MASTER_CONFIG.textureKey, QUEST_MASTER_CONFIG.spriteSheetPath, {
        frameWidth: QUEST_MASTER_CONFIG.frameWidth,
        frameHeight: QUEST_MASTER_CONFIG.frameHeight,
      });

      this.load.spritesheet('dark_thing', 'assets/sprites/quiz_monsters/dark_thing.png', {
        frameWidth: 32,
        frameHeight: 32,
      });

      this.load.tilemapTiledJSON('qmap1', 'assets/maps/qmap1.json');
      this.load.tilemapTiledJSON('qmap2', 'assets/maps/qmap2.json');
      this.load.tilemapTiledJSON('qmap3', 'assets/maps/qmap3.json');
      this.load.tilemapTiledJSON('bmap1', 'assets/maps/bmap1.json');
      this.load.tilemapTiledJSON('bmap2', 'assets/maps/bmap2.json');
      this.load.tilemapTiledJSON('bmap3', 'assets/maps/bmap3.json');
      this.load.image('bwtiles1', 'assets/maps/tiles/bwtiles1.png');
      this.load.image('extra', 'assets/maps/tiles/extra.png');
      this.load.image('tree', 'assets/maps/tiles/tree.png');
      this.load.image('door', 'assets/maps/tiles/door.png');
      this.load.image('bg2', 'assets/maps/tiles/bg2.png');
      this.load.image('extra2', 'assets/maps/tiles/extra2.png');
      this.load.image('lava_pixel', 'assets/maps/tiles/lava_pixel.png');
      this.load.image('forest', 'assets/maps/tiles/forest.png');
      this.load.image('qmap_background', 'assets/maps/tiles/background.png');
      this.load.image('boss_healthbar_background', 'assets/sprites/healthbar/boss-healthbar_background.png');
      this.load.image('boss_healthbar_fill', 'assets/sprites/healthbar/boss-healthbar.png');
      this.load.image('boss_healthbar_icon', 'assets/sprites/healthbar/boss-healthbar_Icon.png');
      this.load.spritesheet(DOOR_SUMMON_IDLE_SHEET_KEY, 'assets/sprites/summon/blue_doom_idle-Sheet.png', {
        frameWidth: 512,
        frameHeight: 512,
      });
      this.load.audio(QUIZ_BGM_KEY, 'assets/sounds/quiz_bgm.mp3');
      this.load.audio('boss_fight_bgm', 'assets/sounds/boss_fight.mp3');
      this.load.audio('male_hurt', 'assets/sounds/male_hurt.mp3');
      this.load.audio('correct', 'assets/sounds/correct.mp3');
      this.load.audio('incorrect', 'assets/sounds/incorrect.mp3');
      this.load.audio('victory', 'assets/sounds/victory.mp3');
      this.load.audio('defeat', 'assets/sounds/defeat.mp3');
      this.load.audio('touch_qm', 'assets/sounds/touch_qm.mp3');
      this.load.audio('qm_speak', 'assets/sounds/qm_speak.mp3');

      this.load.tilemapTiledJSON('map1', 'assets/maps/map1.json');
    };

    const createQuestScene = function () {
      setIsLoading(false);

      this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
        clearDoorSummonFx.call(this);
        destroyQuizBgm.call(this);
      });
      this.events.once(Phaser.Scenes.Events.DESTROY, () => {
        clearDoorSummonFx.call(this);
        destroyQuizBgm.call(this);
      });

      Warrior.createAnimations(this);
      Mage.createAnimations(this);
      Archer.createAnimations(this);
      Witch.createAnimations(this);
      Boss.createAnimations(this);
      FireBoss.createAnimations(this);
      ForrestBoss.createAnimations(this);

      if (!this.anims.exists(QUEST_MASTER_CONFIG.animationKey)) {
        const qmTexture = this.textures.get(QUEST_MASTER_CONFIG.textureKey);
        const qmFrameTotal = qmTexture?.frameTotal || 0;
        if (qmFrameTotal > 1) {
          let start = QUEST_MASTER_CONFIG.animationStart;
          let end = Math.min(QUEST_MASTER_CONFIG.animationEnd, qmFrameTotal - 1);

          if (QUEST_MASTER_CONFIG.useAutoFrameRange) {
            start = 0;
            end = qmFrameTotal - 1;
          } else if (start >= end) {
            // Fallback if configured range is invalid for the new sprite sheet.
            start = 0;
            end = qmFrameTotal - 1;
          }

          this.anims.create({
            key: QUEST_MASTER_CONFIG.animationKey,
            frames: this.anims.generateFrameNumbers(QUEST_MASTER_CONFIG.textureKey, {
              start,
              end,
            }),
            frameRate: QUEST_MASTER_CONFIG.animationFrameRate,
            repeat: -1,
          });
        } else {
          console.warn(
            `Quest Master animation not created. frameTotal=${qmFrameTotal}. ` +
            `Check QUEST_MASTER_CONFIG.frameWidth/frameHeight for ${QUEST_MASTER_CONFIG.textureKey}.`
          );
        }
      }

      if (!this.anims.exists('dark_thing_row1_anim')) {
        this.anims.create({
          key: 'dark_thing_row1_anim',
          frames: this.anims.generateFrameNumbers('dark_thing', { start: 0, end: 2 }),
          frameRate: 6,
          repeat: -1,
        });
      }


      if (!this.anims.exists(DOOR_SUMMON_IDLE_ANIM_KEY)) {
        const idleTexture = this.textures.get(DOOR_SUMMON_IDLE_SHEET_KEY);
        const idleFrames = Math.max(1, idleTexture?.frameTotal || 1);
        this.anims.create({
          key: DOOR_SUMMON_IDLE_ANIM_KEY,
          frames: this.anims.generateFrameNumbers(DOOR_SUMMON_IDLE_SHEET_KEY, {
            start: 0,
            end: idleFrames - 1,
          }),
          frameRate: 16,
          repeat: -1,
        });
      }

      this.time.addEvent({
        delay: 1000,
        callback: () => {
          timeRemaining--;
          if (timerText) {
            timerText.setText(`Time: ${formatTime(timeRemaining)}`);
          }
          if (timeRemaining <= 0) completeQuest.call(this, false);
        },
        loop: true,
      });

      showIntroDialogue.call(this);
    };

    const updateQuestScene = function (time, delta) {
      if (gameState === 'quiz') {
        if (quizPlayerCharacter) {
          quizPlayerCharacter.update();
        }

        updateQuizPlayerCombat.call(this);

        if (!hasAnswered && quizPlayer && quizNPC) {
          const isOverlappingQuestMaster = this.physics.overlap(quizPlayer, quizNPC);
          if (isOverlappingQuestMaster) {
            if (!wasOverlappingQuestMaster) {
              playQuestMasterTouchSequence.call(this);
            }
            showQuestion.call(this);
          } else {
            hideQuestion.call(this);
          }
          wasOverlappingQuestMaster = isOverlappingQuestMaster;
        }

        if (quizNPC && quizNpcTitleText && quizNpcTitleText.active) {
          quizNpcTitleText.setPosition(quizNPC.x, quizNPC.y - QUEST_MASTER_CONFIG.titleOffsetY);
        }

        if (activeQuizArrows.length > 0) {
          activeQuizArrows = activeQuizArrows.filter((arrow) => {
            if (!arrow || !arrow.active) return false;
            const startX = Number(arrow.getData('startX')) || arrow.x;
            const traveled = Math.abs(arrow.x - startX);
            if (traveled > 900) {
              arrow.destroy();
              return false;
            }
            return true;
          });
        }

        if (activeQuizProjectiles.length > 0) {
          activeQuizProjectiles = activeQuizProjectiles.filter((projectile) => {
            if (!projectile || !projectile.active) return false;
            if (projectile.getData('state') === 'exploding') return true;
            const startX = Number(projectile.getData('startX')) || projectile.x;
            const traveled = Math.abs(projectile.x - startX);
            if (traveled > 860) {
              projectile.destroy();
              return false;
            }
            return true;
          });
        }

        if (showDebugHitboxes && debugGraphics) {
          debugGraphics.clear();

          if (quizPlayer && quizPlayer.body) {
            drawDebugBox(debugGraphics, quizPlayer, 0x00ff00);
          }
          if (quizNPC && quizNPC.body) {
            drawDebugBox(debugGraphics, quizNPC, 0x0000ff);
          }

          answerObjects.forEach((obj) => {
            if (obj.sprite && obj.sprite.active && obj.sprite.body) {
              drawDebugBox(debugGraphics, obj.sprite, 0xff0000);
            }
          });

          if (quizAttackHitbox && quizAttackHitbox.body && quizAttackHitbox.body.enable) {
            drawDebugBox(debugGraphics, quizAttackHitbox, 0x00ffff);
          }

          activeQuizArrows.forEach((arrow) => {
            if (arrow && arrow.active && arrow.body) {
              drawDebugBox(debugGraphics, arrow, 0x22d3ee);
            }
          });

          activeQuizProjectiles.forEach((projectile) => {
            if (projectile && projectile.active && projectile.body && projectile.body.enable) {
              drawDebugBox(debugGraphics, projectile, 0xa855f7);
            }
          });
        }
      }

      if (gameState === 'boss' && bossFightManager) {
        bossFightManager.update(time, delta);
      }
    };

    const completeQuest = function (victory) {
      gameState = 'complete';
      stopQuizBgm.call(this);
      this.children.removeAll(true);

      const bg = this.add.rectangle(640, 320, 1280, 640, 0x1a0d2e);
      bg.setDepth(-10);

      const resultBg = this.add.rectangle(640, 320, 900, 560, 0x2d1b4e, 1);
      resultBg.setStrokeStyle(4, 0xa78bfa);

      this.add
        .text(640, 120, victory ? 'VICTORY!' : 'Quest Failed!', {
          fontSize: '54px',
          color: victory ? '#10b981' : '#ef4444',
          fontFamily: 'monospace',
        })
        .setOrigin(0.5);

      this.add
        .text(640, 220, `Questions Answered: ${score}/${quest.questions.length}`, {
          fontSize: '32px',
          color: '#ffffff',
          fontFamily: 'monospace',
        })
        .setOrigin(0.5);

      this.add
        .text(640, 280, `Final HP: ${playerHP > 0 ? playerHP : 0}/${maxPlayerHP}`, {
          fontSize: '28px',
          color: '#fbbf24',
          fontFamily: 'monospace',
        })
        .setOrigin(0.5);

      const percentage = Math.round((score / quest.questions.length) * 100);
      this.add
        .text(640, 340, `Accuracy: ${percentage}%`, {
          fontSize: '28px',
          color: percentage >= 70 ? '#10b981' : '#f59e0b',
          fontFamily: 'monospace',
        })
        .setOrigin(0.5);

      if (victory) {
        const item = createBossRewardItem(character.class);
        if (item) {
          itemsEarned.push(item);
          const tierLabel = String(item.tier || item.rarity || 'rare').toUpperCase();

          this.add
            .text(640, 420, `Boss Dropped: ${item.icon} ${item.name} [${tierLabel}]`, {
              fontSize: '24px',
              color: TIER_COLORS[item.tier] || '#a78bfa',
              fontFamily: 'monospace',
            })
            .setOrigin(0.5);
        }
      }

      this.time.delayedCall(3000, () => {
        const bossVictoryBonusXp = victory ? 10 : 0;
        onQuestComplete(
          quest.id,
          score,
          quest.questions.length,
          timeRemaining,
          itemsEarned,
          bossVictoryBonusXp
        );
        if (phaserGameRef.current) {
          phaserGameRef.current.destroy(true);
          phaserGameRef.current = null;
        }
      });
    };

    const config = {
      type: Phaser.AUTO,
      parent: gameRef.current,
      width: 1280,
      height: 640,
      pixelArt: true,
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 600, x: 0 },
          debug: false,
          debugShowBody: false,
          debugShowStaticBody: false,
          debugShowVelocity: false,
        },
      },
      scene: {
        preload: function () {
          preloadQuestScene.call(this);
        },
        create: function () {
          createQuestScene.call(this);
        },
        update: function (time, delta) {
          updateQuestScene.call(this, time, delta);
        },
      },
      backgroundColor: '#1a0d2e',
    };

    phaserGameRef.current = new Phaser.Game(config);

    return () => {
      if (phaserGameRef.current) {
        phaserGameRef.current.destroy(true);
        phaserGameRef.current = null;
      }
    };
  }, [quest, character, equipment, onQuestComplete]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center p-4">
      <div className="mb-4 flex items-center gap-4">
        <button onClick={onBack} className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-all">
          Exit Quest
        </button>
        <h1 className="text-2xl text-amber-400">{quest.title}</h1>
      </div>

      <div ref={gameRef} className="border-4 border-purple-400 rounded-lg shadow-2xl" />

      {isLoading && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="text-white text-2xl">Loading quest...</div>
        </div>
      )}
    </div>
  );
}



