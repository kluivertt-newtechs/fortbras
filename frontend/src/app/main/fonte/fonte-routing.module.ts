import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FonteComponent } from './fonte/fonte.component';
import { FonteInfoComponent } from './fonte-info/fonte-info.component';
import { FonteIndiceComponent } from './fonte-indice/fonte-indice.component';
import { FonteDetailComponent } from './fonte-detail/fonte-detail.component';

const routes: Routes = [
    {
        path: '',
        component: FonteComponent,
        children: [
            { path: 'indice/:id', component: FonteIndiceComponent },
            { path: 'info/:id', component: FonteInfoComponent },
            { path: 'detail/:uuid/:id', component: FonteDetailComponent },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class FonteRoutingModule { }
