let digitalWallet = angular.module("digitalwallet", ['ui.router']);
digitalWallet.config(function($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state('login', {
            url: '/login',
            templateUrl: '../views/login.html'
        })
        .state('register', {
            url: '/register',
            templateUrl: '../views/register.html'
        })
        .state('didList', {
            url: '/didList',
            templateUrl: '../views/didList.html'
        });

    $urlRouterProvider.otherwise('login');
});

digitalWallet.controller("PopupCtrl", ['$scope', '$state', function($scope, $state) {
    $scope.onPopupInit = function() {
        chrome.runtime.sendMessage({ type: "onPopupInit"},
            function(response) {
                if (response) {
                    $scope.didList = response.didList;
                    $state.go('didList');
                } else {
                    $state.go('login');
                }
            }
        );
    }

    $scope.onPopupInit();

    $scope.login = function(formData) {
        chrome.runtime.sendMessage({ type: "login", data: formData },
            function(response) {
                if (response.user) {
                    $scope.didList = response.user.didList;
                    $state.go('didList');
                }
            }
        );
    }

    $scope.register = function(formData) {
        chrome.runtime.sendMessage({ type: "register", data: formData },
            function(response) {
                if (response.token) {
                    $state.go('login');
                }
            }
        );
    }

    $scope.generateDID = function(formData) {
        if (formData && formData.didTitle.trim() !== '') {
            chrome.runtime.sendMessage({ type: "generateDID", data: formData },
                function(response) {
                    console.log(response);
                    if (response) {
                        $scope.didList = response;
                        $state.go('didList');
                    }
                }
            );
        }
    }
}])