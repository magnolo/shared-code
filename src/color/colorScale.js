import chroma from 'chroma-js';
import { sortBy } from 'lodash';
import { quantile, ascending } from 'd3-array';
import { scaleLinear, scaleThreshold, scalePow, scaleQuantile, scaleLog } from 'd3-scale';
// import { schemePaired } from 'd3-scale-chromatic';

const normalize = (num, min, max) => (num - min) / (max - min);
const unique = arr => arr.filter((obj, idx, nodes) => nodes.indexOf(obj) === idx);

const getColorScale = (colorObj, data, valueRange) => {
  if (colorObj.type === 'categorical') return getCategoricalScale(colorObj);
  if (colorObj.type === 'gradient') return getGradientScale(colorObj, valueRange);
  if (colorObj.type === 'range') return getRangeScale(colorObj);
  if (colorObj.type === 'solid') return obj => colorObj.solid || '#ccc';
  return getContinuousScale(colorObj, data, valueRange);
};

const getCategoricalScale = colorObj => {
  const { categorical } = colorObj;
  const { fallback, values, fieldName } = categorical;

  const scaleFn = obj => {
    const fieldValue = obj[fieldName];
    const foundValue = values.find(obj => obj.value === fieldValue);
    return foundValue ? foundValue.color : fallback;
  };

  return scaleFn;
};

const getGradientScale = (colorObj, valueRange) => {
  const { fieldName, gradient } = colorObj;
  const { values } = gradient;
  const stops = sortBy(values, ['domain']);

  const colors = stops.map(obj => obj.color);
  // const domain = unique([0, 100, ...values.map(obj => obj.domain)]);

  // REMOVED 0, 100 for working gradient? @gregor plz tell me whats up here
  const domain = unique([...stops.map(obj => obj.domain)]);

  // const colorScale = chroma
  //   .scale(colors)
  //   .domain(domain)
  //   .mode('lch');

  const colorScale = scaleLinear()
    .domain(domain)
    .range(colors)
    .clamp(true);

  const scaleFn = obj => {
    const fieldValue = normalize(obj[fieldName], valueRange[0], valueRange[1]) * 100;
    return colorScale(fieldValue);
  };

  return scaleFn;
};

const getRangeScale = colorObj => {
  const { range, fieldName } = colorObj;
  const colors = range.colors;

  const thresholds = [...range.thresholds];
  thresholds[thresholds.length - 1] = thresholds[thresholds.length - 1] += thresholds[thresholds.length - 1] * 0.00001;

  const colorScale = scaleThreshold()
    .domain(thresholds)
    .range([range.fallback, ...colors, range.fallback]);

  const scaleFn = obj => {
    const fieldValue = obj[fieldName];
    const color = colorScale(fieldValue);
    return color;
  };

  return scaleFn;
};

const getContinuousScale = (colorObj, data, valueRange) => {
  const { fieldName, continuous } = colorObj;
  const { colors, scaleType } = continuous;

  const numColors = colors.length;
  const rangeScale = scaleLinear()
    .domain([0, numColors - 1])
    .range(valueRange);

  const domain = [];
  for (let idx = 0; idx < numColors; idx++) {
    domain.push(rangeScale(idx));
  }

  let colorScale;
  if (scaleType === 'linear') {
    colorScale = chroma
      .scale(colors)
      .domain(domain)
      .mode('lch');

    // colorScale = scaleLinear()
    //   .domain(range)
    //   .range(colors)
    //   .clamp(true);
  }

  if (scaleType === 'exponential') {
    // colorScale = scalePow() // scaleLog scalePow
    //   .domain(domain)
    //   .range(colors)
    //   .exponent(1.5)
    //   // .base(10)
    //   .clamp(true);
    const quantiles = getQuantileValues(colors.length, data, fieldName);

    colorScale = scaleLinear()
      .domain(quantiles)
      .range(colors)
      .clamp(true);
  }

  if (scaleType === 'quantiles') {
    const quantilesDomain = unique(data.map(obj => obj[fieldName]));
    colorScale = scaleQuantile()
      .domain(quantilesDomain)
      .range(colors);
  }

  const scaleFn = obj => {
    const fieldValue = obj[fieldName];
    if (fieldValue === null) return '#cccccc';

    const color = colorScale(fieldValue);
    return color && color.css ? color.css() : color ? color : '#cccccc';
  };

  return scaleFn;
};

const getQuantileValues = (size, data, fieldName) => {
  const quantilesDomain = getQuantilesDomain(data, fieldName);
  const quantiles = [];
  for (let i = 0; i < size; i++) {
    quantiles.push(quantile(quantilesDomain, i / (size - 1)));
  }
  return quantiles; // colors.map((obj, idx) => quantile(quantilesDomain, idx / (colors.length - 1)));
};

const getQuantilesDomain = (data, fieldName) => {
  return unique(data.filter(item => item[fieldName] !== null).map(obj => obj[fieldName])).sort(ascending);
};

const getColorsFromSet = (colors, count, data) => {
  return chroma
    .scale(colors)
    .mode('lch')
    .colors(count);
};

export { getColorScale };
