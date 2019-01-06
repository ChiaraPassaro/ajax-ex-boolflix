//Dati Api
var apiKey = 'f45eed1b51907eec504d83c2a1f86cae',
  urlApi = ['https://api.themoviedb.org/3/search/movie', 'https://api.themoviedb.org/3/search/tv'],
  urlApiLanguages = 'https://api.themoviedb.org/3/configuration/languages',
  urlImg = 'https://image.tmdb.org/t/p/w342',
  languageLabel = 'it', //lingua base interfaccia
  languagesAllowed = ['it', 'en', 'es']; // per le bandiere

$(document).ready(function() {

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
  $(document).keyup(function(e) {
    if (e.which == 13) {
      //dati da utente
      query = input.val();
      //controllo lingua scelta
      languageLabel = selectLanguage(select);

      wrapperError.removeClass('active');

      //svuoto wrapper
      deleteContainer(wrapper, '');
      deleteContainer(wrapperDetails, 'active');

      getData(apiKey, urlApi, query, urlImg, languageLabel, wrapper, wrapperError, sourceTemplate);
    }
  });

  $(document).on('mouseenter', '.film__card', function() {
    $(this).addClass('active');
  });
  $(document).on('mouseleave', '.film__card', function() {
    $(this).removeClass('active');
  });

  $(document).on('click', '.film__card', function() {
    var id = $(this).attr('data-idCard'),
      type = $(this).attr('data-type'),
      position = $(this).position();

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

//Funzione che prende dati da Api
function getData(apiKey, urlApi, query, urlImg, languageLabel, wrapper, wrapperError, sourceTemplate, isFirstQuery, count, prevNumberResult, dataPrev) {

  var apiKey = apiKey,
    urlApi = urlApi,
    query = query,
    urlImg = urlImg,
    languageLabel = languageLabel,
    wrapper = wrapper,
    wrapperError = wrapperError,
    sourceTemplate = sourceTemplate,
    isFirstQuery = isFirstQuery || false,
    count = count || 0,
    prevResult = [],
    data = dataPrev || false;

  //se risultati precedenti passo array
  if (prevNumberResult) {
    prevResult = prevNumberResult;
  } else {
    //altrimenti 0
    prevResult.push(0);
  }

  //se la funzione e' stata gia' chiamata e il risultato precedente e' 0
  if (prevResult[count] == 0 && count > 1) {
    // se tutti gli elementi dell'array sono uguali a 0 ritorno true
    var noResults = prevResult.reduce(function(accumulator, currentValue, currentIndex, array) {
      if (array[currentIndex - 1] === currentValue && currentValue === 0) {
        return true;
      } else {
        return false;
      }
    }, 0);

    //se nessun risultato precedente
    if (noResults) {
      noResult(wrapperError);
    } else {
      //altrimenti stampo
      printData(data, query, urlImg, languageLabel, wrapper, sourceTemplate, isFirstQuery, prevResult);
    }

  }

  // se i risultati precedenti sono diversi da 0 stampo vale anche per la prima chiamata
  else if (prevResult[count] != 0) {
    printData(data, query, urlImg, languageLabel, wrapper, sourceTemplate, isFirstQuery, prevResult);
  }

  //se count e' inferiore alla lunghezza dell'array chiamata ajax - simulo ciclo
  if (count < urlApi.length) {
    var thisUrl = urlApi[count];
    queryData = {
      api_key: apiKey,
      language: languageLabel,
      query: query
    };

    // se prima query
    // chiamata ajax 1
    if (count == 0) {
      $.ajax({
        url: thisUrl,
        method: 'GET',
        data: queryData,
        success: function(data) {
          var numberResult = data.total_results;
          prevResult.push(numberResult);

          //aumento counter
          count++;
          //richiamo la funzione stessa
          return getData(apiKey, urlApi, query, urlImg, languageLabel, wrapper, wrapperError, sourceTemplate, true, count, prevResult, data);
        },
        error: function(err) {
          wrapper.html('Non ci sono risultati');
        }
      });
    }
    // se altra query
    // chiamata ajax altra
    else if (count > 0) {

      $.ajax({
        url: thisUrl,
        method: 'GET',
        data: queryData,
        success: function(data) {
          var numberResult = data.total_results;
          prevResult.push(numberResult);

          //aumento counter
          count++;
          //richiamo la funzione stessa
          return getData(apiKey, urlApi, query, urlImg, languageLabel, wrapper, wrapperError, sourceTemplate, false, count, prevResult, data);
        },
        error: function(err) {
          wrapper.html('Non ci sono risultati');
        }
      });

    }
  }
}

//Funzione che stampa dati
function printData(arrayApi, query, urlImg, languageLabel, wrapper, sourceTemplate, isFirstQuery, prevResult) {
  var arrayApi = arrayApi,
    query = query,
    urlImg = urlImg,
    languageLabel = languageLabel,
    wrapper = wrapper,
    sourceTemplate = sourceTemplate,
    template = Handlebars.compile(sourceTemplate),
    isFirstQuery = isFirstQuery || false,
    prevResult = prevResult,
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
    },
    filmsArray = arrayApi.results,
    context = {
      querySearch: query,
      films: []
    },
    i = 0;

  while (i < filmsArray.length) {
    var thisFilm = filmsArray[i],
      // trasformo il voto da numero decimale a intero e da 1 a 10 a 1 a 5
      filmVote = Math.ceil(thisFilm.vote_average / 2),
      maxStars = 5,
      filmStar = [];

    //creo un array con le stelle
    for (var j = 0; j < maxStars; j++) {
      if (j < filmVote) {
        filmStar.push({
          star: true
        });
      } else {
        filmStar.push({
          star: false
        });
      }
    }

    if (thisFilm.original_title) {
      var originalTitle = thisFilm.original_title,
        filmTitle = thisFilm.title,
        type = 'film',
        typeUrl = 'movie';
    }
    if (thisFilm.original_name) {
      var originalTitle = thisFilm.original_name,
        filmTitle = thisFilm.name,
        type = 'Tv Series',
        typeUrl = 'tv';
    }
    if (thisFilm.poster_path) {
      var poster = urlImg + thisFilm.poster_path;
    }
    context['films'][i] = {
      labelTitoloOriginale: labels[languageLabel].labelTitoloOriginale,
      labelAnnoUscita: labels[languageLabel].labelAnnoUscita,
      labelLingua: labels[languageLabel].labelLingua,
      labelVoto: labels[languageLabel].labelVoto,
      labelType: labels[languageLabel].labelType,
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

  var html = template(context),
    wrapperError = $('.alert');

  //se prima query
  if (isFirstQuery) {
    //svuoto alert se ci sono errori
    deleteContainer(wrapperError, 'active');
    wrapper.html(html);
  } else {
    //appendo risultati
    wrapper.append(html);
  }

}

//funzione che cerca bandiere
function getFlags(language) {
  var flag = '';
  if (languagesAllowed.includes(language)) {
    flag = '<img src="img/' + language + '.png">';
  } else {
    flag = language + ' Lingua non disponibile';
  }
  return flag;
}

function getDetails(apiKey, language, type, id, wrapper, sourceTemplate) {
  var apiKey = apiKey,
    language = language,
    type = type,
    url = 'https://api.themoviedb.org/3/' + type + '/' + id,
    wrapper = wrapper;

  $.ajax({
    url: url,
    method: 'GET',
    data: {
      api_key: apiKey,
      language: language,
      append_to_response: 'credits'
    },
    success: function(data) {
      var result = data;

      if (result.title) {
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

      for (var i = 0; i < maxCharacters; i++) {

        if (i < castLength) {
          var thisCharacter = cast[i].character;
          var thisActor = cast[i].name;
          array['characters'].push({
            character: thisCharacter,
            actor: thisActor
          });
        }

      }
      printDetails(array, wrapper, sourceTemplate);
    },
    error: function(err) {
      var wrapperError = $('.alert');
      wrapperError.addClass('active');
      wrapperError.html('Si è verificato un errore di connessione');
    }
  });

}

function printDetails(array, wrapper, sourceTemplate) {
  var array = array,
    wrapper = wrapper,
    sourceTemplate = sourceTemplate,
    template = Handlebars.compile(sourceTemplate),
    context = array,
    html = template(context);

  if (Object.keys(context).length > 0) {
    //aggiungo contenuto
    wrapper.html(html);
    closeDetails(wrapper);
  } else {
    noResult(wrapper);
    closeDetails(wrapper);
  }
}

function deleteContainer(wrapper, classToRemove) {
  var wrapper = wrapper,
    classToRemove = classToRemove;

  wrapper.html('');
  wrapper.removeClass(classToRemove);
}

//funzione per aggiungere funzionalità pulsante di chiusura
function closeDetails(wrapper) {
  var wrapper = wrapper,
    closeBtn = wrapper.find('.details__close');

  closeBtn.click(function() {
    deleteContainer(wrapper, 'active');
  });
}

//funzione per selezione lingua interfaccia
//per future implementazioni
function selectLanguage(select) {
  var select = select;
  return select.val();
}

// funzione che ritorna in caso di assenza di risultati
function noResult(wrapper) {
  wrapper.html('<p>La ricerca non ha dato risultati</p>');
  wrapper.addClass('active');
}
