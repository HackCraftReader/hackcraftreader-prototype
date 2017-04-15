import React from 'react';
import {Text, StyleSheet, TouchableOpacity, TouchableHighlight, View} from 'react-native';
import CraftIcon from '../components/CraftIcon';
import { FontAwesome } from '@exponent/vector-icons';
import { PinnedTag, SnoozedTag, NoteTag, ItemTag, tagByCode } from './Tags';
import Colors from '../constants/Colors';
import extractDomain from '../utilities/extractDomain';

export function UpVote({articleId, upvote}) {
  return (
    <TouchableOpacity
      style={{flexDirection: 'row'}}
      onPress={() => upvote(articleId)}
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

function firstCoupleWords(text) {
  const words = text.match(/\S+/g) || [];
  const phrase = words.slice(0,3).join(' ').substring(0,25);
  if (phrase === words.join(' ')) {
    return phrase; // We didn't truncate
  } else {
    return phrase + '...';
  }
}

export function ItemStateRow({item, showPinned = false}) {
  let extras = [];
  if (item.pinned && showPinned) {
    extras.push(
      <PinnedTag key={'pinned'} />
    );
  }
  for (let code in item.tags) {
    const tag = item.tags[code];
    extras.push(<ItemTag key={code} label={tag.label} color={tag.color} />);
  }

  if (item.note) {
    const noteText = firstCoupleWords(item.note);
    extras.push(<NoteTag key={'note'} label={noteText} />);
  }
  item.activeSnoozed.forEach(snooze => {
    extras.push(<SnoozedTag key={snooze.label} label={snooze.label} />);
  });

  return (
    <View style={{flexWrap: 'wrap', flexDirection: 'row'}}>
      {extras}
    </View>
  );
}

export function AggStateRow({tags}) {
  let extras = [];
  tags.forEach(tag => {
    if (tag.type === 'pin') {
      extras.push(<PinnedTag key={'pinned'} />);
    } else if (tag.type === 'item') {
      const color = tagByCode(tag.code).color;
      extras.push(<ItemTag key={tag.code} label={tag.label} color={color} />);
    } else if (tag.type === 'note') {
      const noteText = firstCoupleWords(tag.note);
      extras.push(<NoteTag key={'note'} label={noteText} />);
    } else if (tag.type === 'snooze') {
      extras.push(<SnoozedTag key={tag.label} label={tag.label} />);
    }
  });
  return (
    <View style={{flexWrap: 'wrap', flexDirection: 'row', paddingTop: 3}}>
      {extras}
    </View>
  );
}

export function ArticleTitleAndDomain({article, showState = true, showPinned = false}) {
  let domain = extractDomain(article.url);
  if (domain) {
    domain = ` (${domain})`;
  }
  const bg = article.done
           ? {color: '#CAC4C9'}
           : {};

  return (
    <View style={{flexDirection: 'column'}}>
      <Text style={[styles.articleTitle, bg]}>
        {article.title}
        <Text style={[styles.articleDomain, bg]}>{domain}</Text>
      </Text>
      {showState && <ItemStateRow item={article} showPinned={showPinned} />}
    </View>
  );
}

export function CommentIcon(props) {
  const {article, openComments} = props;
  const slop = {top: 0, bottom: 0, left: 5, right: 0};
  return (
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
}

export function ArticleRow(props) {
  const {article, isLast, upvote, openArticle, openComments} = props;

  // I used to color background based on article.done, but not a fan of that currently.
  const bg = {backgroundColor: 'white'};

  return (
    <View style={bg}>
    <TouchableHighlight
      onPress={() => openArticle(article)}
      underlayColor='#E8F0FE'
    >
    <View style={styles.rowContainer}>
      <View style={[styles.left, !isLast && styles.bottomBorder]}>
        {article.pinned
         ? <CraftIcon name='hcr-pin' size={32} color={'#FF5722'} style={{marginLeft: -4}} />
         : <Text style={styles.rankText}>{article.rank}</Text>
        }
      </View>
      <View style={[styles.center, !isLast && styles.bottomBorder]}>
        <View style={{flexDirection: 'column'}}>
          <ArticleTitleAndDomain article={article} />
          <View style={{flexDirection: 'row'}}>
            <Text style={styles.attributes}>{article.when} • </Text>
            <Text style={styles.attributesWithWeight}>{article.points}</Text>
            <Text style={styles.attributes}> • </Text>
            <UpVote articleId={article.itemId} upvote={upvote} />
          </View>
        </View>
      </View>
      <View style={[styles.right, !isLast && styles.bottomBorder]}>
        <CommentIcon
          article={article}
          openComments={openComments}
        />
      </View>
    </View>
    </TouchableHighlight>
    </View>
  );
}

export function ArticleHeader({article, openArticle, upvote, showPinned}) {
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
        <ArticleTitleAndDomain article={article} showPinned={showPinned} />
      </TouchableOpacity>
      <View style={{flexDirection: 'row'}}>
        <Text style={styles.attributesWithWeight}>{article.author} • </Text>
        <Text style={styles.attributes}>{article.when} • {article.descendantsCount} {commentIcon} • </Text>
        <Text style={styles.attributesWithWeight}>{article.points}</Text>
        <Text style={styles.attributes}> • </Text>
        <UpVote articleId={article.itemId} upvote={upvote} />
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
