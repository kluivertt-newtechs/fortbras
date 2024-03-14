import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import {
  DicionarioAPI,
  DicionarioEdit,
  DicionarioGet,
  DicionarioPost,
} from '../model/dicionario';
import { uuid } from '@po-ui/ng-components/lib/utils/util';

const apiURL = `${environment.url}/dict`;

@Injectable({
  providedIn: 'root',
})
export class DicionarioService {
  constructor(private http: HttpClient) {}

  public getDicionarios(params: {
    page?: number;
    pageSize?: number;
  }): Observable<any> {
    let httpParams = new HttpParams();

    return this.http.get<any>(apiURL, {
      params: httpParams,
    });
  }

  public getDicionario(id: string) {
    return this.http.get<any>(`${apiURL}/${id}`, {});
  }

  public getDiff(id: string, tabela: string) {
    return this.http.get<any>(`${apiURL}/diff/${tabela}/${id}`, {});
  }

  public getFields(id: string, tabela: string) {
    return this.http.get<any>(`${apiURL}/fields/${id}/${tabela}`, {});
  }

  public getExport(uuid: string): Observable<Blob> {
    const header = {
      responseType: 'blob' as 'json',
      headers: new HttpHeaders({
        Accept: 'application/zip, application/octet-stream',
      }),
    };

    return this.http.get<Blob>(`${apiURL}/export/${uuid}`, header);
  }

  public postDicionario(dicionarioPost: any) {
    console.dir(dicionarioPost);

    return this.http.post<any>(apiURL, dicionarioPost, {});
  }

  public postUpload(uploadPost: any) {
    console.dir(uploadPost);

    return this.http.post<any>(apiURL, uploadPost, {
      observe: 'events',
      reportProgress: true,
    });
  }

  public editDicionario(id: number, dicionarioEdit: DicionarioEdit) {
    const headers = new HttpHeaders().set(
      'authorization',
      'bearer ' + sessionStorage.getItem('token')
    );
    return this.http.put<DicionarioAPI>(`${apiURL}/${id}`, dicionarioEdit, {
      headers,
    });
  }

  public deleteDicionario(uuid: string) {
    return this.http.delete<any>(`${apiURL}/${uuid}`, {});
  }

  public downloadFile(data: Blob, filename: string) {
    const blob = new Blob([data], { type: 'application/zip' });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();

    window.URL.revokeObjectURL(url);
    document.body.removeChild(anchor);
  }
}
