// constant 
var WEEKDAY = new Array(7);
WEEKDAY[0]=  "Sun.";
WEEKDAY[1] = "Mon.";
WEEKDAY[2] = "Tue.";
WEEKDAY[3] = "Wed.";
WEEKDAY[4] = "Thur.";
WEEKDAY[5] = "Fri.";
WEEKDAY[6] = "Sat.";

// memo , topic/ member data structure
/*
        $scope.members = [
            {id: 'post 5', attendance:  [-1, 0, 1], comments: 'test'},
            {id: 'post 2', attendance:  [1, 1, 1], comments: 'test'},
            {id: 'post 1', attendance:  [-1, 1, 1], comments: 'test'},
            {id: 'post 3', attendance:  [1, 1, 1], comments: 'test'},
            {id: 'post 4', attendance:  [0, 1, -1], comments: ''}
        ];
*/

// [] dependency ui.router
MyApp = angular.module('betterLife',['ui.router','ui.bootstrap']) ;

// config -> html template
// use ui.router and set status (templateURL <-> controller)
MyApp
.config([
    '$stateProvider',
    '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('mypage', {
              url: '/mypage',
              templateUrl: '/mypage.html',
              controller: 'MyPageCtrl',
              resolve: {
                postPromise: [ 'topicsFactory', function (topics) {
                    return topics.getALLTopics();
                }]
              }
            });
        $stateProvider
            .state('home', {
              url: '/home',
              templateUrl: '/home.html',
              controller: 'MainCtrl'
            });
        $stateProvider
            .state('topics', {
              url: '/topics/{id}',
              templateUrl: '/topics.html',
              controller: 'TopicsCtrl',
              resolve: {
                topic: ['$stateParams', 'topicsFactory', function($stateParams, topicsFactory){
                    return topicsFactory.getRestfulTopic($stateParams.id);
                }]
              }
            });
        //$urlRouterProvider.otherwise('home');
        $urlRouterProvider.otherwise('mypage');
    }
]);

// topics factory
MyApp.factory('topicsFactory', ['$http',
        function($http) {
            var service = {
                // Data structure
                // {ID: { title / desc / dates / members } }
                // members: memberID / name / attendance / comments
                _topics : {}
            };

            // get from database through http restful API
            service.getALLTopics = function() {
                return $http.get('/topics').success(function(data) {
                    for (var i = 0; i < data.length; i++) {
                        service._topics[data[i]._id] = data[i];
                    }
                });
            };

            // create a new topic through restful API
            service.createTopic = function(topic, successCallback) {
                return $http.post('/topics', topic).success(function(data) {
                    service._topics[data._id] = data;
                    successCallback(data);
                });
            };
            service.createTopic = function(id, title, description, candidateDates, successCallback) {
                var newTopic = {
                    title : title,
                    description: description,
                    dates: candidateDates,
                    members: []
                };
                return $http.post('/topics', newTopic).success(function(data) {
                    service._topics[data._id] = data;
                    successCallback(data);
                });
            };

            // get topic through restful API
            service.getRestfulTopic = function(id) {
                console.log(id);
                return $http.get('/topics/' + id).then(function(res) {
                    console.log(res.data);
                    return res.data;
                });
            };

            var isValidID = function(id) {
                 if ( id in service._topics ) {
                    return true;
                }
                return false;
            };

            service.getTopicVolume = function () {
                return Object.keys(service._topics).length;
            };

             // get attributes from a specific topicID
            service.getTopic = function(topicID) {
                if ( isValidID(topicID) ) {
                    return service._topics[topicID];
                }
            };
            
            service.deleteTopic = function(topicID) {
                if ( isValidID(topicID) ) {
                    //service_topics.splice(id, 1) ;      //  remove the element
                    delete service._topics[topicID];
                }
            };

            // add members for a specific topic
            service.addMembers = function ( topicID, members ) {
                if ( isValidID(topicID) ) {
                    service._topics[topicID].members = members;
                }
            };
            return service;
        }
]);

// MyPageCtrl with home url , and pattern
MyApp.controller('MyPageCtrl', [
    '$scope',
    '$state',
    'topicsFactory',
    function($scope, $state, topicsFactory) {
        $scope.topics = topicsFactory._topics;
        $scope.load = function() {
            // all jquery could be avaiable after angular scope loaded
        };

        $scope.createTopic = function () {
            // go to 'topics' template view  -> members
            $state.go('home');
        };

        // load 
        $scope.load();
    }
]);

// MainCtrl with home url , and pattern
MyApp.controller('MainCtrl', [
    '$scope',
    '$state',
    'topicsFactory',
    function($scope, $state, topicsFactory) {
        
        $scope.topicTitle = "";
        $scope.topicDescription = "";
        $scope.candidateDates= [];
        $scope.members = [];

        $scope.load = function() {
            // all jquery could be avaiable after angular scope loaded
            $(function() {
                $('#inlineDatepick').datepick(
                    {
                        multiSelect:999,
                        monthsToShow:2,
                        //showTrigger: '#calImg',
                        //onSelect: angular.element('#angularBody').scope().selectDate
                        onSelect: $scope.selectDate
                    });
            });
            //d3.select("body").append("p").text("aaaabbbbetste");
        };

        $scope.addTopic = function () {

            if (!$scope.candidateDates ||
                $scope.candidateDates === [] ||
                $scope.candidateDates.length === 0 ) {
                $scope.selectDate();
            }
            if ( !$scope.topicTitle )  {  return ;    }
            $scope.topicID = topicsFactory.getTopicVolume() + 1;

            cb_topicCreated = function (data) {
                // go to 'topics' template view
                $state.go('topics', {'id' : data._id});
            };

            topicsFactory.createTopic(
                $scope.topicID.toString(), $scope.topicTitle,
                $scope.topicDescription, $scope.candidateDates,
                cb_topicCreated);  // if topic created succefully, go to the topic created page
        };

        $scope.selectDate = function(dates) {
            if (! dates || dates === '') {
                dates=[new Date()];
            }
            $scope.candidateDates = [];
            for (var i = 0; i < dates.length; i++) {
                 $scope.candidateDates.push($.datepick.formatDate(dates[i]));
            }
            $scope.candidateDates.sort();
            //console.log($scope.candidateDates);
        };

        // load 
        $scope.load();
    }
]);

// PostCtrl with url: '/topics/{id}', adn topics.html template
MyApp.controller('TopicsCtrl', [
    '$scope',
    '$stateParams',
    '$modal',
    'topicsFactory',
    'topic',   // get from resovle at state provider
    function($scope, $stateParams, $modal, topicsFactory, topic) {
        //$scope.topicID = $stateParams.id;
        //$scope.topic = topicsFactory.getTopic($scope.topicID);
        $scope.topic = topic;
        $scope.topicID = $scope.topic._id;  // system id
        $scope.selectedResults=[];

        $scope.load = function() {
            $(function() {
                // action after loading the ng  models
            });
        };

        $scope.getFullDate = function (date) {
            //console.log(date);
            var weekday = WEEKDAY[new Date(date).getDay()];
            return date + " (" + weekday + ")";
        };

        $scope.hasComment = function(member) {
            if (!member || !member.comments || member.comments === "" ) {
                return false;
            }
            return true;
        };

        $scope.initialAttendance = function (selectedResults) {
            if ($scope.topic.dates.length != selectedResults.length) {
                console.log("ERROR! Some dates are missing to be selected.");
                alert("ERROR! Some dates are missing to be selected.");
            } else {
                var attendances = [];
                for ( var dateIdx  in $scope.topic.dates) {
                    //var att = Math.floor((Math.random() * 3) -1);
                    var att = selectedResults[dateIdx];
                    attendances.push(att);
                    console.log(att);
                }
                return attendances;
            }
        };

        /*
        $scope.addMember = function(newMember) {
           
            return newMember;
        };
        */

        $scope.addJoinMember = function (size) {
            var modalInstance = $modal.open({
              templateUrl: 'memberModel.html',
              controller: 'MemberModalInstanceCtrl',
              size: size,
              resolve: {
                topicID: function() {
                    return $scope.topicID;
                },
                currentMembers: function() {
                    return $scope.topic.members;
                },
                candidateDates: function () {
                    return $scope.topic.dates;
                }
              }
            });

            modalInstance.result.then(
                function (selectedResults) {
                    // create a new member object
                    var memberID = $scope.topic.members.length;
                    var newMember = {
                        memID: memberID + 1,
                        name : selectedResults[0],
                        attendance : $scope.initialAttendance(selectedResults[1]),
                        comments: selectedResults[2]
                    };
                    // $scope.addMember(newMember);
                    $scope.topic.members.push(newMember);
            }, function () {
              console.info('Modal dismissed at: ' + new Date());
            });
        };

        // Add adminstrator
        // topicsFactory.topic have referece to current $scope.topic
        // add members will also add to topicFactory
        // $scope.adminMember = $scope.addMember("Admin");
        $scope.load();
    }
]);


MyApp.controller('MemberModalInstanceCtrl',
    function ($scope, $modalInstance, topicID, currentMembers, candidateDates) {
        $scope.topicID = topicID;
        $scope.currentMembers = currentMembers;
        $scope.candidateDates = candidateDates;
        $scope.selections = [];
        $scope.submit_valid = false;
        for (var idx = 0; idx < candidateDates.length; idx++ ) {
            $scope.selections.push({
                date : candidateDates[idx],
                willing: 'OK'
            });
        }
     
         $scope.getFullDate = function (date) {
            //console.log(date);
            var weekday = WEEKDAY[new Date(date).getDay()];
            return date + " (" + weekday + ")";
        };

        var memberExist = function(memberName) {
            var found = false;
            for ( var memberIdx in $scope.currentMembers) {
                if (memberName == $scope.currentMembers[memberIdx].name)  {
                    console.log("Member Found!");
                    found = true;
                }
            }
            return found;
        };

        var encodeSelect = function (labelSelections) {
            var willingResults = [];
            for (var idx = 0; idx < labelSelections.length; idx++) {
                if ( labelSelections[idx].willing == 'OK' ) {
                    willingResults.push(1);
                } else if ( labelSelections[idx].willing == 'MIDDLE' ) {
                    willingResults.push(0);
                } else {
                    willingResults.push(-1);
                }
            }
            return willingResults;
        };

        $scope.confirm = function () {
            if ($scope.selectForm.$valid ) {
                var willingResults = encodeSelect($scope.selections);
                $modalInstance.close([$scope.memberName,
                                                        willingResults,
                                                        $scope.memberComment]);
            }
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
});


MyApp.directive('uniqueUsername',[
    '$http',
    'topicsFactory',
    function($http, topicsFactory) {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, element, attrs, ngModel) {
                function validate(value) {
                     var topic = topicsFactory.getTopic(scope.topicID);
                     var found = false;
                     for ( var memberIdx in topic.members) {
                            if (ngModel.$viewValue == topic.members[memberIdx].name)  {
                                console.log("Member Found!");
                                found = true;
                            }
                        }
                    if (topic.members && !found) {
                        scope.submit_valid = true;
                        ngModel.$setValidity('unique', true);
                    } else {
                        scope.submit_valid = false;
                        ngModel.$setValidity('unique', false);
                    }
                }
                scope.$watch( function() {
                  return ngModel.$viewValue;
                }, validate);
            }
      };
    }
]);