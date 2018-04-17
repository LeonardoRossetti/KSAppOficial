import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import { AngularFireDatabase, AngularFireObject } from "angularfire2/database";

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
    public db: AngularFireDatabase,
    public http: Http,
    public loadingCtrl: LoadingController
  ) {
    super();
  }

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
        (ref: firebase.database.Reference) => ref
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