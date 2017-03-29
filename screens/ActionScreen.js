import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableHighlight,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import {
  NavigationStyles
} from '@exponent/ex-navigation';

import {observer, inject} from 'mobx-react/native';

import CraftIcon from '../components/CraftIcon';

import {TagToggle, Tags} from '../components/Tags';
import {Snooze} from '../components/Snooze';

import Colors from '../constants/Colors';

@inject('ItemStore')
@observer
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

  constructor(props) {
    super(props);
    const { itemId, updateCallback } = this.props.route.params;
    const item = this.props.ItemStore.item(itemId);
    const noteText = item.note;
    this.state = {noteText, item, updateCallback};
  }

  render() {
    const ActionTagToggle = ({tag}) =>
      <TagToggle
        tag={tag}
        toggled={this._isTagged(tag)}
        onPress={() => this._toggleTag(tag)}
        hitSlopValue={8}
      />;

    const SnoozeButton = ({label, iconName}) =>
      <ActionButton
        iconName={iconName}
        label={Snooze.snoozeRelativeLabel(label)}
        subLabel={Snooze.snoozeRelativeTime(label)}
        toggled={this.state.item.isSnoozed(label)}
        onPress={() => this._toggleSnooze(label)}
      />;

    return (
      <TouchableWithoutFeedback
        onPress={_ => this._close()}
      >
        <View style={styles.background}>
          <View style={styles.container}>
            <View style={styles.tagContainer}>
              <View style={styles.tagRow}>
                <ActionTagToggle tag={Tags.TagPurple} />
                <ActionTagToggle tag={Tags.TagOrange} />
              </View>
              <View style={styles.tagRow}>
                <ActionTagToggle tag={Tags.TagRed} />
                <ActionTagToggle tag={Tags.TagGreen} />
              </View>
            </View>
            <TextInput
              multiline
              placeholder='My note here...'
              style={styles.noteInput}
              value={this.state.noteText}
              onChangeText={(noteText) => this.setState({noteText})}
              onEndEditing={() => this._saveMyNote()} />
            <View style={styles.iconRow}>
              <SnoozeButton
                label='Weekend'
                iconName='hcr-couch'
              />
              <SnoozeButton
                label='Evening'
                iconName='hcr-sun-half'
              />
            </View>
            <View style={styles.iconRow}>
              <SnoozeButton
                label='Tomorrow'
                iconName='hcr-sun-full'
              />
              <ActionButton
                iconName='hcr-pin'
                label='Pin'
                subLabel='To Top'
                toggled={this._isPinned()}
                onPress={() => this._togglePinned()}
              />
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    );
  }

  _close = () => {
    this.props.navigator.pop();
    if (this.state.updateCallback) {
      this.state.updateCallback();
    }
  }

  _saveMyNote = () => {
    this.state.item.setNote(this.state.noteText);
  }

  _toggleTag = (tag) => {
    this.state.item.tagToggle(tag);
    this._close();
  }

  _isTagged = (tag) => {
    return this.state.item.isTagged(tag);
  }

  _toggleSnooze = (when) => {
    this.state.item.snoozeToggle(when);
    this._close();
  }

  _isPinned = () => {
    return this.state.item.pinned;
  }

  _togglePinned = () => {
    this.state.item.pinToggle();
    this._close();
  }
}

function ActionButton(props) {
  const {iconName, label, subLabel, onPress, toggled} = props;
  const underlayColor = toggled ? 'white' : '#F2F2F2';
  const background = toggled ? {backgroundColor: '#F2F2F2'} : {};

  return (
    <TouchableHighlight
      onPress={onPress}
      underlayColor={underlayColor}
    >
      <View style={[styles.actionContainer, background]}>
        <CraftIcon
          name={iconName}
          size={48}
          color={'#666666'}
          style={{textAlign: 'center'}}
        />
        <Text style={styles.actionLabel}>
          {label}
        </Text>
        <Text style={styles.actionSubLabel}>
          {subLabel}
        </Text>
      </View>
    </TouchableHighlight>
  );
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
  actionSubLabel: {
    fontSize: 12,
    textAlign: 'center',
    color: Colors.actionSubLabel,
  },

  tagContainer: {
    flexDirection: 'column',
    height: 80,
    padding: 5,
  },

  tagRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
});
