import { Component } from '@angular/core';
import { ViewController, NavParams } from 'ionic-angular';

@Component({
  selector: 'result',
  templateUrl: 'result.html'
})
export class ResultComponent {

  title: string;
  sistemaSolarComercial: string;
  numeroPaineis: string;
  areaNecessaria: string;
  investimentoAproximado: string;

  constructor(public viewCtrl: ViewController, public navParams: NavParams) {
    this.title = this.navParams.get("title");
    this.sistemaSolarComercial = this.navParams.get("sistemaSolarComercial");
    this.numeroPaineis = this.navParams.get("numeroPaineis");
    this.areaNecessaria = this.navParams.get("areaNecessaria");
    this.investimentoAproximado = this.navParams.get("investimentoAproximado");
  }

  voltar(): void {
    this.viewCtrl.dismiss();
  }

}
