import { AsyncPipe, DatePipe } from '@angular/common';
import { AfterViewInit, Component, ElementRef, inject, OnDestroy, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import * as L from 'leaflet';
import { BehaviorSubject, combineLatest, map, merge, Subject, takeUntil } from 'rxjs';
import { Party } from '../../core/models/party.model';
import { GenreService } from '../../core/services/genre.service';
import { upcomingNights } from '../../core/utils/nights';
import { fillLevel, fillRatio, genreNames, priceLabel } from '../../core/utils/party-format';
import { PartyCard } from '../../shared/components/party-card/party-card';
import { PartiesActions } from '../../store/parties/parties.actions';
import { partiesFeature } from '../../store/parties/parties.reducer';

const CITY_CENTER: L.LatLngExpression = [43.3209, 21.8958];
const TILES_URL = 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png';
const TILES_ATTRIBUTION =
  '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a> ' +
  '&copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> ' +
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';
const MIN_MARKER_SIZE = 40;
const MARKER_GROWTH = 30;

@Component({
  selector: 'app-party-map',
  imports: [AsyncPipe, DatePipe, PartyCard],
  templateUrl: './party-map.html',
  styleUrl: './party-map.scss',
})
export class PartyMap implements AfterViewInit, OnDestroy {
  @ViewChild('mapContainer', { static: true })
  private mapContainer!: ElementRef<HTMLDivElement>;

  private readonly store = inject(Store);
  private readonly destroy$ = new Subject<void>();
  private readonly markerClick$ = new Subject<number>();
  private readonly listClick$ = new Subject<number>();
  private readonly markersLayer = L.layerGroup();
  private map?: L.Map;

  protected readonly nights = upcomingNights();
  protected selectedDate = this.nights[0].date;

  protected readonly genreFilter$ = new BehaviorSubject<number | null>(null);
  protected readonly freeOnly$ = new BehaviorSubject<boolean>(false);
  protected readonly genres$ = inject(GenreService).getAll();
  protected readonly loading$ = this.store.select(partiesFeature.selectLoading);
  protected readonly selectedParty$ = this.store.select(partiesFeature.selectSelectedParty);

  protected readonly visibleParties$ = combineLatest([
    this.store.select(partiesFeature.selectAllParties),
    this.genreFilter$,
    this.freeOnly$,
  ]).pipe(
    map(([parties, genreId, freeOnly]) =>
      parties
        .filter((party) => genreId === null || party.genres.some((genre) => genre.id === genreId))
        .filter((party) => !freeOnly || party.price === 0),
    ),
  );

  constructor() {
    this.store.dispatch(PartiesActions.loadParties({ date: this.selectedDate }));
  }

  ngAfterViewInit(): void {
    this.map = L.map(this.mapContainer.nativeElement, { center: CITY_CENTER, zoom: 14 });
        L.tileLayer(TILES_URL, { attribution: TILES_ATTRIBUTION, maxZoom: 20 }).addTo(this.map);
    this.markersLayer.addTo(this.map);
    this.watchMarkers();
    this.watchSelection();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.map?.remove();
  }

  protected selectNight(date: string): void {
    this.selectedDate = date;
    this.store.dispatch(PartiesActions.loadParties({ date }));
  }

  protected selectGenre(genreId: number | null): void {
    this.genreFilter$.next(genreId);
  }

  protected toggleFreeOnly(): void {
    this.freeOnly$.next(!this.freeOnly$.value);
  }

  protected pickFromList(partyId: number): void {
    this.listClick$.next(partyId);
  }

  protected fillPercent(party: Party): number {
    return Math.round(fillRatio(party) * 100);
  }

  protected fillLevelOf(party: Party): string {
    return fillLevel(fillRatio(party));
  }

  protected priceOf(party: Party): string {
    return priceLabel(party);
  }

  protected genresOf(party: Party): string {
    return genreNames(party);
  }

  private watchMarkers(): void {
    combineLatest([this.visibleParties$, this.store.select(partiesFeature.selectSelectedPartyId)])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([parties, selectedId]) => this.renderMarkers(parties, selectedId));
  }

  private watchSelection(): void {
    merge(this.markerClick$, this.listClick$)
      .pipe(takeUntil(this.destroy$))
      .subscribe((partyId) => this.store.dispatch(PartiesActions.selectParty({ partyId })));

    this.selectedParty$.pipe(takeUntil(this.destroy$)).subscribe((party) => {
      if (party) {
        this.map?.panTo([party.venue.latitude, party.venue.longitude]);
      }
    });
  }

  private renderMarkers(parties: Party[], selectedId: number | null): void {
    this.markersLayer.clearLayers();
    parties.forEach((party) => {
      const marker = L.marker([party.venue.latitude, party.venue.longitude], {
        icon: this.createIcon(party, party.id === selectedId),
        title: party.title,
      });
      marker.on('click', () => this.markerClick$.next(party.id));
      marker.addTo(this.markersLayer);
    });
  }

  private createIcon(party: Party, isSelected: boolean): L.DivIcon {
    const ratio = fillRatio(party);
    const size = Math.round(MIN_MARKER_SIZE + ratio * MARKER_GROWTH);
    const classes = ['party-marker', `party-marker--${fillLevel(ratio)}`];
    if (isSelected) {
      classes.push('party-marker--selected');
    }
    return L.divIcon({
      className: '',
      html: `<div class="${classes.join(' ')}" style="width:${size}px;height:${size}px">${party.attendeeCount ?? 0}</div>`,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });
  }
}