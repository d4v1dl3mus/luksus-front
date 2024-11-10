import { Component } from '@angular/core';

@Component({
  selector: 'app-game-board',
  templateUrl: './game-board.component.html',
  styleUrls: ['./game-board.component.scss']
})
export class GameBoardComponent {
  balance: number = 50000;
  betAmount: number = 5000;
  mineCount: number = 1;
  reward: number = 0;
  maxWin: number = 0;
  gameActive: boolean = false;
  revealedCells: Set<number> = new Set();
  cells: number[] = Array(25).fill(0);
  mines: number[] = [];
  waiting: boolean = false;

  multipliers1Mine: number[] = [1.03, 1.06, 1.09, 1.12, 1.15, 1.19, 1.23, 1.27, 1.31, 1.35, 1.40, 1.45, 1.50, 1.55, 1.61];
  multipliers3Mines: number[] = [1.14, 1.30, 1.49, 1.72, 1.98, 2.28, 2.63, 3.03, 3.48, 3.99, 4.56];
  multipliers5Mines: number[] = [1.19, 1.51, 1.93, 2.49, 3.27, 4.36, 5.88, 8.00, 10.98];
  multipliers7Mines: number[] = [1.27, 1.62, 2.12, 2.85, 3.92, 5.50, 7.95, 11.80];

  rewardMultipliers: number[] = this.multipliers1Mine;

  changeBet(amount: number) {
    if (this.gameActive) return;
    this.betAmount = Math.max(500, this.betAmount + amount);
  }

  changeMineCount(step: number) {
    const newCount = this.mineCount + step;
    if ([1, 3, 5, 7].includes(newCount)) {
      this.mineCount = newCount;
      this.setRewardMultipliers();
      this.calculateMaxWin();
    }
  }

  setRewardMultipliers() {
    switch (this.mineCount) {
      case 1:
        this.rewardMultipliers = this.multipliers1Mine;
        break;
      case 3:
        this.rewardMultipliers = this.multipliers3Mines;
        break;
      case 5:
        this.rewardMultipliers = this.multipliers5Mines;
        break;
      case 7:
        this.rewardMultipliers = this.multipliers7Mines;
        break;
      default:
        this.rewardMultipliers = [];
    }
  }

  startGame() {
    if (this.balance < this.betAmount) return;
    this.balance -= this.betAmount;
    this.gameActive = true;
    this.revealedCells.clear();
    this.reward = 0;
    this.placeMines();
    this.calculateMaxWin();
    this.waiting = true;
  }

  placeMines() {
    this.mines = [];
    while (this.mines.length < this.mineCount) {
      const index = Math.floor(Math.random() * 25);
      if (!this.mines.includes(index)) {
        this.mines.push(index);
      }
    }
  }

  revealCell(index: number) {
    if (!this.gameActive || this.revealedCells.has(index)) return;
    this.revealedCells.add(index);

    if (this.mines.includes(index)) {
      this.gameActive = false;
      setTimeout(() => this.resetGame(), 500);
    } else {
      this.updateReward();
    }
    console.log("revealedCells", this.revealedCells)
  }

  updateReward() {
    const multiplier = this.rewardMultipliers[this.revealedCells.size - 1] || this.rewardMultipliers[this.rewardMultipliers.length - 1];
    this.reward = Math.floor(this.betAmount * multiplier);
  }

  calculateMaxWin() {
    const maxMultiplier = this.rewardMultipliers[this.rewardMultipliers.length - 1];
    this.maxWin = Math.floor(this.betAmount * maxMultiplier);
  }

  withdraw() {
    if (!this.gameActive) return;
    this.balance += this.reward;
    this.resetGame();
  }

  resetGame() {
    this.gameActive = false;
    this.reward = 0;
    this.revealedCells.clear();
    this.waiting = false;
  }
}
