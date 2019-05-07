"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getLayoutChild = void 0;

var _style = require("./style");

var buttonPadding = (0, _style.getFormatMarginPaddingObject)(5, 'px', 5, 'px', 5, 'px', 5, 'px');
var buttonMargin = (0, _style.getFormatMarginPaddingObject)(5, 'px', 5, 'px', 5, 'px', 5, 'px');

var getLayoutChild = function getLayoutChild(id, label, type) {
  var userEditable = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
  var direction = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 'column';
  var obj = {
    id: id,
    // menu | button | ...
    label: label,
    type: type,
    // root | container | element,
    children: [],
    options: {}
  };

  if (type === 'root' || type === 'container') {
    obj = Object.assign(obj, {
      userEditable: userEditable,
      containerStyle: {
        flexDirection: direction,
        // column | row
        flexGrow: 0,
        // 0 | 1 | 2 | 3
        justifyContent: 'space-between',
        // normal | left | flex-start | right | flex-end | space-between | space-around | space-evenly
        alignItems: 'normal' // normal | flex-start | flex-end | center

      }
    });
    obj = Object.assign(obj, {
      containerPosition: {
        type: 'auto , fixed',
        width: 'ony if type explicit ONLY when postion fixed -> width: auto(grow on content ,50%, max-width: 200px; 50%...',
        height: '',
        overflow: ''
      }
    });
  }

  if (type === 'element') {
    obj = Object.assign(obj, {
      elementStyle: {
        flexGrow: 0,
        // 0 | 1 | 2 | 3
        flexBasis: 'auto' // 0 | auto | 240px

      }
    });
  }

  if (id === 'button') {
    obj = Object.assign(obj, {
      options: {
        action: 'menu',
        icon: 'menu',
        iconPosition: 'left',
        borderRadius: 100,
        text: '',
        font: (0, _style.getExtendedFormatObject)(12, undefined, undefined, '#000', undefined, undefined, buttonPadding, buttonMargin),
        background: {
          backgroundColor: 'rgba(0, 0, 0, 0)'
        },
        boxShadow: (0, _style.getFormatShadowObject)(0, 0, 0, 0, 'rgba(0,0,0,0.4)'),
        hoverText: '',
        hoverFont: (0, _style.getExtendedFormatObject)(12, undefined, undefined, '#fff', undefined, undefined, buttonPadding, buttonMargin),
        hoverBackground: {
          backgroundColor: 'rgba(0, 0, 0, 0.2)'
        },
        hoverBoxShadow: (0, _style.getFormatShadowObject)(0, 2, 4, 0, 'rgba(0,0,0,0.4)')
      }
    });
  }

  if (id === 'menu') {
    obj = Object.assign(obj, {
      options: {
        startOpen: false,
        showTitle: true,
        showSubTitle: true,
        type: 'full',
        // full, drawer, swiper
        position: 'left',
        // drawer: left right, swiper: top bottom
        size: {
          // swiper: height, drawer: width
          value: 200,
          unit: 'px'
        },
        overlayType: 'push',
        // swiper: overlay | push, maybe also for drawer 
        children: {
          showIcons: false,
          showImages: true
        },
        style: {
          background: {
            backgroundColor: 'rgba(255,255,255, 0.8)'
          },
          margin: (0, _style.getFormatMarginPaddingObject)(),
          pagination: (0, _style.getExtendedFormatObject)(),
          padding: (0, _style.getFormatMarginPaddingObject)(),
          children: (0, _style.getExtendedFormatObject)()
        }
      }
    });
  }

  return obj;
};

exports.getLayoutChild = getLayoutChild;