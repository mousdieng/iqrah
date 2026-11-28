import { Component, signal } from '@angular/core';

/** Everything the app keeps in this browser that belongs to the user */
const BACKUP_KEYS = [
  'quran_user_progress', 'quran_favorites', 'quran_bookmarks', 'quran_notes', 'quran_settings',
  'iqrah_memo_log', 'iqrah_memo_goal', 'iqrah_memo_focus', 'iqrah_read_log', 'iqrah_last_read',
  'iqrah_audio_settings', 'iqrah_repeat_settings', 'iqrah_text_scale', 'iqrah_memo_reader', 'surahViewMode'
];
const FORMAT = 'iqrah-backup';

interface BackupFile {
  format: string;
  version: number;
  exportedAt: string;
  data: Record<string, string>;
}

/** Export progress to a file and restore it, since it only lives in this browser */
@Component({
  selector: 'app-backup',
  standalone: true,
  template: `
    <div class="card backup">
      <div class="backup-text">
        <h3 class="card-title"><i class="pi pi-save" aria-hidden="true"></i> Sauvegarde</h3>
        <p>Votre progression est enregistrée dans ce navigateur. Exportez-la dans un fichier pour la garder en sécurité ou la reprendre sur un autre appareil.</p>
      </div>
      <div class="backup-actions">
        <button type="button" class="btn btn-secondary" (click)="exportFile()">
          <i class="pi pi-download" aria-hidden="true"></i> Exporter
        </button>
        <label class="btn btn-ghost">
          <i class="pi pi-upload" aria-hidden="true"></i> Importer…
          <input type="file" accept="application/json,.json" class="sr-only" (change)="importFile($event)">
        </label>
      </div>
      @if (message(); as m) {
        <p class="message" [class.error]="m.error" role="status">{{ m.text }}</p>
      }
    </div>
  `,
  styles: [`
    .backup { display: grid; grid-template-columns: 1fr auto; align-items: center; gap: 0.75rem 1.5rem; }
    .card-title { margin: 0 0 0.25rem; font-size: 0.95rem; display: flex; align-items: center; gap: 0.45rem; }
    .backup-text p { margin: 0; font-size: 0.85rem; color: var(--color-text-secondary); }
    .backup-actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }
    .backup-actions label { cursor: pointer; }
    .message { grid-column: 1 / -1; margin: 0; font-size: 0.85rem; color: var(--color-success); }
    .message.error { color: var(--color-error); }
    @media (max-width: 640px) { .backup { grid-template-columns: 1fr; } }
  `]
})
export class BackupComponent {
  readonly message = signal<{ text: string; error?: boolean } | null>(null);

  exportFile(): void {
    const data: Record<string, string> = {};
    for (const key of BACKUP_KEYS) {
      const value = localStorage.getItem(key);
      if (value !== null) data[key] = value;
    }
    const backup: BackupFile = { format: FORMAT, version: 1, exportedAt: new Date().toISOString(), data };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `iqrah-sauvegarde-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    this.message.set({ text: 'Fichier de sauvegarde téléchargé.' });
  }

  importFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    file.text().then(text => {
      let backup: BackupFile;
      try {
        backup = JSON.parse(text);
      } catch {
        this.message.set({ text: 'Ce fichier n\'est pas une sauvegarde valide.', error: true });
        return;
      }
      if (backup?.format !== FORMAT || typeof backup.data !== 'object' || backup.data === null) {
        this.message.set({ text: 'Ce fichier n\'est pas une sauvegarde Iqrah.', error: true });
        return;
      }
      const date = backup.exportedAt ? new Date(backup.exportedAt).toLocaleDateString('fr-FR') : 'inconnue';
      if (!confirm(`Remplacer votre progression actuelle par la sauvegarde du ${date} ?`)) return;
      // Only known keys holding text are restored
      for (const key of BACKUP_KEYS) localStorage.removeItem(key);
      for (const [key, value] of Object.entries(backup.data)) {
        if (BACKUP_KEYS.includes(key) && typeof value === 'string') localStorage.setItem(key, value);
      }
      location.reload();
    });
  }
}
