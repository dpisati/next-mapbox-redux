import { createStructuredSelector, createSelector } from 'reselect';
import isEmpty from 'lodash/isEmpty';
import groupBy from 'lodash/groupBy';
import sortBy from 'lodash/sortBy';
import moment from 'moment';

import {
  getBasemaps,
  getBasemap,
  getMapLabels,
  getMapZoom,
  getMapRoads,
  getActiveDatasetsFromState
} from 'components/map/selectors';
import {
  getActiveBoundaryDatasets,
  getAllBoundaries
} from 'components/analysis/selectors';

const selectPlanetBasemaps = state => state.planet && state.planet.data;

export const getPlanetBasemaps = createSelector(
  [selectPlanetBasemaps],
  planetBasemaps => {
    if (isEmpty(planetBasemaps)) return null;
    return sortBy(
      planetBasemaps.map(p => {
        const splitName = p.name.split('_');
        const year = parseInt(splitName[2], 10);
        const period = moment(`${year}-${splitName[3]}`).format('MMM');

        return {
          label: `${year}/${period}`,
          interval: p.interval,
          name: p.name,
          year,
          period
        };
      }),
      'year'
    ).reverse();
  }
);

export const getPlanetBasemapsByInvertal = createSelector(
  [getPlanetBasemaps],
  planetBasemaps => {
    if (isEmpty(planetBasemaps)) return null;
    const monthly = planetBasemaps.filter(m => m.interval === '1 mon');

    return {
      '1 mon': monthly
    };
  }
);

export const getPlanetBasemapsOptions = createSelector(
  [getPlanetBasemapsByInvertal],
  (planetBasemaps) => {
    if (isEmpty(planetBasemaps)) return null;
    return planetBasemaps['1 mon'];
  }
);

export const getPlanetBasemapSelected = createSelector(
  [getPlanetBasemapsOptions, getBasemap],
  (planetBasemaps, basemap) => {
    if (isEmpty(planetBasemaps)) return null;
    if (basemap.value !== 'planet') return planetBasemaps[0];

    return planetBasemaps.find(p => p.name === basemap.name);
  }
);

export const getPlanetYears = createSelector(
  [getPlanetBasemapsOptions],
  planetBasemaps => {
    if (isEmpty(planetBasemaps)) return null;
    const groupByYears = groupBy(planetBasemaps, 'year');

    return Object.keys(groupByYears).map(y => ({
      label: y,
      value: parseInt(y, 10),
      name: groupByYears[y] && groupByYears[y][0].name,
      interval: groupByYears[y] && groupByYears[y][0].interval,
      period: groupByYears[y] && groupByYears[y][0].period
    }));
  }
);

export const getPlanetYearsSelected = createSelector(
  [getPlanetYears, getBasemap],
  (planetYears, basemap) => {
    if (isEmpty(planetYears)) return null;
    if (basemap.value !== 'planet') return planetYears[0];

    return (
      planetYears.find(p => p.value === basemap.planetYear) || planetYears[0]
    );
  }
);

export const getPlanetPeriods = createSelector(
  [getPlanetBasemapsOptions, getPlanetYearsSelected],
  (planetBasemaps, yearSelected) => {
    if (isEmpty(planetBasemaps) || !yearSelected) return null;

    return planetBasemaps.filter(p => p.year === yearSelected.value).map(p => ({
      ...p,
      value: p.period,
      label: p.period,
      interval: p.interval,
      year: p.year
    }));
  }
);

export const getPlanetPeriodSelected = createSelector(
  [getPlanetPeriods, getBasemap],
  (planetPeriods, basemap) => {
    if (isEmpty(planetPeriods)) return null;
    if (basemap.value !== 'planet') return planetPeriods[0];

    return planetPeriods.find(p => p.value === basemap.period);
  }
);

export const getLandsatYears = createSelector([getBasemaps], basemaps =>
  basemaps.landsat.availableYears.map(y => ({
    label: y,
    value: y
  }))
);

export const getLabelsOptions = createSelector([], () => [
  {
    label: 'Show labels',
    value: 'showLabels'
  },
  {
    label: 'Hide labels',
    value: 'hideLabels'
  }
]);

export const getLabelSelected = createSelector(
  [getLabelsOptions, getMapLabels],
  (options, labelsActive) => (labelsActive ? options[0] : options[1])
);

export const getRoadsOptions = createSelector([], () => [
  {
    label: 'Hide Roads',
    value: false
  },
  {
    label: 'Show Roads',
    value: true
  }
]);

export const getRoadsSelected = createSelector(
  [getRoadsOptions, getMapRoads],
  (options, showRoads) => options.find(o => showRoads === o.value)
);

export const getBasemapsProps = createStructuredSelector({
  activeDatasets: getActiveDatasetsFromState,
  mapZoom: getMapZoom,
  activeBasemap: getBasemap,
  boundaries: getAllBoundaries,
  activeBoundaries: getActiveBoundaryDatasets,
  basemaps: getBasemaps,
  labelSelected: getLabelSelected,
  labels: getLabelsOptions,
  landsatYears: getLandsatYears,
  roads: getRoadsOptions,
  roadsSelected: getRoadsSelected,
  planetBasemapSelected: getPlanetBasemapSelected,
  planetYears: getPlanetYears,
  planetYearSelected: getPlanetYearsSelected,
  planetPeriods: getPlanetPeriods,
  planetPeriodSelected: getPlanetPeriodSelected
});