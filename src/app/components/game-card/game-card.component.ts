import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Game } from '../../models/game.model';

@Component({
  selector: 'app-game-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game-card.component.html',
  styleUrls: ['./game-card.component.scss']
})
export class GameCardComponent {
  @Input() game!: Game;

  openSteamPage(): void {
    if (this.game.steamUrl) {
      window.open(this.game.steamUrl, '_blank');
    }
  }
}
