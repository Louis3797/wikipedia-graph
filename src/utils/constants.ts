export const API = "https://en.wikipedia.org/w/api.php";

export const PARAMS: any = {
  action: "query",
  format: "json",
  titles: "Albert Einstein",
  prop: "links",
  pllimit: "max",
};
