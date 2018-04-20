import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SqliteHelperService } from '../sqlite-helper/sqlite-helper.service';
import { SQLiteObject } from '@ionic-native/sqlite';

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
        .then((db:
        SQLiteObject) => {
          this.db = db;
          this.db.executeSql(`CREATE TABLE IF NOT EXISTS estado(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT,
            sigla TEXT)`,{})

          .then(success => console.log('Estado table created successfully!',success))      
          .catch((error: Error) =>
            console.log('Error creating movie table!', error
          ));
        return this.db;  
      });
    }
    
    return this.sqliteHelperService.getDb();
  }

}
