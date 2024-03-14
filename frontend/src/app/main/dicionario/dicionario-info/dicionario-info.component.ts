import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DicionarioService } from '../services/dicionario.service';
import {
    PoBreadcrumbItem,
    PoNotificationService,
    PoPageAction,
} from '@po-ui/ng-components';
import { withFetch } from '@angular/common/http';
import * as XLSX from 'xlsx';

@Component({
    selector: 'app-dicionario-info',
    templateUrl: './dicionario-info.component.html',
    styleUrls: ['./dicionario-info.component.css'],
})
export class DicionarioInfoComponent {
    isHideLoading: boolean = true;
    isHideLoadingExportar: boolean = true;

    pageActions: PoPageAction[] = [
        {
            label: 'Deletar Análise',
            disabled: !this.isHideLoading,
            action: this.onDelete.bind(this),
        },
        {
            label: 'Exportar Análise',
            disabled: !this.isHideLoading,
            action: this.onExportar.bind(this),
        },
    ];

    percentDone: number = 0;

    filterText!: string;
    items: any = [];
    accordionItems: any[] = [];
    exportedData: any[] = [];

    uuid!: string;
    label!: string;

    poBreadcrumbItem: PoBreadcrumbItem[] = [];

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private dicionarioService: DicionarioService,
        private poNotification: PoNotificationService
    ) {
        // this.route.params.subscribe((params) => {
        //     console.dir(params);
        //     this.uuid = params['id'];
        // });
    }

    ngOnInit(): void {
        this.route.params.subscribe((params) => {
            // console.dir(params);
            this.uuid = params['id'];
            this.loadDicionario();
        });
    }

    updateBreadcrumb() {
        this.poBreadcrumbItem = [
            {
                label: 'Dicionários',
                link: `/main/dicionario/`,
            },
            {
                label: `${this.label}`,
                link: `/main/fonte/dicionario/${this.uuid}`,
            },
        ];
    }

    loadDicionario() {
        this.isHideLoading = false;
        this.items = [];
        this.dicionarioService.getDicionario(this.uuid).subscribe({
            next: (result: any) => {
                this.label = result.items[0].label;
                result.items.forEach((item: any) => {
                    item.label = `Tabela ${item.tabela}`;
                    this.items.push(item);
                    this.onViewTable(
                        this.items.length - 1,
                        this.uuid,
                        item.tabela
                    );
                });
                this.accordionItems = [...this.items];
                this.isHideLoading = true;
                this.updateBreadcrumb();
            },
            error: (error) => {},
        });
    }

    onFilter(args: string) {
        this.accordionItems = this.items.filter((value: any) => {
            return value.tabela
                .toLowerCase()
                .trim()
                .startsWith(args.toLowerCase().trim());
        });
    }

    onViewTable(idx: number, uuid: string, tabela: string) {
        this.dicionarioService.getDiff(uuid, tabela).subscribe({
            next: (result: any): void => {
                this.accordionItems[idx].diffs = result.items;
            },
        });
    }

    onExportar() {
        this.isHideLoadingExportar = false;
        this.dicionarioService.getExport(this.uuid).subscribe({
            next: (data: Blob) => {
                this.dicionarioService.downloadFile(
                    data,
                    `exported_${this.uuid}.zip`
                );
                this.isHideLoadingExportar = true;
            },
            error: (error) => {
                console.error('Erro ao baixar o arquivo: ', error);
                this.isHideLoadingExportar = true;
            },
        });
    }

    onDelete() {
        this.dicionarioService
            .deleteDicionario(this.uuid)
            .subscribe((value) => {
                if (value) {
                    this.poNotification.success(
                        `Registros deletados com sucesso!`
                    );
                    this.router.navigate(['/main/dicionario']);
                    setTimeout(() => {
                        window.location.reload();
                    }, 100);
                } else {
                    this.poNotification.error(
                        `Ocorreu um erro ao tentar excluir os registros`
                    );
                }
            });
    }

    loadMore() {}
}
