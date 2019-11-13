const ChartTypes = [
  'linechart',
  'areachart',
  'barchart',
  'horizontalbarchart',
  'groupedbarchart',
  'stackedbarchart',
  'donutchart',
  'donutchart_half',
  'bar-grouped-horizontal',
  'bar-stacked-horizontal'
];

const MapTypes = ['choropleth'];

const ParentTypes = ['atlas', 'report'];

const VisualTypes = [...ChartTypes, ...MapTypes];
const ContentTypes = [...VisualTypes, ...ParentTypes];

const PublicUserIds = [
  '5ca4d82b9a71a2001d8aebe6',
  '5abcb05e12189600392ef18c',
  '5bd6ddf39f545b001db5ee95',
  '5c4ec7ed8dbf97001f9e1d38',
  '5c8f9f21812a15001df3d1d0',
  '5c811011ce002c001c55d32d',
  '5c7e9df39f6525001e510f47',
  '5bcf2adaa76b68001cb72f2f',
  '5bd9d130d30fad001d6cc391',
  '5beacb99a4f5ea001c9d9816',
  '5c94af824b870d001e4cc658'
];

const AccessLevels = {
  public: 'public',
  unlisted: 'link',
  private: 'private'
};

export { ChartTypes, MapTypes, ParentTypes, VisualTypes, ContentTypes, PublicUserIds, AccessLevels };
