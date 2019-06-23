import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpEventType } from '@angular/common/http';
import { Post } from './post.model';
import { Subject, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { RequestState } from './request-state.enum';


@Injectable({
  providedIn: 'root'
})
export class PostsService {
  onPostUpdate = new Subject<Post[]>();
  requestStateChange = new Subject<{state: RequestState, message: string}>();
  loadedPosts: Post[] = [];
  constructor(private http: HttpClient) { }

  createAndStorePosts(post: Post) {
    this.requestStateChange.next({state: RequestState.posting, message: ''});
    this.http
      .post<{name: string}>('https://ng-complete-guide-32859.firebaseio.com/posts.json',
        post, {
          observe: 'response'
        }
        )
      .subscribe({
        next: responseData => console.log(responseData),
        error: (err) => {
          console.log(err.message);
          this.requestStateChange.next({state: RequestState.error, message: 'post failed'});
        },
        complete: () => {
          this.requestStateChange.next({state: RequestState.ready, message: ''});
          console.log('post complete');
          this.loadedPosts.push(post);
          this.onPostUpdate.next(this.loadedPosts.slice());
        }
      });
  }

  fetchPosts() {
    let searchParams = new HttpParams();
    searchParams = searchParams.append('print', 'pretty');
    searchParams = searchParams.append('custom', 'key');
    this.requestStateChange.next({state: RequestState.loading, message: ''});
    this.http.get<{[key: string]: Post}>(
      'https://ng-complete-guide-32859.firebaseio.com/posts.json', {
        headers: new HttpHeaders({ 'Custom-Header': 'hello' }),
        params: searchParams
      })
      .pipe(map( (responseData) => {
        const postArray: Post[] = [];
        for (const key in responseData) {
          if (responseData.hasOwnProperty(key)) {
            postArray.push({ ...responseData[key], id: key});
          }
        }
        return postArray;
      }),
      catchError( err => {
        // pass to analytics
        return throwError(err);
      })).subscribe({
        next: (data: Post[]) => {
          this.loadedPosts = data;
        },
        error: (err) => {
          console.log(err);
          this.requestStateChange.next({state: RequestState.error, message: 'failed to fetch posts'});
        },
        complete: () => {
          console.log('get complete');
          this.onPostUpdate.next(this.loadedPosts.slice());
          this.requestStateChange.next({
            state: this.loadedPosts === [] ? RequestState.empty : RequestState.ready,
            message: 'ready'});
        }
      });
  }

  deleteAllPosts() {
    this.http
      .delete('https://ng-complete-guide-32859.firebaseio.com/posts.json', {
        observe: 'events',
        responseType: 'text'
      })
      .pipe(tap(event => {
        if (event.type === HttpEventType.Response) {
          console.log(event.body);
        }
        console.log(event);

      }))
      .subscribe({
        next: null,
        error: (err) => console.log(err.message),
        complete: () => {
          console.log('deleted successfully');
          this.loadedPosts = [];
          this.onPostUpdate.next(this.loadedPosts.slice());
        }
      });
  }
}
