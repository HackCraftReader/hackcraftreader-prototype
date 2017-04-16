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
  const {openEvent, event} = props;
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
  const added = event.type.includes('add') || event.type.includes('set');
  /* Don't do this extra verbage...
  let action = '';
  if (event.type.includes('add')) {
    action = 'added to ';
  } else if (event.type.includes('set')) {
    action = 'set on ';
  } else if (event.type.includes('remove')) {
    action = 'removed from ';
  } else if (event.type.includes('clear')) {
    action = 'cleared on ';
  }
  */
  const wasComment = event.itemId !== event.articleId || event.data.on === 'comments';
  let on;
  let author = null;
  let descendantsCount = 0;
  if (wasComment) {
    if (event.itemId !== event.articleId) {
      on = 'comment by';
      author = <Text style={styles.author}>{event.data.author}</Text>;
    } else {
      on = 'comments';
    }
    const item = ItemStore.cachedItem(event.itemId);
    descendantsCount = item ? item.descendantsCount : event.data.descendantsCount;
  } else {
    on = 'article';
  }

  // TODO: Rectar a container pure component for more code use
  if (event.type === Event.NoteAdd || event.type === Event.NoteEdit) {
    let t = added ? 'Added note to ' : 'Edited note on ';
    t += on;
    return (
      <EventRow openEvent={openEvent} event={event}>
        <Text style={styles.text}>
          {t} {author}
        </Text>
        <CommentBlock text={event.data.note} />
        <Text style={styles.attributes}>
          {when}
          {(descendantsCount > 0) && (' • ' + descendantsCount + ' replies')}
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
          {spent + ' spent reading ' + event.data.on}
        </Text>
        <Text style={styles.attributes}>
          {when}
        </Text>
      </EventRow>
    );
  } else if (event.type === Event.TagAdd || event.type === Event.TagRemove) {
    const tag = tagByCode(event.data.code);
    return (
      <EventRow openEvent={openEvent}>
        <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
          <ItemTag label={event.data.label} color={tag.color} toggled={added} />
          <Text style={styles.text}>
            {' → ' + on} {author}
          </Text>
        </View>
        <Text style={styles.attributes}>
          {when}
          {(descendantsCount > 0) && (' • ' + descendantsCount + ' replies')}
        </Text>
      </EventRow>
    );
  } else if (event.type === Event.SnoozeSet || event.type === Event.SnoozeClear) {
    return (
      <EventRow openEvent={openEvent}>
        <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
          <SnoozedTag label={event.data.label} toggled={added} />
          <Text style={styles.text}>
            {' → ' + on} {author}
          </Text>
        </View>
        <Text style={styles.attributes}>
          {when}
          {(descendantsCount > 0) && (' • ' + descendantsCount + ' replies')}
        </Text>
      </EventRow>
    );
  } else if (event.type === Event.PinnedSet || event.type === Event.PinnedClear) {
    return (
      <EventRow openEvent={openEvent}>
        <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
          <PinnedTag toggled={added} />
          <Text style={styles.text}>
            {' → ' + on} {author}
          </Text>
        </View>
        <Text style={styles.attributes}>
          {when}
          {(descendantsCount > 0) && (' • ' + descendantsCount + ' replies')}
        </Text>
      </EventRow>
    );
  } else if (event.type === Event.DoneSet || event.type === Event.DoneClear) {
  } else {
    console.warn('unkown event type: ' + event.type);
    return <View />;
  }
}

const styles = StyleSheet.create({
  eventContainer: {
    backgroundColor: Colors.inputBackground,
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
    borderColor: Colors.inputBorder,
    borderWidth: 1,
    borderRadius: 3,
    backgroundColor: 'white',
    padding: 8,
    marginTop: 5,
    marginBottom: 5,
  },

  noteText: {
    fontSize: 14,
    color: Colors.inputText,
  }
});
