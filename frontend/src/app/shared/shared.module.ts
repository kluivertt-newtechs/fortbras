import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PoModule } from '@po-ui/ng-components';
import { PoTemplatesModule } from '@po-ui/ng-templates';
import { RequiredFieldWarningComponent } from './required-field-warning/required-field-warning.component';

@NgModule({
    declarations: [RequiredFieldWarningComponent],
    imports: [
        CommonModule,
        HttpClientModule,
        FormsModule,
        ReactiveFormsModule,
        PoModule,
        PoTemplatesModule,
    ],
    exports: [
        HttpClientModule,
        FormsModule,
        ReactiveFormsModule,
        PoModule,
        PoTemplatesModule,
        RequiredFieldWarningComponent,
    ],
})
export class SharedModule { }
