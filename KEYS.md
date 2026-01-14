Core principle: one focus at a time
Your UI has 3 focus zones:

Folder tree (left)

Thread list (middle)

Thread view (right)

And one transient zone:
4) Compose / modal

Use Tab to move focus between zones
Tab cycles: Folder → Thread List → Thread View → back to Folder
Shift+Tab goes backwards.

When a zone is focused, j/k operates in that zone.

Zone behaviors
Folder tree focused:

j/k: move up/down folders

enter: select folder (updates thread list, keeps focus in thread list optionally)

l or right arrow: expand/collapse folder groups (advanced/system)

a: jump to Archive folder

i: jump to Inbox folder

Thread list focused (your “main loop”):

j/k: next/prev thread

enter: open thread (or just keeps thread view synced if 3-pane)

space: toggle read/unread (fast triage)

e: archive (remove from inbox, move to archive)

d: delete (move to trash) (or pick “d for delete” and “# for trash” if you want Gmail-ish)

m: move (opens a tiny command palette style picker for folders)

/: focus search (filters list)

g then i: go Inbox (optional but nice)

g then a: go Archive (optional)

Thread view focused:

j/k: scroll message list (or next/prev message if you show message cards)

r: reply (maybe later)

y: “copy important bits” (maybe later)
Honestly you can keep thread-view shortcuts minimal. The list is where work happens.

Account switching without pain
You want switching accounts to be fast but also not something you trigger by accident.

Do this:

] and [: cycle account scope (next/previous account)

0 (zero): “All accounts” unified scope

1–9: jump to account by index (optional, but it’s insanely fast)

Why not j/k for accounts too? Because j/k already means “move within a list.” Overloading it for account switching will make your brain sad. Give accounts their own tiny, consistent keys.

Folder switching without pain
Same deal:

ctrl + ] / ctrl + [: cycle folders
or

g then (i/a/p/n): go to common folders (Inbox/Archive/Projects/Newsletters)

Move-to-folder picker (the one thing to overengineer)
Press m and open a mini palette:

type to filter folders

enter to confirm

esc to cancel

shows recent folders at top (because you’ll move lots of stuff into the same few places)

That single picker makes the whole app feel elite.

Suggested minimal cheat sheet
Tab / Shift+Tab: switch focus zone
j/k: up/down in current zone
enter: select/open
e: archive
d: delete to trash
m: move to folder
space: toggle read
/: search
[ / ]: previous/next account scope
0: all accounts

This gives you a complete “inbox zero” loop with like 10 keys.