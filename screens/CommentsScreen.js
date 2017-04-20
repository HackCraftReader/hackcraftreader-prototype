import React from 'react';
import {
  StyleSheet,
  Text,
  ScrollView,
  RefreshControl,
  ListView,
  Share,
  TouchableOpacity,
  View,
} from 'react-native';

import Colors from '../constants/Colors';
import cheerio from 'cheerio-without-node-native';

import {ArticleHeader, ItemStateRow} from '../components/ArticleComponents';

import {observer, inject} from 'mobx-react/native';

import {loadComments, iconForSource} from '../assets/Stories';

import ItemStore from '../store/ItemStore';

import Router from '../navigation/Router';

import { FontAwesome } from '@exponent/vector-icons';
import MiscIcon from '../components/MiscIcon';
import CraftIcon from '../components/CraftIcon';

import NavTabBar, {
  NavBackButton,
  NavArticleButton,
  NavActionButton,
  NavCreateButton,
  NavCheckButton,
} from '../components/NavTabBar';

function domToComponents(el, key, openUrl, style = null) {
  if (el.type === 'text') {
    let t = el.data;
    const lines = t.split('\n');
    // Strip empty lines at end
    const re = /^[ \n\t]*$/;
    while (lines.length && re.test(lines[lines.length - 1])) {
      lines.pop();
    }
    while (lines.length && re.test(lines[0])) {
      lines.shift();
    }
    let minIndent = 10;
    lines.forEach(line => {
      if (re.test(line)) return;
      let numSpaces = 0;
      while (line.length > numSpaces && line[numSpaces] === ' ') {
        numSpaces++;
      }
      minIndent = minIndent < numSpaces ? minIndent : numSpaces;
    });
    // Don't strip off a single space, that may be used as a separator
    minIndent = (minIndent === 1 ? 0 : minIndent);
    // Strip minIndent
    t = lines.map(line => line.slice(minIndent)).join('\n');
    return <Text style={style} key={key}>{t}</Text>;
  }
  if (el.type !== 'tag') {
    console.log('Expected tag type: ', el);
  }
  if (el.name === 'p') {
    let children = el.children.map(
      (child, key) => domToComponents(child, key, openUrl, styles.commentParagraphNormal)
    );
    // Group our non-view children into Text groups
    let grouped = [];
    let current = [];
    let groupCurrent = () => {
      if (current.length > 1) {
        grouped.push(<Text key={current[0].key}>{current}</Text>);
      } else if (current.length === 1) {
        grouped.push(current[0]);
      }
    };
    children.forEach((child) => {
      if (child.type === Text) {
        current.push(child);
      } else {
        groupCurrent();
        grouped.push(child);
        current = [];
      }
    });
    groupCurrent();
    var wrapped = grouped.map(child => {
      if (child.type === Text) {
        // Wrap in view
        if (typeof child.props.children === 'string') {
          if (child.props.children.startsWith('> ') || child.props.children.startsWith(' >')) {
            let t = child.props.children.slice(2);
            if (t.startsWith(' ')) t = t.slice(1);
            let newChild = React.cloneElement(child, {style: [child.style, {color: '#777777'}], children: t});
            return (
              <View key={child.key} style={styles.commentQuotedParagraph}>
                <View style={{flexDirection: 'row'}}>
                  <View style={{width: 4, backgroundColor: '#DDDDDD', marginRight: 6}} />
                  <View style={{paddingRight: 6}}>
                    {newChild}
                  </View>
                  <View style={{width: 12}} />
                </View>
              </View>
            );
          }
        }
        return <View key={child.key} style={styles.commentParagraph}>{child}</View>;
      } else {
        return child;
      }
    });
    return (
      <View key={key}>
        {wrapped}
      </View>
    );
  } else if (el.name === 'i') {
    if (!el.children.length) {
      return <Text style={style} key={key} />;
    }
    return (
      <View key={key}>
        {
          el.children.map(
            (child, key) => domToComponents(child, key, openUrl, styles.commentParagraphItalic)
          )
        }
      </View>
    );
  } else if (el.name === 'pre') {
    if (el.children.length !== 1) {
      console.log('Expected pre to have a single child: ', el);
    }
    if (el.children[0].name !== 'code') {
      console.log('Expected pre to code child element: ', el);
    }
    let children = el.children[0].children.map(
      (child, key) => domToComponents(child, key, openUrl, styles.commentParagraphMono)
    );
    return (
      <ScrollView horizontal style={styles.commentPreScroll} key={key}>
        <View style={styles.commentPreParagraph}>
          {children}
        </View>
      </ScrollView>
    );
  } else if (el.name === 'a') {
    if (el.children.length !== 1) {
      console.log('Expected a to have a single child: ', el);
    }
    var baseStyle = style || styles.commentParagraphNormal;
    var element = domToComponents(el.children[0], key, openUrl, [baseStyle, {color: Colors.tintColor}]);
    return React.cloneElement(element, {onPress: () => openUrl(el.attribs.href)});
  } else {
    console.log('Unknown tag name: ', el);
  }
}

function CommentActions(props) {
  return (
    <View style={[styles.commentActionContainer,
                  {paddingLeft: 15, paddingRight: 15},
                  props.extraStyle]}>
      {props.actions.map((action, idx) =>
        <TouchableOpacity onPress={() => action.callback()} key={idx}>
          <View style={styles.commentActionButton}>
            <Text style={styles.commentActionLabel}>
              {action.label}
            </Text>
          </View>
        </TouchableOpacity>
       )}
    </View>
  );
}

function Comment(props) {
  const {comment, openThread, toggleDescendents, craftComment, upvoteComment, extraStyle, level, collapsable} = props;
  const authorStyle = comment.author === 'hackcrafter'
                    ? styles.authorMe
                    : styles.author;
  let commentVar = (
    <View
      key={comment.itemId}
      style={[styles.commentContainer,
              extraStyle,
              {paddingLeft: (level + 1) * 15}]}
    >
      <View style={styles.top}>
        <Text style={authorStyle}>
          {comment.author}
        </Text>
        <Text style={styles.secondary}>{comment.when}</Text>
      </View>
      <View>
        {comment.comment}
      </View>
      <ItemStateRow item={comment} showPinned />
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={{flexDirection: 'row'}}
          onPress={() => console.log('reply')}
        >
          <FontAwesome
            name='reply'
            size={11}
            color={Colors.secondaryTitle}
            style={{marginTop: 4}}
          />
          <Text style={styles.actions}> reply</Text>
        </TouchableOpacity>
        <Text style={styles.actions}> • </Text>
        <TouchableOpacity
          style={{flexDirection: 'row'}}
          onPress={() => craftComment(comment.itemId)}
        >
          <CraftIcon
            name='hcr-action-filled'
            size={14}
            color={Colors.secondaryTitle}
            style={{marginTop: 2}}
          />
          <Text style={styles.actions}> craft</Text>
        </TouchableOpacity>
        <Text style={styles.actions}> • </Text>
        <TouchableOpacity
          style={{flexDirection: 'row'}}
          onPress={() => upvoteComment(comment.itemId)}
        >
          <CraftIcon
            name='hcr-upvote-filled'
            size={14}
            color={Colors.secondaryTitle}
            style={{marginTop: 2}}
          />
          <Text style={styles.actions}> upvote</Text>
        </TouchableOpacity>
      </View>
      {collapsable &&
       (
         <View style={styles.commentActionContainer}>
           <TouchableOpacity onPress={() => openThread(comment.itemId)}>
             <View style={styles.commentActionButton}>
               <Text style={styles.commentActionLabel}>
                 Open Thread
               </Text>
             </View>
           </TouchableOpacity>
           <TouchableOpacity onPress={() => toggleDescendents(comment.itemId)}>
             <View style={styles.commentActionButton}>
               <Text style={styles.commentActionLabel}>
                 {comment.descendantsCount} Replies
               </Text>
             </View>
           </TouchableOpacity>
         </View>)
      }
    </View>
  );
  return commentVar;
}

function filterComments(comments, collapsed) {
  let filterWithParentIds = [];
  return comments.filter(c => {
    if (collapsed[c.itemId]) {
      filterWithParentIds.push(c.itemId);
    }
    if (filterWithParentIds.includes(c.parentItemId)) {
      // Children will be filtered as well
      filterWithParentIds.push(c.itemId);
      return false;
    }
    return true;
  });
}

@inject('ItemStore')
@observer
export default class CommentsScreen extends React.Component {
  static route = {
    navigationBar: {
      visible: false,
    }
  };

  constructor(props) {
    super(props);
    const { itemId } = this.props.route.params;
    this.article = this.props.ItemStore.lookupItem(itemId);
    let state = {
      level: {},
      collapsable: {},
      collapsed: {}
    };
    this.comments = this._makeCommentTree(loadComments(this.article), state);

    this.rootCommentId = this.props.route.params.rootCommentId;

    if (this.rootCommentId) {
      this.allComments = this.comments;
      this.comments = this._commentSubtree(this.allComments, this.rootCommentId, state);
    }
    // Header
    this.comments.unshift({article: this.article});

    this.ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    const filtered = filterComments(this.comments, state.collapsed);
    this.state = {
      ...state,
      isRefreshing: false,
      dataSource: this.ds.cloneWithRows(filtered)
    };
  }

  onRefresh = () => {
    this.setState({isRefreshing: true});
    setTimeout(() => {
      this.setState({isRefreshing: false});
    }, 3000);
  }

  popArticleNav() {
    const rootNav = this.props.navigation.getNavigator('root');
    const { updateCallback } = this.props.route.params;
    updateCallback && updateCallback();
    rootNav.pop();
  }

  render() {
    const iconName = iconForSource(this.article.source);
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.articleTitle} numberOfLines={1}>
            <FontAwesome
              name={iconName}
              size={16}
            />
            {' ' + this.article.text}
          </Text>
          <TouchableOpacity
            onPress={_ => this._share()}
            hitSlop={{ top: 5, bottom: 5, left: 15, right: 5 }}
          >
            <MiscIcon
              name={'misc-out'}
              size={17}
              color={'white'}
              style={styles.shareIcon}
            />
          </TouchableOpacity>
        </View>
        <ListView
          dataSource={this.state.dataSource}
          renderRow={this._renderRow}
          refreshControl={
            <RefreshControl
              refreshing={this.state.isRefreshing}
              onRefresh={this.onRefresh}
                        />
                         }
        />
            <View>
              <View style={{marginTop: 44.5}} />
            </View>
            <NavTabBar>
              <NavBackButton onPress={() => this._back()} />
              <NavArticleButton onPress={() => this._switchToArticle()} />
              <NavActionButton onPress={() => this._craftArticle()} />
              <NavCreateButton
                enabled={false}
                onPress={() => this._createComment()}
              />
              <NavCheckButton onPress={() => this._articleDone()} />
            </NavTabBar>
      </View>
    );
  }

  _renderRow = (rowData) => {
    if (rowData.article) {
      return (
        <ArticleHeader
          article={rowData.article}
          openArticle={() => this._switchToArticle()}
          upvote={this._upvoteArticle}
          showPinned
        />
      );
    }
    else if (rowData.actions){
      return <CommentActions {...rowData} />;
    }
    else {
      const comment = rowData;
      let extraStyle = {};
      if (comment.itemId === this.rootCommentId) {
        extraStyle = {
          borderTopColor: Colors.outline,
          borderTopWidth: StyleSheet.hairlineWidth,
          backgroundColor: Colors.screenBase
        };
      };
      const level = this.state.level[comment.itemId];
      const collapsable = this.state.collapsable[comment.itemId];
      return (
        <Comment
          comment={comment}
          extraStyle={extraStyle}
          level={level}
          collapsable={collapsable}
          craftComment={this._craftComment}
          upvoteComment={this._upvoteComment}
          openThread={this._openThread}
          toggleDescendents={this._toggleDescendents}
        />
      );
    }
  }

  _share() {
    // TODO: We actually want to share the original web comments page URL.
    const { title, url } = this.article;
    Share.share({
      message: 'Comments Browsed to in HackCraft Reader',
      url,
      title
    }, {
      dialogTitle: 'Share Current Comments',
    });
    // Maybe a open in Safari button?
    // Linking.openURL(this.state.url);
  }

  _makeCommentTree(comments, state, level = 0) {
    var flat = [];
    comments.map(c => {
      if (c.type === 'comment') {
        state.level[c.itemId] = level;
        state.collapsable[c.itemId] = level < 5 && c.descendantsCount > 5;
        state.collapsed[c.itemId] = state.collapsable[c.itemId];

        // Parse HTML text into JSX here... (eventually delay to display time)
        var $ = cheerio.load(c.text);
        var comment = [];
        $.root().children().each((i, el) => {
          comment.push(domToComponents(el, i, this._openUrl));
        });
        c.comment = comment;

        flat.push(c);
        if (c.children.length > 0) {
          flat.push(...this._makeCommentTree(c.children, state, level + 1));
        }
      }
    });
    return flat;
  }

  _commentSubtree(comments, rootCommentId, state) {
    // Filter on parent_id
    let keepWithParentIds = [rootCommentId];
    let subTree = comments.filter(comment => {
      if (keepWithParentIds.includes(comment.parentItemId)) {
        // Children will be filtered as well
        keepWithParentIds.push(comment.itemId);
        return true;
      }
      return false;
    });

    // Find our root comment
    let rootComment = comments.filter(c => c.itemId === rootCommentId)[0];

    // Drop all their levels so children of rootCommentId are 0
    let levelOffset = state.level[rootCommentId] + 1;
    subTree.forEach(c => state.level[c.itemId] -= levelOffset);

    // Update root
    state.level[rootCommentId] = 0;
    state.collapsed[rootCommentId] = false;
    state.collapsable[rootCommentId] = false;

    const actions = {
      actions: [
        {
          label: 'Up Level',
          callback: this._upLevel
        },
        {
          label: 'Next Comment',
          callback: this._nextComment
        }
      ],
      toJs() { return 'actions'; }
    };

    // Put actions in front and back
    subTree.unshift(actions);
    subTree.push(actions);
    subTree.unshift(rootComment);
    return subTree;
  }

  _openThread = (commentId) => {
    const commentNav = this.props.navigation.getNavigator('commentsNav');
    const commentNavParams = {itemId: this.article.itemId, url: this.article.url, rootCommentId: commentId};
    commentNav.push(Router.getRoute('comments', commentNavParams));
  }

  _openUrl = (url) => {
    const commentNav = this.props.navigation.getNavigator('commentsNav');
    const browserParams = {itemId: this.article.itemId, url: url};
    commentNav.push(Router.getRoute('browser', browserParams));
  }

  _toggleDescendents = (commentId) => {
    this.state.collapsed[commentId] = !this.state.collapsed[commentId];
    const filtered = filterComments(this.comments, this.state.collapsed);
    this.setState({
      collapsed: this.state.collapsed,
      dataSource: this.ds.cloneWithRows(filtered)
    });
  }

  _back = () => {
    const nav = this.props.navigation.getNavigator('commentsNav');
    if (nav.getCurrentIndex() > 0) {
      nav.pop();
      return;
    }
    this.popArticleNav();
  }

  _upLevel = () => {
    this._back();
  }

  _nextComment = () => {
    let nextCommmentId = null;
    let curRootAndChildren = [this.rootCommentId];
    let hasSeenRoot = false;
    for (let comment of this.allComments) {
      if (curRootAndChildren.includes(comment.parentItemId)) {
        // Children will be filtered as well
        curRootAndChildren.push(comment.itemId);
        hasSeenRoot = true;
      } else if (comment.itemId === this.rootCommentId) {
        hasSeenRoot = true;
      } else if (hasSeenRoot) {
        nextCommmentId = comment.itemId;
        break;
      }
    }
    if (!nextCommmentId) {
      return this._upLevel();
    }

    this.rootCommentId = nextCommmentId;
    this.comments = this._commentSubtree(this.allComments, this.rootCommentId, this.state);
    this.comments.unshift({article: this.article});

    const filtered = filterComments(this.comments, this.state.collapsed);
    this.setState({
      ...this.state,
      dataSource: this.ds.cloneWithRows(filtered)
    });
  }

  _switchToArticle = () => {
    const nav = this.props.navigation.getNavigator('articleNav');
    nav.jumpToTab('article');
  }

  _craftComment = (commentId) => {
    const commentNav = this.props.navigation.getNavigator('commentsNav');
    const comment = ItemStore.lookupItem(commentId);
    const context = {author: comment.author, descendantsCount: comment.descendantsCount};
    const actionParams = {
      type: 'comment',
      itemId: commentId,
      context
    };
    commentNav.push(Router.getRoute('action', actionParams));
  }

  _upvoteComment = (commentId) => {
    ItemStore.lookupItem(commentId).upvote();
    this.setState({});
  }

  _upvoteArticle = (articleId) => {
    ItemStore.lookupItem(articleId).upvote();
    this.setState({});
  }

  _craftArticle = () => {
    const commentNav = this.props.navigation.getNavigator('commentsNav');
    const context = {on: 'comments'};
    const actionParams = {
      type: 'article',
      itemId: this.article.itemId,
      updateCallback: () => { this.setState({}); },
      context
    };
    commentNav.push(Router.getRoute('action', actionParams));
  }

  _createComment = () => {
    // TODO: Mock up comment writing...?
  }

  _articleDone = () => {
    this.article.doneSet();
    this.popArticleNav();
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.screenBase,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    padding: 4,
    paddingLeft: 15,
    height: 49,
    backgroundColor: Colors.hcrBackground,
  },
  articleTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '100',
    width: 330,
  },
  shareIcon: {
    marginLeft: 4,
    marginRight: 8,
  },
  commentContainer: {
    backgroundColor: 'white',
    paddingTop: 15,
    paddingRight: 15,
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  author: {
    fontWeight: '600',
    fontSize: 14,
    color: Colors.commentHeader,
  },
  authorMe: {
    fontWeight: '600',
    fontSize: 14,
    color: Colors.commentHeaderOP,
  },
  secondary: {
    fontSize: 14,
    color: Colors.secondaryTitle,
    textAlign: 'right',
  },
  commentParagraph: {
    paddingTop: 8,
  },
  commentQuotedParagraph: {
    paddingTop: 8,
  },
  commentPreScroll: {
    marginTop: 8,
    backgroundColor: Colors.commentPreBackground,
    borderRadius: 3,
  },
  commentPreParagraph: {
    padding: 4,
  },
  commentParagraphNormal: {
    fontSize: 14,
    color: 'black',
  },
  commentParagraphItalic: {
    fontSize: 14,
    color: 'black',
    fontStyle: 'italic'
  },
  commentParagraphMono: {
    fontFamily: 'source-code-pro',
    fontSize: 13,
    color: 'black',
  },
  actionsRow: {
    flexDirection: 'row',
    paddingTop: 4,
  },
  actions: {
    fontSize: 14,
    color: Colors.secondaryTitle,
  },
  commentActionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  commentActionButton: {
    width: 140,
    borderRadius: 3,
    borderColor: Colors.outline,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 5,
    marginTop: 6,
    marginBottom: 6,
  },
  commentActionLabel: {
    fontSize: 14,
    color: Colors.secondaryTitle,
    textAlign: 'center'
  }
});
