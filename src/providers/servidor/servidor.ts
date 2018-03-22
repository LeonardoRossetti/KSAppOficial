import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class ServidorProvider {

  constructor(public http: HttpClient) {
    console.log('Hello ServidorProvider Provider');
  }

   getStates(): string[]{
    let estados = ['Santa Catarina', 'Parana', 'Rio Grande do Sul'];
    return estados;
  }

  getCities(estado): string []{    
    let cities = ['Cidade 1', 'Cidade 2'];
    return cities;
  }

}
