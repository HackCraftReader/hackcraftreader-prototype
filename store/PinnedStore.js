import { observable, action, computed } from 'mobx';

// import _ from 'lodash';

import EventStore, {Event} from './EventStore';
import ItemStore from './ItemStore';

// TODO: This should probably persist a copy of the item
// data to be ready to show if the item is not in our cache.
class PinnedStore {
  @observable pinned = [];

  @computed get count() {
    return this.pinned.length;
  }

  @computed get pinnedItems() {
    return this.pinned.map(itemId => {
      return ItemStore.lookupItem(itemId);
    });
  }

  pinItem(itemId) {
    if (!this.pinned.includes(itemId)) {
      this.pinned.push(itemId);
    }
  }

  unpinItem(itemId) {
    this.pinned = this.pinned.filter(item => item !== itemId);
  }
}

const store = new PinnedStore();
export default store;
