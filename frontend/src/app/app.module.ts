import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PoModule } from '@po-ui/ng-components';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { PoPageLoginModule, PoTemplatesModule } from '@po-ui/ng-templates';
import { FormsModule } from '@angular/forms';
import { PoCodeEditorModule } from '@po-ui/ng-code-editor';

@NgModule({
    declarations: [AppComponent],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        AppRoutingModule,
        PoModule,
        PoCodeEditorModule,
        HttpClientModule,
        RouterModule.forRoot([]),
        PoTemplatesModule,
        FormsModule,
        PoPageLoginModule,
        PoCodeEditorModule,
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule { }
