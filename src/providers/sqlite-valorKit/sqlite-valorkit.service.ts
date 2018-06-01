import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SqliteHelperService } from '../sqlite-helper/sqlite-helper.service';
import { SQLiteObject } from '@ionic-native/sqlite';
import { ValorKit } from '../../models/ValorKit.models';

@Injectable()
export class SqliteValorKitService {
  private db: SQLiteObject;
  private isFirstCall: boolean = true;

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
          this.db.executeSql(`CREATE TABLE IF NOT EXISTS __valorKit(
            _id INTEGER PRIMARY KEY AUTOINCREMENT,
            key TEXT,
            nome TEXT,
            valor TEXT)`,{})
          .then(success => console.log('ValorKit table created successfully!',success))      
          .catch((error: Error) =>
            console.log('Error creating ValorKit table!', error
          ));
        return this.db;  
      });
    }
    
    return this.sqliteHelperService.getDb();
  }
  
  getAll(): Promise<ValorKit[]>{
    return this.getDb()
      .then((db: SQLiteObject) => {
        return this.db.executeSql(`SELECT * FROM __valorKit`, {})
          .then(resultSet => {            
            let list: ValorKit[] = [];

            for(let i = 0; i < resultSet.rows.length; i++){
              let valorKit = new ValorKit(resultSet.rows.item(i).valor, resultSet.rows.item(i).nome);
              valorKit.$key = resultSet.rows.item(i).key;
              list.push(valorKit);
            }

            return list;
          })
          .catch((error: Error) => {
            let errorMsg: string = 'Error executing method getAll ValorKits!' + error;
            console.log(errorMsg);
            return Promise.reject(errorMsg);
          })
      });
  }

  create(valorKit: ValorKit): Promise<ValorKit>{
    return this.getDb()
    .then((db: SQLiteObject) => {    
        return this.db.executeSql('INSERT INTO __valorKit (key, nome, valor) VALUES (?, ?, ?)', [valorKit.$key, valorKit.nome, valorKit.valor])
          .then(resultSet => {            
            return valorKit;
          }).catch((error: Error) => {
            let errorMsg: string = `Error to create ValorKit ${valorKit.nome}!` + error;
            console.log(errorMsg);
            return Promise.reject(errorMsg);
          });
    });
  }

  update(valorKit: ValorKit): Promise<boolean>{
    return this.db.executeSql('UPDATE __valorKit SET valor=? WHERE key=?', [valorKit.nome, valorKit.$key])
      .then(resultSet => resultSet.rowsAffected >= 0)
      .catch((error: Error) => {
        let errorMsg: string = `Error to update ValorKit ${valorKit.nome}!` + error;
        console.log(errorMsg);
        return Promise.reject(errorMsg);
      });
  }

  delete(id: number): Promise<boolean>{
    return this.db.executeSql('DELETE __valorKit WHERE key=?', [id])
      .then(resultSet => resultSet.rowsAffected > 0)
      .catch((error: Error) => {
        let errorMsg: string = `Error deleting ValorKit with key ${id}!` + error;
        console.log(errorMsg);
        return Promise.reject(errorMsg);
      });
  }
    
  getById(key: number): Promise<ValorKit>{
    return this.db.executeSql('SELECT * FROM ValorKit where key=?', [key])
    .then(resultSet => resultSet.rows.item(0))
    .catch((error: Error) => {
      let errorMsg: string = `Error fetching ValorKit with key ${key}!` + error;
      console.log(errorMsg);
      return Promise.reject(errorMsg);
    });
  }

  getExistsId(key: number): Promise<boolean>{
    return this.db.executeSql('SELECT * FROM ValorKit where key=?', [key])
    .then(resultSet => resultSet.rows > 0)
    .catch((error: Error) => {
      let errorMsg: string = `Error fetching ValorKit with key ${key}!` + error;
      console.log(errorMsg);
      return Promise.reject(errorMsg);
    });
  }


}
