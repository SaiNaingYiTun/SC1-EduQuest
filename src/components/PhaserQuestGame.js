import { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { Character, Quest, Question, Item } from '../App';



export default function PhaserQuestGame({ quest, character, onQuestComplete, onBack }) {
  const gameRef = useRef<HTMLDivElement>(null);
  const phaserGameRef = useRef<Phaser.Game | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!gameRef.current) return;

    // Game configuration
    const config= {
      type: Phaser.AUTO,
      parent: gameRef.current,
      width: 800,
      height: 600,
      pixelArt: true,
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0, x: 0 },
          debug: false
        }
      },
      scene: {
        create: function() {
          createQuestScene.call(this);
        },
        update: function() {
          updateQuestScene.call(this);
        }
      },
      backgroundColor: '#1a0d2e'
    };

    // Quest game state
    let currentQuestionIndex = 0;
    let score = 0;
    let timeRemaining = quest.timeLimit || 300;
    let gameState = 'intro';
    let selectedAnswer = null;
    let combatPhase = 'attack';
    const maxHP = quest.questions.length * 100; // HP based on number of questions
    let playerHP = maxHP;
    let enemyHP = maxHP;
    let itemsEarned = [];
    // UI elements
    let dialogueBox;
    let dialogueText;
    let questionText;
    let optionButtons = [];
    let timerText;
    let player;
    let enemy;
    let hpBarPlayer;
    let hpBarEnemy;
    let combatText;
    const createQuestScene = function() {
      setIsLoading(false);

      // Background
      const bg = this.add.rectangle(400, 300, 800, 600, 0x1a0d2e);
      
      // Add pixel art style decorations
      const stars = this.add.graphics();
      stars.fillStyle(0xffffff, 0.8);
      for (let i = 0; i < 50; i++) {
        const x = Math.random() * 800;
        const y = Math.random() * 600;
        stars.fillRect(x, y, 2, 2);
      }

      // Timer
      timerText = this.add.text(400, 30, `Time: ${formatTime(timeRemaining)}`, {
        fontSize: '24px',
        color: '#fbbf24',
        fontFamily: 'monospace'
      }).setOrigin(0.5);

      // Start with intro dialogue
      showIntroDialogue.call(this);

      // Timer countdown
      this.time.addEvent({
        delay: 1000,
        callback: () => {
          timeRemaining--;
          timerText.setText(`Time: ${formatTime(timeRemaining)}`);
          
          if (timeRemaining <= 0) {
            completeQuest.call(this);
          }
        },
        loop: true
      });
    };

    const updateQuestScene = function() {
      // Game update logic
    };

    const formatTime = (seconds) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const showIntroDialogue = function() {
      gameState = 'intro';

      // Dialogue box
      dialogueBox = this.add.rectangle(400, 450, 750, 200, 0x2d1b4e, 1);
      dialogueBox.setStrokeStyle(4, 0xa78bfa);

      const messages = [
        `Welcome, brave ${character.class}!`,
        `You have entered: ${quest.title}`,
        `${quest.description}`,
        `Prepare to face ${quest.questions.length} challenges!`,
        'Click to begin your quest...'
      ];

      let messageIndex = 0;

      dialogueText = this.add.text(400, 450, messages[messageIndex], {
        fontSize: '20px',
        color: '#ffffff',
        fontFamily: 'monospace',
        align: 'center',
        wordWrap: { width: 700 }
      }).setOrigin(0.5);

      const continueText = this.add.text(700, 530, '▼', {
        fontSize: '24px',
        color: '#fbbf24'
      }).setOrigin(0.5);

      this.tweens.add({
        targets: continueText,
        y: 540,
        duration: 500,
        yoyo: true,
        repeat: -1
      });

      this.input.once('pointerdown', () => {
        messageIndex++;
        if (messageIndex < messages.length) {
          dialogueText.setText(messages[messageIndex]);
          this.input.once('pointerdown', () => {
            messageIndex++;
            if (messageIndex < messages.length) {
              dialogueText.setText(messages[messageIndex]);
              this.input.once('pointerdown', () => {
                messageIndex++;
                if (messageIndex < messages.length) {
                  dialogueText.setText(messages[messageIndex]);
                  this.input.once('pointerdown', () => {
                    dialogueBox.destroy();
                    dialogueText.destroy();
                    continueText.destroy();
                    showQuestion.call(this);
                  });
                }
              });
            }
          });
        }
      });
    };

    const showQuestion = function() {
      gameState = 'question';
      
      const question = quest.questions[currentQuestionIndex];
      
      // Question background
      const questionBg = this.add.rectangle(400, 150, 750, 150, 0x2d1b4e, 1);
      questionBg.setStrokeStyle(4, 0xa78bfa);

      // Question text
      questionText = this.add.text(400, 120, `Question ${currentQuestionIndex + 1}/${quest.questions.length}`, {
        fontSize: '20px',
        color: '#fbbf24',
        fontFamily: 'monospace'
      }).setOrigin(0.5);

      const qText = this.add.text(400, 165, question.question, {
        fontSize: '18px',
        color: '#ffffff',
        fontFamily: 'monospace',
        align: 'center',
        wordWrap: { width: 700 }
      }).setOrigin(0.5);

      // Answer options
      optionButtons = [];
      const optionsPerRow = 2;
      const buttonWidth = 350;
      const buttonHeight = 80;
      const startY = 280;
      const gap = 20;

      question.options.forEach((option, index) => {
        const row = Math.floor(index / optionsPerRow);
        const col = index % optionsPerRow;
        const x = col === 0 ? 210 : 590;
        const y = startY + row * (buttonHeight + gap);

        const container = this.add.container(x, y);
        
        const button = this.add.rectangle(0, 0, buttonWidth, buttonHeight, 0x4c1d95, 1);
        button.setStrokeStyle(3, 0x7c3aed);
        button.setInteractive({ useHandCursor: true });

        const label = this.add.text(0, 0, `${String.fromCharCode(65 + index)}. ${option}`, {
          fontSize: '16px',
          color: '#ffffff',
          fontFamily: 'monospace',
          align: 'left',
          wordWrap: { width: buttonWidth - 40 }
        }).setOrigin(0.5);

        container.add([button, label]);
        optionButtons.push(container);

        button.on('pointerover', () => {
          button.setFillStyle(0x6d28d9);
        });

        button.on('pointerout', () => {
          button.setFillStyle(0x4c1d95);
        });

        button.on('pointerdown', () => {
          selectedAnswer = index;
          button.setStrokeStyle(4, 0xfbbf24);
          
          // Disable all buttons
          optionButtons.forEach(btn => btn.removeAll(true));
          optionButtons = [];
          
          this.time.delayedCall(500, () => {
            questionBg.destroy();
            questionText.destroy();
            qText.destroy();
            startCombat.call(this, index === question.correctAnswer);
          });
        });
      });
    };

    const startCombat = function(isCorrect) {
      gameState = 'combat';
      combatPhase = 'attack';

      // Create player character based on class
      const playerY = 450;
      player = this.add.sprite(150, playerY, '').setOrigin(0.5);
      
      // Create pixel art character based on class with weapons
      const playerGraphics = this.add.graphics();
      let playerColor = 0x3b82f6; // Default blue
      
      switch (character.class) {
        case 'Warrior':
          playerColor = 0xef4444; // Red
          // Draw warrior
          playerGraphics.fillStyle(playerColor, 1);
          playerGraphics.fillRect(140, 420, 20, 40); // Body
          playerGraphics.fillRect(135, 410, 30, 15); // Head
          // Draw arms
          playerGraphics.fillStyle(0xfbbf24, 1);
          playerGraphics.fillRect(130, 430, 10, 20); // Left arm
          playerGraphics.fillRect(160, 430, 10, 20); // Right arm
          // Draw long sword
          playerGraphics.fillStyle(0x71717a, 1); // Gray for blade
          playerGraphics.fillRect(118, 425, 8, 30); // Sword blade
          playerGraphics.fillStyle(0x78350f, 1); // Brown for hilt
          playerGraphics.fillRect(120, 455, 4, 8); // Sword hilt
          break;
        case 'Mage':
          playerColor = 0x8b5cf6; // Purple
          playerGraphics.fillStyle(playerColor, 1);
          playerGraphics.fillRect(140, 420, 20, 40); // Body
          playerGraphics.fillRect(135, 410, 30, 15); // Head
          // Draw arms
          playerGraphics.fillStyle(0xfbbf24, 1);
          playerGraphics.fillRect(130, 430, 10, 20); // Left arm
          playerGraphics.fillRect(160, 430, 10, 20); // Right arm
          // Draw magic staff
          playerGraphics.fillStyle(0x78350f, 1); // Brown staff
          playerGraphics.fillRect(122, 430, 4, 35); // Staff pole
          playerGraphics.fillStyle(0xa78bfa, 1); // Purple crystal
          playerGraphics.fillCircle(124, 428, 6); // Staff crystal
          playerGraphics.fillStyle(0xfbbf24, 1); // Gold glow
          playerGraphics.fillCircle(124, 428, 3); // Inner glow
          break;
        case 'Rogue':
          playerColor = 0x10b981; // Green
          playerGraphics.fillStyle(playerColor, 1);
          playerGraphics.fillRect(140, 420, 20, 40); // Body
          playerGraphics.fillRect(135, 410, 30, 15); // Head
          // Draw arms
          playerGraphics.fillStyle(0xfbbf24, 1);
          playerGraphics.fillRect(130, 430, 10, 20); // Left arm
          playerGraphics.fillRect(160, 430, 10, 20); // Right arm
          // Draw dagger
          playerGraphics.fillStyle(0x6b7280, 1); // Gray blade
          playerGraphics.fillRect(125, 435, 3, 15); // Dagger blade
          playerGraphics.fillStyle(0x78350f, 1); // Brown hilt
          playerGraphics.fillRect(124, 450, 5, 4); // Dagger hilt
          break;
        case 'Cleric':
          playerColor = 0xfbbf24; // Gold
          playerGraphics.fillStyle(playerColor, 1);
          playerGraphics.fillRect(140, 420, 20, 40); // Body
          playerGraphics.fillRect(135, 410, 30, 15); // Head
          // Draw arms
          playerGraphics.fillStyle(0xf59e0b, 1);
          playerGraphics.fillRect(130, 430, 10, 20); // Left arm
          playerGraphics.fillRect(160, 430, 10, 20); // Right arm
          // Draw grimoire (magic book)
          playerGraphics.fillStyle(0x78350f, 1); // Brown book cover
          playerGraphics.fillRect(118, 440, 14, 16); // Book
          playerGraphics.fillStyle(0xfef3c7, 1); // Light yellow pages
          playerGraphics.fillRect(119, 441, 12, 14); // Pages
          playerGraphics.fillStyle(0xa78bfa, 1); // Purple rune
          playerGraphics.fillCircle(125, 448, 3); // Magic rune on book
          break;
        default:
          playerGraphics.fillStyle(playerColor, 1);
          playerGraphics.fillRect(140, 420, 20, 40); // Body
          playerGraphics.fillRect(135, 410, 30, 15); // Head
          break;
      }

      // Create enemy
      enemy = this.add.sprite(650, 450, '').setOrigin(0.5);
      const enemyGraphics = this.add.graphics();
      enemyGraphics.fillStyle(0x7f1d1d, 1);
      enemyGraphics.fillRect(640, 420, 20, 40); // Body
      enemyGraphics.fillRect(635, 410, 30, 15); // Head
      enemyGraphics.fillRect(630, 430, 10, 20); // Left arm
      enemyGraphics.fillRect(660, 430, 10, 20); // Right arm

      // HP bars
      hpBarPlayer = this.add.graphics();
      hpBarEnemy = this.add.graphics();
      updateHPBars();

      // Combat text
      combatText = this.add.text(400, 250, '', {
        fontSize: '24px',
        color: '#fbbf24',
        fontFamily: 'monospace',
        align: 'center'
      }).setOrigin(0.5);

      if (isCorrect) {
        performPlayerAttack.call(this);
      } else {
        combatText.setText('Incorrect! Enemy strikes first!');
        this.time.delayedCall(1000, () => {
          performEnemyAttack.call(this);
        });
      }
    };

    const updateHPBars = function() {
      // Player HP bar
      hpBarPlayer.clear();
      hpBarPlayer.fillStyle(0x1f2937, 1);
      hpBarPlayer.fillRect(50, 480, 200, 20);
      const playerHPPercent = (playerHP / maxHP) * 100;
      hpBarPlayer.fillStyle(playerHPPercent > 50 ? 0x10b981 : playerHPPercent > 25 ? 0xf59e0b : 0xef4444, 1);
      hpBarPlayer.fillRect(52, 482, (playerHP / maxHP) * 196, 16);
      
      const playerHPText = this.add.text(150, 490, `HP: ${playerHP}`, {
        fontSize: '14px',
        color: '#ffffff',
        fontFamily: 'monospace'
      }).setOrigin(0.5);

      // Enemy HP bar
      hpBarEnemy.clear();
      hpBarEnemy.fillStyle(0x1f2937, 1);
      hpBarEnemy.fillRect(550, 480, 200, 20);
      const enemyHPPercent = (enemyHP / maxHP) * 100;
      hpBarEnemy.fillStyle(enemyHPPercent > 50 ? 0x10b981 : enemyHPPercent > 25 ? 0xf59e0b : 0xef4444, 1);
      hpBarEnemy.fillRect(552, 482, (enemyHP / maxHP) * 196, 16);
      
      const enemyHPText = this.add.text(650, 490, `HP: ${enemyHP}`, {
        fontSize: '14px',
        color: '#ffffff',
        fontFamily: 'monospace'
      }).setOrigin(0.5);
    };

    const performPlayerAttack = function() {
      const damage = 100; // Fixed damage for all classes
      let attackName = '';

      switch (character.class) {
        case 'Warrior':
          attackName = 'Sword Slash';
          break;
        case 'Mage':
          attackName = 'Fireball';
          break;
        case 'Rogue':
          attackName = 'Backstab';
          break;
        case 'Cleric':
          attackName = 'Holy Strike';
          break;
        default:
          attackName = 'Attack';
          break;
      }

      combatText.setText(`${attackName}! -${damage} HP`);
      
      // Animate attack
      this.tweens.add({
        targets: player,
        x: 400,
        duration: 200,
        yoyo: true,
        onComplete: () => {
          enemyHP -= damage;
          updateHPBars.call(this);

          if (enemyHP <= 0) {
            victorySequence.call(this);
          } else {
            this.time.delayedCall(1000, () => {
              performEnemyAttack.call(this);
            });
          }
        }
      });
    };

    const performEnemyAttack = function() {
      const damage = 100; // Fixed damage
      combatText.setText(`Enemy attacks! -${damage} HP`);

      this.tweens.add({
        targets: enemy,
        x: 400,
        duration: 200,
        yoyo: true,
        onComplete: () => {
          playerHP -= damage;
          updateHPBars.call(this);

          if (playerHP <= 0) {
            // Game over, move to next question anyway
            this.time.delayedCall(1000, () => {
              cleanupCombat.call(this);
              nextQuestion.call(this);
            });
          } else {
            this.time.delayedCall(1000, () => {
              cleanupCombat.call(this);
              nextQuestion.call(this);
            });
          }
        }
      });
    };

    const victorySequence = function() {
      combatText.setText('Victory! Correct answer!');
      score++;

      // Earn random item
      const items = [
        { id: `item_${Date.now()}_1`, name: 'Health Potion', description: 'Restores 50 HP', icon: '🧪', rarity: 'common' },
        { id: `item_${Date.now()}_2`, name: 'Mana Crystal', description: 'Restores 30 Mana', icon: '💎', rarity: 'rare' },
        { id: `item_${Date.now()}_3`, name: 'Ancient Scroll', description: 'Contains ancient knowledge', icon: '📜', rarity: 'epic' },
        { id: `item_${Date.now()}_4`, name: 'Golden Coin', description: 'Worth 100 gold', icon: '🪙', rarity: 'common' }
      ];
      
      const earnedItem = items[Math.floor(Math.random() * items.length)];
      itemsEarned.push(earnedItem);

      this.time.delayedCall(1500, () => {
        combatText.setText(`Item earned: ${earnedItem.icon} ${earnedItem.name}!`);
        
        this.time.delayedCall(1500, () => {
          cleanupCombat.call(this);
          nextQuestion.call(this);
        });
      });
    };

    const cleanupCombat = function() {
      if (player) player.destroy();
      if (enemy) enemy.destroy();
      if (hpBarPlayer) hpBarPlayer.clear();
      if (hpBarEnemy) hpBarEnemy.clear();
      if (combatText) combatText.destroy();
      
      // Reset for next combat
      playerHP = maxHP;
      enemyHP = maxHP;
    };

    const nextQuestion = function() {
      currentQuestionIndex++;
      
      if (currentQuestionIndex >= quest.questions.length) {
        completeQuest.call(this);
      } else {
        showQuestion.call(this);
      }
    };

    const completeQuest = function() {
      gameState = 'complete';

      // Clear screen
      this.children.removeAll(true);

      // Show results
      const resultBg = this.add.rectangle(400, 300, 700, 500, 0x2d1b4e, 1);
      resultBg.setStrokeStyle(4, 0xa78bfa);

      this.add.text(400, 150, 'Quest Complete!', {
        fontSize: '48px',
        color: '#fbbf24',
        fontFamily: 'monospace'
      }).setOrigin(0.5);

      this.add.text(400, 230, `Score: ${score}/${quest.questions.length}`, {
        fontSize: '32px',
        color: '#ffffff',
        fontFamily: 'monospace'
      }).setOrigin(0.5);

      const percentage = Math.round((score / quest.questions.length) * 100);
      this.add.text(400, 280, `${percentage}%`, {
        fontSize: '32px',
        color: percentage >= 70 ? '#10b981' : '#f59e0b',
        fontFamily: 'monospace'
      }).setOrigin(0.5);

      this.add.text(400, 330, `Items Earned: ${itemsEarned.length}`, {
        fontSize: '24px',
        color: '#ffffff',
        fontFamily: 'monospace'
      }).setOrigin(0.5);

      itemsEarned.forEach((item, idx) => {
        this.add.text(400, 370 + idx * 30, `${item.icon} ${item.name}`, {
          fontSize: '18px',
          color: '#a78bfa',
          fontFamily: 'monospace'
        }).setOrigin(0.5);
      });

      this.time.delayedCall(3000, () => {
        onQuestComplete(quest.id, score, quest.questions.length, timeRemaining, itemsEarned);
        if (phaserGameRef.current) {
          phaserGameRef.current.destroy(true);
          phaserGameRef.current = null;
        }
      });
    };

    // Initialize Phaser game
    phaserGameRef.current = new Phaser.Game(config);

    // Cleanup
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
        <button
          onClick={onBack}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-all"
        >
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