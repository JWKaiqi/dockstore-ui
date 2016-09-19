/*
 *    Copyright 2016 OICR
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 */

'use strict';

/**
 * @ngdoc filter
 * @name dockstore.ui.filter:PaginationFilter
 * @function
 * @description
 * # PaginationFilter
 * Filter in the dockstore.ui.
 */
angular.module('dockstore.ui')
  .filter('PaginationFilter', [function () {
    return function (containers, rangeObj) {
      return rangeObj ?
        containers.slice(rangeObj.start, rangeObj.end + 1) : containers;
    };
  }]);
