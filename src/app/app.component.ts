import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DescensoService, MatchRecord, PredictionResult, ConfusionMatrix } from './descenso.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  private readonly svc = inject(DescensoService);

  training = signal(false);
  trainResult = signal<ConfusionMatrix | null>(null);
  trainError = signal<string | null>(null);

  predicting = signal(false);
  predResult = signal<PredictionResult | null>(null);
  predError = signal<string | null>(null);

  form: MatchRecord = {
    equipo: '',
    jj: 22,
    pts: 0,
    jg: 0,
    je: 0,
    jp: 0,
    gf: 0,
    gc: 0,
    diff: 0
  };

  train() {
    this.training.set(true);
    this.trainResult.set(null);
    this.trainError.set(null);
    this.svc.train().subscribe({
      next: (res) => {
        this.trainResult.set(res);
        this.training.set(false);
      },
      error: () => {
        this.trainError.set('No se pudo conectar con el servidor. Asegúrate de que el backend esté corriendo en el puerto 8080.');
        this.training.set(false);
      }
    });
  }

  predict() {
    if (!this.form.equipo.trim()) return;
    this.form.diff = this.form.gf - this.form.gc;
    this.predicting.set(true);
    this.predResult.set(null);
    this.predError.set(null);
    this.svc.predict({ ...this.form }).subscribe({
      next: (res) => {
        this.predResult.set(res);
        this.predicting.set(false);
      },
      error: () => {
        this.predError.set('Error al predecir. Asegúrate de que el modelo fue entrenado primero.');
        this.predicting.set(false);
      }
    });
  }

  pct(val: number): string {
    return (val * 100).toFixed(1) + '%';
  }

  barWidth(val: number): string {
    return (val * 100).toFixed(1) + '%';
  }
}
