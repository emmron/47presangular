import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameCardComponent } from '../../../components/game-card/game-card.component';
import { PortfolioService } from '../../../services/portfolio.service';
import { Game } from '../../../models/game.model';
import { Developer } from '../../../models/developer.model';

@Component({
  selector: 'app-portfolio',
  standalone: true,
  imports: [CommonModule, GameCardComponent],
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.scss']
})
export class PortfolioComponent implements OnInit {
  games: Game[] = [];
  developer: Developer | undefined;
  loading = true;

  constructor(private portfolioService: PortfolioService) {}

  ngOnInit(): void {
    this.loadPortfolio();
  }

  loadPortfolio(): void {
    this.portfolioService.getDeveloperById('jonathan-huckabee').subscribe(dev => {
      this.developer = dev;
    });

    this.portfolioService.getGames().subscribe(games => {
      this.games = games;
      this.loading = false;
    });
  }
}
