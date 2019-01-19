let FileProcessing = {};


FileProcessing.regx = {};

// REGEX STABLE
/**

*/
FileProcessing.regx.comment = (e)=>{
	return e
	.replace(/([^/]*)(?:\/\/[^]*)?/, (m,p1)=>{return p1;}) // Get rid of everything post '//'
	.replace(/\\([\/\\])/g, (m,p1)=>{return p1;}); // Change every \\ and \/ into '\' and '/'
}
FileProcessing.regx.tree = {};

/**
	tree <NAME>[1]:
*/
FileProcessing.regx.tree.open = /(?:[ \t]*)tree(?:[ ]+[ \t]*)([^:]*)(?:[ \t]*):/i;
/**
	end <TYPE>[1]:<NAME>[2]
*/
FileProcessing.regx.endRX = /(?:[ \t]*)end(?:[ ]+[ \t]*)([^:]*)(?:[ \t]*)\:(?:[ \t]*)([^]*)/i;

FileProcessing.regx.decision = {};
/**
	decision <TYPE> <LABEL>[2]:
*/
FileProcessing.regx.decision.startRX = /(?:[ \t]*)node(?:[ ]+[ \t]*)([^ ]+)(?:[ ]+[ \t]*)([^: ]*)(?:[ \t]*):/i;
/**
	-><DESTINATION>[1]#<NAME>[2]
*/
FileProcessing.regx.decision.namedGoRX = /(?:[ \t]*)\->([^# ]*)#([^]*)/;
/**
	-><DESTINATION>[1]
*/
FileProcessing.regx.decision.goRX = /(?:[ \t]*)\->([^ ]*)(?:[ \t]*)/;

// FileProcessing.regx.variable = {};
// VARIABLES
//
// /**
// 	<VAR_NAME>[1] {=<VAR_VALUE>[3]}[2] 
// */
// FileProcessing.regx.variable.define = /\.([a-zA-Z][a-zA-Z0-9]*)(?: *)((?:[=])(?: *)([^]*))?/i;
// /**
// 	"<STRING>"
// */
// (FileProcessing.regx.variable.types = {}).string = /(['"`])(?:(?!\1))*(?:\1)/;

//REGEX FUNCTIONS
FileProcessing.regx.end = (line)=>{
	if(!line)
		return false;
	if(!FileProcessing.regx.endRX.test(line))
		return false;
	let m = FileProcessing.regx.endRX.exec(line);
	if(!m[1])
		return false;
	if(!m[2])
		return false;
	return {
		type: m[1],
		name: m[2],
		is:(e,g)=>FileProcessing.regx.isEnd(m[1],m[2],e,g)
	};
};

FileProcessing.regx.isEnd = function(a,b, c, d){
	if(!a || !b || !c || !d){
		return false;
	}
	if(a===c && b===d)
		return true;
	return false;
}

FileProcessing.regx.decision.open = (line)=>{
	if(!line)
		return false;
	let m;
	if(!(m = FileProcessing.regx.decision.startRX.exec(line)))
		return false;
	return {name: m[2], type: m[1]};

}

FileProcessing.regx.decision.check = (e)=>{
	if(!e)
		return false;
	if(!e.name || !e.type)
		return false;
	return true;
}

FileProcessing.regx.decision.process = (line, e)=>{
	let namedGo = FileProcessing.regx.decision.namedGoRX.exec(line);
	let go = FileProcessing.regx.decision.goRX.exec(line);

	let li = line.replace(/(?:[\t ]*)([^]*)/, (m,p1)=>{return p1;});

	return {namedGo, go, line:li};
}

// FileProcessing.addScope = (e)=>{
// 	if(!e)
// 		return;
// 	e.variables = {
// 		all:[],
// 		add: function(name, value){
// 			if(name && value){
// 				this.all.push(name);
// 				eval(`this.${name} = value`);
// 			}
// 		},
// 		forEach: function(cb){
// 			if(!cb)
// 				return;
// 			if(typeof cb !== 'function')
// 				return;
// 			this.all.forEach((e,i,a)=>{
// 				cb(eval(`this.${e}`), e, this);
// 			});
// 		}
// 	};
// }
//FileProcessing.addScope(tree.global);

// FileProcessing.regx.variable.parse = (l)=>{
// 	if(!l)
// 		return false;
// 	if(!FileProcessing.regx.variable.define.test(l))
// 		return false;
// 	let m = FileProcessing.regx.variable.define.exec(l);
// 	if(!m[1])
// 		return false;
// 	let name = m[1];
// 	let value = undefined;
// 	if(m[2])
// 		value = m[3];
// 	return {name, value};
// };
