Missing small features:
* group pinned to top
* vote turns to unvote
* vote on comments
* inbox zero screen
* events need to capture enough of item do display in notification screen

Missing big features:
* Log screen
* static reddit data
* by day feed
* search in articles screen
* time tracking on screens / try https://github.com/annelorraineuy/ex-navigation#screen-tracking--analytics
* mock up replies / comments
* Notifications screen
* Settings Screen

Upgrades:
* Expo 15
* FlatList instead of ListView for Comments / Articles (speed, scroll
to item support)
 -  - https://github.com/facebook/react-native/blob/0.43-stable/Libraries/CustomComponents/Lists/FlatList.js
 * some solution for 'Done' to close keyboard on notes
 * New react-navigation and react-router for deep-linking (handling
   links from log / notifications screen)

Comments polish:
 * numbers zero, italics not in-line 
 * (in German):\n<a href showing on one line...
 * next comment up level scrolls to current comment in parent tree
 (possibly new new experimental scroll view)


Persistence with Relay is storying activity log as source of truth.

We lazy load for each item bieng read whether it was in the activity
log (by item key) into memory.

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
