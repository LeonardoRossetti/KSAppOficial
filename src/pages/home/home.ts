import { Component } from '@angular/core';
import { NavController, AlertController } from 'ionic-angular';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  

  constructor(public navCtrl: NavController, public alertCtrl: AlertController) {
    
  }

  Calcula(mediaKw, valorTarifa, valorTarifaExcedente, tipoRede):void {
    let sistemaSolarIdeal = 0;
	  let radiacaoCidade = 4.42;
    let monofasico = 30;//diminui 30 kw da media antes de calcular o sistemaSolarIdeal 
	  let bifasico = 50;
    let trifasico = 100;
    let potenciaPainel = 300; //valor fixo
    let tipoRedeValor = 0;

    switch(tipoRede) {
      case ("bifasico"):
        tipoRedeValor = bifasico; break;
      case ("trifasico"):
        tipoRedeValor = trifasico; break;
      default:
        tipoRedeValor = monofasico; break;
    }

    /**
     * TODO: explicar o que significa esse cálculo
     */
    sistemaSolarIdeal = (mediaKw - tipoRedeValor) / 30 / radiacaoCidade / 0.77;

    let numeroPaineis = this.calculaNumeroPaineis(sistemaSolarIdeal, potenciaPainel);

    let areaNecessaria = numeroPaineis * 2;
    let sistemaSolarComercial = (numeroPaineis * potenciaPainel) / 1000;

    let valorWatt = this.calculaValorWatt(sistemaSolarComercial);

    let investimentoAproximado = (sistemaSolarComercial * 1000) * valorWatt;

    let totalGeralTarifa = this.calculaTotalGeralTarifa(mediaKw, valorTarifa, valorTarifaExcedente);
    
    //ENCONTRA TAXA MINIMA 
		var valorTaxaMinima = 0;

    switch(tipoRede) {
      case ("bifasico"):
      valorTaxaMinima = valorTarifa * bifasico; break;
      case ("trifasico"):
      valorTaxaMinima = valorTarifa * trifasico; break;
      default:
      valorTaxaMinima = valorTarifa * monofasico; break;
    }

    /**
     * var invest = investimentoAproximado;
		var result = "";
		var mes = 0;
		var mediaFaturaMesComInflacao = totalGeralTarifa - valorTaxaMinima;
		while(invest > 0)
		{	
			if (mes >= 12){
				mediaFaturaMesComInflacao = mediaFaturaMesComInflacao * 1.008334;
			}
			mes++;
			result = result + "<br><br> Mes: " + mes + "  Investimento: " + Math.round10(invest, -2) + "  mediaFaturaMesComInflacao: " + Math.round10(mediaFaturaMesComInflacao, -2);  
			invest = invest - mediaFaturaMesComInflacao;
		} 
     */
		

    console.log(`Sistema solar Ideal: ${sistemaSolarIdeal}`);
    console.log(`Número de paineis: ${numeroPaineis}`);




  }

  /**
   * Se nao for informado o valorTarifaExcedente devemos calcular o total da tarifa 
   * sem considerar a tarifa excedente. Pois existem estados onde nao existem tarifas excedentes.
   */
  calculaTotalGeralTarifa(mediaKw: number, valorTarifa: number, valorTarifaExcedente: number): number{
    let totalTarifa = 0;
		let totalTarifaExcedente = 0;

    //TODO: 'e diferente de zero ou maior que zero? esse valor pde ser negativo?
		if (mediaKw > 150 && valorTarifaExcedente != 0)
		{
			totalTarifa = 150 * valorTarifa;
			totalTarifaExcedente = (mediaKw - 150) * valorTarifaExcedente;
		}
		else
		{
			totalTarifa = mediaKw * valorTarifa;
		}
		
    return totalTarifa + totalTarifaExcedente;
  }

  /**
   * 		Se o numero de paineis for X.2 ou menos, arredonda pra baixo
   *    Se o numero de paineis for X.3 ou mais, arredonda pra cima
   */
  calculaNumeroPaineis(sistemaSolarIdeal: number, potenciaPainel: number): number{
    let numeroPaineis = sistemaSolarIdeal / (potenciaPainel / 1000);
    console.log(`Número de paineis: ${numeroPaineis}`); //Remover

    let decimalNumeroPaineis = numeroPaineis - Math.floor(numeroPaineis);
    if (decimalNumeroPaineis > 0.2) {
      numeroPaineis = Math.ceil(numeroPaineis);
    } else {
      numeroPaineis = Math.floor(numeroPaineis);
    }
    return numeroPaineis;
  }

  /**
    * se o sistemaSolarComercial for menor ou igual a 3.0 o valor do watt é R$ 6.8.
    * se o sistemaSolarComercial for menor ou igual a 6.0 o valor do watt é R$ 5.
    * se o sistemaSolarComercial for maior que 6.0 e menor que 30,0 o valor do watt é 3.8.
    * se o sistemaSolarComercial for maior que 30.0 e menor que 55.0 o valor do watt é 3,5.
    */	
  calculaValorWatt(sistemaSolarComercial:number): number{
    	
		let valorWatt = 0;
		if (sistemaSolarComercial <= 3)
		{
			valorWatt = 6.8;
		}
		else if (sistemaSolarComercial <= 6)
		{
			valorWatt = 5;
		}
		else if (sistemaSolarComercial <= 30)
		{
			valorWatt = 3.8;
		}
		else 
		{
			valorWatt = 3.5;
    }
    return valorWatt;
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
