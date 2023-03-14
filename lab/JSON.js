const body = {
    query: '{"search_box":"braids deep in the iris","title":"","release_title":"","anv":"","label":"","genre":"","style":"","country":"","year":"","format":"","catno":"","barcode":"","track":"","submitter":"","contributor":""}'
}

let query = JSON.parse(body.query);

const prefix = 'https://api.discogs.com/database/search?';

function generateQueryUrl(prefix, query) {
    let url = prefix;
    for (const [key, value] of Object.entries(query)) {
        if (value !== '') {
            url += `&${key}=${value}`;
        }
      }
      console.log(url);
      return url;
}
console.log(generateQueryUrl(prefix, query));