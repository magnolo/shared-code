/**
 * a validator for templates
 */
import { scaleLinear } from 'd3-scale';
import { isObject, roundTo } from '../utilities';
import { validateLayout } from '../content/layout';
import { getFormatMarginPaddingObject } from '../content/style';

const styleReducer = (accumulator, obj) => {
  if (isObject(obj) && 'fontFamily' in obj && 'color' in obj) accumulator.push(obj);
  if (Array.isArray(obj) || isObject(obj)) accumulator = accumulator.concat(getStyleObjects(obj));
  return accumulator;
};

const getStyleObjects = obj => (Array.isArray(obj) ? obj : Object.values(obj)).reduce(styleReducer, []);

export const validateTemplate = template => {
  const { templateValues } = template;
  if (template && templateValues) {
    console.log('[TemplateValidator] validateTemplate ', template.id, ' version: ', template.version);
    if (template.version < 2) {
      const styleObjects = getStyleObjects(templateValues);

      for (const obj of styleObjects) {
        if (obj.fontFamily === '"Thesis Plain", sans') {
          obj.fontFamily = 'Thesis, sans';
          obj.weight = '400';
        }
        if (obj.fontFamily === '"Thesis ExtraBold", sans') {
          obj.fontFamily = 'Thesis, sans';
          obj.weight = '800';
        }

        obj.fontFamily = obj.fontFamily.replace('Merriweather Italic', 'Merriweather');
        obj.fontFamily = obj.fontFamily.replace('Merriweather Sans Italic', 'Merriweather Sans');
        obj.fontFamily = obj.fontFamily.replace(/"/g, "'");
        obj.weight = String(obj.weight);
      }

      //look if we have key for breakPoints
      //keys: embedviewbreakpoints reportembedviewbreakpoints atlasembedviewbreakpoints
      for (const checkkey of ['embedviewbreakpoints', 'reportembedviewbreakpoints', 'atlasembedviewbreakpoints']) {
        if (templateValues[checkkey]) {
          const breakPoints = templateValues[checkkey].value;
          const minDomain = breakPoints.values[1].domain;
          const maxDomain = breakPoints.values[2].domain;

          const aspectScale = scaleLinear()
            .domain([minDomain, maxDomain])
            .range([3 / 4, 4 / 3])
            .clamp(true);

          for (const breakPoint of breakPoints.values) {
            breakPoint.aspectRatio = breakPoint.aspectRatio || roundTo(aspectScale(breakPoint.domain), 3);
          }
        }
      }

      //APP PUSH 09.05.2019
      template.version = 2;
    }

    if (template.version < 3) {
      if (templateValues['atlaslayout']) {
        templateValues['atlaslayout'].value = validateLayout(templateValues['atlaslayout'].value, 'atlas');
      }

      template.version = 3;
      //APP PUSH 05.06.2019
    }

    //APP PUSH 17.10.2019
    if (template.version < 4) {
      if (templateValues['visualizationadvancedtooltip']) {
        const style = templateValues['visualizationadvancedtooltip'].value.style;
        const mobileHeightValue = style.classic.maxHeight.mobile.value;
        const desktopHeightValue = style.classic.maxHeight.desktop.value;

        if (mobileHeightValue > 50) {
          style.classic.maxHeight.mobile.value = 50;
        }

        if (desktopHeightValue > 60) {
          style.classic.maxHeight.desktop.value = 60;
        }

        templateValues['visualizationadvancedtooltip'].value.style = style;
      }

      template.version = 4;
    }

    //CAREFULL ALSO UPDATE TEMPLATE BASE VERSION In templates.ts
    if (template.version < 5) {
      if (templateValues['mapviewport']) {
        const saveValue = templateValues['mapviewport'].value;
        if (saveValue.type === 'flyTo') {
          //bounding box startViewport
          //check if fly to is right
          let startViewport = saveValue.value;
          if (startViewport && Array.isArray(startViewport) && startViewport.length > 2) {
            startViewport = [
              [startViewport[0], startViewport[1]],
              [startViewport[2], startViewport[3]]
            ];
          }

          saveValue.type = 'startViewport';
          saveValue.value = {
            startViewport: startViewport,
            maxViewport: [
              [-180, -85],
              [180, 85]
            ],
            maxViewportIsLimit: false,
            withStartAnimation: true
          };
        }

        if (saveValue.type === 'fitBounds') {
          //start view Port
          let startViewport = saveValue.value;
          if (startViewport && Array.isArray(startViewport) && startViewport.length > 2) {
            startViewport = [
              [startViewport[0], startViewport[1]],
              [startViewport[2], startViewport[3]]
            ];
          }

          saveValue.type = 'startViewport';
          saveValue.value = {
            startViewport: startViewport,
            maxViewport: [
              [-180, -85],
              [180, 85]
            ],
            maxViewportIsLimit: false,
            withStartAnimation: false
          };
        }

        if (saveValue.type === 'maxBounds') {
          //start view Port
          let maxViewport = saveValue.value;
          if (maxViewport && Array.isArray(maxViewport) && maxViewport.length > 2) {
            maxViewport = [
              [maxViewport[0], maxViewport[1]],
              [maxViewport[2], maxViewport[3]]
            ];
          }

          saveValue.type = 'maxViewport';
          saveValue.value = {
            maxViewport: maxViewport,
            maxViewportIsLimit: true,
            withStartAnimation: false
          };
        }

        templateValues['mapviewport'].value = saveValue;
      }

      template.version = 5;
    }

    if (template.version < 6) {
      if (!template.description) {
        template.description = 'Describe your template';
      }

      if (!template.created_at) {
        template.created_at = new Date();
      }

      if (!template.updated_at) {
        template.updated_at = new Date();
      }

      template.version = 6;
    }

    if (template.version < 7) {
      if (templateValues['chartinvisualfilterstyle']) {
        const inVisualFilter = templateValues['chartinvisualfilterstyle'].value;
        const inVisMargin = inVisualFilter.font.margin;
        const inVisPadding = inVisualFilter.font.padding;

        if (inVisMargin.top === 0 && inVisMargin.right === 0 && inVisMargin.bottom === 0 && inVisMargin.left === 0) {
          inVisualFilter.font.margin = getFormatMarginPaddingObject(5, undefined, 5, undefined, 5, undefined, 5);
        }

        if (inVisPadding.top === 0 && inVisPadding.right === 0 && inVisPadding.bottom === 0 && inVisPadding.left === 0) {
          inVisualFilter.font.padding = getFormatMarginPaddingObject(5, undefined, 10, undefined, 5, undefined, 10);
        }

        inVisualFilter.borderRadius = inVisualFilter.hasOwnProperty('borderRadius') ? inVisualFilter.borderRadius : 100;
        templateValues['chartinvisualfilterstyle'].value = inVisualFilter;
      }

      template.version = 7;
    }

    if (template.version < 8) {
      if (templateValues['chartvaluestyle']) {
        const valueStyle = templateValues['chartvaluestyle'].value;

        valueStyle.margin.top = 0.5;
        valueStyle.margin.topUnit = 'em';
        valueStyle.margin.right = 0;
        valueStyle.margin.rightUnit = 'em';
        valueStyle.margin.bottom = 0.5;
        valueStyle.margin.bottomUnit = 'em';
        valueStyle.margin.left = 0;
        valueStyle.margin.leftUnit = 'em';
      }

      if (templateValues['chartlabelaxisvaluestyle']) {
        const labelValueStyle = templateValues['chartlabelaxisvaluestyle'].value;

        labelValueStyle.position = 'right';
        labelValueStyle.lineheight.value = 1;
        labelValueStyle.lineheight.unit = 'em';
      }

      if (templateValues['chartvalueaxisvaluestyle']) {
        const labelValueStyle = templateValues['chartvalueaxisvaluestyle'].value;

        labelValueStyle.position = 'right';
        labelValueStyle.lineheight.value = 1;
        labelValueStyle.lineheight.unit = 'em';
      }

      template.version = 8;
    }

    if (template && templateValues) {
      // ALWAYS VALIDATE LAYOUT
      if (templateValues['atlaslayout']) {
        templateValues['atlaslayout'].value = validateLayout(templateValues['atlaslayout'].value, 'atlas');
      }

      if (templateValues['visuallayout']) {
        templateValues['visuallayout'].value = validateLayout(templateValues['visuallayout'].value, 'visual');
      }

      // ALWAYS CHECK FOR WRONG FONT FAMILY
      const styleObjects = getStyleObjects(templateValues);
      for (const obj of styleObjects) {
        obj.fontFamily = obj.fontFamily.replace(/"/g, "'");

        const actualFonts = obj.fontFamily.split(',').map(obj => obj.trim());
        if (!actualFonts[0].includes("'")) {
          actualFonts[0] = "'" + actualFonts[0] + "'";
          obj.fontFamily = actualFonts.join(', ');
        }

        if (obj.weigth) {
          obj.weight = String(obj.weigth);
          delete obj.weigth;
        }

        obj.weight = String(obj.weight);
      }
    }
  }
  if (!templateValues) {
    template.templateValues = {};
  }
  return {
    template: template,
    valid: true
  };
};
