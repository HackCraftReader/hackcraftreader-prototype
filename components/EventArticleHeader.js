import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from 'react-native';

import { FontAwesome } from '@exponent/vector-icons';

import Colors from '../constants/Colors';

import relativeDayName from '../utilities/relativeDayName';

import {ArticleTitleAndDomain, CommentIcon} from '../components/ArticleComponents';

export default function EventArticleHeader({event, article}) {
  const when = relativeDayName(article.created, {includeTime: true});
  return (
    <View style={{backgroundColor: 'white'}}>
      <TouchableHighlight
        onPress={() => this._openRow(event)}
        underlayColor='#E8F0FE'
      >
        <View style={styles.articleRow}>
          <View style={styles.leftTimeCol}>
            <View>
              <Text style={styles.timeMin}>
                {Math.floor(event.timeSpent / 60) + 'm'}
              </Text>
            </View>
            <View>
              <Text style={styles.timeSec}>
                {Math.floor(event.timeSpent % 60) + 's'}
              </Text>
            </View>
          </View>
          <View style={styles.articleCenterCol}>
            <View style={{flexDirection: 'column'}}>
              <ArticleTitleAndDomain
                article={article}
                showState={false}
              />
              <View style={{flexDirection: 'row'}}>
                <Text style={styles.attributes}>
                  <FontAwesome
                    name={'y-combinator-square'}
                    size={16}
                  />
                  {' • '}
                </Text>
                <Text style={styles.attributesWithWeight}>{article.author}</Text>
                <Text style={styles.attributes}> • {when}</Text>
              </View>
            </View>
          </View>
          <View style={styles.rightCommentCol}>
            <CommentIcon
              article={article}
              openComments={this._openComments}
            />
          </View>
        </View>
      </TouchableHighlight>
    </View>
  );
}

const styles = StyleSheet.create({
  articleRow: {
    flex: 1,
    flexDirection: 'row',
  },

  leftTimeCol: {
    width: 40,
    paddingTop: 5,
  },
  articleCenterCol: {
    flexDirection: 'row',
    flex: 1,
    paddingTop: 5,
    paddingBottom: 5,
  },

  rightCommentCol: {
    width: 45,
    padding: 5,
    paddingTop: 8,
  },

  timeMin: {
    fontSize: 17,
    color: Colors.secondaryTitle,
    textAlign: 'center'
  },

  timeSec: {
    fontSize: 10,
    color: Colors.secondaryTitle,
    textAlign: 'center'
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
});
