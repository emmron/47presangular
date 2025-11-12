import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Game } from '../models/game.model';
import { Developer } from '../models/developer.model';

@Injectable({
  providedIn: 'root'
})
export class PortfolioService {
  private gamesDataUrl = '/assets/data/games.json';
  private developersDataUrl = '/assets/data/developers.json';

  constructor(private http: HttpClient) {}

  getGames(): Observable<Game[]> {
    return this.http.get<Game[]>(this.gamesDataUrl);
  }

  getDevelopers(): Observable<Developer[]> {
    return this.http.get<Developer[]>(this.developersDataUrl);
  }

  getGameById(id: string): Observable<Game | undefined> {
    return new Observable(observer => {
      this.getGames().subscribe(games => {
        const game = games.find(g => g.id === id);
        observer.next(game);
        observer.complete();
      });
    });
  }

  getDeveloperById(id: string): Observable<Developer | undefined> {
    return new Observable(observer => {
      this.getDevelopers().subscribe(developers => {
        const developer = developers.find(d => d.id === id);
        observer.next(developer);
        observer.complete();
      });
    });
  }
}
