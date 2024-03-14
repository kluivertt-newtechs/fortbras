import { AfterViewInit, Component, ElementRef, OnInit } from '@angular/core';
import { OnSameUrlNavigation, Router } from '@angular/router';
import { PoMenuItem } from '@po-ui/ng-components';
import { DicionarioService } from '../dicionario/services/dicionario.service';
import { FonteService } from '../fonte/services/fonte.service';

@Component({
    selector: 'app-main',
    templateUrl: './main.component.html',
    styleUrls: ['./main.component.css'],
})
export class MainComponent implements OnInit, AfterViewInit {
    menus: Array<PoMenuItem> = [
        {
            label: 'Home',
            link: '/main/home/',
            icon: 'po-icon po-icon-home',
            shortLabel: 'Home',
        },
        {
            label: 'Dicionários',
            link: '/main/dicionario',
            icon: 'po-icon po-icon-book',
            shortLabel: 'Dicionários',
            subItems: [],
        },
        {
            label: 'Fontes',
            link: '/main/fonte',
            icon: 'po-icon po-icon-database',
            shortLabel: 'Fontes',
            subItems: [],
        },
    ];

    constructor(
        private router: Router,
        private dicionarioService: DicionarioService,
        private fonteService: FonteService,
        private elRef: ElementRef,
    ) {}

    ngOnInit() {
        this.dicionarioService.getDicionarios({}).subscribe({
            next: (data) => {
                const res: any = [];
                data.items.forEach((item: any) => {
                    res.push({
                        label: item.label,
                        link: `/main/dicionario/info/${item.uuid}`,
                    });
                });
                this.menus[1].subItems = [...res];
            },
            error: (error) => {
                console.error(error);
            },
        });
        this.fonteService.getFontes({}).subscribe({
            next: (data) => {
                const res: any = [];
                data.items.forEach((item: any) => {
                    res.push({
                        label: item.label,
                        link: `/main/fonte/info/${item.uuid}`,
                    });
                });
                this.menus[2].subItems = [...res];
            },
            error: (error) => {
                console.error(error);
            },
        });
    }

    ngAfterViewInit() {
        const link = this.elRef.nativeElement.querySelector(
            'body > app-root > app-main > div > po-menu > div > div.po-menu > div.po-menu-container > div.po-menu-header > div > po-logo > a',
        );
        link.href = '#';
    }
}
