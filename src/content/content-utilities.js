import { cloneObject } from '../utilities';

const initLocalStorage = content => {
  content.localStorage = {
    unsavedChanges: false
  };
};

const getBaseMetricObect = () => {
  return {
    impressions: 0
  };
};

/**
 * removes a field from the typeSpecific
 * ATTENTION:
 *  do not use this function if you are not sure if this field
 *  is used as valueField, aggregationField, labelField or something like this
 *  this function cannot handle this atm
 */
const unsafeRemoveField = (content, fieldName) => {
  //TODO remove from dimensions and avalableFields

  //remove from fields
  delete content.typeSpecific.fields[fieldName];
  //remove from tooltipFields
  content.typeSpecific.tooltip.fields = content.typeSpecific.tooltip.fields.filter(el => el.field !== 'data:' + fieldName);
  const { chart } = content.typeSpecific;
  // chart sorting
  if (chart) {
    const idx = chart.sorting.sortFields.indexOf(fieldName);
    if (idx >= 0) chart.sorting.sortFields.splice(idx, 1, fieldName);
  }

  return content;
};

/**
 * applys new dataSet to existing content
 *
 * for single visuals the information is in   'typeSpecific.updatePossible': {
     dataSetId: newDataSetId,
     dataId: newDataId,
     updated_at: new Date()
   }
 *
 *
 * @param  fields[oldValueFieldName] [description]
 * @return                           [description]
 */
const applyDataSetUpdateToExistingContent = (content, options) => {
  //on client only apply local storage
  if (options.client) {
    if (!content.localStorage) {
      initLocalStorage(content);
    }
    content.localStorage.unsavedChanges = true;
  }
  if (content.typeSpecific.updatePossible) {
    content.typeSpecific.dataId = content.typeSpecific.updatePossible.dataId;
    content.typeSpecific.data.source = '/api/data/' + content.typeSpecific.updatePossible.dataId;
    //todo think about the implications?
    delete content.typeSpecific.updatePossible;
  }
  return content;
};

const createNewValueFieldFromExisting = (content, oldValueFieldName, newValueFieldName, newValueFieldTitle, newValueFormat) => {
  const { fields, dimensions } = content.typeSpecific;
  // fields
  fields[newValueFieldName] = deepCloneObject(fields[oldValueFieldName]);
  fields[newValueFieldName].fieldName = newValueFieldName;
  fields[newValueFieldName].title = newValueFieldTitle;
  fields[newValueFieldName].format = newValueFormat;
  return content;
};

/**
 * sets a New Value Field for
 * @param  content contentItem with typeSpecific in it
 * @param oldValueFieldName String name of the old value field that was set before
 * @param newValueFieldname - String unique identifier
 * @param newValueFieldTitle - String title that is displayed in editor
 * @param newValueFormat - formatObject
 * @return content object changed
 */
const setNewValueField = (content, oldValueFieldName, newValueFieldName, newValueFieldTitle, newValueFormat) => {
  //console.log("Setting new Value Field: ",content,oldValueFieldName, newValueFieldName, newValueFieldTitle, newValueFormat);
  const { chart, data, fields, map, tooltip, dimensions, style } = content.typeSpecific;
  //dimensions
  createNewValueFieldFromExisting(content, oldValueFieldName, newValueFieldName, newValueFieldTitle, newValueFormat);
  for (const dimension of dimensions) {
    if (dimension.requirements.fieldTypes.includes('valueField')) {
      //console.log("[typeSpecificChangeHelper] - Applying ",dimension," newValueFieldName: ",newValueFieldName, content);
      dimension.fieldName = newValueFieldName;
      dimension.possibleFields = [];
      //update Possible Field Names for this
      for (const fieldName of Object.keys(fields)) {
        const field = fields[fieldName];
        if (field.dataType == 'number') {
          dimension.possibleFields.push({
            fieldName: field.fieldName,
            title: field.title
          });
        }
      }
    }
  }

  // data
  data.valueField = newValueFieldName;
  // chart axis
  chart.axis.valueAxis.title = ''; //newValueFieldTitle;
  chart.axis.valueAxis.format = newValueFormat;

  // chart sorting
  if (chart) {
    const idx = chart.sorting.sortFields.indexOf(oldValueFieldName);
    if (idx >= 0) chart.sorting.sortFields.splice(idx, 1, newValueFieldName);
    chart.values.format = newValueFormat;
  }
  if (map && map.legend && map.legend.values) {
    map.legend.values.format = newValueFormat;
  }

  // tooltip
  tooltip.value.label = ''; // newValueFieldTitle;
  tooltip.value.field = 'data:' + newValueFieldName;
  tooltip.value.format = newValueFormat;

  //coloring
  if (style) {
    style.colors2.fieldName = newValueFieldName;
  }

  return content;
};

export { initLocalStorage, getBaseMetricObect, unsafeRemoveField, applyDataSetUpdateToExistingContent, createNewValueFieldFromExisting, setNewValueField };
