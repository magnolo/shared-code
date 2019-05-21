"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getLayoutChild = void 0;

var _style = require("./style");

var _utilities = require("../utilities");

/**
 * WARNING - DO NOT TOUCH
 *
 * ALL THE FUNCTIONS ARE USED MULTIPLE TIMES IN CONTENT VALIDATOR !
 *
 * DO NOT TOUCH WITHOUT TALKING TO EVERYBODY
 *
 */
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

      },
      options: {
        margin: (0, _style.getFormatMarginPaddingObject)(0, 'px', 0, 'px', 0, 'px', 0, 'px'),
        padding: (0, _style.getFormatMarginPaddingObject)(0, 'px', 0, 'px', 0, 'px', 0, 'px')
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
    // cloneObject those or we have funny linked stuff going on..
    var buttonMargin = (0, _style.getFormatMarginPaddingObject)(5, 'px', 5, 'px', 5, 'px', 5, 'px');
    var buttonPadding = (0, _style.getFormatMarginPaddingObject)(2, 'px', 5, 'px', 2, 'px', 5, 'px');
    obj = Object.assign(obj, {
      options: {
        action: 'menu',
        icon: 'menu',
        iconPosition: 'left',
        borderRadius: 100,
        text: '',
        font: (0, _style.getExtendedFormatObject)(12, undefined, undefined, '#000000', undefined, undefined, (0, _utilities.cloneObject)(buttonPadding), (0, _utilities.cloneObject)(buttonMargin)),
        textMargin: (0, _style.getFormatMarginPaddingObject)(undefined, undefined, undefined, undefined, undefined, undefined, 5, 'px'),
        background: {
          backgroundColor: 'rgba(0, 0, 0, 0)'
        },
        boxShadow: (0, _style.getFormatShadowObject)(0, 0, 0, 0, 'rgba(0, 0, 0, 0)'),
        hoverText: '',
        hoverFont: (0, _style.getExtendedFormatObject)(12, undefined, undefined, '#ffffff', undefined, undefined, (0, _utilities.cloneObject)(buttonPadding), (0, _utilities.cloneObject)(buttonMargin)),
        hoverBackground: {
          backgroundColor: 'rgba(0, 0, 0, 0.2)'
        },
        hoverBoxShadow: (0, _style.getFormatShadowObject)(0, 0, 3, 0, 'rgba(0, 0, 0, 0.4)')
      }
    });
  }

  if (id === 'menu') {
    obj = Object.assign(obj, {
      options: {
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
          title: (0, _style.getExtendedFormatObject)(),
          subTitle: (0, _style.getExtendedFormatObject)(),
          background: {
            backgroundColor: 'rgba(255, 255, 255, 1)'
          },
          margin: (0, _style.getFormatMarginPaddingObject)(),
          pagination: (0, _style.getExtendedFormatObject)(),
          padding: (0, _style.getFormatMarginPaddingObject)(),
          children: (0, _style.getExtendedFormatObject)(undefined, undefined, undefined, undefined, undefined, undefined, (0, _style.getFormatMarginPaddingObject)(10, 'px', 10, 'px', 10, 'px', 10, 'px')),
          boxShadow: (0, _style.getFormatShadowObject)(0, 2, 25, 0, 'rgba(0, 0, 0, 0.2)'),
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
            padding: (0, _style.getFormatMarginPaddingObject)(),
            margin: (0, _style.getFormatMarginPaddingObject)(undefined, undefined, 15, 'px', undefined, undefined, 5, 'px'),
            boxShadow: (0, _style.getFormatShadowObject)(0, 4, 7, 0, 'rgba(0,0,0,0.2)')
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
      }
    });
  }

  return obj;
};

exports.getLayoutChild = getLayoutChild;