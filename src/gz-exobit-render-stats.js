let RenderStats = function(){
	//console.log('STATS', this.stats);
	
	let stats = {
		home: [],
		biology: [],
		attributes: []
	}

	let o = 100*(this.stats.atmosphere.b/255);
	let he = 100*(this.stats.atmosphere.g/255);
	let n = 100*(this.stats.atmosphere.r/255);
	// Make each value a portion of 100%
	let normalize = 100/(o+he+n);
	o = Math.floor( o * normalize);
	he = Math.floor( he * normalize);
	n = Math.floor( n * normalize);

	let peaks = 0;
	// Count the mountains
	let elevation = this.stats.mountains.reduce((acc, val)=>{ 
		if(val > 90) peaks++;
		return (val > acc) ? val : acc;
	}, 90);
	elevation *= 30;

	let environment = 'Oceanic';
	if(peaks > 4) environment = 'Highlands';
	else if(peaks > 2) environment = 'Flat Lands';

	let bodyType = this.bodyTypes[this.stats.body.type-1];

	let disposition = 'Friendly';
	if(this.stats.attributes.includes('angryeyes')) disposition = 'Aggressive';
	if(this.stats.attributes.includes('zetaeyes')) disposition = 'Enigmatic';
	if(this.stats.attributes.includes('sleepyeyes')) disposition = 'Languid';

	let wings = (this.stats.attributes.find(
		(attribute)=>this.assets[attribute].label == 'Wings'
	)) ? true : false;
	
	let legs = (this.stats.attributes.find(
		(attribute)=>
			this.assets[attribute].label == 'Biped' || 
			this.assets[attribute].label == 'Quadraped' || 
			this.assets[attribute].label == 'Tentacles'
		)) ? true : false;

	let fins = (this.stats.attributes.find(
		(attribute)=>
			this.assets[attribute].label == 'Fins' || 
			this.assets[attribute].label == 'Flippers' || 
			this.assets[attribute].label == 'Tentacles'
		)) ? true : false;

	let element = [];
	if(wings) element.push('Aerial');
	if(legs) element.push('Terrestrial');
	if(fins) element.push('Aquatic');

	let species = [];
	if(this.stats.body.type == 4) species.push('arthro');
	if(this.stats.body.type == 3) species.push('mollusca');
	if(this.stats.body.type == 2) species.push('coelenterata');
	if(this.stats.body.type == 1) species.push('chordata');
	 
	if(wings) species.push('tera');
	if(legs) species.push('pod');
	if(fins) species.unshift('ichthy');

	//Capitalize the first letter
	species[0] = species[0][0].toUpperCase() + species[0].substring(1);

	stats.home.push(['Name', this.stats.planet]);
	stats.home.push(['Atmospheric Composition', `Oxygen (${o}%), Helium (${he}%), Nitrogen (${n}%)`]);
	stats.home.push(['Moons', this.stats.moons.length]);
	stats.home.push(['Region', `${environment} (Peaks: ${peaks} Highest Elevation: ${elevation}M)`]);

	stats.biology.push(['Species', species.join('')]);
	this.SetTokenMetaAttribute("Species", species.join(''));
	stats.biology.push(['Body Type', bodyType]);
	this.SetTokenMetaAttribute("Body Type", bodyType);
	stats.biology.push(['Temperament', disposition]);
	this.SetTokenMetaAttribute("Temperament", disposition);
	stats.biology.push(['Environment', element.join(' / ')]);
	element.forEach((attribute)=>this.SetTokenMetaAttribute("Environment", attribute));

	// Set attribute metaData
	this.stats.attributes.forEach((attribute)=>this.SetTokenMetaAttribute("Characteristic", this.assets[attribute].label));

	let FormatRow = (keyVal) => {
		let [key, val] = keyVal;
		return `
			<li>
				<strong>${key}:</strong> ${val}
			</li>
		`;
	}

	let exoName = (this.metaData.name) ? this.metaData.name : 'Stats';
	let exoNum = (this.metaData.number) ? 'ExoBit #'+this.metaData.number : '';

	let ownerControls = `
		<p>Settings are available only to the owner of this Exobit. Mint this token to gain access.</p>
	`;
	if(this.ownerMode)
		ownerControls = `
			<button id="slowmo">SlowMo Redraw</button>
			<button id="subject" class="${(this.renderMode === 'subject')?'active':''}">Subject Only</button>
			<button id="background" class="${(this.renderMode === 'background')?'active':''}">Background Only</button>
			<button id="download">Download Image</button>
		`;

	let template = `
		<h1>
			<span class="exo-name">${exoName}</span>
			<span class="exo-number">${exoNum}</span>
		</h1>
		<div class="col wide">
			<div class="group">
				<h2>Biology</h2>
				<ul class="biology">
					${stats.biology.map(keyVal => FormatRow(keyVal)).join("")}
				</ul>
				<h2>Attributes</h2>
				<ul class="attributes">
					${this.stats.attributes.map(attr => `<li>${this.assets[attr].label}</li>`).join("")}
				</ul>
			</div>
		</div>
		<div class="col">
			<div class="group settings">
				<h2>Image Settings</h2>
				${ownerControls}
			</div>
		</div>
		<div class="group homeworld">
			<h2>Homeworld</h2>
			<ul class="homeworld">
				${stats.home.map(keyVal => FormatRow(keyVal)).join("")}
			</ul>
		</div>
		<a id="gz-logo" href="https://exobits.greenzeta.com" target="_blank">
		<svg viewBox="0 0 140 33" enable-background="new 0 0 140 33">
			<g id="Layer_1">
				<rect opacity="0.8" width="140" height="33"/>
				<rect x="108.25" fill="#7CB750" width="33" height="33"/>
			</g>
			<g id="Zeta">
				<g>
					<path fill="#FFFFFF" d="M123.438,7.591c0.875-0.638,1.693-1.105,2.455-1.401c0.76-0.296,1.52-0.444,2.275-0.444
						c0.629,0,1.104,0.089,1.422,0.267c0.319,0.178,0.479,0.444,0.479,0.8c0,0.52-0.371,0.935-1.113,1.244
						c-0.744,0.31-1.753,0.465-3.029,0.465c-0.419,0-0.811-0.011-1.176-0.034c-0.364-0.022-0.72-0.062-1.066-0.116
						c-0.957,0.848-1.713,1.953-2.27,3.315c-0.556,1.363-0.834,2.796-0.834,4.3c0,1.54,0.352,2.65,1.053,3.329
						c0.702,0.68,1.851,1.019,3.445,1.019c0.265,0,0.666-0.019,1.203-0.055c0.538-0.036,0.943-0.055,1.217-0.055
						c1.386,0,2.402,0.239,3.049,0.718c0.647,0.479,0.971,1.229,0.971,2.249c0,1.395-0.559,2.475-1.674,3.24
						c-1.117,0.766-2.696,1.148-4.738,1.148c-0.61,0-1.08-0.087-1.408-0.26s-0.492-0.419-0.492-0.738c0-0.292,0.107-0.515,0.322-0.67
						c0.213-0.155,0.525-0.232,0.936-0.232c0.273,0,0.752,0.094,1.436,0.28s1.271,0.28,1.764,0.28c0.83,0,1.527-0.203,2.092-0.608
						c0.565-0.405,0.848-0.904,0.848-1.497c0-0.52-0.223-0.896-0.67-1.128c-0.446-0.232-1.185-0.349-2.215-0.349
						c-0.364,0-0.881,0.014-1.551,0.041s-1.151,0.041-1.443,0.041c-1.887,0-3.273-0.479-4.162-1.436s-1.334-2.447-1.334-4.471
						c0-1.668,0.299-3.213,0.896-4.635c0.596-1.422,1.496-2.743,2.699-3.965c-1.458-0.31-2.565-0.729-3.322-1.258
						c-0.756-0.528-1.135-1.135-1.135-1.818c0-0.729,0.36-1.294,1.08-1.695c0.721-0.401,1.732-0.602,3.035-0.602
						c0.273,0,0.488,0.009,0.643,0.027c0.155,0.019,0.306,0.046,0.451,0.082v0.697h-0.725c-0.811,0-1.417,0.137-1.818,0.41
						c-0.4,0.273-0.602,0.679-0.602,1.217c0,0.556,0.256,1.03,0.766,1.422C121.706,7.108,122.453,7.399,123.438,7.591z"/>
				</g>
			</g>
			<g id="Fonts">
				<g>
					<path fill="#FFFFFF" d="M18.958,15.641h5.538v0.443c0,1.008-0.118,1.897-0.355,2.674c-0.232,0.717-0.623,1.389-1.172,2.014
						c-1.244,1.401-2.827,2.1-4.749,2.1c-1.876,0-3.481-0.676-4.819-2.03c-1.336-1.359-2.005-2.991-2.005-4.896
						c0-1.945,0.681-3.594,2.041-4.949c1.36-1.36,3.015-2.04,4.966-2.04c1.047,0,2.026,0.214,2.935,0.643
						c0.869,0.428,1.722,1.123,2.561,2.083l-1.441,1.381c-1.1-1.464-2.439-2.197-4.02-2.197c-1.418,0-2.607,0.489-3.567,1.467
						c-0.961,0.961-1.441,2.165-1.441,3.611c0,1.494,0.535,2.724,1.605,3.689c1.001,0.898,2.087,1.347,3.255,1.347
						c0.996,0,1.891-0.337,2.684-1.009c0.792-0.677,1.235-1.487,1.328-2.43h-3.342V15.641z"/>
					<path fill="#FFFFFF" d="M26.666,14.166h1.955v0.754c0.359-0.376,0.677-0.634,0.954-0.773c0.285-0.144,0.62-0.217,1.007-0.217
						c0.516,0,1.054,0.168,1.614,0.504l-0.893,1.789c-0.369-0.267-0.732-0.399-1.085-0.399c-1.064,0-1.597,0.804-1.597,2.414v4.384
						h-1.955V14.166z"/>
					<path fill="#FFFFFF" d="M40.896,18.853h-6.059c0.052,0.694,0.277,1.248,0.677,1.658c0.398,0.405,0.912,0.608,1.537,0.608
						c0.486,0,0.888-0.116,1.207-0.348c0.312-0.231,0.668-0.66,1.067-1.285l1.651,0.921c-0.257,0.434-0.525,0.805-0.809,1.114
						c-0.284,0.31-0.588,0.562-0.912,0.764c-0.324,0.199-0.674,0.348-1.05,0.439c-0.376,0.094-0.785,0.139-1.225,0.139
						c-1.262,0-2.275-0.404-3.04-1.214c-0.764-0.817-1.146-1.9-1.146-3.247c0-1.337,0.371-2.42,1.112-3.248
						c0.748-0.816,1.737-1.224,2.969-1.224c1.245,0,2.229,0.397,2.952,1.189c0.717,0.787,1.078,1.878,1.078,3.272L40.896,18.853z
						M38.891,17.256c-0.273-1.043-0.929-1.563-1.971-1.563c-0.237,0-0.46,0.037-0.668,0.107c-0.21,0.073-0.4,0.177-0.571,0.313
						c-0.169,0.137-0.315,0.299-0.438,0.49c-0.122,0.191-0.214,0.408-0.278,0.652H38.891z"/>
					<path fill="#FFFFFF" d="M50.733,18.853h-6.061c0.052,0.694,0.278,1.248,0.676,1.658c0.4,0.405,0.912,0.608,1.538,0.608
						c0.486,0,0.888-0.116,1.206-0.348c0.312-0.231,0.668-0.66,1.068-1.285l1.65,0.921c-0.256,0.434-0.525,0.805-0.81,1.114
						c-0.283,0.31-0.587,0.562-0.911,0.764c-0.325,0.199-0.673,0.348-1.05,0.439c-0.377,0.094-0.785,0.139-1.223,0.139
						c-1.263,0-2.275-0.404-3.04-1.214c-0.765-0.817-1.146-1.9-1.146-3.247c0-1.337,0.37-2.42,1.111-3.248
						c0.745-0.816,1.735-1.224,2.968-1.224c1.245,0,2.229,0.397,2.953,1.189c0.718,0.787,1.075,1.878,1.075,3.272L50.733,18.853z
						M48.727,17.256c-0.271-1.043-0.928-1.563-1.972-1.563c-0.236,0-0.458,0.037-0.668,0.107c-0.207,0.073-0.397,0.177-0.567,0.313
						c-0.173,0.137-0.316,0.299-0.438,0.49s-0.214,0.408-0.278,0.652H48.727z"/>
					<path fill="#FFFFFF" d="M52.868,14.166h1.962v0.78c0.685-0.677,1.452-1.016,2.31-1.016c0.983,0,1.751,0.31,2.3,0.928
						c0.475,0.527,0.712,1.387,0.712,2.58v5.183h-1.962v-4.724c0-0.832-0.116-1.409-0.347-1.728c-0.226-0.324-0.636-0.485-1.233-0.485
						c-0.647,0-1.108,0.213-1.381,0.643c-0.265,0.422-0.398,1.16-0.398,2.214v4.08h-1.962V14.166z"/>
					<path fill="#FFFFFF" d="M65.309,20.72h6.435v1.901h-9.76l6.582-11.503H63.06V9.216h8.829L65.309,20.72z"/>
					<path fill="#FFFFFF" d="M81.432,18.853h-6.061c0.052,0.694,0.277,1.248,0.677,1.658c0.398,0.405,0.912,0.608,1.537,0.608
						c0.485,0,0.889-0.116,1.206-0.348c0.312-0.231,0.668-0.66,1.069-1.285l1.648,0.921c-0.255,0.434-0.524,0.805-0.808,1.114
						s-0.587,0.562-0.912,0.764c-0.323,0.199-0.673,0.348-1.05,0.439c-0.377,0.094-0.784,0.139-1.225,0.139
						c-1.261,0-2.273-0.404-3.038-1.214c-0.764-0.817-1.146-1.9-1.146-3.247c0-1.337,0.369-2.42,1.11-3.248
						c0.747-0.816,1.738-1.224,2.97-1.224c1.243,0,2.229,0.397,2.951,1.189c0.717,0.787,1.076,1.878,1.076,3.272L81.432,18.853z
						M79.427,17.256c-0.273-1.043-0.93-1.563-1.973-1.563c-0.237,0-0.459,0.037-0.668,0.107c-0.208,0.073-0.398,0.177-0.569,0.313
						c-0.17,0.137-0.315,0.299-0.438,0.49c-0.12,0.191-0.214,0.408-0.277,0.652H79.427z"/>
					<path fill="#FFFFFF" d="M85.735,15.987v6.634h-1.953v-6.634H82.95v-1.822h0.832v-3.101h1.953v3.101h1.521v1.822H85.735z"/>
					<path fill="#FFFFFF" d="M94.974,14.166h1.963v8.456h-1.963v-0.886c-0.804,0.753-1.669,1.128-2.596,1.128
						c-1.169,0-2.136-0.422-2.9-1.268c-0.758-0.862-1.136-1.938-1.136-3.229c0-1.27,0.378-2.324,1.136-3.17
						c0.759-0.845,1.707-1.267,2.849-1.267c0.983,0,1.867,0.405,2.647,1.215V14.166z M90.338,18.367c0,0.81,0.217,1.471,0.652,1.978
						c0.445,0.517,1.006,0.774,1.684,0.774c0.723,0,1.308-0.249,1.753-0.747c0.445-0.514,0.669-1.169,0.669-1.962
						c0-0.794-0.224-1.446-0.669-1.962c-0.445-0.503-1.024-0.755-1.735-0.755c-0.672,0-1.232,0.254-1.685,0.765
						C90.561,16.972,90.338,17.609,90.338,18.367z"/>
				</g>
			</g>
		</svg>
		</a>
	`;

	this.profile.innerHTML = template;
	if(this.panelBackground)
		this.profile.style.backgroundImage = `url(${this.panelBackground})`;

	const slowmoBtn = this.profile.querySelector('#slowmo');
	const doSlowmoBtn = (event) => {
		event.preventDefault();
		event.stopPropagation(); 
		this.artGenerator.EnableSlowMode();
		this.artGenerator.ResetContext();
		this.artGenerator.UpdateCanvas();
		this.FlipCard(event);
	};
	if(slowmoBtn){
		slowmoBtn.addEventListener('click', doSlowmoBtn);
	}

	const bkgBtn = this.profile.querySelector('#background');
	const doBkgBtn = (event) => {
		event.preventDefault();
		event.stopPropagation(); 
		this.renderMode = (this.renderMode !== 'background') ? 'background' : '';
		this.artGenerator.ResetUpdateCanvas();
		this.artGenerator.ResetContext();
		this.Render();
		this.RenderStats();
		this.artGenerator.UpdateCanvas();
		this.FlipCard(event);
	}
	if(bkgBtn){
		bkgBtn.addEventListener('click', doBkgBtn);
	}

	const subjBtn = this.profile.querySelector('#subject');
	const doSubjBtn = (event) => {
		event.preventDefault();
		event.stopPropagation(); 
		this.renderMode = (this.renderMode !== 'subject') ? 'subject' : '';
		this.artGenerator.ResetUpdateCanvas();
		this.artGenerator.ResetContext();
		this.Render();
		this.RenderStats();
		this.artGenerator.UpdateCanvas();
		this.FlipCard(event);
	};
	if(subjBtn){
		subjBtn.addEventListener('click', doSubjBtn);
	}

	const dlBtn = this.profile.querySelector('#download');
	const doDlBtn = (event) => {
		event.preventDefault();
		event.stopPropagation(); 
		let link = document.createElement('a');
		link.download = 'exobit-'+this.key+'.png';
		link.href = this.canvas.toDataURL()
		link.click();
	};
	if(dlBtn){
		dlBtn.addEventListener('click', doDlBtn);
	}

	const gzlogo = this.profile.querySelector('#gz-logo');
	const doGzLogo = (event) => {
		event.stopPropagation(); 
	};
	if(gzlogo){
		gzlogo.addEventListener('click', doGzLogo);
	}
}

export default RenderStats;