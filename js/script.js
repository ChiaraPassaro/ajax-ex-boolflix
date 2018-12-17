//Dati Api
var apiKey = 'f45eed1b51907eec504d83c2a1f86cae';
var urlApi = 'https://api.themoviedb.org/3/search/movie';
var language = 'it';
var query = 'Aliens'; //Utente può cambiare

//dati interfaccia
var wrapper = $('.wrapper-list');
var input = $('#search').val();
var submit = $('#input');

$(document).ready(function () {
    var films = filmObject;
    films.setData(apiKey, urlApi, language, query);
    films.getData();
});

//oggetto film
var filmObject = {
    //funzione che stampa le card
    printData(data){
            var source   = $('#film__template').html();
            var template = Handlebars.compile(source);

            var filmsArray = data.results;

            var context = {
                querySearch : query,
                films: []
            };

            var i = 0;

            while (i < filmsArray.length){
                var thisFilm = filmsArray[i];
                console.log(i + ' ' + filmsArray);

                context['films'][i] = {
                    filmTitle: thisFilm.title,
                    filmYear: thisFilm.release_date,
                    filmLanguage: thisFilm.original_language,
                    filmVote: thisFilm.vote_average
                };
                console.log(context);
                i++;
            }

            var html = template(context);
            wrapper.html(html);
    },
    //funzione a cui passare i dati
    setData(apiKey, urlApi, language, query){
        this.apiKey = apiKey;
        this.urlApi = urlApi;
        this.language = language;
        this.query = query;
    },
    //funzione che chiama api
    getData() {
        var thisObject = this;

        $.ajax({
            url: this.urlApi,
            data: {
                api_key: thisObject.apiKey,
                language: thisObject.language,
                query: thisObject.query
            },
            success: function (data) {
                var result = data;
                return thisObject.printData(result);
            },
            error: function (err) {
                console.log(err);
            }
        });
    }
};

//handlebars Helper
Handlebars.registerHelper('each', function(context, options) {
    var result = '';

    for(var i=0, j=context.length; i<j; i++) {
        result = result + options.fn(context[i]);
    }
    return result;
});