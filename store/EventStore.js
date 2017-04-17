import { observable, action } from 'mobx';

import EventHistoryStatic from '../assets/EventHistoryStatic';
import ArticleCacheStatic from '../assets/ArticleCacheStatic';

import moment from 'moment/src/moment'; // Moment ES6 workaround

import ArticleStore from './ArticleStore';

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

  bySeqId(seqId) {
    return this.events.filter(e => e.seqId === seqId)[0];
  }

  // Could be place to track sync state
  @observable isLoading = false;

  @action add(itemId, articleId, type, data, historicalTime = null, articleData = null) {
    // TODO Store all timestamps in UTC, convert to local tz at display time
    const time = historicalTime || moment().unix(); // Current Unix time in seconds
    const seqId = nextSeqId;
    nextSeqId += 1;
    this.events.push({seqId, time, itemId, articleId, type, data});
//    if (!articleData) {
//      articleData = ArticleCacheStatic.filter(a => a.id === articleId)[0];
    //    }
    // TODO: remove articleData ? Relying on ItemStore cache on articleId for now
    ArticleStore.addOrUpdate(articleId, articleData, this.storeId, seqId, time);
    // console.log(this.events[this.events.length - 1]);
  }
}

const store = new EventStore();

// Load up our event history from some static data
EventHistoryStatic.reverse().map(e => store.add(e.itemId, e.articleId, e.type, e.data, e.time));

export default store;
