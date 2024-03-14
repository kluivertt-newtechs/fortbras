import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
    PoNotificationService,
    PoUploadComponent,
    PoUploadFile,
    PoUploadFileRestrictions,
} from '@po-ui/ng-components';
import { DicionarioService } from '../../dicionario/services/dicionario.service';
import { HttpEventType } from '@angular/common/http';
import { v4 as uuidv4, v4 } from 'uuid';
import { FonteService } from '../../fonte/services/fonte.service';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
    @ViewChild('dict1', { static: true })
    dict1!: PoUploadComponent;
    @ViewChild('dict2', { static: true })
    dict2!: PoUploadComponent;
    @ViewChild('fonte', { static: true })
    fonte!: PoUploadComponent;

    myFormDicionario: FormGroup = this.fb.group({
        dict1: ['', [Validators.required]],
        dict2: ['', [Validators.required]],
    });

    myFormFonte: FormGroup = this.fb.group({
        fonte: ['', [Validators.required]],
    });

    uuid?: string;

    isHideLoading?: boolean = true;
    isLoadingFonte?: boolean = true;
    percentDone: number = 0;
    dict1Desabled: boolean = false;
    dict2Desabled: boolean = true;
    showEnviar: boolean = true;
    showAnalisar: boolean = false;

    constructor(
        private fb: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private dicionarioService: DicionarioService,
        private poNotification: PoNotificationService,
        private fonteService: FonteService
    ) {}

    ngOnInit(): void {}

    fileRestrictions: PoUploadFileRestrictions = {
        allowedExtensions: ['.zip'],
        maxFileSize: 262144000,
    };

    async toBase64(file: Blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                let cleanData = reader.result
                    ?.toString()
                    .split(';base64,')
                    .pop();
                resolve(cleanData);
            };
            reader.onerror = reject;
        });
    }

    async analisarDicionario1() {
        this.uuid = v4();

        for (const control of Object.keys(this.myFormDicionario.controls)) {
            this.myFormDicionario.controls['dict1'].markAsDirty();
            this.myFormDicionario.controls['dict1'].markAsTouched();
        }

        if (this.myFormDicionario.controls['dict1'].valid) {
            this.isHideLoading = false;
            const data: any = {};
            data.uuid = this.uuid;
            data.files = [];

            try {
                const dataT = await this.processoUpload1();
                data.files.push(dataT);

                this.dicionarioService.postUpload(data).subscribe({
                    next: (res: any) => {
                        if (res.type === HttpEventType.UploadProgress) {
                            this.percentDone = Math.round(
                                (100 * res.loaded) / res.total
                            );
                        } else if (res.type === HttpEventType.Response) {
                            this.dict1Desabled = true;
                            this.dict2Desabled = false;
                            this.showEnviar = false;
                            this.showAnalisar = true;
                            this.isHideLoading = true;
                            this.poNotification.success(
                                'Dicionários enviados com sucesso!'
                            );
                        }
                    },
                    error: (error) => {
                        this.isHideLoading = true;
                    },
                });
            } catch (error) {
                this.isHideLoading = true;
                console.log(error);
                this.dicionarioService.postUpload(data).subscribe({
                    next: (res: any) => {
                        if (res.type === HttpEventType.UploadProgress) {
                            this.percentDone = Math.round(
                                (100 * res.loaded) / res.total
                            );
                        } else if (res.type === HttpEventType.Response) {
                            this.isHideLoading = true;
                            this.dict1Desabled = true;
                            this.dict2Desabled = false;
                            this.showEnviar = false;
                            this.showAnalisar = true;
                            this.poNotification.success(
                                'Dicionários enviados com sucesso!'
                            );
                        }
                    },
                });
            }
        }
    }

    async analisarDicionario2() {
        for (const control of Object.keys(this.myFormDicionario.controls)) {
            this.myFormDicionario.controls['dict2'].markAsDirty();
            this.myFormDicionario.controls['dict2'].markAsTouched();
        }

        if (this.myFormDicionario.controls['dict2'].valid) {
            this.isHideLoading = false;
            this.percentDone = 0;
            const data: any = {};
            data.uuid = this.uuid;
            data.files = [];

            try {
                const dataT = await this.processoUpload2();
                data.files.push(dataT);

                this.dicionarioService.postUpload(data).subscribe({
                    next: (res: any) => {
                        this.dict1Desabled = false;
                        this.dict2Desabled = true;
                        this.showEnviar = true;
                        this.showAnalisar = false;
                        if (res.type === HttpEventType.UploadProgress) {
                            this.percentDone = Math.round(
                                (100 * res.loaded) / res.total
                            );
                        } else if (res.type === HttpEventType.Response) {
                            this.isHideLoading = true;
                            this.dict1.clear();
                            this.dict2.clear();
                            this.noMarkForm();
                            this.poNotification.success(
                                'Dicionários enviados com sucesso!'
                            );
                        }
                    },
                    error: (error) => {
                        this.isHideLoading = true;
                    },
                });
            } catch (error) {
                this.isHideLoading = true;
                console.log(error);
            }
        }
    }

    noMarkForm() {
        this.myFormDicionario.controls['dict1'].markAsPristine();
        this.myFormDicionario.controls['dict2'].markAsPristine();
        this.myFormDicionario.controls['dict1'].markAsUntouched();
        this.myFormDicionario.controls['dict2'].markAsUntouched();
        this.myFormFonte.controls['fonte'].markAsPristine();
        this.myFormFonte.controls['fonte'].markAsUntouched();
    }

    processoUpload1() {
        return new Promise((resolve, reject) => {
            this.myFormDicionario.value.dict1.map(
                async (dict1: PoUploadFile) => {
                    var base64 = await this.toBase64(dict1.rawFile);
                    resolve({
                        file_name: dict1.name,
                        base64: base64,
                        mime_type: dict1.rawFile.type,
                        dict: 1,
                    });
                }
            );
        });
    }

    processoUpload2() {
        return new Promise((resolve, reject) => {
            this.myFormDicionario.value.dict2.map(
                async (dict2: PoUploadFile) => {
                    var base64 = await this.toBase64(dict2.rawFile);
                    resolve({
                        file_name: dict2.name,
                        base64: base64,
                        mime_type: dict2.rawFile.type,
                        dict: 2,
                    });
                }
            );
        });
    }

    onClean() {
        this.dict1.clear();
        this.dict2.clear();
        this.noMarkForm();
        this.isHideLoading = true;
        this.percentDone = 0;
        this.dict1Desabled = false;
        this.dict2Desabled = true;
        this.showEnviar = true;
        this.showAnalisar = false;
        this.uuid = undefined;
    }

    async analisarFonte() {
        for (const control of Object.keys(this.myFormFonte.controls)) {
            this.myFormFonte.controls[control].markAsDirty();
            this.myFormFonte.controls[control].markAsTouched();
        }

        if (this.myFormFonte.valid) {
            this.isLoadingFonte = false;
            this.percentDone = 0;
            const data: any = {};
            data.uuid = v4();
            data.files = [];

            try {
                const dataT = await this.processoUpload3();
                data.files.push(dataT);

                this.fonteService.postFonte(data).subscribe({
                    next: (res: any) => {
                        if (res.type === HttpEventType.UploadProgress) {
                            this.percentDone = Math.round(
                                (100 * res.loaded) / res.total
                            );
                        } else if (res.type === HttpEventType.Response) {
                            this.isLoadingFonte = true;
                            this.fonte.clear();
                            this.noMarkForm();
                            this.poNotification.success(
                                'Código Fonte enviado com sucesso!'
                            );
                        }
                    },
                    error: (error) => {
                        this.isLoadingFonte = true;
                    },
                });
            } catch (error) {
                this.isLoadingFonte = true;
                console.log(error);
            }
        }
    }

    processoUpload3() {
        return new Promise((resolve, reject) => {
            this.myFormFonte.value.fonte.map(async (fonte: PoUploadFile) => {
                var base64 = await this.toBase64(fonte.rawFile);
                resolve({
                    file_name: fonte.name,
                    base64: base64,
                    mime_type: fonte.rawFile.type,
                    fonte: 1,
                });
            });
        });
    }
}
