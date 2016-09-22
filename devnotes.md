# developing thoughts
- Using the back button means popping off the last navigation in the navigation chain that has "checkpoint" set to true

- I still need to implement something where navigations are checked for equality so that partially equal urls don't cause a 100% renavigation of the chain
    => follow up: it think using the "move(from, to)" of navigators should solve that issue. navigators themselves should
        1) know if the navigation is already navigated to currently
        2) be able to maybe use that extra functionality somehow?

- Undo navigation needs to be able to show a prompt ala "do you really want to exit this unit?" - still need to consider what would happen on pressing back when
the prompt is still open => maybe a "back" during the undoing of a navigation could cause the new incoming navigation to be discarded, effectively staying
on the navigation that was tried to be undone. also, lets say the user enters another new url during the prompt being open. what happens then? the nav that
was tried to be navigated towards first should be discarded, but we're in the middle of "undo old, execute new".

- each router should have an initial navigation, so that it always has a target navigation, a current navigation and a navigation to go to
when the current navigation is popped