import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DescensoService, MatchRecord, PredictionResult, ConfusionMatrix, ScenarioResult, ProjectionRequest } from './descenso.service';

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

  // ── Panel 03: Proyección por jornada ──────────────────────────────────────
  projForm: MatchRecord = {
    equipo: '',
    jj: 40,
    pts: 0,
    jg: 0,
    je: 0,
    jp: 0,
    gf: 0,
    gc: 0,
    diff: 0
  };

  targetJornada = 44;

  matchSlots = signal<Array<'G' | 'E' | 'P' | null>>([null, null, null, null, null]);

  formaReciente = computed(() => {
    const set = this.matchSlots().filter(s => s !== null);
    if (set.length === 0) return null;
    return {
      jg: set.filter(s => s === 'G').length,
      je: set.filter(s => s === 'E').length,
      jp: set.filter(s => s === 'P').length,
    };
  });

  projecting = signal(false);
  projResult = signal<ScenarioResult[] | null>(null);
  projError  = signal<string | null>(null);

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

  toggleSlot(i: number) {
    const cycle: Array<'G' | 'E' | 'P' | null> = [null, 'G', 'E', 'P'];
    const slots = [...this.matchSlots()];
    const idx = cycle.indexOf(slots[i]);
    slots[i] = cycle[(idx + 1) % cycle.length];
    this.matchSlots.set(slots);
  }

  slotLabel(s: 'G' | 'E' | 'P' | null): string {
    return s ?? '?';
  }

  slotClass(s: 'G' | 'E' | 'P' | null): string {
    if (s === 'G') return 'slot-win';
    if (s === 'E') return 'slot-draw';
    if (s === 'P') return 'slot-loss';
    return 'slot-empty';
  }

  projectJornada() {
    if (!this.projForm.equipo.trim()) return;
    this.projForm.diff = this.projForm.gf - this.projForm.gc;
    this.projecting.set(true);
    this.projResult.set(null);
    this.projError.set(null);
    const req: ProjectionRequest = {
      current: { ...this.projForm },
      targetJornada: this.targetJornada,
      formaReciente: this.formaReciente() ?? undefined
    };
    this.svc.predictJornada(req).subscribe({
      next: (res) => {
        this.projResult.set(res);
        this.projecting.set(false);
      },
      error: () => {
        this.projError.set('Error al proyectar. Asegúrate de que el modelo fue entrenado primero.');
        this.projecting.set(false);
      }
    });
  }
}
