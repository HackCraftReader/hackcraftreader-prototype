import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  RefreshControl,
  ListView,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  Ionicons,
} from '@exponent/vector-icons';

import moment from 'moment/src/moment'; // Moment ES6 workaround
import Colors from '../constants/Colors';

import Router from '../navigation/Router';

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

// TODO:
// add signaling
// push search screen, may not do grouping (or maybe it searches all?)
export default class ArticlesScreen extends React.Component {
  static route = {
    navigationBar: {
      ...hcrNavigationBarRouteConfig,
      renderLeft: OptionsMenuButton,
      renderRight: ({ config: { eventEmitter }, params }) =>
        <FilterAndSearchButton emitter={eventEmitter} params={params} />
    },
  }

  static staticTopStories = require('../assets/hackernews/topStories.json');
  static staticStoriesMeta = require('../assets/hackernews/meta.json');

  constructor(props) {
    super(props);
    this.ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    var stories = ArticlesScreen.staticTopStories;
    stories.forEach((story, index) => {
      story.source = 'HN';
      story.rank = index + 1;
      story.when = moment(story.created_at_i * 1000).from(Number(ArticlesScreen.staticStoriesMeta.now_i * 1000));
    });
    this.isTop = this.props.route.params.name === 'Top';
    this.state = {
      isRefreshing: false,
      basic: true,
      stories: stories,
      feedItems: FEED_LIST_ITEMS,
      groupCountTitle: this.isTop ? TOP_GROUP_COUNT.title : BYDAY_GROUP_COUNT.title,
      groupCountItems: this.isTop ? TOP_GROUP_COUNT.items : BYDAY_GROUP_COUNT.items,
    };
  }

  componentWillMount() {
    this._subscriptionToggleOptions = this.props.route.getEventEmitter().addListener('toggleOptions', this._toggleOptions);
    this._subscriptionSetFiltered = this.props.route.getEventEmitter().addListener('setFiltered', this._setFiltered);
  }

  componentWillUnmount() {
    this._subscriptionToggleFilter.remove();
    this._subscriptionSetFiltered.remove();
  }

  onRefresh = () => {
    this.setState({isRefreshing: true});
    setTimeout(() => {
      this.setState({isRefreshing: false});
    }, 3000);
  }

  render() {
    const groupSize = this.state.groupCountItems.filter(item => item.selected)[0].value;
    const groupedStories = this._groupStories(this.state.stories, groupSize);
    return (
      <ArticleListOptionsDrawer
        ref={(optionsDrawer) => { this._optionsDrawer = optionsDrawer; }}
        drawerPosition={'left'}
        feedItems={this.state.feedItems}
        groupCountTitle={this.state.groupCountTitle}
        groupCountItems={this.state.groupCountItems}
        updateFeedItems={this._updateFeedItems}
        updateGroupCountItems={this._updateGroupCountItems}
      >
        <SwipeListView
          style={styles.container}
          contentContainerStyle={this.props.route.getContentContainerStyle()}
          dataSource={this.ds.cloneWithRows(groupedStories)}
          renderRow={data =>
            (data.isSection
            ? <ArticleSection section={data} checkAll={this._checkAll} />
            : <ArticleRow
              article={data}
              isLast={data.isLast}
              upvote={this._upvoteArticle}
              check={this._checkArticle}
              craft={this._craftArticle}
              openArticle={this._openArticle}
              openComments={this._openComments}
              />
            )}
          refreshControl={
            <RefreshControl
              refreshing={this.state.isRefreshing}
              onRefresh={this._onRefresh}
            />
            }
          renderHiddenRow={data => (
            <View style={styles.rowBack}>
              <Text>Left</Text>
              <TouchableOpacity onPress={_ => this.toggleOptions()} >
                <Text> Right </Text>
              </TouchableOpacity>
            </View>
            )}
          leftOpenValue={75}
          rightOpenValue={-75}
        />
      </ArticleListOptionsDrawer>
    );
  }

  _toggleOptions = () => {
    this._optionsDrawer.toggle();
  }

  _setFiltered = filtered => {
    console.log('filtered set!');
    this.props.navigator.updateCurrentRouteParams({filtered: filtered});
  }

  _updateFeedItems = newItems => {
    console.log('update feed items');
    this.setState({feedItems: newItems});
  }

  _updateGroupCountItems = newItems => {
    console.log('update group items');
    this.setState({groupCountItems: newItems});
  }

  _checkAll = ({rangeStart, rangeEnd}) => {
    console.log(rangeStart, rangeEnd);
    alert('check all');
  }

  _upvoteArticle = article => {
    console.log(Object.keys(article));
    console.log(Object.keys(this));
    alert('upvote');
  }

  _checkArticle = article => {
    console.log(Object.keys(article));
    console.log(Object.keys(this));
    alert('check');
  }

  _craftArticle = article => {
    console.log(Object.keys(article));
    console.log(Object.keys(this));
    alert('check');
  }

  _openArticle = article => {
    console.log(Object.keys(article));
    console.log(Object.keys(this));
    alert('article');
  }

  _openComments = article => {
    const rootNav = this.props.navigation.getNavigator('root');
    rootNav.push(Router.getRoute('articleNavigation', {'screen': 'comments', 'article': article}));
  }

  _groupStories(stories, groupSize) {
    var title = 'TOP';
    // if(!this.isTop) - compute by day title
    var groupedStories = [];
    stories.forEach((story, idx) => {
      if (idx % groupSize === 0) {
        if (idx > 0) groupedStories[groupedStories.length - 1].isLast = true;
        groupedStories.push(
          { 'isSection': true,
            'title': `${title} ${idx + 1}-${idx + groupSize}`,
            'iconName': 'y-combinator-square',
            'rangeStart': idx,
            'rangeEnd': idx + groupSize
          });
      }
      groupedStories.push(story);
    });
    if (groupedStories.length > 0) groupedStories[groupedStories.length - 1].isLast = true;
    return groupedStories;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    //paddingTop: 15,
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
