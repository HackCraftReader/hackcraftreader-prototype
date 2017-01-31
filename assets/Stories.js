
import moment from 'moment/src/moment'; // Moment ES6 workaround

var StoriesMeta = require('../assets/hackernews/meta.json');

var HNTopStories = require('../assets/hackernews/topStories.json');

function countComments(comments) {
  if (!comments.children) { return 0; }
  return comments.children.length + comments.children.reduce(countComments, 0);
}

HNTopStories.forEach((story, index) => {
  story.source = 'HN';
  story.rank = index + 1;
  story.numberOfComments = countComments(story);
  story.when = moment(story.created_at_i * 1000).from(Number(StoriesMeta.now_i * 1000));
});

console.log("DID IMPORT WORK");
export {
  StoriesMeta,
  HNTopStories
};

