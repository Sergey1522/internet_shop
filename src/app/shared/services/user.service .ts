import { Injectable } from '@angular/core';
import { Environments } from '../../environments/environments';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DefaultResponseType } from '../../../types/default.response.type';
import { UserInfoType } from '../../../types/user.info.type';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = Environments.api + 'user';
  constructor(private http: HttpClient) {}
  updateUserInfo(params: UserInfoType): Observable<DefaultResponseType> {
    return this.http.post<DefaultResponseType>(this.apiUrl, params);
  }
  getUserInfo(): Observable<UserInfoType | DefaultResponseType> {
    return this.http.get<UserInfoType | DefaultResponseType>(this.apiUrl);
  }
}
