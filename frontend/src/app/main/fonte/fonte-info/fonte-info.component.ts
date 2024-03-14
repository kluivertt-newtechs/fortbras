import { Component, OnInit } from '@angular/core';
import {
    PoBreadcrumbItem,
    PoNotificationService,
    PoPageAction,
    PoTableAction,
    PoTableColumn,
} from '@po-ui/ng-components';
import { PoCodeEditorModule } from '@po-ui/ng-code-editor';
import { ActivatedRoute, Router } from '@angular/router';
import { FonteService } from '../services/fonte.service';

@Component({
    selector: 'app-fonte-info',
    templateUrl: './fonte-info.component.html',
    styleUrls: ['./fonte-info.component.css'],
})
export class FonteInfoComponent implements OnInit {
    Object = Object;
    tableColumns: PoTableColumn[] = [{ label: 'Nome', property: 'name' }];
    tableActions: PoTableAction[] = [
        { label: 'Visualizar', action: this.onViewDetail.bind(this) },
    ];

    poBreadcrumbItem: PoBreadcrumbItem[] = [];

    pageActions: PoPageAction[] = [
        {
            label: 'Deletar Fontes',
            action: this.onDelete.bind(this),
        },
    ];

    uuid!: string;
    isHideLoading: boolean = true;
    totalProgramsCount!: number;

    items: any = {};

    constructor(
        private route: ActivatedRoute,
        private fonteService: FonteService,
        private router: Router,
        private poNotification: PoNotificationService
    ) {}

    ngOnInit(): void {
        this.route.params.subscribe((params) => {
            this.uuid = params['id'];
        });
        this.loadFonte();
        this.updateBreadcrumb();
    }

    updateBreadcrumb() {
        this.poBreadcrumbItem = [
            {
                label: 'Fontes',
                link: `/main/fonte/`,
            },
            {
                label: 'Documentação',
                link: `/main/fonte/info/${this.uuid}`,
            },
        ];
    }

    loadFonte() {
        this.isHideLoading = false;
        this.fonteService.getFonte(this.uuid).subscribe({
            next: (result: any) => {
                this.items = this.groupBy(result.items, 'category');
                this.totalProgramsCount = Object.keys(this.items).reduce(
                    (total, category) => total + this.items[category].length,
                    0
                );
                this.isHideLoading = true;
            },
            error: (error) => {},
        });
    }

    onViewDetail(item: any) {
        console.dir(item);
        this.router.navigate(['main/fonte/detail', item.uuid, item.id]);
    }

    private groupBy(xs: any, key: any) {
        return xs.reduce(function (rv: any, x: any) {
            (rv[x[key]] = rv[x[key]] || []).push(x);
            return rv;
        }, {});
    }

    onDelete() {
        this.fonteService.deleteFonte(this.uuid).subscribe((value) => {
            if (value) {
                this.poNotification.success(`Registros deletados com sucesso!`);
                this.router.navigate(['/main/fonte']);
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
}
