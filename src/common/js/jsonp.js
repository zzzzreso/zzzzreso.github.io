// 引入jsonp
import originJSONP from "jsonp";

// Promise封装jsonp
export default function jsonp(url, data, option) {
  // 判斷是否含有？
  url += (url.indexOf("?") === -1 ? "?" : "&") + param(data);

  return new Promise((resolve, reject) => {
    originJSONP(url, option, (err, data) => {
      if (!err) {
        resolve(data);
      } else {
        reject(err);
      }
    });
  });
}

// 拼接url
function param(data) {
  let url = "";
  for (var k in data) {
    let value = data[k] !== undefined ? data[k] : "";
    url += `&${k}=${encodeURIComponent(value)}`;
  }
  return url ? url.substring(1) : "";
}
