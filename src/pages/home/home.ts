import { AboutPage } from './../about/about';
import { ContactPage } from './../contact/contact';
import { Component } from '@angular/core';
import { NavController, AlertController, ModalController, LoadingController, Loading } from 'ionic-angular';

import { InfoComponent } from './../../components/info/info';

import { Cidade } from '../../models/cidades.models';
import { CidadeService } from '../../providers/cidade/cidade.service';
import { Estado } from '../../models/estados.models';
import { EstadoService } from '../../providers/estado/estado.service';
import { Observable } from 'rxjs/Observable';
import { AngularFireDatabase } from 'angularfire2/database';
import { ValorKit } from '../../models/valorkit.models';
import { ValorKitService } from '../../providers/valorKit/valorKit.service';
import { SelectSearch } from '../../components/select-search/select-search';

//import * as $ from 'jquery';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  cidadesArray: Cidade[];
  _cidadeSelecionada: Cidade;

  existeTarifaExcedente: boolean = false;  
  exibeResultado: boolean = false;
  sistemaSolarComercial = 0;
  numeroPaineis: number = 0;
  areaNecessaria: number = 0;
  investimentoAproximado: number = 0;
  tempoInvestimento: string;
  economiaPeriodo: number;
  valorTarifaExcedente: number;

  abvEstadoSelecionado: string = 'sc';
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

  verificaSeExisteTarifaExcedente(mediaKw): void{
    if (this.abvEstadoSelecionado == 'sc' && mediaKw > 150){
      this.existeTarifaExcedente = true;

    } else{
      this.existeTarifaExcedente = false;
    }
  }

  private showLoading(): Loading {
    let loading: Loading = this.loadingCtrl.create({
      content: 'Carregando cidades...'
    });

    loading.present();
    return loading;
  }

  /**
   * Click do componente de cidades
   */
  carregaCidadesArray() {
    let loading: Loading = this.showLoading();

    if (this.cidadeService.listaCidades != null){
      this.cidadesArray = this.cidadeService.listaCidades;     
    }

    setTimeout(()=>{
      loading.dismiss();
    },900);
  }

  carregaCidades(mediaKw): void {
    this.cidades = this.cidadeService.getAll(this.estadoSelecionado);
    this.abvEstadoSelecionado = this.estadoSelecionado.toLowerCase();
    this.cidadeSelecionada = null;
    this.currentCidade = null;
    this._cidadeSelecionada = null;
    this.verificaSeExisteTarifaExcedente(mediaKw);

    //até passar a usar a base de dados local é necessário deixar esse load para impedir o usuario
    //de abrir o modal de ciades sem nenhuma cidade carregada
    let loading: Loading = this.showLoading();
    setTimeout(()=>{
      loading.dismiss();
    },1900);
  }

  cidadeChange(event: { component: SelectSearch, value: any }) {   
    this.currentCidade = new Cidade(event.value.nome, event.value.radiacao);
    this.cidadeSelecionada = event.value.$key;
    this.radiacaoCidade = parseFloat(this.currentCidade.radiacao);
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

  ajudaTeste(caminho){
    let infoModal = this.modalCtrl.create(InfoComponent, { title: 'title', text: 'text', img: caminho });
    infoModal.onDidDismiss(data => {
//      console.log(data);
    });
    infoModal.present();
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
  // presentResultModal(title, sistemaSolarComercial, numeroPaineis, areaNecessaria, investimentoAproximado, tempoInvestimento) {
  //   let resultModal = this.modalCtrl.create(ResultComponent, 
  //     { 
  //       title: title, 
  //       sistemaSolarComercial: sistemaSolarComercial, 
  //       numeroPaineis: numeroPaineis,
  //       areaNecessaria: areaNecessaria,
  //       investimentoAproximado: investimentoAproximado,
  //       tempoInvestimento: tempoInvestimento
  //      });
  //      resultModal.onDidDismiss(data => {
  //     //console.log(data);
  //   });
  //   resultModal.present();
  // }

  ajudaMediaKw(): void {
    this.presentInfoModal("Média KWh", `${this.abvEstadoSelecionado}/consumo_medio.jpg`, "Informe neste campo a média de consumo dos últimos 12 meses. Esta informação pode ser verificada na sua fatura de energia. Conforme destacado na imagem.");
  }

  ajudaValorTarifa(): void {
    this.presentInfoModal("Valor tarifa", `${this.abvEstadoSelecionado}/tarifa.jpg`, "Informe o valor da tarifa de energia em kwh. Esta informação pode ser verificada na sua fatura de energia. Conforme destacado na imagem.");
  }

  ajudaValorTarifaExcedente(): void {
    this.presentInfoModal("Valor tarifa excedente", `${this.abvEstadoSelecionado}/tarifa_excedente.jpg`, "Algumas concencionárias de energia elétrica do Brasil trabalham com diferentes tarifas. Verifique na sua fatura se a concencionária da sua região possui mais de uma tarifa. Conforme destacado na imagem.");
  }
  
  Calcula(mediaKw, valorTarifa, tipoRede):void {
    let validaMediakW = parseFloat(mediaKw);
    let validaValorTarifa = parseFloat(valorTarifa);

    let mensagemErro = "";

    if (this.estadoSelecionado == null) { mensagemErro += "<br> - Estado"; }
    if (this.cidadeSelecionada == null) { mensagemErro += "<br> - Cidade"; }
    if (mediaKw == "" || validaMediakW <= 0) { mensagemErro += "<br> - Média KWh/mês"; }
    if (valorTarifa == "" || validaValorTarifa <= 0) { mensagemErro += "<br> - Valor tarifa"; }
    if (tipoRede == null) { mensagemErro += "<br> - Tipo da Rede"; }
    
    if (mensagemErro != "") {
      this.showAlert("Informe todos os campos:", mensagemErro);
      this.exibeResultado = false;
      return;
    }

    let sistemaSolarIdeal = 0;

	  //diminui 30 kw da media antes de calcular o sistemaSolarIdeal 
    let monofasico = 30, bifasico = 50, trifasico = 100;
    let potenciaPainel = 300; //valor fixo
    let tipoRedeValor = 0;

    switch(tipoRede) {
      case ("bifasico"):
        tipoRedeValor = bifasico; break;
      case ("trifasico"):
        tipoRedeValor = trifasico; break;
      case ("monofasico"):
        tipoRedeValor = monofasico; break;
    }

    /**
     * 30: dias do mes
     * 0.77: média de perda de eficiencia do painel
     */
    sistemaSolarIdeal = (mediaKw - tipoRedeValor) / 30 / this.radiacaoCidade / 0.77;

    this.numeroPaineis = this.calculaNumeroPaineis(sistemaSolarIdeal, potenciaPainel);

    this.areaNecessaria = this.numeroPaineis * 2;
    this.sistemaSolarComercial = (this.numeroPaineis * potenciaPainel) / 1000;

    if (this.sistemaSolarComercial < 1){
      this.showAlert("Alerta", "Para sistemas com menos de 1kWp é necessário uma análise técnica para o dimensionamento do seu gerador solar. Entre em contato com a KS para uma avaliação gratuita.");
      return;
    }

    let valorWatt = this.calculaValorWatt(this.sistemaSolarComercial);
    
    if (valorWatt == 0) return; //não deve continuar o cálculo

    this.investimentoAproximado = (this.sistemaSolarComercial * 1000) * valorWatt;
    
    let totalGeralTarifa = this.calculaTotalGeralTarifa(mediaKw, valorTarifa, this.valorTarifaExcedente);
    
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

    this.tempoInvestimento = this.calculaTempoMedioRetornoInvestimento(this.investimentoAproximado, totalGeralTarifa, valorTaxaMinima)

    this.investimentoAproximado = Math.round(this.investimentoAproximado);

    this.economiaPeriodo = this.calculaEconomiaPeriodo(this.investimentoAproximado, totalGeralTarifa, valorTaxaMinima);

    this.exibeResultado = true;
    //Abre modal para exibir os resultados
    //this.presentResultModal("Resultado", sistemaSolarComercial, numeroPaineis, `${areaNecessaria}m²`, `${Math.round(investimentoAproximado)}`, tempoInvestimento);
  }

  testee(){
    // var $doc = $('ion-content');
    // $doc.animate({
    //     scrollTop: top
    // }, 500);

    // var body = $("html, body");
    // body.stop().animate({scrollTop:0}, 500, 'swing', function() { 
    //   alert("Finished animating");
    // });

    // $('body,html').animate({
    //       scrollTop: 510
    // }, 800);

//     if (navigator.userAgent.match(/(iPod|iPhone|iPad|Android)/)) {           
//       window.scrollTo(200,100) // first value for left offset, second value for top offset
// }else{
//       $('html,body').animate({
//           scrollTop: 100,
//           scrollLeft: 200
//       }, 800, function(){
//           $('html,body').clearQueue();
//       });
//}

  //$('ion-content').animate({top: '100px'}, 500);

  //$('html, body').animate({scrollTop: $('ion-content').offset().top + 200}, 100);

  //$('ion-content').animate({bottom:'300'}, 500);

    console.log('passou');
  }

  Contato():void {
    this.navCtrl.push(ContactPage, 
      {
        efetuouCalculo: this.exibeResultado,
        sistemaSolarComercial: this.sistemaSolarComercial,        
        numeroPaineis: this.numeroPaineis,
        areaNecessaria: this.areaNecessaria, 
        investimentoAproximado: this.investimentoAproximado,        
        tempoInvestimento: this.tempoInvestimento,        
      });
  }

  Sobre(): void{
    this.navCtrl.push(AboutPage);
  }

  /**
  * Calcula a economia gerada pela instalação do kit solar.
  * Ex.: Seria gasto 30 mil em 25 anos, porém o kit solar custou apenas 10 mil reais.
  *      Logo, a economia será de 20 mil reais. 
  */
  calculaEconomiaPeriodo(investimentoAproximado, totalGeralTarifa, valorTaxaMinima): number{
    let mediaFaturaMesComInflacao = totalGeralTarifa - valorTaxaMinima;
    let economia = 0, mes = 0, cadaAno = 12, totalAno = 0;
    while(mes <= 300){ //25 anos
      mes++;
      if (cadaAno == 0){
        cadaAno = 12;
        economia += totalAno;
        totalAno = 0;
        //aplica a inflação uma vez ao ano
        mediaFaturaMesComInflacao *= 1.0912;
      }
      totalAno += mediaFaturaMesComInflacao;
      cadaAno--;
    }
    return economia - investimentoAproximado;
  }

  /**
   * Calcula o valor médio do tempo de retorno do investimento
   */
  calculaTempoMedioRetornoInvestimento(investimentoAproximado, totalGeralTarifa, valorTaxaMinima): string {
    let invest = investimentoAproximado;
		let mes = 0;
    let mediaFaturaMesComInflacao = totalGeralTarifa - valorTaxaMinima;

		while(invest > 0){	
			if (mes >= 12){
				mediaFaturaMesComInflacao = mediaFaturaMesComInflacao * 1.00912;//1.008334;
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

		if (mediaKw > 150 && valorTarifaExcedente > 0) {
			totalTarifa = 150 * valorTarifa;
			totalTarifaExcedente = (mediaKw - 150) * valorTarifaExcedente;
		}
		else {
			totalTarifa = mediaKw * valorTarifa;
		}		
    return totalTarifa + totalTarifaExcedente;
  }

  /**
   * 		Se o numero de paineis for X.2 ou menos, arredonda pra baixo
   *    Se o numero de paineis for X.3 ou mais, arredonda pra cima
   */
  calculaNumeroPaineis(sistemaSolarIdeal: number, potenciaPainel: number): number {
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
    * Calcula o valor do watt baseando-se nos valores cadastrados pelo app Gerenciador KS
    */	
  calculaValorWatt(sistemaSolarComercial:number): number{
    let valorWatt = "5"; //default
    
    if (sistemaSolarComercial > 75)
    {
      this.showAlert("Alerta", "Para sistemas em alta tensão e com uma maior demanda é necessário uma análise técnica para o dimensionamento do seu gerador solar. Entre em contato com a KS para uma avaliação gratuita.");
      return 0;
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

