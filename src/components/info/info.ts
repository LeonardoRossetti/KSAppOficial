import { Component } from '@angular/core';
import { ViewController, NavParams, AlertController } from 'ionic-angular';

@Component({
  selector: 'info',
  templateUrl: 'info.html'
})
export class InfoComponent {

  title: string;
  text: string;
  img: string;

  /**
   * Modal chamado para exibir as telas de help dos campos da tela inicial.
   */
  constructor(public alertCtrl: AlertController, public viewCtrl: ViewController, public navParams: NavParams) {
    this.title = this.navParams.get("title");
    this.text = this.navParams.get("text");
    // this.img = "./../../assets/imgs/" + this.navParams.get("img");
    this.img = "assets/imgs/" + this.navParams.get("img");
    this.showAlert("this.img: ", this.img);
    
  }

  voltar(): void {
    this.viewCtrl.dismiss();
  }

  showAlert(title, subTitle) {
    let alert = this.alertCtrl.create({
      title: title,
      subTitle: subTitle,
      buttons: ['OK']
    });
    alert.present();
  }

}
