import React from 'react';

import {
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableHighlight,
  View,
} from 'react-native';

import moment from 'moment/src/moment'; // Moment ES6 workaround

import ItemStore from '../store/ItemStore';
import {Event} from '../store/EventStore';

import Colors from '../constants/Colors';

import relativeDayName from '../utilities/relativeDayName';

import { Ionicons, FontAwesome } from '@exponent/vector-icons';

import { Tags, tagByCode, PinnedTag, SnoozedTag, NoteTag, ItemTag } from './Tags';

function CommentBlock({text}) {
  return (
    <View style={styles.commentBlock}>
      <Text
        style={styles.noteText}
        numberOfLines={2}
      >
        {text}
      </Text>
    </View>
  );
}

function EventRow(props) {
  const {openEvent} = props;
  return (
    <View style={styles.eventContainer}>
      <TouchableHighlight
        onPress={() => openEvent(event)}
        underlayColor='#E8F0FE'
      >
        <View style={styles.eventItem}>
          <View style={{flexDirection: 'row', flex: 1}}>
            <View>
              {props.children}
            </View>
          </View>
          <View style={styles.eventOpener}>
            <Ionicons
              name={'ios-arrow-forward'}
              size={29}
              color={'#BDC1C9'}
            />
          </View>
        </View>
      </TouchableHighlight>
    </View>
  );
}

export default function EventItem({event, openEvent}) {
  const when = moment(event.time, 'X').from(moment());
  if (event.type === Event.NoteAdd || event.type === Event.NoteEdit) {
    let t = event.type === Event.NoteAdd ? 'Added note to ' : 'Edited note on ';
    const wasComment = event.itemId !== event.articleId;
    t += wasComment ? 'comment by' : 'article';

    const item = ItemStore.cachedItem(event.itemId);
    const descendantsCount = item ? item.descendantsCount : event.data.descendantsCount;

    return (
      <EventRow openEvent={openEvent}>
        <Text style={styles.text}>
          {t} {wasComment && <Text style={styles.author}>{event.data.author}</Text>}
        </Text>
        <CommentBlock text={event.data.note} />
        <Text style={styles.attributes}>
          {when}
          {wasComment && (' • ' + descendantsCount + ' replies')}
        </Text>
      </EventRow>
    );
  } else if (event.type === Event.TimeSpent) {
    const mins = Math.floor(event.data.spent / 60) + 'm ';
    const secs = Math.floor(event.data.spent % 60) + 's';
    const spent = event.data.spent >= 60 ? mins + secs : secs;

    return (
      <EventRow openEvent={openEvent}>
        <Text style={styles.text}>
          {spent + ' on ' + event.data.on}
        </Text>
        <Text style={styles.attributes}>
          {when}
        </Text>
      </EventRow>
    );
  } else if (event.type === Event.TagAdd || event.type === Event.TagRemove) {
    const added = event.type === Event.TagAdd;
    const action = added ? 'added to ' : 'removed from ';
    const wasComment = event.itemId !== event.articleId;
    const on = wasComment ? 'comment' : 'article';
    // TODO: look up by code and allow ItemTag to be not "on";
    const tag = tagByCode(event.data.code);
    return (
      <EventRow openEvent={openEvent}>
        <View style={{flexDirection: 'row'}}>
          <ItemTag label={event.data.label} color={tag.color} />
          <Text style={styles.text}>
            {' tag ' + action + on}
          </Text>
        </View>
        <Text style={styles.attributes}>
          {when}
        </Text>
      </EventRow>
    );
    //SnoozeSet: 'snooze_clear',
//            SnoozeClear: 'snooze_clear',
//            PinnedSet: 'pinned_clear',
//            PinnedClear: 'pinned_clear',
//            DoneSet: 'done_set',
//            DoneClear: 'done_clear',

  } else {
    console.warn('unkown event type: ' + event.type);
    return <View/>;
  }
}

const styles = StyleSheet.create({
  eventContainer: {
    backgroundColor: 'white'
  },
  eventItem: {
    paddingLeft: 40,
    flexDirection: 'row',
    flex: 1,
    paddingTop: 5,
    paddingBottom: 5,
  },
  eventOpener: {
    width: 40, // maybe 34
    justifyContent: 'center',
    alignItems: 'center'
  },
  linePadding: {
    paddingTop: 5,
    paddingBottom: 5,
  },
  text: {
    fontSize: 14,
    color: 'black',
  },
  author: {
    fontWeight: '600',
    fontSize: 14,
    color: Colors.commentHeader,
  },
  attributes: {
    fontSize: 14,
    color: Colors.secondaryTitle,
  },

  commentBlock: {
    borderRadius: 3,
    backgroundColor: Colors.inputBackground,
    padding: 8,
    marginTop: 5,
    marginBottom: 5,
  },

  noteText: {
    fontSize: 14,
    color: Colors.inputText,
  }
});
