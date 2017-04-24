import { observable, action } from 'mobx';

import moment from 'moment/src/moment'; // Moment ES6 workaround

import ArticleStore from './ArticleStore';
import ItemStore from '../store/ItemStore';
import PinnedStore from './PinnedStore';
import SnoozedStore from './SnoozedStore';

// TODO: Maybe refactor data-only parts of Tags to someplace else
import { tagByCode } from '../components/Tags';

var nextSeqId = 0;

export const Event = {
  NoteAdd: 'note_add',
  NoteEdit: 'note_edit',
  TagAdd: 'tag_add',
  TagRemove: 'tag_remove',
  SnoozeSet: 'snooze_set',
  SnoozeClear: 'snooze_clear',
  PinnedSet: 'pinned_set',
  PinnedClear: 'pinned_clear',
  DoneSet: 'done_set',
  DoneClear: 'done_clear',
  TimeSpent: 'time_spent',
};

class EventStore {
  storeId = 'device';

  @observable events = [];
  @observable globalTotalTimeSpent = 0;

  bySeqId(seqId) {
    return this.events.filter(e => e.seqId === seqId)[0];
  }

  // Could be place to track sync state
  @observable isLoading = false;

  @action add(itemId, articleId, type, data, historicalTime = null) {
    // TODO Store all timestamps in UTC, convert to local tz at display time
    const time = historicalTime || moment().unix(); // Current Unix time in seconds
    const seqId = nextSeqId;
    nextSeqId += 1;
    const event = {seqId, time, itemId, articleId, type, data};
    this.events.push(event);
    updateStores(event);
  }
}

const eventStore = new EventStore();

function updateStores(event) {
  // Essentially a "reducer" in redux terms
  if (event.type === 'time_spent') {
    eventStore.globalTotalTimeSpent += event.data.spent;
  }

  const item = ItemStore.lookupItem(event.itemId);
  if (event.type === Event.NoteAdd || event.type === Event.NoteEdit) {
    const note = event.data.note;
    item.note = note;
  } else if (event.type === Event.TagAdd) {
    const tag = tagByCode(event.data.code);
    item.tags[tag.code] = tag;
  } else if (event.type === Event.TagRemove) {
    const tag = tagByCode(event.data.code);
    delete item.tags[tag.code];
  } else if (event.type === Event.SnoozeSet) {
    const snooze = event.data;
    item.snoozed.push(snooze);
    SnoozedStore.snoozeItem(event.itemId, event.articleId);
  } else if (event.type === Event.SnoozeClear) {
    let curSnooze = item.snoozed.filter(s => s.label === event.data.label);
    curSnooze = curSnooze ? curSnooze[0] : false;
    item.snoozed.remove(curSnooze);
    SnoozedStore.clearItem(event.itemId, event.articleId);
  } else if (event.type === Event.PinnedSet) {
    PinnedStore.pinItem(event.itemId);
    item.pinned = true;
  } else if (event.type === Event.PinnedClear) {
    PinnedStore.unpinItem(event.itemId);
    item.pinned = false;
  } else if (event.type === Event.DoneSet) {
    item.done = true;
  } else if (event.type === Event.DoneClear) {
    item.done = false;
  }

  ArticleStore.addOrUpdate(event, event.storeId);
}

export default eventStore;
