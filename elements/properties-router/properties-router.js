// jshint browser:true, devel:true
/* globals Polymer */

/*
This component has a property `route` which is reflected in the `hash` part of the location.
Using bi-directionnal binding,
this automatically saves and restore properties of other components.

Example:

    <containing-component>
      <properties-router route="{{route}}"></properties-router>
      <some-component prop="{{route.part1}}"></some-component>
      <other-component prop1="{{route.part2}}" prop2="{{route.part3}}"></other-component>
    </containing-component>

@demo demo/router.html
*/
Polymer({
    
    is: 'properties-router',
    
    properties: {
        
        /**
         * The current route
         */
        route: {
            type: Object,
            notify: true,
        },

    },

    observers: [
	"_routeDeepChange(route.*)",
    ],
    
    // Element Lifecycle

    created: function() {
        //console.log(this.localName + " created");
        this._initialHash = location.hash;
    },

    attached: function() {
        //console.log(this.localName + " attached");
	var that = this;

        that.route = that._parseHash(that._initialHash);
        delete that._initialHash;
	
        window.addEventListener("hashchange", function(evt) {
          //console.log("hashchange " + location.hash);
          that.route = that._parseHash(location.hash);
        }, false);
    },
    
    // Element Behavior

    _routeDeepChange: function(evt) {
        //console.log(this.localName + " route properties changed " + this._formatRoute((this.route)));
        location.hash = this._formatRoute(this.route);
    },
    
    // TODO : improve the two functions below,
    // to support a better format for hash (e.g. #a=b&c=d&e=f)
    
    _formatRoute: function(route) {
        return "#" + JSON.stringify(route);	
    },

    _parseHash: function(hash) {
	return JSON.parse(decodeURIComponent(hash.substr(1)) || "{}");
    },

});
