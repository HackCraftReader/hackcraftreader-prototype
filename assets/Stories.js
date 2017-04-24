// TODO: Switch to calling this Article in next refactor

import moment from 'moment/src/moment'; // Moment ES6 workaround
import relativeDayName from '../utilities/relativeDayName';

var StoriesMeta = require('./hackernews/meta.json');

import ItemStore from '../store/ItemStore';
import EventStore from '../store/EventStore';

import EventHistoryStatic from './EventHistoryStatic';

function countComments(comments) {
  if (!comments.children) { return 0; }
  comments.descendantsCount = comments.children.length +
                              comments.children
                                      .map(countComments)
                                      .reduce((a, b) => a + b, 0);
  return comments.descendantsCount;
}

function itemForArticle(articleId) {
  const itemId = 'hn_a_' + articleId;
  let $item = ItemStore.article(itemId);
  return $item;
}

let childrenStore = {};

function cleanHNArticles(rawArticles) {
  const delta = moment().unix() - Number(StoriesMeta.now_i);

  const articles = rawArticles.map((article, index) => {
    let item = itemForArticle(article.id);
    item.rank = index + 1;
    item.source = 'HN';
    item.descendantsCount = countComments(article);
    item.when = moment(article.created_at_i * 1000).from(Number(StoriesMeta.now_i * 1000));
    item.created = moment(article.created_at_i + delta, 'X');
    item.url = article.url;
    item.author = article.author;
    item.title = article.title;
    // item.text set for Ask HN type posts
    item.points = article.points;
    item.author = article.author;

    // Lazy load children as we will do over the network
    childrenStore[item.itemId] = article.children;
    return item;
  });

  return articles;
}

function loadHNTopArticles() {
  const top = require('./hackernews/topStories.json');
  const topArticles = cleanHNArticles(top);

  // Now that our ItemStore is loaded up, we can load up
  // our static history of events on these items as well...
  EventHistoryStatic.reverse().map(e => {
    if (e.itemId !== e.articleId) {
      // Load up the comments into the ItemStore cache
      const article = ItemStore.lookupItem(e.articleId);
      loadComments(article);
    }
    EventStore.add(e.itemId, e.articleId, e.type, e.data, e.time);
  });
  return topArticles;
}

function loadHNLastWeekArticles() {
  const day0 = require('./hackernews/day-0.json');
  const day1 = require('./hackernews/day-1.json');
//  const day2 = require('./hackernews/day-2.json');
//  const day3 = require('./hackernews/day-3.json');
//  const day4 = require('./hackernews/day-4.json');
//  const day5 = require('./hackernews/day-5.json');
//  const day6 = require('./hackernews/day-6.json');

  const labels = [
    relativeDayName(moment()).toUpperCase(),
    relativeDayName(moment().subtract(1, 'days')).toUpperCase(),
//    relativeDayName(moment().subtract(2, 'days')).toUpperCase(),
//    relativeDayName(moment().subtract(3, 'days')).toUpperCase(),
//    relativeDayName(moment().subtract(4, 'days')).toUpperCase(),
//    relativeDayName(moment().subtract(5, 'days')).toUpperCase(),
//    relativeDayName(moment().subtract(6, 'days')).toUpperCase(),
  ];
  //  const allDays = [day0, day1, day2, day3, day4, day5, day6].map(
  const allDays = [day0, day1].map(
    day => cleanHNArticles(day)
  );
  const lastWeek = {};
  labels.forEach((label, idx) => {
    const day = allDays[idx];
    lastWeek[label] = day;
  });
  return lastWeek;
}

function convertCommentsToItems(comments) {
  return comments.filter(c => c.type === 'comment').map(comment => {
    const itemId = 'hn_c_' + comment.id;
    const articleId = 'hn_a_' + comment.story_id;
    let parentId = comment.parent_id === comment.story_id
                 ? articleId
                 : 'hn_c_' + comment.parent_id;
    let item = ItemStore.comment(itemId, articleId);
    item.created = new Date(comment.created_at_i * 1000);
    item.parentItemId = parentId;
    item.type = 'comment';
    item.author = comment.author;
    item.text = comment.text;
    item.author = comment.author;
    item.descendantsCount = comment.descendantsCount;
    item.when = moment(comment.created_at_i * 1000).from(Number(StoriesMeta.now_i * 1000));
    item.children = convertCommentsToItems(comment.children);
    return item;
  });
}

function loadComments(article) {
  if (!article.children.length) {
    // Load from network in live version
    article.children = convertCommentsToItems(childrenStore[article.itemId]);
  }
  return article.children;
}

function iconForSource(source) {
  if (source === 'HN') {
    return 'y-combinator-square';
  } else if (source === 'Reddit') {
    return 'reddit-square';
  } else {
    return 'rss-square';
  }
}

export {
  StoriesMeta,
  loadHNTopArticles,
  loadHNLastWeekArticles,
  loadComments,
  itemForArticle,
  iconForSource,
};

