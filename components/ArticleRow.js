import React from 'react';
import {Text, StyleSheet, TouchableOpacity, View} from 'react-native';
import createCraftIcon from '../components/CraftIcon';
import Colors from '../constants/Colors';
import extractDomain from '../utilities/extractDomain';

export default class ArticleRow extends React.Component {
  render() {
    const article = this.props.article;
    const CraftIcon = createCraftIcon();

    const upIcon =
      <TouchableOpacity
        style={styles.upvoteIconTouch}
        onPress={() => this.props.upvote(article)}
      >
        <CraftIcon
          name='hcr-upvote-filled'
          size={13}
          color='#4FD2C2'
          style={styles.upvoteIcon}
        />
      </TouchableOpacity>;

    const upVote =
      <Text
        style={styles.upvoteText}
        onPress={() => this.props.upvote(article)}
      >
        {'upvote'}
      </Text>;

    const domain = extractDomain(article.url);
    const slop = {top: 0, bottom: 0, left: 5, right: 0};
    const comment =
      <TouchableOpacity
        style={styles.commentIconTouch}
        hitSlop={slop}
        onPress={() => this.props.openComments(article)}
      >
        <View style={{flex: 1}}>
          <CraftIcon
            name='hcr-comment'
            size={37}
            color={Colors.tabIconSelected}
            style={styles.commentIcon}
          />
          <Text style={styles.commentText}>
            {article.children.length}
          </Text>
        </View>
      </TouchableOpacity>;

    const last = this.props.isLast;

    return (
      <View style={styles.container}>
        <View style={[styles.left, !last && styles.bottomBorder]}>
          <Text style={styles.rankText}>{article.rank}</Text>
        </View>
        <View style={[styles.center, !last && styles.bottomBorder]}>
          <View style={{flexDirection: 'column'}}>
            <TouchableOpacity
              onPress={() => this.props.openArticle(article)}
            >
              <Text style={styles.articleTitle}>
                {article.title}
                <Text style={styles.articleDomain}>{domain}</Text>
              </Text>
            </TouchableOpacity>
            <Text style={styles.articleAttributes}>
              {article.when} • {upIcon} {article.points}  • {upVote}
            </Text>
          </View>
        </View>
        <View style={[styles.right, !last && styles.bottomBorder]}>
          {comment}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: Colors.scrollBackground,
  },
  bottomBorder: {
    borderBottomColor: Colors.hairlineBorder,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  left: {
    marginLeft: 15,
    width: 30,
    paddingRight: 5,
    paddingTop: 8,
  },
  right: {
    width: 45,
    padding: 5,
    paddingTop: 8,
  },
  center: {
    flex: 1,
    paddingTop: 8,
    paddingBottom: 8,
  },
  rankText: {
    color: Colors.secondaryTitle,
    textAlign: 'center',
    fontSize: 16,
  },
  articleTitle: {
    color: Colors.primaryTitle,
    fontSize: 16,
    paddingBottom: 4,
  },
  articleDomain: {
    color: Colors.secondaryTitle,
    fontSize: 15,
  },
  articleAttributes: {
    color: Colors.secondaryTitle,
    fontSize: 13,
  },
  rowBack: {
    alignItems: 'center',
    backgroundColor: '#DDD',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 15
  },
  upvoteIconTouch: {
    width: 14,
    height: 14,
  },
  upvoteIcon: {
    marginTop: 3,
  },
  upvoteTextTouch: {
    width: 60,
    height: 14,
  },
  upvoteText: {
       // marginTop: 2,
    color: Colors.secondaryTitle,
    fontSize: 13,
  },
  commentIconTouch: {
    flex: 1,
  },
  commentIcon: {
    marginTop: -2,
    zIndex: 0,
  },
  commentText: {
    zIndex: 1,
    position: 'absolute',
    top: 10,
    left: 4,
    width: 28,
    backgroundColor: 'transparent',
    textAlign: 'center',
    color: Colors.tabIconSelected,
    fontSize: 10,
  },
});