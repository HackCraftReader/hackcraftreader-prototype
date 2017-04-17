import React from 'react';

import {
  StyleSheet,
  Text,
  Animated,
  TouchableOpacity,
  TouchableHighlight,
  View,
} from 'react-native';

import moment from 'moment/src/moment'; // Moment ES6 workaround

import CraftIcon from '../components/CraftIcon';
import {AggStateRow} from '../components/ArticleComponents';

import ItemStore from '../store/ItemStore';
import {Event} from '../store/EventStore';

import Colors from '../constants/Colors';

import relativeDayName from '../utilities/relativeDayName';

import { Ionicons, FontAwesome } from '@exponent/vector-icons';

import { Tags, tagByCode, PinnedTag, SnoozedTag, NoteTag, ItemTag } from './Tags';

class EventCollapsableRow extends React.Component {
  constructor(props) {
    super(props);
    const startValue = props.expanded ? 1 : 0;
    this.state = {
      rotationValue: new Animated.Value(startValue),
    };
  }

  _toggleExpand = () => {
    const toValue = this.props.expanded ? 0 : 1;
    Animated.timing(
      this.state.rotationValue,
      {
        toValue,
        duration: 100,
      }
    ).start(() => this.props.toggleExpand());
  }

  render() {
    const rotation = this.state.rotationValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['90deg', '270deg']
    });
    const style = {
      transform: [{rotate: rotation}]
    };

    const AnimatedIonicons = Animated.createAnimatedComponent(Ionicons);
    return (
      <View style={styles.eventContainer}>
        <TouchableHighlight
          onPress={this._toggleExpand}
          underlayColor='white' //'#E8F0FE' only use underlay color for rows that navigate, this row toggles
        >
          <View style={styles.eventItem}>
            <View style={{flexDirection: 'row', flex: 1}}>
              <View>
                {this.props.children}
              </View>
            </View>
            <View style={styles.eventOpener}>
              <AnimatedIonicons
                name={'ios-arrow-forward'}
                size={29}
                color={'#BDC1C9'}
                style={style}
              />
            </View>
          </View>
        </TouchableHighlight>
      </View>
    );
  }
}

function formatTimePassed(elapsed) {
  const mins = Math.floor(elapsed / 60) + 'm ';
  const secs = Math.floor(elapsed % 60) + 's';
  return elapsed >= 60 ? mins + secs : secs;
}

export default function EventAggItem({event, toggleExpand}) {
  const spent = formatTimePassed(event.timeSpent);
  const articleAgg = event.type === 'agg_article_events';
  let onWhat = '';
  if (articleAgg) {
    onWhat = 'article';
  } else {
    // TODO: Consider whether the context of actions from feed
    // page directly gets its own context or its own labeling such as
    // " on article from feed";
    if (event.uniqueComments) {
      onWhat += event.uniqueComments
              + ' '
              + (event.uniqueComments > 1 ? 'comments' : 'comment');
    } else {
      onWhat = 'comments';
    }
  }
  const eventText = event.eventCount > 1 ? 'events' : 'event';
  const whenMin = moment(event.minTime, 'X').from(moment());
  const whenMax = moment(event.maxTime, 'X').from(moment());
  return (
    <EventCollapsableRow toggleExpand={toggleExpand} expanded={event.expanded}>
      <Text style={styles.text}>
        {spent + ' '}
        {articleAgg
         ? <Ionicons name='ios-globe-outline' size={13} />
         : <CraftIcon name='hcr-comment' size={13} />
        }
        {' • ' + event.eventCount + ' ' + eventText + ' on ' + onWhat}
      </Text>
      {event.tags.length > 0
       ? <AggStateRow tags={event.tags} />
       : <Text style={styles.attributes}>
         {whenMin}
         {(whenMax !== whenMin) && ' • ' + whenMax}
       </Text>
      }
    </EventCollapsableRow>
  );
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
