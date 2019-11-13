const uniqueInVisualFilterTypes = ["valueSelector"];

import { cloneObject, unique } from "../utilities";

export const getBaseInvisualFilterValueSelector = (fieldName, appearance) => {
  return {
    type: "valueSelector",
    fieldName: fieldName,
    options: {
      appearance: appearance,
      sort: "asc",
      saveState: "last"
    }
  };
};

/**
  no double fields in dimensions
 */
export const switchVisualConfigurationDimensions = (
  visualConfiguration,
  changedDimension
) => {
  for (const dimension of visualConfiguration.dimensions) {
    if (
      dimension.dimName !== changedDimension.dimName &&
      dimension.fieldName === changedDimension.fieldName
    ) {
      // ohoh
      dimension.fieldName = dimension.possibleFields.filter(
        el => el.fieldName !== dimension.fieldName
      )[0].fieldName;
    }
  }
  return visualConfiguration;
};

/**
 * maps new dimensions to old data namings
 */
export const enhanceVisualOptionsWithVisualConfiguration = (
  visualConfiguration,
  visualOptions,
  fields
) => {
  visualOptions.labelField = null;
  visualOptions.timeField = null;
  visualOptions.valueField = null;
  visualOptions.isoField = null;
  visualOptions.isoMappingId = null;
  visualOptions.inVisualFilter = [];
  visualOptions.aggregationField = null;
  // check if we have a isoField
  for (const fieldName of Object.keys(fields)) {
    if (fields[fieldName].isoMappingId) {
      visualOptions.isoMappingId = fields[fieldName].isoMappingId;
    }
  }
  // add uniqueFilters TODO refactor all of this
  if (visualConfiguration.uniqueFilters.length > 0) {
    for (const uniqueFilter of visualConfiguration.uniqueFilters) {
      if (uniqueFilter.inVisual) {
        let filterObj = {};
        if (uniqueFilter.filterObj) {
          filterObj = uniqueFilter.filterObj;
        } else {
          filterObj = getBaseInvisualFilterValueSelector(
            uniqueFilter.fieldName,
            "timeline"
          );
        }
        visualOptions.inVisualFilter.push(filterObj);
      }
    }
  }
  switch (visualConfiguration.type) {
    case "areachart":
    case "linechart":
      for (const dimension of visualConfiguration.dimensions) {
        if (dimension.dimName === "xAxis") {
          visualOptions.timeField = dimension.fieldName;
        }
        if (dimension.dimName === "yAxis") {
          visualOptions.valueField = dimension.fieldName;
        }
        // series axis
        if (dimension.dimName === "labelAxis") {
          visualOptions.labelField = dimension.fieldName;
        }
      }
      break;
    case "barchart":
    case "horizontalbarchart":
    case "donutchart":
    case "donutchart_half":
      for (const dimension of visualConfiguration.dimensions) {
        if (dimension.dimName === "xAxis") {
          visualOptions.labelField = dimension.fieldName;
        }
        if (dimension.dimName === "yAxis") {
          visualOptions.valueField = dimension.fieldName;
        }
      }
      break;
    case "groupedbarchart":
    case "stackedbarchart":
    case "bar-grouped-horizontal":
    case "bar-stacked-horizontal":
      // label field is the field that is used for series
      // aggregation Field is used for xAxis and Tooltips
      for (const dimension of visualConfiguration.dimensions) {
        if (dimension.dimName === "xAxis") {
          visualOptions.labelField = dimension.fieldName;
        }
        if (dimension.dimName === "yAxis") {
          visualOptions.valueField = dimension.fieldName;
        }
        if (dimension.dimName === "groupAxis") {
          visualOptions.aggregationField = dimension.fieldName;
        }
      }
      break;
    case "choropleth":
      for (const dimension of visualConfiguration.dimensions) {
        if (dimension.dimName === "iso") {
          visualOptions.labelField = dimension.fieldName;
          // get the isoField :
          visualOptions.isoField = fields[dimension.fieldName].isoIsoField;
        }
        if (dimension.dimName === "value") {
          visualOptions.valueField = dimension.fieldName;
        }
      }
      break;
    default:
  }
  return visualOptions;
};

export const getTooltips = (fields, visualOptions) => {
  //console.log('get tooltips', fields, visualOptions);
  const toolTips = {};
  toolTips.event = "click";
  toolTips.type = "old";
  toolTips.name = "data:" + visualOptions.labelField;
  toolTips.value = {
    label: "", //fields[visualOptions.valueField].title,
    field: "data:" + visualOptions.valueField,
    format: cloneObject(fields[visualOptions.valueField].format)
  };
  toolTips.fields = [];
  return toolTips;
};

export const getChartLabelAxis = (fields, type, visualOptions) => {
  if (["areachart", "linechart"].includes(type)) {
    return {
      enabled: true,
      title: "", //fields[visualOptions.timeField].title,
      format: cloneObject(fields[visualOptions.timeField].format)
    };
  } else if (
    [
      "groupedbarchart",
      "stackedbarchart",
      "bar-grouped-horizontal",
      "bar-stacked-horizontal"
    ].includes(type)
  ) {
    return {
      enabled: true,
      title: "", //fields[visualOptions.aggregationField].title,
      format: cloneObject(fields[visualOptions.aggregationField].format)
    };
  } else {
    return {
      enabled: true,
      title: "", //cloneObject(fields[visualOptions.labelField].title),
      format: cloneObject(fields[visualOptions.labelField].format)
    };
  }
};

export const getChartValueAxis = (fields, type, visualOptions) => {
  return {
    enabled: true,
    title: "", //cloneObject(fields[visualOptions.valueField].title),//fields[visualOptions.valueField].title,
    format: cloneObject(fields[visualOptions.valueField].format)
  };
};

export const getChartSorting = (fields, type, visualOptions) => {
  const sortOrder = [];

  if (visualOptions.aggregationField) {
    sortOrder.push(fields[visualOptions.aggregationField].fieldName);
  }

  if (visualOptions.timeField) {
    sortOrder.push(fields[visualOptions.timeField].fieldName);
  }

  sortOrder.push(fields[visualOptions.valueField].fieldName);

  return sortOrder;
};

export const applyVisualConfigurationToContent = (
  content,
  visualConfiguration,
  data,
  formattingChanges = true
) => {
  // set is needed for uniqueNess false for all fields
  const backupUniqueFilterValues = {};
  for (const fieldName of Object.keys(content.typeSpecific.fields)) {
    const field = content.typeSpecific.fields[fieldName];
    if (field.isNeededForUniqueness) {
      // console.log('DESELECTING FORMERY SELECTED FIELD');
      backupUniqueFilterValues[fieldName] = JSON.parse(
        JSON.stringify(field.selectedValues)
      );
      field.isNeededForUniqueness = false;
      field.selectedValues = [];
    }
  }

  // for unique editor filters apply
  for (const uniqueFilter of visualConfiguration.uniqueFilters) {
    if (!uniqueFilter.inVisual) {
      // this is in editor
      // console.log("ADDING EDITOR FILTER", uniqueFilter)
      // see if we have a backup value
      if (backupUniqueFilterValues[uniqueFilter.fieldName]) {
        content.typeSpecific.fields[
          uniqueFilter.fieldName
        ].isNeededForUniqueness = true;
        content.typeSpecific.fields[uniqueFilter.fieldName].selectedValues =
          backupUniqueFilterValues[uniqueFilter.fieldName];
      } else {
        const uniqueValues = unique(
          data.map(obj => obj[uniqueFilter.fieldName])
        );
        const selectedValue = uniqueValues[0];
        content.typeSpecific.fields[
          uniqueFilter.fieldName
        ].isNeededForUniqueness = true;
        content.typeSpecific.fields[uniqueFilter.fieldName].selectedValues = [
          selectedValue
        ];
      }
    }
  }
  // console.log("BEFORE ENHANCE CONFIG", content);
  const visualOptions = enhanceVisualOptionsWithVisualConfiguration(
    visualConfiguration,
    {},
    content.typeSpecific.fields
  );
  // things that have to be applied
  content.type = visualConfiguration.type;
  // data
  content.typeSpecific.data.valueField = visualOptions.valueField;
  content.typeSpecific.data.timeField = visualOptions.timeField;
  content.typeSpecific.data.isoField = visualOptions.isoField;
  content.typeSpecific.data.labelField = visualOptions.labelField;
  content.typeSpecific.data.isoMappingId = visualOptions.isoMappingId;
  content.typeSpecific.data.aggregationField = visualOptions.aggregationField;
  // fields -> aka Editor Filters -- TODO

  // invisualFilters

  //get all invisual filers that are multivalue
  const multiValueFilters = content.typeSpecific.inVisualFilter.filter(
    el => el.type == "multiValueSelector"
  );
  content.typeSpecific.inVisualFilter = visualOptions.inVisualFilter;
  content.typeSpecific.inVisualFilter = content.typeSpecific.inVisualFilter.concat(
    multiValueFilters
  );

  // dimensions
  content.typeSpecific.dimensions = visualConfiguration.dimensions;

  if (formattingChanges) {
    // tooltips
    const tooltips = getTooltips(content.typeSpecific.fields, visualOptions);
    if (content.typeSpecific.tooltip.titleStyle) {
      tooltips.titleStyle = content.typeSpecific.tooltip.titleStyle;
    }
    if (content.typeSpecific.tooltip.valueStyle) {
      tooltips.valueStyle = content.typeSpecific.tooltip.valueStyle;
    }
    if (content.typeSpecific.tooltip.value) {
      tooltips.contentStyle = content.typeSpecific.tooltip.contentStyle;
    }
    if (content.typeSpecific.tooltip.theme) {
      tooltips.theme = content.typeSpecific.tooltip.theme;
    }
    content.typeSpecific.tooltip = tooltips;
    // add title style and content style if exists -> v6 Compability

    // chart.sorting
    content.typeSpecific.chart.sorting.sortFields = getChartSorting(
      content.typeSpecific.fields,
      visualConfiguration.type,
      visualOptions
    );
    // chart.axis
    const chartLabelAxis = getChartLabelAxis(
      content.typeSpecific.fields,
      visualConfiguration.type,
      visualOptions
    );
    // add title style and content style if exists -> v6 Compability
    if (content.typeSpecific.chart.axis.labelAxis.titleStyle) {
      chartLabelAxis.titleStyle =
        content.typeSpecific.chart.axis.labelAxis.titleStyle;
      chartLabelAxis.valueStyle =
        content.typeSpecific.chart.axis.labelAxis.valueStyle;
    }
    content.typeSpecific.chart.axis.labelAxis = chartLabelAxis;

    const valueAxis = getChartValueAxis(
      content.typeSpecific.fields,
      visualConfiguration.type,
      visualOptions
    );
    if (content.typeSpecific.chart.axis.valueAxis.titleStyle) {
      valueAxis.titleStyle =
        content.typeSpecific.chart.axis.valueAxis.titleStyle;
      valueAxis.valueStyle =
        content.typeSpecific.chart.axis.valueAxis.valueStyle;
    }

    content.typeSpecific.chart.axis.valueAxis = valueAxis;
    // chart values
    content.typeSpecific.chart.values.format = cloneObject(
      content.typeSpecific.fields[visualOptions.valueField].format
    );
    // map.legend.values
    // map.legend.title
    if (content.typeSpecific.map && content.typeSpecific.map.legend) {
      content.typeSpecific.map.legend.values.format = cloneObject(
        content.typeSpecific.fields[visualOptions.valueField].format
      );
      content.typeSpecific.map.legend.title.format = cloneObject(
        content.typeSpecific.fields[visualOptions.labelField].format
      );
    }
    // console.log("AFTER", content);

    // style area chart und linechart → disable range coloring
    if (content.type === "areachart" || content.type === "linechart") {
      if (content.typeSpecific.style && content.typeSpecific.style.colors2) {
        if (content.typeSpecific.style.colors2.type === "range") {
          content.typeSpecific.style.colors2.type = "continuous";
        }
      }
    }

    // @Hedata: lets resolve if this is the place to be here:
    // Applying new value field to color settings
    if (content.typeSpecific.style.colors2) {
      content.typeSpecific.style.colors2.fieldName = visualOptions.valueField;
    }
  }
  return content;
};

export const generateVisualConfigurationFromContent = (content, data) => {
  // console.log("[Creator] - Generate VisualConfiguration from content",content);
  const visualConfiguration = {
    type: content.type,
    valid: true,
    dimensions: JSON.parse(JSON.stringify(content.typeSpecific.dimensions)),
    uniqueFilters: []
  };
  // recreate Possible Fields
  for (const dimension of visualConfiguration.dimensions) {
    dimension.possibleFields = getPossibleFieldsForDimension(
      dimension,
      content
    );
  }
  for (const fieldName of Object.keys(content.typeSpecific.fields)) {
    const field = content.typeSpecific.fields[fieldName];
    // console.log("[Creator] - Testing editor Unique Filter",field);
    if (field.isNeededForUniqueness) {
      visualConfiguration.uniqueFilters.push({
        fieldName: fieldName,
        fieldTitle: field.title,
        possibleFields: Object.keys(content.typeSpecific.fields)
          .filter(
            el =>
              content.typeSpecific.fields[el].fieldType === "miscField" ||
              content.typeSpecific.fields[el].fieldType === "timeField" ||
              content.typeSpecific.fields[el].fieldType === "isoLabelField"
          )
          .map(el => {
            return {
              fieldName: content.typeSpecific.fields[el].fieldName,
              title: content.typeSpecific.fields[el].title
            };
          }),
        inVisual: false,
        filterObj: getBaseInvisualFilterValueSelector(fieldName, "timeline")
      });
    }
  }
  // look into inVisualFilter For valueFilters
  for (const inVisualFilter of content.typeSpecific.inVisualFilter) {
    if (uniqueInVisualFilterTypes.includes(inVisualFilter.type)) {
      visualConfiguration.uniqueFilters.push({
        fieldName: inVisualFilter.fieldName,
        fieldTitle: content.typeSpecific.fields[inVisualFilter.fieldName].title,
        possibleFields: Object.keys(content.typeSpecific.fields)
          .filter(
            el =>
              content.typeSpecific.fields[el].fieldType === "miscField" ||
              content.typeSpecific.fields[el].fieldType === "timeField" ||
              content.typeSpecific.fields[el].fieldType === "isoLabelField"
          )
          .map(el => {
            return {
              fieldName: content.typeSpecific.fields[el].fieldName,
              title: content.typeSpecific.fields[el].title
            };
          }),
        inVisual: true,
        filterObj: inVisualFilter
      });
    }
  }
  // console.log('CREATOR AFTER ', visualConfiguration);
  return visualConfiguration;
};

const compareFieldTypeOrder = (a, b) => {
  if (a.order > b.order) return -1;
  if (a.order < b.order) return 1;
  return 0;
};

const backTrackUniquenessCheck = (visualConfiguration, content, data) => {
  //we have a visualConfiguration that is valid
  //get the fields used
  let validVisualConfiguration = JSON.parse(
    JSON.stringify(visualConfiguration)
  );

  const usedFields = visualConfiguration.uniqueFilters.map(el => el.fieldName);
  //can we remove some fields
  if (usedFields.length > 1) {
    console.log(
      "[backTrackUniquenessCheck] - more than 1 field found ",
      usedFields.length,
      usedFields
    );
    //can we remove a field?
    for (const fieldName of usedFields) {
      const visualConfigurationBackup = JSON.parse(
        JSON.stringify(validVisualConfiguration)
      );
      const filterIndex = visualConfigurationBackup.uniqueFilters.findIndex(
        el => el.fieldName === fieldName
      );
      if (filterIndex > -1) {
        visualConfigurationBackup.uniqueFilters.splice(filterIndex, 1);
        const valid = testVisualConfiugration(
          visualConfigurationBackup,
          data,
          content.typeSpecific.fields
        );
        console.log(
          "[backTrackUniquenessCheck] - removed: ",
          fieldName,
          " valid: ",
          valid
        );
        if (valid) {
          visualConfigurationBackup.valid = true;
          validVisualConfiguration = visualConfigurationBackup;
        }
      }
    }
  }
  return validVisualConfiguration;
};

export const addUniqueFilterToVisualConfigurationAndTestUntilValid = (
  visualConfiguration,
  content,
  data
) => {
  const loops =
    Object.keys(content.typeSpecific.fields).length -
    visualConfiguration.dimensions.length;
  for (let i = 0; i < loops; i++) {
    visualConfiguration = addUniqueFilterToVisualConfigurationAndTest(
      visualConfiguration,
      content,
      data
    );
    if (visualConfiguration.valid) {
      //backtrack visual configuration
      visualConfiguration = backTrackUniquenessCheck(
        visualConfiguration,
        content,
        data
      );
      break;
    }
  }
  return visualConfiguration;
};

export const getSortedFieldNamesForUnqiueness = content => {
  return Object.keys(content.typeSpecific.fields)
    .filter(
      el =>
        content.typeSpecific.fields[el].fieldType === "miscField" ||
        content.typeSpecific.fields[el].fieldType === "timeField" ||
        content.typeSpecific.fields[el].fieldType === "isoLabelField"
    )
    .map(el => {
      let order = 0;
      if (content.typeSpecific.fields[el].fieldType === "isoLabelField")
        order = 3;
      if (content.typeSpecific.fields[el].fieldType === "timeField") order = 2;
      if (content.typeSpecific.fields[el].fieldType === "miscField") order = 1;
      return {
        fieldName: content.typeSpecific.fields[el].fieldName,
        title: content.typeSpecific.fields[el].title,
        order: order
      };
    })
    .sort(compareFieldTypeOrder);
};

const addUniqueFilterToVisualConfigurationAndTest = (
  visualConfiguration,
  content,
  data
) => {
  // try unique filter
  const allfieldNames = getSortedFieldNamesForUnqiueness(content);
  //we have information about

  // console.log('ordered fieldNames: ', allfieldNames);
  let usedFields = visualConfiguration.dimensions
    .filter(el => el.fieldName !== undefined)
    .map(el => el.fieldName);
  // add old uniqueFilters into this
  usedFields = usedFields.concat(
    visualConfiguration.uniqueFilters.map(el => el.fieldName)
  );
  // console.log('used Fields', usedFields);
  let notUsedField = null;
  for (const field of allfieldNames) {
    // console.log('Checking for field: ', field);
    if (!usedFields.includes(field.fieldName)) {
      notUsedField = field.fieldName;
      break;
    }
  }
  // console.log('not used Fields', notUsedField);
  if (!notUsedField) {
    return visualConfiguration;
  } else {
    visualConfiguration.uniqueFilters.push({
      fieldName: notUsedField,
      possibleFields: allfieldNames,
      fieldTitle: content.typeSpecific.fields[notUsedField].title,
      inVisual: true,
      filterObj: getBaseInvisualFilterValueSelector(notUsedField, "dropdown")
    });
    const valid = testVisualConfiugration(
      visualConfiguration,
      data,
      content.typeSpecific.fields
    );
    visualConfiguration.valid = valid;
    //console.log("[Creator] - VisualConfiguration after ADD: ",JSON.parse(JSON.stringify(visualConfiguration)));
    return visualConfiguration;
  }
};

/**
 * transforms Axis to new VisualConfiguration -> doesnt deal with uniqueFilters
 * @param  oldVisualConfiguration  Template visual configuration
 * @param  newVisualConfiguration
 * @parm   data                     source data
 * @param  content                  content item
 * @return new Visual Configuration
 */
export const transformVisualConfigurationFromDifferentType = (
  oldVisualConfiguration,
  newVisualConfiguration,
  data,
  content
) => {
  /**
   * - Map:
   *      - Region  (IsoLabelField)
   *      - Value   (Value Axis)
   *  - Barchart:
   *      - X - Axis  (as Region)
   *      - Y - Axis  (Value Axis)
   *  - Horizontal Barchart:
   *      - Y - Axis ( Region = X Axis from others)
   *      - X - Axis ( Value Axis )
   *
   *  - Grouped and Stacked
   *      - X - Axis ( Region )
   *      - Stacks = Groups
   *  - Stacked and linechart
   *      - Series = groups = stacks
   *
   *  - Donut -> X Axis and such
   */
  // console.log("[Creator] - transformVisualConfigurationFromDifferentType : ",oldVisualConfiguration,newVisualConfiguration);
  let index = 0;
  const usedFields = [];
  for (const dimension of newVisualConfiguration.dimensions) {
    // axis are applied in the order the come in the array
    // value Field parts shall be reused
    if (dimension.requirements.fieldTypes.includes("valueField")) {
      // lets find the respective dimension in oldVisualConfiguration
      const oldValueDimension = oldVisualConfiguration.dimensions.find(el =>
        el.requirements.fieldTypes.includes("valueField")
      );
      if (oldValueDimension) {
        dimension.fieldName = oldValueDimension.fieldName;
        usedFields.push(dimension.fieldName);
      } else {
        usedFields.push(dimension.fieldName);
      }
    } else {
      const oldDimension = oldVisualConfiguration.dimensions[index];
      if (
        oldDimension &&
        dimension.requirements.fieldTypes.includes(
          content.typeSpecific.fields[oldDimension.fieldName].fieldType
        )
      ) {
        dimension.fieldName = oldDimension.fieldName;
        usedFields.push(dimension.fieldName);
      } else {
        // can we just leave the current dimension?
        if (!usedFields.includes(dimension.fieldName)) {
          usedFields.push(dimension.fieldName);
        } else {
          // try to find a different field from the potential fields part
          const freeField = dimension.possibleFields.find(
            el => !usedFields.includes(el.fieldName)
          );
          if (freeField) {
            dimension.fieldName = freeField.fieldName;
            usedFields.push(dimension.fieldName);
          } else {
            console.error(
              "[Creator] Error couldnt't find free field ",
              newVisualConfiguration,
              dimension
            );
          }
        }
      }
    }
    index = index + 1;
  }
  // unique Filters shall be reused if possible / needed
  // console.log("[Creator] - new VisualConfiguration after Transform: ",newVisualConfiguration);
  return newVisualConfiguration;
};

export const testVisualConfiugration = (visualConfiguration, data, fields) => {
  const fieldNameListForUniqueCheck = [];
  for (const dimension of visualConfiguration.dimensions) {
    // console.log('DIMENSION: CHECK: ', dimension);
    if (
      !fieldNameListForUniqueCheck.includes(dimension.fieldName) &&
      dimension.usedForUniqueness
    ) {
      fieldNameListForUniqueCheck.push(dimension.fieldName);
    }
  }
  // filter out unique filters
  for (const filter of visualConfiguration.uniqueFilters) {
    if (!fieldNameListForUniqueCheck.includes(filter.fieldName)) {
      fieldNameListForUniqueCheck.push(filter.fieldName);
    }
  }
  // console.log("[Creator] - Checking uniqueness on fields: ",fieldNameListForUniqueCheck,visualConfiguration);
  const isUnique = checkUniqueness(data, fieldNameListForUniqueCheck);
  return isUnique;
};

export const getDimensionsWithRequirements = type => {
  const mapTypes = ["choropleth"];
  const twoDimensionalChartTypes = [
    "barchart",
    "horizontalbarchart",
    "donutchart",
    "donutchart_half"
  ];
  const groupedChartTypes = [
    "groupedbarchart",
    "stackedbarchart",
    "bar-grouped-horizontal",
    "bar-stacked-horizontal"
  ];
  const timeChartTypes = ["areachart", "linechart"];

  if (mapTypes.includes(type)) {
    switch (type) {
      case "choropleth":
        return [
          {
            dimName: "iso",
            dimLabel: "Region",
            fieldName: undefined,
            usedForUniqueness: true,
            requirements: {
              dataTypes: ["string"],
              fieldTypes: ["isoLabelField"],
              minValues: 1
            },
            possibleFields: []
          },
          {
            dimName: "value",
            dimLabel: "Value",
            usedForUniqueness: false,
            fieldName: undefined,
            requirements: {
              fieldTypes: ["valueField"],
              minValues: 1
            },
            possibleFields: []
          }
        ];

      default:
        break;
    }
  }

  if (twoDimensionalChartTypes.includes(type)) {
    // twoDimensionalChartTypes = ['barchart', 'horizontalbarchart', 'donutchart', 'donutchart_half'];
    switch (type) {
      case "barchart":
        return [
          {
            dimName: "xAxis",
            dimLabel: "X - Axis",
            fieldName: undefined,
            usedForUniqueness: true,
            requirements: {
              fieldTypes: ["miscField", "isoLabelField", "timeField"],
              minValues: 2
            },
            possibleFields: []
          },
          {
            dimName: "yAxis",
            dimLabel: "Y - Axis",
            usedForUniqueness: false,
            fieldName: undefined,
            requirements: {
              fieldTypes: ["valueField"],
              minValues: 2
            },
            possibleFields: []
          }
        ];
      case "horizontalbarchart":
        return [
          {
            dimName: "xAxis",
            dimLabel: "Y - Axis",
            fieldName: undefined,
            usedForUniqueness: true,
            requirements: {
              fieldTypes: ["miscField", "isoLabelField", "timeField"],
              minValues: 2
            },
            possibleFields: []
          },
          {
            dimName: "yAxis",
            dimLabel: "X - Axis",
            usedForUniqueness: false,
            fieldName: undefined,
            requirements: {
              fieldTypes: ["valueField"],
              minValues: 2
            },
            possibleFields: []
          }
        ];
      default:
        return [
          {
            dimName: "xAxis",
            dimLabel: "X - Axis",
            fieldName: undefined,
            usedForUniqueness: true,
            requirements: {
              fieldTypes: ["miscField", "isoLabelField", "timeField"],
              minValues: 2
            },
            possibleFields: []
          },
          {
            dimName: "yAxis",
            dimLabel: "Y - Axis",
            usedForUniqueness: false,
            fieldName: undefined,
            requirements: {
              fieldTypes: ["valueField"],
              minValues: 2
            },
            possibleFields: []
          }
        ];
    }
  }

  if (groupedChartTypes.includes(type)) {
    switch (type) {
      case "stackedbarchart":
        return [
          {
            dimName: "groupAxis",
            dimLabel: "X - Axis",
            fieldName: undefined,
            usedForUniqueness: true,
            requirements: {
              fieldTypes: ["miscField", "isoLabelField", "timeField"],
              minValues: 1
            },
            possibleFields: []
          },
          {
            dimName: "xAxis",
            dimLabel: "Stacks",
            fieldName: undefined,
            usedForUniqueness: true,
            requirements: {
              fieldTypes: ["miscField", "isoLabelField", "timeField"],
              minValues: 2
            },
            possibleFields: []
          },
          {
            dimName: "yAxis",
            dimLabel: "Y - Axis",
            usedForUniqueness: false,
            fieldName: undefined,
            requirements: {
              fieldTypes: ["valueField"],
              minValues: 2
            },
            possibleFields: []
          }
        ];
      case "bar-stacked-horizontal":
        return [
          {
            dimName: "groupAxis",
            dimLabel: "Y - Axis",
            fieldName: undefined,
            usedForUniqueness: true,
            requirements: {
              fieldTypes: ["miscField", "isoLabelField", "timeField"],
              minValues: 1
            },
            possibleFields: []
          },
          {
            dimName: "xAxis",
            dimLabel: "Stacks",
            fieldName: undefined,
            usedForUniqueness: true,
            requirements: {
              fieldTypes: ["miscField", "isoLabelField", "timeField"],
              minValues: 2
            },
            possibleFields: []
          },
          {
            dimName: "yAxis",
            dimLabel: "X - Axis",
            usedForUniqueness: false,
            fieldName: undefined,
            requirements: {
              fieldTypes: ["valueField"],
              minValues: 2
            },
            possibleFields: []
          }
        ];
      case "groupedbarchart":
        return [
          {
            dimName: "groupAxis",
            dimLabel: "X - Axis",
            fieldName: undefined,
            usedForUniqueness: true,
            requirements: {
              fieldTypes: ["miscField", "isoLabelField", "timeField"],
              minValues: 1
            },
            possibleFields: []
          },
          {
            dimName: "xAxis",
            dimLabel: "Groups",
            fieldName: undefined,
            usedForUniqueness: true,
            requirements: {
              fieldTypes: ["miscField", "isoLabelField", "timeField"],
              minValues: 2
            },
            possibleFields: []
          },
          {
            dimName: "yAxis",
            dimLabel: "Y - Axis",
            usedForUniqueness: false,
            fieldName: undefined,
            requirements: {
              fieldTypes: ["valueField"],
              minValues: 2
            },
            possibleFields: []
          }
        ];
      case "bar-grouped-horizontal":
        return [
          {
            dimName: "groupAxis",
            dimLabel: "Y - Axis",
            fieldName: undefined,
            usedForUniqueness: true,
            requirements: {
              fieldTypes: ["miscField", "isoLabelField", "timeField"],
              minValues: 1
            },
            possibleFields: []
          },
          {
            dimName: "xAxis",
            dimLabel: "Groups",
            fieldName: undefined,
            usedForUniqueness: true,
            requirements: {
              fieldTypes: ["miscField", "isoLabelField", "timeField"],
              minValues: 2
            },
            possibleFields: []
          },
          {
            dimName: "yAxis",
            dimLabel: "X - Axis",
            usedForUniqueness: false,
            fieldName: undefined,
            requirements: {
              fieldTypes: ["valueField"],
              minValues: 2
            },
            possibleFields: []
          }
        ];
      default:
        console.log("[Creator] - Error Dimension type not found ", type);
        return null;
    }
  }

  if (timeChartTypes.includes(type)) {
    return [
      {
        dimName: "xAxis",
        dimLabel: "X - Axis",
        fieldName: undefined,
        usedForUniqueness: true,
        requirements: {
          fieldTypes: ["miscField", "isoLabelField", "timeField"],
          minValues: 2
        },
        possibleFields: []
      },
      {
        dimName: "labelAxis",
        dimLabel: "Series",
        fieldName: undefined,
        usedForUniqueness: true,
        requirements: {
          fieldTypes: ["miscField", "isoLabelField", "timeField"],
          minValues: 1
        },
        possibleFields: []
      },

      {
        dimName: "yAxis",
        dimLabel: "Y - Axis",
        usedForUniqueness: false,
        fieldName: undefined,
        requirements: {
          fieldTypes: ["valueField"],
          minValues: 2
        },
        possibleFields: []
      }
    ];
  }

  console.log("No Requirements for type: ", type);
};

/**
 * get Possible fields input dimension and content
 * returns a list of possible fields for this dimension
 */
export const getPossibleFieldsForDimension = (dimension, content) => {
  const allfieldNames = Object.keys(content.typeSpecific.fields);
  const fields = content.typeSpecific.fields;
  const possibleFields = [];
  for (const fieldName of allfieldNames) {
    const field = fields[fieldName];
    // console.log("checking for field: ",field);
    if (
      dimension.requirements.fieldTypes &&
      !dimension.requirements.fieldTypes.includes(field.fieldType)
    ) {
      continue;
    }
    possibleFields.push({
      fieldName: field.fieldName,
      title: field.title
    });
  }
  return possibleFields;
};

/**
 * input a DataSet just returns the fieldObject with default
 * uniqueness and aggregation parts
 * @param  {Cotent} dataSet [description]
 * @return {fieldsObject}   [description]
 */
export const getTypeSpecificFields = dataSet => {
  // TODO uniquenesscheck and autoset aggregation fields if needed
  const fields = cloneObject(dataSet.typeSpecific.fields);
  for (const fieldName of Object.keys(fields)) {
    const currentField = fields[fieldName];
    currentField.isNeededForUniqueness = false;
    currentField.selectedValues = [];
    // delete currentField.validValues;
    // currentField.isAggregationField = false;
  }
  return fields;
};

/**
 * Detects duplicate rows given a set of fields and data
 * - data needs to have our special id part in it to work
 * should only be called from smart source
 * -
 * looks for uniquness troubles and returns
 *   -> lists of lists of same rows depending on input fields
 *   -> with unique id parts in it
 *   the id lists returned are ids which are stored in the localStorageField
 * @param  nogeoorpoint [description]
 * @return              [description]
 */

export const detectDuplicateRows = (
  localStorageFieldName,
  fieldNameList,
  data
) => {
  const startDate = new Date();
  const report = {
    duplicatesFound: false,
    amountRows: data.length,
    duplicates: [],
    duplicateRowsList: [],
    testFields: fieldNameList
  };
  const linkedHashMap = [];
  const duplicateRows = [];
  let i = 0;
  // test linked hashMap for hopefully faster checks
  for (const row of data) {
    let currentMap = linkedHashMap;
    for (i = 0; i < fieldNameList.length; i++) {
      const curField = fieldNameList[i];
      if (i === fieldNameList.length - 1) {
        // last element!
        const index = currentMap.findIndex(el => el.value === row[curField]);
        if (index >= 0) {
          //we found a match
          //if it is the first duplicate add a reference to the array of duplicates
          if (currentMap[index].rowIds.length === 1) {
            duplicateRows.push(currentMap[index]);
          }
          //push the additional id in the response
          currentMap[index].rowIds.push(row[localStorageFieldName].id);
        } else {
          let labels = "";
          for (const fieldName of fieldNameList) {
            if (labels.length == 0) {
              if (row[fieldName]) {
                labels = row[fieldName];
              } else {
                labels = "";
              }
            } else {
              labels = labels + " " + row[fieldName];
            }
          }
          currentMap.push({
            value: row[curField],
            rowIds: [row[localStorageFieldName].id],
            label: labels
          });
        }
      } else {
        // in the tree
        // check if my current element already is in the tree
        let index = currentMap.findIndex(el => el.value === row[curField]);
        if (index < 0) {
          // needs to be added into the tree
          currentMap.push({
            value: row[curField],
            children: []
          });
          index = currentMap.length - 1;
        }
        currentMap = currentMap[index].children;
      }
    }
  }
  //do we have duplicates?
  if (duplicateRows.length > 0) {
    const groupedRows = duplicateRows.map(el => el.rowIds);
    let rowsList = [];
    for (const arr of groupedRows) {
      rowsList = rowsList.concat(arr);
    }
    //console.log("[Duplicate Rows Found] with value: ",duplicateRows);
    report.duplicatesFound = true;
    report.duplicates = duplicateRows;
    report.duplicateRowsList = rowsList;
  }
  const endDate = new Date();
  console.log(
    "[Creator] - detect duplicate rows finished: ",
    endDate - startDate
  );
  return report;
};

/**
 *
 * checks if data is unique with a list of fieldNames
 * this only works with simple types ( no geo or point)
 * @param  {[type]} data          [description]
 * @param  {[type]} fieldNameList [description]
 * @return {[type]}               [description]
 */
export const checkUniqueness = (data, fieldNameList, extended = false) => {
  const startDate = new Date();
  console.log(
    "checking uniqueness for fields: ",
    fieldNameList.length,
    " datarows: ",
    data.length
  );
  const uniqueStrings = [];
  const linkedHashMap = [];
  // structure of easily querying uniquess:
  /*
      [
        value :
        children : [
          value : ,
          children: [...]
        ]
      ]
   */
  let i = 0;
  if (!extended) {
    // test linked hashMap for hopefully faster checks
    for (const row of data) {
      let currentMap = linkedHashMap;
      for (i = 0; i < fieldNameList.length; i++) {
        const curField = fieldNameList[i];
        if (i === fieldNameList.length - 1) {
          // last element!
          const index = currentMap.findIndex(el => el.value === row[curField]);
          if (index >= 0) {
            return false;
          } else {
            currentMap.push({
              value: row[curField]
            });
          }
        } else {
          // in the tree
          // check if my current element already is in the tree
          let index = currentMap.findIndex(el => el.value === row[curField]);
          if (index < 0) {
            // needs to be added into the tree
            currentMap.push({
              value: row[curField],
              children: []
            });
            index = currentMap.length - 1;
          }
          currentMap = currentMap[index].children;
        }
      }
    }

    /*

    for (const row of data) {
      let checkString = '';
      for (const fieldName of fieldNameList) {
        checkString = checkString + row[fieldName];
      }
      if (uniqueStrings.includes(checkString)) {
        const endDate : any = new Date();
        console.log("[Creator] - uniqueness finished: ", (endDate - startDate));
        return false;
      } else {
        uniqueStrings.push(checkString);
      }
    } */
    const endDate = new Date();
    console.log("[Creator] - uniqueness finished: ", endDate - startDate);
    return true;
  } else {
    let index = 0;
    for (const row of data) {
      let checkString = "";
      for (const fieldName of fieldNameList) {
        checkString = checkString + row[fieldName];
      }
      const foundIndex = uniqueStrings.indexOf(checkString);
      if (foundIndex > -1) {
        return {
          unique: false,
          duplicateRowIndexes: [index, foundIndex],
          fields: fieldNameList
        };
      } else {
        uniqueStrings.push(checkString);
      }
      index = index + 1;
    }
    return {
      unique: true,
      fields: fieldNameList
    };
  }
};

export const getAllSubsets = theArray => {
  return theArray.reduce(
    (subsets, value) => subsets.concat(subsets.map(set => [value, ...set])),
    [[]]
  );
};

/**
 * check dimension
 *
 * @type {[type]}
 */
export const checkDimension = (fields, type) => {
  const requiredDimensions = getDimensionsWithRequirements(type);
  const returnObject = {
    fulfilled: false,
    dimensions: []
  };
  // try unique filter
  const allfieldNames = Object.keys(fields)
    .map(el => {
      let order = 0;
      if (fields[el].fieldType === "isoLabelField") order = 3;
      if (fields[el].fieldType === "timeField") order = 2;
      if (fields[el].fieldType === "miscField") order = 1;
      return { fieldName: el, order: order };
    })
    .sort(compareFieldTypeOrder)
    .map(el => el.fieldName);
  // console.log("[Creator] - sorted FieldNames",allfieldNames);
  if (requiredDimensions) {
    // fir each axis do we find this in fields object?
    // console.log('checking dimension ', fields, type, requiredDimensions);
    const usedFields = [];
    for (const requiredDimension of requiredDimensions) {
      // add this to the return object
      const dimension = cloneObject(requiredDimension);
      dimension.possibleFields = [];
      // is this in the fieldType
      let found = false;
      const requirement = requiredDimension.requirements;
      for (const fieldName of allfieldNames) {
        const field = fields[fieldName];
        // console.log("checking for field: ",field);
        if (
          requirement.dataTypes &&
          !requirement.dataTypes.includes(field.dataType)
        ) {
          continue;
        }
        if (
          requirement.fieldTypes &&
          !requirement.fieldTypes.includes(field.fieldType)
        ) {
          continue;
        }
        // TODO min values check but this needs concept in this direction
        // about numbers and shit
        if (!found && !usedFields.includes(fieldName)) {
          dimension.fieldName = fieldName;
          dimension.possibleFields.push({
            fieldName: field.fieldName,
            title: field.title
          });
          usedFields.push(fieldName);
          found = true;
        } else {
          dimension.possibleFields.push({
            fieldName: field.fieldName,
            title: field.title
          });
        }
      }
      returnObject.dimensions.push(dimension);
    }
    // do we have fullfillment
    if (usedFields.length === requiredDimensions.length) {
      returnObject.fulfilled = true;
    }
  }

  return returnObject;
};

/**
 * does type Checks for data ; carefull changes data in place
 * @param  constcolumnNameofObject.keys(fields [description]
 * @return                                     [description]
 */
export const validatedataItSelf = (content, data) => {
  // make sure data is really in the right format
  const fields = content.typeSpecific.fields;
  for (const columnName of Object.keys(fields)) {
    const field = fields[columnName];
    switch (field.dataType) {
      case "string":
        data = data.map(row => {
          if (row[field.fieldName]) {
            row[field.fieldName] = row[field.fieldName].toString().trim();
          } else {
            row[field.fieldName] = null;
          }
          return row;
        });
        break;
      case "number":
        data = data.map(row => {
          const floatVal = parseFloat(row[field.fieldName]);
          if (isNaN(floatVal)) {
            row[field.fieldName] = null;
          } else {
            row[field.fieldName] = floatVal;
          }
          return row;
        });
        break;
      case "date":
        data = data.map(row => {
          row[field.fieldName] = row[field.fieldName].toString().trim();
          return row;
        });
        break;
      default:
        console.log("ERROR DATA TYPE: ", field.dataType, field);
    }
    // delete field.localStorage;
  }
};
