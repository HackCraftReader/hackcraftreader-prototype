Next:
 * Keep Parent Hiearchy in Nested Comments

bugs:
* craft from article opened comments (back button not going back to
  comments as well)
  * yahoo comments / "niftich" formatting of
  
Missing small features:
* handle ask HN (day 7 has one) in comments
* rank should not be state given to item, rather during article listing...
* vote turns to unvote (animated) (component)
* vote on comments

Missing big features:
* mock up replies / comments / highlight text to reply
* maybe double tap a comment to open thread on anything...

Require Native Plugins
* new interactable MS
* rowsne Code Push
* Push notifications from amazon SNS
* google analytics tracking
* some purchasing native library
* reader mode (may need native browser)
* backend store based on RealmDB (interact with redux)

Upgrades:
* Expo 16
* FlatList instead of ListView for Comments / Articles (speed, scroll
to item support)
 -  - https://github.com/facebook/react-native/blob/0.43-stable/Libraries/CustomComponents/Lists/FlatList.js
 * some solution for 'Done' to close keyboard on notes
 * New react-navigation and react-router for deep-linking (handling
 links from log / notifications screen)
 * Comment reply author use slack integrated message to keybaord input
   with auto-preview in position comment will go.

* Use react-native-modal for craft modal. Have top-level component
  with ref passed a prop through component tree or use nav system

Comments polish:
 * numbers zero, italics not in-line 
 * (in German):\n<a href showing on one line...
 * next comment up level scrolls to current comment in parent tree
 (possibly new new experimental scroll view)
 * 1 events on 1 comments => 1 event on 1 comment (make s only for > 1)

Persistence with Relay is storying activity log as source of truth.

Data Storage:
- Event Store, append only write once
  - Shadow event stores for other devices

"cache" persistence
 - ArticleCache: For every activity, we store latest meta-info on a article in a
 ArticleCache persistent layer.
   - We also have a "lastEvent" timestamp that is indexed and updated
   for every new event that references the article (used for sorting)
   - When loading article list, if article not in cache, query log for
     this article id to populate its state
   - Also stores a list of seqIds of EventStore items that ref
   this. Can ref seqIds of shadow event stores from other devices, so
   this integrates our mutli-device event streams into a single Log view
   - Log screen queries this cache by by sorted orfer of "lastEvent",
   looks up EventStore items to construct article groups
   - If we sync across devices, only trick is having having EventStore
     items that are not able to populate ArticleCache. Potentially
     EventStore items actually persist the ArticleCache data, or we
     sync the referenced ArticleCache items when we sync EventStore
     items (i.e. a second table with ref items).

The activity log relies on this to
   display article-level data. Any new activity formed on even older
   articles refreshes by nature of opening a article, and will update
   the cache with its latest activity. Also used by active snooze,
   snooze notiications etc.
 - FeedCache: Top and by Day feeds are stored as fully resolved
   caches. Opening the app displays last cached feed while new one is
   being fetched. This is easy to override as always out of date. This
   may not be necessary...
 - Don't persistent comments / article web data. That is only cached
   in memory, each comment screen load pulls those live (using in-mem
   cache if available)

We lazy load for each item bieng read whether it was in the activity
log (by article key) into memory. But once an item is in mem, the mem
is single source of truth

May need specialized stores for:
- Active Snoozes
- Acitive Pinned
- Settings / Preferences / Configurations / Authentications
- Item done / not done?
   - Since we don't find this useful to put in activity log, it may
     make sense to have a optimized store of all items that have been
     marked "done" to allow quick lookup. Maybe simple key: value of
     item_id: date. We would remove items from store if clearing "done"


Activity log view can be infinite loading, lazy load on query (which
reads over all log entries and filters)

On startup:
- sync event stream (with corresponding article cache entries of
  synced events) with server
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
