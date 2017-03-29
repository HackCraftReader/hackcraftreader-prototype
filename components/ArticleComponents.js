import React from 'react';
import {Text, StyleSheet, TouchableOpacity, TouchableHighlight, View} from 'react-native';
import CraftIcon from '../components/CraftIcon';
import { FontAwesome } from '@exponent/vector-icons';
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

export function ArticleTitleAndDomain({article}) {
  let domain = extractDomain(article.url);
  if (domain) {
    domain = ` (${domain})`;
  }
  let extras = [];
  if (article.pinned) {
    extras.push(
      <View key={'pinned'} style={[styles.tag, {backgroundColor: '#FF5722'}]}>
        <CraftIcon
          name='hcr-pin'
          size={12}
          color={'white'}
          style={{marginTop: 2, marginLeft: -1}}
        />
        <Text style={{fontSize: 12, color: 'white'}}>
          pinned
        </Text>
      </View>
    );
  }
  for (let code in article.tags) {
    const tag = article.tags[code];
    extras.push(
      <View key={code} style={[styles.tag, {backgroundColor: tag.color}]}>
        <Text style={{fontSize: 12, color: 'white'}}>
          {tag.label}
        </Text>
      </View>
    );
  }
  article.activeSnoozed.forEach(snooze => {
    extras.push(
      <View key={snooze.label} style={[styles.tag, {backgroundColor: '#FCAB52'}]}>
        <FontAwesome
          name='clock-o'
          size={12}
          color={'white'}
          style={{marginTop: 1, paddingLeft: 1, paddingRight: 2}}
        />
        <Text style={{fontSize: 12, color: 'white'}}>
          {snooze.label}
        </Text>
      </View>
    );
  });
  
  return (
    <View style={{flexDirection: 'column'}}>
      <Text style={styles.articleTitle}>
        {article.text}
        <Text style={styles.articleDomain}>{domain}</Text>
      </Text>
      <View style={{flexWrap: 'wrap', flexDirection: 'row'}}>
        {extras}
      </View>
    </View>
  );
}

export function ArticleRow(props) {
  const {article, isLast, upvote, openArticle, openComments} = props;
  const slop = {top: 0, bottom: 0, left: 5, right: 0};
  const comment = (
    <TouchableOpacity
      style={styles.commentIconTouch}
      hitSlop={slop}
      onPress={() => openComments(article)}
    >
      <View style={{flex: 1}}>
        <CraftIcon
          name='hcr-comment'
          size={37}
          color={Colors.tabIconSelected}
          style={styles.commentIcon}
        />
        <Text style={styles.commentText}>
          {article.descendantsCount}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const bg = article.done
           ? {backgroundColor: '#F2F2F2'}
           : {backgroundColor: 'white'};

  return (
    <View style={bg}>
    <TouchableHighlight
      onPress={() => openArticle(article)}
      underlayColor='#F2F2F2'
    >
    <View style={styles.rowContainer}>
      <View style={[styles.left, !isLast && styles.bottomBorder]}>
        <Text style={styles.rankText}>{article.rank}</Text>
      </View>
      <View style={[styles.center, !isLast && styles.bottomBorder]}>
        <View style={{flexDirection: 'column'}}>
          <ArticleTitleAndDomain {...props} />
          <View style={{flexDirection: 'row'}}>
            <Text style={styles.attributes}>{article.when} • </Text>
            <Text style={styles.attributesWithWeight}>{article.points}</Text>
            <Text style={styles.attributes}> • </Text>
            <UpVote {...props} />
          </View>
        </View>
      </View>
      <View style={[styles.right, !isLast && styles.bottomBorder]}>
        {comment}
      </View>
    </View>
    </TouchableHighlight>
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
    <View style={{flexDirection: 'column', paddingRight: 15, paddingLeft: 16, paddingTop: 6, paddingBottom: 6}}>
      <TouchableOpacity
        onPress={() => openArticle(article)}
      >
        <ArticleTitleAndDomain {...props} />
      </TouchableOpacity>
      <View style={{flexDirection: 'row'}}>
        <Text style={styles.attributesWithWeight}>{props.article.author} • </Text>
        <Text style={styles.attributes}>{props.article.when} • {props.article.descendantsCount} {commentIcon} • </Text>
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
  tag: {
    borderRadius: 3,
    paddingLeft: 4,
    paddingRight: 4,
    paddingTop: 0,
    paddingBottom: 0,
    margin: 2,
    flex: -1,
    flexDirection: 'row',
    height: 15,
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
