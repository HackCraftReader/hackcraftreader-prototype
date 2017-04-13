import moment from 'moment/src/moment'; // Moment ES6 workaround

export default function relativeDayName(time, {includeTime} = {}) {
  const today = moment().startOf('day'); // Current date
  const yesterday = today.clone().subtract(1, 'days');
  const hourMinutes = includeTime ? ' ' + time.format('h:mm a') : '';
  if (time.isSame(today, 'd')) {
    return 'Today' + hourMinutes;
  } else if (time.isSame(yesterday, 'd')) {
    return 'Yesterday' + hourMinutes;
  } else {
    if (time > today.clone().subtract(1, 'week')) {
      // If not same week (starts on Sunday) use "Last"
      let section = '';
      if (!time.isSame(today, 'w')) {
        section = 'Last ';
      }
      return section + time.format('dddd'); // Sunday, Monday etc...
    } else {
      // N days ago for a while (date in parents) for up to 25 days
      if (time > today.clone().subtract(25, 'days')) {
        return time.from(today) + ' (' + time.format('l') + ')';
      } else {
        return time.format('l');
      }
    }
  }
}

