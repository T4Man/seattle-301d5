(function(module) {

  var articleView = {};

  var render = function(article) {
    var template = Handlebars.compile($('#article-template').text());

    article.daysAgo = parseInt((new Date() - new Date(article.publishedOn))/60/60/24/1000);
    article.publishStatus = article.publishedOn ? 'published ' + article.daysAgo + ' days ago' : '(draft)';
    article.body = marked(article.body);

    return template(article);
  };

  // COMMENT: What does this method do?  What is it's execution path?
  //The populateFilters method is attached to the articleView object that accepts
  //no parameters. The compile method of the Handlebars object takes the text of
  //the option-template jquery object and assigns it to the
  //template variable. The map method iterates over allAuthors (loaded from the DOM)
  // and returns each author name
  //to the template which is then assigned to the options variable.
  //A test is applied to prevent duplication by establishing if the option element
  //in the author-filter jQuery object is already populated and appends
  //the DOM with the value of the option variable when true.
  //The allCategories function (which triggers a SQL query) attached to the Article object is called and passed
  //a function as an argument. That function takes rows as a parameter. A test is applied
  //checking if the option element of the category-filter jQuery object is empty.
  //If true the append method on category-filter is invoked and passes the map method
  //on the rows array as an argument. The map function accepts row as a parameter
  //and returns the category value of each row to the template variable.
  articleView.populateFilters = function() {
    var options,
    template = Handlebars.compile($('#option-template').text());
    // Example of using model method with FP, synchronous approach:
    // NB: This method is dependant on info being in the DOM. Only authors of shown articles are loaded.
    options = Article.allAuthors().map(function(author) { return template({val: author}); });
    if ($('#author-filter option').length < 2) { // Prevent duplication
      $('#author-filter').append(options);
    };

    // Example of using model method with async, SQL-based approach:
    // This approach is DOM-independent, since it reads from the DB directly.
    Article.allCategories(function(rows) {
      if ($('#category-filter option').length < 2) {
        $('#category-filter').append(
          rows.map(function(row) {
            return template({val: row.category});
          })
        );
      };
    });
  };

  // COMMENT: What does this method do?  What is it's execution path?
  //The handleFilters function is attached to the articleView object which accepts no
  //parameters. An event listener is attached to the filters jQuery object to detect
  //when the user selects an option. When triggered, it will invoke (only once)
  //an anonymous function that removes '-filter' from the id of the selected option.
  //That value is then assigned to the resource variable. A string is passed to the
  //page method that has been reformatted into a valid URI. This will create a route
  //to the correct view for our page.
  articleView.handleFilters = function() {
    $('#filters').one('change', 'select', function() {
      resource = this.id.replace('-filter', '');
      page('/' + resource + '/' + $(this).val().replace(/\W+/g, '+')); // Replace any/all whitespace with a +
    });
  };
  // articleView.handleAuthorFilter = function() {
  //   $('#author-filter').on('change', function() {
  //     if ($(this).val()) {
  //       $('article').hide();
  //       $('article[data-author="' + $(this).val() + '"]').fadeIn();
  //     } else {
  //       $('article').fadeIn();
  //       $('article.template').hide();
  //     }
  //     $('#category-filter').val('');
  //   });
  // };
  //
  // articleView.handleCategoryFilter = function() {
  //   $('#category-filter').on('change', function() {
  //     if ($(this).val()) {
  //       $('article').hide();
  //       $('article[data-category="' + $(this).val() + '"]').fadeIn();
  //     } else {
  //       $('article').fadeIn();
  //       $('article.template').hide();
  //     }
  //     $('#author-filter').val('');
  //   });
  // };

  // DONE: Remove the setTeasers method, and replace with a plain ole link in the article template.
  // articleView.setTeasers = function() {
  //   $('.article-body *:nth-of-type(n+2)').hide();
  //
  //   $('#articles').on('click', 'a.read-on', function(e) {
  //     e.preventDefault();
  //     $(this).parent().find('*').fadeIn();
  //     $(this).hide();
  //   });
  // };

  articleView.initNewArticlePage = function() {
    $('#articles').show().siblings().hide();

    $('#export-field').hide();
    $('#article-json').on('focus', function(){
      this.select();
    });

    $('#new-form').on('change', 'input, textarea', articleView.create);
  };

  articleView.create = function() {
    var article;
    $('#articles').empty();

    // Instantiate an article based on what's in the form fields:
    article = new Article({
      title: $('#article-title').val(),
      author: $('#article-author').val(),
      authorUrl: $('#article-author-url').val(),
      category: $('#article-category').val(),
      body: $('#article-body').val(),
      publishedOn: $('#article-published:checked').length ? util.today() : null
    });

    $('#articles').append(render(article));

    $('pre code').each(function(i, block) {
      hljs.highlightBlock(block);
    });

    // Export the new article as JSON, so it's ready to copy/paste into blogArticles.js:
    $('#export-field').show();
    $('#article-json').val(JSON.stringify(article) + ',');
  };

  // COMMENT: What does this method do?  What is it's execution path?
  //The index function is attached to the articleView object and accepts articles
  //as a parameter. We then show all elements with the id of 'articles' and hide
  //all siblings of 'articles'. Any article elements within the section with the id
  //'article' are removed. The forEach method is applied to the passed in articles
  //which takes a function as an argument with 'a' as a parameter. The render function
  //is invoked which appends the 'articles' section in the DOM with a new HTML anchor
  //element. The populateFilters and handleFilters methods on the
  //articleView object are then called.
  articleView.index = function(articles) {
    $('#articles').show().siblings().hide();

    $('#articles article').remove();
    articles.forEach(function(a) {
      $('#articles').append(render(a));
    });

    articleView.populateFilters();
    // COMMENT: What does this method do?  What is it's execution path?
    //The handleFilters function is called to change to the appropriate view.
    articleView.handleFilters();

    // DONE: Replace setTeasers with just the truncation logic, if needed:
    if ($('#articles article').length > 1) {
      $('.article-body *:nth-of-type(n+2)').hide();
    }
  };

  articleView.initAdminPage = function() {
    var template = Handlebars.compile($('#author-template').text());

    Article.numWordsByAuthor().forEach(function(stat) {
      $('.author-stats').append(template(stat));
    });

    $('#blog-stats .articles').text(Article.all.length);
    $('#blog-stats .words').text(Article.numWordsAll());
  };

  module.articleView = articleView;
})(window);
