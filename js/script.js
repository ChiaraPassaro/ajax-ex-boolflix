//Dati Api
var apiKey = 'f45eed1b51907eec504d83c2a1f86cae',
    urlApi = ['https://api.themoviedb.org/3/search/movie', 'https://api.themoviedb.org/3/search/tv'],
    urlApiLanguages = 'https://api.themoviedb.org/3/configuration/languages',
    urlImg = 'https://image.tmdb.org/t/p/w342',
    languageLabel = 'it', //lingua base interfaccia
    lingueAmmesse = ['it', 'en', 'es']; // per le bandiere

$(document).ready(function () {

    //dati interfaccia
    var wrapper = $('.films__wrapper'),
        wrapperError = $('.alert'),
        sourceTemplate = $('#film__template').html(),
        input = $('#search'),
        select = $('#select-language');

    //dati interfaccia details
    var wrapperDetails = $('.film__details'),
        sourceTemplateDetails = $('#film__details').html();


    //click su invio faccio ricerca
    $(document).keyup(function(e){
      if(e.which == 13){
        //dati da utente
        query = input.val();
        //controllo lingua scelta
        languageLabel = selectLanguage(select);

        getData(apiKey, urlApi, query, urlImg, languageLabel, wrapper, sourceTemplate);
        wrapperError.removeClass('active');

        //svuoto wrapper
        deleteContainer(wrapper, '');
        deleteContainer(wrapperDetails, 'active');
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

      //richiamo di dettagli del film/telefim richiesto
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
            var filmCardLength = $('.film__card').length;

            //se il risultato è maggiore di zero faccio chiamata per template
            if(result.total_results > 0){
              printData(result, query, urlImg, languageLabel, wrapper, sourceTemplate);
            }
            //se non ci sono risultati e non ci sono card mando errore
            else if (result.total_results == 0 && filmCardLength == 0){
              var wrapperError = $('.alert');
              wrapperError.addClass('active');
              noResult(wrapperError);
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
      //label per implementare seconda lingua intefaccia
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

      var filmCardLength = $('.film__card').length;

      if( filmCardLength == 0){
        wrapper.html(html);
      } else{
        wrapper.append(html);
      }

}

function deleteData(){

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
      var result = data;
      if(result.title){
        var title = result.title;
      } else {
        var title = result.name;
      }
      var cast = result.credits.cast,
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
      var wrapperError = $('.alert');
      wrapperError.addClass('active');
      wrapperError.html('Si è verificato un errore di connessione');
    }
  });

}

function printDetails(array, wrapper, sourceTemplate){
  var array = array,
      wrapper = wrapper,
      sourceTemplate = sourceTemplate,
      template = Handlebars.compile(sourceTemplate),
      context = array,
      html = template(context);
      if(Object.keys(context).length > 0){
        //aggiungo contenuto
        wrapper.html(html);
        closeDetails(wrapper);
      } else {
        noResult(wrapper);
        closeDetails(wrapper);
      }
}

function deleteContainer(wrapper, classToRemove){
  var wrapper = wrapper,
      classToRemove = classToRemove;

  wrapper.html('');
  wrapper.removeClass(classToRemove);
}

//funzione per aggiungere funzionalità pulsante di chiusura
function closeDetails(wrapper){
  var wrapper = wrapper,
      closeBtn = wrapper.find('.details__close');

  closeBtn.click(function(){
    deleteContainer(wrapper, 'active');
  });
}

//funzione per selezione lingua interfaccia
//per future implementazioni
function selectLanguage(select){
  var select = select;
  return select.val();
}

// funzione che ritorna in caso di assenza di risultati
function noResult(wrapper){
  wrapper.html('<p>La ricerca non ha dato risultati</p>');
}
