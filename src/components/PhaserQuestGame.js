import { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { BossFightManager } from './BossFightManager';
import { Warrior } from './characters/Warrior';
import { Mage } from './characters/Mage';
import { Archer } from './characters/Archer';
import { Necromancer } from './characters/Necromancer';
import { Boss } from './characters/Boss';

export default function PhaserQuestGame({ quest, character, onQuestComplete, onBack }) {
  const gameRef = useRef(null);
  const phaserGameRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!gameRef.current) return;

    if (phaserGameRef.current) {
      phaserGameRef.current.destroy(true);
      phaserGameRef.current = null;
    }

    // Quest game state
    let currentQuestionIndex = 0;
    let score = 0;
    let timeRemaining = quest.timeLimit || 300;
    let gameState = 'intro';
    let selectedAnswer = null;
    const maxPlayerHP = quest.questions.length * 100;
    let playerHP = 0;
    const bossMaxHP = quest.questions.length * 100;
    let itemsEarned = [];

    // UI elements
    let dialogueBox;
    let dialogueText;
    let questionText;
    let optionButtons = [];
    let timerText;

    // Boss fight manager
    let bossFightManager = null;

    const formatTime = (seconds) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const shuffleArray = (array) => {
      const arr = array.slice();
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
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
        `Then face the final BOSS!`,
        'Click to begin your quest...',
      ];

      let messageIndex = 0;

      dialogueText = this.add        .text(640, 600, messages[messageIndex], {
          fontSize: '18px',
          color: '#ffffff',
          fontFamily: 'monospace',
          align: 'center',
          wordWrap: { width: 950 },
        })
        .setOrigin(0.5);

      const continueText = this.add        .text(1150, 600, '▼', {
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
          showQuestion.call(this);
        }
      };

      this.input.once('pointerdown', advanceMessage);
    };

    const showQuestion = function () {
      gameState = 'question';

      const question = quest.questions[currentQuestionIndex];

      const questionBg = this.add.rectangle(640, 180, 1100, 180, 0x2d1b4e, 1);
      questionBg.setStrokeStyle(4, 0xa78bfa);

      questionText = this.add        .text(640, 140, `Question ${currentQuestionIndex + 1}/${quest.questions.length}`, {
          fontSize: '22px',
          color: '#fbbf24',
          fontFamily: 'monospace',
        })
        .setOrigin(0.5);

      const qText = this.add        .text(640, 195, question.question, {
          fontSize: '20px',
          color: '#ffffff',
          fontFamily: 'monospace',
          align: 'center',
          wordWrap: { width: 1050 },
        })
        .setOrigin(0.5);

      optionButtons = [];
      const optionsPerRow = 2;
      const buttonWidth = 500;
      const buttonHeight = 90;
      const startY = 340;
      const gapX = 40;
      const gapY = 25;

      const shuffledOptions = shuffleArray(
        question.options.map((text, originalIndex) => ({ text, originalIndex }))
      );

      shuffledOptions.forEach((opt, index) => {
        const row = Math.floor(index / optionsPerRow);
        const col = index % optionsPerRow;
        const x = col === 0 ? 390 : 890;
        const y = startY + row * (buttonHeight + gapY);

        const container = this.add.container(x, y);

        const button = this.add.rectangle(0, 0, buttonWidth, buttonHeight, 0x4c1d95, 1);
        button.setStrokeStyle(3, 0x7c3aed);
        button.setInteractive({ useHandCursor: true });

        const label = this.add        .text(0, 0, `${String.fromCharCode(65 + index)}. ${opt.text}`, {
            fontSize: '18px',
            color: '#ffffff',
            fontFamily: 'monospace',
            align: 'left',
            wordWrap: { width: buttonWidth - 50 },
          })
          .setOrigin(0.5);

        container.add([button, label]);
        optionButtons.push(container);

        button.on('pointerover', () => button.setFillStyle(0x6d28d9));
        button.on('pointerout', () => button.setFillStyle(0x4c1d95));

        button.on('pointerdown', () => {
          selectedAnswer = opt.originalIndex;
          button.setStrokeStyle(4, 0xfbbf24);

          optionButtons.forEach((btn) => btn.destroy());
          optionButtons = [];

          const isCorrect = opt.originalIndex === question.correctAnswer;
          if (isCorrect) {
            score += 1;
            playerHP += 100;
          }

          this.time.delayedCall(500, () => {
            questionBg.destroy();
            questionText.destroy();
            qText.destroy();
            showAnswerFeedback.call(this, isCorrect);
          });
        });
      });
    };

    const showAnswerFeedback = function (isCorrect) {
      const feedbackBg = this.add.rectangle(640, 360, 700, 250, 0x2d1b4e, 1);
      feedbackBg.setStrokeStyle(4, isCorrect ? 0x10b981 : 0xef4444);

      const message = isCorrect ? 'Correct! +100 HP' : 'Incorrect! No HP gained';
      const color = isCorrect ? '#10b981' : '#ef4444';

      const msgText = this.add        .text(640, 320, message, {
          fontSize: '36px',
          color,
          fontFamily: 'monospace',
        })
        .setOrigin(0.5);

      const hpText = this.add        .text(640, 410, `Player HP: ${playerHP}/${maxPlayerHP}`, {
          fontSize: '28px',
          color: '#ffffff',
          fontFamily: 'monospace',
        })
        .setOrigin(0.5);

      this.time.delayedCall(1500, () => {
        feedbackBg.destroy();
        msgText.destroy();
        hpText.destroy();
        nextQuestion.call(this);
      });
    };

    const nextQuestion = function () {
      currentQuestionIndex++;
      if (currentQuestionIndex >= quest.questions.length) startBossFight.call(this);
      else showQuestion.call(this);
    };

    const startBossFight = function () {
      gameState = 'boss';

      bossFightManager = new BossFightManager(this, {
        quest,
        character,
        playerHP,
        maxPlayerHP,
        bossMaxHP,
        onComplete: (result) => {
          playerHP = result.playerHP;
          completeQuest.call(this, result.victory);
        },
      });

      bossFightManager.start();
    };

    const preloadQuestScene = function () {
      // Preload character sprites
      Warrior.preload(this);
      Mage.preload(this);
      Archer.preload(this);
      Necromancer.preload(this);
      Boss.preload(this);

      // Tilemap
      this.load.tilemapTiledJSON('map1', 'assets/maps/map1.json');
      this.load.tilemapTiledJSON('bmap1', 'assets/maps/bmap1.json');
      this.load.image('bwtiles1', 'assets/maps/tiles/bwtiles1.png');
      this.load.image('door', 'assets/maps/tiles/door.png');
      this.load.image('bg2', 'assets/maps/tiles/bg2.png');
      this.load.image('tree', 'assets/maps/tiles/tree.png');
      this.load.image('extra', 'assets/maps/tiles/extra.png');
      this.load.image('extra2', 'assets/maps/tiles/extra2.png');
    };

    const createQuestScene = function () {
      setIsLoading(false);

      const bg = this.add.rectangle(640, 320, 1280, 640, 0x1a0d2e);
      bg.setDepth(-10);

      const stars = this.add.graphics();
      stars.fillStyle(0xffffff, 0.8);
      for (let i = 0; i < 100; i++) stars.fillRect(Math.random() * 1280, Math.random() * 640, 2, 2);

      timerText = this.add        .text(640, 40, `Time: ${formatTime(timeRemaining)}`, {
          fontSize: '28px',
          color: '#fbbf24',
          fontFamily: 'monospace',
        })
        .setOrigin(0.5);

      this.time.addEvent({
        delay: 1000,
        callback: () => {
          timeRemaining--;
          timerText.setText(`Time: ${formatTime(timeRemaining)}`);
          if (timeRemaining <= 0) completeQuest.call(this, false);
        },
        loop: true,
      });

      // Create animations
      Warrior.createAnimations(this);
      Mage.createAnimations(this);
      Archer.createAnimations(this);
      Necromancer.createAnimations(this);
      Boss.createAnimations(this);

      showIntroDialogue.call(this);
    };

    const updateQuestScene = function () {
      if (gameState === 'boss' && bossFightManager) {
        bossFightManager.update();
      }
    };

    const completeQuest = function (victory) {
      gameState = 'complete';
      this.children.removeAll(true);

      const bg = this.add.rectangle(640, 320, 1280, 640, 0x1a0d2e);
      bg.setDepth(-10);

      const resultBg = this.add.rectangle(640, 320, 900, 560, 0x2d1b4e, 1);
      resultBg.setStrokeStyle(4, 0xa78bfa);

      this.add        .text(640, 120, victory ? 'VICTORY!' : 'Quest Failed!', {
          fontSize: '54px',
          color: victory ? '#10b981' : '#ef4444',
          fontFamily: 'monospace',
        })
        .setOrigin(0.5);

      this.add        .text(640, 220, `Questions Answered: ${score}/${quest.questions.length}`, {
          fontSize: '32px',
          color: '#ffffff',
          fontFamily: 'monospace',
        })
        .setOrigin(0.5);

      this.add        .text(640, 280, `Final HP: ${playerHP > 0 ? playerHP : 0}/${maxPlayerHP}`, {
          fontSize: '28px',
          color: '#fbbf24',
          fontFamily: 'monospace',
        })
        .setOrigin(0.5);

      const percentage = Math.round((score / quest.questions.length) * 100);
      this.add        .text(640, 340, `Accuracy: ${percentage}%`, {
          fontSize: '28px',
          color: percentage >= 70 ? '#10b981' : '#f59e0b',
          fontFamily: 'monospace',
        })
        .setOrigin(0.5);

      if (victory) {
        const victoryItems = [
          { id: `item_${Date.now()}_1`, name: 'Legendary Sword', description: 'Legendary weapon', icon: '⚔️', rarity: 'epic' },
          { id: `item_${Date.now()}_2`, name: 'Dragon Scale Armor', description: 'Impenetrable armor', icon: '🛡️', rarity: 'epic' },
          { id: `item_${Date.now()}_3`, name: 'Crown of Wisdom', description: 'Grants knowledge', icon: '👑', rarity: 'legendary' },
        ];
        const item = victoryItems[Math.floor(Math.random() * victoryItems.length)];
        itemsEarned.push(item);

        this.add        .text(640, 420, `Boss Dropped: ${item.icon} ${item.name}!`, {
            fontSize: '24px',
            color: '#a78bfa',
            fontFamily: 'monospace',
          })
          .setOrigin(0.5);
      }

      this.time.delayedCall(3000, () => {
        onQuestComplete(quest.id, score, quest.questions.length, timeRemaining, itemsEarned);
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
          debug: true,
          debugShowBody: true,
          debugShowStaticBody: true,
          debugShowVelocity: true,
        },
      },
      scene: {
        preload: function () {
          preloadQuestScene.call(this);
        },
        create: function () {
          createQuestScene.call(this);
        },
        update: function () {
          updateQuestScene.call(this);
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
  }, [quest, character, onQuestComplete]);

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



