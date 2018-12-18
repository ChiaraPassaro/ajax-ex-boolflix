//Dati Api
var apiKey = 'f45eed1b51907eec504d83c2a1f86cae';
var urlApi = 'https://api.themoviedb.org/3/search/movie';
var language = 'it';
var query = 'Aliens'; //Utente può cambiare

$(document).ready(function () {

    //dati interfaccia
    var wrapper = $('.wrapper-list');
    var source   = $('#film__template').html();

    //dati da utente
    var input = $('#search');
    var selectL = $('#lang');

    var submit = $('#button-film');
    submit.click(function () {
        query = input.val();
        language = selectL.val();

        var films = filmObject;
        films.setTemplate(wrapper, source);
        films.setData(apiKey, urlApi, language, query);
        films.getData();
    });
});

//oggetto film
var filmObject = {
    //funzione per passare html
    setTemplate(wrapper, sourceTemplate){
        var thisObject = this;
        thisObject.wrapper = wrapper
        thisObject.source   = sourceTemplate
        thisObject.template  = Handlebars.compile(thisObject.source );
    },
    //funzione che stampa le card
    printData(data){
            var thisObject = this;

            var filmsArray = data.results;


            //array traduzione label
            var labels = {
                it: {
                    'labelTitoloOriginale': 'Titolo originale',
                    'labelAnnoUscita': 'Anno di Uscita',
                    'labelLingua': 'Lingua',
                    'labelVoto': 'Voto'
                },
                en: {
                    'labelTitoloOriginale': 'Original Title',
                    'labelAnnoUscita': 'Release Date',
                    'labelLingua': 'Language',
                    'labelVoto': 'Vote average'
                }
            };


            var context = {
                querySearch : query,
                films: []
            };

            var i = 0;

            while (i < filmsArray.length){
                var thisFilm = filmsArray[i];

                // trasformo il voto da numero decimale a intero e da 1 a 10 a 1 a 5
                var filmVote = Math.ceil(thisFilm.vote_average / 2);
                var maxStars = 5;
                var filmStar = [];

                //creo un array con le stelle
                for (var j = 0; j < maxStars; j++) {
                    if(j < filmVote){
                        filmStar.push({star: true});
                    } else {
                        filmStar.push({star: false});
                    }
                }

                context['films'][i] = {
                    labelTitoloOriginale: labels[thisObject.language].labelTitoloOriginale,
                    labelAnnoUscita:  labels[thisObject.language].labelAnnoUscita,
                    labelLingua: labels[thisObject.language].labelLingua,
                    labelVoto:  labels[thisObject.language].labelVoto,
                    filmTitle: thisFilm.title,
                    originalTitle: thisFilm.original_title,
                    filmYear: thisFilm.release_date,
                    filmLanguage: thisFilm.original_language,
                    stars: filmStar
                };
                i++;
            }

            var html = thisObject.template(context);
            thisObject.wrapper.html(html);
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


