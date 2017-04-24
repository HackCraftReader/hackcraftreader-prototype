import {observable, action, computed} from 'mobx';

class ArticleCacheStore {
  @observable articles = observable.map();

  @computed get sorted() {
    // Descending order by lastEventTime
    return this.articles.values().sort((a, b) => {
      if (a.lastEventTime > b.lastEventTime) {
        return -1;
      } else if (a.lastEventTime < b.lastEventTime) {
        return 1;
      } else {
        return 0;
      }
    });
  }

  // Could be place to track sync state
  @observable isLoading = false;

  @action addOrUpdate(event, eventStoreId) {
    var article;
    if (this.articles.has(event.articleId)) {
      article = this.articles.get(event.articleId);
    } else {
      article = new ArticleCache(this, event.articleId);
      this.articles.set(event.articleId, article);
    }
    article.addEvent(event, eventStoreId);
  }
}

class ArticleCache {
  articleId;
  store; // ref back to ItemStore

  @observable lastEventTime = null; // Date
  @observable timeSpentOnArticle = 0;
  @observable timeSpentOnComments = 0;
  @observable articleEventCount = 0;
  @observable commentsEventCount = 0;
  @observable articleLastEventTime = null;
  @observable commentsLastEventTime = null;
  @observable events = [];
  @observable commentsWithTags = [];

  constructor(store, articleId) {
    this.store = store;
    this.articleId = articleId;
  }

  @action addEvent(event, eventStoreId) {
    if (!this.lastEventTime || event.time > this.lastEventTime) {
      this.lastEventTime = event.time;
    }

    const wasOnComment = event.itemId !== event.articleId || event.data.on === 'comments';
    if (event.type === 'time_spent') {
      if (wasOnComment) {
        this.timeSpentOnComments += event.data.spent;
      } else {
        this.timeSpentOnArticle += event.data.spent;
      }
    }

    if (wasOnComment) {
      this.commentsEventCount += 1;
      if (!this.commentsLastEventTime || event.time > this.commentsLastEventTime) {
        this.commentsLastEventTime = event.time;
      }
    } else {
      this.articleEventCount += 1;
      if (!this.articleLastEventTime || event.time > this.articleLastEventTime) {
        this.articleLastEventTime = event.time;
      }
    }

    if (event.itemId !== event.articleId) {
      if (!this.commentsWithTags.includes(event.itemId)) {
        this.commentsWithTags.push(event.itemId);
      }
    }
    this.events.unshift([event.seqId, eventStoreId]);
  }
}

const store = new ArticleCacheStore();
export default store;
