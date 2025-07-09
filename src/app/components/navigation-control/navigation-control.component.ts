import { Component, Input, Output, EventEmitter} from '@angular/core';

@Component({
  selector: 'app-navigation-control',
  imports: [],
  templateUrl: './navigation-control.component.html',
  styleUrl: './navigation-control.component.scss'
})
export class NavigationControlComponent {

  @Input() canGoBack: boolean = false;
  @Input() currentLevel: string = 'Groups';

  @Output() backClicked = new EventEmitter<void>();
  @Output() homeClicked = new EventEmitter<void>();

  onBackClick(): void {
    if (this.canGoBack) {
      this.backClicked.emit();
    }
  }

  onHomeClick(): void {
    this.homeClicked.emit();
  }

}
