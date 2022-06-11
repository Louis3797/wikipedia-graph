import { API, PARAMS } from "../utils/constants";

export const getLinks = () => {
  let url = API + "?origin=*";
  Object.keys(PARAMS).forEach(function (key) {
    url += "&" + key + "=" + PARAMS[key];
  });

  fetch(url)
    .then(function (response) {
      return response.json();
    })
    .then(function (response) {
      var pages = response.query.pages;
      for (var p in pages) {
        for (var l of pages[p].links) {
          console.log(l.title);
        }
      }
    })
    .catch(function (error) {
      console.log(error);
    });
};
