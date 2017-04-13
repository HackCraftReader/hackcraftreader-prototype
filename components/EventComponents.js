

function EventItem({event}) => {
  const when = moment(event.time).from(moment());
  if (event.type == Event.NoteAdd || event.type == Event.NoteEdit) {
    let t = event.type === Event.NoteAdd ? 'Added note to ' : 'Edited note on ';
    const wasComment = event.itemId === event.articleId;
    t += wasComment ? 'article' : 'comment by ';

    return (
      <View>
        <Text>
          {t} {wasComment && <Text style={styles.author}>{event.data.author}</Text>}
        </Text>
        <CommentBlock text={event.data.note} />
      <Text>{when} * {ItemStore.getCached(event.itemId) ? ItemStore.getCached(event.itemId).descendantsCount : event.data.descendantsCount</Text>
      
          
  }
}
