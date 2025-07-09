import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LegendComponent } from "./components/legend/legend.component";
import { ChatbotComponent } from './components/chatbot/chatbot.component';
import { NavigationControlComponent } from './components/navigation-control/navigation-control.component';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LegendComponent ,ChatbotComponent , NavigationControlComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'deneme-graph';
}
