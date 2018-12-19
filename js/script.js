//Dati Api
var apiKey = 'f45eed1b51907eec504d83c2a1f86cae';
var urlApi = 'https://api.themoviedb.org/3/search/movie';
var urlApiLanguages = 'https://api.themoviedb.org/3/configuration/languages';
var language = 'it';
var query = 'Aliens'; //Utente può cambiare

$(document).ready(function () {

    //dati interfaccia
    var wrapper = $('.wrapper-list');
    var source = $('#film__template').html();

    var wrapperSelect = $('.select__select');
    var sourceSelect = $('#select__template').html();

    //creo la select delle lingue
    var selectLanguage = selectObject;
    selectLanguage.setTemplate(wrapperSelect, sourceSelect);
    selectLanguage.setData(apiKey, urlApiLanguages);
    selectLanguage.getData();

    $(document).on('click', '.lang-link', function (e) {
        e.preventDefault();
        $('.lang-link').removeClass('selected');
        $(this).addClass('selected');
    });

    var submit = $('#button-film');
    submit.click(function () {

        //dati da utente
        var input = $('#search');
        var selectL = $('.lang-link.selected');

        query = input.val();
        language = selectL.attr('href');
        console.log(language);
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
            var labels = this.labels;
            var filmsArray = data.results;

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
                    labelTitoloOriginale: labels[thisObject.languageLabel].labelTitoloOriginale,
                    labelAnnoUscita:  labels[thisObject.languageLabel].labelAnnoUscita,
                    labelLingua: labels[thisObject.languageLabel].labelLingua,
                    labelVoto:  labels[thisObject.languageLabel].labelVoto,
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
        //array traduzione label
        this.labels = {
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
        console.log(this.language);
        if(this.labels.hasOwnProperty(this.language)){
          console.log('true');
          this.languageLabel = this.language;
        } else {
          console.log('false');
          this.languageLabel = 'en';
        }

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


//oggetto select
var selectObject = {
    //funzione per passare html
    setTemplate(wrapper, sourceTemplate){
        var thisObject = this;
        thisObject.wrapper = wrapper;
        thisObject.source = sourceTemplate;
        thisObject.template = Handlebars.compile(thisObject.source);
    },
    //funzione che stampa le card
    printData(data){
            var thisObject = this;

            var array = data;
            var context = {
                languages: array
            };

            //console.log(context);
            var html = thisObject.template(context);
            thisObject.wrapper.html(html);

    },
    //funzione a cui passare i dati
    setData(apiKey, urlApi){
        this.apiKey = apiKey;
        this.urlApi = urlApi;
    },
    //funzione che chiama api
    getData() {
        var thisObject = this;

        $.ajax({
            url: this.urlApi,
            data: {
              api_key: thisObject.apiKey
            },
            success: function (data) {
                var result = data;
                var dataLength = data.length;
                var arrayLanguages = [];
                var i = 1;

                while(i < dataLength){
                  arrayLanguages[i] = {
                    name: data[i].english_name,
                    codeLang: data[i].iso_639_1,
                    urlFlag: 'https://www.countryflags.io/' + data[i].iso_639_1 + '/flat/64.png'
                  };
                  i++;
                }
                return thisObject.printData(arrayLanguages);
            },
            error: function (err) {
                console.log(err);
            }
        });
    }
};
