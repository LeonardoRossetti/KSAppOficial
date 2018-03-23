import { NgModule } from '@angular/core';
import { InfoComponent } from './info/info';
import { ResultComponent } from './result/result';
import { CustomHeaderComponent } from './custom-header/custom-header';
@NgModule({
	declarations: [InfoComponent,
    ResultComponent,
    CustomHeaderComponent],
	imports: [],
	exports: [InfoComponent,
    ResultComponent,
    CustomHeaderComponent]
})
export class ComponentsModule {}
