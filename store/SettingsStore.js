import { observable, action, computed } from 'mobx';

// import _ from 'lodash';

import EventStore, {Event} from './EventStore';

class SettingsStore {
  @observable feeds = [];

  item(itemId) {
    if (this.items.has(itemId)) {
      return this.items.get(itemId);
    } else {
      const item = new Item(this, itemId);
      this.items.set(itemId, item);
      return item;
    }
  }

  @computed feedList() {
    return [
      {name: 'Hacker News', iconName: 'y-combinator-square', selected: true},
      {name: 'Programming Reddit', iconName: 'reddit-square', selected: false},
      {name: 'All Collated', iconName: 'renren', selected: false},
      {name: 'All Sequential', iconName: 'list-ul', selected: false},
    ];
  }

  @computed topGroupCount() {
    return {
    title: 'STORIES PER GROUP',
    items: [
      {value: 5, selected: true},
      {value: 10, selected: false},
      {value: 15, selected: false},
      {value: 30, selected: false},
    ]
  };

 @computed bydayGroupCount() {
   return {
    title: 'STORIES PER DAY',
    items: [
      {value: 5, selected: true},
      {value: 15, selected: false},
      {value: 30, selected: false},
      {value: 60, selected: false},
    ]
  
}
