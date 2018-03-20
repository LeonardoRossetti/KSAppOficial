import { NgModule } from '@angular/core';
import { InfoComponent } from './info/info';
import { ResultComponent } from './result/result';
@NgModule({
	declarations: [InfoComponent,
    ResultComponent],
	imports: [],
	exports: [InfoComponent,
    ResultComponent]
})
export class ComponentsModule {}
