import axios from 'axios';

// GET接口示例
export const get = params => {
  return axios.get(`接口url`, {
    params: params
  }).then(res => res.data);
};

// POST接口示例
export const post = params => {
  return axios({
    headers: {'content-type': 'application/json'},
    method: 'post',
    url: `接口url`,
    data: JSON.stringify(params)
  }).then(res => res.data);
};
