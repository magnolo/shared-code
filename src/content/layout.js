import { getExtendedFormatObject, getFormatMarginPaddingObject, getFormatShadowObject } from './style';

const buttonPadding = getFormatMarginPaddingObject(5, 'px', 5, 'px', 5, 'px', 5, 'px');
const buttonMargin = getFormatMarginPaddingObject(5, 'px', 5, 'px', 5, 'px', 5, 'px');

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
    obj = Object.assign(obj, {
      options: {
        action: 'menu',
        icon: 'menu',
        iconPosition: 'left',
        borderRadius: 100,
        text: '',
        font: getExtendedFormatObject(12, undefined, undefined, '#000', undefined, undefined, buttonPadding, buttonMargin),
        background: { backgroundColor: 'rgba(0, 0, 0, 0)' },
        boxShadow: getFormatShadowObject(0, 0, 0, 0, 'rgba(0,0,0,0.4)'),
        hoverText: '',
        hoverFont: getExtendedFormatObject(12, undefined, undefined, '#fff', undefined, undefined, buttonPadding, buttonMargin),
        hoverBackground: { backgroundColor: 'rgba(0, 0, 0, 0.2)' },
        hoverBoxShadow: getFormatShadowObject(0, 2, 4, 0, 'rgba(0,0,0,0.4)')
      }
    });
  }

  if (id === 'menu') {
    obj = Object.assign(obj, {
      options: {
        startOpen: false,
        showTitle: true,
        showSubTitle: true,
        type: 'full', // full, drawer, swiper
        position: 'left', // drawer: left right, swiper: top bottom
        size: { // swiper: height, drawer: width
          value: 200,
          unit: 'px'
        },
        overlayType: 'push', // swiper: overlay | push, maybe also for drawer 
        children: {
          showIcons: false,
          showImages: true
        },
        style: {
          background: { backgroundColor: 'rgba(255,255,255, 0.8)' },
          margin: getFormatMarginPaddingObject(),
          pagination: getExtendedFormatObject(),
          padding: getFormatMarginPaddingObject(),
          children: getExtendedFormatObject()
        }
      }
    });
  }

  return obj;
};

export { getLayoutChild };
