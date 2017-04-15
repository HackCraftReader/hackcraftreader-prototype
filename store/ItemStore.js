import { observable, action, computed } from 'mobx';

// import _ from 'lodash';

import EventStore, {Event} from './EventStore';

import PinnedStore from './PinnedStore';

import {Snooze} from '../components/Snooze';

class ItemStore {
  @observable items = observable.map();

  article(itemId) {
    if (this.items.has(itemId)) {
      return this.items.get(itemId);
    } else {
      const item = new Item(this, itemId, itemId);
      this.items.set(itemId, item);
      return item;
    }
  }

  comment(itemId, articleId) {
    if (this.items.has(itemId)) {
      return this.items.get(itemId);
    } else {
      const item = new Item(this, itemId, articleId);
      this.items.set(itemId, item);
      return item;
    }
  }

  lookupItem(itemId) {
    // Expect item exists
    const item = this.items.get(itemId);
    if (!item) {
      console.error('Unable to find itemId in store: ' + itemId);
    }
    return item;
  }

  cachedItem(itemId) {
    return this.items.get(itemId);
  }
}

class Item {
  itemId; // global item ID
  articleId;
  store; // ref back to ItemStore

  // Derived dtaa
  @observable rank = 0;
  @observable source = 'HN';
  @observable type = 'article'; // or 'comment'

  // Defined data
  @observable created = null; // Date
  @observable when = ''; // user-friedly version of created
  @observable url = '';
  @observable author = '';
  @observable text = ''; // Title for article, comment HTML for comment
  @observable points = null;
  @observable descendantsCount = 0;
  @observable parentItemId = null;

  children = [];

  // User provided
  @observable done = false;
  @observable tags = {}; // keyed by tag_codes: boolean
  @observable snoozed = []; // {date: Date when snooze triggers, label: Name of kind of snooze}
  @observable pinned = false;
  @observable note = '';

  constructor(store, itemId, articleId) {
    this.store = store;
    this.itemId = itemId;
    this.articleId = articleId;
  }

  @action doneToggle() {
    let done = !this.done;
    if (done) {
      this.doneSet();
    } else {
      this.doneClear();
    }
  }

  @action doneSet() {
    if (this.done) return;
    this.newEvent(Event.DoneSet, {});
    this.done = true;
  }

  @action doneClear() {
    if (!this.done) return;
    this.newEvent(Event.DoneClear, {});
    this.done = false;
  }

  isTagged(tag) {
    return !!this.tags[tag.code];
  }

  @action tagToggle(tag) {
    if (this.isTagged(tag)) {
      this.tagRemove(tag);
    } else {
      this.tagAdd(tag);
    }
  }

  @action upvote() {
    this.points = this.points && this.points + 1;
  }

  @action tagAdd(tag) {
    const label = tag.label;
    const code = tag.code;
    this.newEvent(Event.TagAdd, {label, code});
    this.tags[tag.code] = tag;
  }

  @action tagRemove(tag) {
    const label = tag.label;
    const code = tag.code;
    this.newEvent(Event.TagRemove, {label, code});
    delete this.tags[tag.code];
  }

  @action setNote(note) {
    const newNote = !this.note;
    this.newEvent(newNote ? Event.NoteAdd : Event.NoteEdit, {note});
    this.note = note;
  }

  @computed get activeSnoozed() {
    const now = new Date();
    return this.snoozed.filter(s => s.date > now);
  }

  isSnoozed(label) {
    const now = new Date();
    return this.snoozed.filter(s => s.date > now && s.label === label).length;
  }

  @action snoozeToggle(label) {
    if (this.isSnoozed(label)) {
      this.snoozeClear(label);
    } else {
      this.snoozeSet(label);
      // Clear all other snoozes (mutually exclusive)
      this.activeSnoozed.filter(s => s.label !== label)
          .forEach(s => this.snoozeClear(s.label));
    }
  }

  @action snoozeSet(label) {
    if (this.isSnoozed(label)) return;
    const date = Snooze.snoozeDate(label);
    const snooze = {date, label};
    this.newEvent(Event.SnoozeSet, snooze);
    this.snoozed.push(snooze);
  }

  @action snoozeClear(label) {
    const now = new Date();
    let curSnooze = this.snoozed.filter(s => s.date > now && s.label === label);
    curSnooze = curSnooze ? curSnooze[0] : false;
    if (curSnooze) {
      this.newEvent(Event.SnoozeClear, curSnooze);
      this.snoozed.remove(curSnooze);
    }
  }

  @action pinToggle() {
    let pinned = !this.pinned;
    if (pinned) {
      this.pinSet();
    } else {
      this.pinClear();
    }
  }

  @action pinSet() {
    PinnedStore.pinItem(this.itemId);
    this.newEvent(Event.PinnedSet, {});
    this.pinned = true;
  }

  @action pinClear() {
    PinnedStore.unpinItem(this.itemId);
    this.newEvent(Event.PinnedClear, {});
    this.pinned = false;
  }

  newEvent(type, data) {
    EventStore.add(this.itemId, this.articleId, type, data);
  }
}

const store = new ItemStore();
export default store;
