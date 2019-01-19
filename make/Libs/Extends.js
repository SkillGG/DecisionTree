Array.prototype.getLastItem = function() {
	return this[this.length-1] || null;
};
Array.prototype.setLastItem = function(value) {
	return (this[this.indexOf(this.getLastItem())] = value);
};
Array.prototype.unsetLastItem = function() {
	return this.splice(this.indexOf(this.getLastItem()), 1)[0];
};
Array.prototype.unsetItem = function(index){
	return this.splice(index, 1)[0];
}
Array.prototype.getAllMatchingObjectsA = function(match){
	if(!((match === Object(match))&& 	// Check if is an object
		typeof match !== 'function'))	// exclude functions
		return null;
	let r = [];
	this.forEach((e)=>{
		let eMatch = [];
		if(	(e === Object(e))&& 		// Check if is an object
			typeof e !== 'function'&& 	// exclude functions
			!Array.isArray(e)){			// exclude arrays
				let matchAttrs = [];
				if(Array.isArray(match))
					matchAttrs = match;	
				else 
					Object.entries(match).forEach((z)=>{matchAttrs.push(z[0])});
				let fail = false;
				matchAttrs.forEach((x)=>{
					if(!(e[x])){
						fail = true;
						return;
					}
				});
				if(fail)
					return;
				else r.push(e);
		}
	});
	return (r||[]).length > 0?(r||null):null;
}
Array.prototype.getLastMatchingObjectA = function(match){
	if(!((match === Object(match))&& 	// Check if is an object
		typeof match !== 'function'))	// exclude functions
		return null;
	let r;
	this.forEach((e)=>{
		let eMatch = [];
		if(	(e === Object(e))&& 		// Check if is an object
			typeof e !== 'function'&& 	// exclude functions
			!Array.isArray(e)){			// exclude arrays
				let matchAttrs = [];
				if(Array.isArray(match))
					matchAttrs = match;	
				else 
					Object.entries(match).forEach((z)=>{matchAttrs.push(z[0])});
				let fail = false;
				matchAttrs.forEach((x)=>{
					if(!(e[x])){
						fail = true;
						return;
					}
				});
				if(fail)
					return;
				else r = e;
		}
	});
	return r || null;
}
Array.prototype.pushIfNot = function(el)
{
	if(this.indexOf(el) !== -1){
		return false;
	}
	else if(this.getFirstMatchingObjectA(el)){
		return false;
	}
	this.push(el);
	return true;
}
Array.prototype.pushIfNotChange = function(el){
	if(this.indexOf(el) !== -1){
		this[this.indexOf(el)] = el;
		return true
	}
	else if(this.getFirstMatchingObjectA(el)){
		let z = this.getFirstMatchingObjectA(el);
		this[this.indexOf(z)] = el;
		return true;
	}
	else{
		this.push(el);
	}
}
Array.prototype.getFirstMatchingObjectA = function(match){
	if(!((match === Object(match))&& 	// Check if is an object
		typeof match !== 'function'))	// exclude functions
		return null;
	let r;
	this.forEach((e)=>{
		if(!r){
			let eMatch = [];
			if(	(e === Object(e))&& 		// Check if is an object
				typeof e !== 'function'&& 	// exclude functions
				!Array.isArray(e)){			// exclude arrays
					let matchAttrs = [];
					if(Array.isArray(match))
						matchAttrs = match;	
					else 
						Object.entries(match).forEach((z)=>{matchAttrs.push(z[0])});
					let fail = false;
					matchAttrs.forEach((x)=>{
						if(!(e[x])){
							fail = true;
							return;
						}
					});
					if(fail)
						return;
					else r = e;
			}
		}
	});
	return r || null;
}
Element.prototype.clear = function(){
	let change = document.createElement(this.tagName);
	this.classList.forEach(e=>change.addClasses(e));
	change.id = this.id;
	this.replaceWith(change);
};
Element.prototype.removeAllAttributes = function(saveID, saveClasses){
	Array.from(this.attributes).forEach((e,i,a)=>{
		if(/id/i.test(e.nodeName)){
			if(!saveID)
				this.attributes.removeNamedItem(e.nodeName);
		}
		if(/class/i.test(e.nodeName)){
			if(!saveClasses)
				this.attributes.removeNamedItem(e.nodeName);
		}
	});
}
Element.prototype.addClasses = function(...c){
	c.forEach(e=>this.classList.add(e));
}
Element.prototype.clearClass = function(){
	while(this.classList.length > 0)
		this.classList.remove(this.classList.item(0));
}
Element.prototype.classEqual = function(...c){
	this.clearClass();
	c.forEach(e=>this.addClasses(e));
}

RegExp.toRegExp = function(text){
	return new RegExp(text.replace(/([\\\/$^.])/g, `\\$1`));
}

RegExp.concat = function (flags, ...regexs){
	let srcs = "";
	for(r in regexs){
		if(typeof regexs[r] === 'object'){
			srcs += regexs[r].source;
		}
		else if(typeof regexs[r] === 'string'){
			srcs += regexs[r];
		}
	}
	let rex = new RegExp(srcs, flags);
	// console.log(rex);
	return rex;
}

let Exts = {};
Exts.DIV = ()=>{
	return document.createElement('div');
}
Exts.INPUT = (type, pholder)=>{
	let r = document.createElement('input');
	r.type = type;
	r.placeholder = pholder;
	return r;
}
Exts.BTN = (value)=>{
	let b = document.createElement('input');
	b.type = 'button';
	b.value = value;
	return b;
}