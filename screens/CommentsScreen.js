import React from 'react';
import {
  StyleSheet,
  Text,
  RefreshControl,
  ListView,
  TouchableOpacity,
  View,
} from 'react-native';

import moment from 'moment/src/moment'; // Moment ES6 workaround
import Colors from '../constants/Colors';
import cheerio from 'cheerio-without-node-native';

import {ArticleHeader} from '../components/ArticleComponents';

import {StoriesMeta} from '../assets/Stories';

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

function makeCommentTree(comments, level = 0) {
  var flat = [];
  comments.map(c => {
    if (c.type === 'comment') {
      const {id, created_at_i, author, text, parent_id} = c;
      const when = moment(created_at_i * 1000).from(Number(StoriesMeta.now_i * 1000));
      var $ = cheerio.load(text);
      var comment = [];
      $.root().children().each(function (i, el) {
        comment.push(
          <View key={i} style={{paddingTop: 8}}>
            <Text style={styles.commentParagraph}>{$(el).text()}</Text>
          </View>
        );
      });
      flat.push({id, level, author, when, comment, parent_id});
      flat.push(...makeCommentTree(c.children, level + 1));
    }
  });
  return flat;
}

function Comment(props) {
  const authorStyle = props.author === 'hackcrafter'
                    ? styles.authorMe
                    : styles.author;
  let commentVar = (
    <View
      key={props.id}
      style={[styles.commentContainer,
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
    </View>
  );
  if (props.isLast) {
    return (
      <View>
        {commentVar}
        <View style={{paddingTop: 10, backgroundColor: 'white'}} />
        <View style={{marginTop: 45}} />
      </View>
    );
  } else {
    return commentVar;
  }
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
    this.comments = makeCommentTree(this.article.children);
    this.comments.unshift({article: this.article}); // header
    this.comments[this.comments.length - 1].isLast = true; // footer

    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1.id !== r2.id});
    this.state = {
      isRefreshing: false,
      dataSource: ds.cloneWithRows(this.comments)
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
            onPress={_ => this.share()}
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
          renderRow={(rowData) => rowData.article
                              ? <ArticleHeader {...rowData} />
                              : <Comment {...rowData} />}
          refreshControl={
            <RefreshControl
              refreshing={this.state.isRefreshing}
              onRefresh={this.onRefresh}
            />
          }
        />
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

  _back = () => {
    // TODO: Contextually go back a comment level if drilled down
    // if (this.state.canGoBack){
    //   this.goBack();
    // } else {
      this.popArticleNav();
    // }
  }

  _switchToArticle = () => {
    const nav = this.props.navigation.getNavigator('articleNav');
    nav.jumpToTab('article');
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
    fontSize: 14,
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
});
