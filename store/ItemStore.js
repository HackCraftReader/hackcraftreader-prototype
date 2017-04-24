import { observable, action, computed } from 'mobx';

// import _ from 'lodash';

import EventStore, {Event} from './EventStore';

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
  }

  @action doneClear() {
    if (!this.done) return;
    this.newEvent(Event.DoneClear, {});
  }

  isTagged(tag) {
    return !!this.tags[tag.code];
  }

  @action tagToggle(tag, context = {}) {
    if (this.isTagged(tag)) {
      this.tagRemove(tag, context);
    } else {
      this.tagAdd(tag, context);
    }
  }

  @action upvote() {
    this.points = this.points && this.points + 1;
  }

  @action tagAdd(tag, context = {}) {
    const label = tag.label;
    const code = tag.code;
    this.newEvent(Event.TagAdd, {label, code, ...context});
  }

  @action tagRemove(tag, context = {}) {
    const label = tag.label;
    const code = tag.code;
    this.newEvent(Event.TagRemove, {label, code, ...context});
  }

  @action setNote(note, context = {}) {
    const newNote = !this.note;
    this.newEvent(newNote ? Event.NoteAdd : Event.NoteEdit, {note, ...context});
  }

  @computed get activeSnoozed() {
    const now = new Date();
    return this.snoozed.filter(s => s.date > now);
  }

  isSnoozed(label) {
    const now = new Date();
    return this.snoozed.filter(s => s.date > now && s.label === label).length;
  }

  @action snoozeToggle(label, context = {}) {
    if (this.isSnoozed(label)) {
      this.snoozeClear(label, context);
    } else {
      this.snoozeSet(label, context);
      // Clear all other snoozes (mutually exclusive)
      this.activeSnoozed.filter(s => s.label !== label)
          .forEach(s => this.snoozeClear(s.label, context));
    }
  }

  @action snoozeSet(label, context = {}) {
    if (this.isSnoozed(label)) return;
    const date = Snooze.snoozeDate(label);
    const snooze = {date, label, ...context};
    this.newEvent(Event.SnoozeSet, snooze);
  }

  @action snoozeClear(label, context = {}) {
    const now = new Date();
    let curSnooze = this.snoozed.filter(s => s.date > now && s.label === label);
    curSnooze = curSnooze ? curSnooze[0] : false;
    if (curSnooze) {
      this.newEvent(Event.SnoozeClear, {...curSnooze, ...context});
    }
  }

  @action pinToggle(context = {}) {
    let pinned = !this.pinned;
    if (pinned) {
      this.pinSet(context);
    } else {
      this.pinClear(context);
    }
  }

  @action pinSet(context = {}) {
    this.newEvent(Event.PinnedSet, context);
  }

  @action pinClear(context = {}) {
    this.newEvent(Event.PinnedClear, context);
  }

  newEvent(type, data) {
    EventStore.add(this.itemId, this.articleId, type, data);
  }
}

const store = new ItemStore();
export default store;
