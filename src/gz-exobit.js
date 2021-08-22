import ABI from './abi.js';
import Render from './gz-exobit-render.js';
import RenderStats from './gz-exobit-render-stats.js';

window.customElements.define('gz-exobit', class extends HTMLElement {

	constructor( ){
		super();

		this.contractAddress = "";

		// Inject function modules
		this.Render = Render;
		this.RenderStats = RenderStats;

		this.renderMode = 'default';
		this.ownerMode = false;

		let shadowRoot = this.attachShadow({mode: 'open'});

		this.metaData = {
			"key": "",
			number: 0,
			"description": "", 
			"external_url": "", 
			"animation_url": "",
			"background_color": "1b1b1b",
			"image": "", 
			"name": "",
			"attributes": [] 
		};

		// Global Properties
		this.stars = [
			'SPICA',
			'VEGA',
			'ARCTURUS',
			'ANTARES',
			'RIGEL',
			'SIRIUS',
			'PROCYON',
			'BETA PICTORIS'
		];
		this.numerals = [
			'I',
			'II',
			'III',
			'IV',
			'V',
			'VI',
			'VII',
			'VIII'
		];
		this.bodyTypes = [
			'Angular',
			'Angular',
			'Bulbous',
			'Segmented'
		];
		this.bodPos = {
			x: 64,      
			y: 70
		};

	}

	async fetchMetadataFromUri(uri){
		const response = await fetch(uri);
		const metadata = await response.json();
		return {
			key: metadata.key,
			name: metadata.name,
			number: metadata.number
		}
	}

	async connectedCallback(){
		let {uri, key, size, contract} = this.dataset || {};

		if(key === 'demo'){
			this.ownerMode = true;
			this.key = "2A97516C354B68848CDBD8F54A226A0A00FFFFD138E207AD6C5CBB9C000099FF";
		}else if(uri){
			let metadata = await this.fetchMetadataFromUri(uri);
			if(metadata.key) this.key = this.metaData.key = metadata.key;
			if(metadata.name) this.metaData.name = metadata.name;
			if(metadata.number) this.metaData.number = metadata.number;
		}else if(key){
			this.key = this.metaData.key = key;
		}

		if(!this.key || this.key.length !== 64){
			console.log('key not found');
			return;
		}

		this.contractAddress = contract;
		size = size || 512;
		const scaleFactor = size / 512;

		// Create a web3 instance outside of the conponent and store
		// it in window.web3instance
		this.web3 = window.web3instance || window.web3;

		// Set up the HTML
		this.shadowRoot.innerHTML = `
			<style>
				:host{
					display: inline-block;
					position: relative;
					width: ${size}px;
					height: ${size}px;
				}

				.shield{
					position: absolute;
					top: 0;
					left: 0;
					height: 100%;
					width: 100%;
					background: transparent;
					z-index: 1000;
				}

				.flip-over{
					position:absolute;
					top: auto;
					left: 50%;
					bottom: 15px;
					transform: translateX(-50%);
					width: 50px;
					z-index: 500;
					transition: opacity 200ms 600ms;
					font-size: 12px;
					line-height: 1;
					font-family: sans-serif;
					color: #fff;
					text-align: center;
				}

				#flip-over{
					width: 50%;
				}

				.container{
					position: relative;
					width: 512px;
					height: 512px;
					transform: scale(${scaleFactor});
					transform-origin: top left;
					perspective: 2000px;
				}

				.card{
					position: absoulte;
					width: 100%;
					height: 100%;
					text-align: center;
					transition: transform 0.8s;
					transform-style: preserve-3d;
					transform-origin: center;
				}

				.container.flip .card {
					transform: rotateY(180deg);
				}

				.container.flip .flip-over{
					opacity: 0;
					transition: opacity 100ms;
				}

				.avatar{
					position: absolute;
					z-index: 0;
					display: block;
					background: #00ff00 url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAIAAACRXR/mAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6RUY1RjdFOTJDNzEwMTFFQjk5M0NGQ0JFRTE5RjcxNTUiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6RUY1RjdFOTNDNzEwMTFFQjk5M0NGQ0JFRTE5RjcxNTUiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpFRjVGN0U5MEM3MTAxMUVCOTkzQ0ZDQkVFMTlGNzE1NSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpFRjVGN0U5MUM3MTAxMUVCOTkzQ0ZDQkVFMTlGNzE1NSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PtGIkuAAAABRSURBVHja7NFRDQAhDERBQE39m2ndFBO9HB/zBGwm2Z2Za6iImJo668mwsLCwsLCwsLCwsLCwfmp399RWVTkRCwsLCwsLCwsLCwsL64uuAAMAb0oI5cT0mOEAAAAASUVORK5CYII=") top left repeat;
					
					-webkit-backface-visibility: hidden; /* Safari */
  					backface-visibility: hidden;
				}
				.profile{
					position: absolute;
					z-index: 10;
					width: calc(512px - 4em);
					height: calc(512px - 1em);
					background: rgba(0,0,0,0.5);
					padding: 1em 2em 0 2em;
					transition: opacity 500ms;
					overflow: auto;
					font-size: 12px;
					font-family: sans-serif;
					line-height: 1;
					color: #ffffff;
					text-align: left;
					display: flex;
					flex-wrap: wrap;
					align-content: flex-start;

					-webkit-backface-visibility: hidden; /* Safari */
  					backface-visibility: hidden;
					transform: rotateY(180deg);
				}
				.profile:before{
					content: '';
					display: block;
					position: absolute;
					width: 100%;
					height: 100%;
					background: rgba(0,0,0,0.25);
					margin-top: -1em;
					margin-left: -2em;
				}
				.profile:hover{
					opacity: 1;
				}
				.profile button{
					background: rgba(50,50,50,0.9);
					color: #fff;
					border: solid 1px;
					border-radius: 5px;
					padding: 0.75em 1em;
					width: 100%;
					z-index: 5000;
					position: relative;
				}
				.profile h1, .profile h2{
					margin: 0;
					font-size: 1.5em;
					line-height: 1.5;
					margin-bottom: 0.5em;
					border-bottom: solid 1px #777;
    				padding-bottom: 2px;
				}
				.profile h1{
					width: 100%;
					flex: 0 1 auto;
					font-size: 2em;
					border-color: #ccc;
				}
				.profile .exo-number{
					float: right;
					font-size: .5em;
					padding-top: 1em;
				}
				.profile .col{
					flex: 0 1 auto;
					width: 40%;
					display: flex;
					flex-direction: column;
				}
				.profile .col.wide{
					width: 60%;
				}
				.profile .group{
					background: rgba(0,0,5,0.75);
					border: solid 1px #333;
					border-radius: 10px;
					margin: 0 1em 1em 0;
					padding: 1em;
				}
				.profile ul{
					list-style: none;
					margin: 0 0 1em 0.5em;
					padding:0;
				}
				.profile ul li{
					line-height: 1.5em;
				}
				.profile .group.homeworld{
					width: 100%;
					margin-bottom: 0;
				}
				.profile ul.attributes{
					display: flex;
					flex-wrap: wrap;
				}
				.profile ul.attributes li{
					width: 33%;
				}
				.profile .settings p{
					text-align: justify;
					line-height: 1.25em;
				}
				.profile .settings button{
					margin-top: 0.25em;
					margin-bottom: 0.5em;
					border-color: rgba(245,255,245,0.75);
				}
				.profile .settings button.active{
					color: #000;
					background-color: rgba(245,255,245,0.75);
					border-color: rgba(245,255,245,0.75);
				}
				#gz-logo{
					display:block;
					position: absolute;
					z-index: 5000;
					bottom: 0;
					right: 0;
					height: 20px;
					width: 85px;
				}
				#gz-logo svg{
					height: 20px;
					width: 85px;
				}
			</style>
			<div class="container">
				<div class="flip-over">
					<svg id="flip-over" focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 306.4">
						<g>
							<path fill="currentColor" d="M205.2,194.1l78.7-70.4c12.5-12.5,34-3.7,34,14.1v40.7c144.6,0,180.7-38.9,180.7-53.5c0-20.3-63.8-41.5-176.2-41.5c-4.5-1-7.7-4.9-7.8-9.5l-1-22.6c-0.1-6.2,5.4-11.1,11.6-10c164,0,181.7,47.7,181.7,90.8c0,63.2-28.9,112.9-189,112.9v33.6c0,17.7-21.5,26.6-34,14.1l-78.7-70.4C197.5,214.5,197.5,201.9,205.2,194.1z"/>
							<path fill="currentColor" d="M273.6,79.1l-45.5,37.2c-12.5,12.5-34,3.7-34-14.1V86.4c-129.7,0-180.7,35.2-180.7,49.8c0,20.3,68.4,42.2,141.3,36.9c4.5,1,7.7,4.9,7.8,9.5l1,55.8c0.1,6.2-5.4,11.1-11.6,10C11.4,248.5,5.1,174.2,5.1,131.1c0-63.2,62.2-86.3,189-86.3v-17c0-17.7,21.5-26.6,34-14.1l45.5,37.2C281.3,58.7,281.3,71.3,273.6,79.1z"/>
						</g>
					</svg>
					<br/>
					Flip Over
				</div>
				<div class="card">
					<div class="shield"></div>
					<canvas class="avatar" height="512" width="512"></canvas>
					<div class="profile"></div>
				</div>
			</div>
		`;

		this.container = this.shadowRoot.querySelector('.container');
		this.container.addEventListener('click', (evt) => this.FlipCard(evt));
		this.canvas = this.shadowRoot.querySelector('canvas.avatar');
		this.profile = this.shadowRoot.querySelector('.profile');
		if (!this.canvas.getContext) return;
		this.ctx = this.canvas.getContext('2d');

		if(this.CheckArtGenerator()) this.Init(this.key);
		else this.ErrorOut();
		//////////////////////////////////////////////////////////////////
	}

	FlipCard(evt){
		evt.preventDefault();
		this.container.classList.toggle('flip');
	}

	//////////////////////////////////////////////////////////////////
	// Important
	//////////////////////////////////////////////////////////////////
	// The ArtGenerator class source is stored in the Etherium mainnet
	// contract at address: xxx
	// This code should be pulled from the blockchain directly and
	// Inserted into a <script> tag in the document.
	//////////////////////////////////////////////////////////////////
	async CheckArtGenerator(){
		if(typeof ArtGenerator === 'function') return true;
		// No ArtGenerator, check for recources necessary to get it
		if(!this.web3 || !this.web3.eth || !this.contractAddress) return false;

		// Attempt to load ArtGenerator
		const contract = new this.web3.eth.Contract(ABI, this.contractAddress);
		const source = await contract.methods.JsSource().call();
		let script = document.createElement('script');
		script.type = 'text/javascript';
		script.async = true;
		script.innerHTML = source;
		// Check again for ArtGenerator, it may have loaded in already elsewhere
		if(typeof ArtGenerator !== 'function')
			document.getElementsByTagName('head')[0].appendChild(script);
	}

	async SetOwnerMode(){
		//this.key
		if(!this.web3 || !this.web3.eth) return false;
		const contract = new this.web3.eth.Contract(ABI, this.contractAddress);
		const accounts = await this.web3.eth.getAccounts();
		if(!accounts.length) return false;
		const account = accounts[0];
		// ownerOfKey will return 0x0 if key is not attached to a minted token
		const owner = await contract.methods.ownerOfKey(this.key).call();

		this.ownerMode = (account === owner);
		this.RenderStats();
	}

	ErrorOut(){
		this.ctx.fillStyle = "#000000";
		this.ctx.fillRect(0, 0, this.canvas.height, this.canvas.width);
		this.ctx.fillStyle = "#ffffff";
		this.ctx.fillText("ArtGenerator not found", 10, 20, this.canvas.width-20);
	}

	SetTokenMetaAttribute(type, value){
		this.metaData.attributes.push(
			{
				trait_type: type,
				value: value
			}
		);
	}

	GetTokenMetadata(){
		this.metaData.image = this.key;
		this.metaData.external_url = this.key;
		this.metaData.animation_url = this.key;
		return this.metaData;
	}

	GetPreviewImage(){
		return this.canvas.toDataURL();
	}

	Init(key){
		this.artGenerator = new ArtGenerator({
			ctx: this.ctx, 
			slowkmoDelay: this.dataset.slowmo,
			renderCallback: () => {
				setTimeout(()=>{
					this.dispatchEvent(new CustomEvent('renderComplete', { 
						detail: {
							source: this
						}
					}));
				},2000);
			}
		});

		// 4 bit, 1 hex
		this.keyPairs4 = key.match(/.{1,1}/g).map((pair)=>{
			return {hex: pair, dec: parseInt(pair, 16)};
		});
		// 8 bit, 2 hex
		this.keyPairs8 = key.match(/.{1,2}/g).map((pair)=>{
			return {hex: pair, dec: parseInt(pair, 16)};
		});
		// 16 bit, 4 hex
		this.keyPairs16 = key.match(/.{1,4}/g).map((pair)=>{
			return {hex: pair, dec: parseInt(pair, 16)};
		});
		//console.log('keyPairs', this.keyPairs4, this.keyPairs8, this.keyPairs16);
		
		this.colorPalette = {
			atmosphere: this.GetColorByKeyIndex(29,30,31,0.25),
			hair: this.GetColorByKeyIndex(23,24,25),
			bodPrimary: this.GetColorByKeyIndex(16,17,18),
			bodSecondary: this.GetColorByKeyIndex(19,20,21),
			tk: this.GetColorByKeyIndex(26,27,28)
		};
		this.SetupStats();
		this.SetupAssets();

		// Render the background by itself for the card back
		this.renderMode = 'background';
		this.Render();
		this.artGenerator.UpdateCanvas();
		this.panelBackground = this.canvas.toDataURL();
		this.artGenerator.ResetUpdateCanvas();
        this.artGenerator.ResetContext();
		this.renderMode = null;
		// Render the full card
		this.Render();
		this.artGenerator.UpdateCanvas();
		this.RenderStats();

		// SetOwnerMode will rerender the stats
		this.SetOwnerMode();
	}

	DrawBodyPart(part, hPos, vPos, color, symmetrical ){
		this.stats.attributes.push(part);
		part = this.assets[part];
		if(this.renderMode === 'background') return;
		let yOffset = 0;
		let xOffset = 0;
		if( typeof vPos === 'string' ){
			let [pos, offset] = vPos.split('|');
			vPos = parseInt(pos);
			xOffset = parseInt(offset);
		}
		if( typeof hPos === 'string' ){
			if( hPos.substr(0,1) === 'y'){
				if(hPos.length > 1 ) yOffset = parseInt(hPos.substr(1));
				hPos = Math.floor(this.bodyData[vPos] / 8);
			}
		}
		let x = this.bodPos.x + hPos + xOffset;
		let y = this.bodPos.y - 18 + vPos + yOffset;
		let assetData = {
			asset: part.data, 
			x: x, 
			y: y,
			fillColor: color
		};
		this.artGenerator.DrawAsset(assetData);
		if(symmetrical) 
			this.artGenerator.DrawAsset({
				...assetData, 
				x: this.bodPos.x - hPos - xOffset, 
				mirrorH: true
		});
	}

	DrawBody(x, y) {
		let bodyType = Math.floor(this.keyPairs4[0].dec / 4)+1;
		this.stats.body.type = bodyType;
		if(this.renderMode === 'background') return;
		//console.log('body type', bodyType);
		let bodyDataPointCt = this.keyPairs8.length / Math.pow(2, (Math.floor(this.keyPairs4[1].dec / 4) + 1));
		//console.log('body data points', bodyDataPointCt, this.keyPairs8.length);

		// Gather the body data
		let bodyData = [];
		for( let idx=0; idx<this.keyPairs8.length; idx+=bodyDataPointCt){
			bodyData.push(this.keyPairs8[idx].dec);
		}
		this.StretchVals(bodyData, bodyDataPointCt-1, 0);

		this.bodyData = this.artGenerator.SortBodyData(bodyData, bodyType);

		//console.log('body data', this.bodyData);
		this.artGenerator.BodyBrush(this.bodyData, this.colorPalette.bodPrimary, x, y)
	}

	// Ground height is determined by the average of all values in keyPairs8
	DrawGround(){
		if(this.renderMode === 'subject') return;
		for(let i=0; i<128; i++){
			const h = Math.floor(Math.sqrt(Math.pow(768,2) - Math.pow((i-64),2)))*2;
			this.artGenerator.DrawCol(i, 848-(h/2), h, '#888888');
		}
	}

	DrawLandscape(){
		let mtn1 = this.FilterRange(this.keyPairs8, 128, 192, 90, true);
		this.stats.mountains.push(...mtn1);
		this.StretchVals(mtn1, Math.floor(160/mtn1.length)-1, 0);
		
		let mtn2 = this.FilterRange(this.keyPairs8, 112, 128, 90, true);
		this.stats.mountains.push(...mtn2);
		this.StretchVals(mtn2, Math.floor(160/mtn2.length)-1, 0);

		if(this.renderMode === 'subject') return;
		
		for(let i=0; i<mtn1.length; i++){
			let height = mtn1[i] / 2;
			this.artGenerator.DrawCol(i, 128-height, height, '#666666');
		}

		for(let i=0; i<mtn2.length; i++){
			let height = mtn2[i] / 2;
			this.artGenerator.DrawCol(i, 128-height, height, '#444444');
		}
	}

	// Draws 0-2 moons based on the first value in keyPairs8
	// Subsequent groups of 3 values each determines x,y coordinates and radius
	DrawCelestialBodies(){
		for(let i=1; i<=Math.floor(this.keyPairs8[0].dec/100); i++){
			this.stats.moons.push(this.keyPairs8[(i+1)*3].dec/4);
			if(this.renderMode === 'subject') return;
			this.artGenerator.DrawMoon(
				this.keyPairs8[(i+1)*1].dec/2, 
				this.keyPairs8[(i+1)*2].dec/2, 
				this.keyPairs8[(i+1)*3].dec/4,
				this.artGenerator.GetGreyColor((255-(25*i)))
			);
		}
	}

	// Stars are positioned using every 2 adjacent values in keyPairs8
	// Intensity is the last hex digit in each of the 2 values, combined, then divided and rounded down to produce a number between 0 and 2
	DrawStarfield(){
		if(this.renderMode === 'subject') return;
		for(let i=0; i<this.keyPairs8.length; i+=2){
			let composite = this.keyPairs8[i].hex.substr(1,1) + this.keyPairs8[i+1].hex.substr(1,1);
			let intensity = Math.floor(parseInt(composite, 16)/100)
			this.artGenerator.DrawStar(this.keyPairs8[i].dec, this.keyPairs8[i+1].dec, intensity);
		}
	}

	/**
	 * Utility Methods
	 */

	GetColorByKeyIndex(r, g, b, a){
		a = a || 1;
		return `rgba(
			${this.keyPairs8[r].dec},
			${this.keyPairs8[g].dec},
			${this.keyPairs8[b].dec},
			${a}
		)`;
	}

	StretchVals(arr, stretchLen, scaleShift){
		//if(arr.length = 2) debugger;
		let idx = 1;
		scaleShift = scaleShift || 0;
		while( idx <= arr.length){
			let start = arr[idx-1];
			let end = arr[idx] || arr[idx-1];
			//console.log(end, '-', start);
			let range = end - start; //47
			let step = range / (stretchLen + scaleShift);
			let fill = [];
			for( let j=0; j<stretchLen; j++ ){
				fill.push(arr[idx-1] + (step * (j+1)))
			}
			arr.splice(idx, 0, ...fill);
			idx = idx + (stretchLen+1);
			// Emergency brake
			if(idx > 300) break;
		}
	}

	FilterRange(arr, min, max, def, removeExtraEmpty){
		let result = [];
		for(let idx=0; idx<arr.length; idx++){
			let key = arr[idx];
			if(
				removeExtraEmpty &&
				idx < arr.length - 4 && 
				(arr[idx].dec > max || arr[idx].dec < min) &&
				(arr[idx+1].dec > max || arr[idx+1].dec < min) &&
				(arr[idx+2].dec > max || arr[idx+2].dec < min) &&
				(arr[idx+3].dec > max || arr[idx+3].dec < min)
			){
				idx += 4;
				continue;
			}else if(key.dec < max && key.dec > min){
				result.push(key.dec);
			}else{
				result.push(def);
			}
		}

		return result;
	}

	ProbabilitySelect(idx, percent, optidx, opts){
		if( ((1 - (this.keyPairs4[idx].dec / 16)) > percent) ) return false;
		let choice = Math.floor(opts.length * (this.keyPairs4[optidx].dec / 16));
		opts[choice]();
	}

	SetupStats(){
		this.stats = {
			planet: this.stars[Math.floor(this.keyPairs4[2].dec/2)] + ' ' + this.numerals[Math.floor(this.keyPairs4[3].dec/2)],
			atmosphere: {
				r: this.keyPairs8[29].dec,
				g: this.keyPairs8[30].dec,
				b: this.keyPairs8[31].dec
			},
			moons: [],
			mountains: [],
			body: {
				type: '',
				primarycolor: {
					r: this.keyPairs8[16].dec,
					g: this.keyPairs8[17].dec,
					b: this.keyPairs8[18].dec
				},
				secondarycolor: {
					r: this.keyPairs8[19].dec,
					g: this.keyPairs8[20].dec,
					b: this.keyPairs8[21].dec
				},
				haircolor: {
					r: this.keyPairs8[23].dec,
					g: this.keyPairs8[24].dec,
					b: this.keyPairs8[25].dec
				}
			},
			attributes: []
		};
	}

	SetupAssets(){
		this.assets = {
			hair: {
				label: 'Hair',
				data:["0000000000010000000","0000000000140000000","0000000000740000000","0000000001d40100000","0000000001d00500400","0000055007d00500400","000001f407d41d01400","0000007d07f45d17400","0000007d55f57d5d400","0001557ffffffff5000","0055fffffddff7f4100","01d7fffff777d7f4500","05417f5f7fff75f5d00","10005fddffffff7f415","00005fd7df7ff57fd74","00157ffff5fffffffd0","01557ffff7fffffff40","05405fffffff7f55750","040007fff77d1d00500","000007f551140500000","00001f5001140040000","0000150000100000000","0000500000000000000"],
			},
			horns: {
				label: 'Horns',
				data: ["0000001000000","0000007400000","0000007400000","0000007400000","000001fd00004","140001fd0001d","1d0001fd0007d","1f4001fd001f4","07d007ff401f4","07f407ff407f4","01f407ff41fd0","01fd07ff41fd0","01ff41fd07fd0","01ff405407fd0","01fd000001f40","0054000000500"]
			},
			feathers: {
				label: 'Feathers',
				data:["00000001000000000","00000001400000000","00000001d00000000","00000001d00000000","00000001d00000050","00050001d00000140","00014001d00001500","00005001f40007400","00007401f4001d055","00001d01f400741d0","15001f41fd01d0740","01540741fd07d1d00","007d07d1fd1f47d00","001f47d1fd1f5f400","0007d7d1fd7f7d000","0001f7f5fd7df4000","0001fdfdfdf7f4000","00007dfdfff7f4000","00007dfdffdfd0000","00007f7f7fdfd0000","00001f7f7f7fd0000","00001fdf7f7f40000","00001fdf7f7f40000","00000fdf7f7f00000","000003fffffc00000","000000fffff000000","0000000fff0000000"]
			},
			antannae: {
				label: 'Antannae',
				data: ["0005","0015","0054","0140","0100","0400","0400","0400","1000","1000","1000","1000","1000","1000","1000","1000","1000","1000","0400","0400","0400"]
			},
			fin: {
				label: 'Fins',
				data: ["100000","140400","1d5400","1f5d00","1f7f50","7dfdd0","7df7d0","77dff4","7f7fd5","7ff574","7f5ff4","fffd55","f55400"]
			},
			eyes: {
				label: 'Eyes',
				data: ["01400140","06900690","1aa41aa4","6aa96aa9","6aa96aa9","6a596a59","69556955","19541954","06500650","01400140"]
			},
			sleepyeyes: {
				label: 'Eyes',
				data: ["05500550","1ff41ff4","1ffd7ff4","7ffd7ffd","7ffd7ffd","55555555","65596559","65596559","19641964","06900690","01400140"]
			},
			angryeyes: {
				label: 'Eyes',
				data: ["01000000040","10400000104","45500000551","15540001554","05554015550","01555055540","01a55555a40","01955555640","01956595640","01a5a5a5a40","006a906a900","001a401a400","00050005000"]
			},
			zetaeyes: {
				label: 'Compound Eyes',
				data: ["50000000005","55000000055","55500000555","55554015565","55555055555","15565055564","15565055594","05694015a50","00550005500"]
			},
			batwing: {
				label: 'Wings',
				data: ["0000000014000000000000","0000000050000000000000","0000000155000000000000","000000155a554000000000","0000005a65aa9400000000","000001a659556940000000","0000065596555694000000","0000595595955569400000","0001a55565695556900000","0006555565565555650000","00195555655595555a4000","0065555559556555559000","0195555559555955556400","0195555559555655555900","0655555556555595555640","0655555556555595555590","0655555556555565555550","1955555556555555550154","1955555555955555500014","1955555555955415400001","1555401555954001000000","1554000055540000000000","1540000005500000000000","5500000000500000000000","5400000000000000000000","5000000000000000000000","4000000000000000000000","4000000000000000000000"]
			},
			butterflywing: {
				label: 'Wings',
				data: ["000000000000001555550000","000000000000155555555400","000000000005555555555540","0000000001557ffff57f5554","00000000155ffffffd5ffd55","000000015555ffffff57fd55","000000057d55ffffff57ff55","00000057ff55ffffff57ff54","0000017fff57fffff557ff54","000005fffd555555557ffd50","000017ffd5555555555ffd50","00005ffd555555555555f540","00017fd55555555555555500","0005f5555ff5ffffd5555400","0017d55ffffd7fffff555000","005f557ffffd5fffffd55000","017d5ffffff57ffffff54000","01f5ffd55555fffffff50000","05d5f5555555557ffff50000","055f555555555555ffd50000","157557fffff555555f540000","1557fffffffd5ff555540000","155d557ffffd57ffd5540000","155555555ffd57fffd540000","0555555555755ffffd500000","055ffd5555557fffff500000","01555ffd555555ffff500000","015557ff55550555fd400000","015f555ff555405555400000","0057d557ffd5500155000000","0055fd557ff5500000000000","005d7d557ffd500000000000","001f5fd55ffd500000000000","001757f557fd500000000000","0017d5fd55f5500000000000","0015f57f5555500000000000","0005f57fd555500000000000","0005fd5ff555500000000000","00057d5ffd55500000000000","00057f57fd55500000000000","00057f55ff55400000000000","00017f55ff55400000000000","00017fd5ff55400000000000","00017fd57555000000000000","00017fd55555000000000000","00017fd55554000000000000","00017ff55554000000000000","00017ff55550000000000000","00015ff55540000000000000","00015fd55500000000000000","000155555000000000000000","000055550000000000000000"]
			},
			armanthro: {
				label: 'Hands',
				data: ["0000000000000000400","0000000000000001d00","0000000000000007f40","000000000000001fd00","000000000000007f400","00000000000001fd000","00000000000007f4000","0000000000001fd0005","0000000150007f4015d","00000001d001fd057fd","00000001f417f45ffd5","000000017d7f45ff540","000000007ffd7fd5000","000000001ffff540000","000000001fff5555554","000000005ffffffffd4","00000015ffff5555550","0000057d57d50000000","00015f5401400000000","0057d50000000000000","15f5400000000000000","3d50000000000000000","1400000000000000000"]
			},
			pincer: {
				label: 'Pincer Claws',
				data: ["0000000540000","0000001fd4000","0000007ffd000","000001ffff400","000001fffd400","000001fff7d00","000001ffdff40","0000007fdffd0","0000007f7ffd0","00000015fffd4","00000007ff574","00000007d5ff4","000000057fff4","00000017ffffd","0000001fffffd","0000007fffffd","0000007fffffd","0000007ffd5fd","0000001557f55","0000001fffffd","0000007fffffd","000001ffffffd","000017ffffff4","00007fffffff4","0001ffffffff4","0007ffffffff4","001fffffffff4","007ffffffffd0","01fffffffffd0","01fffffffff40","07ff5ffffff40","07f507ffffd00","1f5007ffff400","1d001ffffd000","14007fffd4000","1005fffd40000","015fffd400000","17fffd4000000","7fff540000000","1555000000000"]
			},
			flipper: {
				label: 'Flippers',
				data: ["00555000000","01fff500000","17ffff40000","3fffffd0000","1ffffff4000","07fffffd000","01ffffff400","007dffffd00","0015ffffd00","0007fffff40","001ffffff40","001ffffffd0","0007fffffd0","0007ffffff4","0001ffffff4","00007fffff4","00007fffffd","00001fffffd","00001fffffd","00001fffffd","000007ffffd","000007ffffd","000007ffffd","000007ffffd","000007ffffd","000001ffffd","000001ffffd","000001ffff4","000001ffff4","000001ffff4","000001fffd0","000001fffd0","000001fff40","000007fff40","000007ffd00","000007ffd00","000007ff400","000007ff400","000007fd000","000007fd000","000007f4000","000007d0000","000007d0000","00000740000","00000100000"]
			},
			leganthro: {
				label: 'Biped',
				data: ["d400000000","f400000000","f400000000","f400000000","7d00000000","7d00000000","7d00000000","7d00000000","1f40000000","1f40000000","1f40000000","1f40000000","07d0000000","07d0000000","07d0000000","07d0000000","01f4000000","01f4000000","01f4000000","01f4000000","007d000000","007d000000","007d000000","007d000000","001f400000","001f400000","001f400000","001f400000","0007d00000","0007d00000","0007d00000","0007d00000","0001f45540","0001f5ffd0","0001fffff4","00007ffffd","0001fffffd","0001fffffd","00007ffffd","0000155554"]
			},
			leginsect: {
				label: 'Quadraped',
				data: ["0001500000000000000000","0005f40000000540000000","001df40155555fd0000000","001df457fffffdd0000000","007f75fffffff474000000","01ff77ffffffd074000000","07ff77ffffff4074000000","07ff77fffffd0074000000","1fff77fffff4001d000000","1fff77ffffd0001d000000","1fff77fffd40001d000000","1fffddfff400001d000000","1fff5dff5000001d000000","1ffdddd500000007400000","05f55d4000000007400000","00501d0000000007400000","00001d0000000007400000","00001d0000000007400000","00001d0000000001d00000","00001d0000000001d00000","0000074000000001d00000","0000074000000001d00000","0000074000000001d00000","0000074000000000740000","0000074000000000740000","0000074000000000740000","0000074000000000740000","0000074000000000740000","00000740000000001d0000","000001d0000000001d0000","000001d0000000001d0000","000001d0000000001d0000","000001d0000000001d0000","000001d000000000074000","000001d000000000074000","000001d000000000075400","000000740000000007d550","0000005400000000014155"]
			},
			tentacle: {
				label: 'Tentacles',
				data: ["000000000000000001554000","000000000000000017ffd000","00000000000000005f557400","00000000000000007d001d00","0000000000554001f4000500","0000000005ffd401f4000000","000000001ffffd01f4000000","000000001ffffd01fd000000","000000001dffff407d000000","0000000001ffff407f500000","0000000001ffff405ff50000","0000000001ffffd01fff5400","00000000007fffd005fffd40","00000000007fffd0005fffd0","00000000007ffff400057ff4","00000000001ffff400001ffd","00000000001ffff4000007fd","00555500001ffffd000001fd","01ffff400007ffff500001fd","07ffffd00007fffff40001fd","1fd55ff40007fffffd0007fd","1f4007fd4007ffffff555ffd","1d0001ffd01ffd7ffffffffd","1d00007ff57ffd1ffffffff4","1d000017fffff41fffffffd0","1d000005ffffd005ffffff40","1d0000017ffd40015ffff500","074000001554000005555000","014000000000000000000000"]
			},
			telekinesis: {
				label: 'Telekinetic',
				data: ["0000000000000000000000000003f0000000000000","0000000000000000000000000003fc000000000000","0000000000000000000c0000003ffc000000000000","0000000000000000003fc0003cfff0000000000000","0000000000000000003ff000fffaf0000000000000","000000000000000000fef0003feaf0000000000000","000000000000000000fafc003eaafc000000000000","000000000000000000fabc00feaabc000000000000","000000000003ffc3fffabfc3faaabc000000000000","00000000000ff003ffffafffffbfff0c03f0000000","0000000000fc0003eafffaffffffffffcffc000000","000000003ff0000ffff3ffffc3f00fffffbf000000","000000003fc0000fffc03ffc00f0000ffeafc00000","000000f0ffc000000f000f0000000003eaabc00000","000003ffff0000000000000000000003feabc00000","0000ffffc00000000000000000000000ffabf00000","0000ffaf0000000000000000000000000fabf00000","0000feaf0000000000000000000000000febc00000","00003faf00000003000000003ffffc0003ebc00000","00000fbf0000003c000000000fffffc003ffc00000","00000ffc000000f00000000000ffaf0000ffc00000","00003ff00003ffc000000000000fef000003c00000","00003c00000fff00000000000003fff00003c00000","00003c00000fff00000000000000fbf00000c00000","0000fc00000fff00000000000000faf00000f00000","000ffc00000fc000000000000000faf00000300000","00ffff000003c000000000000000fafc00003c0000","0ffebf000003c000000000000000fffffc00000000","0ffafc00000fc0000000000000003ffffc00000fc0","03fff0000003c00000000000000000febc00000ffc","003fc0000003fc00000000000000003efc000003fc","003ffc000003ff00000000000000003ff0000003ff","003eff00003fff00000000000000003fc0000003ef","00febf00003fff0000000000000000ffc0000003ef","03fafc00000ff00000000000000000fbf000000fef","03fbf0000003f00000000000000003fafc0000ffaf","00ffc0000000f00000000000000000fabf0003feaf","003fc0000000f00000000000000000faafc003eaff","003fc0000000f00000000000000003faabc003ebfc","00ffc0000000f0000000000000000feaafc003efc0","03fbf0000003f00000000000000003fabf0003ef00","0feafc000003fc0000000000000000fffc0003ef00","ffaabc00003fff0000000000000000fff0000fefc0","ffaabf0003ffafc000000000000003c000003fbff0","ffffff0003faabc000000000000003c00003feffc0","03fffc000feaabc00000000000000300000ffaf000","0300fc000feaabc00000000000000300000faaf000","00003c0003feffc0000000000000f000000faaf000","00003c0000ffff00000000000000f00000ffaafc00","00003f00000fc0000000000000000000003fffbc00","00003fc00003c000000000000000000000ffffff00","00003fc00003c00000000000000000000ff003ef00","0003ffc00003c0000000000000000000ffc003fff0","000ffbc00000c000000000000000000fff0000ffc0","0003ffc00000c000000000000000000ff00000ff00","00003ffc0000c00000000000000000000000003f00","0000003fc000f00000000000000000000000000000","0000000ff000300000000000000000000000000000","00000000f000000000000000000000000000000000","000000003c00000000000000000000000000000000"]
			},
			precog: {
				label: 'Precognition',
				data: ["00000000000000003fffc0000000000000000000","000000000000003ffaaac0000000000000000000","00000000000003faaaaac0000ffc000000000000","00000000000003aabfffc0000eafc00000000000","00000000000003fff00000000faafc0000000000","00000000000000000000000003feafc000000000","000000000000000000000000000feaf000000000","0000000000000000000000000000febc00000000","00000000ff000000ffffc03fc0000fac00000000","00000003eb00000feaaac03aff0003fc00000000","0000000faf00000eaaafc03aabf0000000000000","0000003ebc00000ffffc003feabc000000000000","000000faf003fc0000000000ffbc000000000000","000003ebc00fac000000000003f0000000000000","00000faf00febc000000000000000fc000000000","00003ebc03eaf0000fffff0000000ef0003f0000","00003af00fafc0003eaaab0000003ebc00fbc000","00003bc00ebc0000faaaaf003f000faf00fac000","00003f000ef000003ffffc00fbf003ebc03ef000","000000000fc00c0000000000fabc00faf00ebc00","0000000000003fc0000000003faf003eb00fac00","000000000000fbc00000000003ebf00fb003af00","0000000f0003ef000000000000feb003f003eb00","0000003fc00fbc0000000000000fb0000000ebc0","000000fac03ef000000000000003f0000000fac0","000000ebc0fac000000000000000000000003ac0","000003eb00ebc00000000000000000000fc03ef0","03fc03af00ef000000000000000000000ef00fc0","03ac03ac00fc000000000000000000000eb00000","03ac0fbc0000000000000000000000fc0fbc0000","0fbc0fb00000000000000000000000ec03ac0000","0eb003f00000000000000000000000ef03ac0000","0eb000000000000000000000000000eb03ef0000","0eb000000c00000000000000000000eb00eb0000","0eb000003f00000000000000000000ebc0eb0000","0eb00000fb00000000000000000000fac0ff0000","3eb03fc0eb000000000000000000003ac0000000","3ab03ac0eb000000000000000000003ac03f00fc","3ef03ac0eb000000000000000000003ac0fb00ef","0ec03ac0eb000000000000000000003ac0eb03eb","0fc03ac0eb000000000000000000003ac0eb03ab","00003ac0ebc00000000000000000003ac0eb03ab","00003ac0fac0000000000000000000fbc0eb03af","00003ac03bc0000000000000000000eb00eb03ac","00003ec03f00000000000000000000eb00eb03ac","00000fc00000000000000000000000eb00ef03ac","000003000000000000000000000000ef00fc03ac","000000000000000000000000000000fc00f00fbc","0000000000000000000000000000000000000eb0","00300000003c0000000000000000000000000eb0","00fc003c00ff0000000000000000000000000ff0","00ef00ff00ebc00000000000000000003f000000","00eb00ebc0faf000000000000000f000fb000000","00fbc0fac03eb000000000000003fc00eb000000","003ac03ef00fbf0000000000003fbc03eb000000","003ef00ebc03ebc00000000000faf003af000000","000eb00fac00fac00000000003ebc00fbc000000","000fbc03ef003fc0000000003faf003ef0000000","0003af00fc000f00000000003abc003ac0000000","0003eb00300000003fffff003ff0003fc03f0000","0000fb00000000003aaaabc00f00000000fbc000","00003b00000fc0003eaaabc00000000003eb0000","00003f00003ef0000fffff000003fc000fab0000","00000000003ebf0000000000003fac003ebc0000","00000000000fabf00000000003fabc00faf00000","000000000003fabc000000003fabf003ebc00000","0000000000003fac00ffff003abf000faf000000","00000000030003fc03eaabc03ff0003ebc000000","000000000ff0000003aaaac00f00003af0000000","000000000ebf000003feafc00000003fc0000000","000000000fabc000000ffc000000000000000000","0000000003eaff00000000000000000000000000","0000000000feabf00000000003c0000000000000","00000000000feabc0000000ffff0000000000000","000000000000ffac0000fffeaab0000000000000","00000000000003fc0000eaaaaff0000000000000","00000000000000000000eaaffc00000000000000","00000000000000000000fffc0000000000000000"]
			}
		};

		// Decompress the assets
		for( let key of Object.keys(this.assets)){
			for( let idx=0; idx<this.assets[key].data.length; idx++){
				let arr = this.assets[key].data[idx].split('');
				let quat = [];
				while(arr.length > 0){
					let tmpQuat = parseInt(arr.shift(), 16).toString(4).split('');
					if(tmpQuat.length == 1) tmpQuat.unshift(0);
					quat.push(...tmpQuat);
				}
				// Convert the string to an array of numbers
				this.assets[key].data[idx] = quat.map(x=>+x);
			}
		}
	}

});