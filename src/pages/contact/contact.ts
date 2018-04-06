import { Component } from '@angular/core';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { EmailComposer } from '@ionic-native/email-composer';
import { NavController, AlertController, NavParams } from 'ionic-angular';

@Component({
  selector: 'page-contact',
  templateUrl: 'contact.html'
})
export class ContactPage {

  //resultados do cálculo
  sistemaSolarComercial;
  numeroPaineis: number;
  areaNecessaria: number;
  investimentoAproximado: number;
  tempoInvestimento: string;
  efetuouCalculo: boolean;

  currentImage = null;

  constructor(
    public alertCtrl: AlertController,
    private camera: Camera,
    private emailComposer: EmailComposer,
    public navCtrl: NavController,
    public navParams: NavParams) {
      this.efetuouCalculo = this.navParams.get('efetuouCalculo');
      this.sistemaSolarComercial = this.navParams.get('sistemaSolarComercial');
      this.numeroPaineis = this.navParams.get('numeroPaineis');
      this.areaNecessaria = this.navParams.get('areaNecessaria');
      this.investimentoAproximado = this.navParams.get('investimentoAproximado');
      this.tempoInvestimento = this.navParams.get('tempoInvestimento');
  }

  /**
   * Enviar junto as informaçoes preenchidas na primeira página do calculo.
   */
  sendEmail(nome, emailCliente, telefone, mensagem) {
    let body = `<div align="left">
                  <b>Email enviado do app</b>
                  <br><br> 
                  <strong>Nome: </strong>${nome}
                  <br><br> 
                  <strong>Email: </strong>${emailCliente}
                  <br><br> 
                  <strong>Telefone: </strong>${telefone}
                  <br><br> 
                  <strong>Mensagem: </strong>${mensagem}
                </div>`;
    if (this.efetuouCalculo){
      body = `<div align="left">
                <b>Email enviado do app</b>
                <br><br> 
                <strong>Nome: </strong>${nome}
                <br><br> 
                <strong>Email: </strong>${emailCliente}
                <br><br> 
                <strong>Telefone: </strong>${telefone}
                <br><br> 
                <strong>Mensagem: </strong>${mensagem}
                <br><br> 
                <strong>DADOS DO CÁLCULO: </strong>
                <br>
                <strong>Sistema solar fotovoltaico: </strong>${this.sistemaSolarComercial}kw
                <br><br>
                <strong>Número de painéis: </strong>${this.numeroPaineis}
                <br><br>
                <strong>Área necessária: </strong>${this.areaNecessaria}m²
                <br><br>
                <strong>Investimento aproximado: R$</strong>${this.investimentoAproximado},00
                <br><br>
                <strong>Retorno do investimento: </strong>${this.tempoInvestimento}
              </div>`
    } 

    let email = {
      app: 'gmail',
      to: ['leoo.rossetti@gmail.com', 'ksenergia@ksenergia.com.br'],
      attachments: [
        this.currentImage
      ],
      subject: 'App | Contato do cliente',
      body: body, 
      isHtml: true
    }
     
    // Use the plugin isAvailable method to check whether
    // the user has configured an email account
    this.emailComposer.isAvailable()
    .then((available: boolean) =>
    {
      // Check that plugin has been granted access permissions to
      // user's e-mail account
      this.emailComposer.hasPermission()
      .then((isPermitted : boolean) =>
      {
        // Open the device e-mail client and create
        // a new e-mail message populated with the
        // object containing our message data
        this.emailComposer.open(email);
      }).catch((error : any) =>
      {
        console.log('No access permission granted');
        console.dir(error);
      });
    }).catch((error : any) =>
    {
      console.log('User does not appear to have device e-mail account');
      console.dir(error);
    });
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

  captureFoto(){
    const options: CameraOptions = {
      sourceType: this.camera.PictureSourceType.CAMERA,
      destinationType: this.camera.DestinationType.FILE_URI,
    }
 
    this.camera.getPicture(options).then((imageData) => {
      this.currentImage = imageData;
    }, (err) => {
      // Handle error
      console.log('Image error: ', err);
    });
  }
}