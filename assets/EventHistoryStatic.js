
import moment from 'moment/src/moment'; // Moment ES6 workaround

export default [
  {
    itemId: 'hn_a_13185620',
    articleId: 'hn_a_13185620',
    type: 'time_spent',
    time: moment().subtract(1, 'hours').unix(),
    data: {
      spent: 310,
      on: 'article',
    }
  },
  {
    itemId: 'hn_a_13185620',
    articleId: 'hn_a_13185620',
    type: 'tag_remove',
    time: moment().subtract(1.2, 'hours').unix(),
    data: {
      code: 'p',
      label: 'Wise Words',
    }
  },
  {
    itemId: 'hn_a_13185620',
    articleId: 'hn_a_13185620',
    type: 'tag_add',
    time: moment().subtract(1.1, 'hours').unix(),
    data: {
      code: 'p',
      label: 'Wise Words',
    }
  },
  {
    itemId: 'hn_c_13186579',
    articleId: 'hn_a_13185620',
    type: 'note_add',
    time: moment().subtract(9, 'hours').unix(),
    data: {
      author: 'CodeSheikh',
      note: 'Great reference on how to think about the Verizon brand, or really any brand that is being sold for more than the worth of the potential hard assests a company is worth.',
      descendantsCount: 6
    },
  },
  {
    itemId: 'hn_a_13185620',
    articleId: 'hn_a_13185620',
    type: 'time_spent',
    time: moment().subtract(9.5, 'hours').unix(),
    data: {
      spent: 85,
      on: 'comments',
    }
  },
  {
    itemId: 'hn_a_13185620',
    articleId: 'hn_a_13185620',
    type: 'time_spent',
    time: moment().subtract(10, 'hours').unix(),
    data: {
      spent: 55,
      on: 'article',
    }
  },
  {
    itemId: 'hn_a_13185759',
    articleId: 'hn_a_13185759',
    type: 'time_spent',
    time: moment().subtract(1.4, 'days').unix(),
    data: {
      spent: 210,
      on: 'comments',
    }
  },
  {
    itemId: 'hn_c_13191682',
    articleId: 'hn_a_13185759',
    type: 'pinned_clear',
    time: moment().subtract(1.45, 'days').unix(),
    data: {
      author: 'PudgePacket',
      descendantsCount: 0,
    }
  },
  {
    itemId: 'hn_c_13191682',
    articleId: 'hn_a_13185759',
    type: 'pinned_set',
    time: moment().subtract(1.5, 'days').unix(),
    data: {
      author: 'PudgePacket',
      descendantsCount: 0,
    }
  },
  {
    itemId: 'hn_c_13189654',
    articleId: 'hn_a_13185759',
    type: 'snooze_set',
    time: moment().subtract(1.5, 'days').unix(),
    data: {
      date: "2017-04-22T13:30:00.000Z",
      label: 'Weekend',
      author: 'swat17',
      descendantsCount: 1,
    }
  },
];
