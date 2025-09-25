# Change Log

## 1.2.0 - 2025-29-25

- **Enhanced:** README enhancements - new Kibana, Discord, LOGO!
- **Enhanced:** Watch script to support Symbolic Linking with HRM for local development
- **Fixed:** BorderTabSet 'not all code path returns something' fix.

## 1.1.0 - NPM Publish Error

## 1.0.0 - 2025-09-22

- **Added:** New global boolean variable `tabSetEnableHideWhenEmpty` to control hiding of empty tabsets.
- **Added:** New optional boolean attribute `enableHideWhenEmpty` on `ITabSetAttribute` that inherits from the global `tabSetEnableHideWhenEmpty` setting.
- **Added:** New "ecmind" layout demonstrating row node with three tabsets (left and right empty, middle filled) with `tabSetEnableHideWhenEmpty` enabled.
- **Enhanced:** Row.tsx component now supports hiding empty tabsets when they have no children and `enableHideWhenEmpty` is set to true.
- **Added:** Demo functionality with "Add to left empty Tabset" and "Add to right empty Tabset" buttons to demonstrate dynamic tabset visibility.
- **Feature:** Empty tabsets can now serve as placeholders for future tab insertion, appearing only when populated with content.
- **Use Case:** Enables programmatic opening of tabs in placeholder tabsets for complex layouts like PDF editors with side panels.

## 0.9.0 = 2025-09-22

- **Added:** Pin/unpin feature for side (left/right) and bottom panels. Users can now keep panels permanently visible ("pinned") or allow them to collapse automatically ("unpinned"), similar to behavior in modern IDEs and dashboard layouts.
- **Enhanced:** Improved layout flexibility by allowing users to control panel visibility behavior, helping to streamline workflows and reduce visual clutter in complex layouts.

### For older changes please see [Flexlayout ChangeLog](https://github.com/caplin/FlexLayout/blob/master/CHANGELOG.md)
