# FlexLayout

FlexLayout is a React layout manager that arranges panels in multiple tab sets, these can be
resized and moved, much like the windowing system found in many IDE's.

![FlexLayout Demo Screenshot](/../screenshots/github_images/v0.01/tab_overflow_menu.png?raw=true "FlexLayout Demo Screenshot")

![Demo](https://rawgit.com/caplin/FlexLayout/demos/demos/v0.01/index.html)

This project is currently in development, there is still a lot to do:

Features so far:
*	splitters
*	tabs
*	tab dragging and ordering
*	tabset dragging
*	dock to tabset or edge
*	maximize tabset
*	tab overflow
*	submodels
*	tab renaming
*	themeing
*	lifecycle events


todo:
*	convert model to take actions (so can be used in flux), and use the actions in the views
* 	customizable tabs, tabset header, action menu?
*	more lifecycle events... save, beforeclose...
*	mobile - touch events
* esc cancels drag
* undo/redo
*   split tabset into tabsetcontainer and tabset (= container of tabs only) components, then tabset can be docked to top/bottom of tabset...
*	simple panel component (can split but not drag over)
*	fixed sized components
?	minimize to edge (like eclipse/visual studio), popout edge... (could be used for responsive layout?)
?	maybe change model to redux/immutable
?	allow model tree to be built using child react components
*	test in browsers/versions
