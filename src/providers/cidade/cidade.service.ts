import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import { Observable } from 'rxjs';
//import { map } from 'rxjs/operators/map';

//import { FirebaseApp } from "angularfire2";
//import { AngularFireAuth } from "angularfire2/auth";
import { AngularFireDatabase, AngularFireObject/*, AngularFireList*/ } from "angularfire2/database";

import { BaseService } from "./../base.service";
import { Cidade } from './../../models/cidades.models';

import * as firebase from 'firebase/app';
import 'firebase/storage';
import { Loading, LoadingController } from 'ionic-angular';

@Injectable()
export class CidadeService extends BaseService {

  cidades: Observable<Cidade[]>;
  currentCidade: AngularFireObject<Cidade>;
  listaCidades: Cidade[];

  constructor(
    //public afAuth: AngularFireAuth,
    public db: AngularFireDatabase,
    //public firebaseApp: FirebaseApp,
    public http: Http,
    public loadingCtrl: LoadingController
  ) {
    super();  
  }

  // private setCidades(uidToExclude: string): void {
  //   this.cidades = this.mapListKeys<Cidade>(
  //     this.db.list<Cidade>(`/cidades`, 
  //       (ref: firebase.database.Reference) => ref.orderByChild('nome')
  //     )
  //   )
  //   .map((cidades: Cidade[]) => {      
  //     return cidades.filter((Cidade: Cidade) => Cidade.$key !== uidToExclude);
  //   });
  // }

  edit(Cidade: {radiacao: string}): Promise<void> {
    return this.currentCidade
      .update(Cidade)
      .catch(this.handlePromiseError);
  }

  CidadeExists(Cidadenome: string): Observable<boolean> {
    return this.db.list(`/cidades`, 
      (ref: firebase.database.Reference) => ref.orderByChild('nome').equalTo(Cidadenome)
    )
    .valueChanges()
    .map((cidades: Cidade[]) => {
      return cidades.length > 0;
    }).catch(this.handleObservableError);
  }

  get(cidade: string, estado: string): AngularFireObject<Cidade> {
    return this.db.object<Cidade>(`/cidades/${estado}/${cidade}`);
  }

  getAll(estado): Observable<Cidade[]> {

    let loading: Loading = this.showLoading();

    this.cidades = this.mapListKeys<Cidade>(
      this.db.list<Cidade>(`/cidades/${estado}`, 
        (ref: firebase.database.Reference) => ref//.orderByChild('nome')
      )
    )
    .map((cidades: Cidade[]) => {
      this.listaCidades = cidades;
      loading.dismiss();
      return cidades;
    });

    return this.cidades;
  }

  private showLoading(): Loading {
    let loading: Loading = this.loadingCtrl.create({
      content: 'Carregando cidades...'
    });

    loading.present();

    return loading;
  }

}