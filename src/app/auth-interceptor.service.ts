import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEventType } from '@angular/common/http';
import { tap } from 'rxjs/operators';

export class AuthInterceptorService implements HttpInterceptor {

  constructor() { }
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    console.log('request is on the way!');
    const modifiedReq = req.clone({ headers: req.headers.append('AuthKey', 'xyz') });
    return next.handle(modifiedReq).pipe(tap(event => {
      if (event.type === HttpEventType.Response) {
        console.log('response arrived. Data: ', event.body);

      }
    }));
  }
}
