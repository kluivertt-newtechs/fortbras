import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FonteRoutingModule } from './fonte-routing.module';
import { FonteComponent } from './fonte/fonte.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { FonteInfoComponent } from './fonte-info/fonte-info.component';
import { FonteIndiceComponent } from './fonte-indice/fonte-indice.component';
import { FonteDetailComponent } from './fonte-detail/fonte-detail.component';

@NgModule({
  declarations: [FonteComponent, FonteInfoComponent, FonteIndiceComponent, FonteDetailComponent],
  imports: [CommonModule, FonteRoutingModule, SharedModule],
})
export class FonteModule {}
