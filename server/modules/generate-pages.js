var pages = JSON.parse(Assets.getText("data/pages.json"));

let _createPage = function(page) {
  Pages.insert(page);
};

let _createpages = function(pages) {
  for (let i = 0; i < pages.length; i++) {
    let page = pages[i];
    page.status = 'published';

    _createPage(page);
  }
};

let _checkIfpageExist = function(count) {
  return Pages.find().count() < count ? false : true;
};

let generatePages = function() {
  pageExist = _checkIfpageExist(pages.length);

  if (!pageExist) {
    _createpages(pages);
  }
};

Modules.server.generatePages = generatePages;
