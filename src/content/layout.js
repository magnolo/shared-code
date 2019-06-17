import uuid from 'uuid/v4';

import { getExtendedFormatObject, getFormatMarginPaddingObject, getFormatShadowObject } from './style';
import { cloneObject } from '../utilities';

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

const getLayoutChildObjects = layout => layout.children.reduce((acc, obj) => acc.concat(obj, getLayoutChildObjects(obj)), []);

const validateLayout = obj => {
  for (const key of Object.keys(obj.layouts)) {
    const layout = obj.layouts[key];
    layout.version = layout.version !== undefined ? layout.version : 1;

    if (layout.version === 1) {
      const childObjects = getLayoutChildObjects(layout);
      for (const child of childObjects) {
        if (['root', 'container'].includes(child.type)) {
          // backup
          const oldId = child.id;
          const style = cloneObject(child.containerStyle);

          // delete
          delete child.containerStyle;
          delete child.containerPosition;
          delete child.userEditable;

          // apply
          child.id = uuid();
          child.type = 'container';

          child.style = style;
          if (child.style.position === undefined) child.style.position = 'initial';
          if (child.style.zIndex === undefined) child.style.zIndex = 1;
          if (oldId === 'content') child.style.zIndex = 0;
        }

        if (child.type === 'element') {
          // backup
          const oldId = child.id;
          const style = cloneObject(child.elementStyle);

          // delete
          delete child.elementStyle;

          // apply
          child.id = uuid();
          child.type = oldId;
          if (child.type === 'viselement') child.type = 'content-selector';

          child.style = style;
        }
      }

      layout.version = 2;
    }

    // @hedata: ADDED BACKGROUND OPTIONS FOR CONTAINER ROW
    if (layout.version === 2) {
      const childObjects = getLayoutChildObjects(layout);
      for (const child of childObjects) {
        if (['container'].includes(child.type)) {
          // @hedata: ADDED BACKGROUND OPTIONS FOR CONTAINER ROW
          if (child.style.background === undefined) child.style.background = { backgroundColor: 'rgba(0, 0, 0, 0)' };
        }
        if (['container', 'root'].includes(child.type)) {
          if (child.style.position !== 'absolute' && child.style.zIndex === 1) child.style.zIndex = 'auto'
        }
      }

      //layout.version = 3;
    }
    // END
  }

  return obj;
};

const createLayoutObject = (type, label, style = {}) => {
  let obj = {
    id: uuid(), // random generated id
    type: type, // root | container | menu | button | ...
    label: label,
    children: [],
    options: {},
    style: {
      flexGrow: 0 // 0 | 1
    }
  };

  if (type === 'container') {
    obj.style = Object.assign(obj.style, {
      flexDirection: 'row', // column | row
      justifyContent: 'space-between', // normal | left | flex-start | right | flex-end | space-between | space-around | space-evenly
      alignItems: 'normal', // normal | flex-start | flex-end | center
      position: 'initial', // initial | relative | absolute
      zIndex: 'auto',
      background: { backgroundColor: 'rgba(0, 0, 0, 0)' } // @hedata: ADDED BACKGROUND OPTIONS FOR CONTAINER ROW
    });

    obj.options = Object.assign(obj.options, {
      margin: getFormatMarginPaddingObject(),
      padding: getFormatMarginPaddingObject()
    });
  }

  if (type === 'button') {
    // cloneObject those or we have funny linked stuff going on..
    const buttonMargin = getFormatMarginPaddingObject(5, 'px', 5, 'px', 5, 'px', 5, 'px');
    const buttonPadding = getFormatMarginPaddingObject(2, 'px', 5, 'px', 2, 'px', 5, 'px');

    obj.options = Object.assign(obj.options, {
      action: 'menu',
      icon: 'menu',
      iconPosition: 'left',
      borderRadius: 100,
      text: '',
      font: getExtendedFormatObject(12, undefined, undefined, '#000000', undefined, undefined, cloneObject(buttonPadding), cloneObject(buttonMargin)),
      textMargin: getFormatMarginPaddingObject(undefined, undefined, undefined, undefined, undefined, undefined, 5, 'px'),
      background: { backgroundColor: 'rgba(0, 0, 0, 0)' },
      boxShadow: getFormatShadowObject(0, 0, 0, 0, 'rgba(0, 0, 0, 0)'),
      hoverText: '',
      hoverFont: getExtendedFormatObject(12, undefined, undefined, '#ffffff', undefined, undefined, cloneObject(buttonPadding), cloneObject(buttonMargin)),
      hoverBackground: { backgroundColor: 'rgba(0, 0, 0, 0.2)' },
      hoverBoxShadow: getFormatShadowObject(0, 0, 3, 0, 'rgba(0, 0, 0, 0.4)')
    });
  }

  if (type === 'logo') {
    obj.options = Object.assign(obj.options, {
      width: 32,
      height: 32,
      borderRadius: 0,
      margin: getFormatMarginPaddingObject(),
      padding: getFormatMarginPaddingObject(),
      boxShadow: getFormatShadowObject(0, 0, 0, 0, 'rgba(0, 0, 0, 0)')
    });
  }

  if (type === 'map-legend') {
    obj.options = Object.assign(obj.options, {
      borderRadius: 100,
      margin: getFormatMarginPaddingObject(10, 'px', 10, 'px', 10, 'px', 10, 'px'),
      padding: getFormatMarginPaddingObject(),
      boxShadow: getFormatShadowObject(0, 0, 0, 0, 'rgba(0, 0, 0, 0)')
    });
  }

  if (type === 'search') {
    obj.options = Object.assign(obj.options, {
      borderRadius: 100,
      margin: getFormatMarginPaddingObject(10, 'px', 10, 'px', 10, 'px', 10, 'px'),
      padding: getFormatMarginPaddingObject(),
      boxShadow: getFormatShadowObject(0, 0, 0, 0, 'rgba(0, 0, 0, 0)')
    });
  }

  if (type === 'menu') {
    obj.options = Object.assign(obj.options, {
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
        children: getExtendedFormatObject(
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          getFormatMarginPaddingObject(10, 'px', 10, 'px', 10, 'px', 10, 'px')
        ),
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
          boxShadow: getFormatShadowObject(0, 4, 7, 0, 'rgba(0,0,0,0.2)')
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

const createAtlasLayout = content => {
  const { type, typeSpecific } = content;

  // root container
  const containerStyle = { flexDirection: 'column', alignItems: 'normal', zIndex: 'auto' };
  const containerHeader = createLayoutObject('container', 'Header', { ...containerStyle });
  const containerContent = createLayoutObject('container', 'Content', { ...containerStyle, flexGrow: 1, position: 'relative' });
  const containerFooter = createLayoutObject('container', 'Footer', { ...containerStyle });

  // rows
  const rowHeader1 = createLayoutObject('container', 'Row', { alignItems: 'center' });
  const rowHeader2 = createLayoutObject('container', 'Row', { alignItems: 'center' });
  const rowHeader3 = createLayoutObject('container', 'Row');

  const rowContentContainer = createLayoutObject('container', 'Row', { position: 'absolute', width: '100%', height: '100%', flexDirection: 'column' });

  const rowContent1 = createLayoutObject('container', 'Row');

  const rowFooter1 = createLayoutObject('container', 'Row', { alignItems: 'center' });
  const rowFooter2 = createLayoutObject('container', 'Row');

  // elements
  const elementTitle = createLayoutObject('title', 'Title', { flexGrow: 1 });
  const elementSubtitle = createLayoutObject('subTitle', 'Subtitle', { flexGrow: 1 });

  const elementButtonMenu = createLayoutObject('button', 'Button');
  elementButtonMenu.options.action = 'menu';
  elementButtonMenu.options.icon = 'menu';
  const elementButtonPrev = createLayoutObject('button', 'Button');
  elementButtonPrev.options.action = 'prev';
  elementButtonPrev.options.icon = 'chevron-left';
  const elementButtonNext = createLayoutObject('button', 'Button');
  elementButtonNext.options.action = 'next';
  elementButtonNext.options.icon = 'chevron-right';
  const elementMenu = createLayoutObject('menu', 'Menu');
  elementMenu.options.style.title = cloneObject(typeSpecific.style.title);
  elementMenu.options.style.subTitle = cloneObject(typeSpecific.style.subTitle);

  // If we want to space out the default left menu button
  elementMenu.options.style.title.padding.left = 36;
  elementMenu.options.style.title.padding.right = 36;
  elementMenu.options.style.title.padding.top = 5;
  elementMenu.options.style.subTitle.padding.left = 5;
  elementMenu.options.style.subTitle.padding.right = 5;

  // visual
  const elementContentSelector = createLayoutObject('content-selector', 'Content Selector', { flexGrow: 1 });

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

  const layout = {
    active: 'default',
    layouts: {
      default: {
        version: 2,
        id: 'default',
        label: 'Default Layout',
        children: [containerHeader, containerContent, containerFooter]
      }
    }
  };

  return layout;
};

const createVisualLayout = content => {
  const { type, typeSpecific } = content;

  // root container
  const containerStyle = { flexDirection: 'column', alignItems: 'normal', zIndex: 'auto' };
  const containerHeader = createLayoutObject('container', 'Header', { ...containerStyle });
  const containerContent = createLayoutObject('container', 'Content', { ...containerStyle, flexGrow: 1, position: 'relative' });
  const containerFooter = createLayoutObject('container', 'Footer', { ...containerStyle });

  // rows
  const rowHeader1 = createLayoutObject('container', 'Row');
  const rowHeader2 = createLayoutObject('container', 'Row');
  const rowHeader3 = createLayoutObject('container', 'Row');
  const rowHeader4 = createLayoutObject('container', 'Row');
  const rowHeader5 = createLayoutObject('container', 'Row');

  const rowContentContainer = createLayoutObject('container', 'Row', { position: 'absolute', width: '100%', height: '100%', flexDirection: 'column', zIndex: 0 });

  const rowContent1 = createLayoutObject('container', 'Row');
  const rowContent2 = createLayoutObject('container', 'Row');
  const rowContent3 = createLayoutObject('container', 'Row');

  const rowFooter1 = createLayoutObject('container', 'Row', { bottom: 0, alignItems: 'center' });
  const rowFooter2 = createLayoutObject('container', 'Row', { bottom: 0 });

  // elements
  const elementTitle = createLayoutObject('title', 'Title', { flexGrow: 1 });
  const elementSubtitle = createLayoutObject('subTitle', 'Subtitle', { flexGrow: 1 });
  const elementFilter = createLayoutObject('filter', 'Filter', { flexGrow: 1 });
  const elementLegend = createLayoutObject('legend', 'Chart Legend', { flexGrow: 1 });
  const elementMapLegend = createLayoutObject('map-legend', 'Map Legend');
  const elementMapSearch = createLayoutObject('search', 'Map Search');
  const elementLogo = createLayoutObject('logo', 'Logo');
  const elementSource = createLayoutObject('source', 'Source');
  const elementButtonInfo = createLayoutObject('button', 'Button');
  elementButtonInfo.options.action = 'overlay';
  elementButtonInfo.options.icon = 'info-1';

  // visual
  const elementVisual = createLayoutObject('visual', 'Visual', { flexGrow: 1 });
  const elementVisualOverlay = createLayoutObject('overlay', 'Overlay', { flexGrow: 1 });

  rowHeader1.children.push(elementTitle);
  rowHeader2.children.push(elementSubtitle);
  rowHeader3.children.push(elementFilter);
  rowHeader4.children.push(elementLegend);

  //row Cotent 1 -> subRow
  const subRowContent = createLayoutObject('container', 'Subrow', { flexDirection: 'column' });
  subRowContent.children.push(elementMapSearch);
  subRowContent.children.push(elementMapLegend);
  rowContent1.children.push(subRowContent);
  //map Specific parts
  //rowContent1.children.push(elementMapSearch);
  //rowContent3.children.push(elementMapLegend);

  rowFooter1.children.push(elementLogo, elementSource, elementButtonInfo);

  rowContentContainer.children.push(rowContent1, rowContent2, rowContent3);

  containerHeader.children.push(rowHeader1, rowHeader2, rowHeader3, rowHeader4, rowHeader5);
  containerContent.children.push(elementVisual, rowContentContainer, elementVisualOverlay);
  containerFooter.children.push(rowFooter1, rowFooter2);

  const layout = {
    active: 'default',
    layouts: {
      default: {
        version: 2,
        id: 'default',
        label: 'Default Layout',
        children: [containerHeader, containerContent, containerFooter]
      }
    }
  };

  return layout;
};

export { createLayoutObject, getLayoutChildObjects, createAtlasLayout, createVisualLayout, validateLayout };
