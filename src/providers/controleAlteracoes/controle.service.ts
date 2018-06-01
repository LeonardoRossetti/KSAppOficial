import { ValorKitService } from './../valorKit/valorKit.service';
import { SqliteCidadeService } from './../sqlite-cidade/sqlite-cidade.service';
import { CidadeService } from './../cidade/cidade.service';
import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import { AngularFireDatabase, AngularFireObject, AngularFireList } from "angularfire2/database";

import { BaseService } from "./../base.service";

import * as firebase from 'firebase/app';
import 'firebase/storage';
import { Loading, LoadingController } from 'ionic-angular';
import { SqliteEstadoService } from '../sqlite-estado/sqlite-estado.service';
import { SqliteControleAlteracoesService } from '../sqlite-controleAlteracoes/sqlite-controleAlteracoes';
import { ControleAlteracao } from '../../models/controleAlteracao.models';
import { EstadoService } from '../estado/estado.service';
import { Estado } from '../../models/estados.models';

import 'rxjs/add/operator/toPromise';
import { Cidade } from '../../models/cidades.models';
import { SqliteValorKitService } from '../sqlite-valorKit/sqlite-valorkit.service';
import { ValorKit } from '../../models/valorkit.models';

@Injectable()
export class ControleService extends BaseService {

  currentControle: AngularFireObject<ControleAlteracao>;
  controle: ControleAlteracao;
  controles: Observable<ControleAlteracao[]>;

  constructor(
    public db: AngularFireDatabase,
    public cidadeService: CidadeService,
    public estadoService: EstadoService,
    public http: Http,
    public loadingCtrl: LoadingController,
    public sqliteCidadeService: SqliteCidadeService,
    public sqliteControleAlteracoesService: SqliteControleAlteracoesService,
    public sqliteControleService: SqliteControleAlteracoesService,
    public sqliteEstadoService: SqliteEstadoService,
    public sqliteValorKitService: SqliteValorKitService,
    public valorKitService: ValorKitService
  ) {
    super();  
  }

  CriaEstados():Promise<any> {
    return new Promise((resolve, reject) => {
      this.estadoService.getAllEstados()
      .subscribe((estados: Estado[]) => {
        estados.forEach((estado:Estado)=> {
          this.sqliteEstadoService.create(estado);
        });
        resolve();
      });
    });
  }

  CriaCidadesSC():Promise<any>{
    return new Promise((resolve, reject)=>{
      this.cidadeService.getAllCidades("SC")
      .subscribe((cidades: Cidade[]) => {
        cidades.forEach((cidade:Cidade)=> {
          this.sqliteCidadeService.create(cidade);
        });
        resolve();
      });
    });
  }

  CriaCidadesPR():Promise<any>{
    return new Promise((resolve, reject)=>{
      this.cidadeService.getAllCidades("PR")
      .subscribe((cidades: Cidade[]) => {
        cidades.forEach((cidade:Cidade)=> {
          this.sqliteCidadeService.create(cidade);
        });
        resolve();
      });
    });  
  }

  CriaCidadesRS():Promise<any>{
    return new Promise((resolve, reject)=>{
      this.cidadeService.getAllCidades("RS")
      .subscribe((cidades: Cidade[]) => {
        cidades.forEach((cidade:Cidade)=> {
          this.sqliteCidadeService.create(cidade);
        });
        resolve();
      });
    });
  }

  CriaValorKit():Promise<any>{
    return new Promise((resolve, reject)=>{
      this.valorKitService.getAllValorKit()
      .subscribe((valorKits: ValorKit[])=> {
        valorKits.forEach((valorKit: ValorKit)=> {
          //console.log(valorKit.$key + ": "+ valorKit.valor);
          this.sqliteValorKitService.create(valorKit);
        });
        resolve();
      });
    });
  }

  AtualizaValorKit():Promise<any>{
    return new Promise((resolve, reject)=>{
      this.valorKitService.getAllValorKit()
      .subscribe((valorKits: ValorKit[])=> {
        valorKits.forEach((valorKit: ValorKit)=>{
          //console.log(valorKit.$key + ": "+ valorKit.valor);
          this.sqliteValorKitService.update(valorKit);
        });
        resolve();
      });
    });
  }
  
  AtualizaDadosLocais(): Promise<any> {
    return new Promise((resolve, reject) => {
      let loading: Loading = this.showLoading();

      this.mapListKeys<ControleAlteracao>(
        this.db.list<ControleAlteracao>(`/ControleAlteracao`, 
          (ref: firebase.database.Reference) => ref)
      )
      .subscribe((controleServidor: ControleAlteracao[]) => {
        let dataServidor: string = controleServidor[0].dataUltimaAlteracao;
        this.sqliteControleService.getAll()
          .then(data => {
            let dataLocal = data.dataUltimaAlteracao;
            console.log("dataLocal: " +Date.parse(dataLocal));
            console.log("dateServer: "+Date.parse(dataServidor));

            if (dataLocal == "0") {//primeira instalação
              //cria todas as tabelas locais e já popula os dados
              this.sqliteControleAlteracoesService.create(controleServidor[0]).then(()=> {
                //busca os estados do servidor
                this.CriaEstados().then(()=> {
                  console.log('criou estados!');
                  
                  //busca as cidades do servidor
                  this.CriaCidadesSC().then(()=> {
                    console.log('criou SC');
                    this.CriaCidadesPR().then(()=> {
                      console.log('criou PR');
                      this.CriaCidadesRS().then(()=> {
                        console.log('criou RS');
                        //busca os valores dos kits do servidor
                        this.CriaValorKit().then(()=> {
                          console.log('resolveu toda a Criação!');
                          resolve();
                        }).catch((err: Error)=>{
                          reject(err.message + err.stack);
                        });
                      }).catch((err: Error)=>{
                        reject(err.message + err.stack);
                      });
                    }).catch((err: Error)=>{
                      reject(err.message + err.stack);
                    });
                  }).catch((err: Error)=>{
                    reject(err.message + err.stack);
                  });
                }).catch((err: Error)=>{
                  reject(err.message + err.stack);
                });
              }).catch((err: Error)=>{
                reject(err.message + err.stack);
              });
            } else if (Date.parse(dataServidor) > Date.parse(dataLocal)) {
              //atualiza os dados locais
              //obs.: vou deixar atualizar apenas os valores dos kits para ficar mais rápido
              //no futuro implementar uma forma de atualizar apenas os dados de determinado estado
              //como por ex. fazer uma data de atualização para cada estado e uma geral
              
              this.AtualizaValorKit().then(()=> {
                //salva data local com a data do servidor
                this.sqliteControleAlteracoesService.update(dataServidor).then(()=>{
                  console.log('resolveu toda a atualização!');
                  resolve();
                }).catch((err: Error)=>{
                  reject(err.message + err.stack);
                });;
              });
            }
            loading.dismiss();
          }).catch((err: Error)=>{
            reject(err.message + err.stack);
          });
      });
    });
  }

  private showLoading(): Loading {
    let loading: Loading = this.loadingCtrl.create({
      content: 'Carregando dados do servidor...'
    });

    loading.present();
    return loading;
  }

}