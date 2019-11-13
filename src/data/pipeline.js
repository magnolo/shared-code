import { extent } from 'd3-array';
import orderBy from 'lodash/orderBy';

import { MapTypes } from '../config/constants';
import { cloneObject, unique, objToMoment, momentToStr } from '../utilities';
import { setNewValueField, createNewValueFieldFromExisting } from '../content/content-utilities';

/**
 * used by Chart Manager doesnt deal with choros!
 * @param  ['barchart','horizontalbarchart','donutchart','donutchart_half'].includes(type [description]
 * @return                                                                                [description]
 */
const getOldFields = content => {
  const { type, typeSpecific } = content;
  const { dimensions } = typeSpecific;

  if (['barchart', 'horizontalbarchart', 'donutchart', 'donutchart_half'].includes(type)) {
    return {
      labelField: dimensions.find(obj => obj.dimName === 'xAxis').fieldName,
      valueField: dimensions.find(obj => obj.dimName === 'yAxis').fieldName,
      aggregationField: undefined,
      timeField: undefined
    };
  }

  if (['groupedbarchart', 'stackedbarchart', 'bar-grouped-horizontal', 'bar-stacked-horizontal'].includes(type)) {
    return {
      labelField: dimensions.find(obj => obj.dimName === 'xAxis').fieldName,
      valueField: dimensions.find(obj => obj.dimName === 'yAxis').fieldName,
      aggregationField: dimensions.find(obj => obj.dimName === 'groupAxis').fieldName,
      timeField: undefined
    };
  }

  if (['areachart', 'linechart'].includes(type)) {
    return {
      timeField: dimensions.find(obj => obj.dimName === 'xAxis').fieldName,
      valueField: dimensions.find(obj => obj.dimName === 'yAxis').fieldName,
      labelField: dimensions.find(obj => obj.dimName === 'labelAxis').fieldName,
      aggregationField: dimensions.find(obj => obj.dimName === 'xAxis').fieldName
    };
  }
};

//TODO only allows one time Field atm!
const getTimeFieldName = content => {
  for (const fieldName of Object.keys(content.typeSpecific.fields)) {
    const curField = content.typeSpecific.fields[fieldName];
    if (curField.dataType === 'date') {
      //this is in Isofield
      return curField.fieldName;
    }
  }
  return null;
};
//TODO only allows one valueField
const getValueFieldName = content => {
  for (const dimension of content.typeSpecific.dimensions) {
    if (dimension.requirements.fieldTypes.includes('valueField')) {
      return dimension.fieldName;
    }
  }
  return null;
};

//TODO only allows one Isofield
const getIsoFieldName = content => {
  for (const fieldName of Object.keys(content.typeSpecific.fields)) {
    const curField = content.typeSpecific.fields[fieldName];
    if (curField.isoLabelField) {
      //this is in Isofield
      return curField.fieldName;
    }
  }
  return null;
};

const getLabelFieldName = content => {
  const { type, typeSpecific } = content;
  const { dimensions } = typeSpecific;

  if (['barchart', 'horizontalbarchart', 'donutchart', 'donutchart_half'].includes(type)) {
    return dimensions.find(obj => obj.dimName === 'xAxis').fieldName;
  }

  if (['groupedbarchart', 'stackedbarchart', 'bar-grouped-horizontal', 'bar-stacked-horizontal'].includes(type)) {
    return dimensions.find(obj => obj.dimName === 'xAxis').fieldName;
  }

  if (['areachart', 'linechart'].includes(type)) {
    return dimensions.find(obj => obj.dimName === 'labelAxis').fieldName;
  }
  if (['choropleth'].includes(type)) {
    //can be anything
    return typeSpecific.data.labelField;
  }
  return null;
};

/**
 * Applies filters that are visible in the embeded visual
 * like  a timeline slider component
 * @param  constobjofObject.values(content.typeSpecific.fields [description]
 * @return                                                     [description]
 */

const applyInVisualFilter = (content, data, recalc = true) => {
  const { inVisualFilter } = content.typeSpecific;
  //console.log("[DataPipeline Applying InvisualFilter] - ",inVisualFilter)
  //inVisualFilter.sort(sortByExecuteFirst);
  for (const filter of inVisualFilter) {
    switch (filter.type) {
      case 'valueSelector': {
        //console.log('CALLING SMART FUNCTIONS', content.typeSpecific, inVisualFilter);
        const ret = applyValueSelectorInVisualFilter(content, data, filter, recalc);
        data = ret.data;
        content = ret.content;
        break;
      }
      case 'multiValueSelector': {
        const ret = applymultiValueSelectorInVisualFilter(content, data, filter, recalc);
        data = ret.data;
        content = ret.content;
        break;
      }
      default:
        console.error('smartFunction Error no implementation for: ', filter, data, content);
    }
    //console.log("[DataPipeline After InvisualFilter] - ",filter)
  }

  return { content: content, data: data };
};

const applymultiValueSelectorInVisualFilter = (content, data, filter, recalc) => {
  const { fieldName, options } = filter;
  const { sort } = options;

  if (!filter.localStorage) filter.localStorage = {};

  //if localStorage defined and has a value -> use this
  const { format } = content.typeSpecific.fields[fieldName];
  //console.log("Updating sorted Values",format, filter);
  if (format.formatType === 'string' || format.formatType === 'number') {
    const uniqueValues = unique(data.map(obj => obj[fieldName]));
    const sortedValues = orderBy(uniqueValues, [], sort);
    //console.log("Updating sorted Values",sortedValues, filter);
    filter.localStorage.filterValues = sortedValues;
  }

  if (format.formatType === 'date') {
    const uniqueValues = unique(data.map(obj => obj[fieldName]));
    const dateValues = uniqueValues.map(obj => {
      let date = objToMoment(obj, format.date.inputFormat);
      return date;
    });

    const sortedValues = orderBy(dateValues, [], sort);
    //console.log("Updating sorted Values",sortedValues, filter);
    filter.localStorage.filterValues = sortedValues.map(obj => momentToStr(obj, format.date.inputFormat));
    // console.log('After InVisualFilter Value Selector: ', filter);
  }

  if (recalc) {
    //check our options for recalc
    if (filter.options.saveState == 'allSelected') {
      filter.selectedValues = [];
    }
    //do nothing if it is user selected
  }

  //check that our selected values are still possible
  if (filter.selectedValues.length > 0) {
    const possibleSelectedValues = [];
    for (let i = 0; i < filter.selectedValues.length; i++) {
      if (filter.localStorage.filterValues.includes(filter.selectedValues[i])) {
        possibleSelectedValues.push(filter.selectedValues[i]);
      }
    }
    filter.selectedValues = possibleSelectedValues;
    if (filter.selectedValues.length > 0) {
      data = data.filter(obj => filter.selectedValues.includes(obj[fieldName]));
    }
  }
  return { content: content, data: data };
};

const applyValueSelectorInVisualFilter = (content, data, filter, recalc) => {
  const { fieldName, options } = filter;
  const { sort } = options;

  if (!filter.localStorage) filter.localStorage = {};
  //if localStorage defined and has a value -> use this
  const { format } = content.typeSpecific.fields[fieldName];
  //console.log("Updating sorted Values",format, filter);
  if (format.formatType === 'string') {
    const uniqueValues = unique(data.map(obj => obj[fieldName]));
    const sortedValues = orderBy(uniqueValues, [], sort);
    //console.log("Updating sorted Values",sortedValues, filter);
    filter.localStorage.filterValues = sortedValues;
  }
  if (format.formatType === 'date') {
    const uniqueValues = unique(data.map(obj => obj[fieldName]));
    const dateValues = uniqueValues.map(obj => {
      let date = objToMoment(obj, format.date.inputFormat);
      return date;
    });

    const sortedValues = orderBy(dateValues, [], sort);
    //console.log("Updating sorted Values",sortedValues, filter);
    filter.localStorage.filterValues = sortedValues.map(obj => momentToStr(obj, format.date.inputFormat));
  }
  //lets see if we need to recalc
  if (recalc) {
    if (filter.options.saveState == 'last') {
      filter.selectedValue = filter.localStorage.filterValues[filter.localStorage.filterValues.length - 1];
    }
    if (filter.options.saveState == 'first') {
      filter.selectedValue = filter.localStorage.filterValues[0];
    }
    //do nothing if it is user selected
  }

  //lets check if the selectedValue is still possible
  if (!filter.selectedValue || !filter.localStorage.filterValues.includes(filter.selectedValue)) {
    if (filter.options.saveState == 'last') {
      filter.selectedValue = filter.localStorage.filterValues[filter.localStorage.filterValues.length - 1];
    }
    if (filter.options.saveState == 'first') {
      filter.selectedValue = filter.localStorage.filterValues[0];
    }
    //on user defined we still need to set something if its not set
    if (filter.options.saveState == 'userSelected') {
      filter.selectedValue = filter.localStorage.filterValues[filter.localStorage.filterValues.length - 1];
    }
  }

  //console.log("[DataPipeline] - Selected Value :",filter.selectedValue);
  //if(filter.selectedValue) {
  data = data.filter(obj => obj[fieldName] === filter.selectedValue);
  //}
  return { data, content };
};

/*
  Filters defined in the contentItem Type Specific fields parts
  -> selected values
 */
const applyEditorFilter = (content, data) => {
  for (const obj of Object.values(content.typeSpecific.fields)) {
    const field = obj;
    if (field.dataType === 'number') continue;
    if (field.selectedValues.length === 0) continue;
    data = data.filter(obj => field.selectedValues.includes(obj[field.fieldName]));
  }
  return { data: data, content: content };
};

//TODO if we have better datastructure we dont need this
const addMetaInfo = (content, data) => {
  const timeField = getTimeFieldName(content);
  for (const [idx, obj] of Object.entries(data)) {
    // ~ works since mdc filters everything but 0-9A-z
    // ~ also does not break the fieldNameIndex since it's > z
    obj['~meta'] = { rowId: idx };
    if (timeField) {
      if (typeof obj[timeField] === 'number') {
        obj[timeField] = String(obj[timeField]);
      }

      const { inputFormat } = content.typeSpecific.fields[timeField].format.date;
      obj['~meta'].moment = objToMoment(obj[timeField], inputFormat);
    }
  }

  return { data: data, content: content };
};
/**
 * clears Null Values - choro flowchor and markers shouldnt call this
 * @param  !allowNullsTypes.includes(content.type [description]
 * @return                                        [description]
 */
const clearNulls = (content, data) => {
  const { type } = content;
  const valueField = getValueFieldName(content);
  const labelField = getLabelFieldName(content);
  if (valueField && type !== 'choropleth') {
    data = data.filter(obj => obj[valueField] != null);
  }
  if (labelField && type !== 'choropleth') {
    data = data.filter(obj => obj[labelField] != null);
  }
  return { data: data, content: content };
};

const getValueRange = (content, data) => {
  const { valueField } = content.typeSpecific.data;
  //special case for choros cause those damn suckers can have fields where iso is not the right one
  if (content.type == 'choropleth') {
    const isoFieldname = getIsoFieldName(content);
    const extendData = data.filter(el => el[isoFieldname] != null);
    const stupidTypedStringRange = extent(extendData.map(obj => obj[valueField]));
    const minRange = parseFloat(stupidTypedStringRange[0]);
    const maxRange = parseFloat(stupidTypedStringRange[1]);

    return [minRange, maxRange];
  } else {
    const stupidTypedStringRange = extent(data.map(obj => obj[valueField]));
    const minRange = parseFloat(stupidTypedStringRange[0]);
    const maxRange = parseFloat(stupidTypedStringRange[1]);

    return [minRange, maxRange];
  }
};

const sortByContent = (content, data) => {
  const { type, typeSpecific } = content;
  if (!typeSpecific.chart) return { data: data, content: content };

  const { sorting } = content.typeSpecific.chart;
  if (sorting && sorting.enabled) {
    const sortFields = sorting.sortFields;
    const sortFn = (left, right) => {
      let sortReturn = 0;
      for (const sortField of sortFields) {
        const { dataType } = typeSpecific.fields[sortField];
        const sortModifier = sorting.sortOrder === 'asc' ? 1 : -1;

        if (dataType === 'number') {
          sortReturn = left[sortField] - right[sortField];
        }

        if (dataType === 'string') {
          if (left[sortField] > right[sortField]) sortReturn = 1;
          if (left[sortField] < right[sortField]) sortReturn = -1;
        }

        if (dataType === 'date') {
          sortReturn = left['~meta'].moment - right['~meta'].moment;
        }

        if (sortReturn !== 0) {
          sortReturn = sortReturn * sortModifier;
          break;
        }
      }
      return sortReturn;
    };

    data.sort(sortFn);

    // TODO this needs some better fix at the moment there is old Content
    // running around that is sorting wrongly
    const needsTimeSorting = ['areachart', 'linechart'].includes(type);
    if (needsTimeSorting) {
      const { fieldName } = typeSpecific.dimensions.find(obj => obj.dimName === 'xAxis');
      const { dataType } = typeSpecific.fields[fieldName];
      if (dataType === 'date') {
        data.sort((left, right) => left['~meta'].moment - right['~meta'].moment);
      } else {
        sortFields.unshift(fieldName);
        data.sort(sortFn);
      }
    }
  }
  return { data: data, content: content };
};

/**
 * Applys Smart Functions
 * @param  !content.typeSpecific||!content.typeSpecific.smartFunctions||content.typeSpecific.smartFunctions.length==0 [description]
 * @return                                                                                                            [description]
 */
const applySmartFunctions = (content, data) => {
  if (!content.typeSpecific || !content.typeSpecific.smartFunctions || content.typeSpecific.smartFunctions.length == 0) {
    return { data: data, content: content };
  }
  for (const smartFunction of content.typeSpecific.smartFunctions) {
    //implementing smart Filter parts
    switch (smartFunction.name) {
      case 'timeChange': {
        //console.log('CALLING SMART FUNCTIONS', content.typeSpecific, smartFunction);
        const ret = applyTimeChangeSmartFunction(data, content, smartFunction);
        data = ret.data;
        content = ret.content;
        break;
      }
      case 'stepFilter': {
        const ret = applySelectStepsSmartFunction(data, content, smartFunction);
        data = ret.data;
        content = ret.content;
        //todo what about content?
        break;
      }
      case 'singleFieldCalculate': {
        const ret = applySingleFieldCalculate(content, data, smartFunction);
        data = ret.data;
        content = ret.content;
        break;
      }
      default:
        console.error('smartFunction Error no implementation for: ', smartFunction, data, content);
    }
  }
  return { data: data, content: content };
};
/**
 *  Implementation for Each Smart Function
 *
 */
const applySingleFieldCalculate = (content, data, smartFunction) => {
  if (!smartFunction.parameters.error) {
    //lets calculate
    const fieldName = smartFunction.parameters.fieldName;
    //console.log("[DataPipeline] - input data first value",data[0][fieldName]);
    const functionValue = parseFloat(smartFunction.parameters.functionValue);
    if (!isNaN(functionValue)) {
      //console.log("[DataPipeline] - applying singleFieldCalculate",fieldName, " value: ",functionValue);
      data = data.map(row => {
        const hasValue = !isNaN(parseFloat(row[fieldName]));
        if (hasValue) {
          switch (smartFunction.parameters.functionToApply) {
            case 'add':
              row[fieldName] = row[fieldName] + functionValue;
              break;
            case 'subtract':
              row[fieldName] = row[fieldName] - functionValue;
              break;
            case 'multiply':
              row[fieldName] = row[fieldName] * functionValue;
              break;
            case 'divide':
              row[fieldName] = row[fieldName] / functionValue;
              break;
            default:
              // console.log("Unrecognised smartFunction: ",smartFunction.parameters.functionToApply);
              break;
          }
        }
        return row;
      });
    }
  } else {
    //console.log("[DataPipeline] - smartFunction with Error: ",smartFunction);
  }
  return { data: data, content: content };
};

/**
 * Applys Time ChangeSmartFunction
 * @param  data complete raw data object
 * @param  content contentItem
 * @param smartFunction Object of the smart function
 *
 * @return { data: data, content: content }
 */
const applyTimeChangeSmartFunction = (data, content, smartFunction) => {
  const timeField = getTimeFieldName(content);

  //const { labelField, isoField, aggregationField } = content.typeSpecific.data;
  const { amountPeriodBack, outputValue, outputFieldName, outputFormat, refValueField, outputFieldTitle } = smartFunction.parameters;

  if (timeField) {
    //filter non valid times -> which shouldnt exist anyway
    data = data.filter(el => el[timeField] != null);
    let timeFieldTypeSpec = null;
    //nothing is done yet we are operating on the rawData
    //get UniqueDataSet - includes in visualFilters now
    let compareFieldNames = [];
    for (const fieldName of Object.keys(content.typeSpecific.fields)) {
      const currentField = content.typeSpecific.fields[fieldName];
      if (fieldName === timeField) {
        timeFieldTypeSpec = currentField;
      }
      //needed for uniqueness part
      if (fieldName !== timeField && currentField.selectedValues.length > 0 && currentField.isNeededForUniqueness) {
        compareFieldNames.push(currentField.fieldName);
      }
    }
    const inputFormat = timeFieldTypeSpec.format.date.inputFormat;
    //console.log('creating new column: ', outputFieldName, 'timeField: ', timeFieldTypeSpec);
    //create new column for time changes add it to typespecific
    //compareFields after is needed for uniqueness
    for (const dimension of content.typeSpecific.dimensions) {
      const field = content.typeSpecific.fields[dimension.fieldName];
      if (dimension.fieldName !== timeField && dimension.usedForUniqueness && field.dataType !== 'number') {
        if (content.typeSpecific.fields[dimension.fieldName].isoIsoField) {
          if (!compareFieldNames.includes(dimension.fieldName)) {
            compareFieldNames.push(dimension.fieldName);
          }
          if (!compareFieldNames.includes(content.typeSpecific.fields[dimension.fieldName].isoIsoField)) {
            compareFieldNames.push(content.typeSpecific.fields[dimension.fieldName].isoIsoField);
          }
        } else {
          if (!compareFieldNames.includes(dimension.fieldName)) {
            compareFieldNames.push(dimension.fieldName);
          }
        }
      }
    }
    for (const inVisualFilter of content.typeSpecific.inVisualFilter) {
      if (inVisualFilter.type === 'valueSelector' && inVisualFilter.fieldName !== timeField) {
        //console.log('CALLING SMART FUNCTIONS', content.typeSpecific, smartFunction);
        if (!compareFieldNames.includes(inVisualFilter.fieldName)) {
          compareFieldNames.push(inVisualFilter.fieldName);
        }
      }
    }
    //get unqiue time values to calculate what 1 step is
    let uniqueTimeValues = data
      .map(element => element[timeField])
      .filter(el => el != null)
      .filter((obj, idx, nodes) => nodes.indexOf(obj) === idx);
    if (uniqueTimeValues.length > 1) {
      uniqueTimeValues = orderBy(uniqueTimeValues.map(obj => objToMoment(obj, inputFormat)), [], 'asc');
      //make this back to string
      uniqueTimeValues = uniqueTimeValues.map(el => {
        return momentToStr(el, inputFormat);
      });
      //console.log("unique Time Values: ",uniqueTimeValues)
      //hash map has fast access
      const tempSearchMap = {};
      for (const row of data) {
        let key = '';
        for (const compareField of compareFieldNames) {
          key += row[compareField];
        }
        key += row[timeField];
        tempSearchMap[key] = row;
      }
      //console.log("searchMap: ",tempSearchMap);
      for (const row of data) {
        const currentVal = row[refValueField.fieldName];
        const searchTimeIndex = uniqueTimeValues.indexOf(row[timeField]) - amountPeriodBack;
        //console.log("row: ",row,searchTimeIndex);
        if (searchTimeIndex >= 0) {
          const searchTimeVal = uniqueTimeValues[searchTimeIndex];
          let key = '';
          for (const compareField of compareFieldNames) {
            key += row[compareField];
          }
          key += searchTimeVal;
          const refRow = tempSearchMap[key];
          if (refRow) {
            if (outputValue === 'percent') {
              //no more na or infinity parts
              if (refRow[refValueField.fieldName] == 0 || currentVal == 0 || refRow[refValueField.fieldName] == null || currentVal == null) {
                row[outputFieldName] = null;
              } else {
                row[outputFieldName] = (currentVal / refRow[refValueField.fieldName] - 1) * 100;
              }
            } else {
              //what if one of the values doesnt exist at all?
              if (refRow[refValueField.fieldName] == null || currentVal == null) {
                row[outputFieldName] = null;
              } else {
                row[outputFieldName] = currentVal - refRow[refValueField.fieldName];
              }
            }
          } else {
            row[outputFieldName] = null;
          }
        } else {
          //out of scope
          row[outputFieldName] = null;
        }
      }
      //typeSpecific changes
      //set new FieldValues
      //console.log('Fields before setting new field: ', content.typeSpecific.fields);
      const newValueFormat = cloneObject(outputFormat);
      //check if content already has our outputFieldName
      if (content.typeSpecific.fields[outputFieldName]) {
        // console.log('Create New Value Field: ');
        content = createNewValueFieldFromExisting(content, refValueField.fieldName, outputFieldName, outputFieldTitle, newValueFormat);
      } else {
        // console.log('Set New Value Field: ');
        content = setNewValueField(content, refValueField.fieldName, outputFieldName, outputFieldTitle, newValueFormat);
      }
      //console.log(data);
    }
  }
  return { data: data, content: content };
};

const applySelectStepsSmartFunction = (data, content, smartFunction) => {
  //works without change for axis parts
  //console.log("INPUT DATA LENGTH: ",data.length);
  //console.log("SmartFilter: ",smartFilter);
  const { field } = smartFunction.parameters;
  const stepSize = parseInt(smartFunction.parameters.stepSize);
  let uniqueTimeValues = data.map(element => element[field.fieldName]).filter((obj, idx, nodes) => nodes.indexOf(obj) === idx);
  const { inputFormat } = field.format.date;
  uniqueTimeValues = uniqueTimeValues.map(el => {
    return {
      label: el,
      moment: objToMoment(el, inputFormat)
    };
  });
  //sort descending
  uniqueTimeValues.sort((left, right) => right.moment - left.moment);
  //console.log("Unique Time Values sorted Descending: ",uniqueTimeValues);
  //sort
  const selectedTimes = [];
  for (let i = 0; i < uniqueTimeValues.length; i = i + stepSize) {
    //console.log("getting: ",i)
    selectedTimes.push(uniqueTimeValues[i].label);
  }
  //select this fun in the data
  data = data.filter(el => selectedTimes.includes(el[field.fieldName]));
  //content.typeSpecific.fields[field.fieldName].selectedValues = cloneObject(selectedTimes);
  return { data: data, content: content };
};

/**
 *
 * Smart Filters
 * in the datapipeline we already have applied
 * - metaInfos
 * - smart functions
 * - editor filters
 *
 * For ex
 *
 */
const applySmartFilter = (data, content) => {
  if (!content.typeSpecific.smartFilters || content.typeSpecific.smartFilters.length == 0) {
    return data;
  }
  for (const smartFilter of content.typeSpecific.smartFilters) {
    //implementing smart Filter parts
    switch (smartFilter.name) {
      case 'enableTop': {
        //for most charts top means the axis where a value field is used
        data = applyTopBottomFilter(data, content, smartFilter, 'desc');
        break;
      }
      case 'enableBottom': {
        data = applyTopBottomFilter(data, content, smartFilter, 'asc');
        break;
      }
      case 'geographicalPreference': {
        //done for axis
        data = applyGeoFilter(data, content, smartFilter);
        break;
      }
      case 'selectTimeLatest': {
        data = applyselectTimeLatestFilter(data, content, smartFilter);
        break;
      }

      default:
        console.error('smartFilter Error no implementation for: ', smartFilter, data, content);
    }
  }
  //console.log("Smart FILTER BEFORE RETURN: ",items);
  return data;
};

/**
 *  Implementation for Each Smart Filter
 *  TODO think about saving relevant timefieldInfo
 *  into the filter to enable multiple timefields
 */
const applyselectTimeLatestFilter = (data, content, smartFilter) => {
  const timeField = getTimeFieldName(content);
  if (timeField) {
    const inputFormat = content.typeSpecific.fields[timeField].format.date.inputFormat;
    const latest = parseInt(smartFilter.parameters.latest);
    //get unique time Values and Sort Them
    let uniqueTimeValues = data
      .map(element => element[timeField])
      .filter(el => el != null)
      .filter((obj, idx, nodes) => nodes.indexOf(obj) === idx);
    if (uniqueTimeValues.length > 1) {
      uniqueTimeValues = orderBy(
        uniqueTimeValues.map(obj => {
          return objToMoment(obj, inputFormat);
        }),
        [],
        'desc'
      );
      //make this back to string
      uniqueTimeValues = uniqueTimeValues.map(el => momentToStr(el, inputFormat));
      // console.log('APPLYING LATEST FILTER: ', uniqueTimeValues);
      //select from data only the amount of latest
      uniqueTimeValues = uniqueTimeValues.slice(0, latest);
      // console.log('APPLYING LATEST FILTER: AFTER SLICE ', uniqueTimeValues);
      data = data.filter(el => uniqueTimeValues.includes(el[timeField]));
    }
    // console.log('after latest filter: ', data, uniqueTimeValues);
  }

  return data;
};

/**
 * filters for geodata
 * TODO save isoFieldName into the filter to enable
 * multiple isoField usage
 * @param
 * @return  data
 */
const applyGeoFilter = (data, content, smartFilter) => {
  const isoField = getIsoFieldName(content);
  //go through fields in typespec fields and check for iso
  if (isoField) {
    let additionItems = [];
    if (MapTypes.includes(content.type)) {
      additionItems = data.filter(obj => obj[isoField] == null);
    }
    data = data.filter(obj => smartFilter.parameters.isoCodes.includes(obj[isoField]));
    data.push(...additionItems);
  }
  return data;
};

/**
 * applies smart Filters on axis object
 * General Idea:
 *  top is always dependant on the dimensions object
 *  and uniquefilters
 *  - for 2 dimensional charttypes:
 *      - y dimension always has values in it
 *      - x dimension always has the categories / labels we want to filter away
 *
 *    - needs to be calculated for each individual config of an invisual filter
 *
 * - for 3 dimensional charttypes
 *      -
 *
 * @param  "ApplyingTopFilter" [description]
 * @param  data                [description]
 * @param  content             [description]
 * @param  smartFilter         [description]
 * @return                     [description]
 */
const applyTopBottomFilter = (data, content, smartFilter, direction = 'desc') => {
  //console.log('Applying Top/Bottom Filter', data, content, smartFilter);
  //if we apply each In visual filter once
  //we can calculate for each combination of in visual filters
  //the top part -> very expensive

  //if it is static it calculates the tops one time
  //and then only selects the top of
  const labelField = getLabelFieldName(content);
  const valueField = getValueFieldName(content);
  const isoField = getIsoFieldName(content);
  //static or dynamic calculation?
  const amount = smartFilter.parameters.topValue || smartFilter.parameters.bottomValue;

  let additionItems = [];
  if (MapTypes.includes(content.type)) {
    additionItems = data.filter(obj => obj[isoField] == null);
    data = data.filter(obj => obj[isoField] != null);
  }
  //lets take a different approach then before lets get the unique parts and sort for
  //when do we have to separately calc tops-
  // - indivudual filters single select
  // - axis that are not x and y axis?
  let bucketFieldNames = [];
  for (const inVisualFilter of content.typeSpecific.inVisualFilter) {
    if (inVisualFilter.type === 'valueSelector') {
      if (!bucketFieldNames.includes(inVisualFilter.fieldName)) {
        bucketFieldNames.push(inVisualFilter.fieldName);
      }
    }
  }
  //we have to calc for each bucket at least . but maybe there is more
  // for a linechart TOP2 dynamic is
  // for each invisualFilter valueSelector
  // for each xAxisValue -> the top 2 labels of Y Axis
  if (content.typeSpecific.dimensions.length > 2) {
    for (const dimension of content.typeSpecific.dimensions) {
      if (dimension.usedForUniqueness && dimension.dimName !== 'iso') {
        //we have to make a type switch here since group and stacked
        //have different axis then the rest.. buuh
        if (['groupedbarchart', 'stackedbarchart', 'bar-grouped-horizontal', 'bar-stacked-horizontal'].includes(content.type)) {
          //in grouped and stacked we want per group Axis the things
          if (dimension.dimName == 'groupAxis') {
            if (!bucketFieldNames.includes(dimension.fieldName)) {
              bucketFieldNames.push(dimension.fieldName);
            }
          }
        } else {
          //this are time charts and we want per year aka xAxis value the tops
          if (dimension.dimName == 'xAxis') {
            if (!bucketFieldNames.includes(dimension.fieldName)) {
              bucketFieldNames.push(dimension.fieldName);
            }
          }
        }
      }
    }
  }

  if (smartFilter.parameters.static && smartFilter.parameters.static.enabled) {
    // static mode -> TODO for multiple inVisualValue Selectors it is
    // random and we just make it setable by the user
    const mode = smartFilter.parameters.static.mode;
    const sortMode = mode == 'min' ? 'asc' : 'desc';
    // for all buckets choose one -> highest sorted by type for each bucketField
    // -> [2018]['gamma'] ---> top
    // -->  get the  labels
    if (bucketFieldNames.length > 0) {
      //console.log('[DataPipeline] - Top Static - ', content, bucketFieldNames, mode);
      let bucketSelector = {};
      //for greatest or lowerst sorted depending on type calc bucket with one value fixed
      for (const fieldName of bucketFieldNames) {
        let uniqueValues = unique(data.map(el => el[fieldName]));
        if (content.typeSpecific.fields[fieldName].dataType === 'date') {
          const { format } = content.typeSpecific.fields[fieldName];
          //sort desc
          uniqueValues = orderBy(uniqueValues.map(obj => objToMoment(obj, format.date.inputFormat)), [], sortMode);
          // console.log('DATE VALUE ORDER: ', uniqueValues);
          //take first
          const lastVal = momentToStr(uniqueValues[0], format.date.inputFormat);
          bucketSelector[fieldName] = lastVal;
        } else {
          uniqueValues = orderBy(uniqueValues, [], sortMode);
          // console.log('STRING VALUE ORDER: ', uniqueValues);
          const lastVal = uniqueValues[0];
          bucketSelector[fieldName] = lastVal;
        }
      }
      // console.log('BUCKET SELECTOR', bucketSelector);
      //get the right bucket
      const selectedLabels = unique(
        orderBy(
          data.filter(el => {
            for (const bucketField of bucketFieldNames) {
              if (el[bucketField] !== bucketSelector[bucketField]) return false;
            }
            return true;
          }),
          valueField,
          direction
        )
          .slice(0, amount)
          .map(el => el[labelField])
      );
      //get all the data
      data = data.filter(el => selectedLabels.includes(el[labelField]));
    } else {
      //console.log('[DataPipeline] - Top Static - without Buckets', valueField);
      //well seems we just need top
      data = data.filter(el => el[valueField] != null);
      data = orderBy(data, valueField, direction).slice(0, amount);
    }
  } else {
    /*
        DYNAMIC MODE
       */

    if (bucketFieldNames.length > 0) {
      //console.log('[DataPipeline] - Top Dynamic - ', content, bucketFieldNames);
      const mapVals = {};
      data = data.filter(el => el[valueField] != null);
      for (const row of data) {
        let hash = '';
        for (const fieldName of bucketFieldNames) {
          hash += row[fieldName];
        }
        if (mapVals[hash]) {
          mapVals[hash].push(row);
        } else {
          mapVals[hash] = [row];
        }
      }
      let tempData = [];
      for (const buckets of Object.keys(mapVals)) {
        tempData = tempData.concat(orderBy(mapVals[buckets], valueField, direction).slice(0, amount));
      }
      data = tempData;
    } else {
      //console.log('[DataPipeline] - Top Dynamic - without Buckets', valueField);
      //well seems we just need top
      data = data.filter(el => el[valueField] != null);
      data = orderBy(data, valueField, direction).slice(0, amount);
    }
  }

  data.push(...additionItems);
  return data;
};

export {
  applySmartFilter,
  applySmartFunctions,
  applyInVisualFilter,
  addMetaInfo,
  applyEditorFilter,
  sortByContent,
  clearNulls,
  getValueRange,
  getTimeFieldName,
  getIsoFieldName,
  getValueFieldName,
  getOldFields,
  getLabelFieldName
};
