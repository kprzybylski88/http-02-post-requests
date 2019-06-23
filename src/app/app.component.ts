import { Component, OnInit, OnDestroy } from '@angular/core';
import { Post } from './post.model';
import { PostsService } from './posts.service';
import { Subscription } from 'rxjs';
import { RequestState } from './request-state.enum';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  loadedPosts = [];
  requestState: RequestState = RequestState.ready;
  onPostSentSub: Subscription;
  fetchInterval: any;
  errMessage: string;

  constructor(private postService: PostsService) {}

  ngOnInit() {
    this.fetchPosts();
    this.onPostSentSub = this.postService.onPostUpdate.subscribe({
      next: posts => this.loadedPosts = posts
    });
    this.postService.requestStateChange.subscribe({
      next: update => {
        this.requestState = update.state;
        this.errMessage = update.message;
      }
    });
/*     this.fetchInterval = setInterval(() => {
      this.fetchPosts();
    }, 1000000); */
  }

  onCreatePost(postData: Post) {
    // Send Http request
    this.postService.createAndStorePosts(postData);
  }

  onFetchPosts() {
    this.fetchPosts();
  }

  onClearPosts() {
    // Send Http request
    this.postService.deleteAllPosts();
  }

  private fetchPosts() {
    this.postService.fetchPosts();
  }

  ngOnDestroy() {
    this.onPostSentSub.unsubscribe();
  }
}
