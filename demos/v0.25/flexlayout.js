(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("react"), require("react-dom"));
	else if(typeof define === 'function' && define.amd)
		define(["react", "react-dom"], factory);
	else if(typeof exports === 'object')
		exports["FlexLayout"] = factory(require("react"), require("react-dom"));
	else
		root["FlexLayout"] = factory(root["React"], root["ReactDOM"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_11__, __WEBPACK_EXTERNAL_MODULE_12__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.Rect = exports.DragDrop = exports.Orientation = exports.DockLocation = exports.BorderSet = exports.BorderNode = exports.TabSetNode = exports.TabNode = exports.SplitterNode = exports.RowNode = exports.Node = exports.Model = exports.Actions = exports.Layout = undefined;

	var _Layout = __webpack_require__(1);

	var _Layout2 = _interopRequireDefault(_Layout);

	var _Actions = __webpack_require__(27);

	var _Actions2 = _interopRequireDefault(_Actions);

	var _Model = __webpack_require__(34);

	var _Model2 = _interopRequireDefault(_Model);

	var _Node = __webpack_require__(22);

	var _Node2 = _interopRequireDefault(_Node);

	var _RowNode = __webpack_require__(25);

	var _RowNode2 = _interopRequireDefault(_RowNode);

	var _SplitterNode = __webpack_require__(26);

	var _SplitterNode2 = _interopRequireDefault(_SplitterNode);

	var _TabNode = __webpack_require__(23);

	var _TabNode2 = _interopRequireDefault(_TabNode);

	var _TabSetNode = __webpack_require__(24);

	var _TabSetNode2 = _interopRequireDefault(_TabSetNode);

	var _BorderNode = __webpack_require__(17);

	var _BorderNode2 = _interopRequireDefault(_BorderNode);

	var _BorderSet = __webpack_require__(35);

	var _BorderSet2 = _interopRequireDefault(_BorderSet);

	var _DockLocation = __webpack_require__(20);

	var _DockLocation2 = _interopRequireDefault(_DockLocation);

	var _Orientation = __webpack_require__(16);

	var _Orientation2 = _interopRequireDefault(_Orientation);

	var _DragDrop = __webpack_require__(14);

	var _DragDrop2 = _interopRequireDefault(_DragDrop);

	var _Rect = __webpack_require__(15);

	var _Rect2 = _interopRequireDefault(_Rect);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	exports.Layout = _Layout2.default;
	exports.Actions = _Actions2.default;
	exports.Model = _Model2.default;
	exports.Node = _Node2.default;
	exports.RowNode = _RowNode2.default;
	exports.SplitterNode = _SplitterNode2.default;
	exports.TabNode = _TabNode2.default;
	exports.TabSetNode = _TabSetNode2.default;
	exports.BorderNode = _BorderNode2.default;
	exports.BorderSet = _BorderSet2.default;
	exports.DockLocation = _DockLocation2.default;
	exports.Orientation = _Orientation2.default;
	exports.DragDrop = _DragDrop2.default;
	exports.Rect = _Rect2.default;
	exports.default = {
	    Layout: _Layout2.default,
	    Actions: _Actions2.default,
	    Model: _Model2.default,
	    Node: _Node2.default,
	    RowNode: _RowNode2.default,
	    SplitterNode: _SplitterNode2.default,
	    TabNode: _TabNode2.default,
	    TabSetNode: _TabSetNode2.default,
	    BorderNode: _BorderNode2.default,
	    BorderSet: _BorderSet2.default,
	    DockLocation: _DockLocation2.default,
	    Orientation: _Orientation2.default,
	    DragDrop: _DragDrop2.default,
	    Rect: _Rect2.default
	};

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _propTypes = __webpack_require__(2);

	var _propTypes2 = _interopRequireDefault(_propTypes);

	var _react = __webpack_require__(11);

	var _react2 = _interopRequireDefault(_react);

	var _reactDom = __webpack_require__(12);

	var _reactDom2 = _interopRequireDefault(_reactDom);

	var _Splitter = __webpack_require__(13);

	var _Splitter2 = _interopRequireDefault(_Splitter);

	var _Tab = __webpack_require__(28);

	var _Tab2 = _interopRequireDefault(_Tab);

	var _TabSet = __webpack_require__(29);

	var _TabSet2 = _interopRequireDefault(_TabSet);

	var _BorderTabSet = __webpack_require__(32);

	var _BorderTabSet2 = _interopRequireDefault(_BorderTabSet);

	var _DragDrop = __webpack_require__(14);

	var _DragDrop2 = _interopRequireDefault(_DragDrop);

	var _Rect = __webpack_require__(15);

	var _Rect2 = _interopRequireDefault(_Rect);

	var _DockLocation = __webpack_require__(20);

	var _DockLocation2 = _interopRequireDefault(_DockLocation);

	var _TabNode = __webpack_require__(23);

	var _TabNode2 = _interopRequireDefault(_TabNode);

	var _TabSetNode = __webpack_require__(24);

	var _TabSetNode2 = _interopRequireDefault(_TabSetNode);

	var _SplitterNode = __webpack_require__(26);

	var _SplitterNode2 = _interopRequireDefault(_SplitterNode);

	var _Actions = __webpack_require__(27);

	var _Actions2 = _interopRequireDefault(_Actions);

	var _Model = __webpack_require__(34);

	var _Model2 = _interopRequireDefault(_Model);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	/**
	 * A React component that hosts a multi-tabbed layout
	 */
	var Layout = function (_React$Component) {
	    _inherits(Layout, _React$Component);

	    /**
	     * @private
	     */
	    function Layout(props) {
	        _classCallCheck(this, Layout);

	        var _this = _possibleConstructorReturn(this, (Layout.__proto__ || Object.getPrototypeOf(Layout)).call(this, props));

	        _this.model = _this.props.model;
	        _this.rect = new _Rect2.default(0, 0, 0, 0);
	        _this.model.setListener(_this.onModelChange.bind(_this));
	        _this.updateRect = _this.updateRect.bind(_this);
	        _this.tabIds = [];
	        return _this;
	    }

	    _createClass(Layout, [{
	        key: "onModelChange",
	        value: function onModelChange() {
	            this.forceUpdate();
	            if (this.props.onModelChange) {
	                this.props.onModelChange(this.model);
	            }
	        }
	    }, {
	        key: "doAction",
	        value: function doAction(action) {
	            if (this.props.onAction !== undefined) {
	                this.props.onAction(action);
	            } else {
	                this.model.doAction(action);
	            }
	        }
	    }, {
	        key: "componentWillReceiveProps",
	        value: function componentWillReceiveProps(newProps) {
	            if (this.model !== newProps.model) {
	                if (this.model != null) {
	                    this.model.setListener(null); // stop listening to old model
	                }
	                this.model = newProps.model;
	                this.model.setListener(this.onModelChange.bind(this));
	                this.forceUpdate();
	            }
	        }
	    }, {
	        key: "componentDidMount",
	        value: function componentDidMount() {
	            this.updateRect();

	            // need to re-render if size changes
	            window.addEventListener("resize", this.updateRect);
	        }
	    }, {
	        key: "componentDidUpdate",
	        value: function componentDidUpdate() {
	            this.updateRect();
	            //console.log("Layout time: " + this.layoutTime + "ms Render time: " + (Date.now() - this.start) + "ms");
	        }
	    }, {
	        key: "updateRect",
	        value: function updateRect() {
	            var domRect = this.refs.self.getBoundingClientRect();
	            var rect = new _Rect2.default(0, 0, domRect.width, domRect.height);
	            if (!rect.equals(this.rect)) {
	                this.rect = rect;
	                this.forceUpdate();
	            }
	        }
	    }, {
	        key: "componentWillUnmount",
	        value: function componentWillUnmount() {
	            window.removeEventListener("resize", this.updateRect);
	        }
	    }, {
	        key: "render",
	        value: function render() {
	            var _this2 = this;

	            this.start = Date.now();
	            var borderComponents = [];
	            var tabSetComponents = [];
	            var tabComponents = {};
	            var splitterComponents = [];

	            this.centerRect = this.model._layout(this.rect);

	            this.renderBorder(this.model.getBorderSet(), borderComponents, tabComponents, splitterComponents);
	            this.renderChildren(this.model.getRoot(), tabSetComponents, tabComponents, splitterComponents);

	            var nextTopIds = [];
	            var nextTopIdsMap = {};

	            // Keep any previous tabs in the same DOM order as before, removing any that have been deleted
	            this.tabIds.forEach(function (t) {
	                if (tabComponents[t]) {
	                    nextTopIds.push(t);
	                    nextTopIdsMap[t] = t;
	                }
	            });
	            this.tabIds = nextTopIds;

	            // Add tabs that have been added to the DOM
	            Object.keys(tabComponents).forEach(function (t) {
	                if (!nextTopIdsMap[t]) {
	                    _this2.tabIds.push(t);
	                }
	            });

	            this.layoutTime = Date.now() - this.start;

	            return _react2.default.createElement(
	                "div",
	                { ref: "self", className: "flexlayout__layout" },
	                tabSetComponents,
	                this.tabIds.map(function (t) {
	                    return tabComponents[t];
	                }),
	                borderComponents,
	                splitterComponents
	            );
	        }
	    }, {
	        key: "renderBorder",
	        value: function renderBorder(borderSet, borderComponents, tabComponents, splitterComponents) {
	            for (var i = 0; i < borderSet.getBorders().length; i++) {
	                var border = borderSet.getBorders()[i];
	                if (border.isShowing()) {
	                    borderComponents.push(_react2.default.createElement(_BorderTabSet2.default, { key: "border_" + border.getLocation().getName(), border: border,
	                        layout: this }));
	                    var drawChildren = border._getDrawChildren();
	                    for (var _i = 0; _i < drawChildren.length; _i++) {
	                        var child = drawChildren[_i];

	                        if (child.getType() === _SplitterNode2.default.TYPE) {
	                            splitterComponents.push(_react2.default.createElement(_Splitter2.default, { key: child.getId(), layout: this, node: child }));
	                        } else if (child.getType() === _TabNode2.default.TYPE) {
	                            tabComponents[child.getId()] = _react2.default.createElement(_Tab2.default, {
	                                key: child.getId(),
	                                layout: this,
	                                node: child,
	                                selected: _i == border.getSelected(),
	                                factory: this.props.factory });
	                        }
	                    }
	                }
	            }
	        }
	    }, {
	        key: "renderChildren",
	        value: function renderChildren(node, tabSetComponents, tabComponents, splitterComponents) {
	            var drawChildren = node._getDrawChildren();

	            for (var i = 0; i < drawChildren.length; i++) {
	                var child = drawChildren[i];

	                if (child.getType() === _SplitterNode2.default.TYPE) {
	                    splitterComponents.push(_react2.default.createElement(_Splitter2.default, { key: child.getId(), layout: this, node: child }));
	                } else if (child.getType() === _TabSetNode2.default.TYPE) {
	                    tabSetComponents.push(_react2.default.createElement(_TabSet2.default, { key: child.getId(), layout: this, node: child }));
	                    this.renderChildren(child, tabSetComponents, tabComponents, splitterComponents);
	                } else if (child.getType() === _TabNode2.default.TYPE) {
	                    var selectedTab = child.getParent().getChildren()[child.getParent().getSelected()];
	                    if (selectedTab == null) {
	                        debugger; // this should not happen!
	                    }
	                    tabComponents[child.getId()] = _react2.default.createElement(_Tab2.default, {
	                        key: child.getId(),
	                        layout: this,
	                        node: child,
	                        selected: child === selectedTab,
	                        factory: this.props.factory });
	                } else {
	                    // is row
	                    this.renderChildren(child, tabSetComponents, tabComponents, splitterComponents);
	                }
	            }
	        }

	        /**
	         * Adds a new tab to the given tabset
	         * @param tabsetId the id of the tabset where the new tab will be added
	         * @param json the json for the new tab node
	         */

	    }, {
	        key: "addTabToTabSet",
	        value: function addTabToTabSet(tabsetId, json) {
	            var tabsetNode = this.model.getNodeById(tabsetId);
	            if (tabsetNode != null) {
	                this.doAction(_Actions2.default.addNode(json, tabsetId, _DockLocation2.default.CENTER, -1));
	            }
	        }

	        /**
	         * Adds a new tab to the active tabset (if there is one)
	         * @param json the json for the new tab node
	         */

	    }, {
	        key: "addTabToActiveTabSet",
	        value: function addTabToActiveTabSet(json) {
	            var tabsetNode = this.model.getActiveTabset();
	            if (tabsetNode != null) {
	                this.doAction(_Actions2.default.addNode(json, tabsetNode.getId(), _DockLocation2.default.CENTER, -1));
	            }
	        }

	        /**
	         * Adds a new tab by dragging a labeled panel to the drop location, dragging starts immediatelly
	         * @param dragText the text to show on the drag panel
	         * @param json the json for the new tab node
	         * @param onDrop a callback to call when the drag is complete
	         */

	    }, {
	        key: "addTabWithDragAndDrop",
	        value: function addTabWithDragAndDrop(dragText, json, onDrop) {
	            this.fnNewNodeDropped = onDrop;
	            this.newTabJson = json;
	            this.dragStart(null, dragText, new _TabNode2.default(this.model, json), null, null);
	        }

	        /**
	         * Adds a new tab by dragging a labeled panel to the drop location, dragging starts when you
	         * mouse down on the panel
	         *
	         * @param dragText the text to show on the drag panel
	         * @param json the json for the new tab node
	         * @param onDrop a callback to call when the drag is complete
	         */

	    }, {
	        key: "addTabWithDragAndDropIndirect",
	        value: function addTabWithDragAndDropIndirect(dragText, json, onDrop) {
	            this.fnNewNodeDropped = onDrop;
	            this.newTabJson = json;

	            _DragDrop2.default.instance.addGlass(this.onCancelAdd.bind(this));

	            this.dragDivText = dragText;
	            this.dragDiv = document.createElement("div");
	            this.dragDiv.className = "flexlayout__drag_rect";
	            this.dragDiv.innerHTML = this.dragDivText;
	            this.dragDiv.addEventListener("mousedown", this.onDragDivMouseDown.bind(this));
	            this.dragDiv.addEventListener("touchstart", this.onDragDivMouseDown.bind(this));

	            var r = new _Rect2.default(10, 10, 150, 50);
	            r.centerInRect(this.rect);
	            this.dragDiv.style.left = r.x + "px";
	            this.dragDiv.style.top = r.y + "px";

	            var rootdiv = _reactDom2.default.findDOMNode(this);
	            rootdiv.appendChild(this.dragDiv);
	        }
	    }, {
	        key: "onCancelAdd",
	        value: function onCancelAdd() {
	            var rootdiv = _reactDom2.default.findDOMNode(this);
	            rootdiv.removeChild(this.dragDiv);
	            this.dragDiv = null;
	            if (this.fnNewNodeDropped != null) {
	                this.fnNewNodeDropped();
	                this.fnNewNodeDropped = null;
	            }
	            _DragDrop2.default.instance.hideGlass();
	            this.newTabJson = null;
	        }
	    }, {
	        key: "onCancelDrag",
	        value: function onCancelDrag() {
	            var rootdiv = _reactDom2.default.findDOMNode(this);

	            try {
	                rootdiv.removeChild(this.outlineDiv);
	            } catch (e) {}

	            try {
	                rootdiv.removeChild(this.dragDiv);
	            } catch (e) {}

	            this.dragDiv = null;
	            this.hideEdges(rootdiv);
	            if (this.fnNewNodeDropped != null) {
	                this.fnNewNodeDropped();
	                this.fnNewNodeDropped = null;
	            }
	            _DragDrop2.default.instance.hideGlass();
	            this.newTabJson = null;
	        }
	    }, {
	        key: "onDragDivMouseDown",
	        value: function onDragDivMouseDown(event) {
	            event.preventDefault();
	            this.dragStart(event, this.dragDivText, new _TabNode2.default(this.model, this.newTabJson), true, null, null);
	        }
	    }, {
	        key: "dragStart",
	        value: function dragStart(event, dragDivText, node, allowDrag, onClick, onDoubleClick) {
	            if (this.model.getMaximizedTabset() != null || !allowDrag) {
	                _DragDrop2.default.instance.startDrag(event, null, null, null, null, onClick, onDoubleClick);
	            } else {
	                this.dragNode = node;
	                this.dragDivText = dragDivText;
	                _DragDrop2.default.instance.startDrag(event, this.onDragStart.bind(this), this.onDragMove.bind(this), this.onDragEnd.bind(this), this.onCancelDrag.bind(this), onClick, onDoubleClick);
	            }
	        }
	    }, {
	        key: "onDragStart",
	        value: function onDragStart(event) {
	            this.dropInfo = null;
	            var rootdiv = _reactDom2.default.findDOMNode(this);
	            this.outlineDiv = document.createElement("div");
	            this.outlineDiv.className = "flexlayout__outline_rect";
	            rootdiv.appendChild(this.outlineDiv);

	            if (this.dragDiv == null) {
	                this.dragDiv = document.createElement("div");
	                this.dragDiv.className = "flexlayout__drag_rect";
	                this.dragDiv.innerHTML = this.dragDivText;
	                rootdiv.appendChild(this.dragDiv);
	            }
	            // add edge indicators
	            this.showEdges(rootdiv);

	            if (this.dragNode != null && this.dragNode.getType() === _TabNode2.default.TYPE && this.dragNode.getTabRect() != null) {
	                this.dragNode.getTabRect().positionElement(this.outlineDiv);
	            }
	            this.firstMove = true;

	            return true;
	        }
	    }, {
	        key: "onDragMove",
	        value: function onDragMove(event) {
	            if (this.firstMove === false) {
	                this.outlineDiv.style.transition = "top .3s, left .3s, width .3s, height .3s";
	            }
	            this.firstMove = false;
	            var clientRect = this.refs.self.getBoundingClientRect();
	            var pos = {
	                x: event.clientX - clientRect.left,
	                y: event.clientY - clientRect.top
	            };

	            this.dragDiv.style.left = pos.x - this.dragDiv.getBoundingClientRect().width / 2 + "px";
	            this.dragDiv.style.top = pos.y + 5 + "px";

	            var dropInfo = this.model._findDropTargetNode(this.dragNode, pos.x, pos.y);
	            if (dropInfo) {
	                this.dropInfo = dropInfo;
	                this.outlineDiv.className = dropInfo.className;
	                dropInfo.rect.positionElement(this.outlineDiv);
	            }
	        }
	    }, {
	        key: "onDragEnd",
	        value: function onDragEnd(event) {
	            var rootdiv = _reactDom2.default.findDOMNode(this);
	            rootdiv.removeChild(this.outlineDiv);
	            rootdiv.removeChild(this.dragDiv);
	            this.dragDiv = null;
	            this.hideEdges(rootdiv);
	            _DragDrop2.default.instance.hideGlass();

	            if (this.dropInfo) {
	                if (this.newTabJson != null) {
	                    this.doAction(_Actions2.default.addNode(this.newTabJson, this.dropInfo.node.getId(), this.dropInfo.location, this.dropInfo.index));

	                    if (this.fnNewNodeDropped != null) {
	                        this.fnNewNodeDropped();
	                        this.fnNewNodeDropped = null;
	                    }
	                    this.newTabJson = null;
	                } else if (this.dragNode != null) {
	                    this.doAction(_Actions2.default.moveNode(this.dragNode.getId(), this.dropInfo.node.getId(), this.dropInfo.location, this.dropInfo.index));
	                }
	            }
	        }
	    }, {
	        key: "showEdges",
	        value: function showEdges(rootdiv) {
	            if (this.model.isEnableEdgeDock()) {
	                var domRect = rootdiv.getBoundingClientRect();
	                var r = this.centerRect;
	                var size = 100;
	                var length = size + "px";
	                var radius = "50px";
	                var width = "10px";

	                this.edgeTopDiv = document.createElement("div");
	                this.edgeTopDiv.className = "flexlayout__edge_rect";
	                this.edgeTopDiv.style.top = r.y + "px";
	                this.edgeTopDiv.style.left = r.x + (r.width - size) / 2 + "px";
	                this.edgeTopDiv.style.width = length;
	                this.edgeTopDiv.style.height = width;
	                this.edgeTopDiv.style.borderBottomLeftRadius = radius;
	                this.edgeTopDiv.style.borderBottomRightRadius = radius;

	                this.edgeLeftDiv = document.createElement("div");
	                this.edgeLeftDiv.className = "flexlayout__edge_rect";
	                this.edgeLeftDiv.style.top = r.y + (r.height - size) / 2 + "px";
	                this.edgeLeftDiv.style.left = r.x + "px";
	                this.edgeLeftDiv.style.width = width;
	                this.edgeLeftDiv.style.height = length;
	                this.edgeLeftDiv.style.borderTopRightRadius = radius;
	                this.edgeLeftDiv.style.borderBottomRightRadius = radius;

	                this.edgeBottomDiv = document.createElement("div");
	                this.edgeBottomDiv.className = "flexlayout__edge_rect";
	                this.edgeBottomDiv.style.bottom = domRect.height - r.getBottom() + "px";
	                this.edgeBottomDiv.style.left = r.x + (r.width - size) / 2 + "px";
	                this.edgeBottomDiv.style.width = length;
	                this.edgeBottomDiv.style.height = width;
	                this.edgeBottomDiv.style.borderTopLeftRadius = radius;
	                this.edgeBottomDiv.style.borderTopRightRadius = radius;

	                this.edgeRightDiv = document.createElement("div");
	                this.edgeRightDiv.className = "flexlayout__edge_rect";
	                this.edgeRightDiv.style.top = r.y + (r.height - size) / 2 + "px";
	                this.edgeRightDiv.style.right = domRect.width - r.getRight() + "px";
	                this.edgeRightDiv.style.width = width;
	                this.edgeRightDiv.style.height = length;
	                this.edgeRightDiv.style.borderTopLeftRadius = radius;
	                this.edgeRightDiv.style.borderBottomLeftRadius = radius;

	                rootdiv.appendChild(this.edgeTopDiv);
	                rootdiv.appendChild(this.edgeLeftDiv);
	                rootdiv.appendChild(this.edgeBottomDiv);
	                rootdiv.appendChild(this.edgeRightDiv);
	            }
	        }
	    }, {
	        key: "hideEdges",
	        value: function hideEdges(rootdiv) {
	            if (this.model.isEnableEdgeDock()) {
	                try {
	                    rootdiv.removeChild(this.edgeTopDiv);
	                    rootdiv.removeChild(this.edgeLeftDiv);
	                    rootdiv.removeChild(this.edgeBottomDiv);
	                    rootdiv.removeChild(this.edgeRightDiv);
	                } catch (e) {}
	            }
	        }
	    }, {
	        key: "maximize",
	        value: function maximize(tabsetNode) {
	            this.doAction(_Actions2.default.maximizeToggle(tabsetNode.getId()));
	        }
	    }, {
	        key: "customizeTab",
	        value: function customizeTab(tabNode, renderValues) {
	            if (this.props.onRenderTab) {
	                this.props.onRenderTab(tabNode, renderValues);
	            }
	        }
	    }, {
	        key: "customizeTabSet",
	        value: function customizeTabSet(tabSetNode, renderValues) {
	            if (this.props.onRenderTabSet) {
	                this.props.onRenderTabSet(tabSetNode, renderValues);
	            }
	        }
	    }]);

	    return Layout;
	}(_react2.default.Component);

	Layout.propTypes = {
	    model: _propTypes2.default.instanceOf(_Model2.default).isRequired,
	    factory: _propTypes2.default.func.isRequired,

	    onAction: _propTypes2.default.func,

	    onRenderTab: _propTypes2.default.func,
	    onRenderTabSet: _propTypes2.default.func,

	    onModelChange: _propTypes2.default.func
	};

	exports.default = Layout;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {/**
	 * Copyright 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 */

	if (process.env.NODE_ENV !== 'production') {
	  var REACT_ELEMENT_TYPE = (typeof Symbol === 'function' &&
	    Symbol.for &&
	    Symbol.for('react.element')) ||
	    0xeac7;

	  var isValidElement = function(object) {
	    return typeof object === 'object' &&
	      object !== null &&
	      object.$$typeof === REACT_ELEMENT_TYPE;
	  };

	  // By explicitly using `prop-types` you are opting into new development behavior.
	  // http://fb.me/prop-types-in-prod
	  var throwOnDirectAccess = true;
	  module.exports = __webpack_require__(4)(isValidElement, throwOnDirectAccess);
	} else {
	  // By explicitly using `prop-types` you are opting into new production behavior.
	  // http://fb.me/prop-types-in-prod
	  module.exports = __webpack_require__(10)();
	}

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(3)))

/***/ }),
/* 3 */
/***/ (function(module, exports) {

	// shim for using process in browser
	var process = module.exports = {};

	// cached from whatever global is present so that test runners that stub it
	// don't break things.  But we need to wrap it in a try catch in case it is
	// wrapped in strict mode code which doesn't define any globals.  It's inside a
	// function because try/catches deoptimize in certain engines.

	var cachedSetTimeout;
	var cachedClearTimeout;

	function defaultSetTimout() {
	    throw new Error('setTimeout has not been defined');
	}
	function defaultClearTimeout () {
	    throw new Error('clearTimeout has not been defined');
	}
	(function () {
	    try {
	        if (typeof setTimeout === 'function') {
	            cachedSetTimeout = setTimeout;
	        } else {
	            cachedSetTimeout = defaultSetTimout;
	        }
	    } catch (e) {
	        cachedSetTimeout = defaultSetTimout;
	    }
	    try {
	        if (typeof clearTimeout === 'function') {
	            cachedClearTimeout = clearTimeout;
	        } else {
	            cachedClearTimeout = defaultClearTimeout;
	        }
	    } catch (e) {
	        cachedClearTimeout = defaultClearTimeout;
	    }
	} ())
	function runTimeout(fun) {
	    if (cachedSetTimeout === setTimeout) {
	        //normal enviroments in sane situations
	        return setTimeout(fun, 0);
	    }
	    // if setTimeout wasn't available but was latter defined
	    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
	        cachedSetTimeout = setTimeout;
	        return setTimeout(fun, 0);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedSetTimeout(fun, 0);
	    } catch(e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
	            return cachedSetTimeout.call(null, fun, 0);
	        } catch(e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
	            return cachedSetTimeout.call(this, fun, 0);
	        }
	    }


	}
	function runClearTimeout(marker) {
	    if (cachedClearTimeout === clearTimeout) {
	        //normal enviroments in sane situations
	        return clearTimeout(marker);
	    }
	    // if clearTimeout wasn't available but was latter defined
	    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
	        cachedClearTimeout = clearTimeout;
	        return clearTimeout(marker);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedClearTimeout(marker);
	    } catch (e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
	            return cachedClearTimeout.call(null, marker);
	        } catch (e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
	            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
	            return cachedClearTimeout.call(this, marker);
	        }
	    }



	}
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;

	function cleanUpNextTick() {
	    if (!draining || !currentQueue) {
	        return;
	    }
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}

	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = runTimeout(cleanUpNextTick);
	    draining = true;

	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    runClearTimeout(timeout);
	}

	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        runTimeout(drainQueue);
	    }
	};

	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};

	function noop() {}

	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;
	process.prependListener = noop;
	process.prependOnceListener = noop;

	process.listeners = function (name) { return [] }

	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};

	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {/**
	 * Copyright 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 */

	'use strict';

	var emptyFunction = __webpack_require__(5);
	var invariant = __webpack_require__(6);
	var warning = __webpack_require__(7);

	var ReactPropTypesSecret = __webpack_require__(8);
	var checkPropTypes = __webpack_require__(9);

	module.exports = function(isValidElement, throwOnDirectAccess) {
	  /* global Symbol */
	  var ITERATOR_SYMBOL = typeof Symbol === 'function' && Symbol.iterator;
	  var FAUX_ITERATOR_SYMBOL = '@@iterator'; // Before Symbol spec.

	  /**
	   * Returns the iterator method function contained on the iterable object.
	   *
	   * Be sure to invoke the function with the iterable as context:
	   *
	   *     var iteratorFn = getIteratorFn(myIterable);
	   *     if (iteratorFn) {
	   *       var iterator = iteratorFn.call(myIterable);
	   *       ...
	   *     }
	   *
	   * @param {?object} maybeIterable
	   * @return {?function}
	   */
	  function getIteratorFn(maybeIterable) {
	    var iteratorFn = maybeIterable && (ITERATOR_SYMBOL && maybeIterable[ITERATOR_SYMBOL] || maybeIterable[FAUX_ITERATOR_SYMBOL]);
	    if (typeof iteratorFn === 'function') {
	      return iteratorFn;
	    }
	  }

	  /**
	   * Collection of methods that allow declaration and validation of props that are
	   * supplied to React components. Example usage:
	   *
	   *   var Props = require('ReactPropTypes');
	   *   var MyArticle = React.createClass({
	   *     propTypes: {
	   *       // An optional string prop named "description".
	   *       description: Props.string,
	   *
	   *       // A required enum prop named "category".
	   *       category: Props.oneOf(['News','Photos']).isRequired,
	   *
	   *       // A prop named "dialog" that requires an instance of Dialog.
	   *       dialog: Props.instanceOf(Dialog).isRequired
	   *     },
	   *     render: function() { ... }
	   *   });
	   *
	   * A more formal specification of how these methods are used:
	   *
	   *   type := array|bool|func|object|number|string|oneOf([...])|instanceOf(...)
	   *   decl := ReactPropTypes.{type}(.isRequired)?
	   *
	   * Each and every declaration produces a function with the same signature. This
	   * allows the creation of custom validation functions. For example:
	   *
	   *  var MyLink = React.createClass({
	   *    propTypes: {
	   *      // An optional string or URI prop named "href".
	   *      href: function(props, propName, componentName) {
	   *        var propValue = props[propName];
	   *        if (propValue != null && typeof propValue !== 'string' &&
	   *            !(propValue instanceof URI)) {
	   *          return new Error(
	   *            'Expected a string or an URI for ' + propName + ' in ' +
	   *            componentName
	   *          );
	   *        }
	   *      }
	   *    },
	   *    render: function() {...}
	   *  });
	   *
	   * @internal
	   */

	  var ANONYMOUS = '<<anonymous>>';

	  // Important!
	  // Keep this list in sync with production version in `./factoryWithThrowingShims.js`.
	  var ReactPropTypes = {
	    array: createPrimitiveTypeChecker('array'),
	    bool: createPrimitiveTypeChecker('boolean'),
	    func: createPrimitiveTypeChecker('function'),
	    number: createPrimitiveTypeChecker('number'),
	    object: createPrimitiveTypeChecker('object'),
	    string: createPrimitiveTypeChecker('string'),
	    symbol: createPrimitiveTypeChecker('symbol'),

	    any: createAnyTypeChecker(),
	    arrayOf: createArrayOfTypeChecker,
	    element: createElementTypeChecker(),
	    instanceOf: createInstanceTypeChecker,
	    node: createNodeChecker(),
	    objectOf: createObjectOfTypeChecker,
	    oneOf: createEnumTypeChecker,
	    oneOfType: createUnionTypeChecker,
	    shape: createShapeTypeChecker
	  };

	  /**
	   * inlined Object.is polyfill to avoid requiring consumers ship their own
	   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is
	   */
	  /*eslint-disable no-self-compare*/
	  function is(x, y) {
	    // SameValue algorithm
	    if (x === y) {
	      // Steps 1-5, 7-10
	      // Steps 6.b-6.e: +0 != -0
	      return x !== 0 || 1 / x === 1 / y;
	    } else {
	      // Step 6.a: NaN == NaN
	      return x !== x && y !== y;
	    }
	  }
	  /*eslint-enable no-self-compare*/

	  /**
	   * We use an Error-like object for backward compatibility as people may call
	   * PropTypes directly and inspect their output. However, we don't use real
	   * Errors anymore. We don't inspect their stack anyway, and creating them
	   * is prohibitively expensive if they are created too often, such as what
	   * happens in oneOfType() for any type before the one that matched.
	   */
	  function PropTypeError(message) {
	    this.message = message;
	    this.stack = '';
	  }
	  // Make `instanceof Error` still work for returned errors.
	  PropTypeError.prototype = Error.prototype;

	  function createChainableTypeChecker(validate) {
	    if (process.env.NODE_ENV !== 'production') {
	      var manualPropTypeCallCache = {};
	      var manualPropTypeWarningCount = 0;
	    }
	    function checkType(isRequired, props, propName, componentName, location, propFullName, secret) {
	      componentName = componentName || ANONYMOUS;
	      propFullName = propFullName || propName;

	      if (secret !== ReactPropTypesSecret) {
	        if (throwOnDirectAccess) {
	          // New behavior only for users of `prop-types` package
	          invariant(
	            false,
	            'Calling PropTypes validators directly is not supported by the `prop-types` package. ' +
	            'Use `PropTypes.checkPropTypes()` to call them. ' +
	            'Read more at http://fb.me/use-check-prop-types'
	          );
	        } else if (process.env.NODE_ENV !== 'production' && typeof console !== 'undefined') {
	          // Old behavior for people using React.PropTypes
	          var cacheKey = componentName + ':' + propName;
	          if (
	            !manualPropTypeCallCache[cacheKey] &&
	            // Avoid spamming the console because they are often not actionable except for lib authors
	            manualPropTypeWarningCount < 3
	          ) {
	            warning(
	              false,
	              'You are manually calling a React.PropTypes validation ' +
	              'function for the `%s` prop on `%s`. This is deprecated ' +
	              'and will throw in the standalone `prop-types` package. ' +
	              'You may be seeing this warning due to a third-party PropTypes ' +
	              'library. See https://fb.me/react-warning-dont-call-proptypes ' + 'for details.',
	              propFullName,
	              componentName
	            );
	            manualPropTypeCallCache[cacheKey] = true;
	            manualPropTypeWarningCount++;
	          }
	        }
	      }
	      if (props[propName] == null) {
	        if (isRequired) {
	          if (props[propName] === null) {
	            return new PropTypeError('The ' + location + ' `' + propFullName + '` is marked as required ' + ('in `' + componentName + '`, but its value is `null`.'));
	          }
	          return new PropTypeError('The ' + location + ' `' + propFullName + '` is marked as required in ' + ('`' + componentName + '`, but its value is `undefined`.'));
	        }
	        return null;
	      } else {
	        return validate(props, propName, componentName, location, propFullName);
	      }
	    }

	    var chainedCheckType = checkType.bind(null, false);
	    chainedCheckType.isRequired = checkType.bind(null, true);

	    return chainedCheckType;
	  }

	  function createPrimitiveTypeChecker(expectedType) {
	    function validate(props, propName, componentName, location, propFullName, secret) {
	      var propValue = props[propName];
	      var propType = getPropType(propValue);
	      if (propType !== expectedType) {
	        // `propValue` being instance of, say, date/regexp, pass the 'object'
	        // check, but we can offer a more precise error message here rather than
	        // 'of type `object`'.
	        var preciseType = getPreciseType(propValue);

	        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + preciseType + '` supplied to `' + componentName + '`, expected ') + ('`' + expectedType + '`.'));
	      }
	      return null;
	    }
	    return createChainableTypeChecker(validate);
	  }

	  function createAnyTypeChecker() {
	    return createChainableTypeChecker(emptyFunction.thatReturnsNull);
	  }

	  function createArrayOfTypeChecker(typeChecker) {
	    function validate(props, propName, componentName, location, propFullName) {
	      if (typeof typeChecker !== 'function') {
	        return new PropTypeError('Property `' + propFullName + '` of component `' + componentName + '` has invalid PropType notation inside arrayOf.');
	      }
	      var propValue = props[propName];
	      if (!Array.isArray(propValue)) {
	        var propType = getPropType(propValue);
	        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected an array.'));
	      }
	      for (var i = 0; i < propValue.length; i++) {
	        var error = typeChecker(propValue, i, componentName, location, propFullName + '[' + i + ']', ReactPropTypesSecret);
	        if (error instanceof Error) {
	          return error;
	        }
	      }
	      return null;
	    }
	    return createChainableTypeChecker(validate);
	  }

	  function createElementTypeChecker() {
	    function validate(props, propName, componentName, location, propFullName) {
	      var propValue = props[propName];
	      if (!isValidElement(propValue)) {
	        var propType = getPropType(propValue);
	        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected a single ReactElement.'));
	      }
	      return null;
	    }
	    return createChainableTypeChecker(validate);
	  }

	  function createInstanceTypeChecker(expectedClass) {
	    function validate(props, propName, componentName, location, propFullName) {
	      if (!(props[propName] instanceof expectedClass)) {
	        var expectedClassName = expectedClass.name || ANONYMOUS;
	        var actualClassName = getClassName(props[propName]);
	        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + actualClassName + '` supplied to `' + componentName + '`, expected ') + ('instance of `' + expectedClassName + '`.'));
	      }
	      return null;
	    }
	    return createChainableTypeChecker(validate);
	  }

	  function createEnumTypeChecker(expectedValues) {
	    if (!Array.isArray(expectedValues)) {
	      process.env.NODE_ENV !== 'production' ? warning(false, 'Invalid argument supplied to oneOf, expected an instance of array.') : void 0;
	      return emptyFunction.thatReturnsNull;
	    }

	    function validate(props, propName, componentName, location, propFullName) {
	      var propValue = props[propName];
	      for (var i = 0; i < expectedValues.length; i++) {
	        if (is(propValue, expectedValues[i])) {
	          return null;
	        }
	      }

	      var valuesString = JSON.stringify(expectedValues);
	      return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of value `' + propValue + '` ' + ('supplied to `' + componentName + '`, expected one of ' + valuesString + '.'));
	    }
	    return createChainableTypeChecker(validate);
	  }

	  function createObjectOfTypeChecker(typeChecker) {
	    function validate(props, propName, componentName, location, propFullName) {
	      if (typeof typeChecker !== 'function') {
	        return new PropTypeError('Property `' + propFullName + '` of component `' + componentName + '` has invalid PropType notation inside objectOf.');
	      }
	      var propValue = props[propName];
	      var propType = getPropType(propValue);
	      if (propType !== 'object') {
	        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected an object.'));
	      }
	      for (var key in propValue) {
	        if (propValue.hasOwnProperty(key)) {
	          var error = typeChecker(propValue, key, componentName, location, propFullName + '.' + key, ReactPropTypesSecret);
	          if (error instanceof Error) {
	            return error;
	          }
	        }
	      }
	      return null;
	    }
	    return createChainableTypeChecker(validate);
	  }

	  function createUnionTypeChecker(arrayOfTypeCheckers) {
	    if (!Array.isArray(arrayOfTypeCheckers)) {
	      process.env.NODE_ENV !== 'production' ? warning(false, 'Invalid argument supplied to oneOfType, expected an instance of array.') : void 0;
	      return emptyFunction.thatReturnsNull;
	    }

	    for (var i = 0; i < arrayOfTypeCheckers.length; i++) {
	      var checker = arrayOfTypeCheckers[i];
	      if (typeof checker !== 'function') {
	        warning(
	          false,
	          'Invalid argument supplid to oneOfType. Expected an array of check functions, but ' +
	          'received %s at index %s.',
	          getPostfixForTypeWarning(checker),
	          i
	        );
	        return emptyFunction.thatReturnsNull;
	      }
	    }

	    function validate(props, propName, componentName, location, propFullName) {
	      for (var i = 0; i < arrayOfTypeCheckers.length; i++) {
	        var checker = arrayOfTypeCheckers[i];
	        if (checker(props, propName, componentName, location, propFullName, ReactPropTypesSecret) == null) {
	          return null;
	        }
	      }

	      return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` supplied to ' + ('`' + componentName + '`.'));
	    }
	    return createChainableTypeChecker(validate);
	  }

	  function createNodeChecker() {
	    function validate(props, propName, componentName, location, propFullName) {
	      if (!isNode(props[propName])) {
	        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` supplied to ' + ('`' + componentName + '`, expected a ReactNode.'));
	      }
	      return null;
	    }
	    return createChainableTypeChecker(validate);
	  }

	  function createShapeTypeChecker(shapeTypes) {
	    function validate(props, propName, componentName, location, propFullName) {
	      var propValue = props[propName];
	      var propType = getPropType(propValue);
	      if (propType !== 'object') {
	        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type `' + propType + '` ' + ('supplied to `' + componentName + '`, expected `object`.'));
	      }
	      for (var key in shapeTypes) {
	        var checker = shapeTypes[key];
	        if (!checker) {
	          continue;
	        }
	        var error = checker(propValue, key, componentName, location, propFullName + '.' + key, ReactPropTypesSecret);
	        if (error) {
	          return error;
	        }
	      }
	      return null;
	    }
	    return createChainableTypeChecker(validate);
	  }

	  function isNode(propValue) {
	    switch (typeof propValue) {
	      case 'number':
	      case 'string':
	      case 'undefined':
	        return true;
	      case 'boolean':
	        return !propValue;
	      case 'object':
	        if (Array.isArray(propValue)) {
	          return propValue.every(isNode);
	        }
	        if (propValue === null || isValidElement(propValue)) {
	          return true;
	        }

	        var iteratorFn = getIteratorFn(propValue);
	        if (iteratorFn) {
	          var iterator = iteratorFn.call(propValue);
	          var step;
	          if (iteratorFn !== propValue.entries) {
	            while (!(step = iterator.next()).done) {
	              if (!isNode(step.value)) {
	                return false;
	              }
	            }
	          } else {
	            // Iterator will provide entry [k,v] tuples rather than values.
	            while (!(step = iterator.next()).done) {
	              var entry = step.value;
	              if (entry) {
	                if (!isNode(entry[1])) {
	                  return false;
	                }
	              }
	            }
	          }
	        } else {
	          return false;
	        }

	        return true;
	      default:
	        return false;
	    }
	  }

	  function isSymbol(propType, propValue) {
	    // Native Symbol.
	    if (propType === 'symbol') {
	      return true;
	    }

	    // 19.4.3.5 Symbol.prototype[@@toStringTag] === 'Symbol'
	    if (propValue['@@toStringTag'] === 'Symbol') {
	      return true;
	    }

	    // Fallback for non-spec compliant Symbols which are polyfilled.
	    if (typeof Symbol === 'function' && propValue instanceof Symbol) {
	      return true;
	    }

	    return false;
	  }

	  // Equivalent of `typeof` but with special handling for array and regexp.
	  function getPropType(propValue) {
	    var propType = typeof propValue;
	    if (Array.isArray(propValue)) {
	      return 'array';
	    }
	    if (propValue instanceof RegExp) {
	      // Old webkits (at least until Android 4.0) return 'function' rather than
	      // 'object' for typeof a RegExp. We'll normalize this here so that /bla/
	      // passes PropTypes.object.
	      return 'object';
	    }
	    if (isSymbol(propType, propValue)) {
	      return 'symbol';
	    }
	    return propType;
	  }

	  // This handles more types than `getPropType`. Only used for error messages.
	  // See `createPrimitiveTypeChecker`.
	  function getPreciseType(propValue) {
	    if (typeof propValue === 'undefined' || propValue === null) {
	      return '' + propValue;
	    }
	    var propType = getPropType(propValue);
	    if (propType === 'object') {
	      if (propValue instanceof Date) {
	        return 'date';
	      } else if (propValue instanceof RegExp) {
	        return 'regexp';
	      }
	    }
	    return propType;
	  }

	  // Returns a string that is postfixed to a warning about an invalid type.
	  // For example, "undefined" or "of type array"
	  function getPostfixForTypeWarning(value) {
	    var type = getPreciseType(value);
	    switch (type) {
	      case 'array':
	      case 'object':
	        return 'an ' + type;
	      case 'boolean':
	      case 'date':
	      case 'regexp':
	        return 'a ' + type;
	      default:
	        return type;
	    }
	  }

	  // Returns class name of the object, if any.
	  function getClassName(propValue) {
	    if (!propValue.constructor || !propValue.constructor.name) {
	      return ANONYMOUS;
	    }
	    return propValue.constructor.name;
	  }

	  ReactPropTypes.checkPropTypes = checkPropTypes;
	  ReactPropTypes.PropTypes = ReactPropTypes;

	  return ReactPropTypes;
	};

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(3)))

/***/ }),
/* 5 */
/***/ (function(module, exports) {

	"use strict";

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * 
	 */

	function makeEmptyFunction(arg) {
	  return function () {
	    return arg;
	  };
	}

	/**
	 * This function accepts and discards inputs; it has no side effects. This is
	 * primarily useful idiomatically for overridable function endpoints which
	 * always need to be callable, since JS lacks a null-call idiom ala Cocoa.
	 */
	var emptyFunction = function emptyFunction() {};

	emptyFunction.thatReturns = makeEmptyFunction;
	emptyFunction.thatReturnsFalse = makeEmptyFunction(false);
	emptyFunction.thatReturnsTrue = makeEmptyFunction(true);
	emptyFunction.thatReturnsNull = makeEmptyFunction(null);
	emptyFunction.thatReturnsThis = function () {
	  return this;
	};
	emptyFunction.thatReturnsArgument = function (arg) {
	  return arg;
	};

	module.exports = emptyFunction;

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 */

	'use strict';

	/**
	 * Use invariant() to assert state which your program assumes to be true.
	 *
	 * Provide sprintf-style format (only %s is supported) and arguments
	 * to provide information about what broke and what you were
	 * expecting.
	 *
	 * The invariant message will be stripped in production, but the invariant
	 * will remain to ensure logic does not differ in production.
	 */

	var validateFormat = function validateFormat(format) {};

	if (process.env.NODE_ENV !== 'production') {
	  validateFormat = function validateFormat(format) {
	    if (format === undefined) {
	      throw new Error('invariant requires an error message argument');
	    }
	  };
	}

	function invariant(condition, format, a, b, c, d, e, f) {
	  validateFormat(format);

	  if (!condition) {
	    var error;
	    if (format === undefined) {
	      error = new Error('Minified exception occurred; use the non-minified dev environment ' + 'for the full error message and additional helpful warnings.');
	    } else {
	      var args = [a, b, c, d, e, f];
	      var argIndex = 0;
	      error = new Error(format.replace(/%s/g, function () {
	        return args[argIndex++];
	      }));
	      error.name = 'Invariant Violation';
	    }

	    error.framesToPop = 1; // we don't care about invariant's own frame
	    throw error;
	  }
	}

	module.exports = invariant;
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(3)))

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {/**
	 * Copyright 2014-2015, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 */

	'use strict';

	var emptyFunction = __webpack_require__(5);

	/**
	 * Similar to invariant but only logs a warning if the condition is not met.
	 * This can be used to log issues in development environments in critical
	 * paths. Removing the logging code for production environments will keep the
	 * same logic and follow the same code paths.
	 */

	var warning = emptyFunction;

	if (process.env.NODE_ENV !== 'production') {
	  var printWarning = function printWarning(format) {
	    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
	      args[_key - 1] = arguments[_key];
	    }

	    var argIndex = 0;
	    var message = 'Warning: ' + format.replace(/%s/g, function () {
	      return args[argIndex++];
	    });
	    if (typeof console !== 'undefined') {
	      console.error(message);
	    }
	    try {
	      // --- Welcome to debugging React ---
	      // This error was thrown as a convenience so that you can use this stack
	      // to find the callsite that caused this warning to fire.
	      throw new Error(message);
	    } catch (x) {}
	  };

	  warning = function warning(condition, format) {
	    if (format === undefined) {
	      throw new Error('`warning(condition, format, ...args)` requires a warning ' + 'message argument');
	    }

	    if (format.indexOf('Failed Composite propType: ') === 0) {
	      return; // Ignore CompositeComponent proptype check.
	    }

	    if (!condition) {
	      for (var _len2 = arguments.length, args = Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
	        args[_key2 - 2] = arguments[_key2];
	      }

	      printWarning.apply(undefined, [format].concat(args));
	    }
	  };
	}

	module.exports = warning;
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(3)))

/***/ }),
/* 8 */
/***/ (function(module, exports) {

	/**
	 * Copyright 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 */

	'use strict';

	var ReactPropTypesSecret = 'SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED';

	module.exports = ReactPropTypesSecret;


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {/**
	 * Copyright 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 */

	'use strict';

	if (process.env.NODE_ENV !== 'production') {
	  var invariant = __webpack_require__(6);
	  var warning = __webpack_require__(7);
	  var ReactPropTypesSecret = __webpack_require__(8);
	  var loggedTypeFailures = {};
	}

	/**
	 * Assert that the values match with the type specs.
	 * Error messages are memorized and will only be shown once.
	 *
	 * @param {object} typeSpecs Map of name to a ReactPropType
	 * @param {object} values Runtime values that need to be type-checked
	 * @param {string} location e.g. "prop", "context", "child context"
	 * @param {string} componentName Name of the component for error messages.
	 * @param {?Function} getStack Returns the component stack.
	 * @private
	 */
	function checkPropTypes(typeSpecs, values, location, componentName, getStack) {
	  if (process.env.NODE_ENV !== 'production') {
	    for (var typeSpecName in typeSpecs) {
	      if (typeSpecs.hasOwnProperty(typeSpecName)) {
	        var error;
	        // Prop type validation may throw. In case they do, we don't want to
	        // fail the render phase where it didn't fail before. So we log it.
	        // After these have been cleaned up, we'll let them throw.
	        try {
	          // This is intentionally an invariant that gets caught. It's the same
	          // behavior as without this statement except with a better message.
	          invariant(typeof typeSpecs[typeSpecName] === 'function', '%s: %s type `%s` is invalid; it must be a function, usually from ' + 'React.PropTypes.', componentName || 'React class', location, typeSpecName);
	          error = typeSpecs[typeSpecName](values, typeSpecName, componentName, location, null, ReactPropTypesSecret);
	        } catch (ex) {
	          error = ex;
	        }
	        warning(!error || error instanceof Error, '%s: type specification of %s `%s` is invalid; the type checker ' + 'function must return `null` or an `Error` but returned a %s. ' + 'You may have forgotten to pass an argument to the type checker ' + 'creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and ' + 'shape all require an argument).', componentName || 'React class', location, typeSpecName, typeof error);
	        if (error instanceof Error && !(error.message in loggedTypeFailures)) {
	          // Only monitor this failure once because there tends to be a lot of the
	          // same error.
	          loggedTypeFailures[error.message] = true;

	          var stack = getStack ? getStack() : '';

	          warning(false, 'Failed %s type: %s%s', location, error.message, stack != null ? stack : '');
	        }
	      }
	    }
	  }
	}

	module.exports = checkPropTypes;

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(3)))

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * Copyright 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 */

	'use strict';

	var emptyFunction = __webpack_require__(5);
	var invariant = __webpack_require__(6);
	var ReactPropTypesSecret = __webpack_require__(8);

	module.exports = function() {
	  function shim(props, propName, componentName, location, propFullName, secret) {
	    if (secret === ReactPropTypesSecret) {
	      // It is still safe when called from React.
	      return;
	    }
	    invariant(
	      false,
	      'Calling PropTypes validators directly is not supported by the `prop-types` package. ' +
	      'Use PropTypes.checkPropTypes() to call them. ' +
	      'Read more at http://fb.me/use-check-prop-types'
	    );
	  };
	  shim.isRequired = shim;
	  function getShim() {
	    return shim;
	  };
	  // Important!
	  // Keep this list in sync with production version in `./factoryWithTypeCheckers.js`.
	  var ReactPropTypes = {
	    array: shim,
	    bool: shim,
	    func: shim,
	    number: shim,
	    object: shim,
	    string: shim,
	    symbol: shim,

	    any: shim,
	    arrayOf: getShim,
	    element: shim,
	    instanceOf: getShim,
	    node: shim,
	    objectOf: getShim,
	    oneOf: getShim,
	    oneOfType: getShim,
	    shape: getShim
	  };

	  ReactPropTypes.checkPropTypes = emptyFunction;
	  ReactPropTypes.PropTypes = ReactPropTypes;

	  return ReactPropTypes;
	};


/***/ }),
/* 11 */
/***/ (function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_11__;

/***/ }),
/* 12 */
/***/ (function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_12__;

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _react = __webpack_require__(11);

	var _react2 = _interopRequireDefault(_react);

	var _reactDom = __webpack_require__(12);

	var _reactDom2 = _interopRequireDefault(_reactDom);

	var _DragDrop = __webpack_require__(14);

	var _DragDrop2 = _interopRequireDefault(_DragDrop);

	var _Orientation = __webpack_require__(16);

	var _Orientation2 = _interopRequireDefault(_Orientation);

	var _BorderNode = __webpack_require__(17);

	var _BorderNode2 = _interopRequireDefault(_BorderNode);

	var _Actions = __webpack_require__(27);

	var _Actions2 = _interopRequireDefault(_Actions);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var Splitter = function (_React$Component) {
	    _inherits(Splitter, _React$Component);

	    function Splitter() {
	        _classCallCheck(this, Splitter);

	        return _possibleConstructorReturn(this, (Splitter.__proto__ || Object.getPrototypeOf(Splitter)).apply(this, arguments));
	    }

	    _createClass(Splitter, [{
	        key: "onMouseDown",
	        value: function onMouseDown(event) {
	            _DragDrop2.default.instance.startDrag(event, this.onDragStart.bind(this), this.onDragMove.bind(this), this.onDragEnd.bind(this), this.onDragCancel.bind(this));
	        }
	    }, {
	        key: "onDragCancel",
	        value: function onDragCancel() {
	            var rootdiv = _reactDom2.default.findDOMNode(this.props.layout);
	            rootdiv.removeChild(this.outlineDiv);
	        }
	    }, {
	        key: "onDragStart",
	        value: function onDragStart(event) {
	            this.pBounds = this.props.node.getParent()._getSplitterBounds(this.props.node);
	            var rootdiv = _reactDom2.default.findDOMNode(this.props.layout);
	            this.outlineDiv = document.createElement("div");
	            this.outlineDiv.style.position = "absolute";
	            this.outlineDiv.className = "flexlayout__splitter_drag";
	            this.outlineDiv.style.cursor = this.props.node.getOrientation() === _Orientation2.default.HORZ ? "ns-resize" : "ew-resize";
	            this.props.node.getRect().positionElement(this.outlineDiv);
	            rootdiv.appendChild(this.outlineDiv);
	            return true;
	        }
	    }, {
	        key: "onDragMove",
	        value: function onDragMove(event) {
	            var clientRect = _reactDom2.default.findDOMNode(this.props.layout).getBoundingClientRect();
	            var pos = {
	                x: event.clientX - clientRect.left,
	                y: event.clientY - clientRect.top
	            };

	            if (this.props.node.getOrientation() === _Orientation2.default.HORZ) {
	                this.outlineDiv.style.top = this.getBoundPosition(pos.y - 4) + "px";
	            } else {
	                this.outlineDiv.style.left = this.getBoundPosition(pos.x - 4) + "px";
	            }
	        }
	    }, {
	        key: "onDragEnd",
	        value: function onDragEnd(event) {
	            var node = this.props.node;
	            var value = 0;
	            if (node.getOrientation() === _Orientation2.default.HORZ) {
	                value = this.outlineDiv.offsetTop;
	            } else {
	                value = this.outlineDiv.offsetLeft;
	            }

	            if (node.getParent().getType() == _BorderNode2.default.TYPE) {
	                var pos = node.getParent()._calculateSplit(node, value);
	                this.props.layout.doAction(_Actions2.default.adjustBorderSplit(node.getParent().getId(), pos));
	            } else {
	                var splitSpec = node.getParent()._calculateSplit(this.props.node, value);
	                if (splitSpec != null) {
	                    this.props.layout.doAction(_Actions2.default.adjustSplit(splitSpec));
	                }
	            }

	            var rootdiv = _reactDom2.default.findDOMNode(this.props.layout);
	            rootdiv.removeChild(this.outlineDiv);
	        }
	    }, {
	        key: "getBoundPosition",
	        value: function getBoundPosition(p) {
	            var rtn = p;
	            if (p < this.pBounds[0]) {
	                rtn = this.pBounds[0];
	            }
	            if (p > this.pBounds[1]) {
	                rtn = this.pBounds[1];
	            }

	            return rtn;
	        }
	    }, {
	        key: "render",
	        value: function render() {
	            var node = this.props.node;
	            var style = node._styleWithPosition({
	                cursor: this.props.node.getOrientation() === _Orientation2.default.HORZ ? "ns-resize" : "ew-resize"
	            });

	            return _react2.default.createElement("div", { style: style, onTouchStart: this.onMouseDown.bind(this), onMouseDown: this.onMouseDown.bind(this),
	                className: "flexlayout__splitter" });
	        }
	    }]);

	    return Splitter;
	}(_react2.default.Component);

	exports.default = Splitter;

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _Rect = __webpack_require__(15);

	var _Rect2 = _interopRequireDefault(_Rect);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var DragDrop = function () {
	    function DragDrop() {
	        _classCallCheck(this, DragDrop);

	        this.glass = document.createElement("div");
	        this.glass.style.zIndex = 998;
	        this.glass.style.position = "absolute";
	        this.glass.style.backgroundColor = "white";
	        this.glass.style.opacity = ".00"; // may need to be .01 for IE???
	        this.glass.style.filter = "alpha(opacity=01)";

	        this.onMouseMove = this.onMouseMove.bind(this);
	        this.onMouseUp = this.onMouseUp.bind(this);

	        this.onKeyPress = this.onKeyPress.bind(this);

	        this.lastClick = 0;
	        this.clickX = 0;
	        this.clickY = 0;
	    }

	    // if you add the glass pane then you should remove it


	    _createClass(DragDrop, [{
	        key: "addGlass",
	        value: function addGlass(fCancel) {
	            if (!this.glassShowing) {
	                var glassRect = new _Rect2.default(0, 0, document.documentElement.clientWidth, document.documentElement.clientHeight);
	                glassRect.positionElement(this.glass);
	                document.body.appendChild(this.glass);
	                this.glass.tabIndex = -1;
	                this.glass.focus();
	                this.glass.addEventListener("keydown", this.onKeyPress);
	                this.glassShowing = true;
	                this.fDragCancel = fCancel;
	                this.manualGlassManagement = false;
	            } else {
	                // second call to addGlass (via dragstart)
	                this.manualGlassManagement = true;
	            }
	        }
	    }, {
	        key: "hideGlass",
	        value: function hideGlass() {
	            if (this.glassShowing) {
	                document.body.removeChild(this.glass);
	                this.glassShowing = false;
	            }
	        }
	    }, {
	        key: "onKeyPress",
	        value: function onKeyPress(event) {
	            if (this.fDragCancel != null && event.keyCode === 27) {
	                // esc
	                this.hideGlass();
	                document.removeEventListener("mousemove", this.onMouseMove);
	                document.removeEventListener("mouseup", this.onMouseUp);
	                this.dragging = false;
	                this.fDragCancel();
	            }
	        }
	    }, {
	        key: "getLocationEvent",
	        value: function getLocationEvent(event) {
	            var posEvent = event;
	            if (event.touches) {
	                posEvent = event.touches[0];
	            }
	            return posEvent;
	        }
	    }, {
	        key: "getLocationEventEnd",
	        value: function getLocationEventEnd(event) {
	            var posEvent = event;
	            if (event.changedTouches) {
	                posEvent = event.changedTouches[0];
	            }
	            return posEvent;
	        }
	    }, {
	        key: "stopPropagation",
	        value: function stopPropagation(event) {
	            if (event.stopPropagation) {
	                event.stopPropagation();
	            }
	        }
	    }, {
	        key: "preventDefault",
	        value: function preventDefault(event) {
	            if (event.preventDefault) {
	                event.preventDefault();
	            }
	            return event;
	        }
	    }, {
	        key: "startDrag",
	        value: function startDrag(event, fDragStart, fDragMove, fDragEnd, fDragCancel, fClick, fDblClick) {
	            var posEvent = this.getLocationEvent(event);
	            this.addGlass(fDragCancel);

	            if (this.dragging) debugger; // should never happen

	            if (event != null) {
	                this.startX = posEvent.clientX;
	                this.startY = posEvent.clientY;
	                this.glass.style.cursor = getComputedStyle(event.target).cursor;
	                this.stopPropagation(event);
	                this.preventDefault(event);
	            } else {
	                this.startX = 0;
	                this.startY = 0;
	                this.glass.style.cursor = "default";
	            }

	            this.dragging = false;
	            this.fDragStart = fDragStart;
	            this.fDragMove = fDragMove;
	            this.fDragEnd = fDragEnd;
	            this.fDragCancel = fDragCancel;
	            this.fClick = fClick;
	            this.fDblClick = fDblClick;

	            document.addEventListener("mouseup", this.onMouseUp);
	            document.addEventListener("mousemove", this.onMouseMove);
	            document.addEventListener("touchend", this.onMouseUp);
	            document.addEventListener("touchmove", this.onMouseMove);
	        }
	    }, {
	        key: "onMouseMove",
	        value: function onMouseMove(event) {
	            var posEvent = this.getLocationEvent(event);
	            this.stopPropagation(event);
	            this.preventDefault(event);

	            if (!this.dragging && (Math.abs(this.startX - posEvent.clientX) > 5 || Math.abs(this.startY - posEvent.clientY) > 5)) {
	                this.dragging = true;
	                if (this.fDragStart) {
	                    this.glass.style.cursor = "move";
	                    this.dragging = this.fDragStart({ "clientX": this.startX, "clientY": this.startY });
	                }
	            }

	            if (this.dragging) {
	                if (this.fDragMove) {
	                    this.fDragMove(posEvent);
	                }
	            }
	            return false;
	        }
	    }, {
	        key: "onMouseUp",
	        value: function onMouseUp(event) {
	            var posEvent = this.getLocationEventEnd(event);

	            this.stopPropagation(event);
	            this.preventDefault(event);

	            if (!this.manualGlassManagement) {
	                this.hideGlass();
	            }

	            document.removeEventListener("mousemove", this.onMouseMove);
	            document.removeEventListener("mouseup", this.onMouseUp);
	            document.removeEventListener("touchend", this.onMouseUp);
	            document.removeEventListener("touchmove", this.onMouseMove);

	            if (this.dragging) {
	                this.dragging = false;
	                if (this.fDragEnd) {
	                    this.fDragEnd(event);
	                }
	                //dump("set dragging = false\n");
	            } else {
	                if (Math.abs(this.startX - posEvent.clientX) <= 5 && Math.abs(this.startY - posEvent.clientY) <= 5) {
	                    var clickTime = new Date().getTime();
	                    // check for double click
	                    if (Math.abs(this.clickX - posEvent.clientX) <= 5 && Math.abs(this.clickY - posEvent.clientY) <= 5) {
	                        if (clickTime - this.lastClick < 500) {
	                            if (this.fDblClick) {
	                                this.fDblClick(event);
	                            }
	                        }
	                    }

	                    if (this.fClick) {
	                        this.fClick(event);
	                    }
	                    this.lastClick = clickTime;
	                    this.clickX = posEvent.clientX;
	                    this.clickY = posEvent.clientY;
	                }
	            }
	            return false;
	        }
	    }, {
	        key: "isDragging",
	        value: function isDragging() {
	            return this.dragging;
	        }
	    }, {
	        key: "toString",
	        value: function toString() {
	            var rtn = "(DragDrop: " + "startX=" + this.startX + ", startY=" + this.startY + ", dragging=" + this.dragging + ")";

	            return rtn;
	        }
	    }]);

	    return DragDrop;
	}();

	DragDrop.instance = new DragDrop();

	exports.default = DragDrop;

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _Orientation = __webpack_require__(16);

	var _Orientation2 = _interopRequireDefault(_Orientation);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Rect = function () {
	    function Rect(x, y, width, height) {
	        _classCallCheck(this, Rect);

	        this.x = x;
	        this.y = y;
	        this.width = width;
	        this.height = height;
	    }

	    _createClass(Rect, [{
	        key: "clone",
	        value: function clone() {
	            return new Rect(this.x, this.y, this.width, this.height);
	        }
	    }, {
	        key: "equals",
	        value: function equals(rect) {
	            if (this.x === rect.x && this.y === rect.y && this.width === rect.width && this.height === rect.height) {
	                return true;
	            } else {
	                return false;
	            }
	        }
	    }, {
	        key: "getBottom",
	        value: function getBottom() {
	            return this.y + this.height;
	        }
	    }, {
	        key: "getRight",
	        value: function getRight() {
	            return this.x + this.width;
	        }
	    }, {
	        key: "positionElement",
	        value: function positionElement(element) {
	            this.styleWithPosition(element.style);
	        }
	    }, {
	        key: "styleWithPosition",
	        value: function styleWithPosition(style) {
	            style.left = this.x + "px";
	            style.top = this.y + "px";
	            style.width = Math.max(0, this.width) + "px"; // need Math.max to prevent -ve, cause error in IE
	            style.height = Math.max(0, this.height) + "px";
	            style.position = "absolute";
	            return style;
	        }
	    }, {
	        key: "contains",
	        value: function contains(x, y) {
	            if (this.x <= x && x <= this.getRight() && this.y <= y && y <= this.getBottom()) {
	                return true;
	            } else {
	                return false;
	            }
	        }
	    }, {
	        key: "centerInRect",
	        value: function centerInRect(outerRect) {
	            this.x = (outerRect.width - this.width) / 2;
	            this.y = (outerRect.height - this.height) / 2;
	        }
	    }, {
	        key: "_getSize",
	        value: function _getSize(orientation) {
	            var prefSize = this.width;
	            if (orientation === _Orientation2.default.VERT) {
	                prefSize = this.height;
	            }
	            return prefSize;
	        }
	    }, {
	        key: "toString",
	        value: function toString() {
	            return "(Rect: x=" + this.x + ", y=" + this.y + ", width=" + this.width + ", height=" + this.height + ")";
	        }
	    }]);

	    return Rect;
	}();

	exports.default = Rect;

/***/ }),
/* 16 */
/***/ (function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Orientation = function () {
	    function Orientation() {
	        _classCallCheck(this, Orientation);
	    }

	    _createClass(Orientation, null, [{
	        key: "flip",
	        value: function flip(from) {
	            if (from === Orientation.HORZ) {
	                return Orientation.VERT;
	            } else {
	                return Orientation.HORZ;
	            }
	        }
	    }]);

	    return Orientation;
	}();

	// statics


	Orientation.HORZ = "horz";
	Orientation.VERT = "vert";

	exports.default = Orientation;

/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _Rect = __webpack_require__(15);

	var _Rect2 = _interopRequireDefault(_Rect);

	var _AttributeDefinitions = __webpack_require__(18);

	var _AttributeDefinitions2 = _interopRequireDefault(_AttributeDefinitions);

	var _Attribute = __webpack_require__(19);

	var _Attribute2 = _interopRequireDefault(_Attribute);

	var _DockLocation = __webpack_require__(20);

	var _DockLocation2 = _interopRequireDefault(_DockLocation);

	var _Orientation = __webpack_require__(16);

	var _Orientation2 = _interopRequireDefault(_Orientation);

	var _DropInfo = __webpack_require__(21);

	var _DropInfo2 = _interopRequireDefault(_DropInfo);

	var _Node2 = __webpack_require__(22);

	var _Node3 = _interopRequireDefault(_Node2);

	var _TabNode = __webpack_require__(23);

	var _TabNode2 = _interopRequireDefault(_TabNode);

	var _TabSetNode = __webpack_require__(24);

	var _TabSetNode2 = _interopRequireDefault(_TabSetNode);

	var _SplitterNode = __webpack_require__(26);

	var _SplitterNode2 = _interopRequireDefault(_SplitterNode);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var BorderNode = function (_Node) {
	    _inherits(BorderNode, _Node);

	    function BorderNode(location, json, model) {
	        _classCallCheck(this, BorderNode);

	        var _this = _possibleConstructorReturn(this, (BorderNode.__proto__ || Object.getPrototypeOf(BorderNode)).call(this, model));

	        _this._contentRect = null;
	        _this._tabHeaderRect = null;
	        _this._location = location;
	        _this._drawChildren = [];
	        _this._attributes["id"] = "border_" + location.getName();
	        attributeDefinitions.fromJson(json, _this._attributes);
	        model._addNode(_this);
	        return _this;
	    }

	    _createClass(BorderNode, [{
	        key: "getLocation",
	        value: function getLocation() {
	            return this._location;
	        }
	    }, {
	        key: "getTabHeaderRect",
	        value: function getTabHeaderRect() {
	            return this._tabHeaderRect;
	        }
	    }, {
	        key: "getContentRect",
	        value: function getContentRect() {
	            return this._contentRect;
	        }
	    }, {
	        key: "isEnableDrop",
	        value: function isEnableDrop() {
	            return this._getAttr("enableDrop");
	        }
	    }, {
	        key: "getClassNameBorder",
	        value: function getClassNameBorder() {
	            return this._getAttr("className");
	        }
	    }, {
	        key: "getBorderBarSize",
	        value: function getBorderBarSize() {
	            return this._getAttr("barSize");
	        }
	    }, {
	        key: "getSize",
	        value: function getSize() {
	            return this._attributes["size"];
	        }
	    }, {
	        key: "getSelected",
	        value: function getSelected() {
	            return this._attributes["selected"];
	        }
	    }, {
	        key: "getSelectedNode",
	        value: function getSelectedNode() {
	            if (this.getSelected() != -1) {
	                return this._children[this.getSelected()];
	            }
	            return null;
	        }
	    }, {
	        key: "getOrientation",
	        value: function getOrientation() {
	            return this._location.getOrientation();
	        }
	    }, {
	        key: "isMaximized",
	        value: function isMaximized() {
	            return false;
	        }
	    }, {
	        key: "isShowing",
	        value: function isShowing() {
	            return this._attributes["show"];
	        }
	    }, {
	        key: "_setSelected",
	        value: function _setSelected(index) {
	            this._attributes["selected"] = index;
	        }
	    }, {
	        key: "_setSize",
	        value: function _setSize(pos) {
	            this._attributes["size"] = pos;
	        }
	    }, {
	        key: "_updateAttrs",
	        value: function _updateAttrs(json) {
	            attributeDefinitions.update(json, this._attributes);
	        }
	    }, {
	        key: "_getDrawChildren",
	        value: function _getDrawChildren() {
	            return this._drawChildren;
	        }
	    }, {
	        key: "_setAdjustedSize",
	        value: function _setAdjustedSize(size) {
	            this._adjustedSize = size;
	        }
	    }, {
	        key: "_getAdjustedSize",
	        value: function _getAdjustedSize() {
	            return this._adjustedSize;
	        }
	    }, {
	        key: "_layout",
	        value: function _layout(borderRects) {
	            var _this2 = this;

	            this._drawChildren = [];
	            var location = this._location;

	            var split1 = location.split(borderRects.outer, this.getBorderBarSize()); // split border outer
	            var split2 = location.split(borderRects.inner, this.getBorderBarSize()); // split border inner
	            var split3 = location.split(split2.end, this._adjustedSize + this._model.getSplitterSize()); // split off tab contents
	            var split4 = location.reflect().split(split3.start, this._model.getSplitterSize()); // split contents into content and splitter

	            this._tabHeaderRect = split2.start;
	            this._contentRect = split4.end;

	            this._children.forEach(function (child, i) {
	                child._layout(_this2._contentRect);
	                child._setVisible(i === _this2.getSelected());
	                _this2._drawChildren.push(child);
	            });

	            if (this.getSelected() == -1) {
	                return { outer: split1.end, inner: split2.end };
	            } else {
	                var newSplitter = new _SplitterNode2.default(this._model);
	                newSplitter._parent = this;
	                newSplitter._rect = split4.start;
	                this._drawChildren.push(newSplitter);

	                return { outer: split1.end, inner: split3.end };
	            }
	        }
	    }, {
	        key: "_remove",
	        value: function _remove(node) {
	            if (this.getSelected() != -1) {
	                var selectedNode = this._children[this.getSelected()];
	                if (node === selectedNode) {
	                    this._setSelected(-1);
	                    this._removeChild(node);
	                } else {
	                    this._removeChild(node);
	                    for (var i = 0; i < this._children.length; i++) {
	                        if (this._children[i] === selectedNode) {
	                            this._setSelected(i);
	                            break;
	                        }
	                    }
	                }
	            } else {
	                this._removeChild(node);
	            }
	        }
	    }, {
	        key: "_canDrop",
	        value: function _canDrop(dragNode, x, y) {
	            if (dragNode.getType() != _TabNode2.default.TYPE) {
	                return false;
	            }

	            var dropInfo = null;
	            var dockLocation = _DockLocation2.default.CENTER;

	            if (this._tabHeaderRect.contains(x, y)) {
	                if (this._location._orientation == _Orientation2.default.VERT) {
	                    if (this._children.length > 0) {
	                        var child = this._children[0];
	                        var childRect = child._tabRect;
	                        var childY = childRect.y;

	                        var childHeight = childRect.height;

	                        var pos = this._tabHeaderRect.x;
	                        var childCenter = 0;
	                        for (var i = 0; i < this._children.length; i++) {
	                            child = this._children[i];
	                            childRect = child._tabRect;
	                            childCenter = childRect.x + childRect.width / 2;
	                            if (x >= pos && x < childCenter) {
	                                var outlineRect = new _Rect2.default(childRect.x - 2, childY, 3, childHeight);
	                                dropInfo = new _DropInfo2.default(this, outlineRect, dockLocation, i, "flexlayout__outline_rect");
	                                break;
	                            }
	                            pos = childCenter;
	                        }
	                        if (dropInfo == null) {
	                            var _outlineRect = new _Rect2.default(childRect.getRight() - 2, childY, 3, childHeight);
	                            dropInfo = new _DropInfo2.default(this, _outlineRect, dockLocation, this._children.length, "flexlayout__outline_rect");
	                        }
	                    } else {
	                        var _outlineRect2 = new _Rect2.default(this._tabHeaderRect.x + 1, this._tabHeaderRect.y + 2, 3, 18);
	                        dropInfo = new _DropInfo2.default(this, _outlineRect2, dockLocation, 0, "flexlayout__outline_rect");
	                    }
	                } else {
	                    if (this._children.length > 0) {
	                        var _child = this._children[0];
	                        var _childRect = _child._tabRect;
	                        var childX = _childRect.x;
	                        var childWidth = _childRect.width;

	                        var _pos = this._tabHeaderRect.y;
	                        var _childCenter = 0;
	                        for (var _i = 0; _i < this._children.length; _i++) {
	                            _child = this._children[_i];
	                            _childRect = _child._tabRect;
	                            _childCenter = _childRect.y + _childRect.height / 2;
	                            if (y >= _pos && y < _childCenter) {
	                                var _outlineRect3 = new _Rect2.default(childX, _childRect.y - 2, childWidth, 3);
	                                dropInfo = new _DropInfo2.default(this, _outlineRect3, dockLocation, _i, "flexlayout__outline_rect");
	                                break;
	                            }
	                            _pos = _childCenter;
	                        }
	                        if (dropInfo == null) {
	                            var _outlineRect4 = new _Rect2.default(childX, _childRect.getBottom() - 2, childWidth, 3);
	                            dropInfo = new _DropInfo2.default(this, _outlineRect4, dockLocation, this._children.length, "flexlayout__outline_rect");
	                        }
	                    } else {
	                        var _outlineRect5 = new _Rect2.default(this._tabHeaderRect.x + 2, this._tabHeaderRect.y + 1, 18, 3);
	                        dropInfo = new _DropInfo2.default(this, _outlineRect5, dockLocation, 0, "flexlayout__outline_rect");
	                    }
	                }
	                if (!dragNode._canDockInto(dragNode, dropInfo)) {
	                    return null;
	                }
	            } else if (this.getSelected() != -1 && this._contentRect.contains(x, y)) {
	                var _outlineRect6 = this._contentRect;
	                dropInfo = new _DropInfo2.default(this, _outlineRect6, dockLocation, -1, "flexlayout__outline_rect");
	                if (!dragNode._canDockInto(dragNode, dropInfo)) {
	                    return null;
	                }
	            }

	            return dropInfo;
	        }
	    }, {
	        key: "_drop",
	        value: function _drop(dragNode, location, index) {
	            var fromIndex = 0;
	            if (dragNode._parent != null) {
	                fromIndex = dragNode._parent._removeChild(dragNode);
	            }

	            // if dropping a tab back to same tabset and moving to forward position then reduce insertion index
	            if (dragNode.getType() === _TabNode2.default.TYPE && dragNode._parent === this && fromIndex < index && index > 0) {
	                index--;
	            }

	            // for the tabset/border being removed from set the selected index
	            if (dragNode._parent !== null) {
	                if (dragNode._parent.getType() === _TabSetNode2.default.TYPE) {
	                    dragNode._parent._setSelected(0);
	                } else if (dragNode._parent.getType() === BorderNode.TYPE) {
	                    if (dragNode._parent.getSelected() != -1) {
	                        if (fromIndex === dragNode._parent.getSelected() && dragNode._parent._children.length > 0) {
	                            dragNode._parent._setSelected(0);
	                        } else if (fromIndex < dragNode._parent.getSelected()) {
	                            dragNode._parent._setSelected(dragNode._parent.getSelected() - 1);
	                        } else if (fromIndex > dragNode._parent.getSelected()) {
	                            // leave selected index as is
	                        } else {
	                            dragNode._parent._setSelected(-1);
	                        }
	                    }
	                }
	            }

	            // simple_bundled dock to existing tabset
	            var insertPos = index;
	            if (insertPos === -1) {
	                insertPos = this._children.length;
	            }

	            if (dragNode.getType() === _TabNode2.default.TYPE) {
	                this._addChild(dragNode, insertPos);
	            }

	            if (this.getSelected() !== -1) {
	                // already open
	                this._setSelected(insertPos);
	            }

	            this._model._tidy();
	        }
	    }, {
	        key: "_toJson",
	        value: function _toJson() {
	            var json = {};
	            attributeDefinitions.toJson(json, this._attributes);
	            json.location = this._location.getName();
	            json.children = this._children.map(function (child) {
	                return child._toJson();
	            });
	            return json;
	        }
	    }, {
	        key: "_getSplitterBounds",
	        value: function _getSplitterBounds(splitter) {
	            var pBounds = [0, 0];
	            var outerRect = this._model._getOuterInnerRects().outer;
	            var innerRect = this._model._getOuterInnerRects().inner;
	            if (this._location === _DockLocation2.default.TOP) {
	                pBounds[0] = outerRect.y;
	                pBounds[1] = innerRect.getBottom() - splitter.getHeight();
	            } else if (this._location === _DockLocation2.default.LEFT) {
	                pBounds[0] = outerRect.x;
	                pBounds[1] = innerRect.getRight() - splitter.getWidth();
	            } else if (this._location === _DockLocation2.default.BOTTOM) {
	                pBounds[0] = innerRect.y;
	                pBounds[1] = outerRect.getBottom() - splitter.getHeight();
	            } else if (this._location === _DockLocation2.default.RIGHT) {
	                pBounds[0] = innerRect.x;
	                pBounds[1] = outerRect.getRight() - splitter.getWidth();
	            }
	            return pBounds;
	        }
	    }, {
	        key: "_calculateSplit",
	        value: function _calculateSplit(splitter, splitterPos) {
	            var pBounds = this._getSplitterBounds(splitter);
	            if (this._location == _DockLocation2.default.BOTTOM || this._location == _DockLocation2.default.RIGHT) {
	                return Math.max(0, pBounds[1] - splitterPos);
	            } else {
	                return Math.max(0, splitterPos - pBounds[0]);
	            }
	        }
	    }, {
	        key: "_getAttributeDefinitions",
	        value: function _getAttributeDefinitions() {
	            return attributeDefinitions;
	        }
	    }], [{
	        key: "_fromJson",
	        value: function _fromJson(json, model) {

	            var location = _DockLocation2.default.getByName(json.location);
	            var border = new BorderNode(location, json, model);
	            if (json.children) {
	                border._children = json.children.map(function (jsonChild) {
	                    var child = _TabNode2.default._fromJson(jsonChild, model);
	                    child._parent = border;
	                    return child;
	                });
	            }

	            return border;
	        }
	    }]);

	    return BorderNode;
	}(_Node3.default);

	BorderNode.TYPE = "border";

	var attributeDefinitions = new _AttributeDefinitions2.default();
	attributeDefinitions.add("type", BorderNode.TYPE, true);

	attributeDefinitions.add("size", 200);
	attributeDefinitions.add("selected", -1);
	attributeDefinitions.add("show", true).setType(_Attribute2.default.BOOLEAN);

	attributeDefinitions.addInherited("barSize", "borderBarSize").setType(_Attribute2.default.INT).setFrom(0);
	attributeDefinitions.addInherited("enableDrop", "borderEnableDrop").setType(_Attribute2.default.BOOLEAN);
	attributeDefinitions.addInherited("className", "borderClassName").setType(_Attribute2.default.STRING);

	exports.default = BorderNode;

/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _Attribute = __webpack_require__(19);

	var _Attribute2 = _interopRequireDefault(_Attribute);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var AttributeDefinitions = function () {
	    function AttributeDefinitions() {
	        _classCallCheck(this, AttributeDefinitions);

	        this.attributes = [];
	        this.nameToAttribute = {};
	    }

	    _createClass(AttributeDefinitions, [{
	        key: "addWithAll",
	        value: function addWithAll(name, modelName, defaultValue, alwaysWriteJson) {
	            var attr = new _Attribute2.default(name, modelName, defaultValue, alwaysWriteJson);
	            this.attributes.push(attr);
	            this.nameToAttribute[name] = attr;
	            return attr;
	        }
	    }, {
	        key: "addInherited",
	        value: function addInherited(name, modelName) {
	            return this.addWithAll(name, modelName, undefined, false);
	        }
	    }, {
	        key: "add",
	        value: function add(name, defaultValue, alwaysWriteJson) {
	            return this.addWithAll(name, null, defaultValue, alwaysWriteJson);
	        }
	    }, {
	        key: "getAttributes",
	        value: function getAttributes() {
	            return this.attributes;
	        }
	    }, {
	        key: "getModelName",
	        value: function getModelName(name) {
	            var conversion = this.nameToAttribute[name];
	            if (conversion != null) {
	                return conversion.modelName;
	            } else {
	                return null;
	            }
	        }
	    }, {
	        key: "toJson",
	        value: function toJson(jsonObj, obj) {
	            this.attributes.forEach(function (attr) {
	                var fromValue = obj[attr.name];
	                if (attr.alwaysWriteJson || fromValue !== attr.defaultValue) {
	                    jsonObj[attr.name] = fromValue;
	                }
	            });
	        }
	    }, {
	        key: "fromJson",
	        value: function fromJson(jsonObj, obj) {
	            this.attributes.forEach(function (attr) {
	                var fromValue = jsonObj[attr.name];
	                if (fromValue === undefined) {
	                    obj[attr.name] = attr.defaultValue;
	                } else {
	                    obj[attr.name] = fromValue;
	                }
	            });
	        }
	    }, {
	        key: "update",
	        value: function update(jsonObj, obj) {
	            this.attributes.forEach(function (attr) {

	                var fromValue = jsonObj[attr.name];
	                if (fromValue !== undefined) {
	                    obj[attr.name] = fromValue;
	                }
	            });
	        }
	    }, {
	        key: "setDefaults",
	        value: function setDefaults(obj) {
	            this.attributes.forEach(function (attr) {
	                obj[attr.name] = attr.defaultValue;
	            });
	        }
	    }]);

	    return AttributeDefinitions;
	}();

	exports.default = AttributeDefinitions;

/***/ }),
/* 19 */
/***/ (function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Attribute = function () {
	    function Attribute(name, modelName, defaultValue, alwaysWriteJson) {
	        _classCallCheck(this, Attribute);

	        this.name = name;
	        this.modelName = modelName;
	        this.defaultValue = defaultValue;
	        this.alwaysWriteJson = alwaysWriteJson;

	        this.type = null;
	        this.values = [];
	        this.from = -99999999;
	        this.to = 99999999;
	    }

	    _createClass(Attribute, [{
	        key: "setType",
	        value: function setType(value) {
	            this.type = value;
	            return this;
	        }
	    }, {
	        key: "setValues",
	        value: function setValues() {
	            this.values = Array.from(arguments);
	            return this;
	        }
	    }, {
	        key: "setFrom",
	        value: function setFrom(value) {
	            this.from = value;
	            return this;
	        }
	    }, {
	        key: "setTo",
	        value: function setTo(value) {
	            this.to = value;
	            return this;
	        }
	    }]);

	    return Attribute;
	}();

	Attribute.ENUM = "Enum";
	Attribute.INT = "Int";
	Attribute.NUMBER = "Number";
	Attribute.STRING = "String";
	Attribute.BOOLEAN = "Boolean";
	Attribute.ID = "Id";
	Attribute.JSON = "Json";

	exports.default = Attribute;

/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _Rect = __webpack_require__(15);

	var _Rect2 = _interopRequireDefault(_Rect);

	var _Orientation = __webpack_require__(16);

	var _Orientation2 = _interopRequireDefault(_Orientation);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var values = {};

	var DockLocation = function () {
	    function DockLocation(name, orientation, indexPlus) {
	        _classCallCheck(this, DockLocation);

	        this._name = name;
	        this._orientation = orientation;
	        this._indexPlus = indexPlus;
	        values[this._name] = this;
	    }

	    _createClass(DockLocation, [{
	        key: "getName",
	        value: function getName() {
	            return this._name;
	        }
	    }, {
	        key: "getOrientation",
	        value: function getOrientation() {
	            return this._orientation;
	        }
	    }, {
	        key: "getDockRect",
	        value: function getDockRect(r) {
	            if (this === DockLocation.TOP) {
	                return new _Rect2.default(r.x, r.y, r.width, r.height / 2);
	            } else if (this === DockLocation.BOTTOM) {
	                return new _Rect2.default(r.x, r.getBottom() - r.height / 2, r.width, r.height / 2);
	            }
	            if (this === DockLocation.LEFT) {
	                return new _Rect2.default(r.x, r.y, r.width / 2, r.height);
	            } else if (this === DockLocation.RIGHT) {
	                return new _Rect2.default(r.getRight() - r.width / 2, r.y, r.width / 2, r.height);
	            } else {
	                return r.clone();
	            }
	        }
	    }, {
	        key: "split",
	        value: function split(rect, size) {
	            if (this === DockLocation.TOP) {
	                var r1 = new _Rect2.default(rect.x, rect.y, rect.width, size);
	                var r2 = new _Rect2.default(rect.x, rect.y + size, rect.width, rect.height - size);
	                return { start: r1, end: r2 };
	            } else if (this === DockLocation.LEFT) {
	                var _r = new _Rect2.default(rect.x, rect.y, size, rect.height);
	                var _r2 = new _Rect2.default(rect.x + size, rect.y, rect.width - size, rect.height);
	                return { start: _r, end: _r2 };
	            }
	            if (this === DockLocation.RIGHT) {
	                var _r3 = new _Rect2.default(rect.getRight() - size, rect.y, size, rect.height);
	                var _r4 = new _Rect2.default(rect.x, rect.y, rect.width - size, rect.height);
	                return { start: _r3, end: _r4 };
	            } else if (this === DockLocation.BOTTOM) {
	                var _r5 = new _Rect2.default(rect.x, rect.getBottom() - size, rect.width, size);
	                var _r6 = new _Rect2.default(rect.x, rect.y, rect.width, rect.height - size);
	                return { start: _r5, end: _r6 };
	            }
	        }
	    }, {
	        key: "reflect",
	        value: function reflect() {
	            if (this === DockLocation.TOP) {
	                return DockLocation.BOTTOM;
	            } else if (this === DockLocation.LEFT) {
	                return DockLocation.RIGHT;
	            }
	            if (this === DockLocation.RIGHT) {
	                return DockLocation.LEFT;
	            } else if (this === DockLocation.BOTTOM) {
	                return DockLocation.TOP;
	            }
	        }
	    }, {
	        key: "toString",
	        value: function toString() {
	            return "(DockLocation: name=" + this._name + ", orientation=" + this._orientation + ")";
	        }
	    }], [{
	        key: "getByName",
	        value: function getByName(name) {
	            return values[name];
	        }
	    }, {
	        key: "getLocation",
	        value: function getLocation(rect, x, y) {
	            if (x < rect.x + rect.width / 4) {
	                return DockLocation.LEFT;
	            } else if (x > rect.getRight() - rect.width / 4) {
	                return DockLocation.RIGHT;
	            } else if (y < rect.y + rect.height / 4) {
	                return DockLocation.TOP;
	            } else if (y > rect.getBottom() - rect.height / 4) {
	                return DockLocation.BOTTOM;
	            } else {
	                return DockLocation.CENTER;
	            }
	        }
	    }]);

	    return DockLocation;
	}();

	// statics


	DockLocation.TOP = new DockLocation("top", _Orientation2.default.VERT, 0);
	DockLocation.BOTTOM = new DockLocation("bottom", _Orientation2.default.VERT, 1);
	DockLocation.LEFT = new DockLocation("left", _Orientation2.default.HORZ, 0);
	DockLocation.RIGHT = new DockLocation("right", _Orientation2.default.HORZ, 1);
	DockLocation.CENTER = new DockLocation("center", _Orientation2.default.VERT, 0);

	exports.default = DockLocation;

/***/ }),
/* 21 */
/***/ (function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var DropInfo = function DropInfo(node, rect, location, index, className) {
	    _classCallCheck(this, DropInfo);

	    this.node = node;
	    this.rect = rect;
	    this.location = location;
	    this.index = index;
	    this.className = className;
	};

	exports.default = DropInfo;

/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _Rect = __webpack_require__(15);

	var _Rect2 = _interopRequireDefault(_Rect);

	var _Orientation = __webpack_require__(16);

	var _Orientation2 = _interopRequireDefault(_Orientation);

	var _DockLocation = __webpack_require__(20);

	var _DockLocation2 = _interopRequireDefault(_DockLocation);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Node = function () {
	    function Node(model) {
	        _classCallCheck(this, Node);

	        this._model = model;
	        this._attributes = {};
	        this._parent = null;
	        this._children = [];
	        this._fixed = false;
	        this._rect = new _Rect2.default();
	        this._visible = false;
	        this._listeners = {};
	    }

	    _createClass(Node, [{
	        key: "getId",
	        value: function getId() {
	            return this._attributes["id"];
	        }
	    }, {
	        key: "getModel",
	        value: function getModel() {
	            return this._model;
	        }
	    }, {
	        key: "getType",
	        value: function getType() {
	            return this._attributes["type"];
	        }
	    }, {
	        key: "getParent",
	        value: function getParent() {
	            return this._parent;
	        }
	    }, {
	        key: "getChildren",
	        value: function getChildren() {
	            return this._children;
	        }
	    }, {
	        key: "getRect",
	        value: function getRect() {
	            return this._rect;
	        }
	    }, {
	        key: "isVisible",
	        value: function isVisible() {
	            return this._visible;
	        }
	    }, {
	        key: "getOrientation",
	        value: function getOrientation() {
	            if (this._parent == null) {
	                return _Orientation2.default.HORZ;
	            } else {
	                return _Orientation2.default.flip(this._parent.getOrientation());
	            }
	        }

	        // event can be: resize, visibility, maximize (on tabset), close

	    }, {
	        key: "setEventListener",
	        value: function setEventListener(event, callback) {
	            this._listeners[event] = callback;
	        }
	    }, {
	        key: "removeEventListener",
	        value: function removeEventListener(event) {
	            delete this._listeners[event];
	        }
	    }, {
	        key: "_setId",
	        value: function _setId(id) {
	            this._attributes["id"] = id;
	        }
	    }, {
	        key: "_fireEvent",
	        value: function _fireEvent(event, params) {
	            //console.log(this._type, " fireEvent " + event + " " + JSON.stringify(params));
	            if (this._listeners[event] != null) {
	                this._listeners[event](params);
	            }
	        }
	    }, {
	        key: "_getAttr",
	        value: function _getAttr(name) {
	            var val = this._attributes[name];

	            if (val === undefined) {
	                var modelName = this._getAttributeDefinitions().getModelName(name);
	                if (modelName != null) {
	                    val = this._model._attributes[modelName];
	                }
	            }

	            //console.log(name + "=" + val);
	            return val;
	        }
	    }, {
	        key: "_forEachNode",
	        value: function _forEachNode(fn, level) {
	            fn(this, level);
	            level++;
	            this._children.forEach(function (node) {
	                node._forEachNode(fn, level);
	            });
	        }
	    }, {
	        key: "_getPrefSize",
	        value: function _getPrefSize(orientation) {
	            var prefSize = this.getWidth();
	            if (orientation === _Orientation2.default.VERT) {
	                prefSize = this.getHeight();
	            }
	            return prefSize;
	        }
	    }, {
	        key: "_setVisible",
	        value: function _setVisible(visible) {
	            if (visible != this._visible) {
	                this._fireEvent("visibility", { visible: visible });
	                this._visible = visible;
	            }
	        }
	    }, {
	        key: "_getDrawChildren",
	        value: function _getDrawChildren() {
	            return this._children;
	        }
	    }, {
	        key: "_layout",
	        value: function _layout(rect) {
	            this._rect = rect;
	        }
	    }, {
	        key: "_findDropTargetNode",
	        value: function _findDropTargetNode(dragNode, x, y) {
	            var rtn = null;
	            if (this._rect.contains(x, y)) {
	                rtn = this._canDrop(dragNode, x, y);
	                if (rtn == null) {
	                    if (this._children.length !== 0) {
	                        for (var i = 0; i < this._children.length; i++) {
	                            var child = this._children[i];
	                            rtn = child._findDropTargetNode(dragNode, x, y);
	                            if (rtn != null) {
	                                break;
	                            }
	                        }
	                    }
	                }
	            }

	            return rtn;
	        }
	    }, {
	        key: "_canDrop",
	        value: function _canDrop(dragNode, x, y) {
	            return null;
	        }
	    }, {
	        key: "_canDockInto",
	        value: function _canDockInto(dragNode, dropInfo) {
	            if (dropInfo != null) {
	                if (dropInfo.location === _DockLocation2.default.CENTER && dropInfo.node.isEnableDrop() === false) {
	                    return false;
	                }

	                // prevent named tabset docking into another tabset, since this would loose the header
	                if (dropInfo.location === _DockLocation2.default.CENTER && dragNode.getType() === "tabset" && dragNode.getName() !== null) {
	                    return false;
	                }

	                if (dropInfo.location !== _DockLocation2.default.CENTER && dropInfo.node.isEnableDivide() === false) {
	                    return false;
	                }

	                // finally check model callback to check if drop allowed
	                if (this._model._onAllowDrop) {
	                    return this._model._onAllowDrop(dragNode, dropInfo);
	                }
	            }
	            return true;
	        }
	    }, {
	        key: "_removeChild",
	        value: function _removeChild(childNode) {
	            var pos = this._children.indexOf(childNode);
	            if (pos !== -1) {
	                this._children.splice(pos, 1);
	            }
	            this._dirty = true;
	            return pos;
	        }
	    }, {
	        key: "_addChild",
	        value: function _addChild(childNode, pos) {
	            if (pos != undefined) {
	                this._children.splice(pos, 0, childNode);
	            } else {
	                this._children.push(childNode);
	                pos = this._children.length - 1;
	            }
	            childNode._parent = this;
	            this._dirty = true;
	            return pos;
	        }
	    }, {
	        key: "_removeAll",
	        value: function _removeAll() {
	            this._children = [];
	            this._dirty = true;
	        }
	    }, {
	        key: "_styleWithPosition",
	        value: function _styleWithPosition(style) {
	            if (style == undefined) {
	                style = {};
	            }
	            return this._rect.styleWithPosition(style);
	        }
	    }, {
	        key: "isEnableDivide",
	        value: function isEnableDivide() {
	            return true;
	        }

	        // implemented by subclasses

	    }, {
	        key: "_updateAttrs",
	        value: function _updateAttrs(json) {}

	        // implemented by subclasses

	    }, {
	        key: "_getAttributeDefinitions",
	        value: function _getAttributeDefinitions() {
	            return null;
	        }
	    }, {
	        key: "_toStringIndented",
	        value: function _toStringIndented(lines, indent) {
	            lines.push(indent + this.getType() + " " + this.getWeight().toFixed(2) + " " + this.getId());
	            indent = indent + "\t";
	            this._children.forEach(function (child) {
	                child._toStringIndented(lines, indent);
	            });
	        }
	    }, {
	        key: "_toAttributeString",
	        value: function _toAttributeString() {
	            return JSON.stringify(this._attributes, null, "\t");
	        }
	    }]);

	    return Node;
	}();

	exports.default = Node;

/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _Node2 = __webpack_require__(22);

	var _Node3 = _interopRequireDefault(_Node2);

	var _AttributeDefinitions = __webpack_require__(18);

	var _AttributeDefinitions2 = _interopRequireDefault(_AttributeDefinitions);

	var _Attribute = __webpack_require__(19);

	var _Attribute2 = _interopRequireDefault(_Attribute);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var TabNode = function (_Node) {
	    _inherits(TabNode, _Node);

	    function TabNode(model, json) {
	        _classCallCheck(this, TabNode);

	        var _this = _possibleConstructorReturn(this, (TabNode.__proto__ || Object.getPrototypeOf(TabNode)).call(this, model));

	        _this._tabRect = null; // rect of the tab rather than the tab contents=
	        _this._extra = {}; // extra data added to node not saved in json

	        attributeDefinitions.fromJson(json, _this._attributes);
	        model._addNode(_this);
	        return _this;
	    }

	    _createClass(TabNode, [{
	        key: "getTabRect",
	        value: function getTabRect() {
	            return this._tabRect;
	        }
	    }, {
	        key: "setTabRect",
	        value: function setTabRect(rect) {
	            this._tabRect = rect;
	        }
	    }, {
	        key: "getName",
	        value: function getName() {
	            return this._attributes["name"];
	        }
	    }, {
	        key: "getComponent",
	        value: function getComponent() {
	            return this._attributes["component"];
	        }
	    }, {
	        key: "getConfig",
	        value: function getConfig() {
	            return this._attributes["config"];
	        }
	    }, {
	        key: "getExtraData",
	        value: function getExtraData() {
	            return this._extra;
	        }
	    }, {
	        key: "getIcon",
	        value: function getIcon() {
	            return this._attributes["icon"];
	        }
	    }, {
	        key: "isEnableClose",
	        value: function isEnableClose() {
	            return this._getAttr("enableClose");
	        }
	    }, {
	        key: "isEnableDrag",
	        value: function isEnableDrag() {
	            return this._getAttr("enableDrag");
	        }
	    }, {
	        key: "isEnableRename",
	        value: function isEnableRename() {
	            return this._getAttr("enableRename");
	        }
	    }, {
	        key: "getClassName",
	        value: function getClassName() {
	            return this._getAttr("className");
	        }
	    }, {
	        key: "_setName",
	        value: function _setName(name) {
	            this._attributes["name"] = name;
	        }
	    }, {
	        key: "_layout",
	        value: function _layout(rect) {
	            if (!rect.equals(this._rect)) {
	                this._fireEvent("resize", { rect: rect });
	            }
	            this._rect = rect;
	        }
	    }, {
	        key: "_delete",
	        value: function _delete() {
	            this._parent._remove(this);
	            this._fireEvent("close", {});
	        }
	    }, {
	        key: "_toJson",
	        value: function _toJson() {
	            var json = {};
	            attributeDefinitions.toJson(json, this._attributes);
	            return json;
	        }
	    }, {
	        key: "_updateAttrs",
	        value: function _updateAttrs(json) {
	            attributeDefinitions.update(json, this._attributes);
	        }
	    }, {
	        key: "_getAttributeDefinitions",
	        value: function _getAttributeDefinitions() {
	            return attributeDefinitions;
	        }
	    }], [{
	        key: "_fromJson",
	        value: function _fromJson(json, model) {
	            var newLayoutNode = new TabNode(model, json);
	            return newLayoutNode;
	        }
	    }]);

	    return TabNode;
	}(_Node3.default);

	TabNode.TYPE = "tab";

	var attributeDefinitions = new _AttributeDefinitions2.default();
	attributeDefinitions.add("type", TabNode.TYPE, true);
	attributeDefinitions.add("id", null).setType(_Attribute2.default.ID);

	attributeDefinitions.add("name", null).setType(_Attribute2.default.STRING);
	attributeDefinitions.add("component", null).setType(_Attribute2.default.STRING);
	attributeDefinitions.add("config", null).setType(_Attribute2.default.JSON);

	attributeDefinitions.addInherited("enableClose", "tabEnableClose").setType(_Attribute2.default.BOOLEAN);
	attributeDefinitions.addInherited("enableDrag", "tabEnableDrag").setType(_Attribute2.default.BOOLEAN);
	attributeDefinitions.addInherited("enableRename", "tabEnableRename").setType(_Attribute2.default.BOOLEAN);
	attributeDefinitions.addInherited("className", "tabClassName").setType(_Attribute2.default.STRING);
	attributeDefinitions.addInherited("icon", "tabIcon").setType(_Attribute2.default.STRING);

	exports.default = TabNode;

/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _Rect = __webpack_require__(15);

	var _Rect2 = _interopRequireDefault(_Rect);

	var _AttributeDefinitions = __webpack_require__(18);

	var _AttributeDefinitions2 = _interopRequireDefault(_AttributeDefinitions);

	var _Attribute = __webpack_require__(19);

	var _Attribute2 = _interopRequireDefault(_Attribute);

	var _DockLocation = __webpack_require__(20);

	var _DockLocation2 = _interopRequireDefault(_DockLocation);

	var _DropInfo = __webpack_require__(21);

	var _DropInfo2 = _interopRequireDefault(_DropInfo);

	var _Node2 = __webpack_require__(22);

	var _Node3 = _interopRequireDefault(_Node2);

	var _TabNode = __webpack_require__(23);

	var _TabNode2 = _interopRequireDefault(_TabNode);

	var _RowNode = __webpack_require__(25);

	var _RowNode2 = _interopRequireDefault(_RowNode);

	var _BorderNode = __webpack_require__(17);

	var _BorderNode2 = _interopRequireDefault(_BorderNode);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var TabSetNode = function (_Node) {
	    _inherits(TabSetNode, _Node);

	    function TabSetNode(model, json) {
	        _classCallCheck(this, TabSetNode);

	        var _this = _possibleConstructorReturn(this, (TabSetNode.__proto__ || Object.getPrototypeOf(TabSetNode)).call(this, model));

	        _this._contentRect = null;
	        _this._headerRect = null;
	        _this._tabHeaderRect = null;

	        attributeDefinitions.fromJson(json, _this._attributes);
	        model._addNode(_this);
	        return _this;
	    }

	    _createClass(TabSetNode, [{
	        key: "getName",
	        value: function getName() {
	            return this._attributes["name"];
	        }
	    }, {
	        key: "getSelected",
	        value: function getSelected() {
	            return this._attributes["selected"];
	        }
	    }, {
	        key: "getSelectedNode",
	        value: function getSelectedNode() {
	            var selected = this.getSelected();
	            if (selected != -1) {
	                return this._children[selected];
	            }
	            return null;
	        }
	    }, {
	        key: "getWeight",
	        value: function getWeight() {
	            return this._attributes["weight"];
	        }
	    }, {
	        key: "getWidth",
	        value: function getWidth() {
	            return this._attributes["width"];
	        }
	    }, {
	        key: "getHeight",
	        value: function getHeight() {
	            return this._attributes["height"];
	        }
	    }, {
	        key: "isMaximized",
	        value: function isMaximized() {
	            return this._model.getMaximizedTabset() === this;
	        }
	    }, {
	        key: "isActive",
	        value: function isActive() {
	            return this._model.getActiveTabset() === this;
	        }
	    }, {
	        key: "isEnableDeleteWhenEmpty",
	        value: function isEnableDeleteWhenEmpty() {
	            return this._getAttr("enableDeleteWhenEmpty");
	        }
	    }, {
	        key: "isEnableClose",
	        value: function isEnableClose() {
	            return this._getAttr("enableClose");
	        }
	    }, {
	        key: "isEnableDrop",
	        value: function isEnableDrop() {
	            return this._getAttr("enableDrop");
	        }
	    }, {
	        key: "isEnableDrag",
	        value: function isEnableDrag() {
	            return this._getAttr("enableDrag");
	        }
	    }, {
	        key: "isEnableDivide",
	        value: function isEnableDivide() {
	            return this._getAttr("enableDivide");
	        }
	    }, {
	        key: "isEnableMaximize",
	        value: function isEnableMaximize() {
	            return this._getAttr("enableMaximize");
	        }
	    }, {
	        key: "isEnableTabStrip",
	        value: function isEnableTabStrip() {
	            return this._getAttr("enableTabStrip");
	        }
	    }, {
	        key: "getClassNameTabStrip",
	        value: function getClassNameTabStrip() {
	            return this._getAttr("classNameTabStrip");
	        }
	    }, {
	        key: "getClassNameHeader",
	        value: function getClassNameHeader() {
	            return this._getAttr("classNameHeader");
	        }
	    }, {
	        key: "getHeaderHeight",
	        value: function getHeaderHeight() {
	            return this._getAttr("headerHeight");
	        }
	    }, {
	        key: "getTabStripHeight",
	        value: function getTabStripHeight() {
	            return this._getAttr("tabStripHeight");
	        }
	    }, {
	        key: "_setWeight",
	        value: function _setWeight(weight) {
	            this._attributes["weight"] = weight;
	        }
	    }, {
	        key: "_setSelected",
	        value: function _setSelected(index) {
	            this._attributes["selected"] = index;
	        }
	    }, {
	        key: "_canDrop",
	        value: function _canDrop(dragNode, x, y) {
	            var dropInfo = null;

	            if (dragNode === this) {
	                var dockLocation = _DockLocation2.default.CENTER;
	                var outlineRect = this._tabHeaderRect;
	                dropInfo = new _DropInfo2.default(this, outlineRect, dockLocation, -1, "flexlayout__outline_rect");
	            } else if (this._contentRect.contains(x, y)) {
	                var _dockLocation = _DockLocation2.default.getLocation(this._contentRect, x, y);
	                var _outlineRect = _dockLocation.getDockRect(this._rect);
	                dropInfo = new _DropInfo2.default(this, _outlineRect, _dockLocation, -1, "flexlayout__outline_rect");
	            } else if (this._children.length > 0 && this._tabHeaderRect != null && this._tabHeaderRect.contains(x, y)) {
	                var child = this._children[0];
	                var r = child._tabRect;
	                var yy = r.y;
	                var h = r.height;
	                var p = this._tabHeaderRect.x;
	                var childCenter = 0;
	                for (var i = 0; i < this._children.length; i++) {
	                    child = this._children[i];
	                    r = child._tabRect;
	                    childCenter = r.x + r.width / 2;
	                    if (x >= p && x < childCenter) {
	                        var _dockLocation2 = _DockLocation2.default.CENTER;
	                        var _outlineRect2 = new _Rect2.default(r.x - 2, yy, 3, h);
	                        dropInfo = new _DropInfo2.default(this, _outlineRect2, _dockLocation2, i, "flexlayout__outline_rect");
	                        break;
	                    }
	                    p = childCenter;
	                }
	                if (dropInfo == null) {
	                    var _dockLocation3 = _DockLocation2.default.CENTER;
	                    var _outlineRect3 = new _Rect2.default(r.getRight() - 2, yy, 3, h);
	                    dropInfo = new _DropInfo2.default(this, _outlineRect3, _dockLocation3, this._children.length, "flexlayout__outline_rect");
	                }
	            }

	            if (!dragNode._canDockInto(dragNode, dropInfo)) {
	                return null;
	            }

	            return dropInfo;
	        }
	    }, {
	        key: "_layout",
	        value: function _layout(rect) {
	            var _this2 = this;

	            if (this.isMaximized()) {
	                rect = this._model._root._rect;
	            }
	            this._rect = rect;

	            var showHeader = this.getName() != null;
	            var y = 0;
	            if (showHeader) {
	                this._headerRect = new _Rect2.default(rect.x, rect.y, rect.width, this.getHeaderHeight());
	                y += this.getHeaderHeight();
	            }
	            if (this.isEnableTabStrip()) {
	                this._tabHeaderRect = new _Rect2.default(rect.x, rect.y + y, rect.width, this.getTabStripHeight());
	                y += this.getTabStripHeight();
	            }
	            this._contentRect = new _Rect2.default(rect.x, rect.y + y, rect.width, rect.height - y);

	            this._children.forEach(function (child, i) {
	                child._layout(_this2._contentRect);
	                child._setVisible(i === _this2.getSelected());
	            });
	        }
	    }, {
	        key: "_remove",
	        value: function _remove(node) {
	            this._removeChild(node);
	            this._model._tidy();
	            this._setSelected(Math.max(0, this.getSelected() - 1));
	        }
	    }, {
	        key: "_drop",
	        value: function _drop(dragNode, location, index) {
	            var _this3 = this;

	            var dockLocation = location;

	            if (this === dragNode) {
	                // tabset drop into itself
	                return; // dock back to itself
	            }

	            var selectedNode = null;
	            var fromIndex = 0;
	            if (dragNode._parent != null) {
	                selectedNode = dragNode._parent.getSelectedNode;
	                fromIndex = dragNode._parent._removeChild(dragNode);
	            }
	            //console.log("removed child: " + fromIndex);

	            // if dropping a tab back to same tabset and moving to forward position then reduce insertion index
	            if (dragNode.getType() === _TabNode2.default.TYPE && dragNode._parent === this && fromIndex < index && index > 0) {
	                index--;
	            }

	            // for the tabset/border being removed from set the selected index
	            if (dragNode._parent !== null) {
	                if (dragNode._parent.getType() === TabSetNode.TYPE) {
	                    dragNode._parent._setSelected(0);
	                } else if (dragNode._parent.getType() === _BorderNode2.default.TYPE) {
	                    if (dragNode._parent.getSelected() != -1) {
	                        if (fromIndex === dragNode._parent.getSelected() && dragNode._parent._children.length > 0) {
	                            dragNode._parent._setSelected(0);
	                        } else if (fromIndex < dragNode._parent.getSelected()) {
	                            dragNode._parent._setSelected(dragNode._parent.getSelected() - 1);
	                        } else if (fromIndex > dragNode._parent.getSelected()) {
	                            // leave selected index as is
	                        } else {
	                            dragNode._parent._setSelected(-1);
	                        }
	                    }
	                }
	            }

	            // simple_bundled dock to existing tabset
	            if (dockLocation === _DockLocation2.default.CENTER) {
	                var insertPos = index;
	                if (insertPos === -1) {
	                    insertPos = this._children.length;
	                }

	                if (dragNode.getType() === _TabNode2.default.TYPE) {
	                    this._addChild(dragNode, insertPos);
	                    this._setSelected(insertPos);
	                    //console.log("added child at : " + insertPos);
	                } else {
	                    dragNode._children.forEach(function (child, i) {
	                        _this3._addChild(child, insertPos);
	                        //console.log("added child at : " + insertPos);
	                        insertPos++;
	                    });
	                }
	                this._model._activeTabSet = this;
	            } else {
	                var tabSet = null;
	                if (dragNode.getType() === _TabNode2.default.TYPE) {
	                    // create new tabset parent
	                    //console.log("create a new tabset");
	                    tabSet = new TabSetNode(this._model, {});
	                    tabSet._addChild(dragNode);
	                    //console.log("added child at end");
	                    dragNode._parent = tabSet;
	                } else {
	                    tabSet = dragNode;
	                }

	                var parentRow = this._parent;
	                var pos = parentRow._children.indexOf(this);

	                if (parentRow.getOrientation() === dockLocation._orientation) {
	                    tabSet._setWeight(this.getWeight() / 2);
	                    this._setWeight(this.getWeight() / 2);
	                    //console.log("added child 50% size at: " +  pos + dockLocation.indexPlus);
	                    parentRow._addChild(tabSet, pos + dockLocation._indexPlus);
	                } else {
	                    // create a new row to host the new tabset (it will go in the opposite direction)
	                    //console.log("create a new row");
	                    var newRow = new _RowNode2.default(this._model, {});
	                    newRow._setWeight(this.getWeight());
	                    newRow._addChild(this);
	                    this._setWeight(50);
	                    tabSet._setWeight(50);
	                    //console.log("added child 50% size at: " +  dockLocation.indexPlus);
	                    newRow._addChild(tabSet, dockLocation._indexPlus);

	                    parentRow._removeChild(this);
	                    parentRow._addChild(newRow, pos);
	                }
	                this._model._activeTabSet = tabSet;
	            }
	            this._model._tidy();
	        }
	    }, {
	        key: "_toJson",
	        value: function _toJson() {
	            var json = {};
	            attributeDefinitions.toJson(json, this._attributes);
	            json.children = this._children.map(function (child) {
	                return child._toJson();
	            });

	            if (this.isActive()) {
	                json.active = true;
	            }

	            if (this.isMaximized()) {
	                json.maximized = true;
	            }

	            return json;
	        }
	    }, {
	        key: "_updateAttrs",
	        value: function _updateAttrs(json) {
	            attributeDefinitions.update(json, this._attributes);
	        }
	    }, {
	        key: "_getAttributeDefinitions",
	        value: function _getAttributeDefinitions() {
	            return attributeDefinitions;
	        }
	    }], [{
	        key: "_fromJson",
	        value: function _fromJson(json, model) {
	            var newLayoutNode = new TabSetNode(model, json);

	            if (json.children != undefined) {
	                json.children.forEach(function (jsonChild) {
	                    var child = _TabNode2.default._fromJson(jsonChild, model);
	                    newLayoutNode._addChild(child);
	                });
	            }

	            if (json.maximized && json.maximized == true) {
	                model._setMaximizedTabset(newLayoutNode);
	            }

	            if (json.active && json.active == true) {
	                model._setActiveTabset(newLayoutNode);
	            }

	            return newLayoutNode;
	        }
	    }]);

	    return TabSetNode;
	}(_Node3.default);

	TabSetNode.TYPE = "tabset";

	var attributeDefinitions = new _AttributeDefinitions2.default();
	attributeDefinitions.add("type", TabSetNode.TYPE, true);
	attributeDefinitions.add("id", null).setType(_Attribute2.default.ID);

	attributeDefinitions.add("weight", 100);
	attributeDefinitions.add("width", null);
	attributeDefinitions.add("height", null);
	attributeDefinitions.add("selected", 0);
	attributeDefinitions.add("name", null).setType(_Attribute2.default.STRING);

	attributeDefinitions.addInherited("enableDeleteWhenEmpty", "tabSetEnableDeleteWhenEmpty");
	attributeDefinitions.addInherited("enableClose", "tabSetEnableClose");
	attributeDefinitions.addInherited("enableDrop", "tabSetEnableDrop");
	attributeDefinitions.addInherited("enableDrag", "tabSetEnableDrag");
	attributeDefinitions.addInherited("enableDivide", "tabSetEnableDivide");
	attributeDefinitions.addInherited("enableMaximize", "tabSetEnableMaximize");
	attributeDefinitions.addInherited("classNameTabStrip", "tabSetClassNameTabStrip");
	attributeDefinitions.addInherited("classNameHeader", "tabSetClassNameHeader");
	attributeDefinitions.addInherited("enableTabStrip", "tabSetEnableTabStrip");

	attributeDefinitions.addInherited("headerHeight", "tabSetHeaderHeight");
	attributeDefinitions.addInherited("tabStripHeight", "tabSetTabStripHeight");

	exports.default = TabSetNode;

/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

	var _Rect = __webpack_require__(15);

	var _Rect2 = _interopRequireDefault(_Rect);

	var _AttributeDefinitions = __webpack_require__(18);

	var _AttributeDefinitions2 = _interopRequireDefault(_AttributeDefinitions);

	var _Orientation = __webpack_require__(16);

	var _Orientation2 = _interopRequireDefault(_Orientation);

	var _DockLocation = __webpack_require__(20);

	var _DockLocation2 = _interopRequireDefault(_DockLocation);

	var _SplitterNode = __webpack_require__(26);

	var _SplitterNode2 = _interopRequireDefault(_SplitterNode);

	var _Node2 = __webpack_require__(22);

	var _Node3 = _interopRequireDefault(_Node2);

	var _TabSetNode = __webpack_require__(24);

	var _TabSetNode2 = _interopRequireDefault(_TabSetNode);

	var _BorderNode = __webpack_require__(17);

	var _BorderNode2 = _interopRequireDefault(_BorderNode);

	var _DropInfo = __webpack_require__(21);

	var _DropInfo2 = _interopRequireDefault(_DropInfo);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var RowNode = function (_Node) {
	    _inherits(RowNode, _Node);

	    function RowNode(model, json) {
	        _classCallCheck(this, RowNode);

	        var _this = _possibleConstructorReturn(this, (RowNode.__proto__ || Object.getPrototypeOf(RowNode)).call(this, model));

	        _this._dirty = true;
	        _this._drawChildren = [];
	        attributeDefinitions.fromJson(json, _this._attributes);
	        model._addNode(_this);
	        return _this;
	    }

	    _createClass(RowNode, [{
	        key: "getWeight",
	        value: function getWeight() {
	            return this._attributes["weight"];
	        }
	    }, {
	        key: "getWidth",
	        value: function getWidth() {
	            return this._attributes["width"];
	        }
	    }, {
	        key: "getHeight",
	        value: function getHeight() {
	            return this._attributes["height"];
	        }
	    }, {
	        key: "_setWeight",
	        value: function _setWeight(weight) {
	            this._attributes["weight"] = weight;
	        }
	    }, {
	        key: "_layout",
	        value: function _layout(rect) {
	            _get(RowNode.prototype.__proto__ || Object.getPrototypeOf(RowNode.prototype), "_layout", this).call(this, rect);

	            var pixelSize = this._rect._getSize(this.getOrientation());

	            var totalWeight = 0;
	            var fixedPixels = 0;
	            var prefPixels = 0;
	            var numVariable = 0;
	            var totalPrefWeight = 0;
	            var drawChildren = this._getDrawChildren();

	            for (var i = 0; i < drawChildren.length; i++) {
	                var child = drawChildren[i];
	                var prefSize = child._getPrefSize(this.getOrientation());
	                if (child._fixed) {
	                    fixedPixels += prefSize;
	                } else {
	                    if (prefSize == null) {
	                        totalWeight += child.getWeight();
	                    } else {
	                        prefPixels += prefSize;
	                        totalPrefWeight += child.getWeight();
	                    }
	                    numVariable++;
	                }
	            }

	            var resizePreferred = false;
	            var availablePixels = pixelSize - fixedPixels - prefPixels;
	            if (availablePixels < 0) {
	                availablePixels = pixelSize - fixedPixels;
	                resizePreferred = true;
	                totalWeight += totalPrefWeight;
	            }

	            // assign actual pixel sizes
	            var totalSizeGiven = 0;
	            var variableSize = 0;
	            for (var _i = 0; _i < drawChildren.length; _i++) {
	                var _child = drawChildren[_i];
	                var _prefSize = _child._getPrefSize(this.getOrientation());
	                if (_child._fixed) {
	                    _child.tempsize = _prefSize;
	                } else {
	                    if (_prefSize == null || resizePreferred) {
	                        if (totalWeight === 0) {
	                            _child.tempsize = 0;
	                        } else {
	                            _child.tempsize = Math.floor(availablePixels * (_child.getWeight() / totalWeight));
	                        }
	                        variableSize += _child.tempsize;
	                    } else {
	                        _child.tempsize = _prefSize;
	                    }
	                }

	                totalSizeGiven += _child.tempsize;
	            }

	            // adjust sizes to exactly fit
	            if (variableSize > 0) {
	                while (totalSizeGiven < pixelSize) {
	                    for (var _i2 = 0; _i2 < drawChildren.length; _i2++) {
	                        var _child2 = drawChildren[_i2];
	                        var _prefSize2 = _child2._getPrefSize(this.getOrientation());
	                        if (!_child2._fixed && (_prefSize2 == null || resizePreferred) && totalSizeGiven < pixelSize) {
	                            _child2.tempsize++;
	                            totalSizeGiven++;
	                        }
	                    }
	                }
	            }

	            var childOrientation = _Orientation2.default.flip(this.getOrientation());

	            // layout children
	            var p = 0;
	            for (var _i3 = 0; _i3 < drawChildren.length; _i3++) {
	                var _child3 = drawChildren[_i3];

	                if (this.getOrientation() === _Orientation2.default.HORZ) {
	                    _child3._layout(new _Rect2.default(this._rect.x + p, this._rect.y, _child3.tempsize, this._rect.height));
	                } else {
	                    _child3._layout(new _Rect2.default(this._rect.x, this._rect.y + p, this._rect.width, _child3.tempsize));
	                }
	                p += _child3.tempsize;
	            }

	            return true;
	        }
	    }, {
	        key: "_getSplitterBounds",
	        value: function _getSplitterBounds(splitterNode) {
	            var pBounds = [0, 0];
	            var drawChildren = this._getDrawChildren();
	            var p = drawChildren.indexOf(splitterNode);
	            if (this.getOrientation() === _Orientation2.default.HORZ) {
	                pBounds[0] = drawChildren[p - 1]._rect.x;
	                pBounds[1] = drawChildren[p + 1]._rect.getRight() - splitterNode.getWidth();
	            } else {
	                pBounds[0] = drawChildren[p - 1]._rect.y;
	                pBounds[1] = drawChildren[p + 1]._rect.getBottom() - splitterNode.getHeight();
	            }
	            return pBounds;
	        }
	    }, {
	        key: "_calculateSplit",
	        value: function _calculateSplit(splitter, splitterPos) {
	            var rtn = null;
	            var drawChildren = this._getDrawChildren();
	            var p = drawChildren.indexOf(splitter);
	            var pBounds = this._getSplitterBounds(splitter);

	            var weightedLength = drawChildren[p - 1].getWeight() + drawChildren[p + 1].getWeight();

	            var pixelWidth1 = Math.max(0, splitterPos - pBounds[0]);
	            var pixelWidth2 = Math.max(0, pBounds[1] - splitterPos);

	            if (pixelWidth1 + pixelWidth2 > 0) {
	                var weight1 = pixelWidth1 * weightedLength / (pixelWidth1 + pixelWidth2);
	                var weight2 = pixelWidth2 * weightedLength / (pixelWidth1 + pixelWidth2);

	                rtn = {
	                    node1: drawChildren[p - 1].getId(), weight1: weight1, pixelWidth1: pixelWidth1,
	                    node2: drawChildren[p + 1].getId(), weight2: weight2, pixelWidth2: pixelWidth2
	                };
	            }

	            return rtn;
	        }
	    }, {
	        key: "_getDrawChildren",
	        value: function _getDrawChildren() {
	            if (this._dirty) {
	                this._drawChildren = [];

	                for (var i = 0; i < this._children.length; i++) {
	                    var child = this._children[i];
	                    if (i !== 0) {
	                        var newSplitter = new _SplitterNode2.default(this._model);
	                        newSplitter._parent = this;
	                        this._drawChildren.push(newSplitter);
	                    }
	                    this._drawChildren.push(child);
	                }
	                this._dirty = false;
	            }

	            return this._drawChildren;
	        }
	    }, {
	        key: "_tidy",
	        value: function _tidy() {
	            //console.log("a", this._model.toString());
	            var i = 0;
	            while (i < this._children.length) {
	                var child = this._children[i];
	                if (child.getType() === RowNode.TYPE) {
	                    child._tidy();

	                    if (child._children.length === 0) {
	                        this._removeChild(child);
	                    } else if (child._children.length === 1) {
	                        // hoist child/children up to this level
	                        var subchild = child._children[0];
	                        this._removeChild(child);
	                        if (subchild.getType() === RowNode.TYPE) {
	                            var subChildrenTotal = 0;
	                            for (var j = 0; j < subchild._children.length; j++) {
	                                var subsubChild = subchild._children[j];
	                                subChildrenTotal += subsubChild.getWeight();
	                            }
	                            for (var _j = 0; _j < subchild._children.length; _j++) {
	                                var _subsubChild = subchild._children[_j];
	                                _subsubChild._setWeight(child.getWeight() * _subsubChild.getWeight() / subChildrenTotal);
	                                this._addChild(_subsubChild, i + _j);
	                            }
	                        } else {
	                            subchild._setWeight(child.getWeight());
	                            this._addChild(subchild, i);
	                        }
	                    } else {
	                        i++;
	                    }
	                } else if (child.getType() === _TabSetNode2.default.TYPE && child._children.length === 0) {
	                    if (child.isEnableDeleteWhenEmpty()) {
	                        this._removeChild(child);
	                    } else {
	                        i++;
	                    }
	                } else {
	                    i++;
	                }
	            }

	            // add tabset into empty root
	            if (this == this._model.getRoot() && this._children.length == 0) {
	                var _child4 = new _TabSetNode2.default(this._model, { type: "tabset" });
	                this._addChild(_child4);
	            }

	            //console.log("b", this._model.toString());
	        }
	    }, {
	        key: "_canDrop",
	        value: function _canDrop(dragNode, x, y) {
	            var yy = y - this._rect.y;
	            var xx = x - this._rect.x;
	            var w = this._rect.width;
	            var h = this._rect.height;
	            var margin = 10; // height of edge rect
	            var half = 50; // half width of edge rect
	            var dropInfo = null;

	            if (this._model.isEnableEdgeDock() && this._parent == null) {
	                // _root row
	                if (x < this._rect.x + margin && yy > h / 2 - half && yy < h / 2 + half) {
	                    var dockLocation = _DockLocation2.default.LEFT;
	                    var outlineRect = dockLocation.getDockRect(this._rect);
	                    outlineRect.width = outlineRect.width / 2;
	                    dropInfo = new _DropInfo2.default(this, outlineRect, dockLocation, -1, "flexlayout__outline_rect_edge");
	                } else if (x > this._rect.getRight() - margin && yy > h / 2 - half && yy < h / 2 + half) {
	                    var _dockLocation = _DockLocation2.default.RIGHT;
	                    var _outlineRect = _dockLocation.getDockRect(this._rect);
	                    _outlineRect.width = _outlineRect.width / 2;
	                    _outlineRect.x += _outlineRect.width;
	                    dropInfo = new _DropInfo2.default(this, _outlineRect, _dockLocation, -1, "flexlayout__outline_rect_edge");
	                } else if (y < this._rect.y + margin && xx > w / 2 - half && xx < w / 2 + half) {
	                    var _dockLocation2 = _DockLocation2.default.TOP;
	                    var _outlineRect2 = _dockLocation2.getDockRect(this._rect);
	                    _outlineRect2.height = _outlineRect2.height / 2;
	                    dropInfo = new _DropInfo2.default(this, _outlineRect2, _dockLocation2, -1, "flexlayout__outline_rect_edge");
	                } else if (y > this._rect.getBottom() - margin && xx > w / 2 - half && xx < w / 2 + half) {
	                    var _dockLocation3 = _DockLocation2.default.BOTTOM;
	                    var _outlineRect3 = _dockLocation3.getDockRect(this._rect);
	                    _outlineRect3.height = _outlineRect3.height / 2;
	                    _outlineRect3.y += _outlineRect3.height;
	                    dropInfo = new _DropInfo2.default(this, _outlineRect3, _dockLocation3, -1, "flexlayout__outline_rect_edge");
	                }

	                if (dropInfo != null) {
	                    if (!dragNode._canDockInto(dragNode, dropInfo)) {
	                        return null;
	                    }
	                }
	            }

	            return dropInfo;
	        }
	    }, {
	        key: "_drop",
	        value: function _drop(dragNode, location, index) {
	            var dockLocation = location;

	            if (dragNode._parent) {
	                dragNode._parent._removeChild(dragNode);
	            }

	            if (dragNode._parent !== null && dragNode._parent.getType() === _TabSetNode2.default.TYPE) {
	                dragNode._parent._setSelected(0);
	            }

	            if (dragNode._parent !== null && dragNode._parent.getType() === _BorderNode2.default.TYPE) {
	                dragNode._parent._setSelected(-1);
	            }

	            var tabSet = null;
	            if (dragNode.getType() === _TabSetNode2.default.TYPE) {
	                tabSet = dragNode;
	            } else {
	                tabSet = new _TabSetNode2.default(this._model, {});
	                tabSet._addChild(dragNode);
	            }
	            var size = this._children.reduce(function (sum, child) {
	                return sum + child.getWeight();
	            }, 0);

	            if (size === 0) {
	                size = 100;
	            }

	            tabSet._setWeight(size / 3);

	            if (dockLocation === _DockLocation2.default.LEFT) {
	                this._addChild(tabSet, 0);
	            } else if (dockLocation === _DockLocation2.default.RIGHT) {
	                this._addChild(tabSet);
	            } else if (dockLocation === _DockLocation2.default.TOP) {
	                var vrow = new RowNode(this._model, {});
	                var hrow = new RowNode(this._model, {});
	                hrow._setWeight(75);
	                tabSet._setWeight(25);
	                this._children.forEach(function (child) {
	                    hrow._addChild(child);
	                });
	                this._removeAll();
	                vrow._addChild(tabSet);
	                vrow._addChild(hrow);
	                this._addChild(vrow);
	            } else if (dockLocation === _DockLocation2.default.BOTTOM) {
	                var _vrow = new RowNode(this._model, {});
	                var _hrow = new RowNode(this._model, {});
	                _hrow._setWeight(75);
	                tabSet._setWeight(25);
	                this._children.forEach(function (child) {
	                    _hrow._addChild(child);
	                });
	                this._removeAll();
	                _vrow._addChild(_hrow);
	                _vrow._addChild(tabSet);
	                this._addChild(_vrow);
	            }

	            this._model._activeTabSet = tabSet;

	            this._model._tidy();
	        }
	    }, {
	        key: "_toJson",
	        value: function _toJson() {
	            var json = {};
	            attributeDefinitions.toJson(json, this._attributes);

	            json.children = [];
	            this._children.forEach(function (child) {
	                json.children.push(child._toJson());
	            });

	            return json;
	        }
	    }, {
	        key: "_getAttributeDefinitions",
	        value: function _getAttributeDefinitions() {
	            return attributeDefinitions;
	        }
	    }], [{
	        key: "_fromJson",
	        value: function _fromJson(json, model) {
	            var newLayoutNode = new RowNode(model, json);

	            if (json.children != undefined) {
	                for (var i = 0; i < json.children.length; i++) {
	                    var jsonChild = json.children[i];
	                    if (jsonChild.type === _TabSetNode2.default.TYPE) {
	                        var child = _TabSetNode2.default._fromJson(jsonChild, model);
	                        newLayoutNode._addChild(child);
	                    } else {
	                        var _child5 = RowNode._fromJson(jsonChild, model);
	                        newLayoutNode._addChild(_child5);
	                    }
	                }
	            }

	            return newLayoutNode;
	        }
	    }]);

	    return RowNode;
	}(_Node3.default);

	RowNode.TYPE = "row";

	var attributeDefinitions = new _AttributeDefinitions2.default();
	attributeDefinitions.add("type", RowNode.TYPE, true);
	attributeDefinitions.add("id", null);

	attributeDefinitions.add("weight", 100);
	attributeDefinitions.add("width", null);
	attributeDefinitions.add("height", null);

	exports.default = RowNode;

/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _Node2 = __webpack_require__(22);

	var _Node3 = _interopRequireDefault(_Node2);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var SplitterNode = function (_Node) {
	    _inherits(SplitterNode, _Node);

	    function SplitterNode(model) {
	        _classCallCheck(this, SplitterNode);

	        var _this = _possibleConstructorReturn(this, (SplitterNode.__proto__ || Object.getPrototypeOf(SplitterNode)).call(this, model));

	        _this._fixed = true;
	        _this._attributes["type"] = SplitterNode.TYPE;
	        model._addNode(_this);
	        return _this;
	    }

	    _createClass(SplitterNode, [{
	        key: "getWidth",
	        value: function getWidth() {
	            return this._model.getSplitterSize();
	        }
	    }, {
	        key: "getHeight",
	        value: function getHeight() {
	            return this._model.getSplitterSize();
	        }
	    }]);

	    return SplitterNode;
	}(_Node3.default);

	SplitterNode.TYPE = "splitter";

	exports.default = SplitterNode;

/***/ }),
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _DockLocation = __webpack_require__(20);

	var _DockLocation2 = _interopRequireDefault(_DockLocation);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	/**
	 * The Action creator class for FlexLayout model actions
	 */
	var Actions = function () {
	    function Actions() {
	        _classCallCheck(this, Actions);
	    }

	    _createClass(Actions, null, [{
	        key: "addNode",


	        /**
	         * Adds a tab node to the given tabset node
	         * @param json the json for the new tab node e.g {type:"tab", component:"table"}
	         * @param toNodeId the new tab node will be added to the tabset with this node id
	         * @param location the location where the new tab will be added, one of the DockLocation enum values.
	         * @param index for docking to the center this value is the index of the tab, use -1 to add to the end.
	         * @returns {{type: (string|string), json: *, toNode: *, location: (*|string), index: *}}
	         */
	        value: function addNode(json, toNodeId, location, index) {
	            return { type: Actions.ADD_NODE, json: json, toNode: toNodeId, location: location.getName(), index: index };
	        }

	        /**
	         * Moves a node (tab or tabset) from one location to another
	         * @param fromNodeId the id of the node to move
	         * @param toNodeId the id of the node to receive the moved node
	         * @param location the location where the moved node will be added, one of the DockLocation enum values.
	         * @param index for docking to the center this value is the index of the tab, use -1 to add to the end.
	         * @returns {{type: (string|string), fromNode: *, toNode: *, location: (*|string), index: *}}
	         */

	    }, {
	        key: "moveNode",
	        value: function moveNode(fromNodeId, toNodeId, location, index) {
	            return {
	                type: Actions.MOVE_NODE,
	                fromNode: fromNodeId,
	                toNode: toNodeId,
	                location: location.getName(),
	                index: index
	            };
	        }

	        /**
	         * Deletes a tab node from the layout
	         * @param tabNodeId the id of the node to delete
	         * @returns {{type: (string|string), node: *}}
	         */

	    }, {
	        key: "deleteTab",
	        value: function deleteTab(tabNodeId) {
	            return { type: Actions.DELETE_TAB, node: tabNodeId };
	        }

	        /**
	         * Change the given nodes tab text
	         * @param tabNodeId the id of the node to rename
	         * @param text the test of the tab
	         * @returns {{type: (string|string), node: *, text: *}}
	         */

	    }, {
	        key: "renameTab",
	        value: function renameTab(tabNodeId, text) {
	            return { type: Actions.RENAME_TAB, node: tabNodeId, text: text };
	        }

	        /**
	         * Selects the given tab in its parent tabset
	         * @param tabNodeId the id of the node to set selected
	         * @returns {{type: (string|string), tabNode: *}}
	         */

	    }, {
	        key: "selectTab",
	        value: function selectTab(tabNodeId) {
	            return { type: Actions.SELECT_TAB, tabNode: tabNodeId };
	        }

	        /**
	         * Set the given tabset node as the active tabset
	         * @param tabsetNodeId the id of the tabset node to set as active
	         * @returns {{type: (string|string), tabsetNode: *}}
	         */

	    }, {
	        key: "setActiveTabset",
	        value: function setActiveTabset(tabsetNodeId) {
	            return { type: Actions.SET_ACTIVE_TABSET, tabsetNode: tabsetNodeId };
	        }

	        /**
	         * Adjust the splitter between two tabsets
	         * @example
	         *  Actions.adjustSplit({node1: "1", weight1:30, pixelWidth1:300, node2: "2", weight2:70, pixelWidth2:700});
	         *
	         * @param splitSpec an object the defines the new split between two tabsets, see example below.
	         * @returns {{type: (string|string), node1: *, weight1: *, pixelWidth1: *, node2: *, weight2: *, pixelWidth2: *}}
	         */

	    }, {
	        key: "adjustSplit",
	        value: function adjustSplit(splitSpec) {
	            var node1 = splitSpec.node1;
	            var node2 = splitSpec.node2;

	            return {
	                type: Actions.ADJUST_SPLIT,
	                node1: node1, weight1: splitSpec.weight1, pixelWidth1: splitSpec.pixelWidth1,
	                node2: node2, weight2: splitSpec.weight2, pixelWidth2: splitSpec.pixelWidth2
	            };
	        }
	    }, {
	        key: "adjustBorderSplit",
	        value: function adjustBorderSplit(nodeId, pos) {
	            return { type: Actions.ADJUST_BORDER_SPLIT, node: nodeId, pos: pos };
	        }

	        /**
	         * Maximizes the given tabset
	         * @param tabsetNodeId the id of the tabset to maximize
	         * @returns {{type: (string|string), node: *}}
	         */

	    }, {
	        key: "maximizeToggle",
	        value: function maximizeToggle(tabsetNodeId) {
	            return { type: Actions.MAXIMIZE_TOGGLE, node: tabsetNodeId };
	        }

	        /**
	         * Updates the global model jsone attributes
	         * @param attributes the json for the model attributes to update (merge into the existing attributes)
	         * @returns {{type: (string|string), json: *}}
	         */

	    }, {
	        key: "updateModelAttributes",
	        value: function updateModelAttributes(attributes) {
	            return { type: Actions.UPDATE_MODEL_ATTRIBUTES, json: attributes };
	        }

	        /**
	         * Updates the given nodes json attributes
	         * @param nodeId the id of the node to update
	         * @param attributes the json attributes to update (merge with the existing attributes)
	         * @returns {{type: (string|string), node: *, json: *}}
	         */

	    }, {
	        key: "updateNodeAttributes",
	        value: function updateNodeAttributes(nodeId, attributes) {
	            return { type: Actions.UPDATE_NODE_ATTRIBUTES, node: nodeId, json: attributes };
	        }
	    }]);

	    return Actions;
	}();

	Actions.ADD_NODE = "FlexLayout_AddNode";
	Actions.MOVE_NODE = "FlexLayout_MoveNode";
	Actions.DELETE_TAB = "FlexLayout_DeleteTab";
	Actions.RENAME_TAB = "FlexLayout_RenameTab";
	Actions.SELECT_TAB = "FlexLayout_SelectTab";
	Actions.SET_ACTIVE_TABSET = "FlexLayout_SetActiveTabset";
	Actions.ADJUST_SPLIT = "FlexLayout_AdjustSplit";
	Actions.ADJUST_BORDER_SPLIT = "FlexLayout_AdjustBorderSplit";
	Actions.MAXIMIZE_TOGGLE = "FlexLayout_MaximizeToggle";
	Actions.UPDATE_MODEL_ATTRIBUTES = "FlexLayout_UpdateModelAttributes";
	Actions.UPDATE_NODE_ATTRIBUTES = "FlexLayout_UpdateNodeAttributes";

	exports.default = Actions;

/***/ }),
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _react = __webpack_require__(11);

	var _react2 = _interopRequireDefault(_react);

	var _reactDom = __webpack_require__(12);

	var _reactDom2 = _interopRequireDefault(_reactDom);

	var _TabSetNode = __webpack_require__(24);

	var _TabSetNode2 = _interopRequireDefault(_TabSetNode);

	var _Actions = __webpack_require__(27);

	var _Actions2 = _interopRequireDefault(_Actions);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var Tab = function (_React$Component) {
	    _inherits(Tab, _React$Component);

	    function Tab(props) {
	        _classCallCheck(this, Tab);

	        var _this = _possibleConstructorReturn(this, (Tab.__proto__ || Object.getPrototypeOf(Tab)).call(this, props));

	        _this.state = { renderComponent: props.selected };
	        return _this;
	    }

	    _createClass(Tab, [{
	        key: "componentDidMount",
	        value: function componentDidMount() {
	            //console.log("mount " + this.props.node.getName());
	        }
	    }, {
	        key: "componentWillUnmount",
	        value: function componentWillUnmount() {
	            //console.log("unmount " + this.props.node.getName());
	        }
	    }, {
	        key: "componentWillReceiveProps",
	        value: function componentWillReceiveProps(newProps) {
	            if (!this.state.renderComponent && newProps.selected) {
	                // load on demand
	                //console.log("load on demand: " + this.props.node.getName());
	                this.setState({ renderComponent: true });
	            }
	        }
	    }, {
	        key: "onMouseDown",
	        value: function onMouseDown(event) {
	            var parent = this.props.node.getParent();
	            if (parent.getType() == _TabSetNode2.default.TYPE) {
	                if (!parent.isActive()) {
	                    this.props.layout.doAction(_Actions2.default.setActiveTabset(parent.getId()));
	                }
	            }
	        }
	    }, {
	        key: "render",
	        value: function render() {
	            var node = this.props.node;
	            var style = node._styleWithPosition({
	                display: this.props.selected ? "block" : "none"
	            });

	            if (this.props.node.getParent().isMaximized()) {
	                style.zIndex = 100;
	            }

	            var child = null;
	            if (this.state.renderComponent) {
	                child = this.props.factory(node);
	            }

	            return _react2.default.createElement(
	                "div",
	                { className: "flexlayout__tab",
	                    onMouseDown: this.onMouseDown.bind(this),
	                    onTouchStart: this.onMouseDown.bind(this),
	                    style: style },
	                child
	            );
	        }
	    }]);

	    return Tab;
	}(_react2.default.Component);

	exports.default = Tab;

/***/ }),
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _react = __webpack_require__(11);

	var _react2 = _interopRequireDefault(_react);

	var _reactDom = __webpack_require__(12);

	var _reactDom2 = _interopRequireDefault(_reactDom);

	var _Rect = __webpack_require__(15);

	var _Rect2 = _interopRequireDefault(_Rect);

	var _PopupMenu = __webpack_require__(30);

	var _PopupMenu2 = _interopRequireDefault(_PopupMenu);

	var _Actions = __webpack_require__(27);

	var _Actions2 = _interopRequireDefault(_Actions);

	var _TabButton = __webpack_require__(31);

	var _TabButton2 = _interopRequireDefault(_TabButton);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var TabSet = function (_React$Component) {
	    _inherits(TabSet, _React$Component);

	    function TabSet(props) {
	        _classCallCheck(this, TabSet);

	        var _this = _possibleConstructorReturn(this, (TabSet.__proto__ || Object.getPrototypeOf(TabSet)).call(this, props));

	        _this.recalcVisibleTabs = true;
	        _this.showOverflow = false;
	        _this.showToolbar = true;
	        _this.state = { hideTabsAfter: 999 };
	        return _this;
	    }

	    _createClass(TabSet, [{
	        key: "componentDidMount",
	        value: function componentDidMount() {
	            this.updateVisibleTabs();
	        }
	    }, {
	        key: "componentDidUpdate",
	        value: function componentDidUpdate() {
	            this.updateVisibleTabs();
	        }
	    }, {
	        key: "componentWillReceiveProps",
	        value: function componentWillReceiveProps(nextProps) {
	            this.showToolbar = true;
	            this.showOverflow = false;
	            this.recalcVisibleTabs = true;
	            this.setState({ hideTabsAfter: 999 });
	        }
	    }, {
	        key: "updateVisibleTabs",
	        value: function updateVisibleTabs() {
	            var node = this.props.node;

	            if (node.isEnableTabStrip() && this.recalcVisibleTabs) {
	                var toolbarWidth = this.refs.toolbar.getBoundingClientRect().width;
	                var hideTabsAfter = 999;
	                for (var i = 0; i < node.getChildren().length; i++) {
	                    var child = node.getChildren()[i];
	                    if (child.getTabRect().getRight() > node.getRect().getRight() - (20 + toolbarWidth)) {
	                        hideTabsAfter = Math.max(0, i - 1);
	                        //console.log("tabs truncated to:" + hideTabsAfter);
	                        this.showOverflow = node.getChildren().length > 1;

	                        if (i === 0) {
	                            this.showToolbar = false;
	                            if (child.getTabRect().getRight() > node.getRect().getRight() - 20) {
	                                this.showOverflow = false;
	                            }
	                        }

	                        break;
	                    }
	                }
	                if (this.state.hideTabsAfter !== hideTabsAfter) {
	                    this.setState({ hideTabsAfter: hideTabsAfter });
	                }
	                this.recalcVisibleTabs = false;
	            }
	        }
	    }, {
	        key: "render",
	        value: function render() {
	            var node = this.props.node;
	            var style = node._styleWithPosition();

	            if (this.props.node.isMaximized()) {
	                style.zIndex = 100;
	            }

	            var tabs = [];
	            var hiddenTabs = [];
	            if (node.isEnableTabStrip()) {
	                for (var i = 0; i < node.getChildren().length; i++) {
	                    var isSelected = this.props.node.getSelected() === i;
	                    var showTab = this.state.hideTabsAfter >= i;

	                    var child = node.getChildren()[i];

	                    if (this.state.hideTabsAfter === i && this.props.node.getSelected() > this.state.hideTabsAfter) {
	                        hiddenTabs.push({ name: child.getName(), node: child, index: i });
	                        child = node.getChildren()[this.props.node.getSelected()];
	                        isSelected = true;
	                    } else if (!showTab && !isSelected) {
	                        hiddenTabs.push({ name: child.getName(), node: child, index: i });
	                    }
	                    if (showTab) {
	                        tabs.push(_react2.default.createElement(_TabButton2.default, { layout: this.props.layout,
	                            node: child,
	                            key: child.getId(),
	                            selected: isSelected,
	                            show: showTab,
	                            height: node.getTabStripHeight(),
	                            pos: i }));
	                    }
	                }
	            }
	            //tabs.forEach(c => console.log(c.key));

	            var buttons = [];

	            // allow customization of header contents and buttons
	            var renderState = { headerContent: node.getName(), buttons: buttons };
	            this.props.layout.customizeTabSet(this.props.node, renderState);
	            var headerContent = renderState.headerContent;
	            buttons = renderState.buttons;

	            var toolbar = null;
	            if (this.showToolbar === true) {
	                if (this.props.node.isEnableMaximize()) {
	                    buttons.push(_react2.default.createElement("button", { key: "max",
	                        className: "flexlayout__tab_toolbar_button-" + (node.isMaximized() ? "max" : "min"),
	                        onClick: this.onMaximizeToggle.bind(this) }));
	                }
	                toolbar = _react2.default.createElement(
	                    "div",
	                    { key: "toolbar", ref: "toolbar", className: "flexlayout__tab_toolbar",
	                        onMouseDown: this.onInterceptMouseDown.bind(this) },
	                    buttons
	                );
	            }

	            if (this.showOverflow === true) {
	                tabs.push(_react2.default.createElement(
	                    "button",
	                    { key: "overflowbutton", ref: "overflowbutton", className: "flexlayout__tab_button_overflow",
	                        onClick: this.onOverflowClick.bind(this, hiddenTabs),
	                        onMouseDown: this.onInterceptMouseDown.bind(this)
	                    },
	                    hiddenTabs.length
	                ));
	            }

	            var showHeader = node.getName() != null;
	            var header = null;
	            var tabStrip = null;

	            var tabStripClasses = "flexlayout__tab_header_outer";
	            if (this.props.node.getClassNameTabStrip() != null) {
	                tabStripClasses += " " + this.props.node.getClassNameTabStrip();
	            }
	            if (node.isActive() && !showHeader) {
	                tabStripClasses += " flexlayout__tabset-selected";
	            }

	            if (node.isMaximized() && !showHeader) {
	                tabStripClasses += " flexlayout__tabset-maximized";
	            }

	            if (showHeader) {
	                var tabHeaderClasses = "flexlayout__tabset_header";
	                if (node.isActive()) {
	                    tabHeaderClasses += " flexlayout__tabset-selected";
	                }
	                if (node.isMaximized()) {
	                    tabHeaderClasses += " flexlayout__tabset-maximized";
	                }
	                if (this.props.node.getClassNameHeader() != null) {
	                    tabHeaderClasses += " " + this.props.node.getClassNameHeader();
	                }

	                header = _react2.default.createElement(
	                    "div",
	                    { className: tabHeaderClasses,
	                        style: { height: node.getHeaderHeight() + "px" },
	                        onMouseDown: this.onMouseDown.bind(this),
	                        onTouchStart: this.onMouseDown.bind(this) },
	                    headerContent,
	                    toolbar
	                );
	                tabStrip = _react2.default.createElement(
	                    "div",
	                    { className: tabStripClasses,
	                        style: { height: node.getTabStripHeight() + "px", top: node.getHeaderHeight() + "px" } },
	                    _react2.default.createElement(
	                        "div",
	                        { ref: "header", className: "flexlayout__tab_header_inner" },
	                        tabs
	                    )
	                );
	            } else {
	                tabStrip = _react2.default.createElement(
	                    "div",
	                    { className: tabStripClasses, style: { top: "0px", height: node.getTabStripHeight() + "px" },
	                        onMouseDown: this.onMouseDown.bind(this),
	                        onTouchStart: this.onMouseDown.bind(this) },
	                    _react2.default.createElement(
	                        "div",
	                        { ref: "header", className: "flexlayout__tab_header_inner" },
	                        tabs
	                    ),
	                    toolbar
	                );
	            }

	            return _react2.default.createElement(
	                "div",
	                { style: style, className: "flexlayout__tabset" },
	                header,
	                tabStrip
	            );
	        }
	    }, {
	        key: "onOverflowClick",
	        value: function onOverflowClick(hiddenTabs, event) {
	            //console.log("hidden tabs: " + hiddenTabs);
	            var element = this.refs.overflowbutton;
	            _PopupMenu2.default.show(element, hiddenTabs, this.onOverflowItemSelect.bind(this));
	        }
	    }, {
	        key: "onOverflowItemSelect",
	        value: function onOverflowItemSelect(item) {
	            var node = this.props.node;
	            this.props.layout.doAction(_Actions2.default.selectTab(item.node.getId()));
	        }
	    }, {
	        key: "onMouseDown",
	        value: function onMouseDown(event) {
	            var name = this.props.node.getName();
	            if (name == null) {
	                name = "";
	            } else {
	                name = ": " + name;
	            }
	            this.props.layout.doAction(_Actions2.default.setActiveTabset(this.props.node.getId()));
	            this.props.layout.dragStart(event, "Move tabset" + name, this.props.node, this.props.node.isEnableDrag(), null, this.onDoubleClick.bind(this));
	        }
	    }, {
	        key: "onInterceptMouseDown",
	        value: function onInterceptMouseDown(event) {
	            event.stopPropagation();
	        }
	    }, {
	        key: "onMaximizeToggle",
	        value: function onMaximizeToggle() {
	            if (this.props.node.isEnableMaximize()) {
	                this.props.layout.maximize(this.props.node);
	            }
	        }
	    }, {
	        key: "onDoubleClick",
	        value: function onDoubleClick() {
	            if (this.props.node.isEnableMaximize()) {
	                this.props.layout.maximize(this.props.node);
	            }
	        }
	    }]);

	    return TabSet;
	}(_react2.default.Component);

	exports.default = TabSet;

/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _react = __webpack_require__(11);

	var _react2 = _interopRequireDefault(_react);

	var _reactDom = __webpack_require__(12);

	var _reactDom2 = _interopRequireDefault(_reactDom);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var PopupMenu = function (_React$Component) {
	    _inherits(PopupMenu, _React$Component);

	    function PopupMenu(props) {
	        _classCallCheck(this, PopupMenu);

	        var _this = _possibleConstructorReturn(this, (PopupMenu.__proto__ || Object.getPrototypeOf(PopupMenu)).call(this, props));

	        _this.onDocMouseUp = _this.onDocMouseUp.bind(_this);
	        _this.hidden = false;
	        return _this;
	    }

	    _createClass(PopupMenu, [{
	        key: "componentDidMount",
	        value: function componentDidMount() {
	            document.addEventListener("mouseup", this.onDocMouseUp);
	        }
	    }, {
	        key: "componentWillUnmount",
	        value: function componentWillUnmount() {
	            document.removeEventListener("mouseup", this.onDocMouseUp);
	        }
	    }, {
	        key: "onDocMouseUp",
	        value: function onDocMouseUp(event) {
	            setInterval(function () {
	                this.hide();
	            }.bind(this), 0);
	        }
	    }, {
	        key: "hide",
	        value: function hide() {
	            if (!this.hidden) {
	                this.props.onHide();
	                this.hidden = true;
	            }
	        }
	    }, {
	        key: "onItemClick",
	        value: function onItemClick(item, event) {
	            this.props.onSelect(item);
	            this.hide();
	            event.stopPropagation();
	        }
	    }, {
	        key: "render",
	        value: function render() {
	            var _this2 = this;

	            var items = this.props.items.map(function (item) {
	                return _react2.default.createElement(
	                    "div",
	                    { key: item.index, className: "flexlayout__popup_menu_item",
	                        onClick: _this2.onItemClick.bind(_this2, item) },
	                    item.name
	                );
	            });

	            return _react2.default.createElement(
	                "div",
	                { className: "popup_menu" },
	                items
	            );
	        }
	    }], [{
	        key: "show",
	        value: function show(triggerElement, items, onSelect) {
	            var triggerRect = triggerElement.getBoundingClientRect();
	            var docRect = document.body.getBoundingClientRect();

	            var elm = document.createElement("div");
	            elm.className = "flexlayout__popup_menu_container";
	            elm.style.right = docRect.right - triggerRect.right + "px";
	            elm.style.top = triggerRect.bottom + "px";
	            document.body.appendChild(elm);

	            var onHide = function onHide() {
	                _reactDom2.default.unmountComponentAtNode(elm);
	                document.body.removeChild(elm);
	            };

	            _reactDom2.default.render(_react2.default.createElement(PopupMenu, { element: elm, onSelect: onSelect, onHide: onHide, items: items }), elm);
	            this.elm = elm;
	        }
	    }]);

	    return PopupMenu;
	}(_react2.default.Component);

	exports.default = PopupMenu;

/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _react = __webpack_require__(11);

	var _react2 = _interopRequireDefault(_react);

	var _reactDom = __webpack_require__(12);

	var _reactDom2 = _interopRequireDefault(_reactDom);

	var _Rect = __webpack_require__(15);

	var _Rect2 = _interopRequireDefault(_Rect);

	var _PopupMenu = __webpack_require__(30);

	var _PopupMenu2 = _interopRequireDefault(_PopupMenu);

	var _Actions = __webpack_require__(27);

	var _Actions2 = _interopRequireDefault(_Actions);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var TabButton = function (_React$Component) {
	    _inherits(TabButton, _React$Component);

	    function TabButton(props) {
	        _classCallCheck(this, TabButton);

	        var _this = _possibleConstructorReturn(this, (TabButton.__proto__ || Object.getPrototypeOf(TabButton)).call(this, props));

	        _this.state = { editing: false };
	        _this.onEndEdit = _this.onEndEdit.bind(_this);
	        return _this;
	    }

	    _createClass(TabButton, [{
	        key: "onMouseDown",
	        value: function onMouseDown(event) {
	            this.props.layout.dragStart(event, "Move: " + this.props.node.getName(), this.props.node, this.props.node.isEnableDrag(), this.onClick.bind(this), this.onDoubleClick.bind(this));
	        }
	    }, {
	        key: "onClick",
	        value: function onClick(event) {
	            var node = this.props.node;
	            this.props.layout.doAction(_Actions2.default.selectTab(node.getId()));
	        }
	    }, {
	        key: "onDoubleClick",
	        value: function onDoubleClick(event) {
	            if (this.props.node.isEnableRename()) {
	                this.setState({ editing: true });
	                document.body.addEventListener("mousedown", this.onEndEdit);
	                document.body.addEventListener("touchstart", this.onEndEdit);
	            } else {
	                if (this.props.node._parent.isEnableMaximize()) {
	                    this.props.layout.maximize(this.props.node.getParent());
	                }
	            }
	        }
	    }, {
	        key: "onEndEdit",
	        value: function onEndEdit(event) {
	            if (event.target !== this.refs.contents) {
	                this.setState({ editing: false });
	                document.body.removeEventListener("mousedown", this.onEndEdit);
	                document.body.removeEventListener("touchstart", this.onEndEdit);
	            }
	        }
	    }, {
	        key: "onClose",
	        value: function onClose(event) {
	            var node = this.props.node;
	            this.props.layout.doAction(_Actions2.default.deleteTab(node.getId()));
	        }
	    }, {
	        key: "onCloseMouseDown",
	        value: function onCloseMouseDown(event) {
	            event.stopPropagation();
	        }
	    }, {
	        key: "componentDidMount",
	        value: function componentDidMount() {
	            this.updateRect();
	        }
	    }, {
	        key: "componentDidUpdate",
	        value: function componentDidUpdate() {
	            this.updateRect();
	            if (this.state.editing) {
	                this.refs.contents.select();
	            }
	        }
	    }, {
	        key: "updateRect",
	        value: function updateRect() {
	            // record position of tab in node
	            var clientRect = _reactDom2.default.findDOMNode(this.props.layout).getBoundingClientRect();
	            var r = this.refs.self.getBoundingClientRect();
	            this.props.node.setTabRect(new _Rect2.default(r.left - clientRect.left, r.top - clientRect.top, r.width, r.height));
	            this.contentWidth = this.refs.contents.getBoundingClientRect().width;
	        }
	    }, {
	        key: "onTextBoxMouseDown",
	        value: function onTextBoxMouseDown(event) {
	            //console.log("onTextBoxMouseDown");
	            event.stopPropagation();
	        }
	    }, {
	        key: "onTextBoxKeyPress",
	        value: function onTextBoxKeyPress(event) {
	            //console.log(event, event.keyCode);
	            if (event.keyCode === 27) {
	                // esc
	                this.setState({ editing: false });
	            } else if (event.keyCode === 13) {
	                // enter
	                this.setState({ editing: false });
	                var node = this.props.node;

	                this.props.layout.doAction(_Actions2.default.renameTab(node.getId(), event.target.value));
	            }
	        }
	    }, {
	        key: "doRename",
	        value: function doRename(node, newName) {
	            this.props.layout.doAction(_Actions2.default.renameTab(node.getId(), newName));
	        }
	    }, {
	        key: "render",
	        value: function render() {
	            var classNames = "flexlayout__tab_button";
	            var node = this.props.node;

	            if (this.props.selected) {
	                classNames += " flexlayout__tab_button--selected";
	            } else {
	                classNames += " flexlayout__tab_button--unselected";
	            }

	            if (this.props.node.getClassName() != null) {
	                classNames += " " + this.props.node.getClassName();
	            }

	            var leadingContent = null;

	            if (node.getIcon() != null) {
	                leadingContent = _react2.default.createElement("img", { src: node.getIcon() });
	            }

	            // allow customization of leading contents (icon) and contents
	            var renderState = { leading: leadingContent, content: node.getName() };
	            this.props.layout.customizeTab(node, renderState);

	            var content = _react2.default.createElement(
	                "div",
	                { ref: "contents", className: "flexlayout__tab_button_content" },
	                renderState.content
	            );
	            var leading = _react2.default.createElement(
	                "div",
	                { className: "flexlayout__tab_button_leading" },
	                renderState.leading
	            );

	            if (this.state.editing) {
	                var contentStyle = { width: this.contentWidth + "px" };
	                content = _react2.default.createElement("input", { style: contentStyle,
	                    ref: "contents",
	                    className: "flexlayout__tab_button_textbox",
	                    type: "text",
	                    autoFocus: true,
	                    defaultValue: node.getName(),
	                    onKeyDown: this.onTextBoxKeyPress.bind(this),
	                    onMouseDown: this.onTextBoxMouseDown.bind(this),
	                    onTouchStart: this.onTextBoxMouseDown.bind(this)
	                });
	            }

	            var closeButton = null;
	            if (this.props.node.isEnableClose()) {
	                closeButton = _react2.default.createElement("div", { className: "flexlayout__tab_button_trailing",
	                    onMouseDown: this.onCloseMouseDown.bind(this),
	                    onClick: this.onClose.bind(this),
	                    onTouchStart: this.onCloseMouseDown.bind(this)
	                });
	            }

	            return _react2.default.createElement(
	                "div",
	                { ref: "self",
	                    style: { visibility: this.props.show ? "visible" : "hidden",
	                        height: this.props.height },
	                    className: classNames,
	                    onMouseDown: this.onMouseDown.bind(this),
	                    onTouchStart: this.onMouseDown.bind(this) },
	                leading,
	                content,
	                closeButton
	            );
	        }
	    }]);

	    return TabButton;
	}(_react2.default.Component);

	exports.default = TabButton;

/***/ }),
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _react = __webpack_require__(11);

	var _react2 = _interopRequireDefault(_react);

	var _reactDom = __webpack_require__(12);

	var _reactDom2 = _interopRequireDefault(_reactDom);

	var _Rect = __webpack_require__(15);

	var _Rect2 = _interopRequireDefault(_Rect);

	var _Actions = __webpack_require__(27);

	var _Actions2 = _interopRequireDefault(_Actions);

	var _BorderNode = __webpack_require__(17);

	var _BorderNode2 = _interopRequireDefault(_BorderNode);

	var _BorderButton = __webpack_require__(33);

	var _BorderButton2 = _interopRequireDefault(_BorderButton);

	var _DockLocation = __webpack_require__(20);

	var _DockLocation2 = _interopRequireDefault(_DockLocation);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var BorderTabSet = function (_React$Component) {
	    _inherits(BorderTabSet, _React$Component);

	    function BorderTabSet(props) {
	        _classCallCheck(this, BorderTabSet);

	        return _possibleConstructorReturn(this, (BorderTabSet.__proto__ || Object.getPrototypeOf(BorderTabSet)).call(this, props));
	    }

	    _createClass(BorderTabSet, [{
	        key: "render",
	        value: function render() {
	            var border = this.props.border;
	            var style = border.getTabHeaderRect().styleWithPosition({});
	            var tabs = [];
	            if (border.getLocation() != _DockLocation2.default.LEFT) {
	                for (var i = 0; i < border.getChildren().length; i++) {
	                    var isSelected = border.getSelected() === i;
	                    var child = border.getChildren()[i];
	                    tabs.push(_react2.default.createElement(_BorderButton2.default, { layout: this.props.layout,
	                        border: border,
	                        node: child,
	                        key: child.getId(),
	                        selected: isSelected,
	                        height: border.getBorderBarSize(),
	                        pos: i }));
	                }
	            } else {
	                for (var _i = border.getChildren().length - 1; _i >= 0; _i--) {
	                    var _isSelected = border.getSelected() === _i;
	                    var _child = border.getChildren()[_i];
	                    tabs.push(_react2.default.createElement(_BorderButton2.default, { layout: this.props.layout,
	                        border: border,
	                        node: _child,
	                        key: _child.getId(),
	                        selected: _isSelected,
	                        height: border.getBorderBarSize(),
	                        pos: _i }));
	                }
	            }

	            var borderClasses = "flexlayout__border_" + border.getLocation().getName();
	            if (this.props.border.getClassNameBorder() != null) {
	                borderClasses += " " + this.props.border.getClassNameBorder();
	            }

	            // allow customization of tabset right/bottom buttons
	            var buttons = [];
	            var renderState = { buttons: buttons };
	            this.props.layout.customizeTabSet(border, renderState);
	            buttons = renderState.buttons;

	            //buttons.push(<button
	            //    key="1"
	            //    className={"flexlayout__tab_toolbar_button-min"}></button>);

	            var toolbar = _react2.default.createElement(
	                "div",
	                {
	                    key: "toolbar",
	                    ref: "toolbar",
	                    className: "flexlayout__border_toolbar_" + border.getLocation().getName() },
	                buttons
	            );

	            return _react2.default.createElement(
	                "div",
	                {
	                    style: style,
	                    className: borderClasses },
	                _react2.default.createElement(
	                    "div",
	                    { className: "flexlayout__border_inner_" + border.getLocation().getName() },
	                    tabs
	                ),
	                toolbar
	            );
	        }
	    }]);

	    return BorderTabSet;
	}(_react2.default.Component);

	exports.default = BorderTabSet;

/***/ }),
/* 33 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _react = __webpack_require__(11);

	var _react2 = _interopRequireDefault(_react);

	var _reactDom = __webpack_require__(12);

	var _reactDom2 = _interopRequireDefault(_reactDom);

	var _Rect = __webpack_require__(15);

	var _Rect2 = _interopRequireDefault(_Rect);

	var _Actions = __webpack_require__(27);

	var _Actions2 = _interopRequireDefault(_Actions);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var BorderButton = function (_React$Component) {
	    _inherits(BorderButton, _React$Component);

	    function BorderButton(props) {
	        _classCallCheck(this, BorderButton);

	        return _possibleConstructorReturn(this, (BorderButton.__proto__ || Object.getPrototypeOf(BorderButton)).call(this, props));
	    }

	    _createClass(BorderButton, [{
	        key: "onMouseDown",
	        value: function onMouseDown(event) {
	            this.props.layout.dragStart(event, "Move: " + this.props.node.getName(), this.props.node, this.props.node.isEnableDrag(), this.onClick.bind(this), null);
	        }
	    }, {
	        key: "onClick",
	        value: function onClick(event) {
	            var node = this.props.node;
	            this.props.layout.doAction(_Actions2.default.selectTab(node.getId()));
	        }
	    }, {
	        key: "onClose",
	        value: function onClose(event) {
	            var node = this.props.node;
	            this.props.layout.doAction(_Actions2.default.deleteTab(node.getId()));
	        }
	    }, {
	        key: "onCloseMouseDown",
	        value: function onCloseMouseDown(event) {
	            event.stopPropagation();
	        }
	    }, {
	        key: "componentDidMount",
	        value: function componentDidMount() {
	            this.updateRect();
	        }
	    }, {
	        key: "componentDidUpdate",
	        value: function componentDidUpdate() {
	            this.updateRect();
	        }
	    }, {
	        key: "updateRect",
	        value: function updateRect() {
	            // record position of tab in border
	            var clientRect = _reactDom2.default.findDOMNode(this.props.layout).getBoundingClientRect();
	            var r = this.refs.self.getBoundingClientRect();
	            this.props.node.setTabRect(new _Rect2.default(r.left - clientRect.left, r.top - clientRect.top, r.width, r.height));
	            this.contentWidth = this.refs.contents.getBoundingClientRect().width;
	        }
	    }, {
	        key: "render",
	        value: function render() {
	            var classNames = "flexlayout__border_button flexlayout__border_button_" + this.props.border.getLocation().getName();
	            var node = this.props.node;

	            if (this.props.selected) {
	                classNames += " flexlayout__border_button--selected";
	            } else {
	                classNames += " flexlayout__border_button--unselected";
	            }

	            if (this.props.node.getClassName() != null) {
	                classNames += " " + this.props.node.getClassName();
	            }

	            var leadingContent = null;

	            if (node.getIcon() != null) {
	                leadingContent = _react2.default.createElement("img", { src: node.getIcon() });
	            }

	            var content = _react2.default.createElement(
	                "div",
	                { ref: "contents", className: "flexlayout__border_button_content" },
	                node.getName()
	            );

	            var closeButton = null;
	            if (this.props.node.isEnableClose()) {
	                closeButton = _react2.default.createElement("div", { className: "flexlayout__border_button_trailing",
	                    onMouseDown: this.onCloseMouseDown.bind(this),
	                    onClick: this.onClose.bind(this),
	                    onTouchStart: this.onCloseMouseDown.bind(this)
	                });
	            }

	            return _react2.default.createElement(
	                "div",
	                { ref: "self",
	                    style: {},
	                    className: classNames,
	                    onMouseDown: this.onMouseDown.bind(this),
	                    onTouchStart: this.onMouseDown.bind(this) },
	                leadingContent,
	                content,
	                closeButton
	            );
	        }
	    }]);

	    return BorderButton;
	}(_react2.default.Component);

	exports.default = BorderButton;

/***/ }),
/* 34 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _RowNode = __webpack_require__(25);

	var _RowNode2 = _interopRequireDefault(_RowNode);

	var _Actions = __webpack_require__(27);

	var _Actions2 = _interopRequireDefault(_Actions);

	var _TabNode = __webpack_require__(23);

	var _TabNode2 = _interopRequireDefault(_TabNode);

	var _TabSetNode = __webpack_require__(24);

	var _TabSetNode2 = _interopRequireDefault(_TabSetNode);

	var _BorderSet = __webpack_require__(35);

	var _BorderSet2 = _interopRequireDefault(_BorderSet);

	var _BorderNode = __webpack_require__(17);

	var _BorderNode2 = _interopRequireDefault(_BorderNode);

	var _DockLocation = __webpack_require__(20);

	var _DockLocation2 = _interopRequireDefault(_DockLocation);

	var _AttributeDefinitions = __webpack_require__(18);

	var _AttributeDefinitions2 = _interopRequireDefault(_AttributeDefinitions);

	var _Attribute = __webpack_require__(19);

	var _Attribute2 = _interopRequireDefault(_Attribute);

	var _Orientation = __webpack_require__(16);

	var _Orientation2 = _interopRequireDefault(_Orientation);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	/**
	 * Class containing the Tree of Nodes used by the FlexLayout component
	 */
	var Model = function () {
	    /**
	     * 'private' constructor. Use the static method Model.fromJson(json) to create a model
	     */
	    function Model() {
	        _classCallCheck(this, Model);

	        this._attributes = {};
	        this._idMap = {};
	        this._nextId = 0;
	        this._listener = null;
	        this._root = null;
	        this._borders = new _BorderSet2.default(this);
	        this._onAllowDrop = null;
	        this._maximizedTabSet = null;
	        this._activeTabSet = null;
	    }

	    _createClass(Model, [{
	        key: "setListener",
	        value: function setListener(listener) {
	            this._listener = listener;
	        }

	        /**
	         * Sets a function to allow/deny dropping a node
	         * @param onAllowDrop function that takes the drag node and DropInfo and returns true if the drop is allowed
	         *
	         * example function:
	         *
	         * allowDrop(dragNode, dropInfo) {
	         *   let dropNode = dropInfo.node;
	         *
	         *   // prevent non-border tabs dropping into borders
	         *   if (dropNode.getType() == "border" && (dragNode.getParent() == null || dragNode.getParent().getType() != "border"))
	         *     return false;
	         *
	         *   // prevent border tabs dropping into main layout
	         *   if (dropNode.getType() != "border" && (dragNode.getParent() != null && dragNode.getParent().getType() == "border"))
	         *     return false;
	         *
	         *   return true;
	         * }
	         */

	    }, {
	        key: "setOnAllowDrop",
	        value: function setOnAllowDrop(onAllowDrop) {
	            this._onAllowDrop = onAllowDrop;
	        }

	        /**
	         * Get the currently active tabset node
	         * @returns {null|TabSetNode}
	         */

	    }, {
	        key: "getActiveTabset",
	        value: function getActiveTabset() {
	            return this._activeTabSet;
	        }
	    }, {
	        key: "_setActiveTabset",
	        value: function _setActiveTabset(tabsetNode) {
	            this._activeTabSet = tabsetNode;
	        }

	        /**
	         * Get the currently maximized tabset node
	         * @returns {null|TabSetNode}
	         */

	    }, {
	        key: "getMaximizedTabset",
	        value: function getMaximizedTabset() {
	            return this._maximizedTabSet;
	        }
	    }, {
	        key: "_setMaximizedTabset",
	        value: function _setMaximizedTabset(tabsetNode) {
	            this._maximizedTabSet = tabsetNode;
	        }

	        /**
	         * Gets the root RowNode of the model
	         * @returns {RowNode}
	         */

	    }, {
	        key: "getRoot",
	        value: function getRoot() {
	            return this._root;
	        }

	        /**
	         * Gets the
	         * @returns {BorderSet|*}
	         */

	    }, {
	        key: "getBorderSet",
	        value: function getBorderSet() {
	            return this._borders;
	        }
	    }, {
	        key: "_getOuterInnerRects",
	        value: function _getOuterInnerRects() {
	            return this._borderRects;
	        }

	        /**
	         * Visits all the nodes in the model and calls the given function for each
	         * @param fn a function that takes visited node and a integer level as parameters
	         */

	    }, {
	        key: "visitNodes",
	        value: function visitNodes(fn) {
	            this._borders._forEachNode(fn);
	            this._root._forEachNode(fn, 0);
	        }

	        /**
	         * Gets a node by its id
	         * @param id the id to find
	         * @returns {null|Node}
	         */

	    }, {
	        key: "getNodeById",
	        value: function getNodeById(id) {
	            return this._idMap[id];
	        }

	        ///**
	        // * Update the json by performing the given action,
	        // * Actions should be generated via static methods on the Actions class
	        // * @param json the json to update
	        // * @param action the action to perform
	        // * @returns {*} a new json object with the action applied
	        // */
	        //static apply(action, json) {
	        //    console.log(json, action);
	        //
	        //    let model = Model.fromJson(json);
	        //    model.doAction(action);
	        //    return model.toJson();
	        //}

	        /**
	         * Update the node tree by performing the given action,
	         * Actions should be generated via static methods on the Actions class
	         * @param action the action to perform
	         */

	    }, {
	        key: "doAction",
	        value: function doAction(action) {
	            //console.log(action);
	            switch (action.type) {
	                case _Actions2.default.ADD_NODE:
	                    {
	                        var newNode = new _TabNode2.default(this, action.json);
	                        var toNode = this._idMap[action.toNode];
	                        toNode._drop(newNode, _DockLocation2.default.getByName(action.location), action.index);
	                        break;
	                    }
	                case _Actions2.default.MOVE_NODE:
	                    {
	                        var fromNode = this._idMap[action.fromNode];
	                        var _toNode = this._idMap[action.toNode];
	                        _toNode._drop(fromNode, _DockLocation2.default.getByName(action.location), action.index);
	                        break;
	                    }
	                case _Actions2.default.DELETE_TAB:
	                    {
	                        var node = this._idMap[action.node];
	                        delete this._idMap[action.node];
	                        node._delete();
	                        break;
	                    }
	                case _Actions2.default.RENAME_TAB:
	                    {
	                        var _node = this._idMap[action.node];
	                        _node._setName(action.text);
	                        break;
	                    }
	                case _Actions2.default.SELECT_TAB:
	                    {
	                        var tabNode = this._idMap[action.tabNode];
	                        var parent = tabNode.getParent();
	                        var pos = parent.getChildren().indexOf(tabNode);

	                        if (parent.getType() === _BorderNode2.default.TYPE) {
	                            if (parent.getSelected() == pos) {
	                                parent._setSelected(-1);
	                            } else {
	                                parent._setSelected(pos);
	                            }
	                        } else {
	                            if (parent.getSelected() !== pos) {
	                                parent._setSelected(pos);
	                            }
	                            this._activeTabSet = parent;
	                        }

	                        break;
	                    }
	                case _Actions2.default.SET_ACTIVE_TABSET:
	                    {
	                        var tabsetNode = this._idMap[action.tabsetNode];
	                        this._activeTabSet = tabsetNode;
	                        break;
	                    }
	                case _Actions2.default.ADJUST_SPLIT:
	                    {
	                        var node1 = this._idMap[action.node1];
	                        var node2 = this._idMap[action.node2];

	                        this._adjustSplitSide(node1, action.weight1, action.pixelWidth1);
	                        this._adjustSplitSide(node2, action.weight2, action.pixelWidth2);
	                        break;
	                    }
	                case _Actions2.default.ADJUST_BORDER_SPLIT:
	                    {
	                        var _node2 = this._idMap[action.node];
	                        _node2._setSize(action.pos);
	                        break;
	                    }
	                case _Actions2.default.MAXIMIZE_TOGGLE:
	                    {
	                        var _node3 = this._idMap[action.node];
	                        if (_node3 === this._maximizedTabSet) {
	                            this._maximizedTabSet = null;
	                        } else {
	                            this._maximizedTabSet = _node3;
	                            this._activeTabSet = _node3;
	                        }

	                        break;
	                    }
	                case _Actions2.default.UPDATE_MODEL_ATTRIBUTES:
	                    {
	                        this._updateAttrs(action.json);
	                        break;
	                    }
	                case _Actions2.default.UPDATE_NODE_ATTRIBUTES:
	                    {
	                        var _node4 = this._idMap[action.node];
	                        _node4._updateAttrs(action.json);
	                        break;
	                    }
	            }

	            this._updateIdMap();

	            if (this._listener !== null) {
	                this._listener();
	            }
	        }
	    }, {
	        key: "_updateIdMap",
	        value: function _updateIdMap() {
	            var _this = this;

	            // regenerate idMap to stop it building up
	            this._idMap = {};
	            this.visitNodes(function (node) {
	                return _this._idMap[node.getId()] = node;
	            });
	            //console.log(JSON.stringify(Object.keys(this._idMap)));
	        }
	    }, {
	        key: "_adjustSplitSide",
	        value: function _adjustSplitSide(node, weight, pixels) {
	            node._setWeight(weight);
	            if (node.getWidth() != null && node.getOrientation() === _Orientation2.default.VERT) {
	                node._updateAttrs({ width: pixels });
	            } else if (node.getHeight() != null && node.getOrientation() === _Orientation2.default.HORZ) {
	                node._updateAttrs({ height: pixels });
	            }
	        }

	        /**
	         * Converts the model to a json object
	         * @returns {*} json object that represents this model
	         */

	    }, {
	        key: "toJson",
	        value: function toJson() {
	            var json = { global: {}, layout: {} };
	            attributeDefinitions.toJson(json.global, this._attributes);

	            // save state of nodes
	            this.visitNodes(function (node) {
	                node._fireEvent("save", null);
	            });

	            json.borders = this._borders._toJson();
	            json.layout = this._root._toJson();
	            return json;
	        }

	        /**
	         * Loads the model from the given json object
	         * @param json the json model to load
	         * @returns {Model} a new Model object
	         */

	    }, {
	        key: "getSplitterSize",
	        value: function getSplitterSize() {
	            return this._attributes["splitterSize"];
	        }
	    }, {
	        key: "isEnableEdgeDock",
	        value: function isEnableEdgeDock() {
	            return this._attributes["enableEdgeDock"];
	        }
	    }, {
	        key: "_addNode",
	        value: function _addNode(node) {
	            if (node.getId() == null) {
	                node._setId(this._nextUniqueId());
	            } else {
	                if (this._idMap[node.getId()] !== undefined) {
	                    throw "Error: each node must have a unique id, duplicate id: " + node.getId();
	                }
	            }

	            if (node.getType() !== "splitter") {
	                this._idMap[node.getId()] = node;
	            }
	        }
	    }, {
	        key: "_layout",
	        value: function _layout(rect) {
	            //let start = Date.now();
	            this._borderRects = this._borders._layout({ outer: rect, inner: rect });
	            this._root._layout(this._borderRects.inner);
	            return this._borderRects.inner;
	            //console.log("layout time: " + (Date.now() - start));
	        }
	    }, {
	        key: "_findDropTargetNode",
	        value: function _findDropTargetNode(dragNode, x, y) {
	            var node = this._root._findDropTargetNode(dragNode, x, y);
	            if (node == null) {
	                node = this._borders._findDropTargetNode(dragNode, x, y);
	            }
	            return node;
	        }
	    }, {
	        key: "_tidy",
	        value: function _tidy() {
	            //console.log("before _tidy", this.toString());
	            this._root._tidy();
	            //console.log("after _tidy", this.toString());
	        }
	    }, {
	        key: "_updateAttrs",
	        value: function _updateAttrs(json) {
	            attributeDefinitions.update(json, this._attributes);
	        }
	    }, {
	        key: "_nextUniqueId",
	        value: function _nextUniqueId() {
	            this._nextId++;
	            while (this._idMap["#" + this._nextId] !== undefined) {
	                this._nextId++;
	            }

	            return "#" + this._nextId;
	        }
	    }, {
	        key: "toString",
	        value: function toString() {
	            return JSON.stringify(this.toJson());
	        }
	    }], [{
	        key: "fromJson",
	        value: function fromJson(json) {
	            var model = new Model();
	            attributeDefinitions.fromJson(json.global, model._attributes);

	            if (json.borders) {
	                model._borders = _BorderSet2.default._fromJson(json.borders, model);
	            }
	            model._root = _RowNode2.default._fromJson(json.layout, model);
	            model._tidy(); // initial tidy of node tree
	            return model;
	        }
	    }]);

	    return Model;
	}();

	var attributeDefinitions = new _AttributeDefinitions2.default();

	// splitter
	attributeDefinitions.add("splitterSize", 8).setType(_Attribute2.default.INT).setFrom(1);
	attributeDefinitions.add("enableEdgeDock", true).setType(_Attribute2.default.BOOLEAN);

	// tab
	attributeDefinitions.add("tabEnableClose", true).setType(_Attribute2.default.BOOLEAN);
	attributeDefinitions.add("tabEnableDrag", true).setType(_Attribute2.default.BOOLEAN);
	attributeDefinitions.add("tabEnableRename", true).setType(_Attribute2.default.BOOLEAN);
	attributeDefinitions.add("tabClassName", null).setType(_Attribute2.default.STRING);
	attributeDefinitions.add("tabIcon", null).setType(_Attribute2.default.STRING);

	// tabset
	attributeDefinitions.add("tabSetEnableDeleteWhenEmpty", true).setType(_Attribute2.default.BOOLEAN);
	attributeDefinitions.add("tabSetEnableClose", true).setType(_Attribute2.default.BOOLEAN);
	attributeDefinitions.add("tabSetEnableDrop", true).setType(_Attribute2.default.BOOLEAN);
	attributeDefinitions.add("tabSetEnableDrag", true).setType(_Attribute2.default.BOOLEAN);
	attributeDefinitions.add("tabSetEnableDivide", true).setType(_Attribute2.default.BOOLEAN);
	attributeDefinitions.add("tabSetEnableMaximize", true).setType(_Attribute2.default.BOOLEAN);
	attributeDefinitions.add("tabSetClassNameTabStrip", null).setType(_Attribute2.default.STRING);
	attributeDefinitions.add("tabSetClassNameHeader", null).setType(_Attribute2.default.STRING);
	attributeDefinitions.add("tabSetEnableTabStrip", true).setType(_Attribute2.default.BOOLEAN);
	attributeDefinitions.add("tabSetHeaderHeight", 20).setType(_Attribute2.default.INT).setFrom(0);
	attributeDefinitions.add("tabSetTabStripHeight", 20).setType(_Attribute2.default.INT).setFrom(0);

	attributeDefinitions.add("borderBarSize", 25);
	attributeDefinitions.add("borderEnableDrop", true).setType(_Attribute2.default.BOOLEAN);
	attributeDefinitions.add("borderClassName", null).setType(_Attribute2.default.STRING);

	exports.default = Model;

/***/ }),
/* 35 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _Rect = __webpack_require__(15);

	var _Rect2 = _interopRequireDefault(_Rect);

	var _DockLocation = __webpack_require__(20);

	var _DockLocation2 = _interopRequireDefault(_DockLocation);

	var _BorderNode = __webpack_require__(17);

	var _BorderNode2 = _interopRequireDefault(_BorderNode);

	var _Orientation = __webpack_require__(16);

	var _Orientation2 = _interopRequireDefault(_Orientation);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var BorderSet = function () {
	    function BorderSet(model) {
	        _classCallCheck(this, BorderSet);

	        this._model = model;
	        this._borders = [];
	    }

	    _createClass(BorderSet, [{
	        key: "getBorders",
	        value: function getBorders() {
	            return this._borders;
	        }
	    }, {
	        key: "_forEachNode",
	        value: function _forEachNode(fn) {
	            this._borders.forEach(function (borderNode) {
	                fn(borderNode);
	                borderNode._children.forEach(function (node) {
	                    node._forEachNode(fn);
	                });
	            });
	        }
	    }, {
	        key: "_toJson",
	        value: function _toJson() {
	            return this._borders.map(function (borderNode) {
	                return borderNode._toJson();
	            });
	        }
	    }, {
	        key: "_layout",
	        value: function _layout(outerInnerRects) {

	            var rect = outerInnerRects.outer;
	            var height = rect.height;
	            var width = rect.width;
	            var sumHeight = 0;
	            var sumWidth = 0;
	            var countHeight = 0;
	            var countWidth = 0;
	            var adjustableHeight = 0;
	            var adjustableWidth = 0;

	            var showingBorders = this._borders.filter(function (border) {
	                return border.isShowing();
	            });

	            // sum size of borders to see they will fit
	            for (var _i = 0; _i < showingBorders.length; _i++) {
	                var border = showingBorders[_i];
	                if (border.isShowing()) {
	                    border._setAdjustedSize(border.getSize());
	                    var visible = border.getSelected() != -1;
	                    if (border.getLocation().getOrientation() == _Orientation2.default.HORZ) {
	                        sumWidth += border.getBorderBarSize() + this._model.getSplitterSize();
	                        if (visible) {
	                            sumWidth += border.getSize();
	                            adjustableWidth += border.getSize();
	                        }
	                        countWidth++;
	                    } else {
	                        sumHeight += border.getBorderBarSize() + this._model.getSplitterSize();
	                        if (visible) {
	                            sumHeight += border.getSize();
	                            adjustableHeight += border.getSize();
	                        }
	                        countHeight++;
	                    }
	                }
	            }

	            // adjust border sizes if too large
	            var i = 0;
	            while (sumWidth > width && adjustableWidth > 0 || sumHeight > height && adjustableHeight > 0) {
	                var _border = showingBorders[i];
	                if (_border.getSelected() != -1) {
	                    //visible
	                    var size = _border._getAdjustedSize();
	                    if (sumWidth > width && adjustableWidth > 0 && _border.getLocation().getOrientation() == _Orientation2.default.HORZ && size > 0) {
	                        _border._setAdjustedSize(size - 1);
	                        sumWidth--;
	                        adjustableWidth--;
	                    } else if (sumHeight > height && adjustableHeight > 0 && _border.getLocation().getOrientation() == _Orientation2.default.VERT && size > 0) {
	                        _border._setAdjustedSize(size - 1);
	                        sumHeight--;
	                        adjustableHeight--;
	                    }
	                }
	                i = (i + 1) % showingBorders.length;
	            }

	            showingBorders.forEach(function (border) {
	                outerInnerRects = border._layout(outerInnerRects);
	            });
	            return outerInnerRects;
	        }
	    }, {
	        key: "_findDropTargetNode",
	        value: function _findDropTargetNode(dragNode, x, y) {
	            for (var i = 0; i < this._borders.length; i++) {
	                var border = this._borders[i];
	                if (border.isShowing()) {
	                    var dropInfo = border._canDrop(dragNode, x, y);
	                    if (dropInfo != null) {
	                        return dropInfo;
	                    }
	                }
	            }
	            return null;
	        }
	    }], [{
	        key: "_fromJson",
	        value: function _fromJson(json, model) {
	            var borderSet = new BorderSet(model);
	            borderSet._borders = json.map(function (borderJson) {
	                return _BorderNode2.default._fromJson(borderJson, model);
	            });
	            return borderSet;
	        }
	    }]);

	    return BorderSet;
	}();

	exports.default = BorderSet;

/***/ })
/******/ ])
});
;