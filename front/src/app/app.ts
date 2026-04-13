import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { AudioPlayerComponent } from './components/audio-player/audio-player.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, AudioPlayerComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  title = 'Iqrah - Mémorisation du Coran';
}
