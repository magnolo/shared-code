"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.validateLayout = exports.createVisualLayout = exports.createAtlasLayout = exports.getLayoutChildObjects = exports.createLayoutObject = void 0;

var _v = _interopRequireDefault(require("uuid/v4"));

var _style2 = require("./style");

var _utilities = require("../utilities");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * WARNING - DO NOT TOUCH
 *
 * ALL THE FUNCTIONS ARE USED MULTIPLE TIMES IN CONTENT VALIDATOR !
 *
 * DO NOT TOUCH WITHOUT TALKING TO EVERYBODY
 *
 * WHEN CHANGING GENERATED VERSION PATCH TAGESSCHAU HACKS IN CONTENT VALIDATOR!
 *
 */
var getLayoutChildObjects = function getLayoutChildObjects(layout) {
  return layout.children.reduce(function (acc, obj) {
    return acc.concat(obj, getLayoutChildObjects(obj));
  }, []);
};

exports.getLayoutChildObjects = getLayoutChildObjects;

var validateLayout = function validateLayout(obj) {
  for (var _i = 0, _Object$keys = Object.keys(obj.layouts); _i < _Object$keys.length; _i++) {
    var key = _Object$keys[_i];
    var layout = obj.layouts[key];
    layout.version = layout.version !== undefined ? layout.version : 1;

    if (layout.version === 1) {
      var childObjects = getLayoutChildObjects(layout);
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = childObjects[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var child = _step.value;

          if (['root', 'container'].includes(child.type)) {
            // backup
            var oldId = child.id;
            var style = (0, _utilities.cloneObject)(child.containerStyle); // delete

            delete child.containerStyle;
            delete child.containerPosition;
            delete child.userEditable; // apply

            child.id = (0, _v["default"])();
            child.type = 'container';
            child.style = style;
            if (child.style.position === undefined) child.style.position = 'initial';
            if (child.style.zIndex === undefined) child.style.zIndex = 1;
            if (oldId === 'content') child.style.zIndex = 0;
          }

          if (child.type === 'element') {
            // backup
            var _oldId = child.id;

            var _style = (0, _utilities.cloneObject)(child.elementStyle); // delete


            delete child.elementStyle; // apply

            child.id = (0, _v["default"])();
            child.type = _oldId;
            if (child.type === 'viselement') child.type = 'content-selector';
            child.style = _style;
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator["return"] != null) {
            _iterator["return"]();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      layout.version = 2;
    } // @hedata: ADDED BACKGROUND OPTIONS FOR CONTAINER ROW


    if (layout.version === 2) {
      var _childObjects = getLayoutChildObjects(layout);

      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = _childObjects[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var _child = _step2.value;

          if (['container'].includes(_child.type)) {
            // @hedata: ADDED BACKGROUND OPTIONS FOR CONTAINER ROW
            if (_child.style.background === undefined) _child.style.background = {
              backgroundColor: 'rgba(0, 0, 0, 0)'
            };
          }

          if (['container', 'root'].includes(_child.type)) {
            if (_child.style.position !== 'absolute' && _child.style.zIndex === 1) _child.style.zIndex = 'auto';
          }
        } //layout.version = 3;

      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
            _iterator2["return"]();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }
    } // END

  }

  return obj;
};

exports.validateLayout = validateLayout;

var createLayoutObject = function createLayoutObject(type, label) {
  var style = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var obj = {
    id: (0, _v["default"])(),
    // random generated id
    type: type,
    // root | container | menu | button | ...
    label: label,
    children: [],
    options: {},
    style: {
      flexGrow: 0 // 0 | 1

    }
  };

  if (type === 'container') {
    obj.style = Object.assign(obj.style, {
      flexDirection: 'row',
      // column | row
      justifyContent: 'space-between',
      // normal | left | flex-start | right | flex-end | space-between | space-around | space-evenly
      alignItems: 'normal',
      // normal | flex-start | flex-end | center
      position: 'initial',
      // initial | relative | absolute
      zIndex: 'auto',
      background: {
        backgroundColor: 'rgba(0, 0, 0, 0)' // @hedata: ADDED BACKGROUND OPTIONS FOR CONTAINER ROW

      }
    });
    obj.options = Object.assign(obj.options, {
      margin: (0, _style2.getFormatMarginPaddingObject)(),
      padding: (0, _style2.getFormatMarginPaddingObject)()
    });
  }

  if (type === 'button') {
    // cloneObject those or we have funny linked stuff going on..
    var buttonMargin = (0, _style2.getFormatMarginPaddingObject)(5, 'px', 5, 'px', 5, 'px', 5, 'px');
    var buttonPadding = (0, _style2.getFormatMarginPaddingObject)(2, 'px', 5, 'px', 2, 'px', 5, 'px');
    obj.options = Object.assign(obj.options, {
      action: 'menu',
      icon: 'menu',
      iconPosition: 'left',
      borderRadius: 100,
      text: '',
      font: (0, _style2.getExtendedFormatObject)(12, undefined, undefined, '#000000', undefined, undefined, (0, _utilities.cloneObject)(buttonPadding), (0, _utilities.cloneObject)(buttonMargin)),
      textMargin: (0, _style2.getFormatMarginPaddingObject)(undefined, undefined, undefined, undefined, undefined, undefined, 5, 'px'),
      background: {
        backgroundColor: 'rgba(0, 0, 0, 0)'
      },
      boxShadow: (0, _style2.getFormatShadowObject)(0, 0, 0, 0, 'rgba(0, 0, 0, 0)'),
      hoverText: '',
      hoverFont: (0, _style2.getExtendedFormatObject)(12, undefined, undefined, '#ffffff', undefined, undefined, (0, _utilities.cloneObject)(buttonPadding), (0, _utilities.cloneObject)(buttonMargin)),
      hoverBackground: {
        backgroundColor: 'rgba(0, 0, 0, 0.2)'
      },
      hoverBoxShadow: (0, _style2.getFormatShadowObject)(0, 0, 3, 0, 'rgba(0, 0, 0, 0.4)')
    });
  }

  if (type === 'logo') {
    obj.options = Object.assign(obj.options, {
      width: 32,
      height: 32,
      borderRadius: 0,
      margin: (0, _style2.getFormatMarginPaddingObject)(),
      padding: (0, _style2.getFormatMarginPaddingObject)(),
      boxShadow: (0, _style2.getFormatShadowObject)(0, 0, 0, 0, 'rgba(0, 0, 0, 0)')
    });
  }

  if (type === 'map-legend') {
    obj.options = Object.assign(obj.options, {
      borderRadius: 100,
      margin: (0, _style2.getFormatMarginPaddingObject)(10, 'px', 10, 'px', 10, 'px', 10, 'px'),
      padding: (0, _style2.getFormatMarginPaddingObject)(),
      boxShadow: (0, _style2.getFormatShadowObject)(0, 0, 0, 0, 'rgba(0, 0, 0, 0)')
    });
  }

  if (type === 'search') {
    obj.options = Object.assign(obj.options, {
      borderRadius: 100,
      margin: (0, _style2.getFormatMarginPaddingObject)(10, 'px', 10, 'px', 10, 'px', 10, 'px'),
      padding: (0, _style2.getFormatMarginPaddingObject)(),
      boxShadow: (0, _style2.getFormatShadowObject)(0, 0, 0, 0, 'rgba(0, 0, 0, 0)')
    });
  }

  if (type === 'menu') {
    obj.options = Object.assign(obj.options, {
      startOpen: false,
      type: 'full',
      // full, drawer, swiper
      position: 'left',
      // drawer: left right, swiper: top bottom
      overlayType: 'push',
      // swiper: overlay | push, maybe also for drawer
      children: {
        showIcons: false,
        showImages: true,
        alignment: 'center'
      },
      style: {
        title: (0, _style2.getExtendedFormatObject)(),
        subTitle: (0, _style2.getExtendedFormatObject)(),
        background: {
          backgroundColor: 'rgba(255, 255, 255, 1)'
        },
        margin: (0, _style2.getFormatMarginPaddingObject)(),
        pagination: (0, _style2.getExtendedFormatObject)(),
        padding: (0, _style2.getFormatMarginPaddingObject)(),
        children: (0, _style2.getExtendedFormatObject)(undefined, undefined, undefined, undefined, undefined, undefined, (0, _style2.getFormatMarginPaddingObject)(10, 'px', 10, 'px', 10, 'px', 10, 'px')),
        boxShadow: (0, _style2.getFormatShadowObject)(0, 2, 25, 0, 'rgba(0, 0, 0, 0.2)'),
        images: {
          width: {
            desktop: {
              value: 20,
              unit: '%'
            },
            mobile: {
              value: 33,
              unit: '%'
            }
          },
          padding: (0, _style2.getFormatMarginPaddingObject)(),
          margin: (0, _style2.getFormatMarginPaddingObject)(undefined, undefined, 15, 'px', undefined, undefined, 5, 'px'),
          boxShadow: (0, _style2.getFormatShadowObject)(0, 4, 7, 0, 'rgba(0,0,0,0.2)')
        },
        drawer: {
          size: {
            value: 30,
            unit: '%'
          }
        },
        swiper: {
          size: {
            value: 200,
            unit: 'px'
          }
        }
      }
    });
  }

  obj.style = Object.assign(obj.style, style);
  return obj;
};

exports.createLayoutObject = createLayoutObject;

var createAtlasLayout = function createAtlasLayout(content) {
  var type = content.type,
      typeSpecific = content.typeSpecific; // root container

  var containerStyle = {
    flexDirection: 'column',
    alignItems: 'normal',
    zIndex: 'auto'
  };
  var containerHeader = createLayoutObject('container', 'Header', _objectSpread({}, containerStyle));
  var containerContent = createLayoutObject('container', 'Content', _objectSpread({}, containerStyle, {
    flexGrow: 1,
    position: 'relative'
  }));
  var containerFooter = createLayoutObject('container', 'Footer', _objectSpread({}, containerStyle)); // rows

  var rowHeader1 = createLayoutObject('container', 'Row', {
    alignItems: 'center'
  });
  var rowHeader2 = createLayoutObject('container', 'Row', {
    alignItems: 'center'
  });
  var rowHeader3 = createLayoutObject('container', 'Row');
  var rowContentContainer = createLayoutObject('container', 'Row', {
    position: 'absolute',
    width: '100%',
    height: '100%',
    flexDirection: 'column'
  });
  var rowContent1 = createLayoutObject('container', 'Row');
  var rowFooter1 = createLayoutObject('container', 'Row', {
    alignItems: 'center'
  });
  var rowFooter2 = createLayoutObject('container', 'Row'); // elements

  var elementTitle = createLayoutObject('title', 'Title', {
    flexGrow: 1
  });
  var elementSubtitle = createLayoutObject('subTitle', 'Subtitle', {
    flexGrow: 1
  });
  var elementButtonMenu = createLayoutObject('button', 'Button');
  elementButtonMenu.options.action = 'menu';
  elementButtonMenu.options.icon = 'menu';
  var elementButtonPrev = createLayoutObject('button', 'Button');
  elementButtonPrev.options.action = 'prev';
  elementButtonPrev.options.icon = 'chevron-left';
  var elementButtonNext = createLayoutObject('button', 'Button');
  elementButtonNext.options.action = 'next';
  elementButtonNext.options.icon = 'chevron-right';
  var elementMenu = createLayoutObject('menu', 'Menu');
  elementMenu.options.style.title = (0, _utilities.cloneObject)(typeSpecific.style.title);
  elementMenu.options.style.subTitle = (0, _utilities.cloneObject)(typeSpecific.style.subTitle); // If we want to space out the default left menu button

  elementMenu.options.style.title.padding.left = 36;
  elementMenu.options.style.title.padding.right = 36;
  elementMenu.options.style.title.padding.top = 5;
  elementMenu.options.style.subTitle.padding.left = 5;
  elementMenu.options.style.subTitle.padding.right = 5; // visual

  var elementContentSelector = createLayoutObject('content-selector', 'Content Selector', {
    flexGrow: 1
  });

  if (typeSpecific.atlas.showBurger && typeSpecific.atlas.showNext) {
    if (content.injected) {
      rowHeader1.children.push(elementButtonMenu, elementTitle, elementButtonPrev, elementButtonNext);
    } else {
      rowHeader1.children.push(elementButtonMenu, elementTitle, elementButtonNext);
    }
  }

  if (typeSpecific.atlas.showBurger && !typeSpecific.atlas.showNext) {
    rowHeader1.children.push(elementTitle, elementButtonMenu);
  }

  if (!typeSpecific.atlas.showBurger && typeSpecific.atlas.showNext) {
    rowHeader1.children.push(elementTitle, elementButtonNext);
  }

  rowHeader2.children.push(elementSubtitle);
  rowFooter1.children.push(elementMenu);
  rowContentContainer.children.push(rowContent1);
  containerHeader.children.push(rowHeader1, rowHeader2, rowHeader3);
  containerContent.children.push(elementContentSelector, rowContentContainer);
  containerFooter.children.push(rowFooter1, rowFooter2);
  var layout = {
    active: 'default',
    layouts: {
      "default": {
        version: 2,
        id: 'default',
        label: 'Default Layout',
        children: [containerHeader, containerContent, containerFooter]
      }
    }
  };
  return layout;
};

exports.createAtlasLayout = createAtlasLayout;

var createVisualLayout = function createVisualLayout(content) {
  var type = content.type,
      typeSpecific = content.typeSpecific; // root container

  var containerStyle = {
    flexDirection: 'column',
    alignItems: 'normal',
    zIndex: 'auto'
  };
  var containerHeader = createLayoutObject('container', 'Header', _objectSpread({}, containerStyle));
  var containerContent = createLayoutObject('container', 'Content', _objectSpread({}, containerStyle, {
    flexGrow: 1,
    position: 'relative'
  }));
  var containerFooter = createLayoutObject('container', 'Footer', _objectSpread({}, containerStyle)); // rows

  var rowHeader1 = createLayoutObject('container', 'Row');
  var rowHeader2 = createLayoutObject('container', 'Row');
  var rowHeader3 = createLayoutObject('container', 'Row');
  var rowHeader4 = createLayoutObject('container', 'Row');
  var rowHeader5 = createLayoutObject('container', 'Row');
  var rowContentContainer = createLayoutObject('container', 'Row', {
    position: 'absolute',
    width: '100%',
    height: '100%',
    flexDirection: 'column',
    zIndex: 0
  });
  var rowContent1 = createLayoutObject('container', 'Row');
  var rowContent2 = createLayoutObject('container', 'Row');
  var rowContent3 = createLayoutObject('container', 'Row');
  var rowFooter1 = createLayoutObject('container', 'Row', {
    bottom: 0,
    alignItems: 'center'
  });
  var rowFooter2 = createLayoutObject('container', 'Row', {
    bottom: 0
  }); // elements

  var elementTitle = createLayoutObject('title', 'Title', {
    flexGrow: 1
  });
  var elementSubtitle = createLayoutObject('subTitle', 'Subtitle', {
    flexGrow: 1
  });
  var elementFilter = createLayoutObject('filter', 'Filter', {
    flexGrow: 1
  });
  var elementLegend = createLayoutObject('legend', 'Chart Legend', {
    flexGrow: 1
  });
  var elementMapLegend = createLayoutObject('map-legend', 'Map Legend');
  var elementMapSearch = createLayoutObject('search', 'Map Search');
  var elementLogo = createLayoutObject('logo', 'Logo');
  var elementSource = createLayoutObject('source', 'Source');
  var elementButtonInfo = createLayoutObject('button', 'Button');
  elementButtonInfo.options.action = 'overlay';
  elementButtonInfo.options.icon = 'info-1'; // visual

  var elementVisual = createLayoutObject('visual', 'Visual', {
    flexGrow: 1
  });
  var elementVisualOverlay = createLayoutObject('overlay', 'Overlay', {
    flexGrow: 1
  });
  rowHeader1.children.push(elementTitle);
  rowHeader2.children.push(elementSubtitle);
  rowHeader3.children.push(elementFilter);
  rowHeader4.children.push(elementLegend); //row Cotent 1 -> subRow

  var subRowContent = createLayoutObject('container', 'Subrow', {
    flexDirection: 'column'
  });
  subRowContent.children.push(elementMapSearch);
  subRowContent.children.push(elementMapLegend);
  rowContent1.children.push(subRowContent); //map Specific parts
  //rowContent1.children.push(elementMapSearch);
  //rowContent3.children.push(elementMapLegend);

  rowFooter1.children.push(elementLogo, elementSource, elementButtonInfo);
  rowContentContainer.children.push(rowContent1, rowContent2, rowContent3);
  containerHeader.children.push(rowHeader1, rowHeader2, rowHeader3, rowHeader4, rowHeader5);
  containerContent.children.push(elementVisual, rowContentContainer, elementVisualOverlay);
  containerFooter.children.push(rowFooter1, rowFooter2);
  var layout = {
    active: 'default',
    layouts: {
      "default": {
        version: 2,
        id: 'default',
        label: 'Default Layout',
        children: [containerHeader, containerContent, containerFooter]
      }
    }
  };
  return layout;
};

exports.createVisualLayout = createVisualLayout;