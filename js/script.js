//Dati Api
var apiKey = 'f45eed1b51907eec504d83c2a1f86cae';
var urlApi = 'https://api.themoviedb.org/3/search/movie';
var urlApiLanguages = 'https://api.themoviedb.org/3/configuration/languages';
var language = 'it';
var query = 'Aliens'; //Utente può cambiare
var bandierePermesse = ['it', 'gb', 'es', 'be'];

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


    //Click sulla select
    $(document).on('click', '.lang-link', function (e) {
        e.preventDefault();
        $('.lang-link').removeClass('selected');
        $(this).addClass('selected');
        var thisOption = $(this).html();
        $('.language-selected').html(thisOption);
    });


    //click su submit
    var submit = $('#button-film');
    submit.click(function () {

        //dati da utente
        var input = $('#search');
        var selectL = $('.lang-link.selected');

        query = input.val();
        language = selectL.attr('href');
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
            getFlags(bandierePermesse);
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


        if(this.labels.hasOwnProperty(this.language)){
          //console.log('true');
          this.languageLabel = this.language;
        } else {
          //console.log('false');
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
        thisObject.array = [];
    },
    //funzione che stampa le card
    printData(data){
            var thisObject = this;
            var thisArray = data;

            var context = {
                languages: thisObject.array
            };

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

                //contatore per while
                var i = 0;
                while(i < dataLength){

                    //creo oggetto immagine per contyrollare se carica l'immagine
                    var image = new Image();
                    image.src = 'https://www.countryflags.io/' + result[i].iso_639_1 + '/flat/64.png';

                    //contattore per oggetto image
                    var j = 0;
                    image.onload = function() {
                      // immagine  caricata
                      var thisUrlFlag = 'https://www.countryflags.io/' + result[j].iso_639_1 + '/flat/64.png';

                      var thisLanguage = {
                          name: result[j].english_name,
                          codeLang: result[j].iso_639_1,
                          urlFlag: thisUrlFlag
                      };

                      getLanguage(thisLanguage, j, dataLength);
                      j++;
                    };

                    image.onerror = function() {
                      // immagine non caricata
                      var thisLanguage = {
                          name: result[j].english_name,
                          codeLang: result[j].iso_639_1,
                      };

                      getLanguage(thisLanguage, j, dataLength);
                      j++;
                    };

                  i++;
                }

                function getLanguage(language, j, dataLength) {
                  //se è l'ultima lingua stampo
                  if(thisObject.array.length == dataLength - 1 ){
                    return thisObject.printData(arrayLanguages);
                  } else{
                    thisObject.array.push(language);
                  }
                }

            },
            error: function (err) {
                console.log(err);
            }
        });
    }

};

// Funzione Bandiere - le sostituisco dopo aver creato le schede
function getFlags(bandierePermesse){
  var lingue = bandierePermesse;
  var dataLenght = lingue.length;

  var arrayFlag = {};
  //contatore per while
  var i = 0;
  while(i <= dataLenght){
    var thisLenght = dataLenght;

    //creo oggetto immagine per contyrollare se carica l'immagine
    var image = new Image();
    image.src = 'https://www.countryflags.io/' + lingue[i] + '/flat/64.png';

    i++;

    //contattore per oggetto image
    var j = 0;
    image.onload = function() {
      // immagine  caricata
      var thisUrlFlag = 'https://www.countryflags.io/' + lingue[j] + '/flat/64.png';

      getThisFlag(thisUrlFlag, lingue[j], j, thisLenght);
      j++;
    };

    image.onerror = function() {
      // immagine non caricata
      var thisUrlFlag = false;

      getThisFlag(thisUrlFlag, lingue[j], j, thisLenght);
      j++;
    };

  }

  function getThisFlag(thisUrlFlag, codeLang, j, dataLength) {
    //se è l'ultima lingua stampo
    if(Object.keys(arrayFlag).length == dataLength){
      return changeFlag(arrayFlag);
    } else{
      if(codeLang){
        arrayFlag[codeLang] = thisUrlFlag;
      }
    }
  }

}

function changeFlag(arrayFlag){
  var languageWrapper = $('.film__language .lang-flag');

  var language = $('.film__language .lang-flag').html();

  if(arrayFlag.hasOwnProperty(language)){
    var flag = '<img src="'+ arrayFlag[language] +'">';
    languageWrapper.html(flag);
  }
}
