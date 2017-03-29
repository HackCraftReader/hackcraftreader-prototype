 * (in German):\n<a href showing on one line...
 * numbers zero, italics not in-line
 * next comment up level scrolls to current comment in parent tree
 (possibly new new experimental scroll view)

Action Screen
 * Pass in '$item'  (use '$' to denote observed variables)
 * hook up remaining callbacks
 * hook up EventStore to also update ArticleStore (aggregate values)
 * integrated Done on notes (temporary, until switch to native solution)

Article/Commetns
* Pass in $item everwhere
* render tags, notes and pins on every item
* Ensure snooze and pin have toggled down rendering / underlay color
correct
* hook up actions everwhere
* render left / right swipe
* Set up acticle done actions and state

 * notifications screen


 * hook up fake voting everwhere

 * search in articles screen
 
 * comments / article have some way of indicating a
   snooze/note/pin/tag has been made. For comment screen, maybe place
   a header section with things like:
   - Article Tags: [ Words of Wisdom ]
   - Comment Tags: [ I Could Use This ]
   - Snoozed to Tomorrow Monring (10am)
   - Pinned
   - Previous Posts of This Article:
     - Two days ago on Hacker News: 214 Comments
     - One month ago on /r/programming: 21 Comments
     Or maybe in the header we use some color to indicate this
     Or maybe we color the action icon for the comments/article

 * record the time spent on comments / articles nav. Nav entry/leave?
   component lifestyle hooks? Nees to work even with nav back swipe etc.


data model

history:
- item: article ref (get name, comment, stats, points)
  - item history (event list), event types:
   - reading session on article / comments, aggregate to total time
    - comment written  
    - action made to artcle, comments page or specific comment
      - tag added / removed
      - snooze added
      - pin added  / removed
      - note added/ edited / deleted
      -


Event stream for actions?
 - As long as can also index by item ID
- materialize Log view by querying
- materialize i, filtered down by tagged article?

Event{
- seq_id: int (primary key)
- device_id: string (device derived, could also be browser_ext, hn_web
  etc for events we auto-import externally)
- time: date object (shouldn't need indexed sorted chronologically by seq_id, potentially creat a secondary index)
- item_id: unique item id site_type_id, like hn_a_1234 for a hacker
news article (secondary index)
- article_id: the parent article id, in form hn_a_1234  (secondary index)
- type: toggle_done, read_time, tag_add, tag_remove, note_edit, write_comment,
snooze_set, snooze_clear etc
- data: object. {color: 'r / g / p / o', label: 'Return with Time'},
{'done': true}, {'comment'}
}

Event stream is source of truth, but instead of querying it for a
given item/article, we create a secondary table that is primary keyed
on article_id with very aggregate info necessary for display (this may
be held in memory)

ItemStore (build in mem lazily as articles / items loaded)
- item_id: (hn_c_12345)
- article_id: (hn_a_1234)
- tags: tags on specific item
- snoozed: active snoozes on specific item

ArticleStore (build in mem lazily as articles loaded, aggregate
sub-items tags and snooze)
- article_id: (hn_a_1234)
- done: boolean 
- tags: tags on article, comments any child
- snoozed: active snoozes that have not expired

PinnedStore (Persistent so we don't have to read event log for all time)
- Items that are pinned, not un-pinned

Filter view just read whole event stream and remove down to relevent
of query params, returning items in infinite scroll liset


On startup:
- sync event stream with server
 - could pull in EventStore from other devices
 - Could be notified of comment sections being "watched" that could
   influence notifications. Mostly just articles you posted or ones
   you commented on (load comment thread). HN is nice because only
   articles within last couple weeks can be polled. Even better,we can
   just read our own logged in comments page, and build notifications
   based on that. From general news feed could also build some
   notifications like "23 new replies to article you upvoted" or "12
   new replies to comment you upvoted". Would require tracking last
   saved comment / replies count when upvoting, but we could track
   that in any upvote activity
- load news sources
- build up itemstore for all items by querying persistent EventStore
 - 
