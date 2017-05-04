import React, { Component } from 'react';
import {
  StyleSheet,
  RefreshControl,
  ListView,
  TouchableOpacity,
  View,
  Text,
  InteractionManager
} from 'react-native';

import { Ionicons } from '@exponent/vector-icons';

import SearchBar from '../components/SearchBar';

import { withNavigation } from '@exponent/ex-navigation';

import { Entypo } from '@exponent/vector-icons';

import { SwipeListView } from 'react-native-swipe-list-view';

import MaterialSwitch from 'react-native-material-switch';

import Colors from '../constants/Colors';

import { observer, inject } from 'mobx-react/native';

import * as mobx from 'mobx';

import { loadHNTopArticles, loadHNLastWeekArticles } from '../assets/Stories';

import ItemStore from '../store/ItemStore';
import PinnedStore from '../store/PinnedStore';

import Router from '../navigation/Router';

import CraftIcon from '../components/CraftIcon';
import { ArticleRow } from '../components/ArticleComponents';
import ArticleSection from '../components/ArticleSection';
import ArticleListOptionsDrawer from '../components/ArticleListOptionsDrawer';

const LEFT_BUTTON_HIT_SLOP = { top: 0, bottom: 0, left: 0, right: 30 };

const FEED_LIST_ITEMS = [
  { name: 'Hacker News', iconName: 'y-combinator-square', selected: true },
  { name: 'Programming Reddit', iconName: 'reddit-square', selected: false },
  { name: 'All Collated', iconName: 'renren', selected: false },
  { name: 'All Sequential', iconName: 'list-ul', selected: false }
];

const TOP_GROUP_COUNT = {
  title: 'STORIES PER GROUP',
  items: [
    { value: 5, selected: true },
    { value: 10, selected: false },
    { value: 15, selected: false },
    { value: 30, selected: false }
  ]
};

const BYDAY_GROUP_COUNT = {
  title: 'STORIES PER DAY',
  items: [
    { value: 5, selected: true },
    { value: 15, selected: false },
    { value: 30, selected: false },
    { value: 60, selected: false }
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
      visible: false
    }
  };

  constructor(props) {
    super(props);
    this.ds = new ListView.DataSource({
      rowHasChanged: (r1, r2) => mobx.toJS(r1) !== mobx.toJS(r2),
      sectionHeaderHasChanged: (s1, s2) => s1 !== s2
    });
    const title = this.props.route.params.name;
    this.isTop = title === 'Top';
    const showDone = !this.props.route.params.filtered;
    const groupCountItems = this.isTop
      ? TOP_GROUP_COUNT.items
      : BYDAY_GROUP_COUNT.items;
    const groupCountTitle = this.isTop
      ? TOP_GROUP_COUNT.title
      : BYDAY_GROUP_COUNT.title;
    const articles = this.isTop
      ? loadHNTopArticles()
      : loadHNLastWeekArticles();

    this.timeout = null;
    this.searchBarRef = '';
    this.state = {
      isRefreshing: false,
      basic: true,
      inSearch: false,
      searchText: '',
      title,
      showDone,
      articles,
      feedItems: FEED_LIST_ITEMS,
      groupCountTitle,
      groupCountItems
    };
  }

  componentWillMount() {
    this._subscriptionToggleOptions = this.props.route
      .getEventEmitter()
      .addListener('toggleOptions', this._toggleOptions);
    this._subscriptionSetFiltered = this.props.route
      .getEventEmitter()
      .addListener('setFiltered', this._setFiltered);
  }

  componentWillUnmount() {
    this._subscriptionToggleFilter.remove();
    this._subscriptionSetFiltered.remove();
  }

  onRefresh = () => {
    this.setState({ isRefreshing: true });
    setTimeout(() => {
      this.setState({ isRefreshing: false });
    }, 3000);
  };

  render() {
    // TODO: disable left-swipe in for drawer somehow.. conflicts with swipe on items.
    const dataSource = this._articleList();
    return (
      <ArticleListOptionsDrawer
        ref={optionsDrawer => {
          this._optionsDrawer = optionsDrawer;
        }}
        drawerPosition={'left'}
        feedItems={this.state.feedItems}
        groupCountTitle={this.state.groupCountTitle}
        groupCountItems={this.state.groupCountItems}
        updateFeedItems={this._updateFeedItems}
        updateGroupCountItems={this._updateGroupCountItems}
        title={this.state.title}
      >
        <View style={styles.container}>
          {this._renderHeader()}
          {this.state.inSearch && this._renderSearchOpen()}
          <SwipeListView
            recalculateHiddenLayout
            style={styles.container}
            contentContainerStyle={this.props.route.getContentContainerStyle()}
            dataSource={dataSource}
            renderRow={this._renderRow}
            renderSectionHeader={this._renderSection}
            renderSeparator={this._renderSeparator}
            refreshControl={
              <RefreshControl
                refreshing={this.state.isRefreshing}
                onRefresh={this.onRefresh}
              />
            }
            renderHiddenRow={(data, secId, rowId, rowMap) => (
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
        </View>
      </ArticleListOptionsDrawer>
    );
  }

  _renderHeader() {
    const { title } = this.state;
    return (
      <View style={styles.header}>
        <View style={styles.optionsButtonContainer}>
          {this._renderOptionsMenuButton()}
        </View>
        <Text style={styles.screenTitle}>
          {title}
        </Text>
        <View style={styles.filterSwitchContainer}>
          {this._renderFilterSwitch()}
          {this._renderSearchIcon()}
        </View>
      </View>
    );
  }

  _renderSearchOpen = () => {
    return (
      <View>
        <View style={styles.searchRow}>
          <SearchBar
            textInputRef={this.searchBarRef}
            onChangeText={this._searchChanged}
            placeholder="Search Articles..."
          />
          <TouchableOpacity onPress={this._toggleSearch} width={24}>
            <Text style={styles.cancelButton}>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  _toggleSearch = () => {
    const inSearch = !this.state.inSearch;
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
    this.setState({
      inSearch,
      searchText: ''
    });
  };

  _searchChanged = text => {
    // Debounce the text input by 500ms
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    if (text === '') {
      this.setState({ searchText: text });
    } else {
      this.timeout = setTimeout(
        () => this.setState({ searchText: text }),
        1000
      );
    }
  };

  _renderOptionsMenuButton() {
    return (
      <TouchableOpacity
        onPress={this._toggleOptions}
        hitSlop={LEFT_BUTTON_HIT_SLOP}
      >
        <Ionicons name="md-menu" size={24} color="white" />
      </TouchableOpacity>
    );
  }

  _renderFilterSwitch() {
    const filtered = !this.state.showDone;
    const checkedColor = filtered ? Colors.hcrButtonBackground : 'white';

    const SwitchButton = (
      <Ionicons
        name="md-checkmark"
        size={14}
        color={checkedColor}
        style={{ backgroundColor: 'transparent' }}
      />
    );

    return (
      <MaterialSwitch
        value={filtered}
        onValueChange={() => {
          InteractionManager.runAfterInteractions(() => {
            this._setFiltered(!filtered);
          });
        }}
        inactiveButtonColor={Colors.hcrButtonBackground}
        activeButtonColor={Colors.mostlyWhite}
        buttonRadius={10}
        switchWidth={30}
        switchHeight={14}
        width={35}
        buttonContent={SwitchButton}
      />
    );
  }

  _renderSearchIcon() {
    return (
      <TouchableOpacity onPress={this._toggleSearch}>
        <Ionicons
          name="ios-search"
          size={24}
          color="white"
          style={{ paddingRight: 7, paddingLeft: 10 }}
        />
      </TouchableOpacity>
    );
  }

  _renderRow = data => {
    if (data.type === 'message') {
      return this._renderMessage(data);
    }
    return (
      <ArticleRow
        article={data}
        upvote={this._upvoteArticle}
        openArticle={this._openArticle}
        openComments={this._openComments}
      />
    );
  };

  _renderSection = (sectionData, sectionId) => {
    if (sectionId === 'message') {
      return <View key={sectionId} />;
    }
    const headerData = this.sectionHeaderData[sectionId];
    return <ArticleSection section={headerData} checkAll={this._checkAll} />;
  };

  _renderSeparator = (sectionId, rowId) => {
    if (sectionId === 'message') {
      return <View key={sectionId} />;
    }
    const nextRowData = this.lastGroupedArticles[sectionId][Number(rowId) + 1];
    const fullSeparator = !nextRowData;
    const indented = {
      backgroundColor: 'white',
      height: 0.5,
      flexDirection: 'row',
      flex: 1
    };
    return (
      <View key={sectionId + rowId} style={indented}>
        {!fullSeparator && <View style={{ width: 15 }} />}
        <View style={styles.bottomBorder} />
      </View>
    );
  };

  _renderMessage = ({ message, iconName }) => {
    return (
      <View style={styles.messageRow}>
        {iconName &&
          <Entypo name={iconName} style={styles.messageIcon} size={34} />}
        <Text style={styles.messageSubheader}>
          {message}
        </Text>
      </View>
    );
  };

  _toggleOptions = () => {
    this._optionsDrawer.toggle();
  };

  _setFiltered = filtered => {
    const showDone = !filtered;
    this.setState({ showDone });
  };

  _updateFeedItems = newItems => {
    this.setState({ feedItems: newItems });
  };

  _updateGroupCountItems = groupCountItems => {
    this.setState({ groupCountItems });
  };

  _checkAll = ({ itemIds }) => {
    itemIds.forEach(itemId => {
      const item = ItemStore.lookupItem(itemId);
      if (!item.done) {
        item.doneSet();
      }
    });
    this.setState({});
  };

  _upvoteArticle = articleId => {
    ItemStore.lookupItem(articleId).upvote();
    this.setState({});
  };

  _checkArticle = article => {
    article.doneToggle();
    this.setState({});
  };

  _craftArticle = article => {
    const commentNav = this.props.navigation.getNavigator('root');
    // We use comments context from article list, meaning in Log,
    // this event takes you to the comments screen first.
    const context = { on: 'article' };
    const actionParams = {
      type: 'article',
      itemId: article.itemId,
      updateCallback: this._updateArticleList,
      context
    };
    commentNav.push(Router.getRoute('action', actionParams));
  };

  _updateArticleList = () => {
    this.setState({});
  };

  _openArticle = article => {
    if (!article.url) {
      this._openComments(article);
    }
    const rootNav = this.props.navigation.getNavigator('root');
    const routeParams = {
      screen: 'article',
      itemId: article.itemId,
      url: article.url,
      updateCallback: this._updateArticleList
    };
    rootNav.push(Router.getRoute('articleNavigation', routeParams));
  };

  _openComments = article => {
    const rootNav = this.props.navigation.getNavigator('root');
    const routeParams = {
      screen: 'comments',
      itemId: article.itemId,
      url: article.url,
      updateCallback: this._updateArticleList
    };
    rootNav.push(Router.getRoute('articleNavigation', routeParams));
  };

  _messageForEmptyList(groupedArticles, sectionHeaderData) {
    if (this.state.inSearch && Object.keys(groupedArticles).length === 0) {
      groupedArticles['message'] = [
        {
          type: 'message',
          message: 'NO ARTICLES MATCHED YOUR QUERY'
        }
      ];
    } else if (Object.keys(groupedArticles).length === 0) {
      groupedArticles['message'] = [
        {
          type: 'message',
          message: 'NEWSFEED ZERO',
          iconName: 'rainbow'
        }
      ];
    }
  }

  _groupArticles(articles, showDone, groupSize) {
    let title = 'TOP';
    let curGroup = null;
    let groupedArticles = {};
    let sectionHeaderData = {};
    if (PinnedStore.count > 0) {
      curGroup = {
        title: `PINNED`,
        iconName: 'hcr-pin',
        itemIds: []
      };
      let items = [];
      PinnedStore.pinnedItems.reverse().forEach(item => {
        items.push(item);
        curGroup.itemIds.push(item.itemId);
      });
      groupedArticles[curGroup.title] = items;
      sectionHeaderData[curGroup.title] = curGroup;
    }

    curGroup = null;
    let items = [];
    articles.forEach((article, idx) => {
      if (idx % groupSize === 0) {
        if (items.length > 0) {
          groupedArticles[curGroup.title] = items;
          sectionHeaderData[curGroup.title] = curGroup;
          items = [];
        }
        curGroup = {
          title: `${title} ${idx + 1}-${idx + groupSize}`,
          iconName: 'y-combinator-square',
          itemIds: []
        };
      }
      if ((!showDone || !article.done) && !article.pinned) {
        items.push(article);
        curGroup.itemIds.push(article.itemId);
      }
    });
    if (items.length > 0) {
      groupedArticles[curGroup.title] = items;
      sectionHeaderData[curGroup.title] = curGroup;
    }
    this._messageForEmptyList(groupedArticles, sectionHeaderData);
    return { groupedArticles, sectionHeaderData };
  }

  _byDayArticles(byday, showDone, groupSize) {
    let groupedArticles = {};
    let sectionHeaderData = {};
    for (const key in byday) {
      const articles = byday[key].slice(0, groupSize);
      const curGroup = {
        title: `${key} ${1}-${articles.length}`,
        iconName: 'y-combinator-square',
        itemIds: []
      };

      let items = [];
      articles.forEach(article => {
        if (!showDone || !article.done) {
          items.push(article);
          curGroup.itemIds.push(article.itemId);
        }
      });
      if (items.length > 0) {
        groupedArticles[curGroup.title] = items;
        sectionHeaderData[curGroup.title] = curGroup;
      }
    }
    this._messageForEmptyList(groupedArticles, sectionHeaderData);
    return { groupedArticles, sectionHeaderData };
  }

  _searchedArticles(articles) {
    if (!this.state.inSearch || !this.state.searchText) {
      return articles;
    }

    const words = this.state.searchText.match(/\S+/g) || [];
    if (words.length === 0) {
      return articles;
    }
    const hasEveryWord = article => {
      return words.every(word => {
        word = word.toLowerCase();
        if (article.text.toLowerCase().includes(word)) {
          return true;
        }
        if (article.title.toLowerCase().includes(word)) {
          return true;
        }
        if (article.note.toLowerCase().includes(word)) {
          return true;
        }
        return false;
      });
    };

    if (Array.isArray(articles)) {
      return articles.filter(hasEveryWord);
    } else {
      const byday = articles;
      const filterByDay = {};
      for (const key in byday) {
        const filtered = byday[key].filter(hasEveryWord);
        filterByDay[key] = filtered;
      }
      return filterByDay;
    }
  }

  _articleList() {
    const { articles, showDone, groupCountItems } = this.state;
    const filtered = this._searchedArticles(articles);
    const groupSize = groupCountItems.filter(item => item.selected)[0].value;
    if (Array.isArray(filtered)) {
      // TOP page, do grouping of articles by groupSize
      const { groupedArticles, sectionHeaderData } = this._groupArticles(
        filtered,
        showDone,
        groupSize
      );
      this.lastGroupedArticles = groupedArticles;
      this.sectionHeaderData = sectionHeaderData;
      return this.ds.cloneWithRowsAndSections(groupedArticles);
    } else {
      // By day, limit length of each section by groupSize
      const { groupedArticles, sectionHeaderData } = this._byDayArticles(
        filtered,
        showDone,
        groupSize
      );
      this.lastGroupedArticles = groupedArticles;
      this.sectionHeaderData = sectionHeaderData;
      return this.ds.cloneWithRowsAndSections(groupedArticles);
    }
  }
}

function SwipeActions({ article, check, craft, close }) {
  const slop = { top: 30, bottom: 30, left: 30, right: 30 };

  return (
    <View style={styles.rowBack}>
      <View style={styles.checkContainer}>
        <TouchableOpacity
          onPress={() => {
            close();
            check(article);
          }}
          hitSlop={slop}
        >
          <CraftIcon
            name="hcr-check"
            size={37}
            color="white"
            style={styles.actionIcon}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.craftContainer}>
        <TouchableOpacity
          onPress={() => {
            close();
            craft(article);
          }}
          hitSlop={slop}
        >
          <CraftIcon
            name="hcr-action"
            size={37}
            color="white"
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
    backgroundColor: Colors.screenBase
  },

  // ---
  // Header
  // ---
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    padding: 9,
    height: 64,
    backgroundColor: Colors.hcrBackground
  },
  screenTitle: {
    color: '#FFFFFF',
    fontSize: 20
  },
  optionsButtonContainer: {
    width: 100,
    paddingLeft: 2,
    height: 45,
    alignItems: 'flex-end',
    flexDirection: 'row'
  },
  filterSwitchContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: 100,
    height: 45,
    alignItems: 'flex-end'
  },

  // ---
  // Search Expanded
  // ---
  searchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 4,
    paddingLeft: 0,
    paddingRight: 6,
    height: 45,
    backgroundColor: Colors.hcrBackground
  },
  cancelButton: {
    fontSize: 20,
    color: 'white'
  },

  // ---
  // Row
  // ---
  rowFront: {
    alignItems: 'center',
    backgroundColor: '#CCC',
    borderBottomColor: 'black',
    borderBottomWidth: 1,
    justifyContent: 'center',
    height: 50
  },
  rowBack: {
    flex: 1,
    flexDirection: 'row',
    padding: 0,
    margin: 0
  },
  checkContainer: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    backgroundColor: '#5F99CF',
    flex: 1,
    padding: 10
  },
  craftContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    backgroundColor: Colors.hcrBackground,
    flex: 1,
    padding: 10
  },
  bottomBorder: {
    borderBottomColor: Colors.hairlineBorder,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flex: 1
  },

  // --
  // Messsage
  // --
  messageRow: {
    height: 90,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.screenBase
  },

  messageSubheader: {
    fontSize: 11,
    color: Colors.sectionText,
    letterSpacing: 1
  },

  messageIcon: {
    color: Colors.sectionText
  }
});
