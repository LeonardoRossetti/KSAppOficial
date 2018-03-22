import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'moeda',
})
export class MoedaPipe implements PipeTransform {

  transform(value: string, ...args) {
    
    let valor = parseInt(value);
    if (valor < 0){
      valor = 0;
    }
    
    value = valor.toString();

    if (value.length == 4){
      value = `${value.substr(0,1)}.${value.substr(1)}`;
    }
    else if (value.length == 5){
      value = `${value.substr(0,2)}.${value.substr(2)}`;
    }
    else if (value.length == 6){
      value = `${value.substr(0,3)}.${value.substr(3)}`;
    }
    else if (value.length == 7){
      value = `${value.substr(0,1)}.${value.substr(1,3)}.${value.substr(4)}`;
    }
    else if (value.length == 8){
      value = `${value.substr(0,2)}.${value.substr(2,3)}.${value.substr(5)}`;
    }
    else if (value.length == 9){
      value = `${value.substr(0,3)}.${value.substr(3,3)}.${value.substr(6)}`;
    }    
    
    return `R$ ${value},00`;
  }
}
