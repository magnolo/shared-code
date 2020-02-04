/**
 * Helper Functions and Constants for Templates
 * Useable on Server and Client
 */

/*
   General Consideration:
    - templates will be saved into the userPreferences parts
    - there will be multiple named templates (name can be the same )
       - we want an unique id on a user level base UUID 4
    - there will be a default template? can be not set

    - when content validator gets an update templates shall be updated too
       - so we need some sort of template validation

    - when we save and apply a template the user can choose which parts of the template
      will be applied / saved


    - managing in apply and save
         - have a separate datastructure that tracks selected parts
         - that structure is fixed and will be transformed / applied to the actual structure
         - thats a manual craft

    When we apply a template some parts of it may be not be able to be apllied at all
    - this can be dependant on the content type you have open now
      -> aka you have open a report you cant apply anything that is specific to a visualization

    - on the other hand it can be that the template doesnt have information on that

  */
import uuid from 'uuid/v4';
import { ParentTypes } from '../config/constants';

const SECTIONS = [
  {
    label: 'Visualization',
    value: 'visulalization',
    selected: true,
    enabled: true,
    disabledReason: '',
    templateValues: [
      {
        id: 'visualtitlestyle', //unique identifier between all sections used as reference,
        label: 'Title Style', //used for showing
        selected: true, // currently selected
        enabled: true, //
        disabledReason: ''
      },
      {
        id: 'visualsubtitlestyle',
        label: 'SubTitle Style', //used for showing
        selected: true, // currently selected
        enabled: true, //
        disabledReason: ''
      },
      {
        id: 'visualdescriptionstyle',
        label: 'Description Style', //used for showing
        selected: true, // currently selected
        enabled: true, //
        disabledReason: ''
      },
      {
        id: 'visualdescriptionbackground',
        label: 'Description Background', //used for showing
        selected: true, // currently selected
        enabled: true, //
        disabledReason: ''
      },
      {
        id: 'visualsourcestyle',
        label: 'Source Style', //used for showing
        selected: true, // currently selected
        enabled: true, //
        disabledReason: ''
      },
      {
        id: 'visualbackground',
        label: 'Background', //used for showing
        selected: true, // currently selected
        enabled: true, //
        disabledReason: ''
      },
      {
        id: 'visualcolor',
        label: 'Colors', //used for showing
        selected: true, // currently selected
        enabled: true, //
        disabledReason: ''
      },
      {
        id: 'visuallayout',
        label: 'Layout', //used for showing
        selected: true, // currently selected
        enabled: true, //
        disabledReason: ''
      },
      {
        id: 'nodatamessage',
        label: 'No Data Messages', //used for showing
        selected: true, // currently selected
        enabled: true, //
        disabledReason: ''
      }
    ],
    sections: [
      {
        label: 'Map',
        value: 'map',
        enabled: true,
        selected: true,
        disabledReason: '',
        templateValues: [
          {
            id: 'mapattributionstyle',
            label: 'Map Attribution Style', //used for showing
            selected: true, // currently selected
            enabled: true, //
            disabledReason: ''
          },
          {
            id: 'basemapstyle',
            label: 'Basemap Style', //used for showing
            selected: true, // currently selected
            enabled: true, //
            disabledReason: ''
          },
          {
            id: 'basemappitch',
            label: 'Basemap Pitch', //used for showing
            selected: true, // currently selected
            enabled: true, //
            disabledReason: ''
          },
          {
            id: 'basemapbearing',
            label: 'Basemap Bearing', //used for showing
            selected: true, // currently selected
            enabled: true, //
            disabledReason: ''
          },
          {
            id: 'basemapanimationspeed',
            label: 'Basemap Animation Speed', //used for showing
            selected: true, // currently selected
            enabled: true, //
            disabledReason: ''
          },
          {
            id: 'basemapanimationcurve',
            label: 'Basemap Animation Curve', //used for showing
            selected: true, // currently selected
            enabled: true, //
            disabledReason: ''
          },
          {
            id: 'maptype',
            label: 'Map Type', //used for showing
            selected: true, // currently selected
            enabled: true, //
            disabledReason: ''
          },
          {
            id: 'mapviewport',
            label: 'Map Viewport', //used for showing
            selected: true, // currently selected
            enabled: true, //
            disabledReason: ''
          },
          {
            id: 'maphighlights',
            label: 'Map Highlights', //used for showing
            selected: true, // currently selected
            enabled: true, //
            disabledReason: ''
          },
          {
            id: 'maphhover',
            label: 'Map Hover', //used for showing
            selected: true, // currently selected
            enabled: true, //
            disabledReason: ''
          },
          {
            id: 'maprenderworldcopies',
            label: 'Map Render World Copies', //used for showing
            selected: true, // currently selected
            enabled: true, //
            disabledReason: ''
          }
        ],
        sections: [
          {
            label: 'Choropleth',
            value: 'choropleth',
            enabled: true,
            selected: true,
            disabledReason: '',
            templateValues: [
              {
                id: 'choroopacity',
                label: 'Opacity', //used for showing
                selected: true, // currently selected
                enabled: true, //
                disabledReason: ''
              },
              {
                id: 'choroshowallsourcefeatures',
                label: 'Show All Source Features', //used for showing
                selected: true, // currently selected
                enabled: true, //
                disabledReason: ''
              },
              {
                id: 'chorooutlinescolor',
                label: 'Outlines Color', //used for showing
                selected: true, // currently selected
                enabled: true, //
                disabledReason: ''
              },
              {
                id: 'choroemptyfeaturescolor',
                label: 'Empty Features Color', //used for showing
                selected: true, // currently selected
                enabled: true, //
                disabledReason: ''
              }
            ],
            sections: []
          },
          {
            label: 'Bubblemap',
            value: 'bubbles',
            enabled: true,
            selected: true,
            disabledReason: '',
            templateValues: [
              {
                id: 'bubbleoptions',
                label: 'Bubble Options', //used for showing
                selected: true, // currently selected
                enabled: true, //
                disabledReason: ''
              },
              {
                id: 'bubbleoutlineswidth',
                label: 'Bubble Outline Width', //used for showing
                selected: true, // currently selected
                enabled: true, //
                disabledReason: ''
              }
            ],
            sections: []
          },
          {
            label: 'ExtrudeMap',
            value: 'extrude',
            enabled: true,
            selected: true,
            disabledReason: '',
            templateValues: [
              {
                id: 'extrudeoptions',
                label: 'Extrude Options', //used for showing
                selected: true, // currently selected
                enabled: true, //
                disabledReason: ''
              }
            ],
            sections: []
          },
          {
            label: 'Options',
            value: 'mapoptions',
            enabled: true,
            selected: true,
            disabledReason: '',
            templateValues: [
              {
                id: 'mapoptionszoombuttons',
                label: 'Zoom Buttons', //used for showing
                selected: true, // currently selected
                enabled: true, //
                disabledReason: ''
              },
              {
                id: 'mapoptionslang',
                label: 'Label Language', //used for showing
                selected: true, // currently selected
                enabled: true, //
                disabledReason: ''
              },
              {
                id: 'mapoptionsuserinteractions',
                label: 'Allow User Interactions', //used for showing
                selected: true, // currently selected
                enabled: true, //
                disabledReason: ''
              },
              {
                id: 'mapoptionsscale',
                label: 'Show Scale', //used for showing
                selected: true, // currently selected
                enabled: true, //
                disabledReason: ''
              },
              {
                id: 'mapoptionssearch',
                label: 'Show Search', //used for showing
                selected: true, // currently selected
                enabled: true, //
                disabledReason: ''
              },
              {
                id: 'mapoptionssearchdetails',
                label: 'Search Details', //used for showing
                selected: true, // currently selected
                enabled: true, //
                disabledReason: ''
              }
            ],
            sections: []
          },
          {
            label: 'Legend',
            value: 'maplegend',
            enabled: true,
            selected: true,
            disabledReason: '',
            templateValues: [
              {
                id: 'maplegenddefaultclosed',
                label: 'Default Closed', //used for showing
                selected: true, // currently selected
                enabled: true, //
                disabledReason: ''
              },
              {
                id: 'maplegendbodystyle',
                label: 'Body Style', //used for showing
                selected: true, // currently selected
                enabled: true, //
                disabledReason: ''
              },
              {
                id: 'maplegendheaderstyle',
                label: 'Header Style', //used for showing
                selected: true, // currently selected
                enabled: true, //
                disabledReason: ''
              },
              {
                id: 'maplegendtype',
                label: 'Legend Type', //used for showing
                selected: true, // currently selected
                enabled: true, //
                disabledReason: ''
              }
            ],
            sections: []
          }
        ]
      },
      {
        label: 'Chart',
        value: 'chart',
        enabled: true,
        selected: true,
        disabledReason: '',
        templateValues: [
          {
            id: 'chartsortingenabled',
            label: 'Sorting', //used for showing
            selected: true, // currently selected
            enabled: true, //
            disabledReason: ''
          },
          {
            id: 'chartfontscale',
            label: 'Fontscale', //used for showing
            selected: true, // currently selected
            enabled: true, //
            disabledReason: ''
          },
          {
            id: 'chartbars',
            label: 'Bars', //used for showing
            selected: true, // currently selected
            enabled: true, //
            disabledReason: ''
          },
          {
            id: 'chartscrollable',
            label: 'Scrollable', //used for showing
            selected: true, // currently selected
            enabled: true, //
            disabledReason: ''
          },
          {
            id: 'chartanimation',
            label: 'Animation', //used for showing
            selected: true, // currently selected
            enabled: true, //
            disabledReason: ''
          },
          {
            id: 'chartlegendstyle',
            label: 'Legend Style', //used for showing
            selected: true, // currently selected
            enabled: true, //
            disabledReason: ''
          },
          {
            id: 'chartlegendscrollable',
            label: 'Legend Scrollable', //used for showing
            selected: true, // currently selected
            enabled: true, //
            disabledReason: ''
          },
          {
            id: 'chartlegendscrollheight',
            label: 'Legend Scrollheight', //used for showing
            selected: true, // currently selected
            enabled: true, //
            disabledReason: ''
          },
          {
            id: 'chartlegendposition',
            label: 'Legend Alignment', //used for showing
            selected: true, // currently selected
            enabled: true, //
            disabledReason: ''
          },
          {
            id: 'chartlegendenabled',
            label: 'Legend Enabled', //used for showing
            selected: true, // currently selected
            enabled: true, //
            disabledReason: ''
          },
          {
            id: 'chartstyle',
            label: 'Style', //used for showing
            selected: true, // currently selected
            enabled: true, //
            disabledReason: ''
          },
          {
            id: 'chartgrid',
            label: 'Grid', //used for showing
            selected: true, // currently selected
            enabled: true, //
            disabledReason: ''
          },
          {
            id: 'chartusergrid',
            label: 'User Grid', //used for showing
            selected: true, // currently selected
            enabled: true, //
            disabledReason: ''
          },
          {
            id: 'chartlinestyle',
            label: 'Lines', //used for showing
            selected: true, // currently selected
            enabled: true, //
            disabledReason: ''
          },
          {
            id: 'chartdonutsettings',
            label: 'Donut', //used for showing
            selected: true, // currently selected
            enabled: true, //
            disabledReason: ''
          }
        ],
        sections: [
          {
            label: 'Label Axis',
            value: 'chartlabelaxis',
            enabled: true,
            selected: true,
            disabledReason: '',
            templateValues: [
              {
                id: 'chartlabelaxistitlestyle',
                label: 'Title Style', //used for showing
                selected: true, // currently selected
                enabled: true, //
                disabledReason: ''
              },
              {
                id: 'chartlabelaxisvaluestyle',
                label: 'Value Style', //used for showing
                selected: true, // currently selected
                enabled: true, //
                disabledReason: ''
              },
              {
                id: 'chartlabelaxisenabled',
                label: 'Enabled', //used for showing
                selected: true, // currently selected
                enabled: true, //
                disabledReason: ''
              }
            ],
            sections: []
          },
          {
            label: 'Value Axis',
            value: 'chartvalueaxis',
            enabled: true,
            selected: true,
            disabledReason: '',
            templateValues: [
              {
                id: 'chartvalueaxistitlestyle',
                label: 'Title Style', //used for showing
                selected: true, // currently selected
                enabled: true, //
                disabledReason: ''
              },
              {
                id: 'chartvalueaxisvaluestyle',
                label: 'Value Style', //used for showing
                selected: true, // currently selected
                enabled: true, //
                disabledReason: ''
              },
              {
                id: 'chartvalueaxisenabled',
                label: 'Enabled', //used for showing
                selected: true, // currently selected
                enabled: true, //
                disabledReason: ''
              }
            ],
            sections: []
          },
          {
            label: 'Values',
            value: 'chartvalues',
            enabled: true,
            selected: true,
            disabledReason: '',
            templateValues: [
              {
                id: 'chartvaluesenabled',
                label: 'Enabled', //used for showing
                selected: true, // currently selected
                enabled: true, //
                disabledReason: ''
              },
              {
                id: 'chartvaluestyle',
                label: 'Style', //used for showing
                selected: true, // currently selected
                enabled: true, //
                disabledReason: ''
              },
              {
                id: 'chartvalueposition',
                label: 'Position', //used for showing
                selected: true, // currently selected
                enabled: true, //
                disabledReason: ''
              },
              {
                id: 'chartvaluecontrastswitch',
                label: 'Contrast Switch', //used for showing
                selected: true, // currently selected
                enabled: true, //
                disabledReason: ''
              },
              {
                id: 'chartvaluecolors',
                label: 'Colors', //used for showing
                selected: true, // currently selected
                enabled: true, //
                disabledReason: ''
              }
            ],
            sections: []
          }
        ]
      },
      {
        label: 'Tooltips',
        value: 'tooltips',
        enabled: true,
        selected: true,
        disabledReason: '',
        templateValues: [
          {
            id: 'tooltiptitlestyle',
            label: 'Title Style', //used for showing
            selected: true, // currently selected
            enabled: true, //
            disabledReason: ''
          },
          {
            id: 'tooltipvaluestyle',
            label: 'Value Style', //used for showing
            selected: true, // currently selected
            enabled: true, //
            disabledReason: ''
          },
          {
            id: 'tooltipcontentstyle',
            label: 'Additional Fields Style', //used for showing
            selected: true, // currently selected
            enabled: true, //
            disabledReason: ''
          },
          {
            id: 'visualizationadvancedtooltip',
            label: 'Advanced Tooltip', //used for showing
            selected: true, // currently selected
            enabled: true, //
            disabledReason: ''
          }
        ],
        sections: []
      },
      {
        label: 'Embed',
        value: 'embedview',
        enabled: true,
        selected: true,
        disabledReason: '',
        templateValues: [
          {
            id: 'embedviewbreakpoints',
            label: 'Breakpoints', //used for showing
            selected: true, // currently selected
            enabled: true, //
            disabledReason: ''
          },
          {
            id: 'embedviewsettings',
            label: 'Appearance', //used for showing
            selected: true, // currently selected
            enabled: true, //
            disabledReason: ''
          }
        ],
        sections: []
      },
      {
        label: 'Publish Settings',
        value: 'publishsettings',
        enabled: true,
        selected: true,
        disabledReason: '',
        templateValues: [
          {
            id: 'publishsettingsupdatenotification',
            label: 'Update Notification', //used for showing
            selected: true, // currently selected
            enabled: true, //
            disabledReason: ''
          },
          {
            id: 'publishsettingsautoupdate',
            label: 'Auto Update', //used for showing
            selected: true, // currently selected
            enabled: true, //
            disabledReason: ''
          } /*,
          {
            id: 'publishsettingspublicprivate',
            label: 'Public Private', //used for showing
            selected: true, // currently selected
            enabled: true, //
            disabledReason: ''
          }*/
        ],
        sections: []
      },

      {
        label: 'Filters',
        value: 'chartfilters',
        enabled: true,
        selected: true,
        disabledReason: '',
        templateValues: [
          {
            id: 'chartinvisualfilterstyle',
            label: 'Filter Style', //used for showing
            selected: true, // currently selected
            enabled: true, //
            disabledReason: ''
          }
        ],
        sections: []
      }
    ]
  },
  {
    label: 'Report',
    value: 'report',
    selected: true,
    enabled: true,
    disabledReason: '',
    templateValues: [
      {
        id: 'reporttitlestyle', //unique identifier between all sections used as reference,
        label: 'Title Style', //used for showing
        selected: true, // currently selected
        enabled: true, //
        disabledReason: ''
      },
      {
        id: 'reportdescriptionstyle',
        label: 'Description Style', //used for showing
        selected: true, // currently selected
        enabled: true, //
        disabledReason: ''
      }
    ],
    sections: [
      {
        label: 'Overview',
        value: 'reportoverview',
        enabled: true,
        selected: true,
        disabledReason: '',
        templateValues: [
          {
            id: 'reportsubtitlestyle',
            label: 'Chapter Style', //used for showing
            selected: true, // currently selected
            enabled: true, //
            disabledReason: ''
          },
          {
            id: 'reportbackground',
            label: 'Background', //used for showing
            selected: true, // currently selected
            enabled: true, //
            disabledReason: ''
          },
          {
            id: 'reportlogo',
            label: 'Logo', //used for showing
            selected: true, // currently selected
            enabled: true, //
            disabledReason: ''
          },
          {
            id: 'reportpaginationtype',
            label: 'Pagination Type', //used for showing
            selected: true, // currently selected
            enabled: true, //
            disabledReason: ''
          },
          {
            id: 'reportpaginationbackgroundcolor',
            label: 'Pagination Background Color', //used for showing
            selected: true, // currently selected
            enabled: true, //
            disabledReason: ''
          },
          {
            id: 'reportpaginationstyle',
            label: 'Pagination Style', //used for showing
            selected: true, // currently selected
            enabled: true, //
            disabledReason: ''
          }
        ],
        sections: []
      },
      {
        label: 'Details',
        value: 'reportdetails',
        enabled: true,
        selected: true,
        disabledReason: '',
        templateValues: [
          {
            id: 'reportvisualtitlestlye',
            label: 'Visual Title', //used for showing
            selected: true, // currently selected
            enabled: true, //
            disabledReason: ''
          },
          {
            id: 'reportvisualdescriptionstlye',
            label: 'Visual Description', //used for showing
            selected: true, // currently selected
            enabled: true, //
            disabledReason: ''
          },
          {
            id: 'reporttogglebuttonstyle',
            label: 'Visual Switcher Style', //used for showing
            selected: true, // currently selected
            enabled: true, //
            disabledReason: ''
          },
          {
            id: 'reportswitchbackgroundcolor',
            label: 'Visual Switcher Background Color', //used for showing
            selected: true, // currently selected
            enabled: true, //
            disabledReason: ''
          },
          {
            id: 'reportswitchtextdescription',
            label: 'Visual Switcher Description Text', //used for showing
            selected: true, // currently selected
            enabled: true, //
            disabledReason: ''
          },
          {
            id: 'reportswitchtextvisual',
            label: 'Visual Switcher Visual Text', //used for showing
            selected: true, // currently selected
            enabled: true, //
            disabledReason: ''
          },
          {
            id: 'reportswitchtextvisualizations',
            label: 'Visual Switcher Visualization Text', //used for showing
            selected: true, // currently selected
            enabled: true, //
            disabledReason: ''
          },
          {
            id: 'reportprogressbarcolor',
            label: 'Progressbar Color', //used for showing
            selected: true, // currently selected
            enabled: true, //
            disabledReason: ''
          },
          {
            id: 'reportactivechapterbackground',
            label: 'Active Chapter Background', //used for showing
            selected: true, // currently selected
            enabled: true, //
            disabledReason: ''
          },
          {
            id: 'reportheaderwidth',
            label: 'Header Width', //used for showing
            selected: true, // currently selected
            enabled: true, //
            disabledReason: ''
          },
          {
            id: 'reportchapterswidth',
            label: 'Chapters Width', //used for showing
            selected: true, // currently selected
            enabled: true, //
            disabledReason: ''
          },
          {
            id: 'reportactivechapterwidth',
            label: 'Active Chapters Width', //used for showing
            selected: true, // currently selected
            enabled: true, //
            disabledReason: ''
          }
        ],
        sections: []
      },
      {
        label: 'Embed',
        value: 'reportembedview',
        enabled: true,
        selected: true,
        disabledReason: '',
        templateValues: [
          {
            id: 'reportembedviewbreakpoints',
            label: 'Breakpoints', //used for showing
            selected: true, // currently selected
            enabled: true, //
            disabledReason: ''
          },
          {
            id: 'reportembedviewsettings',
            label: 'Appearance', //used for showing
            selected: true, // currently selected
            enabled: true, //
            disabledReason: ''
          }
        ],
        sections: []
      },
      {
        label: 'Publish Settings',
        value: 'reportpublishsettings',
        enabled: true,
        selected: true,
        disabledReason: '',
        templateValues: [
          {
            id: 'reportpublishsettingsupdatenotification',
            label: 'Update Notification', //used for showing
            selected: true, // currently selected
            enabled: true, //
            disabledReason: ''
          },
          {
            id: 'reportpublishsettingsautoupdate',
            label: 'Auto Update', //used for showing
            selected: true, // currently selected
            enabled: true, //
            disabledReason: ''
          } /*,
          {
            id: 'reportpublishsettingspublicprivate',
            label: 'Public Private', //used for showing
            selected: true, // currently selected
            enabled: true, //
            disabledReason: ''
          }*/
        ],
        sections: []
      }
    ]
  },
  {
    label: 'Atlas',
    value: 'atlas',
    selected: true,
    enabled: true,
    disabledReason: '',
    templateValues: [
      {
        id: 'atlastitlestyle', //unique identifier between all sections used as reference,
        label: 'Title Style', //used for showing
        selected: true, // currently selected
        enabled: true, //
        disabledReason: ''
      },
      {
        id: 'atlassubtitlestyle',
        label: 'SubTitle Style', //used for showing
        selected: true, // currently selected
        enabled: true, //
        disabledReason: ''
      },
      {
        id: 'atlasbackground',
        label: 'Background', //used for showing
        selected: true, // currently selected
        enabled: true, //
        disabledReason: ''
      },
      {
        id: 'atlaslayout', // BUG, THIS IS FOR ALL TEMPLATES, NOT JUST ATLAS!!
        label: 'Layout', //used for showing
        selected: true, // currently selected
        enabled: true, //
        disabledReason: ''
      }
    ],
    sections: [
      {
        label: 'Embed',
        value: 'atlasembedview',
        enabled: true,
        selected: true,
        disabledReason: '',
        templateValues: [
          {
            id: 'atlasembedviewbreakpoints',
            label: 'Breakpoints', //used for showing
            selected: true, // currently selected
            enabled: true, //
            disabledReason: ''
          },
          {
            id: 'atlasembedviewsettings',
            label: 'Appearance', //used for showing
            selected: true, // currently selected
            enabled: true, //
            disabledReason: ''
          }
        ],
        sections: []
      },
      {
        label: 'Publish Settings',
        value: 'atlaspublishsettings',
        enabled: true,
        selected: true,
        disabledReason: '',
        templateValues: [
          {
            id: 'atlaspublishsettingsupdatenotification',
            label: 'Update Notification', //used for showing
            selected: true, // currently selected
            enabled: true, //
            disabledReason: ''
          },
          {
            id: 'atlaspublishsettingsautoupdate',
            label: 'Auto Update', //used for showing
            selected: true, // currently selected
            enabled: true, //
            disabledReason: ''
          } /*,
          {
            id: 'atlaspublishsettingspublicprivate',
            label: 'Public Private', //used for showing
            selected: true, // currently selected
            enabled: true, //
            disabledReason: ''
          }*/
        ],
        sections: []
      }
    ]
  }
];

/**
 * Helper for applying a style value to content with given templateId
 *
 */
const applyValueToContent = (content, template, valueId) => {
  const templateValue = template.templateValues[valueId];
  switch (valueId) {
    case 'chartlinestyle':
      content.typeSpecific.chart.lines = JSON.parse(JSON.stringify(templateValue.value));
      break;
    case 'chartusergrid':
      content.typeSpecific.chart.gridUser = JSON.parse(JSON.stringify(templateValue.value));
      break;
    case 'chartdonutsettings':
      const donutSettings = JSON.parse(JSON.stringify(templateValue.value));
      if (donutSettings.padAngle && content.typeSpecific.chart.donut.padAngle) {
        content.typeSpecific.chart.donut.padAngle = donutSettings.padAngle;
      }
      if (donutSettings.innerRadius && content.typeSpecific.chart.donut.innerRadius) {
        content.typeSpecific.chart.donut.innerRadius = donutSettings.innerRadius;
      }
      if (donutSettings.outerRadius && content.typeSpecific.chart.donut.outerRadius) {
        content.typeSpecific.chart.donut.outerRadius = donutSettings.outerRadius;
      }
      break;
    case 'mapviewport':
      //typeSpecific.map.options.flyTo
      //typeSpecific.map.options.fitBounds
      //typeSpecific.map.options.maxBounds
      //bboxAutoSet kann true sein -> aber user not changed -> deleten wenn set
      value: {
        type: 'nothing';
      }
      const saveValue = JSON.parse(JSON.stringify(templateValue.value));
      if (saveValue.type !== 'nothing') {
        if (
          content.typeSpecific.map &&
          content.typeSpecific.map &&
          content.typeSpecific.map.sources &&
          content.typeSpecific.map.sources.length > 0 &&
          content.typeSpecific.map.sources[0] &&
          content.typeSpecific.map.sources[0].mappingId
        ) {
          const currentMappingID = content.typeSpecific.map.sources[0].mappingId;
          if (currentMappingID === saveValue.mappingId) {
            const values = saveValue.value;
            if (saveValue.type === 'startViewport') {
              //both viewports to set
              content.typeSpecific.map.options.startViewport = JSON.parse(JSON.stringify(values.startViewport));
              content.typeSpecific.map.options.maxViewport = JSON.parse(JSON.stringify(values.maxViewport));
            } else {
              //maxViewport only is set!
              content.typeSpecific.map.options.maxViewport = JSON.parse(JSON.stringify(values.maxViewport));
            }
            //to other options are set separatedly
            content.typeSpecific.map.options.maxViewportIsLimit = JSON.parse(JSON.stringify(values.maxViewportIsLimit));
            content.typeSpecific.map.options.withStartAnimation = JSON.parse(JSON.stringify(values.withStartAnimation));
          }
        }
      }
      break;
    case 'chartlabelaxisenabled':
      content.typeSpecific.chart.axis.labelAxis.enabled = JSON.parse(JSON.stringify(templateValue.value));
      break;
    case 'chartvalueaxisenabled':
      content.typeSpecific.chart.axis.valueAxis.enabled = JSON.parse(JSON.stringify(templateValue.value));
      break;
    case 'chartgrid':
      const gridValues = JSON.parse(JSON.stringify(templateValue.value));
      content.typeSpecific.chart.grid = gridValues.grid;
      content.typeSpecific.chart.gridZero = gridValues.gridZero;
      content.typeSpecific.chart.scaleZero = gridValues.scaleZero;
      break;
    case 'chartvaluecolors':
      const valueColors = JSON.parse(JSON.stringify(templateValue.value));
      content.typeSpecific.chart.values.darkColor = valueColors.darkColor;
      content.typeSpecific.chart.values.lightColor = valueColors.lightColor;
      break;
    case 'visualizationadvancedtooltip':
      const advancedTooltipValue = JSON.parse(JSON.stringify(templateValue.value));
      content.typeSpecific.advancedTooltip.enabled = advancedTooltipValue.enabled;
      content.typeSpecific.advancedTooltip.type = advancedTooltipValue.type;
      content.typeSpecific.advancedTooltip.event = advancedTooltipValue.event;
      content.typeSpecific.advancedTooltip.position = advancedTooltipValue.position;
      content.typeSpecific.advancedTooltip.style = advancedTooltipValue.style;
      break;
    case 'maptype':
      const maptype = JSON.parse(JSON.stringify(templateValue.value));
      if (maptype === 'bubbles') {
        //only apply if point source is there
        if (content.typeSpecific.map.sources && content.typeSpecific.map.sources.length > 0 && content.typeSpecific.map.sources[0].pointSource) {
          content.typeSpecific.map.options.displayType = maptype;
        }
      } else {
        content.typeSpecific.map.options.displayType = maptype;
      }
      break;
    case 'bubbleoutlineswidth':
      content.typeSpecific.map.options.outlinesWidth = JSON.parse(JSON.stringify(templateValue.value));
      break;
    case 'extrudeoptions':
      content.typeSpecific.map.options.extrude = JSON.parse(JSON.stringify(templateValue.value));
      break;
    case 'maphhover':
      content.typeSpecific.map.options.hover = JSON.parse(JSON.stringify(templateValue.value));
      break;
    case 'maprenderworldcopies':
      content.typeSpecific.map.options.renderWorldCopies = JSON.parse(JSON.stringify(templateValue.value));
      break;
    case 'maphighlights':
      content.typeSpecific.map.options.highlight = JSON.parse(JSON.stringify(templateValue.value));
      break;
    case 'basemapanimationcurve':
      content.typeSpecific.map.options.animationCurve = JSON.parse(JSON.stringify(templateValue.value));
      break;
    case 'basemapanimationspeed':
      content.typeSpecific.map.options.animationSpeed = JSON.parse(JSON.stringify(templateValue.value));
      break;
    case 'basemapbearing':
      content.typeSpecific.map.options.bearing = JSON.parse(JSON.stringify(templateValue.value));
      break;
    case 'mapattributionstyle':
      content.typeSpecific.map.attributions.font = JSON.parse(JSON.stringify(templateValue.value));
      break;
    case 'basemappitch':
      content.typeSpecific.map.options.pitch = JSON.parse(JSON.stringify(templateValue.value));
      break;
    case 'bubbleoptions':
      content.typeSpecific.map.options.bubbles = JSON.parse(JSON.stringify(templateValue.value));
      break;
    case 'chartstyle':
      content.typeSpecific.chart.style = JSON.parse(JSON.stringify(templateValue.value));
      break;
    case 'chartlegendenabled':
      content.typeSpecific.chart.legend.enabled = JSON.parse(JSON.stringify(templateValue.value));
      break;
    case 'chartlegendposition':
      content.typeSpecific.chart.legend.position = JSON.parse(JSON.stringify(templateValue.value));
      break;
    case 'chartlegendscrollable':
      content.typeSpecific.chart.legend.scrollable = JSON.parse(JSON.stringify(templateValue.value));
      break;
    case 'chartlegendscrollheight':
      content.typeSpecific.chart.legend.scrollHeight = JSON.parse(JSON.stringify(templateValue.value));
      break;
    case 'reportactivechapterwidth':
      content.typeSpecific.report.activeChapterWidth = JSON.parse(JSON.stringify(templateValue.value));
      break;
    case 'reportchapterswidth':
      content.typeSpecific.report.chaptersWidth = JSON.parse(JSON.stringify(templateValue.value));
      break;
    case 'reportheaderwidth':
      content.typeSpecific.report.headerWidth = JSON.parse(JSON.stringify(templateValue.value));
      break;
    case 'reportactivechapterbackground':
      content.typeSpecific.report.activeChapterBackground = JSON.parse(JSON.stringify(templateValue.value));
      break;
    case 'reportprogressbarcolor':
      content.typeSpecific.report.progressBarColor = JSON.parse(JSON.stringify(templateValue.value));
      break;
    case 'reportswitchtextvisualizations':
      content.typeSpecific.report.switchTexts.visualizations = JSON.parse(JSON.stringify(templateValue.value));
      break;
    case 'reportswitchtextvisual':
      content.typeSpecific.report.switchTexts.visual = JSON.parse(JSON.stringify(templateValue.value));
      break;
    case 'reportswitchtextdescription':
      content.typeSpecific.report.switchTexts.description = JSON.parse(JSON.stringify(templateValue.value));
      break;
    case 'reportswitchbackgroundcolor':
      content.typeSpecific.report.switchStyle.backgroundColor = JSON.parse(JSON.stringify(templateValue.value));
      break;
    case 'reportpaginationstyle':
      content.typeSpecific.report.paginationStyle = JSON.parse(JSON.stringify(templateValue.value));
      break;
    case 'reportpaginationbackgroundcolor':
      content.typeSpecific.report.paginationColor = JSON.parse(JSON.stringify(templateValue.value));
      break;
    case 'reportpaginationtype':
      content.typeSpecific.report.paginationType = JSON.parse(JSON.stringify(templateValue.value));
      break;
    case 'reportlogo':
      content.typeSpecific.report.logo = JSON.parse(JSON.stringify(templateValue.value));
      break;
    /*
    case 'publishsettingspublicprivate':
      content.isPublic = JSON.parse(JSON.stringify(templateValue.value));
      break;
    case 'reportpublishsettingspublicprivate':
      content.isPublic = JSON.parse(JSON.stringify(templateValue.value));
      break;
    case 'atlaspublishsettingspublicprivate':
      content.isPublic = JSON.parse(JSON.stringify(templateValue.value));
      break;
    */
    case 'atlastitlestyle':
      content.typeSpecific.style.title = JSON.parse(JSON.stringify(templateValue.value));
      break;
    case 'reporttitlestyle':
      content.typeSpecific.style.title = JSON.parse(JSON.stringify(templateValue.value));
      break;
    case 'atlassubtitlestyle':
      content.typeSpecific.style.subTitle = JSON.parse(JSON.stringify(templateValue.value));
      break;
    case 'reportsubtitlestyle':
      content.typeSpecific.style.subTitle = JSON.parse(JSON.stringify(templateValue.value));
      break;
    case 'reportdescriptionstyle':
      content.typeSpecific.style.description = JSON.parse(JSON.stringify(templateValue.value));
      break;
    case 'atlasbackground':
      content.typeSpecific.style.background = JSON.parse(JSON.stringify(templateValue.value));
      break;
    case 'visualtitlestyle':
      content.typeSpecific.style.title = JSON.parse(JSON.stringify(templateValue.value));
      break;
    case 'visualdescriptionbackground':
      content.typeSpecific.style.descriptionBackground = JSON.parse(JSON.stringify(templateValue.value));
      break;
    case 'visualdescriptionstyle':
      content.typeSpecific.style.description = JSON.parse(JSON.stringify(templateValue.value));
      break;
    case 'visualsubtitlestyle':
      content.typeSpecific.style.subTitle = JSON.parse(JSON.stringify(templateValue.value));
      break;
    case 'visualsourcestyle':
      content.typeSpecific.style.source = JSON.parse(JSON.stringify(templateValue.value));
      break;
    case 'visualbackground':
      content.typeSpecific.style.background = JSON.parse(JSON.stringify(templateValue.value));
      break;
    case 'basemapstyle':
      content.typeSpecific.map.options.style = JSON.parse(JSON.stringify(templateValue.value));
      break;
    case 'choroopacity':
      content.typeSpecific.map.options.opacity = JSON.parse(JSON.stringify(templateValue.value));
      break;
    case 'choroshowallsourcefeatures':
      content.typeSpecific.map.options.showAllSourceFeatures = JSON.parse(JSON.stringify(templateValue.value));
      break;
    case 'chorooutlinescolor':
      content.typeSpecific.map.options.outlinesColor = JSON.parse(JSON.stringify(templateValue.value));
      break;
    case 'choroemptyfeaturescolor':
      content.typeSpecific.map.options.emptyFeaturesColor = JSON.parse(JSON.stringify(templateValue.value));
      break;
    case 'mapoptionszoombuttons':
      content.typeSpecific.map.options.zoomButtons = JSON.parse(JSON.stringify(templateValue.value));
      break;
    case 'mapoptionslang':
      content.typeSpecific.map.options.lang = JSON.parse(JSON.stringify(templateValue.value));
      break;
    case 'mapoptionsuserinteractions':
      content.typeSpecific.map.options.interactions = JSON.parse(JSON.stringify(templateValue.value));
      break;
    case 'mapoptionsscale':
      content.typeSpecific.map.options.scale = JSON.parse(JSON.stringify(templateValue.value));
      break;
    case 'mapoptionssearchdetails':
      const value = JSON.parse(JSON.stringify(templateValue.value));
      content.typeSpecific.map.search.placeholder = value.placeholder;
      content.typeSpecific.map.search.keepCurrentMapZoom = value.keepCurrentMapZoom;
      content.typeSpecific.map.search.animationSpeed = value.animationSpeed;
      content.typeSpecific.map.search.animationCurve = value.animationCurve;
      break;
    case 'mapoptionssearch':
      content.typeSpecific.map.options.enableSearch = JSON.parse(JSON.stringify(templateValue.value));
      break;
    case 'maplegenddefaultclosed':
      content.typeSpecific.map.legend.closed = JSON.parse(JSON.stringify(templateValue.value));
      break;
    case 'maplegendbodystyle':
      content.typeSpecific.map.legend.valueStyle = JSON.parse(JSON.stringify(templateValue.value));
      break;
    case 'maplegendheaderstyle':
      content.typeSpecific.map.legend.titleStyle = JSON.parse(JSON.stringify(templateValue.value));
      break;
    case 'maplegendtype':
      //check if we can do this;
      //console.log('[MaplegendType ] - APPLY VALUE');
      if (content && content.typeSpecific && content.typeSpecific.style && content.typeSpecific.style.colors2 && content.typeSpecific.style.colors2.continuous) {
        const colors = content.typeSpecific.style.colors2;
        const cando = (colors.type === 'continuous' && colors.continuous.scaleType !== 'quantiles') || colors.type === 'gradient';
        //console.log('[MaplegendType ] - ALLOW CHANGE ', cando);
        if (cando) {
          content.typeSpecific.map.legend.type = JSON.parse(JSON.stringify(templateValue.value));
        }
      }
      break;
    case 'chartfontscale':
      content.typeSpecific.chart.fontScale = JSON.parse(JSON.stringify(templateValue.value));
      break;
    case 'chartsortingenabled':
      content.typeSpecific.chart.sorting.enabled = JSON.parse(JSON.stringify(templateValue.value));
      break;
    case 'chartscrollable':
      content.typeSpecific.chart.scrollable = JSON.parse(JSON.stringify(templateValue.value));
      break;
    case 'chartbars':
      content.typeSpecific.chart.bars = JSON.parse(JSON.stringify(templateValue.value));
      break;
    case 'chartanimation':
      content.typeSpecific.chart.animation = JSON.parse(JSON.stringify(templateValue.value));
      break;
    case 'chartlegendstyle':
      content.typeSpecific.chart.legend.style = JSON.parse(JSON.stringify(templateValue.value));
      break;
    case 'chartlabelaxistitlestyle':
      content.typeSpecific.chart.axis.labelAxis.titleStyle = JSON.parse(JSON.stringify(templateValue.value));
      break;
    case 'chartlabelaxisvaluestyle':
      content.typeSpecific.chart.axis.labelAxis.valueStyle = JSON.parse(JSON.stringify(templateValue.value));
      break;
    case 'chartvalueaxistitlestyle':
      content.typeSpecific.chart.axis.valueAxis.titleStyle = JSON.parse(JSON.stringify(templateValue.value));
      break;
    case 'chartvalueaxisvaluestyle':
      content.typeSpecific.chart.axis.valueAxis.valueStyle = JSON.parse(JSON.stringify(templateValue.value));
      break;
    case 'chartvaluesenabled':
      content.typeSpecific.chart.values.enabled = JSON.parse(JSON.stringify(templateValue.value));
      break;
    case 'chartvaluestyle':
      content.typeSpecific.chart.values.style = JSON.parse(JSON.stringify(templateValue.value));
      break;
    case 'chartvalueposition':
      content.typeSpecific.chart.values.position = JSON.parse(JSON.stringify(templateValue.value));
      break;
    case 'chartvaluecontrastswitch':
      content.typeSpecific.chart.values.lightnessThreshold = JSON.parse(JSON.stringify(templateValue.value));
      break;
    case 'tooltiptitlestyle':
      content.typeSpecific.tooltip.titleStyle = JSON.parse(JSON.stringify(templateValue.value));
      break;
    case 'tooltipvaluestyle':
      content.typeSpecific.tooltip.valueStyle = JSON.parse(JSON.stringify(templateValue.value));
      break;
    case 'tooltipcontentstyle':
      content.typeSpecific.tooltip.contentStyle = JSON.parse(JSON.stringify(templateValue.value));
      break;
    case 'embedviewbreakpoints':
      content.typeSpecific.style.breakPoints = JSON.parse(JSON.stringify(templateValue.value));
      break;
    case 'reportembedviewbreakpoints':
      content.typeSpecific.style.breakPoints = JSON.parse(JSON.stringify(templateValue.value));
      break;
    case 'atlasembedviewbreakpoints':
      content.typeSpecific.style.breakPoints = JSON.parse(JSON.stringify(templateValue.value));
      break;
    case 'embedviewsettings':
      content.typeSpecific.embed = JSON.parse(JSON.stringify(templateValue.value));
      break;
    case 'atlasembedviewsettings':
      content.typeSpecific.embed = JSON.parse(JSON.stringify(templateValue.value));
      break;
    case 'reportembedviewsettings':
      content.typeSpecific.embed = JSON.parse(JSON.stringify(templateValue.value));
      break;
    case 'publishsettingsupdatenotification':
      content.typeSpecific.updateOptions.updateNotification = JSON.parse(JSON.stringify(templateValue.value));
      break;
    case 'atlaspublishsettingsupdatenotification':
      content.typeSpecific.updateOptions.updateNotification = JSON.parse(JSON.stringify(templateValue.value));
      break;
    case 'reportpublishsettingsupdatenotification':
      content.typeSpecific.updateOptions.updateNotification = JSON.parse(JSON.stringify(templateValue.value));
      break;

    case 'publishsettingsautoupdate':
      content.typeSpecific.updateOptions.autoUpdateVisual = JSON.parse(JSON.stringify(templateValue.value));
      break;
    case 'atlaspublishsettingsautoupdate':
      content.typeSpecific.updateOptions.autoUpdateVisual = JSON.parse(JSON.stringify(templateValue.value));
      break;
    case 'reportpublishsettingsautoupdate':
      content.typeSpecific.updateOptions.autoUpdateVisual = JSON.parse(JSON.stringify(templateValue.value));
      break;
    case 'reportbackground':
      content.typeSpecific.style.background = JSON.parse(JSON.stringify(templateValue.value));
      break;
    case 'reportvisualtitlestlye':
      content.typeSpecific.report.visualDescriptionTitle = JSON.parse(JSON.stringify(templateValue.value));
      break;
    case 'reportvisualdescriptionstlye':
      content.typeSpecific.report.visualDescription = JSON.parse(JSON.stringify(templateValue.value));
      break;
    case 'reporttogglebuttonstyle':
      content.typeSpecific.report.switchFont = JSON.parse(JSON.stringify(templateValue.value));
      break;
    case 'chartinvisualfilterstyle':
      content.typeSpecific.style.inVisualFilter = JSON.parse(JSON.stringify(templateValue.value));
      break;
    case 'atlaslayout':
      content.typeSpecific.layout = JSON.parse(JSON.stringify(templateValue.value));
      break;
    case 'visuallayout':
      content.typeSpecific.layout = JSON.parse(JSON.stringify(templateValue.value));
      break;
    case 'nodatamessage':
      content.typeSpecific.noDataMessages = JSON.parse(JSON.stringify(templateValue.value));
      break;
    case 'visualcolor':
      //APPLY COLORS FROM VALUES
      const { colors2 } = content.typeSpecific.style;
      const valueObj = templateValue.value;
      colors2.activeColors = JSON.parse(JSON.stringify(valueObj.colors));
      /*
      const valueObj = {
        type: color2.type,
        fallbackColor: undefined,
        colors: []
      };*/
      if (colors2.type === 'solid') {
        colors2.solid = valueObj.colors[0];
      }
      if (colors2.type === 'categorical') {
        for (let i = 0; i < colors2.categorical.values.length; i++) {
          const curColor = colors2.categorical.values[i];
          if (i < valueObj.colors.length) {
            curColor.color = valueObj.colors[i];
          }
        }
        if (valueObj.fallbackColor) {
          colors2.categorical.fallback = valueObj.fallbackColor;
        } else {
          colors2.categorical.fallback = valueObj.colors[0];
        }
      }
      if (colors2.type === 'gradient') {
        for (let i = 0; i < colors2.gradient.values.length; i++) {
          const curColor = colors2.gradient.values[i];
          if (i < valueObj.colors.length) {
            curColor.color = valueObj.colors[i];
          }
        }
      }
      if (colors2.type === 'range') {
        for (let i = 0; i < colors2.range.colors.length; i++) {
          if (i < valueObj.colors.length) {
            colors2.range.colors[i] = valueObj.colors[i];
          }
        }
        if (valueObj.fallbackColor) {
          colors2.range.fallback = valueObj.fallbackColor;
        } else {
          colors2.range.fallback = valueObj.colors[0];
        }
      }
      if (colors2.type === 'continuous') {
        for (let i = 0; i < colors2.continuous.colors.length; i++) {
          if (i < valueObj.colors.length) {
            colors2.continuous.colors[i] = valueObj.colors[i];
          }
        }
      }

      break;
    //content.typeSpecific.updateOptions.autoUpdateVisual = JSON.parse(JSON.stringify(templateValue.value));

    default:
      console.log('[Template] - ERROR MISSING IMPLEMENTATION FOR: ' + valueId);
      break;
  }
  return content;
};

/**
 * generates Template Values from content
 * @param  valueId [description]
 * @return         [description]
 */
const generateValueFromContent = (content, template, valueId) => {
  switch (valueId) {
    case 'chartlinestyle':
      template.templateValues[valueId] = {
        id: valueId,
        value: JSON.parse(JSON.stringify(content.typeSpecific.chart.lines))
      };
      break;
    case 'chartusergrid':
      template.templateValues[valueId] = {
        id: valueId,
        value: JSON.parse(JSON.stringify(content.typeSpecific.chart.gridUser))
      };
      break;
    case 'chartdonutsettings':
      template.templateValues[valueId] = {
        id: valueId,
        value: JSON.parse(JSON.stringify(content.typeSpecific.chart.donut))
      };
      break;
    case 'mapviewport':
      //typeSpecific.map.options.flyTo
      //typeSpecific.map.options.fitBounds
      //typeSpecific.map.options.maxBounds
      //bboxAutoSet kann true sein -> aber user not changed -> deleten wenn set
      if (
        content.typeSpecific.map &&
        content.typeSpecific.map &&
        content.typeSpecific.map.sources &&
        content.typeSpecific.map.sources.length > 0 &&
        content.typeSpecific.map.sources[0] &&
        content.typeSpecific.map.sources[0].mappingId
      ) {
        const saveValue = {
          mappingId: content.typeSpecific.map.sources[0].mappingId,
          type: undefined,
          value: { startViewport: undefined, maxViewport: undefined, maxViewportIsLimit: undefined, withStartAnimation: undefined }
        };
        let startViewport = undefined;
        //is there a startviewport
        if (content.typeSpecific.map.options.startViewport) {
          startViewport = JSON.parse(JSON.stringify(content.typeSpecific.map.options.startViewport));
        }
        let maxViewport = undefined;
        //is there a maxviewport - always has to be one!
        if (content.typeSpecific.map.options.maxViewport) {
          maxViewport = JSON.parse(JSON.stringify(content.typeSpecific.map.options.maxViewport));
        }
        if (startViewport) {
          saveValue.type = 'startViewport';
          saveValue.value.startViewport = startViewport;
        } else {
          saveValue.type = 'maxViewport';
        }
        saveValue.value.maxViewport = maxViewport;
        saveValue.value.maxViewportIsLimit = JSON.parse(JSON.stringify(content.typeSpecific.map.options.maxViewportIsLimit));
        saveValue.value.withStartAnimation = JSON.parse(JSON.stringify(content.typeSpecific.map.options.withStartAnimation));

        template.templateValues[valueId] = {
          id: valueId,
          value: saveValue
        };
      } else {
        template.templateValues[valueId] = {
          id: valueId,
          value: { type: 'nothing' }
        };
      }
      break;
    case 'chartlabelaxisenabled':
      template.templateValues[valueId] = {
        id: valueId,
        value: JSON.parse(JSON.stringify(content.typeSpecific.chart.axis.labelAxis.enabled))
      };
      break;
    case 'chartvalueaxisenabled':
      template.templateValues[valueId] = {
        id: valueId,
        value: JSON.parse(JSON.stringify(content.typeSpecific.chart.axis.valueAxis.enabled))
      };
      break;
    case 'chartgrid':
      template.templateValues[valueId] = {
        id: valueId,
        value: {
          grid: JSON.parse(JSON.stringify(content.typeSpecific.chart.grid)),
          gridZero: JSON.parse(JSON.stringify(content.typeSpecific.chart.gridZero)),
          scaleZero: JSON.parse(JSON.stringify(content.typeSpecific.chart.scaleZero))
        }
      };
      break;
    case 'chartvaluecolors':
      template.templateValues[valueId] = {
        id: valueId,
        value: {
          darkColor: JSON.parse(JSON.stringify(content.typeSpecific.chart.values.darkColor)),
          lightColor: JSON.parse(JSON.stringify(content.typeSpecific.chart.values.lightColor))
        }
      };
      break;
    case 'visualizationadvancedtooltip':
      const advancedTooltipValue = {
        enabled: JSON.parse(JSON.stringify(content.typeSpecific.advancedTooltip.enabled)),
        type: JSON.parse(JSON.stringify(content.typeSpecific.advancedTooltip.type)),
        event: JSON.parse(JSON.stringify(content.typeSpecific.advancedTooltip.event)),
        position: JSON.parse(JSON.stringify(content.typeSpecific.advancedTooltip.position)),
        style: JSON.parse(JSON.stringify(content.typeSpecific.advancedTooltip.style))
      };
      template.templateValues[valueId] = {
        id: valueId,
        value: advancedTooltipValue
      };
      break;
    case 'atlaslayout':
      template.templateValues[valueId] = {
        id: valueId,
        value: JSON.parse(JSON.stringify(content.typeSpecific.layout))
      };
      break;
    case 'nodatamessage':
      template.templateValues[valueId] = {
        id: valueId,
        value: JSON.parse(JSON.stringify(content.typeSpecific.noDataMessages))
      };
      break;
    case 'visuallayout':
      template.templateValues[valueId] = {
        id: valueId,
        value: JSON.parse(JSON.stringify(content.typeSpecific.layout))
      };
      break;
    case 'maptype':
      template.templateValues[valueId] = {
        id: valueId,
        value: JSON.parse(JSON.stringify(content.typeSpecific.map.options.displayType))
      };
      break;
    case 'bubbleoutlineswidth':
      template.templateValues[valueId] = {
        id: valueId,
        value: JSON.parse(JSON.stringify(content.typeSpecific.map.options.outlinesWidth))
      };
      break;
    case 'extrudeoptions':
      template.templateValues[valueId] = {
        id: valueId,
        value: JSON.parse(JSON.stringify(content.typeSpecific.map.options.extrude))
      };
      break;
    case 'maphhover':
      template.templateValues[valueId] = {
        id: valueId,
        value: JSON.parse(JSON.stringify(content.typeSpecific.map.options.hover))
      };
      break;
    case 'maprenderworldcopies':
      template.templateValues[valueId] = {
        id: valueId,
        value: JSON.parse(JSON.stringify(content.typeSpecific.map.options.renderWorldCopies))
      };
      break;
    case 'maphighlights':
      template.templateValues[valueId] = {
        id: valueId,
        value: JSON.parse(JSON.stringify(content.typeSpecific.map.options.highlight))
      };
      break;
    case 'basemapanimationcurve':
      template.templateValues[valueId] = {
        id: valueId,
        value: JSON.parse(JSON.stringify(content.typeSpecific.map.options.animationCurve))
      };
      break;
    case 'basemapanimationspeed':
      template.templateValues[valueId] = {
        id: valueId,
        value: JSON.parse(JSON.stringify(content.typeSpecific.map.options.animationSpeed))
      };
      break;
    case 'basemapbearing':
      template.templateValues[valueId] = {
        id: valueId,
        value: JSON.parse(JSON.stringify(content.typeSpecific.map.options.bearing))
      };
      break;
    case 'mapattributionstyle':
      template.templateValues[valueId] = {
        id: valueId,
        value: JSON.parse(JSON.stringify(content.typeSpecific.map.attributions.font))
      };
      break;
    case 'basemappitch':
      template.templateValues[valueId] = {
        id: valueId,
        value: JSON.parse(JSON.stringify(content.typeSpecific.map.options.pitch))
      };
      break;
    case 'bubbleoptions':
      template.templateValues[valueId] = {
        id: valueId,
        value: JSON.parse(JSON.stringify(content.typeSpecific.map.options.bubbles))
      };
      break;
    case 'chartstyle':
      template.templateValues[valueId] = {
        id: valueId,
        value: JSON.parse(JSON.stringify(content.typeSpecific.chart.style))
      };
      break;
    case 'chartlegendenabled':
      template.templateValues[valueId] = {
        id: valueId,
        value: JSON.parse(JSON.stringify(content.typeSpecific.chart.legend.enabled))
      };
      break;
    case 'chartlegendposition':
      template.templateValues[valueId] = {
        id: valueId,
        value: JSON.parse(JSON.stringify(content.typeSpecific.chart.legend.position))
      };
      break;
    case 'chartlegendscrollable':
      template.templateValues[valueId] = {
        id: valueId,
        value: JSON.parse(JSON.stringify(content.typeSpecific.chart.legend.scrollable))
      };
      break;
    case 'chartlegendscrollheight':
      template.templateValues[valueId] = {
        id: valueId,
        value: JSON.parse(JSON.stringify(content.typeSpecific.chart.legend.scrollHeight))
      };
      break;
    case 'reportactivechapterwidth':
      template.templateValues[valueId] = {
        id: valueId,
        value: JSON.parse(JSON.stringify(content.typeSpecific.report.activeChapterWidth))
      };
      break;
    case 'reportchapterswidth':
      template.templateValues[valueId] = {
        id: valueId,
        value: JSON.parse(JSON.stringify(content.typeSpecific.report.chaptersWidth))
      };
      break;
    case 'reportheaderwidth':
      template.templateValues[valueId] = {
        id: valueId,
        value: JSON.parse(JSON.stringify(content.typeSpecific.report.headerWidth))
      };
      break;
    case 'reportactivechapterbackground':
      template.templateValues[valueId] = {
        id: valueId,
        value: JSON.parse(JSON.stringify(content.typeSpecific.report.activeChapterBackground))
      };
      break;
    case 'reportprogressbarcolor':
      template.templateValues[valueId] = {
        id: valueId,
        value: JSON.parse(JSON.stringify(content.typeSpecific.report.progressBarColor))
      };
      break;
    case 'reportswitchtextvisualizations':
      template.templateValues[valueId] = {
        id: valueId,
        value: JSON.parse(JSON.stringify(content.typeSpecific.report.switchTexts.visualizations))
      };
      break;
    case 'reportswitchtextvisual':
      template.templateValues[valueId] = {
        id: valueId,
        value: JSON.parse(JSON.stringify(content.typeSpecific.report.switchTexts.visual))
      };
      break;
    case 'reportswitchtextdescription':
      template.templateValues[valueId] = {
        id: valueId,
        value: JSON.parse(JSON.stringify(content.typeSpecific.report.switchTexts.description))
      };
      break;
    case 'reportswitchbackgroundcolor':
      template.templateValues[valueId] = {
        id: valueId,
        value: JSON.parse(JSON.stringify(content.typeSpecific.report.switchStyle.backgroundColor))
      };
      break;
    case 'reportpaginationstyle':
      template.templateValues[valueId] = {
        id: valueId,
        value: JSON.parse(JSON.stringify(content.typeSpecific.report.paginationStyle))
      };
      break;
    case 'reportpaginationbackgroundcolor':
      template.templateValues[valueId] = {
        id: valueId,
        value: JSON.parse(JSON.stringify(content.typeSpecific.report.paginationColor))
      };
      break;
    case 'reportpaginationtype':
      template.templateValues[valueId] = {
        id: valueId,
        value: JSON.parse(JSON.stringify(content.typeSpecific.report.paginationType))
      };
      break;
    case 'reportlogo':
      template.templateValues[valueId] = {
        id: valueId,
        value: JSON.parse(JSON.stringify(content.typeSpecific.report.logo))
      };
      break;
    /*
    case 'publishsettingspublicprivate':
      template.templateValues[valueId] = {
        id: valueId,
        value: JSON.parse(JSON.stringify(content.isPublic))
      };
      break;
    case 'reportpublishsettingspublicprivate':
      template.templateValues[valueId] = {
        id: valueId,
        value: JSON.parse(JSON.stringify(content.isPublic))
      };
      break;
    case 'atlaspublishsettingspublicprivate':
      template.templateValues[valueId] = {
        id: valueId,
        value: JSON.parse(JSON.stringify(content.isPublic))
      };
      break;
    */
    case 'chartinvisualfilterstyle':
      template.templateValues[valueId] = {
        id: valueId,
        value: JSON.parse(JSON.stringify(content.typeSpecific.style.inVisualFilter))
      };
      break;
    case 'reportdescriptionstyle':
      template.templateValues[valueId] = {
        id: valueId,
        value: JSON.parse(JSON.stringify(content.typeSpecific.style.description))
      };
      break;
    case 'atlastitlestyle':
      template.templateValues[valueId] = {
        id: valueId,
        value: JSON.parse(JSON.stringify(content.typeSpecific.style.title))
      };
      break;
    case 'reporttitlestyle':
      template.templateValues[valueId] = {
        id: valueId,
        value: JSON.parse(JSON.stringify(content.typeSpecific.style.title))
      };
      break;
    case 'atlassubtitlestyle':
      template.templateValues[valueId] = {
        id: valueId,
        value: JSON.parse(JSON.stringify(content.typeSpecific.style.subTitle))
      };
      break;
    case 'reportsubtitlestyle':
      template.templateValues[valueId] = {
        id: valueId,
        value: JSON.parse(JSON.stringify(content.typeSpecific.style.subTitle))
      };
      break;
    case 'atlasbackground':
      template.templateValues[valueId] = {
        id: valueId,
        value: JSON.parse(JSON.stringify(content.typeSpecific.style.background))
      };
      break;
    case 'visualtitlestyle':
      template.templateValues[valueId] = {
        id: valueId,
        value: JSON.parse(JSON.stringify(content.typeSpecific.style.title))
      };
      break;
    case 'visualdescriptionbackground':
      template.templateValues[valueId] = {
        id: valueId,
        value: JSON.parse(JSON.stringify(content.typeSpecific.style.descriptionBackground))
      };
      break;
    case 'visualdescriptionstyle':
      template.templateValues[valueId] = {
        id: valueId,
        value: JSON.parse(JSON.stringify(content.typeSpecific.style.description))
      };
      break;
    case 'visualsourcestyle':
      template.templateValues[valueId] = {
        id: valueId,
        value: JSON.parse(JSON.stringify(content.typeSpecific.style.source))
      };
      break;
    case 'visualsubtitlestyle':
      template.templateValues[valueId] = {
        id: valueId,
        value: JSON.parse(JSON.stringify(content.typeSpecific.style.subTitle))
      };
      break;
    case 'visualbackground':
      template.templateValues[valueId] = {
        id: valueId,
        value: JSON.parse(JSON.stringify(content.typeSpecific.style.background))
      };
      break;
    case 'basemapstyle':
      template.templateValues[valueId] = {
        id: valueId,
        value: JSON.parse(JSON.stringify(content.typeSpecific.map.options.style))
      };
      break;
    case 'choroopacity':
      template.templateValues[valueId] = {
        id: valueId,
        value: JSON.parse(JSON.stringify(content.typeSpecific.map.options.opacity))
      };
      break;
    case 'choroshowallsourcefeatures':
      template.templateValues[valueId] = {
        id: valueId,
        value: JSON.parse(JSON.stringify(content.typeSpecific.map.options.showAllSourceFeatures))
      };
      break;
    case 'chorooutlinescolor':
      template.templateValues[valueId] = {
        id: valueId,
        value: JSON.parse(JSON.stringify(content.typeSpecific.map.options.outlinesColor))
      };
      break;
    case 'choroemptyfeaturescolor':
      template.templateValues[valueId] = {
        id: valueId,
        value: JSON.parse(JSON.stringify(content.typeSpecific.map.options.emptyFeaturesColor))
      };
      break;
    case 'mapoptionszoombuttons':
      template.templateValues[valueId] = {
        id: valueId,
        value: JSON.parse(JSON.stringify(content.typeSpecific.map.options.zoomButtons))
      };
      break;
    case 'mapoptionslang':
      template.templateValues[valueId] = {
        id: valueId,
        value: JSON.parse(JSON.stringify(content.typeSpecific.map.options.lang))
      };
      break;
    case 'mapoptionsuserinteractions':
      template.templateValues[valueId] = {
        id: valueId,
        value: JSON.parse(JSON.stringify(content.typeSpecific.map.options.interactions))
      };
      break;
    case 'mapoptionsscale':
      template.templateValues[valueId] = {
        id: valueId,
        value: JSON.parse(JSON.stringify(content.typeSpecific.map.options.scale))
      };
      break;
    case 'mapoptionssearchdetails':
      const value = {
        placeholder: JSON.parse(JSON.stringify(content.typeSpecific.map.search.placeholder)),
        keepCurrentMapZoom: JSON.parse(JSON.stringify(content.typeSpecific.map.search.keepCurrentMapZoom)),
        animationSpeed: JSON.parse(JSON.stringify(content.typeSpecific.map.search.animationSpeed)),
        animationCurve: JSON.parse(JSON.stringify(content.typeSpecific.map.search.animationCurve))
      };
      template.templateValues[valueId] = {
        id: valueId,
        value: value
      };
      break;
    case 'mapoptionssearch':
      template.templateValues[valueId] = {
        id: valueId,
        value: JSON.parse(JSON.stringify(content.typeSpecific.map.options.enableSearch))
      };
      break;
    case 'maplegenddefaultclosed':
      template.templateValues[valueId] = {
        id: valueId,
        value: JSON.parse(JSON.stringify(content.typeSpecific.map.legend.closed))
      };
      break;
    case 'maplegendbodystyle':
      template.templateValues[valueId] = {
        id: valueId,
        value: JSON.parse(JSON.stringify(content.typeSpecific.map.legend.valueStyle))
      };
      break;
    case 'maplegendheaderstyle':
      template.templateValues[valueId] = {
        id: valueId,
        value: JSON.parse(JSON.stringify(content.typeSpecific.map.legend.titleStyle))
      };
      break;
    case 'maplegendtype':
      template.templateValues[valueId] = {
        id: valueId,
        value: JSON.parse(JSON.stringify(content.typeSpecific.map.legend.type))
      };
      break;
    case 'chartfontscale':
      template.templateValues[valueId] = {
        id: valueId,
        value: JSON.parse(JSON.stringify(content.typeSpecific.chart.fontScale))
      };
      break;
    case 'chartsortingenabled':
      template.templateValues[valueId] = {
        id: valueId,
        value: JSON.parse(JSON.stringify(content.typeSpecific.chart.sorting.enabled))
      };
      break;
    case 'chartbars':
      template.templateValues[valueId] = {
        id: valueId,
        value: JSON.parse(JSON.stringify(content.typeSpecific.chart.bars))
      };
      break;
    case 'chartscrollable':
      template.templateValues[valueId] = {
        id: valueId,
        value: JSON.parse(JSON.stringify(content.typeSpecific.chart.scrollable))
      };
      break;
    case 'chartanimation':
      template.templateValues[valueId] = {
        id: valueId,
        value: JSON.parse(JSON.stringify(content.typeSpecific.chart.animation))
      };
      break;
    case 'chartlegendstyle':
      template.templateValues[valueId] = {
        id: valueId,
        value: JSON.parse(JSON.stringify(content.typeSpecific.chart.legend.style))
      };
      break;
    case 'chartlabelaxistitlestyle':
      template.templateValues[valueId] = {
        id: valueId,
        value: JSON.parse(JSON.stringify(content.typeSpecific.chart.axis.labelAxis.titleStyle))
      };
      break;
    case 'chartlabelaxisvaluestyle':
      template.templateValues[valueId] = {
        id: valueId,
        value: JSON.parse(JSON.stringify(content.typeSpecific.chart.axis.labelAxis.valueStyle))
      };
      break;

    case 'chartvalueaxistitlestyle':
      template.templateValues[valueId] = {
        id: valueId,
        value: JSON.parse(JSON.stringify(content.typeSpecific.chart.axis.valueAxis.titleStyle))
      };
      break;
    case 'chartvalueaxisvaluestyle':
      template.templateValues[valueId] = {
        id: valueId,
        value: JSON.parse(JSON.stringify(content.typeSpecific.chart.axis.valueAxis.valueStyle))
      };
      break;
    case 'chartvaluestyle':
      template.templateValues[valueId] = {
        id: valueId,
        value: JSON.parse(JSON.stringify(content.typeSpecific.chart.values.style))
      };
      break;
    case 'chartvaluesenabled':
      template.templateValues[valueId] = {
        id: valueId,
        value: JSON.parse(JSON.stringify(content.typeSpecific.chart.values.enabled))
      };
      break;
    case 'chartvalueposition':
      template.templateValues[valueId] = {
        id: valueId,
        value: JSON.parse(JSON.stringify(content.typeSpecific.chart.values.position))
      };
      break;
    case 'chartvaluecontrastswitch':
      template.templateValues[valueId] = {
        id: valueId,
        value: JSON.parse(JSON.stringify(content.typeSpecific.chart.values.lightnessThreshold))
      };
      break;
    case 'tooltiptitlestyle':
      template.templateValues[valueId] = {
        id: valueId,
        value: JSON.parse(JSON.stringify(content.typeSpecific.tooltip.titleStyle))
      };
      break;
    case 'tooltipvaluestyle':
      template.templateValues[valueId] = {
        id: valueId,
        value: JSON.parse(JSON.stringify(content.typeSpecific.tooltip.valueStyle))
      };
      break;
    case 'tooltipcontentstyle':
      template.templateValues[valueId] = {
        id: valueId,
        value: JSON.parse(JSON.stringify(content.typeSpecific.tooltip.contentStyle))
      };
      break;
    case 'embedviewbreakpoints':
      template.templateValues[valueId] = {
        id: valueId,
        value: JSON.parse(JSON.stringify(content.typeSpecific.style.breakPoints))
      };
      break;
    case 'reportembedviewbreakpoints':
      template.templateValues[valueId] = {
        id: valueId,
        value: JSON.parse(JSON.stringify(content.typeSpecific.style.breakPoints))
      };
      break;
    case 'atlasembedviewbreakpoints':
      template.templateValues[valueId] = {
        id: valueId,
        value: JSON.parse(JSON.stringify(content.typeSpecific.style.breakPoints))
      };
      break;
    case 'embedviewsettings':
      template.templateValues[valueId] = {
        id: valueId,
        value: JSON.parse(JSON.stringify(content.typeSpecific.embed))
      };
      break;
    case 'reportembedviewsettings':
      template.templateValues[valueId] = {
        id: valueId,
        value: JSON.parse(JSON.stringify(content.typeSpecific.embed))
      };
      break;
    case 'atlasembedviewsettings':
      template.templateValues[valueId] = {
        id: valueId,
        value: JSON.parse(JSON.stringify(content.typeSpecific.embed))
      };
      break;
    case 'publishsettingsupdatenotification':
      template.templateValues[valueId] = {
        id: valueId,
        value: JSON.parse(JSON.stringify(content.typeSpecific.updateOptions.updateNotification))
      };
      break;
    case 'atlaspublishsettingsupdatenotification':
      template.templateValues[valueId] = {
        id: valueId,
        value: JSON.parse(JSON.stringify(content.typeSpecific.updateOptions.updateNotification))
      };
      break;
    case 'reportpublishsettingsupdatenotification':
      template.templateValues[valueId] = {
        id: valueId,
        value: JSON.parse(JSON.stringify(content.typeSpecific.updateOptions.updateNotification))
      };
      break;
    case 'publishsettingsautoupdate':
      template.templateValues[valueId] = {
        id: valueId,
        value: JSON.parse(JSON.stringify(content.typeSpecific.updateOptions.autoUpdateVisual))
      };
      break;
    case 'atlaspublishsettingsautoupdate':
      template.templateValues[valueId] = {
        id: valueId,
        value: JSON.parse(JSON.stringify(content.typeSpecific.updateOptions.autoUpdateVisual))
      };
      break;
    case 'reportpublishsettingsautoupdate':
      template.templateValues[valueId] = {
        id: valueId,
        value: JSON.parse(JSON.stringify(content.typeSpecific.updateOptions.autoUpdateVisual))
      };
      break;
    case 'reportbackground':
      template.templateValues[valueId] = {
        id: valueId,
        value: JSON.parse(JSON.stringify(content.typeSpecific.style.background))
      };
      break;
    case 'reportvisualtitlestlye':
      template.templateValues[valueId] = {
        id: valueId,
        value: JSON.parse(JSON.stringify(content.typeSpecific.report.visualDescriptionTitle))
      };
      break;
    case 'reportvisualdescriptionstlye':
      template.templateValues[valueId] = {
        id: valueId,
        value: JSON.parse(JSON.stringify(content.typeSpecific.report.visualDescription))
      };
      break;
    case 'reporttogglebuttonstyle':
      template.templateValues[valueId] = {
        id: valueId,
        value: JSON.parse(JSON.stringify(content.typeSpecific.report.switchFont))
      };
      break;

    case 'visualcolor':
      //get the color values from current colo2 objects
      const { colors2 } = content.typeSpecific.style;
      const valueObj = {
        type: colors2.type,
        fallbackColor: undefined,
        colors: colors2.activeColors
      };
      /*
      if (colors2.type === 'solid') {
        valueObj.colors.push(colors2.solid);
      }*/
      if (colors2.type === 'categorical') {
        /*
        for (const color of colors2.categorical.values) {
          valueObj.colors.push(color.color);
        }*/
        valueObj.fallbackColor = colors2.categorical.fallback;
      }
      /*
      if (colors2.type === 'gradient') {
        for (const color of colors2.gradient.values) {
          valueObj.colors.push(color.color);
        }
      }*/
      if (colors2.type === 'range') {
        /*
        for (const color of colors2.range.colors) {
          valueObj.colors.push(color);
        }*/
        valueObj.fallbackColor = colors2.range.fallback;
      }
      if (colors2.type === 'continuous') {
        /*
        for (const color of colors2.continuous.colors) {
          valueObj.colors.push(color);
        }*/
      }
      template.templateValues[valueId] = {
        id: valueId,
        value: JSON.parse(JSON.stringify(valueObj))
      };
      break;

    default:
      console.log('[Template] - ERROR MISSING IMPLEMENTATION FOR VALUE GENERATION : ' + valueId);
      break;
  }
  return template;
};

/**
 * overrides or adds values in toUpdateTemplate with the values from template
 * function chagnes toUpdateTemplate in place
 * @param   template          holds the template values that will be ovverriden in template
 * @param   toUpdateTemplate  template values are ovveriden
 */
export const mergeTemplates = (template, toUpdateTemplate) => {
  for (const templateValueId of Object.keys(template.templateValues)) {
    const templateValue = JSON.parse(JSON.stringify(template.templateValues[templateValueId]));
    toUpdateTemplate.templateValues[templateValueId] = templateValue;
  }
};

export const getAmountofSelectedTemplateValues = (template, templateConfiguration) => {
  const selectedTemplateValueIds = [];
  for (const section of templateConfiguration) {
    getSelectedTemplateValueIdsForSectionandChildren(section, selectedTemplateValueIds);
  }
  return selectedTemplateValueIds.length;
};

/**
 * only returns a template with selected From TemplateConfiguration
 * returns new Template Object
 * @param  template                           a template
 * @param  templateConfiguration              template Configuration
 * @return                                     [description]
 */
export const reduceTemplateValuesToSelected = (template, templateConfiguration) => {
  const selectedTemplateValueIds = [];
  for (const section of templateConfiguration) {
    getSelectedTemplateValueIdsForSectionandChildren(section, selectedTemplateValueIds);
  }
  const newTemplate = JSON.parse(JSON.stringify(template));
  newTemplate.templateValues = {};
  for (const valueId of selectedTemplateValueIds) {
    newTemplate.templateValues[valueId] = template.templateValues[valueId];
  }
  return newTemplate;
};

/**
 * applies all template values that are selected in the template
 * Configuration to a content item
 */
export const applyTemplateToContent = (content, template, templateConfiguration) => {
  const selectedTemplateValueIds = [];
  for (const section of templateConfiguration) {
    getSelectedTemplateValueIdsForSectionandChildren(section, selectedTemplateValueIds);
  }
  if (selectedTemplateValueIds.length > 0) {
    for (const templateValueId of selectedTemplateValueIds) {
      //console.log('[Templates] - applying Value: ' + templateValueId);
      applyValueToContent(content, template, templateValueId);
    }
  }
  return content;
};

const getSelectedTemplateValueIdsForSectionandChildren = (section, currentSelected) => {
  if (section.enabled) {
    for (const value of section.templateValues) {
      if (value.enabled && value.selected) {
        currentSelected.push(value.id);
      }
    }
    for (const subsection of section.sections) {
      getSelectedTemplateValueIdsForSectionandChildren(subsection, currentSelected);
    }
  }
  return currentSelected;
};

export const applySectionSelectionForChildren = (section, selected) => {
  if (section.enabled) {
    section.selected = selected;
    for (const value of section.templateValues) {
      if (value.enabled) {
        value.selected = section.selected;
      }
    }
    for (const subsection of section.sections) {
      applySectionSelectionForChildren(subsection, selected);
    }
  }
  return section;
};

/**
 * helper function that disables section and Subsections recursively
 * sets display opened status to false on default
 * @param  section               a section object
 * @param  disabledReason        string reason why this section is disabled or not
 * @param  enabled               boolean wether it is enabled or disabled ( enabled = false)
 * @return section with disabled subsections
 */
const enabledisableSectionAndSubsections = (section, disabledReason, enabled) => {
  section.enabled = enabled;
  section.selected = enabled;
  section.displayOpened = false;
  section.disabledReason = disabledReason;
  for (const value of section.templateValues) {
    value.enabled = enabled;
    value.selected = enabled;
    value.disabledReason = disabledReason;
  }
  for (const subSection of section.sections) {
    enabledisableSectionAndSubsections(subSection, disabledReason, enabled);
  }
  return section;
};

const checkSectionAndSubsectionsForValueExistsinTemplate = (section, template, disabledReason) => {
  if (section.enabled) {
    for (const value of section.templateValues) {
      if (!template.templateValues[value.id]) {
        value.selected = false;
        value.enabled = false;
        value.disabledReason = disabledReason;
      }
    }
    //test subsections
    for (const subSection of section.sections) {
      checkSectionAndSubsectionsForValueExistsinTemplate(subSection, template, disabledReason);
    }
  }
  return section;
};

/**
 * generates a template and a template configuration from an existing content item
 *
 */
export const generateNewTemplateAndConfigurationFromContent = content => {
  const newTemplate = {
    version: 7,
    label: 'New template',
    description: 'Describe your template',
    created_at: new Date(),
    updated_at: new Date(),
    id: uuid(),
    templateValues: {}
  };
  const newTemplateConfiguration = JSON.parse(JSON.stringify(SECTIONS));
  //which sections are enabled for the content type?
  setSectionsDisabledDependingOnContenType(content, newTemplateConfiguration);
  //get the potential Value IDs we wann fill
  const selectedTemplateValueIds = [];
  for (const section of newTemplateConfiguration) {
    getSelectedTemplateValueIdsForSectionandChildren(section, selectedTemplateValueIds);
  }
  //try generate values of the content and ids that are selected
  if (selectedTemplateValueIds.length > 0) {
    for (const valueId of selectedTemplateValueIds) {
      generateValueFromContent(content, newTemplate, valueId);
    }
  }
  return { template: newTemplate, templateConfiguration: newTemplateConfiguration };
};
const setSectionsDisabledDependingOnContenType = (content, templateConfiguration) => {
  if (ParentTypes.includes(content.type)) {
    for (const section of templateConfiguration) {
      if (section.value !== content.type) {
        enabledisableSectionAndSubsections(section, 'Not supported in ' + content.type, false);
      } else {
        enabledisableSectionAndSubsections(section, '', true);
      }
    }
  } else {
    //disable report and atlas
    for (const section of templateConfiguration) {
      if (section.value === 'atlas' || section.value === 'report') {
        enabledisableSectionAndSubsections(section, 'Not supported in ' + content.type, false);
      } else {
        enabledisableSectionAndSubsections(section, '', true);
      }
    }
  }
};

/**
 * generates a Template Configuration ( what is enabled what can be selected)
 * given a template and a content
 */
export const generateTemplateConfiguration = (content, template) => {
  const templateConfiguration = JSON.parse(JSON.stringify(SECTIONS));
  //disable sections based on content type
  setSectionsDisabledDependingOnContenType(content, templateConfiguration);
  //go through every value that is enabled and check if it exists in the template
  for (const section of templateConfiguration) {
    checkSectionAndSubsectionsForValueExistsinTemplate(section, template, 'Not supported in ' + template.label);
  }

  return templateConfiguration;
};
