import React from 'react';
import {
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
  Text,
  View,
} from 'react-native';
import { FontAwesome } from '@exponent/vector-icons';

import DrawerLayout from 'react-native-drawer-layout';
import Colors from '../constants/Colors';

export default class ArticleListOptionsDrawer extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isOpen: false };
  }

  render() {
    let { drawerPosition } = this.props;
    let position = drawerPosition[0].toUpperCase() + drawerPosition.substr(1);
    return (
      <DrawerLayout
        ref={component => { this._component = component; }}
        onDrawerClose={() => { this.setState({isOpen: false}); }}
        onDrawerOpen={() => { this.setState({isOpen: true}); }}
        drawerWidth={280}
        drawerPosition={DrawerLayout.positions[position]}
        renderNavigationView={this._renderNavigationView}>
        {this.props.children}
      </DrawerLayout>
    );
  }

  toggle() {
    if (this.state.isOpen) {
      this._component.closeDrawer();
    } else {
      this._component.openDrawer();
    }
  }

  _renderNavigationView = () => {
    const feedItems = this.props.feedItems.map((item, idx) =>
      <TouchableWithoutFeedback key={idx} onPress={() => this._handlePressFeed(item)}>
        <View style={item.selected && styles.feedSelectedItem}>
          <Text style={[styles.feedText, item.selected && styles.feedSelectedText]}>
            <FontAwesome
              name={item.iconName}
              size={18}
            />
            {' ' + item.name}
          </Text>
        </View>
      </TouchableWithoutFeedback>);

    const groupCounts = this.props.groupCountItems.map((item, idx) =>
      <TouchableWithoutFeedback key={idx} onPress={() => this._handlePressRadio(item, idx)}>
        <View style={[
          item.selected ? styles.radioSelectedItem : styles.radioItem,
          idx < this.props.groupCountItems.length - 1 ? styles.radioItemInner : {}
        ]}>
          <Text style={styles.radioText}>{item.value}</Text>
        </View>
      </TouchableWithoutFeedback>);

    return (
      <View style={styles.viewContainer}>
        <Text style={styles.sectionText}>SITES IN FEED</Text>
        <View style={styles.feedItemsContainer}>
          {feedItems}
        </View>
        <Text style={[styles.sectionText, {marginTop: 30}]}>{this.props.groupCountTitle}</Text>
        <View style={styles.radioContainer}>
          { groupCounts }
        </View>
        <View style={{flex: 1}} />
      </View>
    );
  }

  _handlePressRadio = (item, idx) => {
    this._component.closeDrawer();
    console.log('radio', item, idx);
  }

  _handlePressFeed = (item) => {
    this._component.closeDrawer();
    console.log('feed', item);
  }
}

const styles = StyleSheet.create({
  viewContainer: {
    flex: 1,
    backgroundColor: Colors.optionsBackround,
    padding: 6,
    paddingTop: 30,
  },
  headerContainer: {
    backgroundColor: Colors.optionsHeaderBackground,
  },
  sectionText: {
    marginBottom: 8,
    color: Colors.optionsSectionTitle,
    fontSize: 12,
  },
  feedItemsContainer: {
    paddingBottom: 5
  },
  feedSelectedItem: {
    backgroundColor: Colors.optionsHighlightBackground,
    borderRadius: 3,
  },
  feedText: {
    backgroundColor: 'transparent',
    color: Colors.optionsItem,
    fontWeight: 'bold',
    fontSize: 18,
    padding: 3
  },
  feedSelectedText: {
    color: 'white',
  },
  radioContainer: {
    overflow: 'hidden',
    height: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,

    borderColor: Colors.optionsRadioBorder,
    borderRadius: 3,
    borderWidth: StyleSheet.hairlineWidth,
  },
  radioSelectedItem: {
    height: 30,
    flex: 1,
    backgroundColor: Colors.optionsHighlightBackground,
    justifyContent: 'center',
    margin: 0,
  },
  radioItem: {
    height: 30,
    justifyContent: 'center',
    flex: 1,
  },
  radioItemInner: {
    borderRightColor: Colors.optionsRadioBorder,
    borderRightWidth: StyleSheet.hairlineWidth,
  },
  radioText: {
    color: 'white',
    fontSize: 20,
    textAlign: 'center',
    backgroundColor: 'transparent',
  },
});
