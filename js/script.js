/*****
  s - string
  a - array
  $ - jQuery element
  n - number
  o - object
******/

//Dati Api
var sApiKey = 'f45eed1b51907eec504d83c2a1f86cae',
    aUrlApi = ['https://api.themoviedb.org/3/search/movie', 'https://api.themoviedb.org/3/search/tv'],
    sUrlApiLanguages = 'https://api.themoviedb.org/3/configuration/languages',
    sUrlImg = 'https://image.tmdb.org/t/p/w342',
    sLanguageLabel = 'it', //lingua base interfaccia
    aLanguagesAllowed = ['it', 'en', 'es']; // per le bandiere

$(document).ready(function() {

  //dati interfaccia
  var $wrapper = $('.films__wrapper'),
      $wrapperError = $('.alert'),
      $sourceTemplate = $('#film__template').html(),
      $input = $('#search'),
      $select = $('#select-language');

  //dati interfaccia details
  var $wrapperDetails = $('.film__details'),
      $sourceTemplateDetails = $('#film__details').html();


  //click su invio faccio ricerca
  $(document).keyup(function(e) {
    if (e.which == 13) {
      //dati da utente
      sQuery = $input.val();
      //controllo lingua scelta
      sLanguageLabel = selectLanguage($select);

      $wrapperError.removeClass('active');

      //svuoto wrapper
      deleteContainer($wrapper, '');
      deleteContainer($wrapperDetails, 'active');

      getData(sApiKey, aUrlApi, sQuery, sUrlImg, sLanguageLabel, $wrapper, $wrapperError, $sourceTemplate);
    }
  });

  $(document).on('mouseenter', '.film__card', function() {
    $(this).addClass('active');
  });
  $(document).on('mouseleave', '.film__card', function() {
    $(this).removeClass('active');
  });

  $(document).on('click', '.film__card', function() {
    var $Id = $(this).attr('data-idCard'),
        $Type = $(this).attr('data-type'),
        $Position = $(this).position();

    //animazione
    $wrapperDetails.addClass('active');
    $wrapperDetails.css('top', $Position.top);
    $wrapperDetails.css('left', 0);

    $('html, body').animate({
      scrollTop: $Position.top
    }, 200, 'linear', function() {
      //alla fine dell'animazione l'overlay si posiziona fixed
      $wrapperDetails.css('position', 'fixed');
      $wrapperDetails.css('top', 0);
      $wrapperDetails.css('left', 0);
    });

    //richiamo di dettagli del film/telefim richiesto
    getDetails(sApiKey, sLanguageLabel, $Type, $Id, $wrapperDetails, $wrapperError, $sourceTemplateDetails);
  });

});

//Funzione ricorsiva che prende dati da Api
function getData(sApiKey, aUrlApi, sQuery, sUrlImg, sLanguageLabel, $wrapper, $wrapperError, $sourceTemplate, isFirstQuery, nCount, aPrevNumberResult, oDataPrev) {

  var sApiKey = sApiKey,
      aUrlApi = aUrlApi,
      sQuery = sQuery,
      sUrlImg = sUrlImg,
      sLanguageLabel = sLanguageLabel,
      $wrapper = $wrapper,
      $wrapperError = $wrapperError,
      $sourceTemplate = $sourceTemplate,
      isFirstQuery = isFirstQuery || false,
      nCount = nCount || 0,
      aPrevResult = [],
      oData = oDataPrev || false;

  //se risultati precedenti passo array
  if (aPrevNumberResult) {
    aPrevResult = aPrevNumberResult;
  } else {
    //altrimenti 0
    aPrevResult.push(0);
  }

  //se la funzione e' stata gia' chiamata e il risultato precedente e' 0
  if (aPrevResult[nCount] == 0 && nCount > 1) {

    // se tutti gli elementi dell'array sono uguali a 0 ritorno true
    var hasResults = aPrevResult.every(function (value) {
      return value === 0;
    });

    //se nessun risultato precedente
    if (hasResults) {
      notResult($wrapperError, sLanguageLabel);
    } else {
      //altrimenti stampo
      printData(oData, sQuery, sUrlImg, sLanguageLabel, $wrapper, $wrapperError, $sourceTemplate, isFirstQuery, aPrevResult);
    }

  }

  // se i risultati precedenti sono diversi da 0 stampo - vale anche per la prima chiamata
  else if (aPrevResult[nCount] != 0) {
    printData(oData, sQuery, sUrlImg, sLanguageLabel, $wrapper, $wrapperError, $sourceTemplate, isFirstQuery, aPrevResult);
  }

  //se count e' inferiore alla lunghezza dell'array chiamata ajax - simulo ciclo
  if (nCount < aUrlApi.length) {
    var sThisUrl = aUrlApi[nCount];
        oQueryData = {
          api_key: sApiKey,
          language: sLanguageLabel,
          query: sQuery
        };

    // se prima query
    // chiamata ajax 1
    if (nCount == 0) {
      isFirstQuery = true;
    } else {
      isFirstQuery = false;
    }

    $.ajax({
      url: sThisUrl,
      method: 'GET',
      data: oQueryData,
      success: function(oData) {
        //conservo numero risultati in array
        var nResult = oData.total_results;
        aPrevResult.push(nResult);

        //aumento counter
        nCount++;
        //richiamo la funzione stessa
        return getData(sApiKey, aUrlApi, sQuery, sUrlImg, sLanguageLabel, $wrapper, $wrapperError, $sourceTemplate, isFirstQuery, nCount, aPrevResult, oData);
      },
      error: function(err) {
        errorAjax($wrapperError, err);
      }
    });
  }
}

//Funzione che stampa dati
function printData(aApi, sQuery, sUrlImg, sLanguageLabel, $wrapper, $wrapperError, $sourceTemplate, isFirstQuery, aPrevResult) {
  var aApi = aApi,
      sQuery = sQuery,
      sUrlImg = sUrlImg,
      sLanguageLabel = sLanguageLabel,
      $wrapper = $wrapper,
      $wrapperError = $wrapperError,
      $sourceTemplate = $sourceTemplate,
      isFirstQuery = isFirstQuery || false,
      aPrevResult = aPrevResult,
      //label per implementare seconda lingua intefaccia
      oLabels = {
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
      aFilms = aApi.results,
      template = Handlebars.compile($sourceTemplate),
      oContext = {
        querySearch: sQuery,
        films: []
      },
      i = 0;

  while (i < aFilms.length) {
    var oThisFilm = aFilms[i],
        // trasformo il voto da numero decimale a intero e da 1 a 10 a 1 a 5
        nFilmVote = Math.ceil(oThisFilm.vote_average / 2),
        maxStars = 5,
        aFilmStar = [];

    //creo un array con le stelle
    for (var j = 0; j < maxStars; j++) {
      if (j < nFilmVote) {
        aFilmStar.push({
          star: true
        });
      } else {
        aFilmStar.push({
          star: false
        });
      }
    }

    //Se film original_title
    if (oThisFilm.original_title) {
      var sOriginalTitle = oThisFilm.original_title,
          sFilmTitle = oThisFilm.title,
          sType = 'film',
          sTypeUrl = 'movie';
    }
    //se serie tv original_name
    if (oThisFilm.original_name) {
      var sOriginalTitle = oThisFilm.original_name,
          sFilmTitle = oThisFilm.name,
          sType = 'Tv Series',
          sTypeUrl = 'tv';
    }
    if (oThisFilm.poster_path) {
      var sPoster = sUrlImg + oThisFilm.poster_path;
    }
    oContext['films'][i] = {
      labelTitoloOriginale: oLabels[sLanguageLabel].labelTitoloOriginale,
      labelAnnoUscita: oLabels[sLanguageLabel].labelAnnoUscita,
      labelLingua: oLabels[sLanguageLabel].labelLingua,
      labelVoto: oLabels[sLanguageLabel].labelVoto,
      labelType: oLabels[sLanguageLabel].labelType,
      filmTitle: sFilmTitle,
      filmOverview: oThisFilm.overview,
      originalTitle: sOriginalTitle,
      filmYear: oThisFilm.release_date,
      filmLanguage: getFlags(oThisFilm.original_language),
      stars: aFilmStar,
      type: sType,
      filmPoster: sPoster,
      id: oThisFilm.id,
      typeUrl: sTypeUrl
    };
    i++;
  }

  var html = template(oContext);

  //se prima query
  if (isFirstQuery) {
    //svuoto alert se ci sono errori
    deleteContainer($wrapperError, 'active');
    //sostituisco html
    $wrapper.html(html);
  } else {
    //appendo risultati
    $wrapper.append(html);
  }

}

//funzione che cerca bandiere
function getFlags(sLanguage) {
  var flag = '';
  if (aLanguagesAllowed.includes(sLanguage)) {
    flag = '<img src="img/' + sLanguage + '.png">';
  } else {
    flag = sLanguage + ' Lingua non disponibile';
  }
  return flag;
}

function getDetails(sApiKey, sLanguage, $Type, id, $wrapper, $wrapperError, $sourceTemplate) {
  var sApiKey = sApiKey,
      sLanguage = sLanguage,
      $Type = $Type,
      sUrl = 'https://api.themoviedb.org/3/' + $Type + '/' + id,
      $wrapper = $wrapper,
      $wrapperError = $wrapperError;

  $.ajax({
    url: sUrl,
    method: 'GET',
    data: {
      api_key: sApiKey,
      language: sLanguage,
      append_to_response: 'credits'
    },
    success: function(oData) {
      var oResult = oData;

      if (oResult.title) {
        var sTitle = oResult.title;
      } else {
        var sTitle = oResult.name;
      }

      var oCast = oResult.credits.cast,
          nCastLength = oResult.credits.cast.length,
          sOverview = oResult.overview,
          aGenres = oResult.genres,
          maxCharacters = 5,
          oFilm = {
            title: sTitle,
            overview: sOverview,
            genres: aGenres,
            characters: []
          };

      for (var i = 0; i < maxCharacters; i++) {

        if (i < nCastLength) {
          var sThisCharacter = oCast[i].character;
          var sThisActor = oCast[i].name;
          oFilm['characters'].push({
            character: sThisCharacter,
            actor: sThisActor
          });
        }

      }
      printDetails(oFilm, $wrapper, $sourceTemplate, sLanguage);
    },
    error: function(err) {
        errorAjax($wrapperError, err);
    }
  });

}

function printDetails(obj, $wrapper, $sourceTemplate, sLanguage) {
  var oContext = obj,
      sLanguage = sLanguage,
      $wrapper = $wrapper,
      $sourceTemplate = $sourceTemplate,
      template = Handlebars.compile($sourceTemplate),
      html = template(oContext);

  //Controllo che l'oggetto contenga qualcosa
  if (Object.keys(oContext).length > 0) {
    //se ci sono risultati aggiungo contenuto
    $wrapper.html(html);
    closeDetails($wrapper);
  } else {
    notResult($wrapper, sLanguage);
    closeDetails($wrapper);
  }
}

function deleteContainer($wrapper, sClassToRemove) {
  var $wrapper = $wrapper,
      sClassToRemove = sClassToRemove;

  $wrapper.html('');
  $wrapper.removeClass(sClassToRemove);
}

//funzione per aggiungere funzionalità pulsante di chiusura
function closeDetails($wrapper) {
  var $wrapper = $wrapper,
      $closeBtn = $wrapper.find('.details__close');

  $closeBtn.click(function() {
    deleteContainer($wrapper, 'active');
  });
}

// funzione che ritorna in caso di assenza di risultati
function notResult($wrapper, sLanguage) {
  var $wrapper = $wrapper,
      sLanguage = sLanguage,
      sMessage = '';

  if (sLanguage == 'it') {
    sMessage = 'La ricerca non ha dato risultati';
  } else {
    sMessage = 'Your search returned no results';
  }
  $wrapper.html('<p>' + sMessage + '</p>');
  $wrapper.addClass('active');
}

// funzione che ritorna in caso di errore
function errorAjax($wrapper, err) {
  console.log(err);
  $wrapper.html('<p>Errore di connessione</p>');
  $wrapper.addClass('active');
}

//funzione per selezione lingua interfaccia
//per future implementazioni
function selectLanguage($select) {
  var $select = $select;
  return $select.val();
}
