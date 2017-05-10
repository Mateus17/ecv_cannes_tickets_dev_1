var app = angular.module('resaTickets', []);

app.controller('ticketController', ['$http', '$scope', function ($http, $scope) {
  var ctrl = this;

  ctrl.temp = [];
  ctrl.dates = [];
  ctrl.days = [];
  ctrl.debussy = [];
  ctrl.lumiere = [];
  ctrl.sessionsSplit = [8.3, 11, 13.3, 15, 18.3, 22, 23.59];
  ctrl.creditCount = 7;
  ctrl.maxSessionPerDay = ctrl.sessionsSplit.length;
  ctrl.loading = false;

  var promise = $http.get('data/dates.json');

  // @_Promise
  // @_TODO_Transform_to_factory
  // @_TODO_Create_JSON_for_days_and_films
  promise.then(function (response) {
    ctrl.dates = response.data[0]['dates'];
    ctrl.loading = true;

    angular.forEach(ctrl.dates, function (valueDate, keyDate) {

      // @_TODO_Get_Position_of_elements_empty_dynamically(prevention)
      /*while (valueDate['films'].length != 8) {
        valueDate['films'].push($scope.newMovie());
      }*/

      angular.forEach(valueDate['films'], function (valueFilm, keyFilm) {
        valueFilm.date = valueDate.date;
        valueFilm.text = 'demander';
        if (valueFilm.startAt) {
          valueFilm.splitTime = parseFloat(valueFilm.startAt.replace(':', '.'));
        }

        if (valueFilm.theater === 'Debussy') {
          ctrl.debussy.push(valueFilm);
        } else if (valueFilm.theater === 'Lumière') {
          ctrl.lumiere.push(valueFilm);
        }
      });
    });

    angular.forEach(ctrl.lumiere, function (valueLum, keyLum) {
      var positionToAssign = [];

      for (var i = 0; i < ctrl.maxSessionPerDay; i++) {
        positionToAssign.push(i);
      }

      // @_Get_Position_for_each_elements
      // @_TODO_Get_Position_of_elements_empty_dynamically
      for (var i = 0; i < ctrl.maxSessionPerDay; i++) {
        if (valueLum.splitTime >= ctrl.sessionsSplit[i] && valueLum.splitTime < ctrl.sessionsSplit[i + 1]) {
          valueLum.position = positionToAssign[i];
        } else if (valueLum.splitTime >= ctrl.sessionsSplit[i] || valueLum.splitTime < ctrl.sessionsSplit[0]) {
          valueLum.position = positionToAssign[i];
        }
      }
    });
  });

  // @_Function_to_Splice_Array_(prevention)
  $scope.spliceArray = function (array, index) {
    if (index > -1) {
      array.splice(index, 1);
    }
  }

  // @_TODO_Render_empty_elements_dynamically
  $scope.newMovie = function () {
    var item = {
      "empty": true,
      "theater": "Lumière",
      "startAt": null,
      "position": null,
    }
    return item;
  }

  // @_Check_status_of_item
  $scope.whatClasses = function (item) {
    var temp = '';
    item.text = 'demander';
    if (item.isHighDemand === true) {
      temp += 'high-demand';
    }
    if (item.selected === true) {
      temp += ' selected';
      item.text = 'demandée';
    }
    if (item.disabled === true) {
      temp += ' disabled';
      item.text = 'film demandé';
    }
    if (item.empty === true) {
      temp += ' empty';
    }
    return temp;
  }

  // @_Function_On_Click_Film
  // @_TODO_Refactoring_for_avoid_repetitions
  $scope.clickFilm = function (clickEvent, item) {
    var creditCost = item.isHighDemand ? 2 : 1;
    if (!item.empty) {
      if (item.disabled) {
        clickEvent.preventDefault();
        clickEvent.stopPropagation();
      } else if (!item.selected && !item.disabled && (ctrl.creditCount - creditCost) >= 0) {
        item.selected = true;
        ctrl.creditCount -= creditCost;
        angular.forEach(ctrl.debussy, function (valueDebussy, keyDebussy) {
          if (valueDebussy.title === item.title && !valueDebussy.selected) {
            valueDebussy.disabled = true;
          }
        });
        angular.forEach(ctrl.lumiere, function (valueLumiere, keyLumiere) {
          if (valueLumiere.title === item.title && !valueLumiere.selected) {
            valueLumiere.disabled = true;
          }
        });
        if (ctrl.creditCount === 0) {
          alert('Dernière réservation effectuée, vous n\'avez plus de crédit disponible !');
        }
      } else if (item.selected) {
        var test = confirm('Annuler la réservation pour le film suivant : ' + item.title + ' ?');
        if (test === true) {
          item.selected = false;
          item.text = 'demander';
          ctrl.creditCount += creditCost;
          angular.forEach(ctrl.debussy, function (valueDebussy, keyDebussy) {
            if (valueDebussy.title === item.title && !valueDebussy.selected) {
              valueDebussy.disabled = false;
            }
          });
          angular.forEach(ctrl.lumiere, function (valueLumiere, keyLumiere) {
            if (valueLumiere.title === item.title && !valueLumiere.selected) {
              valueLumiere.disabled = false;
            }
          });
        }
      } else if ((ctrl.creditCount - creditCost) <= 0) {
        alert('Vous n\'avez pas assez de crédit disponible !');
      } else {
        alert('Vous n\'avez plus de crédit disponible !');
      }
      $scope.whatClasses(item);
    }
  }
}]);
