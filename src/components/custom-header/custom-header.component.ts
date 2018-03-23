import { Component, Input } from '@angular/core';

@Component({
  selector: 'custom-header',
  templateUrl: 'custom-header.component.html'
})
export class CustomHeaderComponent {

  @Input() title: string;

  constructor() { }
}
