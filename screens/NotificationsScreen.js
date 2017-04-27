import React, { Component } from 'react';
import {
  StyleSheet,
  ListView,
  TouchableHighlight,
  Text,
  View,
} from 'react-native';

import { Ionicons, FontAwesome } from '@exponent/vector-icons';

import { withNavigation } from '@exponent/ex-navigation';

import moment from 'moment/src/moment'; // Moment ES6 workaround

import ItemStore from '../store/ItemStore';

import {CommentIcon} from '../components/ArticleComponents.js';
import {loadComments} from '../assets/Stories';
import extractDomain from '../utilities/extractDomain';
import cheerio from 'cheerio-without-node-native';

import Colors from '../constants/Colors';

const hcrNavigationBarRouteConfig = {
  backgroundColor: Colors.hcrBackground,
  tintColor: 'white',
  height: 64,
};

const EXAMPLE_NOTIFICATIONS = [
  {
    order: 1,
    type: 'post',
    item: 'hn_a_13186051',
    vote: 3,
    time: moment().subtract(4, 'hours')
  },
  {
    order: 2,
    type: 'comment',
    item: 'hn_c_13186899',
    vote: 5,
    time: moment().subtract(6, 'hours')
  },
  {
    order: 3,
    type: 'comment',
    item: 'hn_c_13186960',
    vote: 2,
    time: moment().subtract(9, 'hours')
  },
  {
    order: 4,
    type: 'comment',
    item: 'hn_c_13186605',
    vote: 8,
    time: moment().subtract(26, 'hours')
  },
  {
    order: 5,
    type: 'comment',
    item: 'hn_c_13186772',
    vote: -1,
    time: moment().subtract(28, 'hours')
  },
  {
    order: 6,
    type: 'comment',
    item: 'hn_c_13187043',
    vote: 4,
    time: moment().subtract(29, 'hours')
  },
];

@withNavigation
export default class NotificationsScreen extends React.Component {
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
    const data = EXAMPLE_NOTIFICATIONS;
    const listData = this.ds.cloneWithRows(data);
    this.state = {listData};
  }

  componentWillMount() {
    const article = ItemStore.lookupItem('hn_a_13186303');
    loadComments(article);
    console.log('loaded comments...')
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
    const {vote, type, time, order} = rowData;
    const item = ItemStore.lookupItem(rowData.item);
    let details = '';
    if (type === 'post') {
      details = item.title + ' (' + extractDomain(item.url) + ')';
    } else {
      var $ = cheerio.load(item.text);
      details = $.root().text();
    }
    return (
      <View style={styles.container}>
        <TouchableHighlight
          onPress={() => this._open(rowData)}
          underlayColor='#E8F0FE'
        >
          <View style={styles.row}>
            <View style={styles.left}>
              <Text style={styles.rankText}>{order}</Text>
            </View>
            <View style={styles.center}>
              <Text style={styles.notificationText}>
                <FontAwesome
                  name={vote > 0 ? 'thumbs-o-up' : 'thumbs-o-down'}
                  size={17}
                  color={'#414141'}
                />
                {' ' + vote} on {type} {time.from(moment())}
              </Text>
              <Text style={styles.detailsText} numberOfLines={2}>{details}</Text>
            </View>
            <View style={styles.right}>
              <CommentIcon
                article={item}
                openComments={() => this._open(rowData)}
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
  },

  notificationText: {
    color: Colors.primaryTitle,
    fontSize: 17,
  },

  left: {
    marginLeft: 15,
    width: 30,
    paddingRight: 5,
    paddingTop: 8,
  },
  center: {
    flex: 1,
    paddingTop: 8,
    paddingBottom: 8,
  },
  right: {
    width: 45,
    justifyContent: 'center',
    alignItems: 'center'
  },
  rankText: {
    color: Colors.secondaryTitle,
    textAlign: 'center',
    fontSize: 16,
  },
  detailsText: {
    color: Colors.secondaryTitle,
    fontSize: 13,
  },  
  bottomBorder: {
    borderBottomColor: Colors.hairlineBorder,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flex: 1,
  }
});
