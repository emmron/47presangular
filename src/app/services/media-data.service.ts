import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AdSpotlightInfo, EventLocation, LiveStreamInfo } from '../models/media.model';

@Injectable({
  providedIn: 'root'
})
export class MediaDataService {
  private readonly baseUrl = '/api/media';

  constructor(private http: HttpClient) {}

  getLiveStream(): Observable<LiveStreamInfo> {
    return this.http.get<LiveStreamInfo>(`${this.baseUrl}/live-stream`);
  }

  getAdSpotlight(): Observable<AdSpotlightInfo> {
    return this.http.get<AdSpotlightInfo>(`${this.baseUrl}/ad-spotlight`);
  }

  getUpcomingEvents(): Observable<EventLocation[]> {
    return this.http.get<EventLocation[]>(`${this.baseUrl}/events`);
  }
}
