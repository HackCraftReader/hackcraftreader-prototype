// TODO: Switch to calling this Article in next refactor

import moment from 'moment/src/moment'; // Moment ES6 workaround

var StoriesMeta = require('./hackernews/meta.json');

import ItemStore from '../store/ItemStore';

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

function loadHNTopArticles() {
  var top = require('./hackernews/topStories.json');
  const delta = moment().unix() - Number(StoriesMeta.now_i);

  const articles = top.map((article, index) => {
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

export {
  StoriesMeta,
  loadHNTopArticles,
  loadComments,
  itemForArticle,
};

