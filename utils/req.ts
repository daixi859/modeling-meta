import axios, { AxiosRequestConfig } from "axios";

const instance = axios.create({
  timeout: 100000, //默认超时时间
  withCredentials: true, //跨域请求，允许保存cookie
  validateStatus: function (status) {
    return status >= 200 && status <= 500;
  },
});

function request<T>(config: AxiosRequestConfig<unknown> = {}): Promise<T> {
  return new Promise((resolve, reject) => {
    return instance(config)
      .then((response) => {
        resolve(response.data);
      })
      .catch((e) => {
        console.log(e);
        reject(e);
      });
  });
}

const get = <T = unknown>(
  url: string,
  params: AxiosRequestConfig["params"] = {},
  opts: AxiosRequestConfig<unknown> = {}
): Promise<T> => request({ url, params, ...opts, method: "GET" });

const post = <T = unknown>(
  url: string,
  data: AxiosRequestConfig["data"] = {},
  opts: AxiosRequestConfig<unknown> = {}
): Promise<T> => request({ url, data, ...opts, method: "POST" });

const req = {
  get,
  post,
};

export default req;
