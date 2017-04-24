import React from 'react';
import {
  StyleSheet,
  Text,
  ListView,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  NavigationStyles
} from '@exponent/ex-navigation';

import CraftIcon from '../components/CraftIcon';

import {TagToggle, Tags} from '../components/Tags';
import {Snooze} from '../components/Snooze';

import Colors from '../constants/Colors';

import EventItem from '../components/EventItem';

import EventStore from '../store/EventStore';


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
      ...NavigationStyles.SlideVertical,
    }
  }

  constructor(props) {
    super(props);
    const { articleCache, title } = this.props.route.params;
    this.ds = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 !== r2,
    });
    const eventData = articleCache.events.map(([seqId, storeId]) => EventStore.bySeqId(seqId));
    const listData = this.ds.cloneWithRows(eventData);
    this.state = {listData, title};
  }

  render() {
    return (
      <View style={styles.container}>
        {this._renderHeader()}
        <ListView
          dataSource={this.state.listData}
          renderRow={this._renderRow}
          renderSeparator={this._renderSeparator}
        />
      </View>
    );
  }

  _renderHeader = () => {
    return (
      <View style={styles.header}>
        <View style={styles.headerTitle}>
          <Text style={styles.articleTitle} numberOfLines={1}>
            {this.state.title}
          </Text>
        </View>
        <View style={styles.headerBookends}>
          <TouchableOpacity
            onPress={this._close}
            style={styles.searchContainer}
          >
            <Text style={styles.closeButton}>
              Close
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  _renderRow = (rowData, sectionId, rowId) => {
    return (
      <EventItem event={rowData} />
    );
  }

  _renderSeparator = (sectionId, rowId) => {
    const indented = {
      backgroundColor: 'white',
      height: 0.5,
      flexDirection: 'row',
      flex: 1,
    };
    return (
      <View key={sectionId + rowId} style={indented}>
        <View style={{width: 30}} />
        <View style={styles.bottomBorder} />
      </View>
    );
  }
  

  _close = () => {
    this.props.navigator.pop();
    if (this.state.updateCallback) {
      this.state.updateCallback();
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.screenBase,
  },

  // ---
  // Header
  // ----
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    padding: 9,
    paddingRight: 10,
    height: 64,
    backgroundColor: Colors.hcrBackground,
  },
  articleTitle: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  headerTitle: {
    paddingLeft: 30,
    width: 300,
    flexDirection: 'row',
  },
  headerBookends: {
    width: 60,
    flexDirection: 'row',
  },
  closeButton: {
    fontSize: 20,
    color: 'white',
  },

  background: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'rgba(119, 119, 119, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ---
  // Row
  // ---
  bottomBorder: {
    borderBottomColor: Colors.hairlineBorder,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flex: 1,
  }
});
