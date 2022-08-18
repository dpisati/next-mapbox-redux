import { all, spread } from 'axios';
import compact from 'lodash/compact';

import { getExtent, getLoss } from 'services/analysis-cached';
import { getYearsRangeFromMinMax } from 'components/widgets/utils/data';

import {
  POLITICAL_BOUNDARIES_DATASET,
  FOREST_LOSS_DATASET,
} from 'data/datasets';
import {
  DISPUTED_POLITICAL_BOUNDARIES,
  POLITICAL_BOUNDARIES,
  FOREST_LOSS,
} from 'data/layers';

import getWidgetProps from './selectors';

const MIN_YEAR = 2002;
const MAX_YEAR = 2021;

const getGlobalLocation = (params) => ({
  adm0: params.type === 'global' ? null : params.adm0,
  adm1: params.type === 'global' ? null : params.adm1,
  adm2: params.type === 'global' ? null : params.adm2,
});

export default {
  widget: 'treeLossPct',
  title: {
    default: 'Primary Forest loss in {location}',
    global: 'Global Primary Forest loss',
  },
  categories: ['summary', 'forest-change'],
  types: ['global', 'country', 'wdpa', 'aoi'],
  admins: ['global', 'adm0', 'adm1', 'adm2'],
  caution: {
    text:
      'The methods behind this data have changed over time. Be cautious comparing old and new data, especially before/after 2015. {Read more here}.',
    visible: ['global', 'country', 'geostore', 'aoi', 'wdpa', 'use'],
    linkText: 'Read more here',
    link:
      'https://www.globalforestwatch.org/blog/data-and-research/tree-cover-loss-satellite-data-trend-analysis/',
  },
  large: true,
  visible: ['dashboard', 'analysis'],
  chartType: 'composedChart',
  colors: 'loss',
  settingsConfig: [
    {
      key: 'landCategory',
      label: 'Land Category',
      type: 'select',
      placeholder: 'All categories',
      clearable: true,
      border: true,
      blacklist: ['wdpa'],
    },
    {
      key: 'years',
      label: 'years',
      endKey: 'endYear',
      startKey: 'startYear',
      type: 'range-select',
      border: true,
    },
    {
      key: 'threshold',
      label: 'canopy density',
      type: 'mini-select',
      metaKey: 'widget_canopy_density',
    },
  ],
  pendingKeys: ['threshold', 'years'],
  refetchKeys: ['landCategory', 'threshold'],
  dataType: 'lossPrimary',
  metaKey: 'widget_primary_forest_loss',
  datasets: [
    {
      dataset: POLITICAL_BOUNDARIES_DATASET,
      layers: [DISPUTED_POLITICAL_BOUNDARIES, POLITICAL_BOUNDARIES],
      boundary: true,
    },
    // loss
    {
      dataset: FOREST_LOSS_DATASET,
      layers: [FOREST_LOSS],
    },
  ],
  sortOrder: {
    summary: -1,
    forestChange: -1,
  },
  sentence: {
    initial:
      'From {startYear} to {endYear}, <b>{location} lost {loss} of humid primary forest</b>, making up {percent} of its {total tree cover loss} in the same time period. <b>Total area of humid primary forest in {location} decreased by</b> {extentDelta} in this time period.',
    withIndicator:
      'From {startYear} to {endYear}, <b>{location} lost {loss} of humid primary forest</b> in {indicator}, making up {percent} of its {total tree cover loss} in the same time period. <b>Total area of humid primary forest in {location} in {indicator} decreased by</b> {extentDelta} in this time period.',
    globalInitial:
      'From {startYear} to {endYear}, there was a total of {loss} <b>humid primary forest lost</b> {location}, making up {percent} of its {total tree cover loss} in the same time period. Total area of humid primary forest decreased {location} by</b> {extentDelta} in this time period.',
    globalWithIndicator:
      'From {startYear} to {endYear}, there was a total of {loss} <b>humid primary forest lost</b> {location} within {indicator}, making up {percent} of its {total tree cover loss} in the same time period. <b>Total area of humid primary forest in {indicator} decreased {location} by</b> {extentDelta} in this time period.',
    noLoss:
      'From {startYear} to {endYear}, <b>{location} lost {loss} of humid primary forest</b>.',
    noLossWithIndicator:
      'From {startYear} to {endYear}, <b>{location} lost {loss} of humid primary forest</b> in {indicator}.',
  },
  whitelists: {
    indicators: ['primary_forest'],
    checkStatus: true,
  },
  settings: {
    threshold: 30,
    extentYear: 2000,
    forestType: 'primary_forest',
  },
  chartDecorationConfig: {
    type: 'star',
    message: `Much of Indonesia's 2016 fire-related forest loss figure was actually due to burning in 2015. Burned areas were detected late because of insufficient clear Landsat images at year's end (the same is also true to a lesser extent for 2019 and 2020). We are working to address this issue. The three-year moving average may represent a more relevant picture of the trends due to uncertainty in the year-to-year comparisons.`,
    locations: [
      'Indonesia',
      'Aceh',
      'Aceh Barat',
      'Aceh Barat Daya',
      'Aceh Besar',
      'Aceh Jaya',
      'Aceh Selatan',
      'Aceh Singkil',
      'Aceh Tamiang',
      'Aceh Tengah',
      'Aceh Tenggara',
      'Aceh Timur',
      'Aceh Utara',
      'Banda Aceh',
      'Bener Meriah',
      'Bireuen',
      'Gayo Lues',
      'Langsa',
      'Lhokseumawe',
      'Nagan Raya',
      'Pidie',
      'Pidie Jaya',
      'Sabang',
      'Simeulue',
      'Subulussalam',
      'Bali',
      'Bangka Belitung',
      'Bangka',
      'Bangka Barat',
      'Bangka Selatan',
      'Bangka Tengah',
      'Belitung',
      'Belitung Timur',
      'Pangkalpinang',
      'Cilegon',
      'Kota Serang',
      'Kota Tangerang',
      'Lebak',
      'Pandeglang',
      'Serang',
      'Tangerang',
      'Tangerang Selatan',
      'Bengkulu',
      'Bengkulu',
      'Bengkulu Selatan',
      'Bengkulu Tengah',
      'Bengkulu Utara',
      'Kaur',
      'Kepahiang',
      'Lebong',
      'Mukomuko',
      'Rejang Lebong',
      'Seluma',
      'Gorontalo',
      'Boalemo',
      'Bone Bolango',
      'Danau Limboto',
      'Gorontalo',
      'Gorontalo Utara',
      'Kota Gorontalo',
      'Pohuwato',
      'Jakarta Raya',
      'Jakarta Barat',
      'Jakarta Pusat',
      'Jakarta Selatan',
      'Jakarta Timur',
      'Jakarta Utara',
      'Kepulauan Seribu',
      'Jambi',
      'Batang Hari',
      'Bungo',
      'Jambi',
      'Kerinci',
      'Merangin',
      'Muaro Jambi',
      'Sarolangun',
      'Sungai Penuh',
      'Tanjung Jabung B',
      'Tanjung Jabung T',
      'Tebo',
      'Jawa Barat',
      'Bandung',
      'Bandung Barat',
      'Banjar',
      'Bekasi',
      'Bogor',
      'Ciamis',
      'Cianjur',
      'Cimahi',
      'Cirebon',
      'Depok',
      'Garut',
      'Indramayu',
      'Karawang',
      'Kota Bandung',
      'Kota Bekasi',
      'Kota Bogor',
      'Kota Cirebon',
      'Kota Sukabumi',
      'Kota Tasikmalaya',
      'Kuningan',
      'Majalengka',
      'Purwakarta',
      'Subang',
      'Sukabumi',
      'Sumedang',
      'Tasikmalaya',
      'Jawa Tengah',
      'Banjarnegara',
      'Banyumas',
      'Batang',
      'Blora',
      'Boyolali',
      'Brebes',
      'Cilacap',
      'Demak',
      'Grobogan',
      'Jepara',
      'Karanganyar',
      'Kebumen',
      'Kendal',
      'Klaten',
      'Kota Magelang',
      'Kota Pekalongan',
      'Kota Semarang',
      'Kota Tegal',
      'Kudus',
      'Magelang',
      'Pati',
      'Pekalongan',
      'Pemalang',
      'Purbalingga',
      'Purworejo',
      'Rembang',
      'Salatiga',
      'Semarang',
      'Sragen',
      'Sukoharjo',
      'Surakarta',
      'Tegal',
      'Temanggung',
      'Wonogiri',
      'Wonosobo',
      'Jawa Timur',
      'Bangkalan',
      'Banyuwangi',
      'Batu',
      'Blitar',
      'Bojonegoro',
      'Bondowoso',
      'Gresik',
      'Jember',
      'Jombang',
      'Kediri',
      'Kota Blitar',
      'Kota Kediri',
      'Kota Madiun',
      'Kota Malang',
      'Kota Mojokerto',
      'Kota Pasuruan',
      'Kota Probolinggo',
      'Lamongan',
      'Lumajang',
      'Madiun',
      'Magetan',
      'Malang',
      'Mojokerto',
      'Nganjuk',
      'Ngawi',
      'Pacitan',
      'Pamekasan',
      'Pasuruan',
      'Ponorogo',
      'Probolinggo',
      'Sampang',
      'Sidoarjo',
      'Situbondo',
      'Sumenep',
      'Surabaya',
      'Trenggalek',
      'Tuban',
      'Tulungagung',
      'Kalimantan Barat',
      'Bengkayang',
      'Kapuas Hulu',
      'Kayong Utara',
      'Ketapang',
      'Kota Pontianak',
      'Kubu Raya',
      'Landak',
      'Melawi',
      'Pontianak',
      'Sambas',
      'Sanggau',
      'Sekadau',
      'Singkawang',
      'Sintang',
      'Kalimantan Selatan',
      'Balangan',
      'Banjar',
      'Banjar Baru',
      'Banjarmasin',
      'Barito Kuala',
      'Hulu Sungai Selatan',
      'Hulu Sungai Tengah',
      'Hulu Sungai Utara',
      'Kota Baru',
      'Tabalong',
      'Tanah Bumbu',
      'Tanah Laut',
      'Tapin',
      'Kalimantan Tengah',
      'Barito Selatan',
      'Barito Timur',
      'Barito Utara',
      'Gunung Mas',
      'Kapuas',
      'Katingan',
      'Kotawaringin Barat',
      'Kotawaringin Timur',
      'Lamandau',
      'Murung Raya',
      'Palangka Raya',
      'Pulang Pisau',
      'Seruyan',
      'Sukamara',
      'Kalimantan Timur',
      'Balikpapan',
      'Berau',
      'Bontang',
      'Bulungan',
      'Kutai Barat',
      'Kutai Kartanegara',
      'Kutai Timur',
      'Malinau',
      'Nunukan',
      'Paser',
      'Penajam Paser Utara',
      'Samarinda',
      'Tana Tidung',
      'Tarakan',
      'Kepulauan Riau',
      'Batam',
      'Bintan',
      'Karimun',
      'Kepulauan Anambas',
      'Lingga',
      'Natuna',
      'Tanjungpinang',
      'Lampung',
      'Bandar Lampung',
      'Lampung Barat',
      'Lampung Selatan',
      'Lampung Tengah',
      'Lampung Timur',
      'Lampung Utara',
      'Mesuji',
      'Metro',
      'Pesawaran',
      'Pringsewu',
      'Tanggamus',
      'Tulangbawang',
      'Tulang Bawang Barat',
      'Way Kanan',
      'Maluku',
      'Ambon',
      'Buru',
      'Buru Selatan',
      'Kepulauan Aru',
      'Maluku Barat Daya',
      'Maluku Tengah',
      'Maluku Tenggara',
      'Maluku Tenggara Barat',
      'Seram Bagian Barat',
      'Seram Bagian Timur',
      'Tual',
      'Maluku Utara',
      'Halmahera Barat',
      'Halmahera Selatan',
      'Halmahera Tengah',
      'Halmahera Timur',
      'Halmahera Utara',
      'Kepulauan Sula',
      'Pulau Morotai',
      'Ternate',
      'Tidore Kepulauan',
      'Nusa Tenggara Barat',
      'Bima',
      'Dompu',
      'Kota Bima',
      'Lombok Barat',
      'Lombok Tengah',
      'Lombok Timur',
      'Lombok Utara',
      'Mataram',
      'Sumbawa',
      'Sumbawa Barat',
      'Nusa Tenggara Timur',
      'Alor',
      'Belu',
      'Ende',
      'Flores Timur',
      'Kota Kupang',
      'Kupang',
      'Lembata',
      'Manggarai',
      'Manggarai Barat',
      'Manggarai Timur',
      'Nagekeo',
      'Ngada',
      'Rote Ndao',
      'Sabu Raijua',
      'Sikka',
      'Sumba Barat',
      'Sumba Barat Daya',
      'Sumba Tengah',
      'Sumba Timur',
      'Timor Tengah Selatan',
      'Timor Tengah Utara',
      'Papua',
      'Asmat',
      'Biak Numfor',
      'Boven Digoel',
      'Deiyai',
      'Dogiyai',
      'Intan Jaya',
      'Jayapura',
      'Jayawijaya',
      'Keerom',
      'Kepulauan Yapen',
      'Kota Jayapura',
      'Lanny Jaya',
      'Mamberamo Raya',
      'Mamberamo Tengah',
      'Mappi',
      'Merauke',
      'Mimika',
      'Nabire',
      'Nduga',
      'Paniai',
      'Pegunungan Bintang',
      'Puncak',
      'Puncak Jaya',
      'Sarmi',
      'Supiori',
      'Tolikara',
      'Waropen',
      'Yahukimo',
      'Yalimo',
      'Papua Barat',
      'Fakfak',
      'Kaimana',
      'Kota Sorong',
      'Manokwari',
      'Maybrat',
      'Raja Ampat',
      'Sorong',
      'Sorong Selatan',
      'Tambrauw',
      'Teluk Bintuni',
      'Teluk Wondama',
      'Riau',
      'Bengkalis',
      'Dumai',
      'Indragiri Hilir',
      'Indragiri Hulu',
      'Kampar',
      'Kepulauan Meranti',
      'Kuantan Singingi',
      'Pekanbaru',
      'Pelalawan',
      'Rokan Hilir',
      'Rokan Hulu',
      'Siak',
      'Sulawesi Barat',
      'Majene',
      'Mamasa',
      'Mamuju',
      'Mamuju Utara',
      'Polewali Mandar',
      'Sulawesi Selatan',
      'Bantaeng',
      'Barru',
      'Bone',
      'Bulukumba',
      'Enrekang',
      'Gowa',
      'Jeneponto',
      'Kepulauan Selayar',
      'Luwu',
      'Luwu Timur',
      'Luwu Utara',
      'Makassar',
      'Maros',
      'Palopo',
      'Pangkajene Dan Kepulauan',
      'Parepare',
      'Pinrang',
      'Sidenreng Rappang',
      'Sinjai',
      'Soppeng',
      'Takalar',
      'Tana Toraja',
      'Toraja Utara',
      'Wajo',
      'Sulawesi Tengah',
      'Banggai',
      'Banggai Kepulauan',
      'Buol',
      'Donggala',
      'Morowali',
      'Palu',
      'Parigi Moutong',
      'Poso',
      'Sigi',
      'Tojo Una-Una',
      'Toli-Toli',
      'Sulawesi Tenggara',
      'Bau-Bau',
      'Bombana',
      'Buton',
      'Buton Utara',
      'Kendari',
      'Kolaka',
      'Kolaka Utara',
      'Konawe',
      'Konawe Selatan',
      'Konawe Utara',
      'Muna',
      'Wakatobi',
      'Sulawesi Utara',
      'Bitung',
      'Bolaang Mongondow',
      'Bolaang Mongondow Selatan',
      'Bolaang Mongondow Timur',
      'Bolaang Mongondow Utara',
      'Kepulauan Sangihe',
      'Kepulauan Talaud',
      'Kotamobagu',
      'Manado',
      'Minahasa',
      'Minahasa Selatan',
      'Minahasa Tenggara',
      'Minahasa Utara',
      'Siau Tagulandang Biaro',
      'Tomohon',
      'Sumatera Barat',
      'Agam',
      'Bukittinggi',
      'Dharmasraya',
      'Kepulauan Mentawai',
      'Kota Solok',
      'Lima Puluh Kota',
      'Padang',
      'Padang Panjang',
      'Padang Pariaman',
      'Pariaman',
      'Pasaman',
      'Pasaman Barat',
      'Payakumbuh',
      'Pesisir Selatan',
      'Sawahlunto',
      'Sijunjung',
      'Solok',
      'Solok Selatan',
      'Tanah Datar',
      'Sumatera Selatan',
      'Banyu Asin',
      'Empat Lawang',
      'Lahat',
      'Lubuklinggau',
      'Muara Enim',
      'Musi Banyuasin',
      'Musi Rawas',
      'Ogan Ilir',
      'Ogan Komering Ilir',
      'Ogan Komering Ulu',
      'Ogan Komering Ulu Selatan',
      'Ogan Komering Ulu Timur',
      'Pagar Alam',
      'Palembang',
      'Prabumulih',
      'Sumatera Utara',
      'Asahan',
      'Batu Bara',
      'Dairi',
      'Deli Serdang',
      'Gunungsitoli',
      'Humbang Hasundutan',
      'Karo',
      'Kota Binjai',
      'Kota Medan',
      'Kota Tanjungbalai',
      'Labuhanbatu',
      'Labuhanbatu Selatan',
      'Labuhanbatu Utara',
      'Langkat',
      'Mandailing Natal',
      'Nias',
      'Nias Barat',
      'Nias Selatan',
      'Nias Utara',
      'Padang Lawas',
      'Padang Lawas Utara',
      'Padangsidimpuan',
      'Pakpak Barat',
      'Pematangsiantar',
      'Samosir',
      'Serdang Bedagai',
      'Sibolga',
      'Simalungun',
      'Tapanuli Selatan',
      'Tapanuli Tengah',
      'Tapanuli Utara',
      'Tebingtinggi',
      'Toba Samosir',
      'Yogyakarta',
      'Bantul',
      'Gunung Kidul',
      'Kota Yogyakarta',
      'Kulon Progo',
      'Sleman',
    ],
    years: [2016],
  },
  getData: (params = {}) => {
    const { adm0, adm1, adm2, type } = params || {};
    const globalLocation = {
      adm0: type === 'global' ? null : adm0,
      adm1: type === 'global' ? null : adm1,
      adm2: type === 'global' ? null : adm2,
    };

    return all([
      getLoss({
        ...params,
        forestType: null,
        landCategory: null,
        ...globalLocation,
      }),
      getLoss({ ...params, ...globalLocation }),
      getExtent({
        ...params,
        ...globalLocation,
      }),
      getLoss({ ...params, forestType: null, ...globalLocation }),
    ]).then(
      spread((adminLoss, primaryLoss, extent, loss) => {
        let data = {};
        if (
          adminLoss &&
          adminLoss.data &&
          primaryLoss &&
          primaryLoss.data &&
          loss &&
          loss.data &&
          extent &&
          extent.data
        ) {
          data = {
            adminLoss: adminLoss.data.data,
            loss: loss.data.data,
            primaryLoss: primaryLoss.data.data,
            extent: (loss.data.data && extent.data.data) || [],
          };
        }
        const { startYear, endYear, range } = getYearsRangeFromMinMax(
          MIN_YEAR,
          MAX_YEAR
        );
        return {
          ...data,
          settings: {
            startYear,
            endYear,
            yearsRange: range,
          },
          options: {
            years: range,
          },
        };
      })
    );
  },
  getDataURL: (params) => {
    const globalLocation = getGlobalLocation(params);
    return compact([
      getLoss({
        ...params,
        ...globalLocation,
        forestType: null,
        landCategory: null,
        download: true,
      }),
      getLoss({
        ...params,
        ...globalLocation,
        download: true,
      }),
      getExtent({ ...params, download: true }),
      params.landCategory &&
        getLoss({
          ...params,
          forestType: null,
          ...globalLocation,
          download: true,
        }),
    ]);
  },
  getWidgetProps,
};
