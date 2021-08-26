export default class ArtGenerator {

	constructor( opts ){
		this.ctx = opts.ctx;
		this.slowmo = false;
		this.slowmoDelay = opts.slowmoDelay || 0;
		this.renderCallback = opts.renderCallback;
		this.instructions = [];
	}

	EnableSlowMode(disable){
		this.slowmo = !disable;
	}

	async UpdateCanvas(){
		if(this.updatingCanvas) return;
		this.updatingCanvas = true;
		for(let instruction of this.instructions){
			// Allow interruption of async call
			if(!this.updatingCanvas) return;
			if(this.slowmo) await this.Delay(this.slowmoDelay);
			if(typeof instruction === "function") instruction();
		}
		this.updatingCanvas = false;
		if(typeof this.renderCallback == 'function') this.renderCallback();
	}

	ResetUpdateCanvas(){
		this.updatingCanvas = false;
		this.instructions = [];
	}

	ScaleContext(m){
		this.instructions.push(
			this._scaleContext.bind({ctx: this.ctx}, m)
		);
	}
	DrawAtmosphere(color){
		this.instructions.push(
			this._drawAtmosphere.bind({ctx: this.ctx}, color)
		);
	}
	// Draw a 1x1 square at specified coordinates
	DrawPoint(x, y, color){
		this.instructions.push(
			this._drawPoint.bind({ctx: this.ctx}, x, y, color)
		);
	}
	
	// Draw a 1xh vertical rectangle at specified coordinates
	DrawCol(x, y, h, color){
		this.instructions.push(
			this._drawCol.bind({ctx: this.ctx}, x, y, h, color)
		);
	}

	/**
	 * Core Methods
	 */
	_scaleContext(m){
		this.ctx.scale(m, m);
	}
	_drawAtmosphere(color){
		const {height, width} = this.ctx.canvas || {};
		this.ctx.fillStyle = color;
		this.ctx.fillRect(0, 0, height, width);
	}
	_drawPoint(x, y, color){
		let {fillStyle} = this.ctx;
		this.ctx.fillStyle = color;
		this.ctx.fillRect(Math.round(x), Math.round(y), 1, 1);
		this.ctx.fillStyle = fillStyle;
	}
	_drawCol(x, y, h, color){
		let {fillStyle} = this.ctx;
		this.ctx.fillStyle = color;
		this.ctx.fillRect(Math.round(x), Math.round(y), 1, Math.round(h));
		this.ctx.fillStyle = fillStyle;
	}

	/**
	 * Art Methods
	 */
	SortBodyData(bodyData, bodyType){
		let result = bodyData;

		// Body type 1: Inverted triangle
		result = bodyData.sort((a, b) => b - a);
		if(bodyType === 1) return result;

		// Body type 2: Reverted triangle
		result = bodyData.sort((a, b) => a - b);
		if(bodyType === 2) return result;
		
		// Body type 3: Diamond
		result = bodyData = [
			...bodyData.filter((v, i) => i % 2),
			...bodyData.filter((v, i) => !(i % 2)).sort((a, b) => b - a)
		];
		if(bodyType === 3) return result;
		
		// Body type 4: Segmented
		result = bodyData = [
			...bodyData.filter((v, i) => i % 2),
			...bodyData.filter((v, i) => !(i % 2))
		];

		return result;
	}
	
	// Draw a feathered star shape
	DrawStar(x, y, size) {
		for(let s=size; s >=0; s--){
			let colorScale = (s/(size+1));
			let colorNeg = (255*colorScale);
			let stroke = (255-colorNeg);
			let color = this.GetGreyColor(stroke);
			for(let i=-(size*(s)); i<=(size*(s)); i++){
				for(let j=-s; j<=s; j++){
					this.DrawPoint(x+i, y+j, color);
					this.DrawPoint(x+j, y+i, color);
				}
			}
		}
	}
	
	// Draws a circle composed of vertical rectangles rather than individual pixels
	DrawMoon(x, y, r, color){
		// From apple basic, circa 1995.
		// 200 FOR X = A-R TO A+R
		// 210   Y = SQR(R^2 - (X - A)^2)
		// 220   HPLOT X,B+Y TO X,B-Y
		for( let i = x-r; i <= x+r; i++ ){
			const h = Math.floor(Math.sqrt(Math.pow(r,2) - Math.pow((i-x),2))*2);
			this.DrawCol(i, y-Math.floor(h/2), h, color)
		}
	}

	BodyBrush(bodyData, bodyColor, x, y){
		for( let i=0; i<bodyData.length; i++ ){
			// The divide by 4 assumes we're working at 64px resolution
			let w = bodyData[i] / 4;
			let hili = 'rgba(255,255,255,0.8)';
			let shdw = 'rgba(0,0,0,0.8)';

			for( let j=0; j<w; j++ ){
				let xPos = x+(j-(w/2));
				let yPos = (y-(bodyData.length/2))+(i);
				let hiMask = false;
				let shMask = false;
				if(i > 0) hiMask = ((w -( bodyData[i-1] / 4 )) / 2);
				if(i < bodyData.length-1) shMask = Math.ceil((w -( bodyData[i+1] / 4 )) / 2);
				if( hiMask === false || j < hiMask || j > w-hiMask ){
					this.DrawPoint(xPos, yPos-1, bodyColor);
					this.DrawPoint(xPos, yPos-1, hili);
				}

				this.DrawPoint(xPos, yPos, bodyColor);

				if( shMask === false || j < shMask || j > w-shMask ){
					this.DrawPoint(xPos, yPos+1, bodyColor);
					this.DrawPoint(xPos, yPos+1, shdw);
				}
			}
		}
	}

	DrawAsset(options){
		let {asset, x, y, fillColor, mirrorH} = options;
		if(!asset) return;
		const DrawAssetPoint = (x, y, color) => {
			switch(color){
				case 1:
					this.DrawPoint(x,y,black);
					break;
				case 2:
					this.DrawPoint(x,y,white);
					break;
				case 3:
					this.DrawPoint(x,y,fillColor);
					break;
				default:
					return;
			} 
		};
		const black = this.GetGreyColor(0);
		const white = this.GetGreyColor(255);
		fillColor = fillColor || this.GetGreyColor(128);
		for(let i=0; i<asset.length; i++){
			if(mirrorH)
				for(let j=0; j<asset[i].length; j++) DrawAssetPoint(x-j,y+i,asset[i][j]); 
			else
				for(let j=0; j<asset[i].length; j++) DrawAssetPoint(x+j,y+i,asset[i][j]); 
		}
	}

	/**
	 * Utility Methods
	 */
	GetGreyColor(g){
		return 'rgb('+g+','+g+','+g+')';
	}

	Delay(milisec) {
		return new Promise(resolve => {
			setTimeout(() => { resolve('') }, milisec);
		})
	}

	ResetContext(){
		if(this.updatingCanvas) return;
		this.ctx.setTransform(1, 0, 0, 1, 0, 0);
		this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
	}
}