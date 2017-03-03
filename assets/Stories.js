
import moment from 'moment/src/moment'; // Moment ES6 workaround

var StoriesMeta = require('../assets/hackernews/meta.json');

var HNTopStories = require('../assets/hackernews/topStories.json');

function countComments(comments) {
  if (!comments.children) { return 0; }
  comments.descendantsCount = comments.children.length +
                              comments.children
                                      .map(countComments)
                                      .reduce((a, b) => a + b, 0);
  return comments.descendantsCount;
}

HNTopStories.forEach((story, index) => {
  story.source = 'HN';
  story.rank = index + 1;
  story.numberOfComments = countComments(story);
  story.when = moment(story.created_at_i * 1000).from(Number(StoriesMeta.now_i * 1000));
});

export {
  StoriesMeta,
  HNTopStories
};

