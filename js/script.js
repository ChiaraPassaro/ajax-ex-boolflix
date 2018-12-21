//Dati Api
var apiKey = 'f45eed1b51907eec504d83c2a1f86cae';
var urlApi = ['https://api.themoviedb.org/3/search/movie', 'https://api.themoviedb.org/3/search/tv'];
var urlApiLanguages = 'https://api.themoviedb.org/3/configuration/languages';
var urlImg = 'https://image.tmdb.org/t/p/w342';
var languageLabel = 'it';
//var query = 'Aliens'; //Utente può cambiare
var lingueAmmesse = ['it', 'en', 'es'];

$(document).ready(function () {

    //dati interfaccia
    var wrapper = $('.films__wrapper');
    var sourceTemplate = $('#film__template').html();
    var input = $('#search');

    //dati interfaccia
    var wrapperDetails = $('.film__details');
    var sourceTemplateDetails = $('#film__details').html();

    $(document).keyup(function(e){
      if(e.which == 13){
        //dati da utente
        query = input.val();
        getData(apiKey, urlApi, query, urlImg, languageLabel, wrapper, sourceTemplate);
        wrapper.html('');
        wrapperDetails.removeClass('active');
      }
    });

    $(document).on('mouseenter', '.film__card', function(){
      $(this).addClass('active');
    });
    $(document).on('mouseleave', '.film__card', function(){
      $(this).removeClass('active');
    });

    $(document).on('click', '.film__card', function(){
      var id = $(this).attr('data-idCard');
      var type = $(this).attr('data-type');
      var position = $(this).position();

      //animazione
      wrapperDetails.addClass('active');
      wrapperDetails.css('top', position.top);
      wrapperDetails.css('left', 0);

      $('html, body').animate({
        scrollTop: position.top
      }, 200, 'linear', function() {
        //alla fine dell'animazione l'overlay si posiziona fixed
        wrapperDetails.css('position', 'fixed');
        wrapperDetails.css('top', 0);
        wrapperDetails.css('left', 0);
      });

      getDetails(apiKey, languageLabel, type, id, wrapperDetails, sourceTemplateDetails);
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

      for (var i = 0; i < urlApi.length; i++) {
        var count = i;
        var thisUrl = urlApi[i];

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
            //controllo se sono state generate delle card
            var listResult = $('.film__card').length;

            //se il risultato è zero faccio chiamata per template
            if(result.total_results > 0){
              printData(result, query, urlImg, languageLabel, wrapper, sourceTemplate);
            }
            //se non ci sono risultati e non ci sono card mando errore
            else if (result.total_results == 0 && listResult == 0){
              noResult(wrapper);
            }
          },
          error: function (err) {
            wrapper.html('Non ci sono risultati');
          }
        });
      }
}

function printData(arrayApi, query, urlImg, languageLabel, wrapper, sourceTemplate){
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
              'labelLingua': 'Lingua Originale',
              'labelVoto': 'Voto',
              'labelType': 'Tipo'
          },
          en: {
              'labelTitoloOriginale': 'Original Title',
              'labelAnnoUscita': 'Release Date',
              'labelLingua': 'Original Language',
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
            var typeUrl = 'movie'
          }
          if(thisFilm.original_name){
            var originalTitle = thisFilm.original_name;
            var filmTitle = thisFilm.name;
            var type = 'Tv Series';
            var typeUrl = 'tv'
          }
          if (thisFilm.poster_path){
            var poster = urlImg + thisFilm.poster_path;
          }
            context['films'][i] = {
              labelTitoloOriginale: labels[languageLabel].labelTitoloOriginale,
              labelAnnoUscita:  labels[languageLabel].labelAnnoUscita,
              labelLingua: labels[languageLabel].labelLingua,
              labelVoto:  labels[languageLabel].labelVoto,
              labelType:  labels[languageLabel].labelType,
              filmTitle: filmTitle,
              filmOverview: thisFilm.overview,
              originalTitle: originalTitle,
              filmYear: thisFilm.release_date,
              filmLanguage: getFlags(thisFilm.original_language),
              stars: filmStar,
              type: type,
              filmPoster: poster,
              id: thisFilm.id,
              typeUrl: typeUrl
            };
            i++;
      }

      var html = template(context);

      if($('.film__card').length == 0){
        wrapper.html(html);
      } else{
        wrapper.append(html);
      }

}

//funzione che cerca bandiere
function getFlags(language) {
    var flag = '';
    if (lingueAmmesse.includes(language)) {
      flag = '<img src="img/' + language + '.png">';
    } else {
      flag = language + ' Lingua non disponibile';
    }
    return flag;
}

function noResult(wrapper){
  wrapper.html('La ricerca non ha dato risultati');
}

function getDetails(apiKey, language, type, id, wrapper, sourceTemplate){
  var apiKey = apiKey,
  language = language,
  type = type,
  url = 'https://api.themoviedb.org/3/' + type + '/' + id,
  wrapper = wrapper;

  $.ajax({
    url: url,
    method : 'GET',
    data: {
      api_key: apiKey,
      language: language,
      append_to_response: 'credits'
    },
    success: function (data) {
      var result = data,
          title = result.title,
          cast = result.credits.cast,
          castLength = result.credits.cast.length,
          overview = result.overview,
          genres = result.genres,
          maxCharacters = 5,
          array = {
            title: title,
            overview: overview,
            genres: genres,
            characters: []
          };

          console.log(cast);
      for (var i = 0; i < maxCharacters; i++) {
        if(i < castLength){
          var thisCharacter = cast[i].character;
          var thisActor = cast[i].name;
          array['characters'].push({character: thisCharacter, actor: thisActor});
        }
      }
      printDetails(array, wrapper, sourceTemplate);
    },
    error: function (err) {
      console.log(err);
      var wrapperError = $('.alert');
      wrapperError.html('Non ci sono risultati');
    }
  });

}

function printDetails(array, wrapper, sourceTemplate){
  var array = array,
      wrapper = wrapper,
      sourceTemplate = sourceTemplate,
      template = Handlebars.compile(sourceTemplate);
      var context = array;

      var html = template(context);

      wrapper.html(html);
      closeDetails(wrapper);
}

function closeDetails(wrapper){
  var wrapper = wrapper,
      closeBtn = wrapper.find('.details__close');

  closeBtn.click(function(){
    wrapper.removeClass('active');
  });
}
