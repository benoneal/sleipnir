Object.defineProperty(exports,"__esModule",{value:!0});var isBrowser="undefined"==typeof module&&self&&!self.module&&"undefined"!=typeof window&&"undefined"!=typeof document&&9===document.nodeType,isNumber=function(e){return"number"==typeof e||!isNaN(Number(e))&&!isNaN(parseInt(e))},setState=function(e){void 0===e&&(e={});for(var t=[],n=arguments.length-1;0<n--;)t[n]=arguments[n+1];if(0===t.length)return e;var r=t.shift();return"function"==typeof r?setState.apply(void 0,[r(e)].concat(t)):0===t.length?r:((e=isNumber(r)?Array.from(e||[]):Object.assign({},e||{}))[r]=setState.apply(void 0,[e[r]].concat(t)),e)},simpleHandler=function(){for(var n=[],e=arguments.length;e--;)n[e]=arguments[e];return function(e,t){return setState.apply(void 0,[e].concat(n,[t]))}},getState=function(e,t){for(var n=[],r=arguments.length-2;0<r--;)n[r]=arguments[r+2];if(0===n.length)return t;var a=n.shift();return"function"==typeof a?getState.apply(void 0,[e,a(t,e)].concat(n)):0===n.length?t[a]:getState.apply(void 0,[e,t[a]].concat(n))},createSelector=function(t){for(var n=[],e=arguments.length-1;0<e--;)n[e]=arguments[e+1];return function(e){return getState.apply(void 0,[e,"function"==typeof t?t(e,e):e[t]].concat(n))}},chain=function(){for(var t=[],e=arguments.length;e--;)t[e]=arguments[e];return function(e,n){return t.reduce(function(e,t){return t(e,n)},e)}},constants={},handlers={},namedAsync={},initialStateBuffer=[{pending:{},succeeded:{},failed:{},ssr_cached:{}}],addConstant=function(e){return constants[e]=e},addInitialState=function(e){return initialStateBuffer.push(e)},addHandler=function(e,t){return handlers[e]=t},setNamedAsync=function(e){return Object.entries(e).forEach(function(e){var t=e[0],n=e[1];return namedAsync[t]=n})},setSucceeded=function(t){return function(e){return setState(e,"succeeded",t,!0)}},setFailed=function(t){return function(e){return setState(e,"failed",t,!0)}},setIsPending=function(t){return function(e){return setState(e,"pending",t,!0)}},setNotPending=function(t){return function(e){return setState(e,"pending",t,!1)}},setSSRCached=function(t){return function(e){return setState(e,"ssr_cached",t,!isBrowser)}},trimPayload=function(e){return 1===e.length?e[0]:e},SUCCESS="_SUCCESS",FAILURE="_FAILURE",SSR_CACHE="_SSR_CACHE",createAsyncAction=function(a,e){var i=e.async,t=e.handler,n=e.errorHandler;if(addHandler(a,setIsPending(a)),addHandler(a+SUCCESS,chain(setNotPending(a),setSucceeded(a),t)),addHandler(a+FAILURE,chain(setNotPending(a),setFailed(a),n||t)),addHandler(a+SSR_CACHE,setSSRCached(a)),"string"==typeof i){var r=i;if(!namedAsync[r])throw new Error("Named async method ["+r+"] has not been set by setNamedAsync");i=namedAsync[r]}return function(){for(var r=[],e=arguments.length;e--;)r[e]=arguments[e];return function(t,e){var n=e();return isBrowser||t({type:a+SSR_CACHE}),n.ssr_cached[a]&&isBrowser?t({type:a+SSR_CACHE}):n.pending[a]?void 0:(t({type:a}),i(trimPayload(r),n,t).then(function(e){return t({type:a+SUCCESS,payload:e})},function(e){return t({type:a+FAILURE,error:e})}))}}},defaultHandler=function(e){return e},createAction=function(a,e){void 0===e&&(e={});var t=e.async,n=e.handler;void 0===n&&(n=defaultHandler);var r=e.errorHandler;void 0===r&&(r=defaultHandler);var i=e.initialState;return void 0===i&&(i={}),addConstant(a),addInitialState(i),t?createAsyncAction(a,{async:t,handler:n,errorHandler:r}):(addHandler(a,n),function(e){for(var t=[],n=arguments.length-1;0<n--;)t[n]=arguments[n+1];var r=trimPayload(e&&e.hasOwnProperty("nativeEvent")?t:[e].concat(t));return{type:a,payload:r}})},initialState=function(e){return initialStateBuffer.reduce(function(e,t){return Object.assign({},e,t)},{})},reducer=function(e,t){void 0===e&&(e=initialState()),void 0===t&&(t={});var n=t.type,r=t.payload,a=t.error;return e.pending&&e.succeeded&&e.failed||(e=Object.assign({},initialState(),e)),handlers.hasOwnProperty(n)?handlers[n](e,r,a):e};exports.constants=constants,exports.createAction=createAction,exports.createSelector=createSelector,exports.default=reducer,exports.setNamedAsync=setNamedAsync,exports.setState=setState,exports.simpleHandler=simpleHandler;
