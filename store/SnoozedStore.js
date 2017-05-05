import { observable, action, computed } from 'mobx';

import ItemStore from './ItemStore';

// TODO: This should probably persist a copy of the item
// data to be ready to show if the item is not in our cache.
class SnoozedStore {
  @observable snoozedByArticle = observable.map();

  @computed get count() {
    return this.snoozedByArticle.size();
  }

  isSnoozed(articleId) {
    return this.snoozedByArticle.has(articleId);
  }

  @action removeExpiredSnoozed() {
    return this.snoozedByArticle.keys().map(articleId => {
      const filtered = this.snoozedByArticle.get(articleId).map(itemId => {
        return ItemStore.lookupItem(itemId).activeSnoozed().length > 0;
      });
      if (filtered.length === 0) {
        this.snoozedByArticle.delete(articleId);
      } else {
        this.snoozedByArticle.set(articleId, filtered);
      }
    });
  }

  @computed get snoozedArticles() {
    // TODO: sort by snooze time!
    return this.snoozedByArticle.keys().map(articleId => {
      return ItemStore.lookupItem(articleId);
    });
  }

  // TODO: Store time, so that it can be filtered
  @action snoozeItem(itemId, articleId) {
    if (!this.snoozedByArticle.has(articleId)) {
      this.snoozedByArticle.set(articleId, []);
    }
    if (!this.snoozedByArticle.get(articleId).includes(itemId)) {
      this.snoozedByArticle.get(articleId).push(itemId);
    }
  }

  @action clearItem(itemId, articleId) {
    if (!this.snoozedByArticle.has(articleId)) {
      return;
    }
    const filtered = this.snoozedByArticle.get(articleId).filter(i => i !== itemId);
    this.snoozedByArticle.set(articleId, filtered);
    if (this.snoozedByArticle.get(articleId).length === 0) {
      this.snoozedByArticle.delete(articleId);
    }
  }
}

const store = new SnoozedStore();
export default store;
