import axios from 'axios';
import { getEmissions } from 'services/climate';

export default ({ params }) =>
  axios
    .all([...getEmissions({ ...params })], {
      validateStatus: status => status < 500
    })
    .then(
      axios.spread((YSF, MASF, Pasture, Crops) => {
        const data = {
          YSF: YSF.data,
          MASF: MASF.data,
          Pasture: Pasture.data,
          Crops: Crops.data
        };
        return data;
      })
    );
