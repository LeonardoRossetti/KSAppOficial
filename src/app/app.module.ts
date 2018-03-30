import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { HttpClientModule } from '@angular/common/http';
import { HttpModule } from '@angular/http';
import { NgModule, ErrorHandler } from '@angular/core';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { AboutPage } from '../pages/about/about';
import { ContactPage } from '../pages/contact/contact';
import { CustomHeaderComponent } from './../components/custom-header/custom-header.component';
import { HomePage } from '../pages/home/home';
import { InfoComponent } from '../components/info/info';
import { MoedaPipe } from './../pipes/moeda/moeda';
import { MyApp } from './app.component';
import { ResultComponent } from '../components/result/result';
import { TabsPage } from '../pages/tabs/tabs';

import { CidadeService } from '../providers/cidade/cidade.service';
import { EstadoService } from '../providers/estado/estado.service';
import { ValorKitService } from './../providers/valorKit/valorKit.service';

import { AngularFireModule, FirebaseAppConfig } from 'angularfire2';
import { AngularFireDatabaseModule } from 'angularfire2/database';

const firebaseAppConfig: FirebaseAppConfig = {
  apiKey: "AIzaSyDJk6rV_N4xq8cmFYov5xqalcv-RrOKkqQ",
  authDomain: "ionic2-ks.firebaseapp.com",
  databaseURL: "https://ionic2-ks.firebaseio.com",
  projectId: "ionic2-ks",
  storageBucket: "ionic2-ks.appspot.com",
  messagingSenderId: "973664543161"
}

@NgModule({
  declarations: [
    AboutPage,
    ContactPage,
    CustomHeaderComponent,
    HomePage,
    InfoComponent,
    MoedaPipe,
    MyApp,
    ResultComponent,
    TabsPage
  ],
  imports: [
    BrowserModule,
    HttpModule,
    HttpClientModule,
    IonicModule.forRoot(MyApp),
    AngularFireModule.initializeApp(firebaseAppConfig),
    AngularFireDatabaseModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    AboutPage,
    ContactPage,
    HomePage,
    InfoComponent,
    MyApp,
    ResultComponent,
    TabsPage
  ],
  providers: [
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    SplashScreen,
    StatusBar,
    CidadeService,
    EstadoService,
    ValorKitService
  ]
})
export class AppModule {}
