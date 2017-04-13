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

  @action addOrUpdate(articleId, data, eventStoreId, eventSeqId, eventTime) {
    var article;
    if (this.articles.has(articleId)) {
      article = this.articles.get(articleId);
    } else {
      article = new ArticleCache(this, articleId);
      this.articles.set(articleId, article);
    }
    article.addEvent(data, eventStoreId, eventSeqId, eventTime);
  }
}

class ArticleCache {
  articleId;
  store; // ref back to ItemStore

  @observable lastEventTime = null; // Date
  @observable data = {}; // Cached data
  @observable events = [];

  constructor(store, articleId) {
    this.store = store;
    this.articleId = articleId;
  }

  @action addEvent(data, eventStoreId, eventSeqId, eventTime) {
    if (!this.lastEventTime || eventTime > this.lastEventTime) {
      this.lastEventTime = eventTime;
      this.data = data;
    }
    this.events.unshift([eventSeqId, eventStoreId]);
  }
}

const store = new ArticleCacheStore();
export default store;
