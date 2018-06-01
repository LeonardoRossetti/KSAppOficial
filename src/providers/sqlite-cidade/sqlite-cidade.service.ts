import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SqliteHelperService } from '../sqlite-helper/sqlite-helper.service';
import { SQLiteObject } from '@ionic-native/sqlite';
import { Cidade } from '../../models/cidades.models';

@Injectable()
export class SqliteCidadeService {
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
          this.db.executeSql(`CREATE TABLE IF NOT EXISTS __cidade(
            _id INTEGER PRIMARY KEY AUTOINCREMENT,
            id TEXT,
            nome TEXT,
            radiacao TEXT)`,{})
          .then(success => console.log('Cidade table created successfully!',success))      
          .catch((error: Error) =>
            console.log('Error creating Cidade table!', error
          ));
        return this.db;  
      });
    }
    
    return this.sqliteHelperService.getDb();
  }

/**
 * As cidades possuem um campo Id único no firebsae, sendo que os Ids correspondem a:
 * 2784 - 3182: Paraná
 * 3850 - 4345: Rio Grande do Sul
 * 4413 - 4785: Santa Catarina
 */  
  getAll(estado: String): Promise<Cidade[]>{
    let de: string = "4413";
    let ate: string = "4785";    
    switch(estado){
      case 'PR':
        de="2784";
        ate="3182";
        break;
      case 'RS':
        de="3850";
        ate="4345";
      break;
    }
    return this.getDb()
      .then((db: SQLiteObject) => {        
        return this.db.executeSql(`SELECT * FROM __cidade WHERE id >=? AND id <=?`, [de, ate])
          .then(resultSet => {
            let list: Cidade[] = [];

            for(let i = 0; i < resultSet.rows.length; i++){
              let cidade = new Cidade(resultSet.rows.item(i).nome, 
              resultSet.rows.item(i).radiacao, resultSet.rows.item(i).id);
              list.push(cidade);
            }

            return list;
          })
          .catch((error: Error) => {
            let errorMsg: string = 'Error executing method getAll!' + error;
            console.log(errorMsg);
            return Promise.reject(errorMsg);
          })
      });
  }

  create(cidade: Cidade): Promise<Cidade>{    
    return this.getDb()
    .then((db: SQLiteObject) => {    
        return this.db.executeSql('INSERT INTO __cidade (id, nome, radiacao) VALUES (?, ?, ?)', [cidade.$key, cidade.nome, cidade.radiacao])
          .then(resultSet => {
            //cidade.$key = resultSet.insertId;
            return cidade;
          }).catch((error: Error) => {
            let errorMsg: string = `Error to create Cidade ${cidade.nome}!` + error;
            console.log(errorMsg);
            return Promise.reject(errorMsg);
          });
    });
  }

  update(cidade: Cidade): Promise<boolean>{
    return this.db.executeSql('UPDATE __cidade SET radiacao=? WHERE id=?', [cidade.radiacao, cidade.$key])
      .then(resultSet => resultSet.rowsAffected >= 0)
      .catch((error: Error) => {
        let errorMsg: string = `Error to update Cidade ${cidade.nome}!` + error;
        console.log(errorMsg);
        return Promise.reject(errorMsg);
      });
  }

  delete(id: number): Promise<boolean>{
    return this.db.executeSql('DELETE __cidade WHERE key=?', [id])
      .then(resultSet => resultSet.rowsAffected > 0)
      .catch((error: Error) => {
        let errorMsg: string = `Error deleting Cidade with key ${id}!` + error;
        console.log(errorMsg);
        return Promise.reject(errorMsg);
      });
  }
    
  getById(key: number): Promise<Cidade>{
    return this.db.executeSql('SELECT * FROM Cidade where _id=?', [key])
    .then(resultSet => resultSet.rows.item(0))
    .catch((error: Error) => {
      let errorMsg: string = `Error fetching Cidade with key ${key}!` + error;
      console.log(errorMsg);
      return Promise.reject(errorMsg);
    });
  }

  getExistsId(key: number): Promise<boolean>{
    return this.db.executeSql('SELECT * FROM Cidade where key=?', [key])
    .then(resultSet => resultSet.rows > 0)
    .catch((error: Error) => {
      let errorMsg: string = `Error fetching Cidade with key ${key}!` + error;
      console.log(errorMsg);
      return Promise.reject(errorMsg);
    });
  }
}
