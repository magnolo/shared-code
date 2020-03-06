import uuid from 'uuid/v4';
import { sortBy } from 'lodash';
import { scaleLinear } from 'd3-scale';

import { isObject, cloneObject, unique, roundTo } from '../utilities';
import { MapTypes, PublicUserIds, AccessLevels } from '../config/constants';
import { getValueFieldName, getLabelFieldName, getRightLabelFieldName, getRightLegendFieldName } from '../data/pipeline';

import { getDimensionsWithRequirements } from './creator';
import { getBaseMetricObect } from './content-utilities';

import { createLayoutObject, getLayoutChildObjects, createAtlasLayout, createVisualLayout, validateLayout } from './layout';
import {
  getFormatObject,
  getExtendedFormatObject,
  getFormatShadowObject,
  getFormatLineHeightObject,
  getFormatMarginPaddingObject,
  convertFormatToExtendedFormat
} from './style';

const styleReducer = (accumulator, obj) => {
  if (isObject(obj) && 'fontFamily' in obj && 'color' in obj) accumulator.push(obj);
  if (Array.isArray(obj) || isObject(obj)) accumulator = accumulator.concat(getStyleObjects(obj));
  return accumulator;
};

const getStyleObjects = obj => (Array.isArray(obj) ? obj : Object.values(obj)).reduce(styleReducer, []);

const formatReducer = (accumulator, obj) => {
  if (isObject(obj) && 'formatType' in obj && 'locale' in obj) accumulator.push(obj);
  if (Array.isArray(obj) || isObject(obj)) accumulator = accumulator.concat(getFormatObjects(obj));
  return accumulator;
};

const getFormatObjects = obj => (Array.isArray(obj) ? obj : Object.values(obj)).reduce(formatReducer, []);

// MOVE TO SHARED CODE
export const getTooltipContent = content => {
  const { typeSpecific } = content;

  const advContent = { ops: [] };

  const defaultFormat = {
    formatType: 'string',
    locale: 'de-DE',
    number: {
      numberFormat: ',.0f',
      decimalPlaces: '0',
      digitGrouping: true,
      shorten: false
    },
    date: { inputFormat: 'YYYY', dateFormat: 'YYYY' },
    prefix: '',
    suffix: ''
  };

  // title
  const oldField = typeSpecific.tooltip.name.substr(5); // 'data:a0'
  if (oldField && typeSpecific.fields[oldField]) {
    const oldTitle = typeSpecific.fields[oldField].title;
    const { titleStyle } = typeSpecific.tooltip;
    let oldFieldFormat = undefined;
    if (typeSpecific.fields[oldField].format) {
      oldFieldFormat = cloneObject(typeSpecific.fields[oldField].format);
    }
    advContent.ops.push({
      attributes: {
        color: titleStyle.color,
        font: titleStyle.fontFamily,
        size: titleStyle.size + 'px',
        weight: titleStyle.weight
      },
      insert: {
        inlineValue: {
          nodeId: uuid(),
          fieldName: oldField, // 'a0'
          title: oldTitle,
          format: oldFieldFormat ? oldFieldFormat : cloneObject(defaultFormat)
        }
      }
    });

    advContent.ops.push({ insert: '\n' });
  }

  // label
  const oldLabel = typeSpecific.tooltip.value.label;

  // value
  //rewrite meta to data!
  if (typeSpecific.tooltip.value.field && typeSpecific.tooltip.value.field.includes('meta:')) {
    typeSpecific.tooltip.value.field = 'data:' + getValueFieldName(content);
  }

  const oldValueField = typeSpecific.tooltip.value.field.substr(5); // 'data:a1'
  const oldValueTitle = typeSpecific.fields[oldValueField].title;
  const oldValueFormat = cloneObject(typeSpecific.tooltip.value.format || defaultFormat);
  const { valueStyle } = typeSpecific.tooltip;
  //size * 0.7 -> removed cause applied before scaling makes everything weird
  if (oldLabel) {
    advContent.ops.push({
      attributes: {
        color: valueStyle.color,
        font: valueStyle.fontFamily,
        size: valueStyle.size + 'px',
        weight: '300'
      },
      insert: oldLabel + '\n'
    });
  }

  //patch prefix and suffix parts
  if (oldValueFormat.prefix && oldValueFormat.prefix.length > 0 && oldValueFormat.prefix[oldValueFormat.prefix.length - 1] !== ' ') {
    oldValueFormat.prefix = oldValueFormat.prefix + ' ';
  }

  if (oldValueFormat.suffix && oldValueFormat.suffix.length > 0 && oldValueFormat.suffix[0] !== ' ') {
    oldValueFormat.suffix = ' ' + oldValueFormat.suffix;
  }

  advContent.ops.push({
    attributes: {
      color: valueStyle.color,
      font: valueStyle.fontFamily,
      size: valueStyle.size + 'px',
      weight: valueStyle.weight
    },
    insert: {
      inlineValue: {
        nodeId: uuid(),
        fieldName: oldValueField, // 'a1'
        title: oldValueTitle,
        format: oldValueFormat
      }
    }
  });

  // additional fields
  const { contentStyle } = typeSpecific.tooltip;
  for (const field of typeSpecific.tooltip.fields) {
    if (field.field && field.field.length > 5) {
      const oldAdditionalField = field.field.substr(5); // 'data:a3'
      if (oldAdditionalField && typeSpecific.fields[oldAdditionalField]) {
        const oldAdditionalTitle = typeSpecific.fields[oldAdditionalField].title;
        const oldAdditionalFormat = cloneObject(field.format || defaultFormat);

        advContent.ops.push({
          attributes: {
            color: contentStyle.color,
            font: contentStyle.fontFamily,
            size: contentStyle.size + 'px',
            weight: contentStyle.weight
          },
          insert: '\n' + field.label + ' '
        });

        //patch prefix and suffix parts
        if (oldAdditionalFormat.prefix && oldAdditionalFormat.prefix.length > 0 && oldAdditionalFormat.prefix[oldAdditionalFormat.prefix.length - 1] !== ' ') {
          oldAdditionalFormat.prefix = oldAdditionalFormat.prefix + ' ';
        }
        if (oldAdditionalFormat.suffix && oldAdditionalFormat.suffix.length > 0 && oldAdditionalFormat.suffix[0] !== ' ') {
          oldAdditionalFormat.suffix = ' ' + oldAdditionalFormat.suffix;
        }

        advContent.ops.push({
          attributes: {
            color: contentStyle.color,
            font: contentStyle.fontFamily,
            size: contentStyle.size + 'px',
            weight: '500'
          },
          insert: {
            inlineValue: {
              nodeId: uuid(),
              fieldName: oldAdditionalField, // 'a3'
              title: oldAdditionalTitle,
              format: oldAdditionalFormat
            }
          }
        });
      }
    }
  }

  advContent.ops.push({ insert: '\n' });

  return JSON.stringify(advContent);
};

export const validateContent = content => {
  try {
    if (content.type === 'atlas') {
      if (!content.typeSpecific) {
        content.typeSpecific = {
          version: 2,
          atlas: {
            showNext: true,
            showBurger: true,
            children: []
          }
        };
      }
      if (!content.typeSpecific.atlas) {
        content.typeSpecific.atlas = {
          showNext: true,
          showBurger: true,
          children: []
        };
      }
      if (!content.typeSpecific.atlas.children) {
        content.typeSpecific.atlas.children = [];
      }
      if (!content.typeSpecific.data) {
        content.typeSpecific.data = {
          publisher: {
            identifier: '',
            name: '',
            licence: '',
            url: ''
          }
        };
      }
    }

    const { type, typeSpecific } = content;
    const noTimeChartTypes = [
      'donutchart',
      'donutchart_half',
      'barchart',
      'horizontalbarchart',
      'groupedbarchart',
      'stackedbarchart',
      'bar-grouped-horizontal',
      'bar-stacked-horizontal'
    ];
    const chartTypes = [...noTimeChartTypes, 'areachart', 'linechart'];
    const mapTypes = MapTypes;
    const visualTypes = [...chartTypes, ...mapTypes];
    if (!typeSpecific.version) {
      typeSpecific.version = 2;
    }

    // dataset fun
    // fields may not have nonValidValues , isLabelField , isAggregationField, uniquenessInfo, validValues,
    // selectedValues = []
    // data publisher has to be set -> with name, url licence,
    if (!content.subTitle) {
      content.subTitle = '';
    }

    if (content.type === 'dataset' && typeSpecific.version < 3) {
      for (const fieldName of Object.keys(typeSpecific.fields)) {
        const field = typeSpecific.fields[fieldName];
        delete field.nonValidValues;
        delete field.isLabelField;
        delete field.isAggregationField;
        delete field.uniquenessInfo;
        delete field.validValues;
        field.selectedValues = [];
      }
    }

    // handle previous typeSpecific
    if (typeSpecific && typeSpecific.version && typeSpecific.version < 3) {
      // fieldtypes are needed
      if (visualTypes.includes(type) || type === 'dataset') {
        // Setting fieldType
        // "isoLabelField | valueField | timeField | isoField | miscField"
        for (const fieldName of Object.keys(typeSpecific.fields)) {
          const field = typeSpecific.fields[fieldName];

          // clean up
          delete field.nonValidValues;
          delete field.validValues;

          field.format.formatType = field.dataType;
          if (field.dataType === 'number') {
            field.fieldType = 'valueField';
          }

          if (field.dataType === 'date') {
            field.fieldType = 'timeField';
            field.selectedValues = field.selectedValues.map(obj => String(obj));
          }

          if (field.dataType === 'string') {
            // options:  isoField | miscField | isoLabelField
            if (field.isoLabelField) {
              typeSpecific.fields[field.isoLabelField].fieldType = 'isoLabelField';
              // add the isoMapping of the other field if exists
              if (typeSpecific.fields[field.isoLabelField].isoMappingId) {
                field.isoMappingId = typeSpecific.fields[field.isoLabelField].isoMappingId;
              }
            }

            if (field.isoIsoField) {
              typeSpecific.fields[field.isoIsoField].fieldType = 'isoField';
              // add the isoMappingId from isoField if it exists
              if (typeSpecific.fields[field.isoIsoField].isoMappingId) {
                field.isoMappingId = typeSpecific.fields[field.isoIsoField].isoMappingId;
              }
            }
          }

          // TODO check for locale in form
          if (!field.format.locale) {
            field.format.locale = 'de-DE';
          }
        }

        // second time for misc fields
        for (const fieldName of Object.keys(typeSpecific.fields)) {
          const field = typeSpecific.fields[fieldName];
          if (field.dataType === 'string' && !field.fieldType) {
            field.fieldType = 'miscField';
          }
        }
      }

      // generate dimension objectif it doesnt exist from data part
      if (visualTypes.includes(type) && !typeSpecific.dimensions) {
        // console.log('[ContentValidator] - adding dimensions');
        const dimensionsList = getDimensionsWithRequirements(type);
        switch (type) {
          case 'areachart':
          case 'linechart':
            for (const dimension of dimensionsList) {
              if (dimension.dimName === 'xAxis') {
                dimension.fieldName = typeSpecific.data.timeField;
              }
              if (dimension.dimName === 'yAxis') {
                dimension.fieldName = typeSpecific.data.valueField;
              }
              // series axis
              if (dimension.dimName === 'labelAxis') {
                dimension.fieldName = typeSpecific.data.labelField;
              }
            }
            break;
          case 'barchart':
          case 'horizontalbarchart':
          case 'donutchart':
          case 'donutchart_half':
            for (const dimension of dimensionsList) {
              if (dimension.dimName === 'xAxis') {
                dimension.fieldName = typeSpecific.data.labelField;
              }
              if (dimension.dimName === 'yAxis') {
                dimension.fieldName = typeSpecific.data.valueField;
              }
            }
            break;
          case 'groupedbarchart':
          case 'stackedbarchart':
            // label field is the field that is used for series
            // aggregation Field is used for xAxis and Tooltips
            for (const dimension of dimensionsList) {
              if (dimension.dimName === 'xAxis') {
                dimension.fieldName = typeSpecific.data.labelField;
              }
              if (dimension.dimName === 'yAxis') {
                dimension.fieldName = typeSpecific.data.valueField;
              }
              if (dimension.dimName === 'groupAxis') {
                dimension.fieldName = typeSpecific.data.aggregationField;
              }
            }
            break;
          case 'choropleth':
            for (const dimension of dimensionsList) {
              if (dimension.dimName === 'iso') {
                dimension.fieldName = typeSpecific.data.labelField;
              }
              if (dimension.dimName === 'value') {
                dimension.fieldName = typeSpecific.data.valueField;
              }
            }
            break;
          default:
        }
        // calc the possibleFields
        for (const dimension of dimensionsList) {
          dimension.possibleFields = [];
          for (const fieldName of Object.keys(typeSpecific.fields)) {
            const field = typeSpecific.fields[fieldName];
            // console.log("dimension Testing: ",field,dimension);
            if (dimension.requirements.dataTypes && !dimension.requirements.dataTypes.includes(field.dataType)) {
              continue;
            }
            if (dimension.requirements.fieldTypes && !dimension.requirements.fieldTypes.includes(field.fieldType)) {
              continue;
            }
            // console.log("dimension requirement fulfilled: ",field.fieldName);
            dimension.possibleFields.push({
              fieldName: field.fieldName,
              title: field.title
            });
          }
        }
        // console.log("dimensionlist after validation: ",dimensionsList);
        // add dimensions to typeSpecific
        typeSpecific.dimensions = dimensionsList;
      }

      // CHART -> use visual types since you can start at choro and then you still needs this
      if (visualTypes.includes(type)) {
        typeSpecific.chart.grid.xAxis = typeSpecific.chart.grid.xAxis || 5;
        typeSpecific.chart.grid.yAxis = typeSpecific.chart.grid.yAxis || 5;

        typeSpecific.chart.animation.delay = typeSpecific.chart.animation.delay || 10;
        typeSpecific.chart.scrollable = typeSpecific.chart.scrollable === undefined ? true : typeSpecific.chart.scrollable;
        typeSpecific.chart.values.position = typeSpecific.chart.values.position || 'auto';

        typeSpecific.chart.legend = typeSpecific.chart.legend || {
          enabled: !['barchart', 'horizontalbarchart'].includes(type),
          position: 'left'
        };

        // CHART FORMAT
        const { labelField, valueField } = typeSpecific.data;
        typeSpecific.chart.axis.labelAxis.format = cloneObject(typeSpecific.fields[labelField].format);
        typeSpecific.chart.axis.valueAxis.format = cloneObject(typeSpecific.fields[valueField].format);
      }

      // STYLE
      typeSpecific.style = typeSpecific.style || {};
      typeSpecific.style.background = typeSpecific.style.background || {
        backgroundColor: '#ffffff'
      };
      typeSpecific.style.title = typeSpecific.style.title || getFormatObject(15, 500);
      typeSpecific.style.subTitle = typeSpecific.style.subTitle || getFormatObject(13, 300);
      typeSpecific.style.description = typeSpecific.style.description || getFormatObject(12, 300);

      // EXPORT
      if (!typeSpecific.export) {
        typeSpecific.export = {
          flexible: false,
          stretch: true,
          stretchWidth: 100,
          width: 800,
          height: 600,
          desktop: {
            stretch: true,
            aspectRatio: 1.33
          },
          mobile: {
            stretch: true,
            aspectRatio: 0.75
          }
        };
      }

      if (typeSpecific.export.stretch === undefined) {
        typeSpecific.export.stretch = true;
        typeSpecific.export.stretchWidth = 100;
        typeSpecific.export.width = 800;
        typeSpecific.export.height = 600;
        typeSpecific.export.desktop.aspectRatio = 1.33;
        typeSpecific.export.mobile.aspectRatio = 0.75;
      }

      // IN VISUAL FILTER
      if (visualTypes.includes(type)) {
        typeSpecific.inVisualFilter = typeSpecific.inVisualFilter || [];
        if (noTimeChartTypes.includes(type) || type === 'choropleth') {
          // if we have a timeline activate inVisualFilter
          // TODO --> what if we only have one timevalue
          const { timeField } = typeSpecific.data;
          if (timeField) {
            // console.log('[Backwards Adding InvisualFilter] - ', timeField);
            const timeLineFilter = {
              type: 'valueSelector',
              fieldName: timeField,
              options: {
                appearance: 'timeline',
                sort: 'asc'
              }
            };
            typeSpecific.inVisualFilter.push(timeLineFilter);
          }
        }
        // smartFunctions and SmartFilters
        if (!typeSpecific.smartFilters) {
          typeSpecific.smartFilters = [];
        }
        if (!typeSpecific.smartFunctions) {
          typeSpecific.smartFunctions = [];
        }
      }

      typeSpecific.version = 3;
    }

    /**
     * Version 4 Changes
     */
    if (typeSpecific && typeSpecific.version && typeSpecific.version < 4) {
      if (content.type === 'dataset') {
        if (!content.typeSpecific.format) {
          content.typeSpecific.format = {
            locale: 'de-DE'
          };
        }
      }

      if (content.typeSpecific.updateOptions) {
        for (const key in content.typeSpecific.updateOptions) {
          if (!content.typeSpecific.updateOptions.hasOwnProperty(key)) continue;
          content.typeSpecific.updateOptions[key] = JSON.parse(content.typeSpecific.updateOptions[key]);
        }
      } else {
        content.typeSpecific.updateOptions = {
          autoUpdateVisual: false,
          isChild: false,
          updateNotification: true
        };
      }

      // map object like the base object
      if (visualTypes.includes(type) && !typeSpecific.map.options) {
        typeSpecific.map = {
          options: {
            lang: 'default',
            style: 'empty',
            type: 'mapbox',
            zoomButtons: true,
            /**
             * Changes START
             * Date: 05. Dec 2018
             * NOTE: Added some boolean options here
             *
             */
            fullscreen: false,
            compass: false,
            scale: false,
            enableSearch: false,
            extrude: false,
            /**
             * Changes END
             */
            opacity: 1,
            outlinesColor: 'rgba(0,0,0,0.2)',
            interactions: {
              scrollZoom: true,
              boxZoom: true,
              dragRotate: true,
              dragPan: true,
              keyboard: true,
              doubleClickZoom: true,
              touchZoomRotate: true
            }
          },
          sources: [],
          legend: {
            closed: false,
            values: {
              format: JSON.parse(JSON.stringify(typeSpecific.fields[getValueFieldName(content)].format))
            },
            title: {
              format: JSON.parse(JSON.stringify(typeSpecific.fields[getLabelFieldName(content)].format)),
              value: null,
              label: null
            }
          }
        };
      }
      // check if map object has format object
      if (visualTypes.includes(type) && typeSpecific.map) {
        if (typeSpecific.map.legend.hide === undefined) typeSpecific.map.legend.hide = false;
        if (typeSpecific.map.legend.closed === undefined) typeSpecific.map.legend.closed = false;
        if (!typeSpecific.map.legend.values) {
          typeSpecific.map.legend.values = {
            format: JSON.parse(JSON.stringify(typeSpecific.fields[getValueFieldName(content)].format))
          };
        }
        if (!typeSpecific.map.legend.values.format) {
          typeSpecific.map.legend.values.format = JSON.parse(JSON.stringify(typeSpecific.fields[getValueFieldName(content)].format));
        }
        if (!typeSpecific.map.legend.title.format) {
          typeSpecific.map.legend.title.format = JSON.parse(JSON.stringify(typeSpecific.fields[getLabelFieldName(content)].format));
        }

        /**
         * Changes START
         * Date: 05. Dec 2018
         * NOTE: Added some boolean options here
         *
         */
        if (!typeSpecific.map.options.hasOwnProperty('zoomButtons')) typeSpecific.map.options.zoomButtons = true;
        if (!typeSpecific.map.options.hasOwnProperty('fullscreen')) typeSpecific.map.options.fullscreen = false;
        if (!typeSpecific.map.options.hasOwnProperty('compass')) typeSpecific.map.options.compass = false;
        if (!typeSpecific.map.options.hasOwnProperty('scale')) typeSpecific.map.options.scale = false;
        if (!typeSpecific.map.options.hasOwnProperty('enableSearch')) typeSpecific.map.options.enableSearch = false;
        if (!typeSpecific.map.options.hasOwnProperty('extrude')) typeSpecific.map.options.extrude = false;
        if (!typeSpecific.map.options.opacity) typeSpecific.map.options.opacity = 1;
        if (!typeSpecific.map.options.outlinesColor) typeSpecific.map.options.outlinesColor = 'rgba(0,0,0,0.2)';
        if (!typeSpecific.map.options.interactions) {
          typeSpecific.map.options.interactions = {
            scrollZoom: true,
            boxZoom: true,
            dragRotate: true,
            dragPan: true,
            keyboard: true,
            doubleClickZoom: true,
            touchZoomRotate: true
          };
        }
      }
      typeSpecific.version = 4;
    }

    if (typeSpecific.version < 5) {
      // 07.01.2019
      if (content.fileName === undefined) content.fileName = content.name;
      if (typeSpecific.data && typeSpecific.data.valueRange === undefined) {
        typeSpecific.data.valueRange = {
          type: 'active', // full, active, user
          range: [0, 0]
        };
      }

      // 09.01.2019
      if (content.type === 'report') {
        content.typeSpecific.report.chapters = content.typeSpecific.report.chapters || [{ title: 'Chapter 1', children: [] }];
        content.typeSpecific.report.chapterColumns = content.typeSpecific.report.chapterColumns || 1;

        // 15.01.2019
        typeSpecific.report.paginationType = typeSpecific.report.paginationType || 'default';
        typeSpecific.report.paginationColor = typeSpecific.report.paginationColor || '#ffffff';
        typeSpecific.report.iconsColor = typeSpecific.report.iconsColor || '#ffffff';
        typeSpecific.report.progressBarColor = typeSpecific.report.progressBarColor || '#ffffff';
        typeSpecific.report.switchButton = typeSpecific.report.switchButton || {
          color: '#ffffff',
          backgroundColor: 'rgba(0, 0, 0, 0.5);'
        };
        if (!typeSpecific.report.hasOwnProperty('showFullscreenButton')) typeSpecific.report.showFullscreenButton = true;
      }

      // 15.01.2019

      // the shadow for the text is optional
      typeSpecific.style.title.shadow = typeSpecific.style.title.shadow || {
        x: 0,
        y: 0,
        blur: 0,
        spread: 0,
        color: 'transparent'
      };

      typeSpecific.style.subTitle.shadow = typeSpecific.style.subTitle.shadow || {
        x: 0,
        y: 0,
        blur: 0,
        spread: 0,
        color: 'transparent'
      };

      typeSpecific.style.description.shadow = typeSpecific.style.description.shadow || {
        x: 0,
        y: 0,
        blur: 0,
        spread: 0,
        color: 'transparent'
      };

      // 16.01.2019 -- hedata fixing typo in stubs
      if (typeSpecific.updateOptions && typeSpecific.updateOptions.hasOwnProperty('updatedNotification')) {
        typeSpecific.updateOptions.updateNotification = typeSpecific.updateOptions.updatedNotification;
        delete typeSpecific.updateOptions.updatedNotification;
      }

      // 17.01.2019 -- Manfred add legend coloring type
      if (typeSpecific.map && typeSpecific.map.legend) {
        typeSpecific.map.legend.type = typeSpecific.map.legend.type || (typeSpecific.style.colors.type === 'percentage' ? 'gradient' : 'static') || 'gradient';
      }

      typeSpecific.version = 5;
    }

    if (typeSpecific.version < 6) {
      // 17.1.2019 -> hedata
      // what we want: everything has a style object with title, subTitle, description

      // merge old FormatObjects into extendedFormat objects

      const extendedFormatObject = getExtendedFormatObject();

      // Maybe not so clever
      const extendedTitleFormatObject = getExtendedFormatObject(
        content.type === 'report' ? 48 : 20,
        500,
        'left',
        content.type === 'report' ? '#ffffff' : '#000000',
        undefined,
        undefined,
        undefined,
        content.type === 'report'
          ? getFormatMarginPaddingObject(0, 'em', 5, 'px', 0, 'em', 5, 'px')
          : getFormatMarginPaddingObject(5, 'px', 5, 'px', 5, 'px', 5, 'px')
      );

      const extendedSubTitleFormatObject = getExtendedFormatObject(
        content.type === 'report' ? 23 : 13,
        content.type === 'report' ? 500 : 300,
        'left',
        content.type === 'report' ? '#ffffff' : '#000000',
        undefined,
        undefined,
        content.type === 'report'
          ? getFormatMarginPaddingObject(1.2, 'em', 0, 'px', 0.3996, 'em', 0, 'px')
          : getFormatMarginPaddingObject(0, 'px', 5, 'px', 5, 'px', 5, 'px')
      );

      const extendedDescriptionFormatObject = getExtendedFormatObject(
        content.type === 'report' ? 16 : 12,
        300,
        'left',
        content.type === 'report' ? '#ffffff' : '#000000',
        undefined,
        undefined,
        undefined,
        content.type === 'report'
          ? getFormatMarginPaddingObject(1, 'em', 5, 'px', 0.333, 'em', 5, 'px')
          : getFormatMarginPaddingObject(5, 'px', 0, 'px', 0, 'px', 0, 'px')
      );

      // TODO depending on type we should set good defaults so that our old style is met!
      // and for reports we have standard rtr part
      if (content.type === 'report') {
        // the old styles in the report are complete bogus so overwrite
        typeSpecific.style.title = cloneObject(extendedTitleFormatObject);
        typeSpecific.style.subTitle = cloneObject(extendedSubTitleFormatObject);
        typeSpecific.style.description = cloneObject(extendedDescriptionFormatObject);
      } else {
        typeSpecific.style.title = convertFormatToExtendedFormat(typeSpecific.style.title, extendedTitleFormatObject);
        typeSpecific.style.subTitle = convertFormatToExtendedFormat(typeSpecific.style.subTitle, extendedSubTitleFormatObject);
        typeSpecific.style.description = convertFormatToExtendedFormat(typeSpecific.style.description, extendedDescriptionFormatObject);
      }

      // add completely missing format objects
      // tooltips -> beware we are having a field format object -> we do not touch this atm
      // the field format objects we use for -> date format, number format, prefix, suffix, localization
      // NOT for font size bold and so on..

      if (typeSpecific.tooltip) {
        typeSpecific.tooltip.titleStyle =
          typeSpecific.tooltip.titleStyle ||
          getExtendedFormatObject(16, 500, undefined, undefined, undefined, undefined, getFormatMarginPaddingObject(0, undefined, 0, undefined, 5, 'px'));
        typeSpecific.tooltip.valueStyle = typeSpecific.tooltip.valueStyle || getExtendedFormatObject(20, 300);
        typeSpecific.tooltip.contentStyle = typeSpecific.tooltip.contentStyle || getExtendedFormatObject();
      }

      // chart legend
      if (typeSpecific.chart && typeSpecific.chart.legend) {
        const margin = getFormatMarginPaddingObject(10, 'px', 10, 'px', 10, 'px', 10, 'px');
        typeSpecific.chart.legend.style =
          typeSpecific.chart.legend.style || getExtendedFormatObject(11, undefined, undefined, undefined, undefined, undefined, undefined, margin);
      }

      // chart values
      if (typeSpecific.chart && typeSpecific.chart.values) {
        typeSpecific.chart.values.style = typeSpecific.chart.values.style || getExtendedFormatObject(11);
      }

      // chart axis
      if (typeSpecific.chart && typeSpecific.chart.axis) {
        typeSpecific.chart.axis.labelAxis.titleStyle = typeSpecific.chart.axis.labelAxis.titleStyle || getExtendedFormatObject(11, 500);
        typeSpecific.chart.axis.labelAxis.valueStyle = typeSpecific.chart.axis.labelAxis.valueStyle || getExtendedFormatObject(11);

        typeSpecific.chart.axis.valueAxis.titleStyle = typeSpecific.chart.axis.valueAxis.titleStyle || getExtendedFormatObject(11, 500);
        typeSpecific.chart.axis.valueAxis.valueStyle = typeSpecific.chart.axis.valueAxis.valueStyle || getExtendedFormatObject(11);
      }

      // map legend
      if (typeSpecific.map && typeSpecific.map.legend) {
        typeSpecific.map.legend.titleStyle = typeSpecific.map.legend.titleStyle || getExtendedFormatObject();
        typeSpecific.map.legend.valueStyle =
          typeSpecific.map.legend.valueStyle ||
          getExtendedFormatObject(
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            getFormatMarginPaddingObject(undefined, undefined, undefined, undefined, undefined, undefined, 10, 'px')
          );
      }

      // for report only some extended styles
      if (content.type === 'report') {
        typeSpecific.report.visualDescriptionTitle = typeSpecific.report.visualDescriptionTitle || getExtendedFormatObject(16, 500, undefined, '#ffffff');
        typeSpecific.report.visualDescription =
          typeSpecific.report.visualDescription ||
          getExtendedFormatObject(13, 300, undefined, '#ffffff', undefined, undefined, undefined, getFormatMarginPaddingObject(10, 'px'));
      }

      typeSpecific.version = 6;
    }

    if (typeSpecific.version < 7) {
      // fix for going from h2 to div, don't skew font size by 1.25em
      if (visualTypes.includes(content.type)) {
        typeSpecific.style.title.size += 5;
      }

      typeSpecific.version = 7;
    }

    if (typeSpecific.version < 8) {
      if (typeSpecific.tooltip) {
        typeSpecific.tooltip.valueStyle = typeSpecific.tooltip.valueStyle || getExtendedFormatObject(20, 300);
      }

      if (content.type === 'report') {
        typeSpecific.report.paginationColor = 'transparent';
        typeSpecific.report.paginationStyle = typeSpecific.report.paginationStyle || getExtendedFormatObject(18, 300, undefined, '#ffffff');
      }

      typeSpecific.version = 8;
    }

    if (typeSpecific.version < 9) {
      if (typeSpecific.fields) {
        let isoField = null;
        let isoLabelField = null;
        for (const curFieldName of Object.keys(typeSpecific.fields)) {
          const curField = typeSpecific.fields[curFieldName];
          if (curFieldName !== curField.fieldName) {
            curField.fieldName = curFieldName;
          }
          if (curField.fieldType === 'isoField') {
            isoField = curField;
          }
          if (curField.fieldType === 'isoLabelField') {
            isoLabelField = curField;
          }
        }

        // check if isoLabelField and IsoIsoField are set
        if (isoField && isoLabelField) {
          if (!isoField.isoLabelField) {
            isoField.isoLabelField = isoLabelField.fieldName;
          }
          if (!isoLabelField.isoIsoField) {
            isoLabelField.isoIsoField = isoField.fieldName;
          }
        }
      }

      if (visualTypes.includes(type)) {
        typeSpecific.map.options.pitch = typeSpecific.map.options.pitch || 0;
        typeSpecific.map.options.bearing = typeSpecific.map.options.bearing || 0;
        typeSpecific.map.options.displayType = typeSpecific.map.options.displayType || 'choropleth';
        typeSpecific.map.options.outlinesWidth = typeSpecific.map.options.outlinesWidth || 0;
        typeSpecific.map.options.bubbles = typeSpecific.map.options.bubbles || {
          sizeRange: [2, 12],
          sizeZoomDynamic: false,
          sizeZoom: 0,
          scaling: 'linear',
          steps: 10
        };
        typeSpecific.map.options.extrude = typeof typeSpecific.map.options.extrude === 'object' ? typeSpecific.map.options.extrude : { height: 10000 };
        typeSpecific.map.options.extrude.scaling = typeSpecific.map.options.extrude.scaling || 'linear';
        typeSpecific.map.options.showAllSourceFeatures = typeSpecific.map.options.showAllSourceFeatures || false;
        typeSpecific.map.options.emptyFeaturesColor = typeSpecific.map.options.emptyFeaturesColor || '#ccc';
      }

      // kill old updatePossible Parts
      // hedata - 31.01.2019
      if (typeSpecific.updatePossible) {
        // is version right?
        if (!typeSpecific.updatePossible.version) {
          delete typeSpecific.updatePossible;
        }
      }

      // breakPoints
      // gregor - 31.01.2019
      typeSpecific.style.breakPoints = typeSpecific.style.breakPoints || {
        enabled: true,
        values: [
          // auto format bug
          { domain: 360, range: 0.7 },
          { domain: 600, range: 1 },
          { domain: 800, range: 1.2 },
          { domain: 1280, range: 1.5 },
          { domain: 1920, range: 2 }
        ]
      };

      if (typeSpecific.tooltip) {
        typeSpecific.tooltip.titleStyle.localScaleFactor = 0.5;
        typeSpecific.tooltip.valueStyle.localScaleFactor = 0.5;
        typeSpecific.tooltip.contentStyle.localScaleFactor = 0.5;
      }

      if (typeSpecific.map && typeSpecific.map.legend) {
        typeSpecific.map.legend.titleStyle.localScaleFactor = 0.5;
        typeSpecific.map.legend.valueStyle.localScaleFactor = 0.5;
      }

      // only set when we lock version
      typeSpecific.version = 9;
    }

    if (typeSpecific.version < 10) {
      // Report Logo position
      if (content.type === 'report') {
        if (!typeSpecific.report.logo.hasOwnProperty('position')) {
          typeSpecific.report.logo.position = {
            vertical: 'top',
            horizontal: 'left'
          };
        }

        if (!typeSpecific.report.logo.hasOwnProperty('size')) {
          typeSpecific.report.logo.size = {
            mobile: {
              unit: '%',
              value: '18'
            },
            desktop: {
              unit: '%',
              value: '5'
            }
          };
        }
      }

      typeSpecific.version = 10;
    }

    if (typeSpecific.version < 11) {
      // color manager
      // gregor - 01.02.2019

      if (typeSpecific.style.colors) {
        const oldColors = cloneObject(typeSpecific.style.colors);

        // do this once we are finished
        // delete typeSpecific.style.colors;

        const categoricalValues = [];
        const gradientValues = [];
        const continuousColors = [];

        // default
        let newType = 'continuous';
        const colorsCount = oldColors.match ? oldColors.match.length : 0;
        const newFieldName = oldColors.field || typeSpecific.data.valueField;
        let solidColor = oldColors.default || '#ccc';

        if (oldColors.type === 'categorical') {
          newType = 'categorical';
          for (const obj of oldColors.match) {
            categoricalValues.push({ color: obj.color, value: obj.value });
          }
        }

        if (oldColors.type === 'percentage') {
          oldColors.match = sortBy(oldColors.match, ['value']);
          for (const obj of oldColors.match) {
            gradientValues.push({ color: obj.color, domain: obj.value });
            continuousColors.push(obj.color);
          }
        }

        if (oldColors.type === 'static') {
          newType = 'solid';
          solidColor = oldColors.color;
        }

        typeSpecific.style.colors2 = typeSpecific.style.colors2 || {
          type: newType, // categorical | gradient | range | continuous | solid
          fieldName: typeSpecific.data.valueField,
          categorical: {
            fieldName: newFieldName,
            fallback: oldColors.default,
            values: categoricalValues
          },
          gradient: {
            values: gradientValues
          },
          range: {
            colors: [],
            thresholds: []
          },
          continuous: {
            colors: continuousColors,
            scaleType: 'exponential' // linear | exponential | quantiles | threshold
          },
          solid: solidColor
        };

        if (typeSpecific.map.legend) {
          // NEW LEGEND STUFF
          const hasOldOverrides = colorsCount > 0 ? oldColors.match.filter(match => match.title).length > 0 : false;
          const oldMatchTitles = hasOldOverrides ? oldColors.match.map(match => match.title) : [];
          const overrideValues = oldMatchTitles.length ? oldMatchTitles : [];
          if (typeSpecific.map.legend.values) {
            typeSpecific.map.legend.values.overrides = typeSpecific.map.legend.values.overrides || {
              enabled: hasOldOverrides,
              count: colorsCount,
              values: overrideValues
            };
          }
        }
      }

      // Report Mobile Visual/Description Switcher Options
      // anuar - 17.2.2019
      if (content.type === 'report') {
        typeSpecific.report.switchTexts = typeSpecific.report.switchTexts || {
          description: 'DESCRIPTION',
          visual: 'VISUAL',
          visualizations: 'VISUALIZATIONS'
        };

        let colorDefault = '#ffffff';
        let backgroundDefault = 'rgba(0, 0, 0, 0.5)';
        if (typeSpecific.report.hasOwnProperty('switchButton')) {
          colorDefault = typeSpecific.report.switchButton.color;
          backgroundDefault = typeSpecific.report.switchButton.backgroundColor;
          delete typeSpecific.report.switchButton;
        }

        typeSpecific.report.switchFont = typeSpecific.report.switchFont || getExtendedFormatObject(12, 500, 'center', colorDefault);
        typeSpecific.report.switchStyle = typeSpecific.report.switchStyle || {
          backgroundColor: backgroundDefault
        };
      }

      typeSpecific.version = 11;
    }

    // APP RELEASE 21 Februar 2019
    if (typeSpecific.version < 12) {
      typeSpecific.export.external = typeSpecific.export.external || false;
      typeSpecific.version = 12;
    }

    // APP RELEASE 12 March 2019
    if (typeSpecific.version < 13) {
      if (visualTypes.includes(content.type)) {
        typeSpecific.chart.legend.scrollable = typeSpecific.chart.legend.hasOwnProperty('scrollable') ? typeSpecific.chart.legend.scrollable : true;
        typeSpecific.chart.legend.scrollHeight = typeSpecific.chart.legend.hasOwnProperty('scrollHeight') ? typeSpecific.chart.legend.scrollHeight : 30;
      }

      typeSpecific.version = 13;
    }

    // App Push 28.03.2019
    if (typeSpecific.version < 14) {
      // invisual Filter update for saveState options
      if (typeSpecific.inVisualFilter && typeSpecific.inVisualFilter.length > 0) {
        for (const filter of typeSpecific.inVisualFilter) {
          if (filter.type === 'valueSelector') {
            filter.options.saveState = filter.options.saveState || 'last';
          }
        }
      }

      if (visualTypes.includes(content.type)) {
        typeSpecific.chart.legend.scrollable = typeSpecific.chart.legend.hasOwnProperty('scrollable') ? typeSpecific.chart.legend.scrollable : true;
        typeSpecific.chart.legend.scrollHeight = typeSpecific.chart.legend.hasOwnProperty('scrollHeight') ? typeSpecific.chart.legend.scrollHeight : 30;
      }

      const defaultInVisStyle = {
        background: {
          backgroundColor: 'rgba(255,255,255,1)'
        },
        font: getExtendedFormatObject()
      };

      defaultInVisStyle.font.fontFamily = 'Arial, Helvetica, sans-serif';
      defaultInVisStyle.font.weight = '400';

      typeSpecific.style.inVisualFilter = typeSpecific.style.inVisualFilter || defaultInVisStyle;

      if (content.type === 'report') {
        content.typeSpecific.report.activeChapterBackground = content.typeSpecific.report.activeChapterBackground || 'rgba(0,0,0,0.5)';
      }

      const styleObjects = getStyleObjects(content);
      for (const obj of styleObjects) {
        if (obj.fontFamily === 'TheSans5, sans') {
          obj.fontFamily = "'The Sans', sans";
          obj.weight = '500';
        }

        if (obj.fontFamily === 'TheSans6, sans') {
          obj.fontFamily = "'The Sans', sans";
          obj.weight = '600';
        }

        if (obj.fontFamily === 'TheSans7, sans') {
          obj.fontFamily = "'The Sans', sans";
          obj.weight = '700';
        }

        if (obj.fontFamily === 'TheSans8, sans') {
          obj.fontFamily = "'The Sans', sans";
          obj.weight = '800';
        }
      }

      typeSpecific.version = 14;
    }
    // App Push 03.04.2019
    if (typeSpecific.version < 15) {
      const styleObjects = getStyleObjects(content);
      for (const obj of styleObjects) {
        if (obj.fontFamily === '"Thesis Plain", sans') {
          obj.fontFamily = 'Thesis, sans';
          obj.weight = '400';
        }

        if (obj.fontFamily === '"Thesis ExtraBold", sans') {
          obj.fontFamily = 'Thesis, sans';
          obj.weight = '800';
        }
      }

      if (content.type === 'report') {
        typeSpecific.report.headerWidth = typeSpecific.report.headerWidth || {
          mobile: {
            unit: '%',
            value: 90
          },
          desktop: {
            unit: '%',
            value: 70
          }
        };

        typeSpecific.report.chaptersWidth = typeSpecific.report.chaptersWidth || {
          mobile: {
            unit: '%',
            value: 90
          },
          desktop: {
            unit: '%',
            value: 60
          }
        };

        typeSpecific.report.activeChapterWidth = typeSpecific.report.activeChapterWidth || {
          viz: {
            unit: '%',
            value: 70
          },
          overall: {
            unit: '%',
            value: 80
          }
        };
      }

      typeSpecific.version = 15;
    }

    // App Push 10.04.2019
    if (typeSpecific.version < 16) {
      if (visualTypes.includes(type) && typeSpecific.map) {
        typeSpecific.map.options.animationSpeed = typeSpecific.map.options.animationSpeed || 1.2;
        typeSpecific.map.options.animationCurve = typeSpecific.map.options.animationCurve || 1.42;
      }

      typeSpecific.version = 16;
    }

    // App Push 17.04.2019
    if (typeSpecific.version < 17) {
      if (visualTypes.includes(type) && typeSpecific.chart) {
        const padding = getFormatMarginPaddingObject(10, 'px', 10, 'px', 10, 'px', 10, 'px');
        typeSpecific.chart.style =
          typeSpecific.chart.style || getExtendedFormatObject(undefined, undefined, undefined, undefined, undefined, undefined, padding);
      }

      typeSpecific.version = 17;
    }

    if (typeSpecific.version < 18) {
      const styleObjects = getStyleObjects(content);
      for (const obj of styleObjects) {
        obj.fontFamily = obj.fontFamily.replace('Merriweather Italic', 'Merriweather');
        obj.fontFamily = obj.fontFamily.replace('Merriweather Sans Italic', 'Merriweather Sans');
        obj.fontFamily = obj.fontFamily.replace(/"/g, "'");
        obj.weight = String(obj.weight);
      }

      if (content.type === 'map') {
        typeSpecific.map.searchField = typeSpecific.map.searchField ? typeSpecific.map.searchField : 'default';
      }

      if (type === 'atlas' && !typeSpecific.layout) {
        typeSpecific.layout = createAtlasLayout(content);
      }

      if (visualTypes.includes(type)) {
        const padding = getFormatMarginPaddingObject(10, 'px', 10, 'px', 10, 'px', 10, 'px');
        const closeButtonPadding = getFormatMarginPaddingObject(5, 'px', 5, 'px', 5, 'px', 5, 'px');
        const closeButtonMargin = getFormatMarginPaddingObject(5, 'px', 5, 'px', 5, 'px', 5, 'px');

        typeSpecific.advancedTooltip = typeSpecific.advancedTooltip || {
          enabled: false,
          content: '',
          type: 'classic', // fullscreen || classic (position@click) || sidebar
          event: 'click', // click | hover
          position: 'global', // global | nested | viz
          style: {
            font: getExtendedFormatObject(undefined, undefined, undefined, undefined, undefined, 'initial', padding),
            background: {
              backgroundColor: '#fff'
            },
            boxShadow: getFormatShadowObject(0, 2, 10, 0, 'rgba(0,0,0,0.4)'),
            closeButton: {
              icon: 'cancel-1',
              iconPosition: 'left',
              text: null,
              borderRadius: 100,
              font: getExtendedFormatObject(12, undefined, undefined, '#fff', undefined, undefined, closeButtonPadding, closeButtonMargin),
              background: {
                backgroundColor: '#000'
              },
              boxShadow: getFormatShadowObject(0, 0, 0, 0, 'transparent'),
              hoverStyle: {
                icon: 'cancel-1',
                iconPosition: 'left',
                text: null,
                borderRadius: 100,
                font: getExtendedFormatObject(12, undefined, undefined, '#000', undefined, undefined, closeButtonPadding, closeButtonMargin),
                background: {
                  backgroundColor: '#fff'
                },
                boxShadow: getFormatShadowObject(0, 2, 4, 0, 'rgba(0,0,0,0.4)')
              },
              position: { vertical: 'top', horizontal: 'right' },
              size: {
                mobile: { unit: '%', value: 5 },
                desktop: { unit: '%', value: 5 }
              }
            },
            animation: 'move',
            scrollable: true,
            classic: {
              theme: 'default', // default || round || square
              maxWidth: {
                mobile: { unit: '%', value: 100 },
                desktop: { unit: '%', value: 50 }
              },
              maxHeight: {
                mobile: { unit: '%', value: 100 },
                desktop: { unit: '%', value: 50 }
              }
            },
            fullscreen: {
              background: { backgroundColor: '#fff' },
              width: {
                mobile: { unit: '%', value: 100 },
                desktop: { unit: '%', value: 100 }
              },
              height: {
                mobile: { unit: '%', value: 100 },
                desktop: { unit: '%', value: 100 }
              },
              content: {
                width: {
                  mobile: { unit: '%', value: 100 },
                  desktop: { unit: '%', value: 100 }
                },
                height: {
                  mobile: { unit: '%', value: 100 },
                  desktop: { unit: '%', value: 100 }
                }
              }
            },
            sidebar: {
              position: 'left', // left | right
              overlayType: 'overlay', // overlay | pushContent
              width: {
                mobile: { unit: '%', value: 100 },
                desktop: { unit: 'px', value: 300 }
              }
            }
          }
        };
      }

      const { breakPoints } = typeSpecific.style;
      const minDomain = breakPoints.values[1].domain;
      const maxDomain = breakPoints.values[2].domain;

      const aspectScale = scaleLinear()
        .domain([minDomain, maxDomain])
        .range([3 / 4, 4 / 3])
        .clamp(true);

      for (const breakPoint of breakPoints.values) {
        breakPoint.aspectRatio = breakPoint.aspectRatio || roundTo(aspectScale(breakPoint.domain), 3);
      }

      // App Push 09.05.2019
      typeSpecific.version = 18;
    }

    // App Push 13.05.2019
    if (typeSpecific.version < 19) {
      if (visualTypes.includes(content.type)) {
        typeSpecific.chart.values.darkColor = typeSpecific.chart.values.darkColor || '#000000';
        typeSpecific.chart.values.lightColor = typeSpecific.chart.values.lightColor || '#ffffff';

        typeSpecific.chart.grid.width = 'width' in typeSpecific.chart.grid ? typeSpecific.chart.grid.width : 1;
        typeSpecific.chart.scaleZero = 'scaleZero' in typeSpecific.chart ? typeSpecific.chart.scaleZero : true;

        typeSpecific.chart.gridZero = typeSpecific.chart.gridZero || {
          enabled: true,
          color: '#777777',
          width: 1,
          lineDash: [1, 0]
        };

        typeSpecific.chart.legend.scrollable = typeSpecific.chart.legend.hasOwnProperty('scrollable') ? typeSpecific.chart.legend.scrollable : true;
        typeSpecific.chart.legend.scrollHeight = typeSpecific.chart.legend.hasOwnProperty('scrollHeight') ? typeSpecific.chart.legend.scrollHeight : 30;
      }

      // App Push 13.05.2019
      typeSpecific.version = 19;
    }

    // App Push 06.06.2019
    if (typeSpecific.version < 20) {
      if (visualTypes.includes(content.type)) {
        typeSpecific.style.descriptionBackground = typeSpecific.style.descriptionBackground || {
          backgroundColor: '#ffffff'
        };
      }

      const styleObjects = getStyleObjects(content);
      for (const obj of styleObjects) {
        obj.fontFamily = obj.fontFamily.replace(/"/g, "'");
        obj.weight = String(obj.weight);
      }

      const formatObjects = getFormatObjects(content);
      for (const obj of formatObjects) {
        delete obj.style;
      }

      typeSpecific.style.source = typeSpecific.style.source || {
        font: getExtendedFormatObject(9, undefined, undefined, '#707070')
      };

      if (visualTypes.includes(type)) {
        typeSpecific.layout = typeSpecific.layout || createVisualLayout(content); // typeSpecific.layout ||

        // apply custom layout to tagesschau maps
        if (content.userInfo.email === 'tagesschau@23degrees.io' && type === 'choropleth') {
          const activeLayout = typeSpecific.layout.layouts[typeSpecific.layout.active];

          // only apply on "generated" layouts
          if (activeLayout.autoGenerated) {
            activeLayout.children[1].children[1].children[0].children[0].children[0].options.margin.left = 20; // search
            activeLayout.children[1].children[1].children[0].children[0].children[1].options.margin.left = 20; // legend

            activeLayout.children[2].children[0].children.pop(); // info button
            activeLayout.children[2].children[0].style.flexDirection = 'column';
            activeLayout.children[2].children[0].style.alignItems = 'flex-start';

            const logoChild = activeLayout.children[2].children[0].children.splice(0, 1)[0];
            logoChild.options.margin.left = 20;
            logoChild.options.margin.bottom = 10;
            activeLayout.children[1].children[1].children[2].children.unshift(logoChild);
            activeLayout.children[1].children[1].children[2].style.justifyContent = 'space-between';

            content.typeSpecific.style.source.font.margin.left = 20; // source
            content.typeSpecific.style.source.font.margin.bottom = 10;
          }
        }

        // old -> advanced tooltip
        if (typeSpecific.advancedTooltip.content === '') {
          // typeSpecific.advancedTooltip.enabled = true;
          typeSpecific.advancedTooltip.type = 'classic';
          typeSpecific.advancedTooltip.position = 'global';

          typeSpecific.advancedTooltip.content = getTooltipContent(content);
        }
      }

      // App Push 06.06.2019
      typeSpecific.version = 20;
    }

    // App Push 26.06.2019
    if (typeSpecific.version < 21) {
      if (visualTypes.includes(type) || type === 'atlas' || type === 'report') {
        typeSpecific.embed = typeSpecific.embed || {
          mode: 'responsive', // responsive, fixed, flexible, external
          width: 800,
          height: 600
        };

        // HOTFIX 28.06.2019
        if (typeSpecific.export.external === true) typeSpecific.embed.mode = 'external';
        if (typeSpecific.export.stretch === false) typeSpecific.embed.mode = 'fixed';

        if (content.injected) {
          const breakies = typeSpecific.style.breakPoints.values;
          if (breakies.length === 5) {
            // only update if they are unchanged
            if (
              breakies[0].domain === 360 &&
              breakies[0].range === 0.7 &&
              breakies[1].domain === 600 &&
              breakies[1].range === 1 &&
              breakies[2].domain === 800 &&
              breakies[2].range === 1.2 &&
              breakies[3].domain === 1280 &&
              breakies[3].range === 1.5 &&
              breakies[4].domain === 1920 &&
              breakies[4].range === 2
            ) {
              breakies[0] = { domain: 360, range: 1, aspectRatio: 0.8 };
              breakies[1] = { domain: 480, range: 1, aspectRatio: 1 };
              breakies[2] = { domain: 600, range: 1.1, aspectRatio: 1.3 };
              breakies[3] = { domain: 800, range: 1.1, aspectRatio: 1.5 };
              breakies[4] = { domain: 960, range: 1.2, aspectRatio: 1.7 };

              breakies.push({ domain: 1280, range: 1.2, aspectRatio: 1.7 });
              breakies.push({ domain: 1440, range: 1.3, aspectRatio: 1.7 });
              breakies.push({ domain: 1920, range: 1.3, aspectRatio: 1.7 });

              typeSpecific.style.breakPoints.version = typeSpecific.style.breakPoints.version || 1;
            }
          }
        }
      }

      // App Push 26.06.2019
      typeSpecific.version = 21;
    }

    //  App Push 17.07.2019
    if (typeSpecific.version < 22) {
      if (type === 'dataset') {
        typeSpecific.autocreateGroups = typeSpecific.hasOwnProperty('autocreateGroups') ? typeSpecific.autocreateGroups : false;

        if (!typeSpecific.uniqueFields) {
          typeSpecific.uniqueFields = [];
        }
      }

      typeSpecific.version = 22;
    }

    // App Push 24.07.2019
    if (typeSpecific.version < 23) {
      //add acess levels
      //create a new access variable and set public parts to it
      if (!content.access && content.type !== 'collection') {
        if (PublicUserIds.includes(content.userId)) {
          if (content.isPublic) {
            content.access = AccessLevels.public;
          } else {
            content.access = AccessLevels.private;
          }
        } else {
          if (content.isPublic) {
            content.access = AccessLevels.unlisted;
          } else {
            content.access = AccessLevels.private;
          }
        }
      }
      typeSpecific.version = 23;
    }

    // App Push 29.08.2019
    if (typeSpecific.version < 24) {
      if (visualTypes.includes(type)) {
        const attributionMargin = getFormatMarginPaddingObject(3, 'px', 3, 'px', 3, 'px', 3, 'px');

        typeSpecific.map.attributions = typeSpecific.map.attributions || {
          font: getExtendedFormatObject(9, undefined, undefined, '#000000', undefined, undefined, undefined, attributionMargin)
        };

        typeSpecific.map.legend.showOnlyOccurrences = typeSpecific.map.legend.hasOwnProperty('showOnlyOccurrences')
          ? typeSpecific.map.legend.showOnlyOccurrences
          : false;
      }

      if (visualTypes.includes(type)) {
        // donut config
        if (!typeSpecific.chart.donut) {
          typeSpecific.chart.donut = {
            degrees: type === 'donutchart_half' ? 180 : 360,
            padAngle: 0.01,
            innerRadius: 0.5,
            outerRadius: 1
          };
        }

        if (!typeSpecific.noDataMessages) {
          typeSpecific.noDataMessages = {
            inline: 'Keine Daten verfügbar',
            legend: 'Keine Daten verfügbar',
            visual: 'Keine Daten verfügbar'
          };
        }

        if (!typeSpecific.chart.bars) {
          typeSpecific.chart.bars = {
            minHeight: 25,
            paddingInner: 0.2,
            paddingOuter: 0,
            groupPaddingInner: 0.1,
            groupPaddingOuter: 0
          };
        }

        if (!typeSpecific.chart.gridUser) {
          typeSpecific.chart.gridUser = {
            enabled: false,
            color: '#333333',
            width: 1,
            lineDash: [2, 2],
            isAbove: true,
            values: []
          };
        }
      }

      typeSpecific.version = 24;
    }

    // App Push 11.09.2019
    if (typeSpecific.version < 25) {
      // dataset updateInterval
      if (type === 'dataset') {
        typeSpecific.updateInterval = typeSpecific.updateInterval || 'static';
      }

      if (!content.metrics) {
        content.metrics = getBaseMetricObect();
      }

      typeSpecific.version = 25;
    }

    // App Push 02.10.2019
    if (typeSpecific.version < 26) {
      // Add map highlight color and hover state
      if (visualTypes.includes(type) && typeSpecific.map) {
        // Add custom active layer options TBD - template?
        typeSpecific.map.options.highlight = typeSpecific.map.options.highlight || {
          enabled: true,
          type: 'line',
          width: 1,
          fill: 'rgba(255, 255, 255, 0.4)',
          color: '#000'
        };

        // Add custom hover layer options TBD - template?
        typeSpecific.map.options.hover = typeSpecific.map.options.hover || {
          enabled: false,
          type: 'fill',
          width: 1,
          fill: 'rgba(255, 255, 255, 0.4)',
          color: '#fff'
        };
      }

      typeSpecific.version = 26;
    }

    // App Push 09.10.2019
    if (typeSpecific.version < 27) {
      if (visualTypes.includes(type) && typeSpecific.map) {
        typeSpecific.map.options.renderWorldCopies = typeSpecific.map.options.hasOwnProperty('renderWorldCopies')
          ? typeSpecific.map.options.renderWorldCopies
          : true;
      }

      typeSpecific.version = 27;
    }

    // App Push 17.10.2019
    if (typeSpecific.version < 28) {
      // TBD template -> new entry for template so no backsies
      if (visualTypes.includes(type) && typeSpecific.map.options) {
        typeSpecific.map.options.searchPlaceholder = typeSpecific.map.options.searchPlaceholder ? typeSpecific.map.options.searchPlaceholder : '';
      }

      if (visualTypes.includes(type) && typeSpecific.tooltip) {
        typeSpecific.tooltip.theme = typeSpecific.tooltip.theme ? typeSpecific.tooltip.theme : 'default';
      }

      // advanced tooltip classic mobile TODO add to template validator
      if (visualTypes.includes(type)) {
        if (
          typeSpecific.advancedTooltip &&
          typeSpecific.advancedTooltip.style &&
          typeSpecific.advancedTooltip.style.classic &&
          typeSpecific.advancedTooltip.style.classic.maxHeight
        ) {
          const mobileHeightValue = typeSpecific.advancedTooltip.style.classic.maxHeight.mobile.value;
          const desktopHeightValue = typeSpecific.advancedTooltip.style.classic.maxHeight.desktop.value;

          if (mobileHeightValue > 50) {
            typeSpecific.advancedTooltip.style.classic.maxHeight.mobile.value = 50;
          }

          if (desktopHeightValue > 60) {
            typeSpecific.advancedTooltip.style.classic.maxHeight.desktop.value = 60;
          }
        }
      }

      typeSpecific.version = 28;
    }

    // App Push 23.10.2019
    if (typeSpecific.version < 29) {
      if (visualTypes.includes(type)) {
        const { margin, padding } = typeSpecific.chart.style;
        if (margin.left === 0 && margin.top === 0 && margin.right === 0 && margin.bottom === 0) {
          margin.left = 5;
          margin.top = 5;
          margin.right = 5;
          margin.bottom = 5;
        }

        if (padding.left === 10 && padding.top === 10 && padding.right === 10 && padding.bottom === 10) {
          padding.left = 5;
          padding.top = 5;
          padding.right = 5;
          padding.bottom = 5;
        }

        if (!!typeSpecific.chart.background) delete typeSpecific.chart.background;
        if (!!typeSpecific.chart.margin) delete typeSpecific.chart.margin;
        if (!!typeSpecific.chart.title) delete typeSpecific.chart.title;

        if (typeSpecific.map.options) {
          // New Map Search Object
          if (!typeSpecific.map.search) {
            const search = {
              fieldName: typeSpecific.map.searchField,
              placeholder: typeSpecific.map.options.searchPlaceholder,
              keepCurrentMapZoom: false,
              animationSpeed: 1.42,
              animationCurve: 1.2
            };

            typeSpecific.map.search = search;

            delete typeSpecific.map.searchField;
            delete typeSpecific.map.options.searchPlaceholder;
          }

          // New Bounding Box
          const { options } = typeSpecific.map;
          typeSpecific.map.options.withStartAnimation = typeSpecific.map.options.hasOwnProperty('withStartAnimation')
            ? typeSpecific.map.options.withStartAnimation
            : !!options.flyTo || !options.fitBounds;
          typeSpecific.map.options.startViewport = typeSpecific.map.options.startViewport || options.fitBounds || options.flyTo;

          const { startViewport } = typeSpecific.map.options;
          if (startViewport && Array.isArray(startViewport) && startViewport.length > 2) {
            typeSpecific.map.options.startViewport = [[startViewport[0], startViewport[1]], [startViewport[2], startViewport[3]]];
          }

          typeSpecific.map.options.maxViewport = typeSpecific.map.options.maxViewport || options.maxBounds || [[-180, -85], [180, 85]];
          typeSpecific.map.options.maxViewportIsLimit = typeSpecific.map.options.hasOwnProperty('maxViewportIsLimit')
            ? typeSpecific.map.options.maxViewportIsLimit
            : !!options.maxBounds;

          if (!!typeSpecific.map.options.fitBounds) delete typeSpecific.map.options.fitBounds;
          if (!!typeSpecific.map.options.flyTo) delete typeSpecific.map.options.flyTo;
          if (!!typeSpecific.map.options.maxBounds) delete typeSpecific.map.options.maxBounds;
        }
      }

      typeSpecific.version = 29;
    }

    // App Push 06.11.2019
    if (typeSpecific.version < 30) {
      // nice bug from data-table
      if (typeSpecific.fields) {
        for (const fieldName of Object.keys(typeSpecific.fields)) {
          const field = typeSpecific.fields[fieldName];
          if (field && field.formatType && field.format) {
            field.format.formatType = field.formatType;
            delete field.formatType;
          }
        }
      }

      if (visualTypes.includes(type)) {
        // advanced tooltip
        const advContent = JSON.parse(typeSpecific.advancedTooltip.content);
        for (const op of advContent.ops) {
          const { inlineValue } = op.insert;
          if (inlineValue) {
            const parentField = typeSpecific.fields[inlineValue.fieldName];
            if (parentField && parentField.format && inlineValue.format) {
              inlineValue.format.formatType = parentField.format.formatType;
            }
          }
        }

        typeSpecific.advancedTooltip.content = JSON.stringify(advContent);

        // normal tooltip values
        if (typeSpecific.tooltip && typeSpecific.tooltip.value && typeSpecific.tooltip.value.field) {
          const tooltipField = typeSpecific.tooltip.value.field;
          if (tooltipField && tooltipField.startsWith('data:')) {
            const tooltipFieldName = tooltipField.substr(tooltipField.indexOf(':') + 1);
            const parentField = typeSpecific.fields[tooltipFieldName];

            if (parentField && parentField.format && typeSpecific.tooltip.value.field.format) {
              typeSpecific.tooltip.value.format.formatType = parentField.format.formatType;
            }
          }
        }

        // normal tooltip fields
        if (typeSpecific.tooltip && typeSpecific.tooltip.fields && typeSpecific.tooltip.fields.length > 0) {
          for (const field of typeSpecific.tooltip.fields) {
            const subField = field.field;
            if (subField && subField.startsWith('data:')) {
              const subFieldName = subField.substr(subField.indexOf(':') + 1);
              const parentField = typeSpecific.fields[subFieldName];

              if (parentField && parentField.format && field.format) {
                field.format.formatType = parentField.format.formatType;
              }
            }
          }
        }

        const valueFieldName = getValueFieldName(content);
        if (valueFieldName) {
          const parentField = typeSpecific.fields[valueFieldName];
          if (parentField) {
            // legend title
            if (typeSpecific.map && typeSpecific.map.legend && typeSpecific.map.legend.title && typeSpecific.map.legend.title.format) {
              typeSpecific.map.legend.title.format.formatType = parentField.format.formatType;
            }

            // legend values
            if (typeSpecific.map && typeSpecific.map.legend && typeSpecific.map.legend.values && typeSpecific.map.legend.values.format) {
              typeSpecific.map.legend.values.format.formatType = parentField.format.formatType;
            }

            // chart values
            if (typeSpecific.chart && typeSpecific.chart.values && typeSpecific.chart.values.format) {
              typeSpecific.chart.values.format.formatType = parentField.format.formatType;
            }

            // chart value axis
            if (typeSpecific.chart && typeSpecific.chart.axis && typeSpecific.chart.axis.valueAxis && typeSpecific.chart.axis.valueAxis.format) {
              typeSpecific.chart.axis.valueAxis.format.formatType = parentField.format.formatType;
            }
          }
        }

        const labelFieldName = getLabelFieldName(content);
        // chart label axis special treatment
        if (labelFieldName) {
          const parentField = typeSpecific.fields[labelFieldName];
          if (parentField) {
            if (typeSpecific.chart && typeSpecific.chart.axis && typeSpecific.chart.axis.labelAxis && typeSpecific.chart.axis.labelAxis.format) {
              typeSpecific.chart.axis.labelAxis.format.formatType = parentField.format.formatType;
            }
          }
        }
      }

      typeSpecific.version = 30;
    }

    // App Push 20.11.2019
    if (typeSpecific.version < 31) {
      if (visualTypes.includes(type)) {
        typeSpecific.chart.fontScale = typeSpecific.chart.hasOwnProperty('fontScale') ? typeSpecific.chart.fontScale : 0.5;
        typeSpecific.layout.oldLayoutStyle = typeSpecific.layout.hasOwnProperty('oldLayoutStyle') ? typeSpecific.layout.oldLayoutStyle : true;
      }

      // maybe wrong format is in advanced tooltip!
      if (visualTypes.includes(type)) {
        // advanced tooltip
        const advContent = JSON.parse(typeSpecific.advancedTooltip.content);
        for (const op of advContent.ops) {
          const { inlineValue } = op.insert;
          if (inlineValue) {
            const parentField = typeSpecific.fields[inlineValue.fieldName];
            if (parentField && parentField.format && inlineValue.format) {
              if (parentField.format.formatType === 'date' && inlineValue.format.formatType === 'date') {
                // check if input is different?
                if (parentField.format.date.inputFormat !== inlineValue.format.date.inputFormat) {
                  inlineValue.format.date = cloneObject(parentField.format.date);
                }
              }
            }
          }
        }

        typeSpecific.advancedTooltip.content = JSON.stringify(advContent);
      }

      if (visualTypes.includes(type)) {
        // In visual filter updates
        const inVisMargin = typeSpecific.style.inVisualFilter.font.margin;
        const inVisPadding = typeSpecific.style.inVisualFilter.font.padding;

        if (inVisMargin.top === 0 && inVisMargin.right === 0 && inVisMargin.bottom === 0 && inVisMargin.left === 0) {
          typeSpecific.style.inVisualFilter.font.margin = getFormatMarginPaddingObject(5, undefined, 5, undefined, 5, undefined, 5);
        }

        if (inVisPadding.top === 0 && inVisPadding.right === 0 && inVisPadding.bottom === 0 && inVisPadding.left === 0) {
          typeSpecific.style.inVisualFilter.font.padding = getFormatMarginPaddingObject(5, undefined, 10, undefined, 5, undefined, 10);
        }

        typeSpecific.style.inVisualFilter.borderRadius = typeSpecific.style.inVisualFilter.hasOwnProperty('borderRadius')
          ? typeSpecific.style.inVisualFilter.borderRadius
          : 100;
      }

      typeSpecific.version = 31;
    }

    // App Push  05.12.2019
    if (typeSpecific.version < 32) {
      if (visualTypes.includes(type)) {
        // decouple chart legend format
        const { labelField } = typeSpecific.data;
        const legendFormat = cloneObject(typeSpecific.fields[labelField].format);
        typeSpecific.chart.legend.format = typeSpecific.chart.legend.format || legendFormat;
      }

      // add default permissions object
      typeSpecific.permissions = typeSpecific.permissions || {
        // allow, default, deny
        edit: { type: 'edit', state: 'default', owner: content.userId },
        embed: { type: 'embed', state: 'default', owner: content.userId },
        exportPNG: { type: 'exportPNG', state: 'default', owner: content.userId },
        exportSVG: { type: 'exportSVG', state: 'default', owner: content.userId },
        exportCSV: { type: 'exportCSV', state: 'default', owner: content.userId },
        exportXLS: { type: 'exportXLS', state: 'default', owner: content.userId },
        exportJSON: { type: 'exportJSON', state: 'default', owner: content.userId },
        contentSave: { type: 'contentSave', state: 'default', owner: content.userId },
        templateSave: { type: 'templateSave', state: 'default', owner: content.userId }
      };

      typeSpecific.version = 32;
    }

    // App Push 19.12.2019
    if (typeSpecific.version < 33) {
      if (visualTypes.includes(type)) {
        // decouple chart legend format
        const { labelField } = typeSpecific.data;
        const legendFormat = cloneObject(typeSpecific.fields[labelField].format);
        if (typeSpecific.chart.legend.format.formatType !== legendFormat.formatType) {
          typeSpecific.chart.legend.format = legendFormat;
        }
        // extract colors into active colors of colors
        if (typeSpecific.style && typeSpecific.style.colors2) {
          if (!typeSpecific.style.colors2.activeColors) {
            const colorObj = typeSpecific.style.colors2;
            if (colorObj.type === 'categorical') {
              const { values, fallback } = colorObj.categorical;
              const colors = values.map(obj => obj.color);
              colors.push(fallback);
              typeSpecific.style.colors2.activeColors = unique(colors);
            }

            if (colorObj.type === 'gradient') {
              const { values } = colorObj.gradient;
              typeSpecific.style.colors2.activeColors = unique(cloneObject(values.map(obj => obj.color)));
            }

            if (colorObj.type === 'range') {
              typeSpecific.style.colors2.activeColors = unique(cloneObject(colorObj.range.colors));
            }

            if (colorObj.type === 'solid') {
              typeSpecific.style.colors2.activeColors = unique(cloneObject([colorObj.solid]));
            }

            if (colorObj.type === 'continuous') {
              typeSpecific.style.colors2.activeColors = unique(cloneObject(colorObj.continuous.colors));
            }
          }
        }
      }

      typeSpecific.version = 33;
    }

    // App Push 05.02.2020
    if (typeSpecific.version < 34) {
      if (visualTypes.includes(type)) {
        // fix map style source to point to new style service
        if (typeSpecific.style && typeSpecific.style.url) {
          typeSpecific.style.url = typeSpecific.style.url.replace('tiles.23degrees.io', 'style.23degrees.io');
        }

        // fix map.source.url & map.pointSource.url to point to new choropleth server
        if (typeSpecific.map && typeSpecific.map.sources && typeSpecific.map.sources.length > 0) {
          for (const source of typeSpecific.map.sources) {
            // fix source.url
            if (source && source.url) {
              source.url = source.url.replace('tiles.23degrees.io', 'layers.23degrees.io');
            }

            // fix source.pointSource.url
            if (source && source.pointSource && source.pointSource.url) {
              source.pointSource.url = source.pointSource.url.replace('tiles.23degrees.io', 'layers.23degrees.io');
            }
          }
        }
      }

      typeSpecific.version = 34;
    }

    // App Push 19.02.2020
    if (typeSpecific.version < 35) {
      if (visualTypes.includes(type)) {
        const { legend, values } = typeSpecific.chart;
        if (!values.hasOwnProperty('forceDraw')) {
          values.forceDraw = false;

          values.style.margin.top = 0.5;
          values.style.margin.topUnit = 'em';
          values.style.margin.right = 0;
          values.style.margin.rightUnit = 'em';
          values.style.margin.bottom = 0.5;
          values.style.margin.bottomUnit = 'em';
          values.style.margin.left = 0;
          values.style.margin.leftUnit = 'em';
        }

        const { labelAxis, valueAxis } = typeSpecific.chart.axis;
        if (!labelAxis.hasOwnProperty('autoLines')) {
          labelAxis.valueStyle.position = 'right';
          labelAxis.valueStyle.lineheight.value = 1;
          labelAxis.valueStyle.lineheight.unit = 'em';

          labelAxis.autoLines = true;
          labelAxis.maxLines = 0;
          labelAxis.autoRotation = true;
          labelAxis.minRotation = -1;
          labelAxis.placementMode = 'rotate'; // auto rotate offset

          labelAxis.lineBreakFactor = 3.2;
          labelAxis.numLabels = 5;
        }

        if (!valueAxis.hasOwnProperty('autoLines')) {
          valueAxis.valueStyle.position = 'right';
          valueAxis.valueStyle.lineheight.value = 1;
          valueAxis.valueStyle.lineheight.unit = 'em';

          valueAxis.autoLines = true;
          valueAxis.maxLines = 0;
          valueAxis.autoRotation = true;
          valueAxis.minRotation = -1;
          valueAxis.placementMode = 'rotate'; // auto rotate offset

          valueAxis.lineBreakFactor = 3.2;
          valueAxis.numValues = 5;
        }

        const rightLabelFieldName = getRightLabelFieldName(content);
        const rightLegendFieldName = getRightLegendFieldName(content);

        const rightLabelField = typeSpecific.fields[rightLabelFieldName];
        const rightLegendField = typeSpecific.fields[rightLegendFieldName];

        if (labelAxis.format.formatType !== rightLabelField.format.formatType) {
          labelAxis.format = cloneObject(rightLabelField.format);
        }

        if (legend.format.formatType !== rightLegendField.format.formatType) {
          labelAxis.format = cloneObject(rightLegendField.format);
        }
      }

      typeSpecific.version = 35;
    }

    // App push 04.03.2020
    if (typeSpecific.version < 36) {
      if (visualTypes.includes(type)) {
        const { legend } = typeSpecific.chart;
        legend.fontScale = legend.hasOwnProperty('fontScale') ? legend.fontScale : 0.5;
      }

      /**
       * Adding Background, BorderRadius to legend title and body
       * and border for color boxes
       *  */
      if (visualTypes.includes(type) && typeSpecific.map) {
        const { legend } = typeSpecific.map;

        // Add border radius to map legend header and body
        legend.values.borderRadius = legend.values.hasOwnProperty('borderRadius') ? legend.values.borderRadius : 2;
        legend.title.borderRadius = legend.title.hasOwnProperty('borderRadius') ? legend.title.borderRadius : 2;

        // Add background to map legend header and body
        legend.values.background = legend.values.background || {
          backgroundColor: 'rgba(255, 255, 255, 0.93)'
        };
        legend.title.background = legend.title.background || {
          backgroundColor: 'rgba(255, 255, 255, 0.93)'
        };

        legend.values.shadow = legend.values.shadow || {
          x: 0,
          y: 2,
          blur: 12,
          spread: 0,
          color: 'rgba(0, 0, 0, 0.15)'
        };
        legend.title.shadow = legend.title.shadow || {
          x: 0,
          y: 2,
          blur: 12,
          spread: 0,
          color: 'rgba(0, 0, 0, 0.15)'
        };

        // Add custom style to color boxes in map legend
        legend.colorBoxes = legend.colorBoxes || {
          border: {
            size: {
              top: 0,
              right: 0,
              bottom: 0,
              left: 0
            },
            color: 'transparent',
            type: 'none'
          }
        };
      }
      typeSpecific.version = 36;
    }

    //NO APP PUSH YET
    if (typeSpecific.version < 37) {
    }

    if (content) {
      // ALWAYS CHECK FOR WRONG FONT FAMILY
      const styleObjects = getStyleObjects(content);
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

      // ALWAYS VALIDATE LAYOUT
      if (visualTypes.includes(type) || type === 'atlas') {
        let layoutType = 'error';
        if (type === 'atlas') layoutType = 'atlas';
        if (visualTypes.includes(type)) layoutType = 'visual';
        typeSpecific.layout = validateLayout(typeSpecific.layout, layoutType);
      }
    }
  } catch (error) {
    console.log('[ContentValidator] - Error :', error);
    return {
      valid: false,
      content: content,
      information: error
    };
  }

  return {
    valid: true,
    content: content,
    information: 'ok'
  };
};
