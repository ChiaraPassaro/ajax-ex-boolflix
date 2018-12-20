//Dati Api
var apiKey = 'f45eed1b51907eec504d83c2a1f86cae';
var urlApi = ['https://api.themoviedb.org/3/search/movie', 'https://api.themoviedb.org/3/search/tv'];
var urlApiLanguages = 'https://api.themoviedb.org/3/configuration/languages';
var urlImg = 'https://image.tmdb.org/t/p/w185';
var languageLabel = 'it';
var query = 'Aliens'; //Utente può cambiare
var lingueAmmesse = ['it', 'en', 'es'];

$(document).ready(function () {

    //dati interfaccia
    var wrapper = $('.wrapper-list');
    var sourceTemplate = $('#film__template').html();

    //click su submit
    var submit = $('#button-film');
    submit.click(function () {

        //dati da utente
        var input = $('#search');
        var selectL = $('.lang-link.selected');

        query = input.val();

        getData(apiKey, urlApi, query, urlImg, languageLabel, wrapper, sourceTemplate);

    });

  });

function getData(apiKey, urlApi, query, urlImg, languageLabel, wrapper, sourceTemplate){
  var apiKey = apiKey,
      urlApi = urlApi,
      query = query,
      urlImg = urlImg,
      languageLabel = languageLabel,
      wrapper = wrapper,
      sourceTemplate = sourceTemplate;
      console.log(urlImg);

      // setto true per verificare se è la prima chiamata
      var newQuery = true;

      for (var i = 0; i < urlApi.length; i++) {
        var count = i;
        var thisUrl = urlApi[i];

        console.log(newQuery);

        $.ajax({
          url: thisUrl,
          method : 'GET',
          data: {
            api_key: apiKey,
            language: languageLabel,
            query: query
          },
          success: function (data) {
            var result = data;
            console.log(result.total_results);
            if(result.total_results > 0){
              printData(result, query, urlImg, languageLabel, wrapper, sourceTemplate, newQuery);
            } else {
              noResult(wrapper);
            }
            //false dopo primo ciclo
            newQuery = false;
            console.log(newQuery);
          },
          error: function (err) {
            wrapper.html('Non ci sono risultati');
          }
        });
      }
}

function printData(arrayApi, query, urlImg, languageLabel, wrapper, sourceTemplate, newQuery){
  var arrayApi = arrayApi,
      query = query,
      urlImg = urlImg,
      languageLabel = languageLabel,
      wrapper = wrapper,
      sourceTemplate   = sourceTemplate,
      template  = Handlebars.compile(sourceTemplate),
      labels = {
          it: {
              'labelTitoloOriginale': 'Titolo originale',
              'labelAnnoUscita': 'Anno di Uscita',
              'labelLingua': 'Lingua',
              'labelVoto': 'Voto',
              'labelType': 'Tipo'
          },
          en: {
              'labelTitoloOriginale': 'Original Title',
              'labelAnnoUscita': 'Release Date',
              'labelLingua': 'Language',
              'labelVoto': 'Vote average',
              'labelType': 'Type'
          }
      };

      var filmsArray = arrayApi.results;

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

          if(thisFilm.original_title){
            var originalTitle = thisFilm.original_title;
            var filmTitle = thisFilm.title;
            var type = 'film';
          }
          if(thisFilm.original_name){
            var originalTitle = thisFilm.original_name;
            var filmTitle = thisFilm.name;
            var type = 'Tv Series';
          }
          if (thisFilm.poster_path){
            var poster = urlImg + thisFilm.poster_path;
            console.log(poster);
          }
            context['films'][i] = {
              labelTitoloOriginale: labels[languageLabel].labelTitoloOriginale,
              labelAnnoUscita:  labels[languageLabel].labelAnnoUscita,
              labelLingua: labels[languageLabel].labelLingua,
              labelVoto:  labels[languageLabel].labelVoto,
              labelType:  labels[languageLabel].labelType,
              filmTitle: filmTitle,
              originalTitle: originalTitle,
              filmYear: thisFilm.release_date,
              filmLanguage: getFlags(thisFilm.original_language),
              stars: filmStar,
              type: type,
              filmPoster: poster
            };
            i++;
      }

      var html = template(context);
      if(newQuery == true){
        wrapper.html(html);
      } else{
        //aggiunge
        wrapper.append(html);
      }
}

function getFlags(language) {
    var flag = '';
    if (lingueAmmesse.includes(language)) {
      flag = '<img src="img/' + language + '.png">';
    } else {
      flag = language;
    }
    return flag;
}

function noResult(wrapper){
  wrapper.html('La ricerca non ha dato risultati');
}
