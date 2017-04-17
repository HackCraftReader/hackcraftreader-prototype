import React from 'react';
import {
  StyleSheet,
  Text,
  ListView,
  Slider,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
  MenuContext,
} from 'react-native-popup-menu';

import moment from 'moment/src/moment'; // Moment ES6 workaround

import Colors from '../constants/Colors';

import Router from '../navigation/Router';

import relativeDayName from '../utilities/relativeDayName';

import {Tags, FilterTag, FilterNote, TagButton, NoteButton} from '../components/Tags';
import EventItem from '../components/EventItem';
import EventAggItem from '../components/EventAggItem';
import EventArticleHeader from '../components/EventArticleHeader';

import {observer, inject} from 'mobx-react/native';

import {loadHNTopArticles} from '../assets/Stories';

import EventStore, {Event} from '../store/EventStore';
import ArticleStore from '../store/ArticleStore';
import ItemStore from '../store/ItemStore';

import { SearchBar } from 'react-native-elements';

import { Ionicons } from '@exponent/vector-icons';

const TAGS = [Tags.TagPurple, Tags.TagOrange, Tags.TagRed, Tags.TagGreen];

function aggregateEvents(events) {
  let timeSpent = 0;
  let tags = [];
  let haveSeen = {};
  let commentIds = {};
  events.forEach(event => {
    if (event.type === 'time_spent') {
      timeSpent += event.data.spent;
    }
    if (event.type.startsWith('note_') && !haveSeen['note']) {
      haveSeen['note'] = true;
      if (event.type === 'note_add') {
        tags.push({type: 'note', note: event.data.note});
      }
    }
    if (event.type.startsWith('tag_') && !haveSeen['tag']) {
      haveSeen['tag'] = true;
      if (event.type === 'tag_add') {
        tags.push({type: 'item', code: event.data.code, label: event.data.label});
      }
    }
    if (event.type.startsWith('snooze_') && !haveSeen['snooze']) {
      haveSeen['snooze'] = true;
      if (event.type === 'snooze_set') {
        tags.push({type: 'snooze', label: event.data.label});
      }
    }
    if (event.type.startsWith('pinned_') && !haveSeen['pinned']) {
      haveSeen['pinned'] = true;
      if (event.type === 'pinned_set') {
        tags.push({type: 'pin'});
      }
    }
    const wasOnComment = event.itemId !== event.articleId;
    if (wasOnComment) {
      commentIds[event.itemId] = event.itemId;
    }
  });
  const uniqueComments = Object.keys(commentIds).length;
  return {timeSpent, tags, uniqueComments};
}

@inject('ItemStore')
@observer
export default class LogScreen extends React.Component {
  static route = {
    navigationBar: {
      visible: false,
    }
  };

  constructor(props) {
    super(props);
    loadHNTopArticles(); // Make sure in cache (temp)
    this.ds = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 !== r2,
      sectionHeaderHasChanged: (s1, s2) => s1 !== s2
    });
    this.searchBarRef = '';
    this.state = {
      inSearch: false,
      tagFilters: [],
      isExpanded: {},
    };
  }

  render() {
    return (
      <MenuContext>
        <View style={styles.container}>
          {this._renderHeader()}
          {this.state.inSearch && this._renderSearchOpen()}
          <ListView
            dataSource={this._logList()}
            renderRow={this._renderRow}
            renderSectionHeader={this._renderSection}
            renderSeparator={this._renderSeparator}
          />
        </View>
      </MenuContext>
    );
  }

  _toggleSearch = () => {
    const inSearch = !this.state.inSearch;
    if (!inSearch) this._clearTagFilters();
    this.setState({
      inSearch
    });
  }

  _renderHeader = () => {
    return (
      <View style={styles.header}>
        <View style={styles.headerBookends} />
        <Text style={styles.articleTitle}>
          Craft Log
        </Text>
        <View style={styles.headerBookends}>
          <TouchableOpacity
            onPress={this._toggleSearch}
            style={styles.searchContainer}
          >
            <Ionicons
              name='ios-search'
              size={24}
              color='white'
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  _renderSearchOpen = () => {
    const hasFilters = this.state.tagFilters.length > 0;
    return (
      <View>
        <View style={styles.searchRow}>
          <SearchBar
            lightTheme
            clearIcon
            textInputRef={this.searchBarRef}
            containerStyle={styles.searchStyle}
            onChangeText={this._searchLog}
            inputStyle={styles.inputStyle}
            placeholder='Search Log...'
          />
          <TouchableOpacity
            onPress={this._toggleSearch}
            width={24}
          >
            <Text style={styles.cancelButton}>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.searchRow}>
          <Menu>
            <MenuTrigger>
              <View style={styles.filterToggle}>
                {hasFilters ? this._renderFilterTags() : this._filterPlaceHolder()}
              </View>
            </MenuTrigger>
            <MenuOptions customStyles={menuContainerStyles}>
              <MenuOption disabled>
                <Text style={{color: '#212121'}}>
                  Filter with Tags:
                </Text>
              </MenuOption>
              {TAGS.map(tag =>
                <MenuOption key={tag.code} onSelect={() => this._toggleTagFilter(tag.code)} >
                  <View style={styles.centered}>
                    <TagButton
                      color={tag.color}
                      label={tag.label}
                      toggled={this.state.tagFilters.includes(tag.code)}
                    />
                  </View>
                </MenuOption>
               )}
              <MenuOption onSelect={() => this._toggleTagFilter('note')} >
                <View style={styles.centered}>
                  <NoteButton
                    toggled={this.state.tagFilters.includes('note')}
                  />
                </View>
              </MenuOption>
              <MenuOption onSelect={() => this._selectAllFilters()} >
                <View style={styles.centered}>
                  <View style={{padding: 5}}>
                    <Text style={styles.menuActionText}>
                      Select All Filters
                    </Text>
                  </View>
                </View>
              </MenuOption>
              <MenuOption onSelect={() => this._clearTagFilters()} >
                <View style={styles.centered}>
                  <View style={{padding: 5}}>
                    <Text style={styles.menuActionText}>
                      Clear All Filters
                    </Text>
                  </View>
                </View>
              </MenuOption>
            </MenuOptions>
          </Menu>
          <View>
            <View style={[styles.sliderTick, {left: 15, backgroundColor: this.state.filterTime >= 0 ? '#3985B8' : 'white'}]} />
            <View style={[styles.sliderBottom, {left: 8}]}>
              <Text style={styles.sliderLabel}>0 s+</Text>
            </View>
            <View style={[styles.sliderTick, {left: 55, backgroundColor: this.state.filterTime >= 1 ? '#3985B8' : 'white'}]} />
            <View style={[styles.sliderBottom, {left: 47}]}>
              <Text style={styles.sliderLabel}>30 s+</Text>
            </View>
            <View style={[styles.sliderTick, {left: 94, backgroundColor: this.state.filterTime >= 2 ? '#3985B8' : 'white'}]} />
            <View style={[styles.sliderBottom, {left: 88}]}>
              <Text style={styles.sliderLabel}>1 m+</Text>
            </View>
            <View style={[styles.sliderTick, {left: 134, backgroundColor: this.state.filterTime >= 3 ? '#3985B8' : 'white'}]} />
            <View style={[styles.sliderBottom, {left: 127}]}>
              <Text style={styles.sliderLabel}>5 m+</Text>
            </View>
            <Slider
              style={{width: 150}}
              minimumTrackTintColor='#3985B8'
              maximumTrackTintColor='white'
              min
              maximumValue={3}
              step={1}
              onValueChange={(value) => this.setState({filterTime: value})}
            />
          </View>
        </View>
      </View>
    );
  }

  _isInFilterTime = (timeSpent) => {
    if (!this.state.inSearch || !this.state.filterTime) {
      return true;
    }
    if (this.state.filterTime >= 3) {
      return timeSpent >= 300;
    }
    if (this.state.filterTime >= 2) {
      return timeSpent >= 60;
    }
    if (this.state.filterTime >= 1) {
      return timeSpent >= 30;
    }
    return false;
  }

  _isInFilterTags = (tags) => {
    if (!this.state.inSearch || this.state.tagFilters.length === 0) {
      return true;
    }
    let found = false;
    tags.forEach(tag => {
      const code = tag.type === 'note' ? 'note' : tag.code;
      if (this.state.tagFilters.includes(code)) {
        found = true;
      }
    });
    return found;
  }

  _toggleTagFilter = (tag) => {
    if (this.state.tagFilters.includes(tag)) {
      this.setState({
        tagFilters: this.state.tagFilters.filter(t => t !== tag)
      });
    } else {
      this.setState({
        tagFilters: [...this.state.tagFilters, tag]
      });
    }
  }

  _selectAllFilters = () => {
    const tags = TAGS.map(t => t.code);
    this.setState({
      tagFilters: [...tags, 'note']
    });
  }

  _clearTagFilters = () => {
    this.setState({
      tagFilters: []
    });
  }

  _filterPlaceHolder() {
    return (
      <View style={styles.filterPlaceholder}>
        <Text style={styles.filterText}>Fitler with Tags...</Text>
      </View>
    );
  }
  _renderFilterTags() {
    const tags = [Tags.TagPurple, Tags.TagOrange, Tags.TagRed, Tags.TagGreen];
    return (
      <View style={styles.filterList}>
        {tags.map(tag =>
          <FilterTag
            tag={tag}
            toggled={this.state.tagFilters.includes(tag.code)}
            key={tag.code}
          />)}
        <FilterNote
          toggled={this.state.tagFilters.includes('note')}
        />
      </View>
    );
  }

  _logList() {
    const listData = {};

    ArticleStore.sorted.forEach(article => {
      let totalTimeSpent = 0;
      article.events.forEach(([seqId, storeId]) => {
        const event = EventStore.bySeqId(seqId);
        if (event.type === 'time_spent') {
          totalTimeSpent += event.data.spent;
        }
      });
      if (!this._isInFilterTime(totalTimeSpent)) {
        return;
      }

      // Sections are Today, Yesterday and then by date.
      const time = moment(article.lastEventTime, 'X');
      const section = relativeDayName(time).toUpperCase();
      const articleItem = ItemStore.lookupItem(article.articleId);

      let articleEvents = [];
      let commentEvents = [];
      article.events.forEach(([seqId, storeId]) => {
        const event = EventStore.bySeqId(seqId);
        if (event.type !== Event.DoneSet && event.type !== Event.DoneClear) {
          event.articleItem = articleItem;
          const wasOnComment = event.itemId !== event.articleId || event.data.on === 'comments';
          if (wasOnComment) {
            commentEvents.push(event);
          } else {
            articleEvents.push(event);
          }
        }
      });


      const {timeSpent: articleTimeSpent, tags: articleTags} = aggregateEvents(articleEvents);
      const {timeSpent: commentTimeSpent, tags: commentTags, uniqueComments} = aggregateEvents(commentEvents);

      if (!this._isInFilterTags([...articleTags, ...commentTags])) {
        return;
      }

      if (!(section in listData)) {
        listData[section] = [];
      }
      listData[section].push({
        type: 'article_header',
        articleItem: articleItem,
        timeSpent: totalTimeSpent
      });

      // TODO: refactor to function or inline func and do for commentEvents as well
      if (articleEvents.length > 0) {
        // Add aggregate node
        const minTime = articleEvents[0].time;
        const maxTime = articleEvents[articleEvents.length - 1].time;
        const id = 'article_events_' + article.articleId;
        const expanded = !!this.state.isExpanded[id];
        listData[section].push({
          id,
          type: 'agg_article_events',
          articleItem: articleItem,
          timeSpent: articleTimeSpent,
          eventCount: articleEvents.length,
          tags: articleTags,
          minTime,
          maxTime,
          expanded,
        });
        if (expanded) {
          articleEvents.forEach(event => {
            listData[section].push(event);
          });
        }
      }
      if (commentEvents.length > 0) {
        // Add aggregate node
        const minTime = commentEvents[0].time;
        const maxTime = commentEvents[commentEvents.length - 1].time;
        const id = 'comment_events_' + article.articleId;
        const expanded = !!this.state.isExpanded[id];
        listData[section].push({
          id,
          type: 'agg_comment_events',
          articleItem: articleItem,
          timeSpent: commentTimeSpent,
          eventCount: commentEvents.length,
          uniqueComments,
          tags: commentTags,
          minTime,
          maxTime,
          expanded,
        });
        if (expanded) {
          commentEvents.forEach(event => {
            listData[section].push(event);
          });
        }
      }
    });
    this.lastListData = listData;
    return this.ds.cloneWithRowsAndSections(listData);
  }

  _renderRow = (rowData, sectionId, rowId) => {
    if (rowData.type === 'article_header') {
      const article = rowData.articleItem;
      return (
        <EventArticleHeader
          key={sectionId + rowId}
          event={rowData}
          article={article}
          openArticle={() => this._openArticle(article)}
          openComments={() => this._openComments(article)}
        />
      );
    } else if (rowData.type.startsWith('agg_')) {
      return (
        <EventAggItem
          key={sectionId + rowId}
          event={rowData}
          toggleExpand={() => this._toggleExpand(rowData.id)}
        />
      );
    } else {
      const event = rowData;
      const article = event.articleItem;
      return (
        <View key={sectionId + rowId}>
          <EventItem
            event={event}
            openEvent={
              () => {
                const wasComment = event.itemId !== event.articleId || event.data.on === 'comments';
                if (wasComment) {
                  this._openComments(article, event.itemId);
                } else {
                  this._openArticle(article);
                }
              }
            }
          />
        </View>
      );
    }
  }

  _renderSection = (sectionData, sectionId) => {
    const header = sectionId;

    return (
      <View key={sectionId} style={styles.sectionContainer}>
        <Text style={styles.sectionText}>
          {header}
        </Text>
      </View>
    );
  }

  _renderSeparator = (sectionId, rowId) => {
    const nextRowData = this.lastListData[sectionId][Number(rowId) + 1];
    const fullSeparator = !nextRowData || nextRowData.type === 'article_header';
    const indented = {
      backgroundColor: 'white',
      height: 0.5,
      flexDirection: 'row',
      flex: 1,
    };
    return (
      <View key={sectionId + rowId} style={indented}>
        {!fullSeparator && <View style={{width: 30}} />}
        <View style={styles.bottomBorder} />
      </View>
    );
  }

  _toggleExpand = (expandId) => {
    const expanded = !!this.state.isExpanded[expandId];

    this.setState({
      isExpanded: {
        ...this.state.isExpanded,
        [expandId]: !expanded
      }
    });
  }

  _updateLog = () => {
    this.setState({});
  }

  _openArticle = (article) => {
    const rootNav = this.props.navigation.getNavigator('root');
    const routeParams = {
      'screen': 'article',
      itemId: article.articleId,
      url: article.url,
      updateCallback: this._updateLog
    };
    rootNav.push(Router.getRoute('articleNavigation', routeParams));
  }

  _openComments = (article, commentId) => {
    const rootNav = this.props.navigation.getNavigator('root');
    const routeParams = {
      'screen': 'comments',
      itemId: article.articleId,
      url: article.url,
      updateCallback: this._updateLog
    };
    rootNav.push(Router.getRoute('articleNavigation', routeParams));
  }
}

const menuContainerStyles = {
  optionWrapper: {
    marginLeft: 5,
    marginRight: 5
  },
  optionText: {
    color: '#007AFF',
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.screenBase,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    padding: 9,
    paddingRight: 10,
    height: 64,
    backgroundColor: Colors.hcrBackground,
  },
  // ---
  // Expanded Search
  // ---
  searchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 4,
    paddingLeft: 0,
    paddingRight: 6,
    height: 45,
    backgroundColor: Colors.hcrBackground,
  },
  searchStyle: {
    borderTopWidth: 0,
    borderBottomWidth: 0,
    width: 300,
    backgroundColor: 'transparent',
  },
  inputStyle: {
    backgroundColor: 'white',
    color: '#95989A'
  },
  cancelButton: {
    fontSize: 20,
    color: 'white',
  },
  articleTitle: {
    color: '#FFFFFF',
    fontSize: 20,
  },
  headerBookends: {
    width: 30,
    flexDirection: 'row',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterToggle: {
    marginLeft: 8,
    padding: 3,
    borderRadius: 3,
    overflow: 'hidden',
    backgroundColor: 'white',
    width: 191,
    height: 30,
  },
  filterList: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterPlaceholder: {
    flexDirection: 'row',
    paddingLeft: 10,
    paddingTop: 2,
    alignItems: 'center',
  },
  filterText: {
    fontSize: 16,
    color: '#95989A'
  },
  centered: {
    flexDirection: 'row',
    justifyContent: 'center',
    flex: 1,
  },
  menuActionText: {
    flex: 1,
    color: '#007AFF',
    fontSize: 14,
    textAlign: 'center'
  },
  sliderTick: {
    position: 'absolute',
    top: 13,
    width: 1,
    height: 7,
  },
  sliderBottom: {
    position: 'absolute',
    top: 30,
  },
  sliderLabel: {
    fontSize: 8,
    color: 'white'
  },

  // ---
  // Section
  // ---
  sectionContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    backgroundColor: Colors.screenBase,
    height: 33,
    paddingLeft: 11,
    paddingRight: 6,
    paddingBottom: 2,
    borderBottomColor: Colors.sectionBorder,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.sectionBorder,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  sectionText: {
    fontSize: 16,
    color: Colors.sectionText,
    letterSpacing: 2,
  },

  // ---
  // Row
  // ---
  bottomBorder: {
    borderBottomColor: Colors.hairlineBorder,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flex: 1,
  },
});
