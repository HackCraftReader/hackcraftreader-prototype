import { observable, computed } from 'mobx';

import ItemStore from './ItemStore';

// TODO: This should probably persist a copy of the item
// data to be ready to show if the item is not in our cache.
class SnoozedStore {
  @observable snoozedByArticle = {}

  @computed get count() {
    return this.snoozedByArticle.length;
  }

  isSnoozed(articleId) {
    return articleId in this.snoozedByArticle;
  }

  @computed get snoozedArticles() {
    // TODO: sort by snooze time!
    return this.snoozedByArticle.keys().map(articleId => {
      return ItemStore.lookupItem(articleId);
    });
  }

  snoozeItem(itemId, articleId) {
    if (!(articleId in this.snoozedByArticle)) {
      this.snoozedByArticle[articleId] = [];
    }
    if (!this.snoozedByArticle[articleId].includes(itemId)) {
      this.snoozedByArticle[articleId].push(itemId);
    }
  }

  clearItem(itemId, articleId) {
    if (!(articleId in this.snoozedByArticle)) {
      return;
    }
    this.snoozedByArticle[articleId] = this.snoozedByArticle[articleId].filter(i => i !== itemId);
    if (this.snoozedByArticle[articleId].length === 0) {
      delete this.snoozedByArticle[articleId];
    }
  }
}

const store = new SnoozedStore();
export default store;
