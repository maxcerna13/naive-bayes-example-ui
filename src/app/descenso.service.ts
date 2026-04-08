import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MatchRecord {
  equipo: string;
  jj: number;
  pts: number;
  jg: number;
  je: number;
  jp: number;
  gf: number;
  gc: number;
  diff: number;
  descendio?: string;
}

export interface PredictionResult {
  equipo: string;
  prediction: string;
  probabilityYes: number;
  probabilityNo: number;
}

export interface ConfusionMatrix {
  tp: number;
  tn: number;
  fp: number;
  fn: number;
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
}

@Injectable({ providedIn: 'root' })
export class DescensoService {
  private readonly http = inject(HttpClient);
  private readonly BASE = '/descenso';

  train(): Observable<ConfusionMatrix> {
    return this.http.post<ConfusionMatrix>(`${this.BASE}/train`, {});
  }

  predict(record: MatchRecord): Observable<PredictionResult> {
    return this.http.post<PredictionResult>(`${this.BASE}/predict`, record);
  }
}
