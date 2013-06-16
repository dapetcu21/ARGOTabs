(function() {
  define(['jquery'], function($) {
    var mod;
    mod = angular.module("components", []);
    mod.directive('navLi', function() {
      return {
        restrict: 'E',
        scope: {
          href: '@'
        },
        transclude: true,
        replace: true,
        controller: [
          '$scope', '$location', function($scope, $location) {
            return $scope.$watch(function() {
              return $location.path();
            }, function(newValue, oldValue) {
              return $scope["class"] = newValue === $scope.href ? 'active' : '';
            });
          }
        ],
        template: "<li class='{{class}}'><a href=\"{{'#' + href}}\" ng-transclude></a></li>"
      };
    });
    mod.directive("textEditCell", function() {
      return {
        templateUrl: 'partials/texteditcell.html',
        scope: {
          value: '=textEditBind'
        },
        link: function(scope, element) {
          scope.editing = false;
          scope.beginEdit = function() {
            var input;
            scope.editing = true;
            input = $(element).find('input');
            input.blur(function() {
              return scope.endEdit();
            });
            input.keypress(function(e) {
              if (e.which === 13) {
                return scope.$apply(function() {
                  return scope.endEdit();
                });
              }
            });
            input[0].value = scope.value;
            return setTimeout(function() {
              input.focus();
              return input.select();
            }, 0);
          };
          return scope.endEdit = function() {
            return scope.editing = false;
          };
        }
      };
    });
  });

}).call(this);
