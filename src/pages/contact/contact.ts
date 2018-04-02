import { Component } from '@angular/core';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { EmailComposer } from '@ionic-native/email-composer';
import { NavController } from 'ionic-angular';


@Component({
  selector: 'page-contact',
  templateUrl: 'contact.html'
})
export class ContactPage {

  currentImage = null;

  constructor(
    private camera: Camera,
    private emailComposer: EmailComposer,
    public navCtrl: NavController) {
  }

  /**
   * Colocar um campo de foto para o usuario informar a foto da fatura.
   * Campos: Nome, email e telefone
   * Enviar junto as informaçoes preenchidas na primeira página do calculo.
   */

  sendEmail(){

    this.emailComposer.isAvailable().then((available: boolean) =>{
      if(available) {
        //Now we know we can send
        console.log('permitido enviar o email');
      }
     });

     let email = {
      to: 'leoo.rossetti@gmail.com',
      cc: 'leoo.rossetti@gmail.com',
      bcc: ['leoo.rossetti@gmail.com'],
      attachments: [
        this.currentImage
      ],
      subject: 'Cordova Icons',
      body: 'How are you? Nice greetings from Leipzig',
      isHtml: true
    };
    
    // Send a text message using default options
    this.emailComposer.open(email);
     

    // add alias
    //email.addAlias('gmail', 'com.google.android.gm');


    console.log('email enviado');

   }

   captureImage() {
    const options: CameraOptions = {
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      destinationType: this.camera.DestinationType.FILE_URI,
    }
 
    this.camera.getPicture(options).then((imageData) => {
      this.currentImage = imageData;
    }, (err) => {
      // Handle error
      console.log('Image error: ', err);
    });
  }

  _sendEmail() {
    let email = {
      to: 'leoo.rossetti@gmail.com',
      cc: 'leoo.rossetti@gmail.com',
      attachments: [
        this.currentImage
      ],
      subject: 'My Cool Image',
      body: 'Hey Simon, what do you thing about this image?',
      isHtml: true
    };
 
    this.emailComposer.open(email);
}
}