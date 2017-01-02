import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  RefreshControl,
  ListView,
  TouchableOpacity,
  View,
} from 'react-native';

// for ios-share-outline
import {
  Ionicons,
} from '@exponent/vector-icons';

import moment from 'moment/src/moment'; // Moment ES6 workaround
import Colors from '../constants/Colors';

import ArticleRow from '../components/ArticleRow';
import ArticleSection from '../components/ArticleSection';
import ArticleListOptionsDrawer from '../components/ArticleListOptionsDrawer';

import {
  SwipeListView
} from 'react-native-swipe-list-view';

import MaterialSwitch from 'react-native-material-switch';

const LEFT_BUTTON_HIT_SLOP = { top: 0, bottom: 0, left: 0, right: 30 };

const OptionsMenuButton = ({ config: { eventEmitter } }) => (
  <TouchableOpacity
    onPress={() => { eventEmitter.emit('toggleOptions'); }}
    hitSlop={LEFT_BUTTON_HIT_SLOP}
    style={buttonStyles.buttonContainer}
  >
    <Ionicons
      name='md-menu'
      size={24}
      color='white'
      style={buttonStyles.button}
    />
  </TouchableOpacity>
);

class FilterAndSearchButton extends Component {
  render() {
    const filtered = this.props.params.filtered;
    const checkedColor = filtered ? Colors.hcrButtonBackground : 'white';

    const SwitchButton = (
      <Ionicons
        name='md-checkmark'
        size={14}
        color={checkedColor}
        style={{backgroundColor: 'transparent'}}
      />);

    return (
      <View style={styles.filterSwitchContainer}>
        <MaterialSwitch
          value={filtered}
          onValueChange={this._toggleFiltered}
          inactiveButtonColor={Colors.hcrButtonBackground}
          activeButtonColor={Colors.mostlyWhite}
          buttonRadius={10}
          switchWidth={30}
          switchHeight={14}
          width={35}
          buttonContent={SwitchButton}
        />
        <TouchableOpacity
          onPress={this._toggleSearch}
          width={24}
          style={buttonStyles.buttonContainer}
        >
          <Ionicons
            name='ios-search'
            size={24}
            color='white'
          />
        </TouchableOpacity>
      </View>
    );
  }

  _toggleFiltered = (state) => {
    this.props.emitter.emit('setFiltered', state);
  }

  _toggleSearch = () => {
    console.log('toggle search');
  }
}

const hcrNavigationBarRouteConfig = {
  title(params) { return params.name; },
  backgroundColor: Colors.hcrBackground,
  tintColor: 'white',
  height: 64,
};

const FEED_LIST_ITEMS = [
  {name: 'Hacker News', iconName: 'y-combinator-square', selected: true},
  {name: 'Programming Reddit', iconName: 'reddit-square', selected: false},
  {name: 'All Collated', iconName: 'renren', selected: false},
  {name: 'All Sequential', iconName: 'list-ul', selected: false},
];

const TOP_GROUP_COUNT = {
  title: 'GROUP SIZE',
  items: [
    {value: 5, selected: true},
    {value: 10, selected: false},
    {value: 15, selected: false},
    {value: 30, selected: false},
  ]
};

const BYDAY_GROUP_COUNT = {
  title: 'ITEMS PER DAY',
  items: [
    {value: 5, selected: true},
    {value: 15, selected: false},
    {value: 30, selected: false},
    {value: 60, selected: false},
  ]
};

function colorForSource(source) {
  if (source === 'HN') {
    return Colors.backgroundHackerNews;
  } else if (source === 'Reddit') {
    return Colors.backgroundReddit;
  } else {
    return Colors.hcrBackground;
  }
}

export default class CommentsScreen extends React.Component {
  static route = {
    navigationBar: {
      visible: false,
      // This sets the background color for the status bar
      backgroundColor: (params) => colorForSource(this.params.article.source)
    }
  };

  constructor(props) {
    super(props);
    this.article = this.props.route.params.article;
    this.comments = this.article.children;
    this.state = {
      isRefreshing: false,
    };
  }

  onRefresh = () => {
    this.setState({isRefreshing: true});
    setTimeout(() => {
      this.setState({isRefreshing: false});
    }, 3000);
  }

  render() {
    return <View style={styles.container} />;
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.screenBase,
  },
  filterSwitchContainer: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'flex-end',
    width: 100,
    height: 45,
    alignItems: 'center',
  },
  rowFront: {
    alignItems: 'center',
    backgroundColor: '#CCC',
    borderBottomColor: 'black',
    borderBottomWidth: 1,
    justifyContent: 'center',
    height: 50,
  },
  rowBack: {
    alignItems: 'center',
    backgroundColor: '#DDD',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 15,
  }
});

const buttonStyles = StyleSheet.create({
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    margin: 16,
  },
});
