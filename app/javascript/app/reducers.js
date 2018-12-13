/* eslint-disable import/first */
import { handleModule } from 'redux-tools';

// COMPONENTS

// Dashboards
import { reduxModule as Widgets } from 'components/widgets';
import { reduxModule as Header } from 'pages/dashboards/header';

// Maps
import { reduxModule as MapOld } from 'components/map';

// Map components
import { reduxModule as Analysis } from 'components/maps/components/analysis';
import { reduxModule as RecentImagery } from 'components/maps/main-map/components/recent-imagery';
import { reduxModule as Draw } from 'components/maps/map/components/draw';
import { reduxModule as Popup } from 'components/maps/map/components/popup';
import { reduxModule as MapTour } from 'components/maps/main-map/components/map-tour';

// Projects (About and SGF)
import { reduxModule as MapMenu } from 'components/maps/components/menu';
import { reduxModule as Impacts } from 'pages/about/section-impacts';
import { reduxModule as AboutProjects } from 'pages/about/section-projects';
import { reduxModule as SGFProjects } from 'pages/sgf/section-projects';

// Modals
import { reduxModule as ModalMeta } from 'components/modals/meta';
import { reduxModule as Share } from 'components/modals/share';
import { reduxModule as ModalVideo } from 'components/modals/video';
import { reduxModule as AboutModal } from 'pages/about/section-projects/section-projects-modal';
import { reduxModule as SGFModal } from 'pages/sgf/section-projects/section-projects-modal';
import { reduxModule as SourcesModal } from 'components/modals/sources';
import { reduxModule as SubscribeModal } from 'components/modals/subscribe';
import { reduxModule as WelcomeModal } from 'components/modals/welcome';

// Forms
import { reduxModule as Contact } from 'pages/about/section-contact';

// Providers
import { reduxModule as CountryDataProvider } from 'providers/country-data-provider';
import { reduxModule as GeostoreProvider } from 'providers/geostore-provider';
import { reduxModule as WhitelistsProvider } from 'providers/whitelists-provider';
import { reduxModule as DatasetsProvider } from 'providers/datasets-provider';
import { reduxModule as LatestProvider } from 'providers/latest-provider';
import { reduxModule as MyGFWProvider } from 'providers/mygfw-provider';
import { reduxModule as PTWProvider } from 'providers/ptw-provider';
import { reduxModule as LayerSpecProvider } from 'providers/layerspec-provider';

// Component Reducers
const componentsReducers = {
  // map & dashboards
  analysis: handleModule(Analysis),
  recentImagery: handleModule(RecentImagery),
  widgets: handleModule(Widgets),
  popup: handleModule(Popup),
  draw: handleModule(Draw),
  header: handleModule(Header),
  share: handleModule(Share),
  mapOld: handleModule(MapOld),
  mapMenu: handleModule(MapMenu),
  mapTour: handleModule(MapTour),
  // modals
  modalVideo: handleModule(ModalVideo),
  modalMeta: handleModule(ModalMeta),
  modalAbout: handleModule(AboutModal),
  modalSGF: handleModule(SGFModal),
  modalSources: handleModule(SourcesModal),
  modalSubscribe: handleModule(SubscribeModal),
  modalWelcome: handleModule(WelcomeModal),
  // projects
  impacts: handleModule(Impacts),
  aboutProjects: handleModule(AboutProjects),
  sgfProjects: handleModule(SGFProjects),
  // forms
  contact: handleModule(Contact)
};

// Provider Reducers
const providersReducers = {
  countryData: handleModule(CountryDataProvider),
  geostore: handleModule(GeostoreProvider),
  whitelists: handleModule(WhitelistsProvider),
  datasets: handleModule(DatasetsProvider),
  latest: handleModule(LatestProvider),
  myGfw: handleModule(MyGFWProvider),
  ptw: handleModule(PTWProvider),
  layerSpec: handleModule(LayerSpecProvider)
};

export default {
  ...providersReducers,
  ...componentsReducers
};
