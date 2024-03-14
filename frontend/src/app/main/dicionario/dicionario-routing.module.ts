import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DicionarioComponent } from './dicionario.component';
import { DicionarioInfoComponent } from './dicionario-info/dicionario-info.component';

const routes: Routes = [
    {
        path: '',
        component: DicionarioComponent,
        children: [{ path: 'info/:id', component: DicionarioInfoComponent }],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class DicionarioRoutingModule { }
