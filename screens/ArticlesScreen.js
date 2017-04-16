import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  RefreshControl,
  ListView,
  TouchableOpacity,
  View,
  InteractionManager,
} from 'react-native';

import {
  Ionicons,
} from '@exponent/vector-icons';


import { withNavigation, createFocusAwareComponent } from '@exponent/ex-navigation';

import {
  SwipeListView, SwipeRow
} from 'react-native-swipe-list-view';

import MaterialSwitch from 'react-native-material-switch';

import Colors from '../constants/Colors';

import {observer, inject} from 'mobx-react/native';

import * as mobx from 'mobx';

import {loadHNTopArticles} from '../assets/Stories';

import ItemStore from '../store/ItemStore';
import PinnedStore from '../store/PinnedStore';

import Router from '../navigation/Router';

import CraftIcon from '../components/CraftIcon';
import {ArticleRow} from '../components/ArticleComponents';
import ArticleSection from '../components/ArticleSection';
import ArticleListOptionsDrawer from '../components/ArticleListOptionsDrawer';

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
    InteractionManager.runAfterInteractions(() => {
      this.props.emitter.emit('setFiltered', state);
    });
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
  title: 'STORIES PER GROUP',
  items: [
    {value: 5, selected: true},
    {value: 10, selected: false},
    {value: 15, selected: false},
    {value: 30, selected: false},
  ]
};

const BYDAY_GROUP_COUNT = {
  title: 'STORIES PER DAY',
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
// @observer(['FeedStore', 'ItemStore'])
@inject('ItemStore')
@observer
@withNavigation
export default class ArticlesScreen extends React.Component {
  static route = {
    navigationBar: {
      ...hcrNavigationBarRouteConfig,
      renderLeft: OptionsMenuButton,
      renderRight: ({ config: { eventEmitter }, params }) =>
        <FilterAndSearchButton emitter={eventEmitter} params={params} />
    },
  }

  constructor(props) {
    super(props);
    this.ds = new ListView.DataSource({rowHasChanged: (r1, r2) => mobx.toJS(r1) !== mobx.toJS(r2)});
    this.isTop = this.props.route.params.name === 'Top';
    const showDone = !this.props.route.params.filtered;
    const groupCountItems = this.isTop ? TOP_GROUP_COUNT.items : BYDAY_GROUP_COUNT.items;
    const groupCountTitle = this.isTop ? TOP_GROUP_COUNT.title : BYDAY_GROUP_COUNT.title;
    const articles = loadHNTopArticles();

    this.state = {
      isRefreshing: false,
      basic: true,
      showDone,
      articles,
      feedItems: FEED_LIST_ITEMS,
      groupCountTitle,
      groupCountItems,
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
    // TODO: disable left-swipe in for drawer somehow.. conflicts with swipe on items.
    const dataSource = this._articleList(this.state);
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
          dataSource={dataSource}
          renderRow={this._renderRow}
          refreshControl={
            <RefreshControl
              refreshing={this.state.isRefreshing}
              onRefresh={this.onRefresh}
            />
            }
          renderHiddenRow={(data, secId, rowId, rowMap) =>
            (!data.isSection &&
            <SwipeActions
              article={data}
              check={this._checkArticle}
              craft={this._craftArticle}
              close={_ => rowMap[`${secId}${rowId}`].closeRow()}
            />
            )}
          leftOpenValue={75}
          rightOpenValue={-75}
          closeOnRowPress
        />
      </ArticleListOptionsDrawer>
    );
  }

  _renderRow = data => {
    if (data.isSection) {
      return <ArticleSection section={data} checkAll={this._checkAll} />;
    } else {
      return <ArticleRow
               article={data}
               isLast={data.isLast}
               upvote={this._upvoteArticle}
               openArticle={this._openArticle}
               openComments={this._openComments}
             />;
    }
  }

  _toggleOptions = () => {
    this._optionsDrawer.toggle();
  }

  _setFiltered = filtered => {
    this.props.navigator.updateCurrentRouteParams({filtered: filtered});
    const showDone = !filtered;
    this.setState({showDone});
  }

  _updateFeedItems = newItems => {    
    this.setState({feedItems: newItems});
  }

  _updateGroupCountItems = groupCountItems => {
    this.setState({groupCountItems});
  }

  _checkAll = ({itemIds}) => {
    itemIds.forEach(itemId => {
      const item = ItemStore.lookupItem(itemId);
      if (!item.done) {
        item.doneSet();
      }
    });
    this.setState({});
  }

  _upvoteArticle = articleId => {
    ItemStore.lookupItem(articleId).upvote();
    this.setState({});
  }

  _checkArticle = article => {
    article.doneToggle();
    this.setState({});
  }

  _craftArticle = article => {
    const commentNav = this.props.navigation.getNavigator('root');
    // We use comments context from article list, meaning in Log,
    // this event takes you to the comments screen first.
    const context = {on: 'comments'};
    const actionParams = {
      type: 'article',
      itemId: article.itemId,
      updateCallback: this._updateArticleList,
      context
    };
    commentNav.push(Router.getRoute('action', actionParams));
  }

  _updateArticleList = () => {
    this.setState({});
  }

  _openArticle = article => {
    const rootNav = this.props.navigation.getNavigator('root');
    const routeParams = {'screen': 'article', itemId: article.itemId, url: article.url, updateCallback: this._updateArticleList};
    rootNav.push(Router.getRoute('articleNavigation', routeParams));
  }

  _openComments = article => {
    const rootNav = this.props.navigation.getNavigator('root');
    const routeParams = {'screen': 'comments', itemId: article.itemId, url: article.url, updateCallback: this._updateArticleList};
    rootNav.push(Router.getRoute('articleNavigation', routeParams));
  }

  _groupArticles(articles, showDone, groupSize) {
    var title = 'TOP';
    var curGroup = null;
    var groupedArticles = [];
    articles.forEach((article, idx) => {
      if (idx % groupSize === 0) {
        if (idx > 0) groupedArticles[groupedArticles.length - 1].isLast = true;
        curGroup =
          { 'isSection': true,
            'title': `${title} ${idx + 1}-${idx + groupSize}`,
            'iconName': 'y-combinator-square',
            'itemIds': []
          };
        groupedArticles.push(curGroup);
      }
      if ((!showDone || !article.done) && !article.pinned) {
        groupedArticles.push(article);
        curGroup.itemIds.push(article.itemId);
      }
    });
    if (groupedArticles.length > 0) groupedArticles[groupedArticles.length - 1].isLast = true;
    if (PinnedStore.count > 0) {
      curGroup =
      { 'isSection': true,
        'title': `Pinned`,
        'iconName': 'hcr-pin',
        'itemIds': []
      };
      PinnedStore.pinnedItems.reverse().forEach(item => {
        groupedArticles.push(item);
        curGroup.itemIds.push(item.itemId);
        groupedArticles.unshift(item);
      });
      if (groupedArticles.length > 0) groupedArticles[groupedArticles.length - 1].isLast = true;
      groupedArticles.unshift(curGroup);
    }
    return groupedArticles;
  }

  _articleList({articles, showDone, groupCountItems}) {
    const groupSize = groupCountItems.filter(item => item.selected)[0].value;
    const groupedArticles = this._groupArticles(articles, showDone, groupSize);

    return this.ds.cloneWithRows(groupedArticles);
  }
}

function SwipeActions({article, check, craft, close}) {
  const slop = { top: 30, bottom: 30, left: 30, right: 30 };

  return (
    <View style={styles.rowBack}>
      <View style={styles.checkContainer}>
        <TouchableOpacity onPress={() => {close(); check(article);}} hitSlop={slop}>
          <CraftIcon
            name='hcr-check'
            size={37}
            color='white'
            style={styles.actionIcon}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.craftContainer}>
        <TouchableOpacity onPress={() => {close(); craft(article);}} hitSlop={slop}>
          <CraftIcon
            name='hcr-action'
            size={37}
            color='white'
            style={styles.actionIcon}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.screenBase,
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
    flex: 1,
    flexDirection: 'row',
    padding: 0,
    margin: 0,
  },
  checkContainer: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    backgroundColor: '#5F99CF',
    flex: 1,
    padding: 10,
  },
  craftContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    backgroundColor: Colors.hcrBackground,
    flex: 1,
    padding: 10,
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
