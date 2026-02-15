import { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { BossFightManager } from './BossFightManager';
import { Warrior } from './characters/Warrior';
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

    // Quiz mini-game state
    let quizPlayer = null;
    let quizNPC = null;
    let answerObjects = [];
    let questionTextObj = null;
    let answerTextObjs = [];
    let currentQuestion = null;
    let hasAnswered = false;
    let questionShown = false;
    let cursors = null;
    let promptText = null;

    // UI elements
    let dialogueBox;
    let dialogueText;
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
        `Move with WASD keys. Talk to NPC to get the question!`,
        `Then collide with the correct answer letter!`,
        `Finally face the BOSS!`,
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
        .text(1150, 680, '▼', {
          fontSize: '24px',
          color: '#fbbf24',
        })
        .setOrigin(0.5);

      this.tweens.add({
        targets: continueText,
        y: 690,
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

    const startQuizMiniGame = function () {
      gameState = 'quiz';
      hasAnswered = false;
      questionShown = false;

      // Clear scene
      this.children.removeAll(true);

      // ✅ Disable gravity for quiz phase
      this.physics.world.gravity.y = 0;

      // Create tilemap
      const map = this.make.tilemap({ key: 'map0' });
      const tileset = map.addTilesetImage('quiz_tiles', 'quiz_tiles');
      const groundLayer = map.createLayer('simple_ground', tileset, 0, 0);
      groundLayer.setDepth(-5);

      // Set collision for ground tiles
      groundLayer.setCollision([10, 11, 22, 34, 35, 36]);

      this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

      // Background
      const bg = this.add.rectangle(640, 360, 1280, 736, 0x1a0d2e);
      bg.setDepth(-10);

      // Timer
      timerText = this.add
        .text(640, 40, `Time: ${formatTime(timeRemaining)}`, {
          fontSize: '28px',
          color: '#fbbf24',
          fontFamily: 'monospace',
        })
        .setOrigin(0.5)
        .setDepth(100);

      // Question counter
      this.add
        .text(100, 40, `Question ${currentQuestionIndex + 1}/${quest.questions.length}`, {
          fontSize: '24px',
          color: '#ffffff',
          fontFamily: 'monospace',
        })
        .setOrigin(0, 0.5)
        .setDepth(100);

      // Get objects from map (answer positions)
      const objectLayer = map.getObjectLayer('objects');
      const answerPositions = objectLayer.objects.map(obj => ({ x: obj.x, y: obj.y }));

      console.log('Found answer positions:', answerPositions);

      // Create quiz NPC
      quizNPC = this.physics.add.sprite(640, 300, 'warrior_idle');
      quizNPC.setScale(2);
      quizNPC.setTint(0x00ffff);
      quizNPC.body.setImmovable(true);
      quizNPC.body.setAllowGravity(false);
      quizNPC.body.setSize(40, 40);
      quizNPC.body.setOffset(48, 50);
      quizNPC.setDepth(5);

      // Add NPC name label
      this.add
        .text(640, 250, 'Quest Master', {
          fontSize: '20px',
          color: '#fbbf24',
          fontFamily: 'monospace',
          fontStyle: 'bold',
        })
        .setOrigin(0.5)
        .setDepth(6);

      // Create player character with 4-directional movement
      const playerStartX = 100;
      const playerStartY = 360;
      
      quizPlayer = this.physics.add.sprite(playerStartX, playerStartY, 'warrior_idle');
      quizPlayer.setScale(2);
      quizPlayer.setDepth(5);
      quizPlayer.body.setAllowGravity(false);
      quizPlayer.body.setCollideWorldBounds(true);
      quizPlayer.body.setSize(40, 40);
      quizPlayer.body.setOffset(48, 50);

      // Add collision with tilemap
      this.physics.add.collider(quizPlayer, groundLayer);

      // Setup WASD controls
      cursors = {
        up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      };

      // Play idle animation
      if (this.anims.exists('warrior_idle_anim')) {
        quizPlayer.play('warrior_idle_anim');
        quizNPC.play('warrior_idle_anim');
      }

      // Add NPC collision/overlap to show question
      this.physics.add.overlap(
        quizPlayer,
        quizNPC,
        () => showQuestion.call(this),
        null,
        this
      );

      // Get current question
      currentQuestion = quest.questions[currentQuestionIndex];

      // Shuffle options and assign to map objects
      const shuffledOptions = shuffleArray(
        currentQuestion.options.map((text, originalIndex) => ({ text, originalIndex }))
      );

      // Create answer objects at map positions (only show letters)
      answerObjects = [];

      shuffledOptions.forEach((opt, index) => {
        if (index >= answerPositions.length) return;

        const pos = answerPositions[index];
        const x = pos.x;
        const y = pos.y;

        // Create container for answer
        const container = this.add.container(x, y);

        // Answer box
        const box = this.add.rectangle(0, 0, 120, 120, 0x4c1d95, 1);
        box.setStrokeStyle(4, 0x7c3aed);

        // Letter label (only show the letter)
        const letter = this.add
          .text(0, 0, String.fromCharCode(65 + index), {
            fontSize: '64px',
            color: '#fbbf24',
            fontFamily: 'monospace',
            fontStyle: 'bold',
          })
          .setOrigin(0.5);

        container.add([box, letter]);
        container.setDepth(10);

        // Create physics body for collision
        const collisionZone = this.add.rectangle(x, y, 120, 120);
        this.physics.add.existing(collisionZone, true);

        // Store answer data
        answerObjects.push({
          container,
          collisionZone,
          isCorrect: opt.originalIndex === currentQuestion.correctAnswer,
          index: index,
          box,
          letter: String.fromCharCode(65 + index),
          answerText: opt.text,
        });

        // Add overlap detection (only works after question is shown)
        this.physics.add.overlap(
          quizPlayer,
          collisionZone,
          () => handleAnswerCollision.call(this, answerObjects.find(obj => obj.collisionZone === collisionZone)),
          null,
          this
        );
      });

      // Add instructions
      promptText = this.add
        .text(640, 680, '💬 Move to the Quest Master to receive your question!', {
          fontSize: '20px',
          color: '#10b981',
          fontFamily: 'monospace',
        })
        .setOrigin(0.5)
        .setDepth(100);
    };

    const showQuestion = function () {
      if (questionShown || hasAnswered) return;

      questionShown = true;

      // Update prompt
      if (promptText) {
        promptText.setText('📝 Question revealed! Collide with the correct answer letter!');
      }

      // Display question
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

      // Display answer options with letters
      answerTextObjs = [];
      const startY = 200;
      const lineHeight = 35;

      answerObjects.forEach((answerObj, index) => {
        const answerText = this.add
          .text(100, startY + index * lineHeight, `${answerObj.letter}. ${answerObj.answerText}`, {
            fontSize: '18px',
            color: '#ffffff',
            fontFamily: 'monospace',
            backgroundColor: '#1a0d2e',
            padding: { x: 10, y: 5 },
          })
          .setDepth(100);

        answerTextObjs.push(answerText);
      });
    };

    const handleAnswerCollision = function (answerObj) {
      if (hasAnswered || gameState !== 'quiz' || !answerObj || !questionShown) return;

      hasAnswered = true;

      // Highlight selected answer
      answerObj.box.setStrokeStyle(6, 0xfbbf24);

      // Freeze player
      if (quizPlayer) {
        quizPlayer.body.setVelocity(0, 0);
      }

      // Check if correct
      const isCorrect = answerObj.isCorrect;

      if (isCorrect) {
        score += 1;
        playerHP += 100;
        answerObj.box.setFillStyle(0x10b981);

        // Flash effect
        this.tweens.add({
          targets: answerObj.container,
          scaleX: 1.2,
          scaleY: 1.2,
          duration: 200,
          yoyo: true,
        });
      } else {
        answerObj.box.setFillStyle(0xef4444);

        // Shake effect
        this.tweens.add({
          targets: answerObj.container,
          x: answerObj.container.x - 10,
          duration: 50,
          yoyo: true,
          repeat: 5,
        });

        // Show correct answer
        answerObjects.forEach((obj) => {
          if (obj.isCorrect) {
            obj.box.setFillStyle(0x10b981);
            obj.box.setStrokeStyle(6, 0x22c55e);
          }
        });
      }

      // Highlight the selected answer in the text list
      answerTextObjs.forEach((textObj, idx) => {
        if (idx === answerObj.index) {
          textObj.setBackgroundColor(isCorrect ? '#10b981' : '#ef4444');
        }
        if (answerObjects[idx].isCorrect) {
          textObj.setBackgroundColor('#10b981');
        }
      });

      // Show feedback
      const feedbackText = this.add
        .text(640, 400, isCorrect ? '✓ CORRECT! +100 HP' : '✗ INCORRECT!', {
          fontSize: '48px',
          color: isCorrect ? '#10b981' : '#ef4444',
          fontFamily: 'monospace',
          fontStyle: 'bold',
        })
        .setOrigin(0.5)
        .setDepth(200);

      this.tweens.add({
        targets: feedbackText,
        alpha: 0,
        duration: 1500,
        delay: 1000,
      });

      // Move to next question
      this.time.delayedCall(2500, () => {
        feedbackText.destroy();
        nextQuestion.call(this);
      });
    };

    const updateQuizPlayerMovement = function () {
      if (!quizPlayer || hasAnswered || gameState !== 'quiz') return;

      const speed = 200;

      // Reset velocity
      quizPlayer.body.setVelocity(0);

      // Horizontal movement
      if (cursors.left.isDown) {
        quizPlayer.body.setVelocityX(-speed);
        quizPlayer.setFlipX(true);
        if (this.anims.exists('warrior_run_anim')) {
          quizPlayer.play('warrior_run_anim', true);
        }
      } else if (cursors.right.isDown) {
        quizPlayer.body.setVelocityX(speed);
        quizPlayer.setFlipX(false);
        if (this.anims.exists('warrior_run_anim')) {
          quizPlayer.play('warrior_run_anim', true);
        }
      }

      // Vertical movement
      if (cursors.up.isDown) {
        quizPlayer.body.setVelocityY(-speed);
        if (this.anims.exists('warrior_run_anim') && !cursors.left.isDown && !cursors.right.isDown) {
          quizPlayer.play('warrior_run_anim', true);
        }
      } else if (cursors.down.isDown) {
        quizPlayer.body.setVelocityY(speed);
        if (this.anims.exists('warrior_run_anim') && !cursors.left.isDown && !cursors.right.isDown) {
          quizPlayer.play('warrior_run_anim', true);
        }
      }

      // Idle animation
      if (!cursors.left.isDown && !cursors.right.isDown && !cursors.up.isDown && !cursors.down.isDown) {
        if (this.anims.exists('warrior_idle_anim')) {
          quizPlayer.play('warrior_idle_anim', true);
        }
      }

      // Normalize diagonal movement
      if (quizPlayer.body.velocity.x !== 0 && quizPlayer.body.velocity.y !== 0) {
        quizPlayer.body.velocity.normalize().scale(speed);
      }
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

      // ✅ Re-enable gravity for boss fight
      this.physics.world.gravity.y = 600;

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
      console.log('=== PRELOAD START ===');

      // Preload character sprites
      Warrior.preload(this);
      Boss.preload(this);

      // Quiz tilemap
      this.load.tilemapTiledJSON('map0', 'assets/maps/map0.json');
      this.load.image('quiz_tiles', 'assets/maps/tiles/quiz_tiles.png');

      // Boss fight tilemap
      this.load.tilemapTiledJSON('map1', 'assets/maps/map1.json');
      this.load.image('bwtiles1', 'assets/maps/tiles/bwtiles1.png');

      console.log('=== PRELOAD QUEUED ===');
    };

    const createQuestScene = function () {
      console.log('=== CREATE START ===');

      setIsLoading(false);

      // Create animations
      console.log('Creating animations...');
      Warrior.createAnimations(this);
      Boss.createAnimations(this);
      console.log('Animations created');

      // Start timer
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

    const updateQuestScene = function () {
      if (gameState === 'quiz') {
        updateQuizPlayerMovement.call(this);
      }

      if (gameState === 'boss' && bossFightManager) {
        bossFightManager.update();
      }
    };

    const completeQuest = function (victory) {
      gameState = 'complete';
      this.children.removeAll(true);

      const bg = this.add.rectangle(640, 360, 1280, 720, 0x1a0d2e);
      bg.setDepth(-10);

      const resultBg = this.add.rectangle(640, 360, 900, 600, 0x2d1b4e, 1);
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
        const victoryItems = [
          { id: `item_${Date.now()}_1`, name: 'Legendary Sword', description: 'Legendary weapon', icon: '⚔️', rarity: 'epic' },
          { id: `item_${Date.now()}_2`, name: 'Dragon Scale Armor', description: 'Impenetrable armor', icon: '🛡️', rarity: 'epic' },
          { id: `item_${Date.now()}_3`, name: 'Crown of Wisdom', description: 'Grants knowledge', icon: '👑', rarity: 'legendary' },
        ];
        const item = victoryItems[Math.floor(Math.random() * victoryItems.length)];
        itemsEarned.push(item);

        this.add
          .text(640, 420, `Boss Dropped: ${item.icon} ${item.name}!`, {
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
      height: 736,
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