import { API_PREFIX, API_SUFFIX } from "../utils/constants";

const getLinks = (title: string): string[] => {
  const results: string[] = [];

  const url = API_PREFIX + title + API_SUFFIX;
  fetch(url)
    .then((response) => response.json())
    .then((response) => {
      console.log(response);
      const { pages } = response;
      for (const p in pages) {
        for (const l of pages[p].links) {
          results.push(l.title as string);
        }
      }
    })
    .catch((error) => {
      throw new Error(error);
    });

  return results;
};

export default getLinks;
