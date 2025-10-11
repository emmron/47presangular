import { Injectable } from '@angular/core';
import { circleMarker, latLngBounds, Map, tileLayer, type LatLngExpression, type Layer } from 'leaflet';
import { EventLocation } from '../models/media.model';

@Injectable({
  providedIn: 'root'
})
export class EventMapService {
  private map?: Map;
  private layers: Layer[] = [];

  initialize(container: HTMLElement, center: LatLngExpression = [37.8, -96.9], zoom = 4): Map {
    if (this.map) {
      this.map.remove();
    }

    this.map = new Map(container, {
      zoomControl: true,
      attributionControl: true
    }).setView(center, zoom);

    tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);

    return this.map;
  }

  plotEvents(events: EventLocation[]): void {
    if (!this.map) {
      return;
    }

    this.clearLayers();

    events.forEach(event => {
      const marker = circleMarker([event.coordinates.lat, event.coordinates.lng], {
        radius: 8,
        weight: 2,
        opacity: 0.9,
        fillOpacity: 0.85,
        color: '#c53030',
        fillColor: '#fc8181'
      });

      const lines: string[] = [`<strong>${event.title}</strong>`];
      if (event.startDate) {
        const endText = event.endDate ? ` - ${new Date(event.endDate).toLocaleDateString()}` : '';
        lines.push(`<div>${new Date(event.startDate).toLocaleDateString()}${endText}</div>`);
      }
      if (event.city || event.state || event.venue) {
        const locationParts = [event.venue, event.city, event.state].filter(Boolean);
        lines.push(`<div>${locationParts.join(', ')}</div>`);
      }
      if (event.description) {
        lines.push(`<p>${event.description}</p>`);
      }

      marker.bindPopup(lines.join(''));
      marker.addTo(this.map!);
      this.layers.push(marker);
    });

    if (events.length > 1) {
      const bounds = latLngBounds(events.map(event => [event.coordinates.lat, event.coordinates.lng] as LatLngExpression));
      this.map.fitBounds(bounds.pad(0.2));
    } else if (events.length === 1) {
      this.map.setView([events[0].coordinates.lat, events[0].coordinates.lng], 7);
    }
  }

  clearLayers(): void {
    if (!this.map) {
      return;
    }

    this.layers.forEach(layer => layer.remove());
    this.layers = [];
  }

  destroy(): void {
    if (this.map) {
      this.map.remove();
      this.map = undefined;
    }
    this.layers = [];
  }
}
