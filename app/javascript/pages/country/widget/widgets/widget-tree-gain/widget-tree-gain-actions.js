import { createAction } from 'redux-actions';
import { createThunkAction } from 'utils/redux';
import axios from 'axios';

import { getGain, getExtent } from 'services/forest-data';

const setTreeGainLoading = createAction('setTreeGainLoading');
const setTreeGainData = createAction('setTreeGainData');
const setTreeGainSettings = createAction('setTreeGainSettings');

const getTreeGain = createThunkAction(
  'getTreeGain',
  params => (dispatch, state) => {
    if (!state().widgetTreeGain.loading) {
      dispatch(setTreeGainLoading({ loading: true, error: false }));
      axios
        .all([getGain({ ...params }), getExtent({ ...params })])
        .then(
          axios.spread((gainResponse, extentResponse) => {
            const gain = gainResponse.data.data;
            const extent = extentResponse.data.data;
            dispatch(
              setTreeGainData({
                gain: (gain && gain.length > 0 && gain[0].value) || 0,
                extent: (gain && extent.length > 0 && extent[0].value) || 0
              })
            );
          })
        )
        .catch(error => {
          console.info(error);
          dispatch(setTreeGainLoading({ loading: false, error: true }));
        });
    }
  }
);

export default {
  setTreeGainLoading,
  setTreeGainData,
  setTreeGainSettings,
  getTreeGain
};
