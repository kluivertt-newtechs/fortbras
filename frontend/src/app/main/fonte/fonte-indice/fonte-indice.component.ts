import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FonteService } from '../services/fonte.service';
import {
  PoBreadcrumbItem,
  PoNotificationService,
  PoPageAction,
} from '@po-ui/ng-components';

@Component({
  selector: 'app-fonte-indice',
  templateUrl: './fonte-indice.component.html',
  styleUrls: ['./fonte-indice.component.css'],
})
export class FonteIndiceComponent implements OnInit {
  isHideLoading: boolean = true;
  isHideLoadingExportar: boolean = true;

  pageActions: PoPageAction[] = [
    {
      label: 'Deletar Fontes',
      disabled: !this.isHideLoading,
      action: this.onDelete.bind(this),
    },
    {
      label: 'Exportar Fontes',
      disabled: !this.isHideLoading,
      action: this.onExportar.bind(this),
    },
  ];

  poBreadcrumbItem: PoBreadcrumbItem[] = [
    {
      label: 'Sumário',
      link: '/main/fonte/indice/id',
    },
  ];

  uuid!: string;
  items: any = {
    Relatorio: [
      {
        name: 'Relatórios',
        result: [
          { name: 'Relatório 1', url: '/main/fonte/info/id' },
          { name: 'Relatório 2', url: '/main/fonte/info/id' },
          { name: 'Relatório 3', url: '/main/fonte/info/id' },
          { name: 'Relatório 4', url: '/main/fonte/info/id' },
          { name: 'Relatório 5', url: '/main/fonte/info/id' },
          { name: 'Relatório 6', url: '/main/fonte/info/id' },
        ],
      },
    ],
    Tabelas: [
      {
        name: 'Tabelas',
        result: [
          { name: 'Tabela 1', url: '/main/fonte/info/id' },
          { name: 'Tabela 2', url: '/main/fonte/info/id' },
          { name: 'Tabela 3', url: '/main/fonte/info/id' },
          { name: 'Tabela 4', url: '/main/fonte/info/id' },
          { name: 'Tabela 5', url: '/main/fonte/info/id' },
          { name: 'Tabela 6', url: '/main/fonte/info/id' },
        ],
      },
    ],
  };

  constructor(
    private route: ActivatedRoute,
    private fonteService: FonteService,
    private router: Router,
    private poNotification: PoNotificationService
  ) {}

  ngOnInit(): void {}

  onExportar() {
    this.isHideLoadingExportar = false;
    this.fonteService.getExport(this.uuid).subscribe({
      next: (data: Blob) => {
        this.fonteService.downloadFile(data, `exported_${this.uuid}.zip`);
        this.isHideLoadingExportar = true;
      },
      error: (error) => {
        console.error('Erro ao baixar o arquivo: ', error);
        this.isHideLoadingExportar = true;
      },
    });
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
