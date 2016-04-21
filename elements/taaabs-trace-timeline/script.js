function getRectangle(x, y, width, height, color){
	var graphics = new PIXI.Graphics();
	graphics.beginFill(color);
	graphics.drawRect(x, y, width, height);
	return graphics;
};

/**
* Main "class" of the visualization.
*
* @param {!required} start (Number) The begin time of the trace.
* @param {!required} end (Number) The end time of the trace.
* @param {!required} stage (Object) A Pixi Container.
* @param {!optionnal} format (String) Either "DATE" or "ORDER" at this moment. Default is "DATE".
* @param {!optionnal} upperDraw (Boolean) True if the trace is display on top side.
*
* @method focusIntervalChange Triggered when the focus interval changes
* For example, when the user slide the zoom panel, or zoom on the trace panel.
*
* @method init Initialize the TimeLineMain
*
* @method updateZoomLine Update the TimeLine and the ZoomLine according new 'begin' and 'end'.
*/
var TimeLineMain = function(start, end, stage, format, upperDraw){

		// Setting of the default values.
    this._start = start;
    this._end = end;
		this._stage = stage;
    this._format = format || "DATE";
    this._upperDraw = upperDraw || true;

		// Declaration of a callback function.
    this.focusIntervalChange = function(){};

    var timeLineMain = this;

		// Initialization function.
    this.init = function(){

			// We clear the previous trace if it exists.
    	var childrenCount = this._stage.children.length;
    	while( childrenCount > 0 ){
    		this._stage.removeChildAt(0);
    		childrenCount = childrenCount - 1;
    	}

			// We also clear the tooltip display on slideing the zoomline components.
	    if( this._zoomline && this._zoomline._tooltip )
	    	document.removeChild( this._zoomline._tooltip );

			// We set a new TimeLine & format it.
      this._timeline = new Timeline(this._start, this._end, this._format, this._stage);
      this._timeline.formatTimeline();

			// We set a new ZoomLine & set its callback functions
      this._zoomline = new Zoomline(this._start, this._end, this._stage);

			// Triggered when the "begin" slider of the ZoomLine has been moved (i.e mouseup).
      this._zoomline.leftMove = function(){
				// We re-format the TimeLine according the new Time.
        timeLineMain._timeline.setStart( this._leftPointer );
        timeLineMain._timeline.formatTimeline();

				// We trigger the callback function 'focusIntervalChange'.
        that.focusIntervalChange( this._leftPointer, this._rightPointer );
      };

			// Triggered when the "end" slider of the ZoomLine has been moved (i.e mouseup).
      this._zoomline.rightMove = function(){
				// We re-format the TimeLine according the new Time.
        timeLineMain._timeline.setEnd( this._rightPointer );
        timeLineMain._timeline.formatTimeline();

				// We trigger the callback function 'focusIntervalChange'.
        that.focusIntervalChange( this._leftPointer, this._rightPointer );
      };

			// Triggered when the whole slider has been moved.
      this._zoomline.globalMove = function(){
				// We re-format the TimeLine according the new Time.
        timeLineMain._timeline.setStart( this._leftPointer );
        timeLineMain._timeline.setEnd( this._rightPointer );
        timeLineMain._timeline.formatTimeline();

				// We trigger the callback function 'focusIntervalChange'.
        that.focusIntervalChange( this._leftPointer, this._rightPointer );
      }

			// We create the trace.
      this._trace = new Trace(this._start, this._end, this._stage, this._upperDraw);
    }

		// Updates the Timeline and ZoomLine according to 'start' and 'end'.
    this.updateZoomLine = function(start, end){
    	this._zoomline.update(start, end);
    	this._timeline.setStart( start );
    	this._timeline.setEnd( end );
    	this._timeline.formatTimeline();
    }

		// Updates the trace, according to 'start', 'end' and the list of obsels 'obsels'.
    this.updateTrace = function(start, end, obsels){
    	this._trace.displayObsels(start, end, obsels);
    }
}

/**
* Trace "class" of the visualization.
*
* @param {!required} start (Number) The begin time of the trace.
* @param {!required} end (Number) The end time of the trace.
* @param {!required} parent (Object) The TimeLineMain parent.
* @param {!optionnal} upperDraw (Boolean) True if the trace is display on top side.
*
* @method displayObsels Displays a list of obsels, between a 'begin' & 'end'.
*
* @method _getObselShape Returns a Pixi.Graphics object with the shape and color of an obsel.
*/
var Trace = function(start, end, parent, upperDraw){

	// Default params init.
	this._start = start || 0;
	this._end = end || 0;
	this._parent = parent;
	this._obsels = [];
	this._upperDraw = upperDraw || true;

	// Returns a Pixi.Graphics object with the shape and color of an obsel.
	this._getObselShape = function(obsel, size, position){
		if( !obsel.symbol )
			return this._getDiamond(obsel, size, position);
		switch( obsel.symbol.shape ){
			case 'SQUARE':
				return this._getSquare(obsel, size, position);
				break;
			case 'CIRCLE':
				return this._getCircle(obsel, size, position);
				break;
			case 'DIAMOND':
				return this._getDiamond(obsel, size, position);
				break;
			case 'STAR':
				return this._getStar(obsel, size, position);
				break;
			default:
				return this._getDiamond(obsel, size, position);
				break;
		}
	}

	// Returns a square.
	this._getSquare = function(obsel, size, position){
		var obs = new PIXI.Graphics();
		obs.beginFill(obsel.symbol.color);
		obs.alpha = obsel.symbol.opacity;
		obs.drawRect(position.x, position.y, size, size);
		return obs;
	}

	// Returns a circle.
	this._getCircle = function(obsel, size, position){
		var obs = new PIXI.Graphics();
		obs.beginFill(obsel.symbol.color);
		obs.alpha = obsel.symbol.opacity;
		obs.drawCircle(position.x+size/2, position.y+size/2, size / 2);
		return obs;
	}

	// Returns a diamond.
	this._getDiamond = function(obsel, size, position){
		var obs = new PIXI.Graphics();

		if( obsel.symbol && obsel.symbol.color)
			obs.beginFill(obsel.symbol.color);
		else
			obs.beginFill(0x4183D7);

		if( obsel.symbol && obsel.symbol.opacity)
			obs.alpha = obsel.symbol.opacity;
		else
			obs.alpha = 1;

		obs.drawPolygon([
			new PIXI.Point( position.x + ( size / 2 )  , position.y ),
			new PIXI.Point( position.x + size          , position.y + (size / 2) ),
			new PIXI.Point( position.x + ( size / 2 )  , position.y + size ),
			new PIXI.Point( position.x                 , position.y + (size / 2) ),
		]);
		return obs;
	}

	// Returns a star.
	this._getStar = function(obsel, size, position){
		var obs = new PIXI.Graphics();
		obs.beginFill(obsel.symbol.color);
		obs.alpha = obsel.symbol.opacity;
		obs.drawPolygon([
			new PIXI.Point( position.x + ( size / 2 )  , position.y ),
			new PIXI.Point( position.x + ( 2*size / 3 ), position.y + (size / 3) ),
			new PIXI.Point( position.x + size          , position.y + (size / 2) ),
			new PIXI.Point( position.x + ( 2*size / 3 ), position.y + (2*size / 3) ),
			new PIXI.Point( position.x + ( size / 2 )  , position.y + size ),
			new PIXI.Point( position.x + ( size / 3 )  , position.y + (2*size / 3) ),
			new PIXI.Point( position.x                 , position.y + (size / 2) ),
			new PIXI.Point( position.x + ( size / 3 )  , position.y + (size / 3) ),
			]);
		return obs;
	}

	// Displays a list of obsels, between a 'begin' & 'end'.
	this.displayObsels = function(start, end, obsels){

		// The size of the obsels (10px if there's more than 50 obsels, 20px otherwise)
		var obselSize = 0;

		this._start = start;
		this._end = end;

		// We remove the previous obsels drew
		for(var i = 0; i < this._obsels.length ; i++){
			for(var j = 0 ; j < this._obsels[i].length; j++){
				this._parent.removeChild(this._obsels[i][j]);
			}
		}

		// A list of list of obsels.
		// Each list represent an interval, for 10 or 20 obsels to be displayed.
		this._obsels = [];

		// If we have less then 50 obsels, we draw big obsels on 50 intervals.
		// Otherwise, we draw small obsels on 100 intervals.
		if( obsels.length <= 50){
			for(var i = 0 ; i < 51; i ++){
				this._obsels.push([]);
			}
			obselSize = 20;
		}
		else{
			for(var i = 0 ; i < 101 ; i ++){
				this._obsels.push([]);
			}
			obselSize = 10;
		}

		// For each obsels, we stack them on their corresponding intervals.
		for(var i = 0 ; i <  obsels.length ; i++){

			// X = (Position.end - Position.begin)/ (Time.end - Time.begin) * (Time - Time.begin) + Position.begin;
			var pixelPos = ( (1000 - 0) / (end - start) ) * ( obsels[i].end - start ) + 0;

			// The index of the interval in 'obsels'.
			var arrayPos = Math.floor(pixelPos / obselSize);

			// The maximum of obsels per stack.
			var max = 10;
			if(obsels.length > 50)
				max = 20;

			// If we still got room in a stack.
			if(this._obsels[arrayPos].length < max){

				var posy = 0;
				if(this._upperDraw)
					posy = 200 - ( obselSize + 1)*this._obsels[arrayPos].length;
				else
					posy = 10 + ( obselSize + 1)*this._obsels[arrayPos].length;

				var obs = this._getObselShape(  obsels[i],
												obselSize,
												new PIXI.Point(arrayPos*obselSize + 5, posy));


				if( obs !== null){
					this._parent.addChild(obs);

					this._obsels[arrayPos].push(obs);
				}
			}
		}
	};
}

var Zoomline = function(start, end, parent){
	this._start = start || 0;
	this._end = end || 0;
	this._parent = parent;
	this._width = this._parent._width;
	this._height = 19;
	this._xPosition = 0;
	this._yPosition = this._parent._height - 19;
	this._leftPointer = this._start;
	this._rightPointer = this._end;

    this.leftMove = function(){};
    this.rightMove = function(){};
    this.globalMove = function(){};

	this._mainContainer = new PIXI.Container();
	this._rectangle = getRectangle(this._xPosition, this._yPosition, this._width, this._height, 0x4183D7);

	this._mainContainer.addChild(this._rectangle);

	this._parent.addChild( this._mainContainer );

    var zoomLine = this;

    zoomLine._tooltip = document.createElement('div');
	zoomLine._tooltip.style.color = 'white';
	zoomLine._tooltip.style.zIndex = 1000;
	zoomLine._tooltip.style.position = 'fixed';
	zoomLine._tooltip.style.padding = "3px";
	zoomLine._tooltip.style.paddingLeft = '10px';
	zoomLine._tooltip.style.paddingRight = '10px';
	zoomLine._tooltip.style.borderRadius = '2px';
	zoomLine._tooltip.style.border = 'solid 1px white';

	document.body.appendChild( zoomLine._tooltip );


	this.update = function(start, end){
		this._leftPointer = start;
		this._rightPointer = end;

		this._leftSelector.position.x = ( (1000 - 0) / (this._end - this._start) ) * ( start - this._start ) + 0;

		console.log( this._leftSelector.position.x );

		this._rightSelector.position.x = ( (1000 - 0) / (this._end - this._start) ) * ( end - this._start ) + 0;

		console.log( this._rightSelector.position.x );

		this._selectorPanel.position.x = ( (1000 - 0) / (this._end - this._start) ) * ( start - this._start ) + 0;

		console.log( this._selectorPanel.position.x );

		this._selectorPanel.width = ( (1000 - 0) / (this._end - this._start) ) * ( end - this._start ) + 0 - this._selectorPanel.position.x;

		console.log( this._selectorPanel.width );

	}

	this._initLeftSelector = function(){
		this._leftSelector = new PIXI.Graphics();
		this._leftSelector.beginFill(0xaaaaaa);
		this._leftSelector.drawCircle(0, 0 , 6);
		this._leftSelector.position = {x:0, y:this._yPosition + 9};
		this._leftSelector.interactive = true;
		this._leftSelector.cursorStyle = "pointer";
		this._leftSelector.dragging = false;
		this._leftSelector.buttonMode = true;

		this._leftSelector.on('mousedown', function(event){

			this.data = event.data;

			this.dragging = true;

			this.originalY = this.data.originalEvent.clientY;

		});
		this._leftSelector.on('mousemove', function(e){

			if (this.dragging)
			{
				if(this.data.getLocalPosition(this.parent).x < this.parent.getChildAt(2).position.x){

					if( this.data.getLocalPosition(this.parent).x >= 0 ){
						this.position.x = this.data.getLocalPosition(this.parent).x;
						this.parent.getChildAt(0).position.x = this.data.getLocalPosition(this.parent).x;
						this.parent.getChildAt(0).width = this.parent.getChildAt(2).position.x - this.position.x;
					}
					else{
						this.position.x = 0;
						this.parent.getChildAt(0).position.x = 0;
						this.parent.getChildAt(0).width = this.parent.getChildAt(2).position.x - this.position.x;
					}

				}
				else{
					this.position.x = this.parent.getChildAt(2).position.x;
					this.parent.getChildAt(0).position.x = this.parent.getChildAt(2).position.x;
					this.parent.getChildAt(0).width = this.parent.getChildAt(2).position.x - this.position.x;
				}

				zoomLine._tooltip.textContent = Math.floor( ( zoomLine._end - zoomLine._start ) * this.position.x / zoomLine._width );
				zoomLine._tooltip.style.top = this.originalY  + 20;
				zoomLine._tooltip.style.left = this.data.originalEvent.clientX - ( zoomLine._tooltip.offsetWidth / 2 );
				zoomLine._tooltip.style.opacity = 1;
			}
		});
		this._leftSelector.on('mouseup', function(){

			if(this.data.getLocalPosition(this.parent).x < this.parent.getChildAt(2).position.x
				&& this.data.getLocalPosition(this.parent).x >= 0){
				this.position.x = this.data.getLocalPosition(this.parent).x;
				this.parent.getChildAt(0).position.x = this.data.getLocalPosition(this.parent).x;

				this.parent.getChildAt(0).width = this.parent.getChildAt(2).position.x - this.position.x;
			}
			else{
				this.position.x = 0;
				this.parent.getChildAt(0).position.x = 0;
				this.parent.getChildAt(0).width = this.parent.getChildAt(2).position.x - this.position.x;
			}

			this.dragging = false;

			zoomLine._tooltip.style.opacity = 0;

            var leftPointer = ( zoomLine._end - zoomLine._start ) * this.position.x / zoomLine._width;
            zoomLine._leftPointer = zoomLine._start + leftPointer;

			zoomLine.leftMove();
		});
		this._leftSelector.on('mouseupoutside', function(){

			if(this.data.getLocalPosition(this.parent).x < this.parent.getChildAt(2).position.x
				&& this.data.getLocalPosition(this.parent).x >= 0){
				this.position.x = this.data.getLocalPosition(this.parent).x;
				this.parent.getChildAt(0).position.x = this.data.getLocalPosition(this.parent).x;

				this.parent.getChildAt(0).width = this.parent.getChildAt(2).position.x - this.position.x;
			}
			else{
				this.position.x = 0;
				this.parent.getChildAt(0).position.x = 0;
				this.parent.getChildAt(0).width = this.parent.getChildAt(2).position.x - this.position.x;
			}
			this.dragging = false;

			zoomLine._tooltip.style.opacity = 0;

            var leftPointer = ( zoomLine._end - zoomLine._start ) * this.position.x / zoomLine._width;
            zoomLine._leftPointer = zoomLine._start + leftPointer;

            zoomLine.leftMove();
		});



		this._rectangle.addChild(this._leftSelector);

	}

	this._initRightSelector = function(){
		this._rightSelector = new PIXI.Graphics();
		this._rightSelector.beginFill(0xaaaaaa);
		this._rightSelector.drawCircle(0, 0 , 6);
		this._rightSelector.interactive = true;
		this._rightSelector.position = {x:this._width, y:this._yPosition + 9};
		this._rightSelector.buttonMode = true;

		this._rightSelector.on('mousedown', function(event){

			this.data = event.data;

			this.dragging = true;

		});
		this._rightSelector.on('mousemove', function(){

			if (this.dragging)
			{
				if(this.data.getLocalPosition(this.parent).x > this.parent.getChildAt(1).position.x){



					if( this.data.getLocalPosition(this.parent).x < this.parent.parent.parent._width ){

						this.position.x = this.data.getLocalPosition(this.parent).x;
						this.parent.getChildAt(0).width = this.position.x - this.parent.getChildAt(1).position.x;
					}
					else{

						this.position.x = this.parent.parent.parent._width;
						this.parent.getChildAt(0).width = this.position.x - this.parent.getChildAt(1).position.x;
					}

				}
				else{

					this.position.x = this.parent.getChildAt(1).position.x;
					this.parent.getChildAt(0).width = this.position.x - this.parent.getChildAt(1).position.x;
				}

				zoomLine._tooltip.textContent = Math.floor( ( zoomLine._end - zoomLine._start ) * this.position.x / zoomLine._width );
				zoomLine._tooltip.style.top = this.originalY  + 20;
				zoomLine._tooltip.style.left = this.data.originalEvent.clientX - ( zoomLine._tooltip.offsetWidth / 2 );
				zoomLine._tooltip.style.opacity = 1;

			}
		});
		this._rightSelector.on('mouseup', function(){

			if(this.data.getLocalPosition(this.parent).x < this.parent.getChildAt(2).position.x
				&& this.data.getLocalPosition(this.parent).x >= 0){
				this.position.x = this.data.getLocalPosition(this.parent).x;
				this.parent.getChildAt(0).position.x = this.data.getLocalPosition(this.parent).x;

				this.parent.getChildAt(0).width = this.parent.getChildAt(2).position.x - this.position.x;
			}

			this.dragging = false;

            var right = ( zoomLine._end - zoomLine._start ) * this.position.x / zoomLine._width;
            zoomLine._rightPointer = zoomLine._start + right;

            zoomLine.rightMove();

            zoomLine._tooltip.style.opacity = 0;

		});
		this._rightSelector.on('mouseupoutside', function(){

			if(this.data.getLocalPosition(this.parent).x < this.parent.getChildAt(2).position.x
				&& this.data.getLocalPosition(this.parent).x >= 0){
				this.position.x = this.data.getLocalPosition(this.parent).x;
				this.parent.getChildAt(0).position.x = this.data.getLocalPosition(this.parent).x;

				this.parent.getChildAt(0).width = this.parent.getChildAt(2).position.x - this.position.x;
			}
			this.dragging = false;

            var right = ( zoomLine._end - zoomLine._start ) * this.position.x / zoomLine._width;
            zoomLine._rightPointer = zoomLine._start + right;

            zoomLine.rightMove();

            zoomLine._tooltip.style.opacity = 0;
		});


		this._rectangle.addChild(this._rightSelector);




	}

	this._initSelectorPanel = function(){
		this._selectorPanel = getRectangle(0,this._yPosition, this._width, 19, 0xffffff);
		this._selectorPanel.alpha = 0.5;
        this._selectorPanel.interactive = true;
        this._selectorPanel.buttonMode = true;

        this._selectorPanel.on('mousedown', function(event){

			this.data = event.data;
			this.dragging = true;
            this._deltaPos = this.data.getLocalPosition(this.parent).x - this.position.x;

		});
		this._selectorPanel.on('mousemove', function(){



			if (this.dragging)
			{
				if(this.data.getLocalPosition(this.parent).x - this._deltaPos > 0){

					if( this.data.getLocalPosition(this.parent).x - this._deltaPos + this.width < this.parent.parent.parent._width ){

						this.position.x = this.data.getLocalPosition(this.parent).x - this._deltaPos ;
					}
					else{

						this.position.x = this.parent.parent.parent._width - this.width;
					}

				}
				else{
					this.position.x = 0;
				}

                this.parent.getChildAt(2).position.x = this.position.x + this.width;
                this.parent.getChildAt(1).position.x = this.position.x;

			}
		});
		this._selectorPanel.on('mouseup', function(){

			if (this.dragging)
			{
				if(this.data.getLocalPosition(this.parent).x > 0){

					if( this.data.getLocalPosition(this.parent).x - this._deltaPos + this.width < this.parent.parent.parent._width ){

						this.position.x = this.data.getLocalPosition(this.parent).x - this._deltaPos ;
					}
					else{

						this.position.x = this.parent.parent.parent._width - this.width;
					}

				}
				else{
					this.position.x = 0;
				}

                this.parent.getChildAt(2).position.x = this.position.x + this.width;
                this.parent.getChildAt(1).position.x = this.position.x;

			}

			this.dragging = false;

            var leftPointer = ( zoomLine._end - zoomLine._start ) * this.position.x / zoomLine._width;
            zoomLine._leftPointer = zoomLine._start + leftPointer;

            var right = ( zoomLine._end - zoomLine._start ) * ( this.position.x + this.width ) / zoomLine._width;
            zoomLine._rightPointer = zoomLine._start + right;

            zoomLine.globalMove();

		});
		this._selectorPanel.on('mouseupoutside', function(){

			if (this.dragging)
			{
				if(this.data.getLocalPosition(this.parent).x > 0){

					if( this.data.getLocalPosition(this.parent).x - this._deltaPos + this.width < this.parent.parent.parent._width ){

						this.position.x = this.data.getLocalPosition(this.parent).x - this._deltaPos ;
					}
					else{

						this.position.x = this.parent.parent.parent._width - this.width;
					}

				}
				else{
					this.position.x = 0;
				}

                this.parent.getChildAt(2).position.x = this.position.x + this.width;
                this.parent.getChildAt(1).position.x = this.position.x;

			}
			this.dragging = false;

            var leftPointer = ( zoomLine._end - zoomLine._start ) * this.position.x / zoomLine._width;
            zoomLine._leftPointer = zoomLine._start + leftPointer;

            var right = ( zoomLine._end - zoomLine._start ) * ( this.position.x + this.width ) / zoomLine._width;
            zoomLine._rightPointer = zoomLine._start + right;

            zoomLine.globalMove();

		});


		this._rectangle.addChild(this._selectorPanel);
	}

	this._initSelectorPanel();
	this._initLeftSelector();
	this._initRightSelector();

}

var Timeline = function(start, end, format, parent){

	this._start = start || 0;
	this._end = end || 0;
	this._format = format || 'MILLISECOND';
	this._parent = parent;
	this._texts = [];
	this._lines = [];

	this._width = this._parent._width;
	this._height = 35;
	this._xPosition = 0;
	this._yPosition = this._parent._height - 55;

	this._mainContainer = new PIXI.Container();
	this._rectangle = getRectangle(this._xPosition, this._yPosition, this._width, this._height, 0x4183D7);

	this._mainContainer.addChild(this._rectangle);

	this._parent.addChild( this._mainContainer );

	this.setStart = function(start){
		this._start = start;
	}

	this.setEnd = function(end){
		this._end = end;
	}

	this.formatTimeline = function(){

		switch(this._format){
			case "MILLISECOND":
				this._formatMillisecond();
				break;
			case "DATE":
				this._formatDate();
				break;
			default:
				console.log("Error : Timeline Format unknown ( " + this._format + " ).");
				break;
		}

	}

	this._formatDate = function(){

		this._mainContainer.removeChild(this._rectangle);
        this._rectangle = getRectangle(this._xPosition, this._yPosition, this._width, this._height, 0x4183D7);
        this._mainContainer.addChild(this._rectangle);

		this._text = [];
		this._lines = [];

		var x = this._start;
		var y = this._end;

		var z = y - x;

		var originalDate = new Date(this._start);
		var dates = [];


		console.log('z' + z);

		// If z <  10 minutes
		if( z < 1000 * 60 * 10 ){
			originalDate.setSeconds(0);
			originalDate.setMinutes(0);
			originalDate.setHours(0);
			var newBegin = originalDate.getTime();

			while( newBegin < y ){
				if( newBegin > x ){
					if( originalDate.getSeconds() === 0 ){
						var dateString = originalDate.toLocaleString();
						var dateTime = originalDate.getTime();
						dates.push( { big: true, ds: dateString, dt: dateTime} );
					}
					else{
						var dateString = originalDate.toTimeString();
						var dateTime = originalDate.getTime();
						dates.push( { big: false, ds: dateString, dt: dateTime} );
					}
				}
				originalDate = new Date( originalDate.getTime() + 10*1000 );
				newBegin = originalDate.getTime();
			}


		}
		// If z < 10 hours
		else if( z < 1000 * 60 * 60 * 10){
			originalDate.setSeconds(0);
			originalDate.setMinutes(0);
			originalDate.setHours(0);
			var newBegin = originalDate.getTime();

			while( newBegin < y ){
				if( newBegin > x ){
					if( originalDate.getMinutes() === 0 ){
						var dateString = originalDate.toLocaleString();
						var dateTime = originalDate.getTime();
						dates.push( { big: true, ds: dateString, dt: dateTime} );
					}
					else{
						var dateString = originalDate.toTimeString();
						var dateTime = originalDate.getTime();
						dates.push( { big: false, ds: dateString, dt: dateTime} );
					}
				}
				originalDate = new Date( originalDate.getTime() + 10*60*1000 );
				newBegin = originalDate.getTime();
			}
		}
		// If z < 10 days
		else if( z < 1000 * 60 * 60 * 24 * 10){
			originalDate.setSeconds(0);
			originalDate.setMinutes(0);
			originalDate.setHours(0);
			var newBegin = originalDate.getTime();

			while( newBegin < y ){
				if( newBegin > x ){
					if( originalDate.getHours() === 0 ){
						var dateString = originalDate.toDateString();
						var dateTime = originalDate.getTime();
						dates.push( { big: true, ds: dateString, dt: dateTime} );
					}
					else{
						var dateString = originalDate.toDateString();
						var dateTime = originalDate.getTime();
						dates.push( { big: false, ds: dateString, dt: dateTime} );
					}
				}
				originalDate = new Date( originalDate.getTime() + 10*60*60*1000 );
				newBegin = originalDate.getTime();
			}
		}
		// If z < 10 months
		else if( z < 1000 * 60 * 60 * 24 * 30.5 * 10){
			originalDate.setSeconds(0);
			originalDate.setMinutes(0);
			originalDate.setHours(0);
			originalDate.setDate(1);
			var newBegin = originalDate.getTime();

			while( newBegin < y ){
				if( newBegin > x ){
					if( originalDate.getDate() === 1 ){
						var dateString = originalDate.toDateString();
						var dateTime = originalDate.getTime();
						dates.push( { big: true, ds: dateString, dt: dateTime} );
					}
					else{
						var dateString = originalDate.toDateString();
						var dateTime = originalDate.getTime();
						dates.push( { big: false, ds: dateString, dt: dateTime} );
					}
				}
				originalDate = new Date( originalDate.getTime() + 10*24*60*60*1000 );
				newBegin = originalDate.getTime();
			}
		}
		// If z < 10 years
		else if( z < 1000 * 60 * 60 * 24 * 365 * 10){
			originalDate.setSeconds(0);
			originalDate.setMinutes(0);
			originalDate.setHours(0);
			originalDate.setDate(1);
			originalDate.setMonth(1);
			var newBegin = originalDate.getTime();

			while( newBegin < y ){
				if( newBegin > x ){
					if( originalDate.getMonth() === 1 ){
						var dateString = originalDate.toDateString();
						var dateTime = originalDate.getTime();
						dates.push( { big: true, ds: dateString, dt: dateTime} );
					}
					else{
						var dateString = originalDate.toDateString();
						var dateTime = originalDate.getTime();
						dates.push( { big: false, ds: dateString, dt: dateTime} );
					}
				}
				originalDate = new Date( originalDate.getTime() + 10*31*24*60*60*1000 );
				originalDate.setDate(1);
				newBegin = originalDate.getTime();
			}
		}
		else{
			alert('really? A trace over ten years?');
		}

		for( var i = 0; i < dates.length; i++){
			var val = dates[i].dt;
			var line = undefined;

			//var pixelPos = ( val / z ) * this._width-20;

            var pixelPos =  (val - this._start) * (1000 - 0) / (this._end - this._start) + 0;

			pixelPos = pixelPos + 10;

			if( dates[i].big ){
				line = getRectangle(pixelPos, this._yPosition, 1, 15, 0xffffff);
				var text = new PIXI.Text(dates[i].ds,{font : '10px Arial', fill : 0xffffff, align : 'center'});
				text.x = pixelPos - text.width/2;
				text.y = this._yPosition + 10 +  ( 10 * (i%2));
				text.alpha = 0.87;
				this._rectangle.addChild(text);
			}
			else{
				line = getRectangle(pixelPos, this._yPosition, 1, 7, 0xffffff);
				var text = new PIXI.Text(dates[i].ds,{font : '10px Arial', fill : 0xffffff, align : 'center'});
				text.x = pixelPos - text.width/2;
				text.y = this._yPosition + 10 + (10 * (i%2));
				text.alpha = 0.87;
				this._rectangle.addChild(text);
			}
			line.alpha = 0.87;
			this._lines.push(line);
			this._rectangle.addChild(line);
		}

	},

	this._formatMillisecond = function(){


        this._mainContainer.removeChild(this._rectangle);
        this._rectangle = getRectangle(this._xPosition, this._yPosition, this._width, this._height, 0x4183D7);
        this._mainContainer.addChild(this._rectangle);

		this._text = [];
		this._lines = [];

		var x = this._start;
		var y = this._end;

		var z = y - x;

		var z_2 = z / 10;

		var interval = Math.pow( 10 , Math.floor( Math.log10( z_2 ) ) );

		var cut = y / interval;
		var start = x - (x % interval);

		for( var i = 0 ; i < cut ; i ++ ){

			var val = start + interval*i;
			var line = undefined;

			//var pixelPos = ( val / z ) * this._width-20;

            var pixelPos =  (val - this._start) * (1000 - 0) / (this._end - this._start) + 0;

			pixelPos = pixelPos + 10;

			if( (val / interval) % 10 === 0){
				line = getRectangle(pixelPos, this._yPosition, 1, 15, 0xffffff);
				var text = new PIXI.Text(val,{font : '12px Arial', fill : 0xffffff, align : 'center'});
				text.x = pixelPos - text.width/2;
				text.y = this._yPosition + 15;
				text.alpha = 0.87;
				this._rectangle.addChild(text);
			}
			else if( (val / interval) % 5 === 0){
				line = getRectangle(pixelPos, this._yPosition, 1, 10, 0xffffff);
			}
			else{
				line = getRectangle(pixelPos, this._yPosition, 1, 5, 0xffffff);
			}
			line.alpha = 0.87;
			this._lines.push(line);
			this._rectangle.addChild(line);

		}
	}

}
