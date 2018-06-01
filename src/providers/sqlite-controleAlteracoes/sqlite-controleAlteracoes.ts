import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SqliteHelperService } from '../sqlite-helper/sqlite-helper.service';
import { SQLiteObject } from '@ionic-native/sqlite';
import { ControleAlteracao } from './../../models/controleAlteracao.models';

@Injectable()
export class SqliteControleAlteracoesService {
  private db: SQLiteObject;
  private isFirstCall: boolean = true;
  //data: any;
  
  constructor(
    public http: HttpClient,
    public sqliteHelperService: SqliteHelperService
  ) {} 
  
  private getDb(): Promise<SQLiteObject>{  
    if(this.isFirstCall){
      this.isFirstCall = false;
      return this.sqliteHelperService.getDb('ks.db')
        .then((db: SQLiteObject) => {
          this.db = db;
          this.db.executeSql(`CREATE TABLE IF NOT EXISTS __controle(
            _id INTEGER PRIMARY KEY AUTOINCREMENT,
            key TEXT,
            dataUltimaAlteracao TEXT)`,{})

          .then(success => console.log('Controle table created successfully!',success))      
          .catch((error: Error) =>
            console.log('Error creating movie table!', error
          ));
        return this.db;  
      });
    }
    
    return this.sqliteHelperService.getDb();
  }
  
  getAll(): Promise<ControleAlteracao>{
    return this.getDb()
      .then((db: SQLiteObject) => {
        return this.db.executeSql(`SELECT * FROM __controle`, {})
          .then(resultSet => {
            let controle: ControleAlteracao = new ControleAlteracao("0");
            for(let i = 0; i < resultSet.rows.length; i++){
              controle = resultSet.rows.item(i);
            }
            return controle;
          })
          .catch((error: Error) => {
            let errorMsg: string = 'Error executing method getAll!' + error;
            console.log(errorMsg);
            return Promise.reject(errorMsg);
          })
      });
  }

  create(controle: ControleAlteracao): Promise<ControleAlteracao>{
    return this.getDb()
      .then((db: SQLiteObject) => {
        return this.db.executeSql('INSERT INTO __controle (key, dataUltimaAlteracao) VALUES (?, ?)', [controle.$key, controle.dataUltimaAlteracao])
          .then(resultSet => {
            controle.$key = resultSet.insertId;
            return controle;
          }).catch((error: Error) => {
            let errorMsg: string = `Error to create controle ${controle.$key}!` + error;
            console.log(errorMsg);
            return Promise.reject(errorMsg);
          });
    });
  }

  update(dataUltimaAlteracao:string): Promise<boolean>{
    return this.db.executeSql('UPDATE __controle SET dataUltimaAlteracao=?', [dataUltimaAlteracao])
      .then(resultSet => resultSet.rowsAffected >= 0)
      .catch((error: Error) => {
        let errorMsg: string = `Error to update data: ${dataUltimaAlteracao}!` + error;
        console.log(errorMsg);
        return Promise.reject(errorMsg);
      });
  }

  delete(id: number): Promise<boolean>{
    return this.db.executeSql('DELETE __controle',[])
      .then(resultSet => resultSet.rowsAffected > 0)
      .catch((error: Error) => {
        let errorMsg: string = `Error deleting controle with key ${id}!` + error;
        console.log(errorMsg);
        return Promise.reject(errorMsg);
      });
  }

  getExistsId(key: number): Promise<boolean>{
    return this.db.executeSql('SELECT * FROM __controle where key=?', [key])
    .then(resultSet => resultSet.rows > 0)
    .catch((error: Error) => {
      let errorMsg: string = `Error fetching controle with key ${key}!` + error;
      console.log(errorMsg);
      return Promise.reject(errorMsg);
    });
  }


}
