import { getExtendedFormatObject, getFormatMarginPaddingObject, getFormatShadowObject } from './style';
import { cloneObject } from '../utilities';
/**
 * WARNING - DO NOT TOUCH
 *
 * ALL THE FUNCTIONS ARE USED MULTIPLE TIMES IN CONTENT VALIDATOR !
 *
 * DO NOT TOUCH WITHOUT TALKING TO EVERYBODY
 *
 */
const getLayoutChild = (id, label, type, userEditable = false, direction = 'column') => {
  let obj = {
    id: id, // menu | button | ...
    label: label,
    type: type, // root | container | element,
    children: [],
    options: {}
  };

  if (type === 'root' || type === 'container') {
    obj = Object.assign(obj, {
      userEditable: userEditable,
      containerStyle: {
        flexDirection: direction, // column | row
        flexGrow: 0, // 0 | 1 | 2 | 3
        justifyContent: 'space-between', // normal | left | flex-start | right | flex-end | space-between | space-around | space-evenly
        alignItems: 'normal' // normal | flex-start | flex-end | center
      },
      options: {
        margin: getFormatMarginPaddingObject(0, 'px', 0, 'px', 0, 'px', 0, 'px'),
        padding: getFormatMarginPaddingObject(0, 'px', 0, 'px', 0, 'px', 0, 'px')
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
        flexGrow: 0, // 0 | 1 | 2 | 3
        flexBasis: 'auto' // 0 | auto | 240px
      }
    });
  }

  if (id === 'button') {
    // cloneObject those or we have funny linked stuff going on..
    const buttonMargin = getFormatMarginPaddingObject(5, 'px', 5, 'px', 5, 'px', 5, 'px');
    const buttonPadding = getFormatMarginPaddingObject(2, 'px', 5, 'px', 2, 'px', 5, 'px');

    obj = Object.assign(obj, {
      options: {
        action: 'menu',
        icon: 'menu',
        iconPosition: 'left',
        borderRadius: 100,
        text: '',
        font: getExtendedFormatObject(12, undefined, undefined, '#000000', undefined, undefined, cloneObject(buttonPadding), cloneObject(buttonMargin)),
        textMargin:  getFormatMarginPaddingObject(undefined,undefined,undefined,undefined,undefined,undefined,5,'px'),
        background: { backgroundColor: 'rgba(0, 0, 0, 0)' },
        boxShadow: getFormatShadowObject(0, 0, 0, 0, 'rgba(0, 0, 0, 0)'),
        hoverText: '',
        hoverFont: getExtendedFormatObject(12, undefined, undefined, '#ffffff', undefined, undefined, cloneObject(buttonPadding), cloneObject(buttonMargin)),
        hoverBackground: { backgroundColor: 'rgba(0, 0, 0, 0.2)' },
        hoverBoxShadow: getFormatShadowObject(0, 0, 3, 0, 'rgba(0, 0, 0, 0.4)')
      }
    });
  }

  if (id === 'menu') {
    obj = Object.assign(obj, {
      options: {
        startOpen: false,
        type: 'full', // full, drawer, swiper
        position: 'left', // drawer: left right, swiper: top bottom
        overlayType: 'push', // swiper: overlay | push, maybe also for drawer
        children: {
          showIcons: false,
          showImages: true,
          alignment: 'center'
        },
        style: {
          title: getExtendedFormatObject(),
          subTitle: getExtendedFormatObject(),
          background: { backgroundColor: 'rgba(255, 255, 255, 1)' },
          margin: getFormatMarginPaddingObject(),
          pagination: getExtendedFormatObject(),
          padding: getFormatMarginPaddingObject(),
          children: getExtendedFormatObject(undefined, undefined, undefined, undefined, undefined, undefined,  getFormatMarginPaddingObject(10, 'px', 10, 'px',10, 'px', 10, 'px')),
          boxShadow: getFormatShadowObject(0, 2, 25, 0, 'rgba(0, 0, 0, 0.2)'),
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
            padding: getFormatMarginPaddingObject(),
            margin: getFormatMarginPaddingObject(undefined, undefined, 15, 'px', undefined, undefined, 5, 'px'),
            boxShadow: getFormatShadowObject(0, 4, 7, 0, 'rgba(0,0,0,0.2)'),
          },
          drawer: {
            size: {
              value: 30,
              unit: '%'
            }
          },
          swiper:{
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

export { getLayoutChild };
