import jsonp from "common/js/jsonp";
import { commonParams, options } from "./config";

export function getSingerList() {
  const url = 'https://c.y.qq.com/v8/fcg-bin/v8.fcg'
  // const url = "https://u.y.qq.com/cgi-bin/musicu.fcg";

  const data = Object.assign({}, commonParams, {
    loginUin: 0,
    notice: 0,
    hostUin: 0,
    needNewCode: 0,
    platform: 'yqq.json',
    g_tk: 5381
  });

  return jsonp(url, data, options);
}

export function getSingerDetail(singerId) {
  const url = "https://c.y.qq.com/v8/fcg-bin/fcg_v8_singer_track_cp.fcg";

  const data = Object.assign({}, commonParams, {
    g_tk: 1576475597,
    hostUin: 0,
    needNewCode: 0,
    platform: "yqq",
    order: "listen",
    begin: 0,
    num: 100,
    songstatus: 1,
    singermid: singerId
  });

  return jsonp(url, data, options);
}
