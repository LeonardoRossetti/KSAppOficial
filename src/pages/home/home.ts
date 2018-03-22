import { Component } from '@angular/core';
import { NavController, AlertController, ModalController } from 'ionic-angular';

import { InfoComponent } from './../../components/info/info';
import { ResultComponent } from './../../components/result/result';
import { ServidorProvider } from './../../providers/servidor/servidor';

//declare var jquery: any;
//declare var $: any;

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  constructor(
    public alertCtrl: AlertController,
    public modalCtrl: ModalController,
    public navCtrl: NavController, 
    public servidor: ServidorProvider
  ) { }
    
  ionViewDidEnter(): void {
    //let estados: {};
    //let cidades: {};

    console.log("executou!!!");

    

    // this.serverService.getTeste()
    //   .subscribe(data => {
    //     console.log(data);
    //   });

    this.carregaEstados();
  }

  carregaEstados(): void{
    let estados = this.servidor.getStates();
    console.log(estados);
  }

  // carregaCidades(estado): void {
  //   let cidades = this.serverService.getCities(estado);
  // }
  
  /** Abre o modal de informacao */
  presentInfoModal(title, img, text) {
    let infoModal = this.modalCtrl.create(InfoComponent, { title: title, text: text, img: img });
    infoModal.onDidDismiss(data => {
      console.log(data);
    });
    infoModal.present();
  }

  /** Abre o modal de resultado */
  presentResultModal(title, sistemaSolarComercial, numeroPaineis, areaNecessaria, investimentoAproximado, tempoInvestimento) {
    let resultModal = this.modalCtrl.create(ResultComponent, 
      { 
        title: title, 
        sistemaSolarComercial: sistemaSolarComercial, 
        numeroPaineis: numeroPaineis,
        areaNecessaria: areaNecessaria,
        investimentoAproximado: investimentoAproximado,
        tempoInvestimento: tempoInvestimento
       });
       resultModal.onDidDismiss(data => {
      console.log(data);
    });
    resultModal.present();
  }

  ajudaMediaKw(): void {
    this.presentInfoModal("Informação: Média KWh", "sc/Celesc_Consumo_medio.jpg", "Informe neste campo a média de consumo dos últimos 12 meses. Esta informação pode ser verificada na sua fatura de energia. Conforme destacado em vermelho na imagem abaixo:");
  }

  ajudaValorTarifa(): void {
    this.presentInfoModal("Informação: Valor tarifa", "sc/Celesc_tarifa.jpg", "Informe o valor da tarifa de energia em kwh. Esta informação pode ser verificada na sua fatura de energia. Conforme destacado em vermelho na imagem abaixo:");
  }

  ajudaValorTarifaExcedente(): void {
    this.presentInfoModal("Informação: Valor tarifa excedente", "sc/Celesc_tarifa_excedente.jpg", "Algumas concencionárias de energia elétrica do Brasil trabalham com diferentes tarifas. Verifique na sua fatura se a concencionária da sua região possui mais de uma tarifa. Conforme destacado em vermelho na imagem abaixo:");
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
     * 30: dias do mes
     * 0.77: média de perda de eficiencia do painel
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

    let tempoInvestimento = this.calculaTempoMedioRetornoInvestimento(investimentoAproximado, totalGeralTarifa, valorTaxaMinima)

    //Abre modal para exibir os resultados
    this.presentResultModal("Resultado", sistemaSolarComercial, numeroPaineis, `${areaNecessaria}m²`, `${Math.round(investimentoAproximado)}`, tempoInvestimento);
  }

  /**
   * Calcula o valor médio do retorno do investimento
   * @param investimentoAproximado 
   * @param totalGeralTarifa 
   * @param valorTaxaMinima 
   */
  calculaTempoMedioRetornoInvestimento(investimentoAproximado, totalGeralTarifa, valorTaxaMinima): string {
    let invest = investimentoAproximado;
		let mes = 0;
		let mediaFaturaMesComInflacao = totalGeralTarifa - valorTaxaMinima;
		while(invest > 0)
		{	
			if (mes >= 12){
				mediaFaturaMesComInflacao = mediaFaturaMesComInflacao * 1.008334;
			}
      mes++;
			invest = invest - mediaFaturaMesComInflacao;
		} 
     
    let tempoEmAnos = mes / 12;
    let decimalTempoEmAnos = tempoEmAnos - Math.floor(tempoEmAnos);
    let tempoInvestimento: string;
    if (decimalTempoEmAnos > 1) { //pois pode ter numeros como 0.00005      
      let textoTempoEmAnos = decimalTempoEmAnos.toString().substr(2,1);
      tempoInvestimento = `${tempoEmAnos - decimalTempoEmAnos} anos e ${textoTempoEmAnos} mêses.`;
    } else {
      tempoInvestimento = `${tempoEmAnos - decimalTempoEmAnos} anos`;
    }

    return tempoInvestimento;
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

