import React from 'react';
import {
  StyleSheet,
  Text,
  ScrollView,
  RefreshControl,
  ListView,
  TextInput,
  TouchableOpacity,
  TouchableHighlight,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import {
  NavigationStyles
} from '@exponent/ex-navigation';

import moment from 'moment/src/moment'; // Moment ES6 workaround

import { FontAwesome } from '@exponent/vector-icons';
import CraftIcon from '../components/CraftIcon';

import Colors from '../constants/Colors';

// TODO: onPress does nav pop in an action specific way, sets state of this action being toggled on
// Toggled on means should wrap in a view with background = F2 and touchable hightlight white, otherwise, background white and touchable F2.

function Action(props) {
  return (
    <TouchableHighlight onPress={() => alert('hi')}
    underlayColor='#F2F2F2'>
      <View style={styles.actionContainer}>
        <CraftIcon
          name={props.iconName}
          size={48}
          color={'#666666'}
          style={{textAlign: 'center'}}
        />
        <Text style={styles.actionLabel}>
          {props.label}
        </Text>
        <Text style={styles.actionTime}>
          {props.time}
        </Text>
      </View>
    </TouchableHighlight>
  );
}

export default class ActionScreen extends React.Component {
  static route = {
    navigationBar: {
      visible: false,
    },
    // This is a hack copied from here:
    // https://github.com/exponent/ex-navigation/issues/122
    // The sceneAnimation code is a mutated version
    // of NavigationStyles.Fade.sceneAnimation
    styles: {
      ...NavigationStyles.Fade,
      sceneAnimations: (props) => {
        const {
          position,
          scene,
        } = props;

        const index = scene.index;
        const inputRange = [index - 1, index, index + 1];

        const opacity = position.interpolate({
          inputRange,
          outputRange: [0, 1, 1],
        });

        return {
          opacity,
          transform: [
            { translateX: 0 },
            { translateY: 0 },
            { scale: 1 },
          ],
          backgroundColor: 'transparent',
          shadowOpacity: 0
        };
      }
    }
  }

  render() {
    const tomorrow = moment().add(1, 'day');
    const shortTomorrow = moment.weekdaysShort(tomorrow.weekday());
    const starHitSlop = { top: 25, bottom: 30, left: 25, right: 25 };
    return (
      <TouchableWithoutFeedback
        onPress={_ => this._close()}
      >
        <View style={styles.background}>
          <View style={styles.container}>
            <View style={styles.tagLayout}>
              <TouchableOpacity
                onPress={_ => this.reload()}
                hitSlop={starHitSlop}
              >
                <FontAwesome
                  name={'star-o'}
                  size={40}
                  color={Colors.starBlue}
                  style={styles.star}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={_ => this.reload()}
                hitSlop={starHitSlop}
              >
                <FontAwesome
                  name={'star'}
                  size={40}
                  color={Colors.starGreen}
                  style={styles.star}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={_ => this.reload()}
                hitSlop={starHitSlop}
              >
                <FontAwesome
                  name={'star-o'}
                  size={40}
                  color={Colors.starRed}
                  style={styles.star}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={_ => this.reload()}
                hitSlop={starHitSlop}
              >
                <FontAwesome
                  name={'star-o'}
                  size={40}
                  color={Colors.starOrange}
                  style={styles.star}
                />
              </TouchableOpacity>
            </View>
            <TextInput
              multiline
              placeholder='My note here...'
              style={styles.noteInput}
              onEndEditing={() => this._close()} />
            <View style={styles.iconRow}>
              <Action
                iconName='hcr-couch'
                label='This weekend'
                time='Sat 7:30 am'
              />
              <Action
                iconName='hcr-sun-half'
                label='Later today'
                time='6:00 pm'
              />
            </View>
            <View style={styles.iconRow}>
              <Action
                iconName='hcr-sun-full'
                label='Tomorrow'
                time={shortTomorrow + ' 7:00 am'}
              />
              <Action
                iconName='hcr-pin'
                label='Pin'
                time='To Top'
              />
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    );
  }

  _close = () => {
    this.props.navigator.pop();
  }
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'rgba(119, 119, 119, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  container: {
    width: 322,
    height: 492,
    borderRadius: 3,
    backgroundColor: 'white',
    shadowColor: '#000000',
    shadowRadius: 8,
    shadowOffset: {
      height: 5
    },
    shadowOpacity: 0.16,
  },

  tagLayout: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },

  noteInput: {
    height: 200,
    backgroundColor: Colors.inputBackground,
    borderTopColor: Colors.inputBorder,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.inputBorder,
    borderBottomWidth: StyleSheet.hairlineWidth,
    padding: 11,
    fontSize: 16,
    color: Colors.actionLabel,
  },

  iconRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },

  star: {
  },

  actionContainer: {
    width: 161,
    flexDirection: 'column',
    paddingBottom: 5,
    paddingTop: 5,
  },

  actionLabel: {
    fontSize: 16,
    textAlign: 'center',
    color: Colors.actionLabel,
  },
  actionTime: {
    fontSize: 12,
    textAlign: 'center',
    color: Colors.actionSubLabel,
  },
});
