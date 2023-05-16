import { all, spread } from 'axios';
import { getExtent, getTropicalExtent } from 'services/analysis-cached';
import OTFAnalysis from 'services/otf-analysis';

import { shouldQueryPrecomputedTables } from 'components/widgets/utils/helpers';
import {
  POLITICAL_BOUNDARIES_DATASET,
  FOREST_EXTENT_DATASET,
  TROPICAL_TREE_COVER,
} from 'data/datasets';
import {
  DISPUTED_POLITICAL_BOUNDARIES,
  POLITICAL_BOUNDARIES,
  FOREST_EXTENT,
  TREE_COVER,
  TROPICAL_TREE_COVER_METERS,
} from 'data/layers';

import getWidgetProps from './selectors';

const getOTFAnalysis = async (params) => {
  const analysis = new OTFAnalysis(params.geostore.id);
  analysis.setDates({
    startDate: params.startDate,
    endDate: params.endDate,
  });
  analysis.setData(['areaHa', 'extent'], params);

  return analysis.getData().then((response) => {
    const { areaHa, extent } = response;
    const totalArea = areaHa?.[0]?.area__ha;
    const totalCover = extent?.[0]?.area__ha;

    return {
      totalArea,
      totalCover,
      cover: totalCover,
      plantations: 0,
    };
  });
};

export default {
  widget: 'treeCover',
  title: {
    default: 'Tree Cover by type in {location}',
    global: 'Global tree cover by type',
    withPlantations: 'Forest cover by type in {location}',
  },
  alerts: [
    {
      id: 'tree-cover-alert-1',
      text:
        'Datasets used here use different methodologies to measure tree cover as compared to the Tree cover 2000/2010 (UMD) data. Read [our blog](https://www.globalforestwatch.org/blog/data-and-research/tree-cover-data-comparison/) for more information.”',
      visible: [
        'global',
        'country',
        'geostore',
        'aoi',
        'wdpa',
        'use',
        'dashboard',
      ],
    },
  ],
  sentence: {
    globalInitial:
      'As of {year}, {percentage} of {location} land cover was {threshold} tree cover.',
    // TODO: with indicators (global and others)
    globalWithIndicator:
      'As of {year}, {percentage} of {location} tree cover was in {indicator}.',
    initial:
      'As of {year}, {percentage} of {location} was {threshold} tree cover.',

    hasPlantations: ' was natural forest cover.',
    noPlantations: ' was tree cover.',
    hasPlantationsInd: "<b>'s</b> natural forest was in {indicator}.",
    noPlantationsInd: "<b>'s</b> tree cover was in {indicator}.",
  },
  metaKey: {
    2000: 'widget_tree_cover',
    2010: 'widget_tree_cover',
    2020: 'wri_trees_in_mosaic_landscapes',
  },
  chartType: 'pieChart',
  large: false,
  colors: 'extent',
  source: 'gadm',
  dataType: 'extent',
  categories: ['summary', 'land-cover'],
  types: ['global', 'country', 'geostore', 'aoi', 'wdpa', 'use'],
  admins: ['global', 'adm0', 'adm1', 'adm2'],
  visible: ['dashboard'],
  datasets: [
    {
      dataset: POLITICAL_BOUNDARIES_DATASET,
      layers: [DISPUTED_POLITICAL_BOUNDARIES, POLITICAL_BOUNDARIES],
      boundary: true,
    },
    {
      dataset: {
        2020: TROPICAL_TREE_COVER,
        2010: FOREST_EXTENT_DATASET,
        2000: FOREST_EXTENT_DATASET,
      },
      layers: {
        2020: TROPICAL_TREE_COVER_METERS,
        2010: FOREST_EXTENT,
        2000: TREE_COVER,
      },
    },
  ],
  sortOrder: {
    summary: 4,
    landCover: 1,
  },
  refetchKeys: ['threshold', 'decile', 'extentYear', 'landCategory'],
  pendingKeys: ['threshold', 'decile', 'extentYear'],
  settings: {
    threshold: 30,
    decile: 30,
    extentYear: 2000,
  },
  getSettingsConfig: (params) => {
    const { extentYear } = params;
    const isTropicalTreeCover = !(extentYear === 2000 || extentYear === 2010);

    return [
      {
        key: 'extentYear',
        label: 'Tree cover dataset',
        type: 'select',
        border: true,
      },
      {
        key: 'landCategory',
        label: 'Land Category',
        type: 'select',
        placeholder: 'All categories',
        clearable: true,
        border: true,
      },
      {
        key: isTropicalTreeCover ? 'decile' : 'threshold',
        label: 'Tree cover',
        type: 'mini-select',
        metaKey: 'widget_canopy_density',
      },
    ];
  },
  getData: (params) => {
    const { threshold, decile, ...filteredParams } = params;
    const { extentYear } = filteredParams;
    const isTropicalTreeCover = !(extentYear === 2000 || extentYear === 2010);
    const decileThreshold = isTropicalTreeCover ? { decile } : { threshold };
    const extentFn = isTropicalTreeCover ? getTropicalExtent : getExtent;

    if (shouldQueryPrecomputedTables(params)) {
      return all([
        extentFn({ ...filteredParams, ...decileThreshold }),
        extentFn({
          ...filteredParams,
          ...decileThreshold,
          forestType: '',
          landCategory: '',
        }),
        extentFn({
          ...filteredParams,
          ...decileThreshold,
          forestType: 'plantations',
        }),
      ]).then(
        spread((response, adminResponse, plantationsResponse) => {
          const extent = response.data && response.data.data;
          const adminExtent = adminResponse.data && adminResponse.data.data;
          const plantationsExtent =
            plantationsResponse.data && plantationsResponse.data.data;

          let totalArea = 0;
          let totalCover = 0;
          let cover = 0;
          let plantations = 0;
          let data = {};
          if (extent && extent.length) {
            // Sum values
            totalArea = adminExtent.reduce(
              (total, d) => total + d.total_area,
              0
            );
            cover = extent.reduce((total, d) => total + d.extent, 0);
            totalCover = adminExtent.reduce((total, d) => total + d.extent, 0);
            plantations = plantationsExtent.reduce(
              (total, d) => total + d.extent,
              0
            );
            data = {
              totalArea,
              totalCover,
              cover,
              plantations,
            };
          }
          return data;
        })
      );
    }

    return getOTFAnalysis(params);
  },
  getDataURL: (params) => {
    const { threshold, decile, ...filteredParams } = params;
    const { extentYear } = filteredParams;
    const isTropicalTreeCover = !(extentYear === 2000 || extentYear === 2010);
    const downloadFn = isTropicalTreeCover ? getTropicalExtent : getExtent;
    const decileThreshold = isTropicalTreeCover ? { decile } : { threshold };
    const commonParams = {
      ...filteredParams,
      ...decileThreshold,
      download: true,
    };

    const downloadArray = [
      downloadFn({ ...commonParams, forestType: null, landCategory: null }),
      downloadFn({ ...commonParams, forestType: 'plantations' }),
    ];

    if (filteredParams?.landCategory) {
      downloadArray.push(downloadFn({ ...commonParams }));
    }

    return downloadArray;
  },
  getWidgetProps,
};
