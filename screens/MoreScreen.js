import React, { Component } from 'react';
import {
  StyleSheet,
  ListView,
  TouchableHighlight,
  Text,
  View,
} from 'react-native';

import { Ionicons } from '@exponent/vector-icons';

import { withNavigation } from '@exponent/ex-navigation';

import Colors from '../constants/Colors';

const hcrNavigationBarRouteConfig = {
  backgroundColor: Colors.hcrBackground,
  tintColor: 'white',
  height: 64,
};

@withNavigation
export default class MoreScreen extends React.Component {
  static route = {
    navigationBar: {
      ...hcrNavigationBarRouteConfig,
      title: 'More',
    }
  }

  constructor(props) {
    super(props);
    this.ds = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 !== r2,
    });
    const data = [
      {'name': 'Site Management'},
      {'name': 'Get Browser Extension'},
      {'name': 'Sync & Account'},
      {'name': 'Appearance'},
    ];
    const listData = this.ds.cloneWithRows(data);
    this.state = {listData};
  }

  render() {
    return (
      <View style={styles.container}>
        <ListView
          dataSource={this.state.listData}
          renderRow={this._renderRow}
          renderSeparator={this._renderSeparator}
        />
      </View>
    );
  }

  _renderRow = (rowData, sectionId, rowId) => {
    return (
      <View style={styles.container}>
        <TouchableHighlight
          onPress={() => this._open(rowData)}
          underlayColor='#E8F0FE'
        >
          <View style={styles.row}>
            <Text style={styles.rowText}>
              {rowData.name}
            </Text>
            <View style={styles.right}>
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

  _open(action) {
    console.log(action.name);
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
        <View style={{width: 15}} />
        <View style={styles.bottomBorder} />
      </View>
    );
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flex: 1,
    padding: 5,
  },

  rowText: {
    fontSize: 17,
    paddingTop: 5,
    paddingLeft: 20,
  },

  right: {
    width: 45,
    justifyContent: 'center',
    alignItems: 'center'
  },

  bottomBorder: {
    borderBottomColor: Colors.hairlineBorder,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flex: 1,
  }
});
