import React from 'react';
import {
  StyleSheet,
  TouchableWithoutFeedback,
  Text,
  View,
  InteractionManager
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
        ref={component => {
          this._component = component;
        }}
        onDrawerClose={() => {
          this.setState({ isOpen: false });
        }}
        onDrawerOpen={() => {
          this.setState({ isOpen: true });
        }}
        drawerBackgroundColor={'#FFF'}
        drawerWidth={280}
        drawerPosition={DrawerLayout.positions[position]}
        renderNavigationView={this._renderNavigationView}
      >
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
    const feedItems = this.props.feedItems.map((item, idx) => (
      <TouchableWithoutFeedback
        key={idx}
        onPress={() => this._handlePressFeed(item, idx)}
      >
        <View style={item.selected && styles.feedSelectedItem}>
          <Text
            style={[styles.feedText, item.selected && styles.feedSelectedText]}
          >
            <FontAwesome name={item.iconName} size={18} />
            {' ' + item.name}
          </Text>
        </View>
      </TouchableWithoutFeedback>
    ));

    const totalItems = this.props.groupCountItems.length;
    const groupCounts = this.props.groupCountItems.map((item, idx) => (
      <TouchableWithoutFeedback
        key={idx}
        onPress={() => this._handlePressRadio(item, idx)}
      >
        <View
          style={[
            styles.radioItem,
            item.selected && styles.radioSelectedItem,
            idx === 0 && { borderTopLeftRadius: 3, borderBottomLeftRadius: 3 },
            idx === totalItems - 1 && {
              borderTopRightRadius: 3,
              borderBottomRightRadius: 3
            }
          ]}
        >
          <Text style={styles.radioText}>{item.value}</Text>
        </View>
      </TouchableWithoutFeedback>
    ));

    return (
      <View style={{ flex: 1 }}>
        <View style={styles.titleContainer}>
          <Text style={styles.titleText}>
            {this.props.title} Settings
          </Text>
        </View>
        <View style={styles.viewContainer}>
          <Text style={styles.sectionText}>SITES IN FEED</Text>
          <View style={styles.feedItemsContainer}>
            {feedItems}
          </View>
          <Text style={styles.sectionText}>{this.props.groupCountTitle}</Text>
          <View style={styles.radioContainer}>
            {groupCounts}
          </View>
        </View>
      </View>
    );
  };

  _handlePressRadio = (item, idx) => {
    var newItems = this.props.groupCountItems.map(item => ({
      ...item,
      selected: false
    }));
    item.selected = !item.selected;
    newItems[idx] = item;

    this._component.closeDrawer();
    InteractionManager.runAfterInteractions(() => {
      this.props.updateGroupCountItems(newItems);
    });
  };

  _handlePressFeed = (item, idx) => {
    var newItems = this.props.feedItems.map(item => ({
      ...item,
      selected: false
    }));
    item.selected = !item.selected;
    newItems[idx] = item;

    this._component.closeDrawer();
    InteractionManager.runAfterInteractions(() => {
      this.props.updateFeedItems(newItems);
    });
  };
}

const styles = StyleSheet.create({
  viewContainer: {
    flex: 1,
    backgroundColor: Colors.optionsBackround,
    padding: 6,
    paddingTop: 30
  },
  titleContainer: {
    height: 64,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingBottom: 10,
    backgroundColor: Colors.optionsHeaderBackground
  },
  titleText: {
    fontSize: 24,
    color: Colors.optionsItem
  },
  sectionText: {
    marginLeft: 1,
    marginBottom: 8,
    color: Colors.optionsSectionTitle,
    fontSize: 12
  },
  feedItemsContainer: {
    marginBottom: 35
  },
  feedSelectedItem: {
    backgroundColor: Colors.optionsHighlightBackground,
    borderRadius: 3
  },
  feedText: {
    backgroundColor: 'transparent',
    color: Colors.optionsItem,
    fontWeight: 'bold',
    fontSize: 18,
    padding: 3
  },
  feedSelectedText: {
    color: 'white'
  },
  radioContainer: {
    height: 30,
    flexDirection: 'row'
  },
  radioItem: {
    borderColor: Colors.optionsRadioBorder,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1
  },
  radioSelectedItem: {
    backgroundColor: Colors.optionsHighlightBackground
  },
  radioText: {
    color: 'white',
    fontSize: 20
  }
});
