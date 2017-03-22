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

import moment from 'moment/src/moment'; // Moment ES6 workaround
import Colors from '../constants/Colors';
import cheerio from 'cheerio-without-node-native';

import {ArticleHeader} from '../components/ArticleComponents';

import {StoriesMeta} from '../assets/Stories';

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

function iconForSource(source) {
  if (source === 'HN') {
    return 'y-combinator-square';
  } else if (source === 'Reddit') {
    return 'reddit-square';
  } else {
    return 'rss-square';
  }
}

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
  const authorStyle = props.author === 'hackcrafter'
                    ? styles.authorMe
                    : styles.author;
  const extraStyle = props.extraStyle || {};
  let commentVar = (
    <View
      key={props.id}
      style={[styles.commentContainer,
              extraStyle,
              {paddingLeft: (props.level + 1) * 15}]}
    >
      <View style={styles.top}>
        <Text style={authorStyle}>
          {props.author}
        </Text>
        <Text style={styles.secondary}>{props.when}</Text>
      </View>
      <View>
        {props.comment}
      </View>
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
          onPress={() => console.log('craft')}
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
          onPress={() => console.log('upvote')}
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
      {props.collapsable &&
       (
         <View style={styles.commentActionContainer}>
           <TouchableOpacity onPress={() => props.openThread(props.id)}>
             <View style={styles.commentActionButton}>
               <Text style={styles.commentActionLabel}>
                 Open Thread
               </Text>
             </View>
           </TouchableOpacity>
           <TouchableOpacity onPress={() => props.toggleDescendents(props.id)}>
             <View style={styles.commentActionButton}>
               <Text style={styles.commentActionLabel}>
                 {props.descendantsCount} Replies
               </Text>
             </View>
           </TouchableOpacity>
         </View>)
      }
    </View>
  );
  return commentVar;
}

function filterComments(comments) {
  let filterWithParentIds = [];
  return comments.filter(comment => {
    if (comment.collapsed) {
      filterWithParentIds.push(comment.id);
    }
    if (filterWithParentIds.includes(comment.parent_id)) {
      // Children will be filtered as well
      filterWithParentIds.push(comment.id);
      return false;
    }
    return true;
  });
}

export default class CommentsScreen extends React.Component {
  static route = {
    navigationBar: {
      visible: false,
    }
  };

  constructor(props) {
    super(props);
    this.article = this.props.route.params.article;
    this.comments = this._makeCommentTree(this.article.children);

    // Add callbacks
    this.comments = this.comments.map(comment => {
      return {
        ...comment,
        openThread: this._openThread,
        toggleDescendents: this._toggleDescendents
      };
    });

    this.rootCommentId = this.props.route.params.rootCommentId;

    if (this.rootCommentId) {
      this.allComments = this.comments;
      this.comments = this._commentSubtree(this.allComments, this.rootCommentId);
    }
    // Header
    this.comments.unshift({article: this.article});

    this.ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1.id !== r2.id});
    const filtered = filterComments(this.comments);
    this.state = {
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
            {' ' + this.article.title}
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
          renderRow={
            (rowData) => {
              if (rowData.article) return <ArticleHeader {...rowData} />;
              else if (rowData.actions) return <CommentActions {...rowData} />;
              else return <Comment {...rowData} />;
            }
          }
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
          <NavActionButton onPress={() => this._articleAction()} />
          <NavCreateButton
            enabled={false}
            onPress={() => this._createComment()}
          />
          <NavCheckButton onPress={() => this._articleCheck()} />
        </NavTabBar>
      </View>
    );
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

  _makeCommentTree(comments, level = 0) {
    var flat = [];
    comments.map(c => {
      if (c.type === 'comment') {
        const {id, created_at_i, author, text, parent_id, descendantsCount} = c;
        const when = moment(created_at_i * 1000).from(Number(StoriesMeta.now_i * 1000));
        var $ = cheerio.load(text);
        var comment = [];
        $.root().children().each((i, el) => {
          comment.push(domToComponents(el, i, this._openUrl));
        });
        const collapsable = level < 5 && descendantsCount > 5;
        const collapsed = collapsable; // Start collapsed
        flat.push({id, level, author, when, comment, parent_id, descendantsCount, collapsable, collapsed});
        flat.push(...this._makeCommentTree(c.children, level + 1));
      }
    });
    return flat;
  }

  _commentSubtree(comments, commentId) {
    // Filter on parent_id
    let keepWithParentIds = [commentId];
    let subTree = comments.filter(comment => {
      if (keepWithParentIds.includes(comment.parent_id)) {
        // Children will be filtered as well
        keepWithParentIds.push(comment.id);
        return true;
      }
      return false;
    });

    // Find our root comment
    let rootComment = comments.filter(c => c.id === commentId)[0];

    // Drop all their levels so children of commentId are 0
    let levelOffset = rootComment.level + 1;
    subTree = subTree.map(c => { c.level -= levelOffset; return c; });

    // Update root
    rootComment.level = 0;
    rootComment.collapsed = false;
    rootComment.collapsable = false;
    rootComment.extraStyle = {
      borderTopColor: Colors.outline,
      borderTopWidth: StyleSheet.hairlineWidth,
      backgroundColor: Colors.screenBase
    };

    const actions = { actions: [
      {
        label: 'Up Level',
        callback: this._upLevel
      },
      {
        label: 'Next Comment',
        callback: this._nextComment
      }
    ]};

    // Put actions in front and back
    subTree.unshift(actions);
    subTree.push(actions);
    subTree.unshift(rootComment);
    return subTree;
  }

  _openThread = (commentId) => {
    const commentNav = this.props.navigation.getNavigator('commentsNav');
    const commentNavParams = {article: this.article, rootCommentId: commentId};
    commentNav.push(Router.getRoute('comments', commentNavParams));
  }

  _openUrl = (url) => {
    const commentNav = this.props.navigation.getNavigator('commentsNav');
    const browserParams = {articleId: this.article.id, url: url};
    commentNav.push(Router.getRoute('browser', browserParams));
  }

  _toggleDescendents = (commentId) => {
    this.comments = this.comments.map(comment => {
      if (comment.id === commentId) {
        comment.collapsed = !comment.collapsed;
      }
      return comment;
    });
    const filtered = filterComments(this.comments);
    this.setState({dataSource: this.ds.cloneWithRows(filtered)});
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
      if (curRootAndChildren.includes(comment.parent_id)) {
        // Children will be filtered as well
        curRootAndChildren.push(comment.id);
        hasSeenRoot = true;
      } else if (comment.id === this.rootCommentId) {
        hasSeenRoot = true;
      } else if (hasSeenRoot) {
        nextCommmentId = comment.id;
        break;
      }
    }
    if (!nextCommmentId) {
      return this._upLevel();
    }

    this.rootCommentId = nextCommmentId;
    this.comments = this._commentSubtree(this.allComments, this.rootCommentId);
    this.comments.unshift({article: this.article});

    const filtered = filterComments(this.comments);
    this.setState({
      dataSource: this.ds.cloneWithRows(filtered)
    });
  }

  _switchToArticle = () => {
    const nav = this.props.navigation.getNavigator('articleNav');
    nav.jumpToTab('article');
  }

  _articleAction = () => {
    const commentNav = this.props.navigation.getNavigator('commentsNav');
    const actionParams = {type: 'article', articleId: this.article.id};
    commentNav.push(Router.getRoute('action', actionParams));
  }

  _createComment = () => {
    // TODO: Bring in readability.js
  }

  _articleCheck = () => {
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
