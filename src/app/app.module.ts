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
import { ServidorProvider } from '../providers/servidor/servidor';
import { TabsPage } from '../pages/tabs/tabs';

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
    IonicModule.forRoot(MyApp)
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
    ServidorProvider,
    SplashScreen,
    StatusBar
  ]
})
export class AppModule {}
