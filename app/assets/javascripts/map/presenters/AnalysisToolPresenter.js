/**
 * The AnalysisToolPresenter class for the AnalysisToolView.
 *
 * @return AnalysisToolPresenter class.
 */
define([
  'Class',
  'underscore',
  'backbone',
  'mps',
  'services/CountryService'
], function(Class, _, Backbone, mps, countryService) {

  'use strict';

  var AnalysisToolPresenter = Class.extend({

    datasets: {
      'umd_tree_loss_gain': 'umd-loss-gain',
      'forestgain': 'umd-loss-gain',
      'forma': 'forma-alerts',
      'imazon': 'imazon-alerts',
      'fires': 'nasa-active-fires',
      'modis': 'quicc-alerts'
    },

    init: function(view) {
      this.view = view;

      this.status = new (Backbone.Model.extend())({
        baselayer: null,
        analysis: null
      });

      this._subscribe();
    },

    _subscribe: function() {
      mps.subscribe('LayerNav/change', _.bind(function(layerSpec) {
        this._setBaselayer(layerSpec);
      }, this));

      mps.subscribe('Place/go', _.bind(function(place) {
        this._setBaselayer(place.layerSpec);

        if (place.params.iso !== 'ALL') {
          this._drawIso(place.params.iso);
        } else if (place.params.geom) {
          this._drawGeom(place.params.geom);
        }
      }, this));

      mps.subscribe('AnalysisTool/update-analysis', _.bind(function() {
        if (this.status.get('analysis')) {
          this.publishAnalysis(this.status.get('analysis'));
        }
      }, this));

      mps.subscribe('AnalysisResults/delete-analysis', _.bind(function() {
        this.view.deleteSelection();
        this.status.set('analysis', null);
      }, this));

      mps.subscribe('MapView/click-protected', _.bind(function(wdpaid) {
        this.publishAnalysis({wdpaid: wdpaid});
      }, this));

      mps.publish('Place/register', [this]);
    },

    /**
     * Set current baselayer from any layer change.
     */
    _setBaselayer: function(layerSpec) {
      var baselayers = layerSpec.getBaselayers();

      this.status.set('baselayer', baselayers[_.first(_.intersection(
        _.pluck(baselayers, 'slug'),
        _.keys(this.datasets)))]);

      this._setVisibility();
    },

    /**
     * Toggle hidden depending on active layers.
     */
    _setVisibility: function() {
      if (!this.status.get('baselayer')) {
        this._deleteAnalysis();
        this.view.model.set('hidden', true);
      } else {
        this.view.model.set('hidden', false);
      }
    },

    /**
     * Used by this presenter to delete analysis when the
     * current baselayer doesn't support analysis.
     */
    _deleteAnalysis: function() {
      mps.publish('AnalysisResults/delete-analysis', []);
      this.view._onClickCancel();
    },

    /**
     * Draw geom on the map and publish analysis of that geom.
     *
     * @param  {object} geom
     */
    _drawGeom: function(geom) {
      this.view.drawGeom(geom);
      this.publishAnalysis({geom: geom});
    },

    /**
     * Used by this presenter to draw a country and publish an analysis of that.
     *
     * @param  {string} iso Country iso
     */
    _drawIso: function(iso) {
      countryService.execute(iso, _.bind(function(results) {
        this.view.drawIso(results.topojson);
        this.publishAnalysis({iso: iso});
      },this));
    },

    /**
     * Publish an analysis and set the currentResource.
     */
    publishAnalysis: function(resource) {
      var data = {};

      data.dataset = this.datasets[this.status.get('baselayer').slug];

      if (resource.geom) {
        data.geojson = resource.geom;
      } else if (resource.iso) {
        data.iso = resource.iso;
      } else if (resource.wdpaid) {
        data.wdpaid = resource.wdpaid;
      }

      this.status.set('analysis', resource);
      mps.publish('AnalysisService/get', [data]);
    },

    /**
     * Generates a GEOJSON form a path.
     *
     * @param  {Array} path Array of google.maps.LatLng objects
     * @return {string} A GeoJSON string representing the path
     */
    createGeoJson: function(path) {
      var coordinates = null;

      coordinates = _.map(path, function(latlng) {
        return [
          _.toNumber(latlng.lng().toFixed(4)),
          _.toNumber(latlng.lat().toFixed(4))];
      });

      // First and last coordinate should be the same
      coordinates.push(_.first(coordinates));

      return JSON.stringify({
        'type': 'Polygon',
        'coordinates': [coordinates]
      });
    },

    /**
     * Convert a geojson into a path.
     *
     * @param  {object} geojson
     * @return {array} paths
     */
    geomToPath: function(geom) {
      var coords = JSON.parse(geom).coordinates[0];
      return _.map(coords, function(g) {
        return new google.maps.LatLng(g[1], g[0]);
      });
    },

    startDrawing: function() {
      mps.publish('AnalysisTool/start-drawing', []);
    },

    stopDrawing: function() {
      mps.publish('AnalysisTool/stop-drawing', []);
    },

    /**
     * Used by PlaceService to get the current iso/geom params.
     *
     * @return {object} iso/geom params
     */
    getPlaceParams: function() {
      var analysis = this.status.get('analysis');
      if (!analysis) {return;}
      var p = {};

      p.iso = null;
      p.geom = null;

      if (analysis.iso) {
        p.iso = analysis.iso;
      } else if (analysis.geom) {
        p.geom = encodeURIComponent(analysis.geom);
      }

      return p;
    }

  });

  return AnalysisToolPresenter;

});
