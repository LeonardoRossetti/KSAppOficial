import { Component } from '@angular/core';
import { NavController, AlertController, ModalController, LoadingController } from 'ionic-angular';

import { InfoComponent } from './../../components/info/info';
import { ResultComponent } from './../../components/result/result';

import { Cidade } from '../../models/cidades.models';
import { CidadeService } from '../../providers/cidade/cidade.service';
import { Estado } from '../../models/estados.models';
import { EstadoService } from '../../providers/estado/estado.service';
import { Observable } from 'rxjs/Observable';
import { AngularFireDatabase } from 'angularfire2/database';
import { ValorKit } from '../../models/valorkit.models';
import { ValorKitService } from '../../providers/valorKit/valorKit.service';


@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  abvEstadoSelecionado: string = 'SC';
  estados: Observable<Estado[]>;
  estadoSelecionado: string;
  cidades: Observable<Cidade[]>;
  cidadeSelecionada: string;
  currentCidade: Cidade;
  valorKit: Observable<ValorKit[]>;
  currentValorKit: ValorKit; 
  radiacaoCidade: number = 4.42; //valor default

  constructor(
    public alertCtrl: AlertController,
    public db: AngularFireDatabase,
    public cidadeService: CidadeService,
    public estadoService: EstadoService,
    public loadingCtrl: LoadingController,
    public modalCtrl: ModalController,
    public navCtrl: NavController,
    public valorKitService: ValorKitService
  ) { }
    
  ionViewDidLoad() {
    this.estados = this.estadoService.getAll();
    this.valorKit = this.valorKitService.getAll();
  }

  carregaCidades(): void {
    this.cidadeSelecionada = null;
    this.currentCidade = null;
    this.abvEstadoSelecionado = this.estadoSelecionado;
    this.cidades = this.cidadeService.getAll(this.estadoSelecionado);
  }

  mudaCidadeSelecionada(): void { 
    //ao mudar o estado selecionado nao existe cidade selecionada
    //dava erro ao tentar ler a propriedade radiacao sem ter cidade selecionada  
    if (this.cidadeSelecionada == null) {
      return;
    }

    this.currentCidade = this.cidadeService.listaCidades.filter(x=> x.$key == this.cidadeSelecionada)[0];
    this.radiacaoCidade = parseFloat(this.currentCidade.radiacao);    
  }
  
  /** Abre o modal de informacao */
  presentInfoModal(title, img, text) {
    let infoModal = this.modalCtrl.create(InfoComponent, { title: title, text: text, img: img });
    infoModal.onDidDismiss(data => {
//      console.log(data);
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
      //console.log(data);
    });
    resultModal.present();
  }

  ajudaMediaKw(): void {

    this.presentInfoModal("Média KWh", `${this.abvEstadoSelecionado}/consumo_medio.jpg`, "Informe neste campo a média de consumo dos últimos 12 meses. Esta informação pode ser verificada na sua fatura de energia. Conforme destacado em vermelho na imagem.");
  }

  ajudaValorTarifa(): void {
    this.presentInfoModal("Valor tarifa", `${this.abvEstadoSelecionado}/tarifa.jpg`, "Informe o valor da tarifa de energia em kwh. Esta informação pode ser verificada na sua fatura de energia. Conforme destacado em vermelho na imagem.");
  }

  ajudaValorTarifaExcedente(): void {
    if (this.abvEstadoSelecionado == 'SC')
    {
      this.presentInfoModal("Valor tarifa excedente", `${this.abvEstadoSelecionado}/tarifa_excedente.jpg`, "Algumas concencionárias de energia elétrica do Brasil trabalham com diferentes tarifas. Verifique na sua fatura se a concencionária da sua região possui mais de uma tarifa. Conforme destacado em vermelho na imagem.");
    } else {
      this.showAlert("Informação", "O estado selecionado não possui tarifa excedente!");
    }
  }
  
  Calcula(mediaKw, valorTarifa, valorTarifaExcedente, tipoRede):void {

    if(this.estadoSelecionado == null 
      ||this.cidadeSelecionada == null
      ||mediaKw == ""
      ||valorTarifa == ""
      ||tipoRede == null)
    {
      this.showAlert("Ops!", "Informe todos os campos!");
      return;
    }

    let sistemaSolarIdeal = 0;
	  
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
    sistemaSolarIdeal = (mediaKw - tipoRedeValor) / 30 / this.radiacaoCidade / 0.77;

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
    let valorWatt = "5"; //default

    if (sistemaSolarComercial > 75)
    {
      this.showAlert("Alerta", "Para sistemas em alta tensão e com uma maior demanda é necessário uma análise técnica para o dimensionamento do seu gerador solar. Entre em contato com a KS para uma avaliação gratuita.");
    }

		if (sistemaSolarComercial <= 5) {
			valorWatt = this.valorKitService.listaValorKits.filter(x => x.$key == "ate5")[0].valor
		}
		else if (sistemaSolarComercial <= 10)	{
			valorWatt = this.valorKitService.listaValorKits.filter(x => x.$key == "de5a10")[0].valor
		}
		else if (sistemaSolarComercial <= 15)	{
			valorWatt = this.valorKitService.listaValorKits.filter(x => x.$key == "de10a15")[0].valor
		}
		else if (sistemaSolarComercial <= 20)	{
			valorWatt = this.valorKitService.listaValorKits.filter(x => x.$key == "de15a20")[0].valor
		}
		else if (sistemaSolarComercial <= 25)	{
			valorWatt = this.valorKitService.listaValorKits.filter(x => x.$key == "de20a25")[0].valor
		}
		else if (sistemaSolarComercial <= 30)	{
			valorWatt = this.valorKitService.listaValorKits.filter(x => x.$key == "de25a30")[0].valor
		}
		else if (sistemaSolarComercial <= 35)	{
			valorWatt = this.valorKitService.listaValorKits.filter(x => x.$key == "de30a35")[0].valor
		}
		else if (sistemaSolarComercial <= 40)	{
			valorWatt = this.valorKitService.listaValorKits.filter(x => x.$key == "de35a40")[0].valor
		}
		else if (sistemaSolarComercial <= 45)	{
			valorWatt = this.valorKitService.listaValorKits.filter(x => x.$key == "de40a45")[0].valor
		}
		else if (sistemaSolarComercial <= 50)	{
			valorWatt = this.valorKitService.listaValorKits.filter(x => x.$key == "de45a50")[0].valor
		}
		else if (sistemaSolarComercial <= 55)	{
			valorWatt = this.valorKitService.listaValorKits.filter(x => x.$key == "de50a55")[0].valor
		}
		else if (sistemaSolarComercial <= 60)	{
			valorWatt = this.valorKitService.listaValorKits.filter(x => x.$key == "de55a60")[0].valor
		}
		else if (sistemaSolarComercial <= 65)	{
			valorWatt = this.valorKitService.listaValorKits.filter(x => x.$key == "de60a65")[0].valor
		}
		else if (sistemaSolarComercial <= 70)	{
			valorWatt = this.valorKitService.listaValorKits.filter(x => x.$key == "de65a70")[0].valor
		}
		else if (sistemaSolarComercial <= 75)	{
			valorWatt = this.valorKitService.listaValorKits.filter(x => x.$key == "de70a75")[0].valor
    }
        
    return parseFloat(valorWatt);
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

