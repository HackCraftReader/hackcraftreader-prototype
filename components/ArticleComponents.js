import React from 'react';
import {Text, StyleSheet, TouchableOpacity, View} from 'react-native';
import CraftIcon from '../components/CraftIcon';
import Colors from '../constants/Colors';
import extractDomain from '../utilities/extractDomain';

export function UpVote({article, upvote}) {
  return (
    <TouchableOpacity
      style={{flexDirection: 'row'}}
      onPress={() => upvote(article)}
    >
      <CraftIcon
        name='hcr-upvote-filled'
        size={14}
        color={Colors.secondaryTitle}
        style={{marginTop: 2}}
      />
      <Text style={styles.attributes}> upvote</Text>
    </TouchableOpacity>
  );
}

export function ArticleTitleAndDomain({article, openArticle}) {
  let domain = extractDomain(article.url);
  if (domain) {
    domain = ` (${domain})`;
  }
  return (
    <TouchableOpacity
      onPress={() => openArticle(article)}
    >
      <Text style={styles.articleTitle}>
        {article.title}
        <Text style={styles.articleDomain}>{domain}</Text>
      </Text>
    </TouchableOpacity>
  );
}

export function ArticleRow(props) {
  const slop = {top: 0, bottom: 0, left: 5, right: 0};
  const comment = (
    <TouchableOpacity
      style={styles.commentIconTouch}
      hitSlop={slop}
      onPress={() => props.openComments(props.article)}
    >
      <View style={{flex: 1}}>
        <CraftIcon
          name='hcr-comment'
          size={37}
          color={Colors.tabIconSelected}
          style={styles.commentIcon}
        />
        <Text style={styles.commentText}>
          {props.article.numberOfComments}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const last = props.isLast;

  return (
    <View style={styles.rowContainer}>
      <View style={[styles.left, !last && styles.bottomBorder]}>
        <Text style={styles.rankText}>{props.article.rank}</Text>
      </View>
      <View style={[styles.center, !last && styles.bottomBorder]}>
        <View style={{flexDirection: 'column'}}>
          <ArticleTitleAndDomain {...props} />
          <View style={{flexDirection: 'row'}}>
            <Text style={styles.attributes}>{props.article.when} • </Text>
            <Text style={styles.attributesWithWeight}>{props.article.points}</Text>
            <Text style={styles.attributes}>• </Text>
            <UpVote {...props} />
          </View>
        </View>
      </View>
      <View style={[styles.right, !last && styles.bottomBorder]}>
        {comment}
      </View>
    </View>
  );
}

export function ArticleHeader(props) {
  let commentIcon = (
    <CraftIcon
      name='hcr-comment'
      size={13}
      color={Colors.secondaryTitle}
    />
  );

  return (
    <View style={{flexDirection: 'column', padding: 6}}>
      <ArticleTitleAndDomain {...props} />
      <View style={{flexDirection: 'row'}}>
        <Text style={styles.attributesWithWeight}>{props.article.author} • </Text>
        <Text style={styles.attributes}>{props.article.when} • {props.article.numberOfComments} {commentIcon} • </Text>
        <Text style={styles.attributesWithWeight}>{props.article.points}</Text>
        <Text style={styles.attributes}> • </Text>
        <UpVote {...props} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  rowContainer: {
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
  attributes: {
    color: Colors.secondaryTitle,
    fontSize: 13,
  },
  attributesWithWeight: {
    color: Colors.secondaryTitle,
    fontSize: 13,
    fontWeight: '500'
  },
  rowBack: {
    alignItems: 'center',
    backgroundColor: '#DDD',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 15
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
    top: 9.5,
    left: 4,
    width: 28,
    backgroundColor: 'transparent',
    textAlign: 'center',
    color: Colors.tabIconSelected,
    fontSize: 10,
  },
});
