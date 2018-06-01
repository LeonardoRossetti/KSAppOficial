import { Network } from '@ionic-native/network';
import { ControleService } from './../../providers/controleAlteracoes/controle.service';
import { AboutPage } from './../about/about';
import { ContactPage } from './../contact/contact';
import { Component } from '@angular/core';
import { NavController, AlertController, ModalController, LoadingController, Loading, Platform } from 'ionic-angular';

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
import { SqliteControleAlteracoesService } from '../../providers/sqlite-controleAlteracoes/sqlite-controleAlteracoes';
import { SqliteEstadoService } from '../../providers/sqlite-estado/sqlite-estado.service';
import { ControleAlteracao } from '../../models/controleAlteracao.models';
import { SqliteValorKitService } from '../../providers/sqlite-valorKit/sqlite-valorkit.service';
import { SqliteCidadeService } from '../../providers/sqlite-cidade/sqlite-cidade.service';

//import * as $ from 'jquery';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  cidadesArray: Cidade[];
  _cidadeSelecionada: Cidade;

  estadosArray: Estado[] = [];

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
  _estados: Estado[];
  estadoSelecionado: string;
  cidades: Observable<Cidade[]>;
  _cidades: Cidade[];
  cidadeSelecionada: string;
  currentCidade: Cidade;
  valorKit: Observable<ValorKit[]>;
  _valorKit: ValorKit[];
  currentValorKit: ValorKit; 
  radiacaoCidade: number = 4.42; //valor default


  constructor(
    public alertCtrl: AlertController,
    public db: AngularFireDatabase,
    public cidadeService: CidadeService,
    public controleService: ControleService,
    public estadoService: EstadoService,
    public loadingCtrl: LoadingController,
    public modalCtrl: ModalController,
    public navCtrl: NavController,
    public network: Network,
    private platform: Platform,
    public sqliteCidadeService: SqliteCidadeService,
    public sqliteControleService: SqliteControleAlteracoesService,
    public sqliteEstadoService: SqliteEstadoService, 
    public sqliteValorKitService: SqliteValorKitService,
    public valorKitService: ValorKitService
  ) { }
    
  ionViewDidLoad() {

    /**
     * consultar a data da ultima altera��o local. Caso ela n�o exista nem adianta buscar a data 
     * do servidor pra tentar comparar
     * 
     * gerar consulta para ver se os dados est�o atualizados. Para isso,
     * ser� necess�rio verificar o campo data_ultima_alteracao
     * 
     * se a data ultima alteracao for maior do que a data ultima alteracao local
     * deve-se atualizar os dados
     * 
     * senao, apenas apresenta os dados locais em tela 
     * 
     * 
     * Testar:
     * abrindo o app sem rede (com dados locais e sem)
     */

    // this.estados = this.estadoService.getAll();
    // this.valorKit = this.valorKitService.getAll();

    console.log('abriu!');
    

    this.network.onDisconnect().subscribe(() => {

      // mensagem no console que nao possui conexao.
      console.log('Nao possui conexao com internet :-(');

      this.sqliteControleService.getAll().then((data) => {
        console.log('data local sem conexao::: '+ data.dataUltimaAlteracao);
        
        if (data.dataUltimaAlteracao == "0"){
          //nao possui dados locais criados
          this.showLoading("É necessário acesso a internet para criar os dados localmente!");
        } else {
          this.sqliteEstadoService.getAll()
          .then((estados: Estado[]) => { 
            console.log("Carergou estados na tela>>>>"+estados[0].nome);
            this._estados = estados;
          }).catch((err)=> {
            console.log("Erro ao buscar os Estados em tela! "+err);
          });
    
          this.sqliteValorKitService.getAll()
          .then((valorKits: ValorKit[])=> {
            console.log('Carregou os valorKits em tela!');
            this._valorKit = valorKits;
          }).catch((err)=> {
            console.log("Erro ao buscar os valorKit em tela! "+err);
          });
        }
      });
   });

   console.log('possui conexao');
    
    this.controleService.AtualizaDadosLocais()
    .then(()=>{ 
      let loading: Loading = this.showLoading('Ajustando tabelas...');
      this.sqliteEstadoService.getAll()
      .then((estados: Estado[]) => { 
        console.log("Carergou estados na tela>>>>"+estados[0].nome);
        this._estados = estados;
      }).catch((err)=> {
        console.log("Erro ao buscar os Estados em tela! "+err);
      });

      this.sqliteValorKitService.getAll()
      .then((valorKits: ValorKit[])=> {
        console.log('Carregou os valorKits em tela!');
        this._valorKit = valorKits;
      }).catch((err)=> {
        console.log("Erro ao buscar os valorKit em tela! "+err);
      });
      loading.dismiss();
    }).catch((err)=> {
      console.log("Erro ao atualizar dados locais! "+err);
    });   
  }

  verificaSeExisteTarifaExcedente(mediaKw): void {
    if (this.abvEstadoSelecionado == 'sc' && mediaKw > 150) {
      this.existeTarifaExcedente = true;
    } else {
      this.existeTarifaExcedente = false;
    }
  }

  private showLoading(message): Loading {
    let loading: Loading = this.loadingCtrl.create({
      content: message
    });

    loading.present();
    return loading;
  }

  /**
   * Click do componente de cidades
   */
  carregaCidadesArray() {
    let loading: Loading = this.showLoading('Carregando cidades...');

    // if (this.cidadeService.listaCidades != null){
    //   this.cidadesArray = this.cidadeService.listaCidades;     
    // }

    this.cidadesArray = this._cidades;

    setTimeout(()=>{
      loading.dismiss();
    },900);
  }

  carregaCidades(mediaKw): void {
    this.sqliteCidadeService.getAll(this.estadoSelecionado)
    .then((cidades) => { 
      this._cidades = cidades;
    })
    .catch((err)=> {
      console.log("Erro na execucao! Parar execucao e dar mensagem ao usuario."+err);
    });
    
    //this.cidades = this.cidadeService.getAll(this.estadoSelecionado);
    this.abvEstadoSelecionado = this.estadoSelecionado.toLowerCase();
    this.cidadeSelecionada = null;
    this.currentCidade = null;
    this._cidadeSelecionada = null;
    this.verificaSeExisteTarifaExcedente(mediaKw);

    //at� passar a usar a base de dados local � necess�rio deixar esse load para impedir o usuario
    //de abrir o modal de ciades sem nenhuma cidade carregada
    let loading: Loading = this.showLoading('Carregando cidades...');
    setTimeout(()=>{
      loading.dismiss();
    },1900);
  }

  cidadeChange(event: { component: SelectSearch, value: any }) {    
    this.currentCidade = new Cidade(event.value.nome, event.value.radiacao);
    this.cidadeSelecionada = event.value.id;
    this.radiacaoCidade = parseFloat(this.currentCidade.radiacao);
  }

  mudaCidadeSelecionada(): void {
    //ao mudar o estado selecionado nao existe cidade selecionada
    //dava erro ao tentar ler a propriedade radiacao sem ter cidade selecionada  
    if (this.cidadeSelecionada == null) {
      return;
    }

    this.currentCidade = this._cidades.filter(x=> x.$key == this.cidadeSelecionada)[0];
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
    
    if (valorWatt == 0) return; //n�o deve continuar o c�lculo

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
  * Calcula a economia gerada pela instalacao do kit solar.
  * Ex.: Seria gasto 30 mil em 25 anos, porem o kit solar custou apenas 10 mil reais.
  *      Logo, a economia sera de 20 mil reais. 
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
        //aplica a inflacao uma vez ao ano
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
      valorWatt = this._valorKit.filter(x => x.$key == "ate5")[0].valor
		}
		else if (sistemaSolarComercial <= 10)	{
      valorWatt = this._valorKit.filter(x => x.$key == "de5a10")[0].valor
		}
		else if (sistemaSolarComercial <= 15)	{
      valorWatt = this._valorKit.filter(x => x.$key == "de10a15")[0].valor
		}
		else if (sistemaSolarComercial <= 20)	{
			valorWatt = this._valorKit.filter(x => x.$key == "de15a20")[0].valor
		}
		else if (sistemaSolarComercial <= 25)	{
      valorWatt = this._valorKit.filter(x => x.$key == "de20a25")[0].valor
		}
		else if (sistemaSolarComercial <= 30)	{
      valorWatt = this._valorKit.filter(x => x.$key == "de25a30")[0].valor
		}
		else if (sistemaSolarComercial <= 35)	{
      valorWatt = this._valorKit.filter(x => x.$key == "de30a35")[0].valor
		}
		else if (sistemaSolarComercial <= 40)	{
      valorWatt = this._valorKit.filter(x => x.$key == "de35a40")[0].valor
		}
		else if (sistemaSolarComercial <= 45)	{
      valorWatt = this._valorKit.filter(x => x.$key == "de40a45")[0].valor
		}
		else if (sistemaSolarComercial <= 50)	{
      valorWatt = this._valorKit.filter(x => x.$key == "de45a50")[0].valor
		}
		else if (sistemaSolarComercial <= 55)	{
      valorWatt = this._valorKit.filter(x => x.$key == "de50a55")[0].valor
		}
		else if (sistemaSolarComercial <= 60)	{
      valorWatt = this._valorKit.filter(x => x.$key == "de55a60")[0].valor
		}
		else if (sistemaSolarComercial <= 65)	{
      valorWatt = this._valorKit.filter(x => x.$key == "de60a65")[0].valor
		}
		else if (sistemaSolarComercial <= 70)	{
      valorWatt = this._valorKit.filter(x => x.$key == "de65a70")[0].valor
		}
		else if (sistemaSolarComercial <= 75)	{
      valorWatt = this._valorKit.filter(x => x.$key == "de70a75")[0].valor
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

