(function(module) {
  var articlesController = {};

  Article.createTable();  // Ensure the database table is properly initialized

  articlesController.index = function(ctx, next) {
    articleView.index(ctx.articles);
  };

  // COMMENT: What does this method do?  What is it's execution path?
  //The loadById method is attached to the articlesController object which accepts
  //ctx and next as parameters. The articlesData function accepts article as a
  //parameter. This is then assigned to a new property on the ctx object called articles.
  //We then call the next callback function in our route.
  //The findWhere method on the Article object accepts field, value and callback as
  //parameters. It gets articleData from the table. The params method on the ctx object
  //get the ID from the table and passes it as the value so we get the proper SQL query.
  articlesController.loadById = function(ctx, next) {
    var articleData = function(article) {
      ctx.articles = article;
      next();
    };

    Article.findWhere('id', ctx.params.id, articleData);
  };

  // COMMENT: What does this method do?  What is it's execution path?
  //The loadByAuthor is attached to the articlesController object which accepts
  //ctx and next as paramters. The authorData function accepts articlesByAuthor
  //as a parameter which passes in our array of article objects. This is then
  //assigned to a new property on the ctx object called articles. We then call
  //the next callback function in our route.
  //The findWhere method on the Article object accepts field, value and callback
  //as parameters. It gets authorData from the articles table. The params method
  //on the ctx object is used to get authorName from the current url params to
  //create the proper SQL query.
  articlesController.loadByAuthor = function(ctx, next) {
    var authorData = function(articlesByAuthor) {
      ctx.articles = articlesByAuthor;
      next();
    };

    Article.findWhere('author', ctx.params.authorName.replace('+', ' '), authorData);
  };

  // COMMENT: What does this method do?  What is it's execution path?
  //The loadByCategory is attached to the articlesController object which accepts
  //ctx and next and parameters. The categoryData function accepts articlesInCategory
  //as its parameter which passes in our array of article objects. This is then assigned
  //to a new property on the ctx object called articles. We then call the next callback
  //function in our route.
  //The findWhere method on the Article object accepts field, value and callback
  //as parameters. It gets categoryData from the articles table. The params method
  //on the ctx object is used to get the categoryName from the current url params to
  //create the proper SQL query.
  articlesController.loadByCategory = function(ctx, next) {
    var categoryData = function(articlesInCategory) {
      ctx.articles = articlesInCategory;
      next();
    };

    Article.findWhere('category', ctx.params.categoryName, categoryData);
  };

  // COMMENT: What does this method do?  What is it's execution path?
  //The loadAll is attached to the articlesController object which accepts
  //ctx and next and parameters. The articleData function accepts allArticles
  //as its parameter which passes in our array of article objects. The articleAll
  //array is then assigned to the articles method on the ctx object. We then call
  //the next callback function in our route.
  //If the Article.all array exists we assign Article.all to ctx.articles and call
  //the next function in the route. If not, we call the fetchAll method attached
  //to the Article object which takes articleData as its parameter. When called,
  //this will load all our articles into the page. This is set as our start page in
  //routes. 
  articlesController.loadAll = function(ctx, next) {
    var articleData = function(allArticles) {
      ctx.articles = Article.all;
      next();
    };

    if (Article.all.length) {
      ctx.articles = Article.all;
      next();
    } else {
      Article.fetchAll(articleData);
    }
  };


  module.articlesController = articlesController;
})(window);
