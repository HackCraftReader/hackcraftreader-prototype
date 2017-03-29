import moment from 'moment/src/moment'; // Moment ES6 workaround

export const Snooze = {
  snoozeDate(label) {
    var date = moment();
    if (label === 'Tomorrow') {
      date = date.add(1, 'day');
      date = date.hour(7).minute(0).seconds(0).milliseconds(0);
    }

    if (label === 'Evening') {
      if (date.hour() >= 18) {
        date = date.add(1, 'day');
      }
      date = date.hour(18).minute(0).seconds(0).milliseconds(0);
    }

    if (label === 'Weekend') {
      if (date.isoWeekday() >= 6) {
        date = date.add(1, 'weeks');
      }
      date = date.isoWeekday(6).hour(7).minute(30).seconds(0).milliseconds(0);
    }

    return date.toDate();
  },

  snoozeRelativeLabel(label) {
    if (label === 'Tomorrow') {
      return 'Tomorrow';
    }

    if (label === 'Evening') {
      if (moment().hour() >= 18) {
        return 'Tomorrow evening';
      } else {
        return 'Later today';
      }
    }

    if (label === 'Weekend') {
      if (moment().isoWeekday() >= 6) {
        return 'Next Weekdend';
      }
      return 'This Weekend';
    }
  },

  snoozeRelativeTime(label) {
    if (label === 'Tomorrow') {
      const tomorrow = moment().add(1, 'day');
      const shortTomorrow = moment.weekdaysShort(tomorrow.weekday());
      return shortTomorrow + ' 7:00 am';
    }

    if (label === 'Evening') {
      return '6:00 pm';
    }

    if (label === 'Weekend') {
      return 'Sat 7:30 am';
    }
  }
};

