import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SqliteHelperService } from '../sqlite-helper/sqlite-helper.service';
import { SQLiteObject } from '@ionic-native/sqlite';
import { Estado } from '../../models/estados.models';

@Injectable()
export class SqliteEstadoService {
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
          this.db.executeSql(`CREATE TABLE IF NOT EXISTS __estado(
            _id INTEGER PRIMARY KEY AUTOINCREMENT,
            id TEXT,
            key TEXT,
            nome TEXT,
            sigla TEXT)`,{})
          .then(success => console.log('Estado table created successfully!',success))      
          .catch((error: Error) =>
            console.log('Error creating estado table!', error
          ));
        return this.db;  
      });
    }
    
    return this.sqliteHelperService.getDb();
  }
  
  getAll(): Promise<Estado[]>{
    console.log('busca estadosss');
    
    return this.getDb()
      .then((db: SQLiteObject) => {
        return this.db.executeSql(`SELECT * FROM __estado`, {})
          .then(resultSet => {
            let list: Estado[] = [];

            for(let i = 0; i < resultSet.rows.length; i++){
              let estado = new Estado(resultSet.rows.item(i).key, resultSet.rows.item(i).nome, resultSet.rows.item(i).sigla)
              list.push(estado);
            }

            return list;
          })
          .catch((error: Error) => {
            let errorMsg: string = 'Error executing method getAll Estados!' + error.message + " Stack: "+ error.stack;

            console.log(errorMsg);
            return Promise.reject(errorMsg);
          })
      });
  }

  create(estado: Estado): Promise<Estado>{
    return this.getDb()
    .then((db: SQLiteObject) => {    
        return this.db.executeSql('INSERT INTO __estado (id, key, nome, sigla) VALUES (?, ?, ?, ?)', [estado.id, estado.$key, estado.nome, estado.sigla])
          .then(resultSet => {            
            estado.id = resultSet.insertId;
            return estado;
          }).catch((error: Error) => {
            let errorMsg: string = `Error to create estado ${estado.nome}!` + error;
            console.log(errorMsg);
            return Promise.reject(errorMsg);
          });
    });
  }

  update(estado: Estado): Promise<boolean>{
    return this.db.executeSql('UPDATE __estado SET id=?, key=?, nome=?, sigla=? WHERE key=?', [estado.id, estado.$key, estado.nome, estado.sigla, estado.$key])
      .then(resultSet => resultSet.rowsAffected >= 0)
      .catch((error: Error) => {
        let errorMsg: string = `Error to update estado ${estado.nome}!` + error;
        console.log(errorMsg);
        return Promise.reject(errorMsg);
      });
  }

  delete(id: number): Promise<boolean>{
    return this.db.executeSql('DELETE __estado WHERE key=?', [id])
      .then(resultSet => resultSet.rowsAffected > 0)
      .catch((error: Error) => {
        let errorMsg: string = `Error deleting estado with key ${id}!` + error;
        console.log(errorMsg);
        return Promise.reject(errorMsg);
      });
  }
    
  getById(key: number): Promise<Estado>{
    return this.db.executeSql('SELECT * FROM estado where key=?', [key])
    .then(resultSet => resultSet.rows.item(0))
    .catch((error: Error) => {
      let errorMsg: string = `Error fetching estado with key ${key}!` + error;
      console.log(errorMsg);
      return Promise.reject(errorMsg);
    });
  }

  getExistsId(key: number): Promise<boolean>{
    return this.db.executeSql('SELECT * FROM estado where key=?', [key])
    .then(resultSet => resultSet.rows > 0)
    .catch((error: Error) => {
      let errorMsg: string = `Error fetching estado with key ${key}!` + error;
      console.log(errorMsg);
      return Promise.reject(errorMsg);
    });
  }


}
