import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    OnInit,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FonteService } from '../services/fonte.service';
import { PoBreadcrumbItem } from '@po-ui/ng-components';

@Component({
    selector: 'app-fonte-detail',
    templateUrl: './fonte-detail.component.html',
    styleUrls: ['./fonte-detail.component.css'],
})
export class FonteDetailComponent implements OnInit, AfterViewInit {
    uuid: string = '';
    id: number = 0;

    title = '';
    category = '';
    item: any = null;

    poBreadcrumbItem: PoBreadcrumbItem[] = [];

    constructor(
        private cdref: ChangeDetectorRef,
        private route: ActivatedRoute,
        private fonteService: FonteService,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.route.params.subscribe((params) => {
            this.uuid = params['uuid'];
            this.id = params['id'];
        });
        this.loadDetail();
    }

    ngAfterViewInit(): void {
        this.cdref.detectChanges();
    }

    private loadDetail() {
        this.fonteService.getDetail(this.uuid, this.id).subscribe({
            next: (result: any) => {
                console.log(result);
                this.item = result.items[0];
                this.category = this.item.category;
                this.title = this.item.name + ' - ' + this.item.category;
                this.cdref.detectChanges();
                this.updateBreadcrumb();
            },
            error: (error: any) => {},
        });
    }

    updateBreadcrumb() {
        console.log(this.category);
        this.poBreadcrumbItem = [
            {
                label: 'Fontes',
                link: `/main/fonte/`,
            },
            {
                label: 'Documentação',
                link: `/main/fonte/info/${this.uuid}`,
            },
            {
                label: this.category,
                link: `/main/fonte/detail/${this.uuid}/${this.id}`,
            },
        ];
    }

    onBack() {
        window.history.back();
    }
}
