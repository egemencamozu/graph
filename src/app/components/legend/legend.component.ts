import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScoreRange } from '../../models/legend.model';

@Component({
  selector: 'app-legend',
  imports: [CommonModule],
  templateUrl: './legend.component.html',
  styleUrl: './legend.component.scss',
})
export class LegendComponent implements OnInit {
  scoreRanges: ScoreRange[] = [];

  ngOnInit(): void {
    this.initializeLegend();
  }

  private initializeLegend(): void {
    this.scoreRanges = this.getScoreRanges();
  }

  private getScoreRanges(): ScoreRange[] {
    return [
      {
        label: 'Excellent',
        description: '0.8 - 1.0',
        color: '#10b981',
        min: 0.8,
        max: 1.0,
      },
      {
        label: 'Good',
        description: '0.6 - 0.8',
        color: '#22c55e',
        min: 0.6,
        max: 0.8,
      },
      {
        label: 'Average',
        description: '0.4 - 0.6',
        color: '#eab308',
        min: 0.4,
        max: 0.6,
      },
      {
        label: 'Poor',
        description: '0.2 - 0.4',
        color: '#f97316',
        min: 0.2,
        max: 0.4,
      },
      {
        label: 'Very Poor',
        description: '0.0 - 0.2',
        color: '#ef4444',
        min: 0.0,
        max: 0.2,
      },
    ];
  }
}
