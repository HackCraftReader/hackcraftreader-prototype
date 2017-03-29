import { observable, action } from 'mobx';

var nextSeqId = 0;

export const Event = {
  NoteEdit: 'note_edit',
  TagAdd: 'tag_add',
  TagRemove: 'tag_remove',
  SnoozeSet: 'snooze_clear',
  SnoozeClear: 'snooze_clear',
  PinnedSet: 'pinned_clear',
  PinnedClear: 'pinned_clear',
  DoneSet: 'done_set',
  DoneClear: 'done_clear',
};

class EventStore {
  @observable events = [];

  // Could be place to track sync state
  @observable isLoading = false;

  @action add(itemId, type, data) {
    const time = new Date();
    const seqId = nextSeqId;
    nextSeqId += 1;
    this.events.push({seqId, time, itemId, type, data});
    console.log(this.events[this.events.length - 1]);
  }
}

const store = new EventStore();
export default store;
