document.body.scroll = "no";

function pointInTriangle (p, p0, p1, p2) {
	return (((p1.y - p0.y) * (p.x - p0.x) - (p1.x - p0.x) * (p.y - p0.y)) | ((p2.y - p1.y) * (p.x - p1.x) - (p2.x - p1.x) * (p.y - p1.y)) | ((p0.y - p2.y) * (p.x - p2.x) - (p0.x - p2.x) * (p.y - p2.y))) >= 0;
}

let tree = {};

let inputFile = document.querySelector('input[type=file]');
let treeDiv = document.querySelector(`div`);
let inputButton = document.querySelector('div#loadFile');
let newButton = document.querySelector('div#newFile');
let inputSpan = document.querySelector('span');
let infoSpan = document.querySelector('info');

Modals.getFromDoc(document);

inputFile.value = "";

let Decisions = {};

Decisions.input = {
	addBtn: Modals.items[0].childs.namedItem('addValues').children.namedItem('addDecBtn'),
	addName: Modals.items[0].childs.namedItem('addValues').children.addDecName,
	addValue: Modals.items[0].childs.namedItem('addValues').children.addDecValue,
	cngBtn: Modals.items[1].childs.namedItem('cngValues').children.cngDecBtn,
	cngName: Modals.items[1].childs.namedItem('cngValues').children.cngDecName,
	cngValue: Modals.items[1].childs.namedItem('cngValues').children.cngDecValue,
	newTBtn: Modals.items[2].childs.namedItem('newValues').children.newTreeBtn,
	newTName: Modals.items[2].childs.namedItem('newValues').children.newTreeName,
	conBtn: Modals.items[3].childs.namedItem('connValues').children.cngConnBtn,
	conValue: Modals.items[3].childs.namedItem('connValues').children.connections.children.changable
};

let fileMenu = {
	btn: document.querySelector('div#optionButton'),
	menu: document.querySelector('div#fileMenu'),
	bottom: document.querySelector('span.bottomContainer')
};

let treeMenu = {
	btn: document.querySelector('div#treeoptionButton'),
	menu: document.querySelector('div#treeMenu'),
	addBtn: document.querySelector('div#nodeAddOpt'),
	delBtn: document.querySelector('div#nodeDelOpt'),
	cnnBtn: document.querySelector('div#connEditOpt')
}

fileMenu.btn.onclick = (e)=>{
	e.stopPropagation();
	treeMenu.menu.style.display = "none";
	fileMenu.menu.style.display = "block"
}

fileMenu.menu.querySelector('#saveOption').onclick = ()=>{
	saveFile(treeToString(tree));
}

treeMenu.btn.onclick = (e)=>{
	e.stopPropagation();
	treeMenu.menu.style.display = "block";
	fileMenu.menu.style.display = "none";
}

treeMenu.addBtn.onclick = (e)=>{
	P5.typing = true;
	addMenu({}).then((r)=>{
		let ts = P5.font.textBounds(r.value);
		P5.addDecision(
			r.name.replace(/[ \t]/gi, ""),
			r.value,
			[],
			ts.w < 20 ? 60 : ts.w + 30,
			ts.h < 20 ? 60 : ts.h
		);
		P5.typing = false;
	}).catch((e)=>{
		infoSpan.innerHTML = `Could not add new Node. Err: ${e}`;
		P5.typing = false;
	});
}

treeMenu.delBtn.onclick = (e)=>{
	P5.delModeToggle();
}

treeMenu.cnnBtn.onclick = (e)=>{
	P5.conModeToggle();
}

newButton.onclick = (e)=>{
	P5.typing = true;
	newMenu().then((r)=>{
		prepareTree();
		processFile(`tree ${r.name.replace(/[ \t]/gi, "")}:\nend tree: ${r.name.replace(/[ \t]/gi, "")}`);
		P5.typing = false;
	}).catch((e)=>{
		infoSpan.innerHTML = `New File could not be created! Err: ${e}`
		P5.typing = false;
	});
}

window.onclick = (e)=>{
	fileMenu.menu.style.display = "none";
	treeMenu.menu.style.display = "none";
}

inputButton.onclick = (e)=>{
	e.target.value = 'Reload/Load New';
	inputFile.click({target: inputFile});
}

let showTree = function(t){
	if(!t)
		return null;
	if(!t.trees)
		return null;
	if(!t.trees[0])
		return null;
	if(inputFile.files[0])
		infoSpan.innerHTML = `File ${inputFile.files[0].name} (${inputFile.files[0].size} B) loaded correctly. Showing Tree...`;
	else{
		infoSpan.innerHTML = `Showing ${t.trees[0]}`;
	}
	P5.setTitle(t.trees[0].name);
	t.trees[0].decisions.forEach((e)=>{
		if(e){
			let deci;
			eval(`deci = t.global.${t.trees[0].name}.${e.name}`);
			let ts = P5.font.textBounds(deci.text);
			P5.addDecision(
				e.name.replace(/[ \t]/gi, ""),
				deci.text,
				deci.GOs,
				ts.w < 20 ? 60 : ts.w + 30,
				ts.h < 20 ? 60 : ts.h
			);
		}
	});
	return true;
}

let newMenu = ()=>{

	return new Promise((rs,rj)=>{
		let tempWOC = window.onclick;
		window.onclick = (e)=>{
			e.stopPropagation();
			e.preventDefault();
			if(e.target.matches('#newModal') || e.target.matches('#newTreeBtn')){
				window.onclick = tempWOC;
				Modals.items[2].hide();
				rj('User discrad!');
			}
		}
		Decisions.input.newTBtn.onclick = (e)=>{
			Modals.items[2].hide();
			rs({name: Decisions.input.newTName.value});
		}
		Modals.items[2].show();
		fileMenu.menu.style.display = "none";
		treeMenu.menu.style.display = "none";
	});

};

let addMenu = (setup)=>{
	if(!setup)
		return null;
	return new Promise((rs,rj)=>{
		Decisions.input.addName.value = setup.name || "";
		Decisions.input.addValue.value = setup.value || "";
		let tempWOC = window.onclick;
		window.onclick = (e)=>{
			if(e.target.matches(`#addModal`) || e.target.matches('#addDecBtn')){
				window.onclick = tempWOC;
				Modals.items[0].hide();
				rj("User discard!");
			}
		};
		Decisions.input.addBtn.onclick = (e)=>{
			Modals.items[0].hide();
			if(!Decisions.input.addName.value)
				rj("Name not specified!");
			rs({name: Decisions.input.addName.value, value: Decisions.input.addValue.value});
		}
		Modals.items[0].show();
		fileMenu.menu.style.display = "none";
		treeMenu.menu.style.display = "none";

	});
}

let changeMenu = (setup)=>{
	if(!setup)
		return null;
	return new Promise((rs,rj)=>{
		Decisions.input.cngName.value = setup.name || "";
		Decisions.input.cngValue.value = setup.value || "";
		let tempWOC = window.onclick;
		window.onclick = (e)=>{
			if(e.target.matches(`#changeModal`) || e.target.matches('#cngDecBtn')){
				window.onclick = tempWOC;
				Modals.items[1].hide();
				rj("User discard!");
			}
		};
		Decisions.input.cngBtn.onclick = (e)=>{
			Modals.items[1].hide();
			if(!Decisions.input.cngName.value)
				rj("Name not specified!");
			rs({name: Decisions.input.cngName.value, value: Decisions.input.cngValue.value});
		}
		Modals.items[1].show();
		fileMenu.menu.style.display = "none";
		treeMenu.menu.style.display = "none";
	});

}

let connChangeMenu = (setup)=>{
	return new Promise((rs,rj)=>{
		if(!setup)
			rj("No setup provided!");
		let connections = [];
		let saveConn = (i)=>{
			if(!i && i !== 0)
				return;
			connections[i].n = connections[i].inputName.value.replace(/ \t/gi, "");
			connections[i].d = connections[i].inputDest.value.replace(/ \t/gi, "");
		};
		let delConn = (i)=>{
			if(!i && i !== 0)
				return;
			connections.unsetItem(i);
			Decisions.input.conValue.children.item(i).style.display = "none";
		}
		let aps = [];
		setup.cons.forEach((e,i,a)=>{
			let tr = document.createElement('tr');
			let td1 = document.createElement('td');
			let td2 = document.createElement('td');
			let td3 = document.createElement('td');
			let in3 = document.createElement('input');
			in3.type = 'button';
			in3.value = "X";
			in3.classEqual(`delCnBtn`);
			let in1 = document.createElement('input');
			in1.value = (e.dest || "Dest");
			in1.type = 'text';
			let in2 = document.createElement('input');
			console.log(setup);
			in2.value = (e.name || (setup.type==='click'?"#X#":""));
			if(in2.value === '#X#'){
				in2.value = "click";
				in2.readOnly = true;
			}
			in2.type = 'text';
			connections.push({n:e.name,d:e.dest,inputName: in2, inputDest: in1});
			let cI = connections.length - 1;
			in1.onkeyup = (e)=>{
				saveConn(cI);
			};
			in2.onkeyup = (e)=>{
				saveConn(cI);
			};
			in3.onclick = (e)=>{
				delConn(cI);
			}
			td1.append(in1);
			td2.append(in2);
			td3.append(in3);
			tr.append(td1, td2, td3);
			aps.push(tr);
		});
		Modals.items[3].show();
		Modals.items[3].childs.namedItem('connValues').children.connections.children.changable.clear();
		Decisions.input.conValue = Modals.items[3].childs.namedItem('connValues').children.connections.children.changable;
		aps.forEach(e=>Decisions.input.conValue.append(e));
		let tempWOC = window.onclick;
		window.onclick = (e)=>{
			if(e.target.matches(`#connectionsModal`) || e.target.matches('#cngConnBtn')){
				window.onclick = tempWOC;
				Modals.items[3].hide();
				rj("User discard!");
			}
		};
		Decisions.input.conBtn.onclick = ()=>{
			Modals.items[3].hide();
			rs({c: connections});
		}
	});
}

// FILE HANDLING

let loadFromFile = (file)=>{
	let fr = new FileReader();
	return new Promise((res,rej)=>{
		fr.onload = (e)=>{
			res({text: e.target.result});
		};
		fr.onprogress = (e)=>{
			console.log(e);
		}
		fr.onerror = (e)=>{
			rej(e);
		}
		fr.readAsText(file);
	});
}

const SAVE_TYPE = 'application/octet-stream';

let saveFile = function(dt){
	if(!dt)
		dt = "// No data present!";
	window.URL = window.webkitURL || window.URL;
	let fileName;
	if(inputFile.files[0]){
		fileName = inputFile.files[0].name;
	}
	else{
		do{
			fileName = prompt('Save As', "tree.dt");
		}while(!(/[^.]+\.dt/i.test(fileName)));
	}

	infoSpan.innerHTML = `Saving to file: ${fileName}.`;

	let prevLink = document.querySelector('a#down');
	if (prevLink){
		if(prevLink.href)
			window.URL.revokeObjectURL(prevLink.href);
	}
	let bb = new Blob([dt], {type: SAVE_TYPE});
	let a = document.querySelector('a#down');
	a.download = fileName;
	a.href = window.URL.createObjectURL(bb);
	a.style.display = "none";
	a.onclick = ()=>{
		if ('disabled' in a.dataset) {
			return false;
		}
		a.dataset.disabled = true;
		setTimeout(()=>{
			window.URL.revokeObjectURL(a.href);
			infoSpan.innerHTML = `Successfully saved!`;
		}, 1500);
	};
	a.click();
}

let processLine = (fe, log)=>{
	let {e:line,i,a:saveArray} = fe;
	if(!line)
		return;
	line = FileProcessing.regx.comment(line);
	switch(tree.scope()){
		case 0:
			if(FileProcessing.regx.tree.open.test(line)){
				let xpr = FileProcessing.regx.tree.open.exec(line);
				if(xpr[1]){
					eval(`tree.${tree.getScope(tree.scope(), true)}.${xpr[1]} = {}`);
					tree.trees[tree.scope()] = {name: xpr[1], decisions: ['']};
					tree.addScope(xpr[1]);
					if(log)
						console.log(`Added new Tree: ${tree.getScope(tree.scope())}`);
				}
			}
		break;
		case 1:
			let closeT = FileProcessing.regx.end(line);
			if(closeT){
				if(closeT.is('tree', tree.trees.getLastItem().name)){
					if(log)
						console.log(`Closed ${tree.getScope(tree.scope())}`);
					tree.loadState.block--;
				}
			}
			else{
				let dS = FileProcessing.regx.decision.open(line);
				if(FileProcessing.regx.decision.check(dS)){
					eval(`tree.${tree.getScope(tree.scope(), true)}.${dS.name} = {type: dS.type}`);
					tree.addScope(dS.name);
					tree.trees.getLastItem().decisions.push({name: dS.name});
					if(log)
						console.log(`\tAdded new Node: ${tree.getScope(tree.scope())}`);
				}
			}
		break;
		case 2:
			let closeD = FileProcessing.regx.end(line);
			if(closeD){
				if(closeD.is('node', tree.trees.getLastItem().decisions.getLastItem().name)){
					if(log)
						console.log(`\tClosed ${tree.getScope(tree.scope())}`);
					tree.endScope();
				}
			}
			else{
				if(log)
					console.log(`\t\t${line}`);
				let decisionInside = 
				FileProcessing.regx.decision.process(line, eval(`tree.${tree.getScope(tree.scope(),1)}`));
				if(decisionInside){
					let e;
					eval(`e = tree.${tree.getScope(tree.scope(),1)}`);
					if(!e.GOs)
							e.GOs = [];
					if(!e.text)
						e.text = "";
					if(decisionInside.namedGo){
						e.GOs.push({dest: decisionInside.namedGo[1], name: decisionInside.namedGo[2]});
					}
					else if(decisionInside.go){
						if(e.type === 'click')
							e.GOs.push({dest: decisionInside.go[1]});
					}
					else if(decisionInside.line){
						e.text = e.text + (e.text?"\n":"") + decisionInside.line;
					}
				}
			}
		break;
	}
	fe.a = saveArray;

}

let processFile = (fat)=>{
	// fat = file as text
	let faa = fat.split(/\n/i);// file as array
	faa.forEach((e,i,a)=>a[i] = e.replace(/\r/gi,"")); // clear \r's
	faa.forEach((e,i,a)=>{
		processLine({e,i,a}); // process line
	});
	//let tempS = tree.toString();
	tree = {global: tree.global, trees: tree.trees}; // clear tree
	//tree.toString = (()=>{return tempS;});
	if(showTree(tree)){ // show tree
		if(inputFile.files[0])	// change state if 'Open'
			infoSpan.innerHTML = `File ${inputFile.files[0].name} (${inputFile.files[0].size} B) loaded correctly.`;
		else // change state if 'New'
			infoSpan.innerHTML = `New tree ${tree.trees[0].name} successfully added.`;
		fileMenu.bottom.style.display = "block"; // show fileMenu
		treeMenu.btn.style.display = "block"; // show treeMenu
	}
	else{	// show tree failiure
		infoSpan.innerHTML = `File ${inputFile.files[0].name} has not been loaded correctly! No tree present!`;
	}
}

let reloadFile = ()=>{
	hFS({target: inputFile}); // reload file
}

let treeToString = function(t){
	let asString = "";

	if(!t.trees)
		return "// EMPTY";
	if(!t.trees[0])
		return "// EMPTY";
	asString += `//AUTO GENERATED TREE\n\r`;
	asString += `tree ${t.trees[0].name}:\n\r`;
	if(t.trees[0].decisions)
	{
		t.trees[0].decisions.forEach((e)=>{
			if(!e)
				return;
			let ed;
			eval(`ed = t.global.${t.trees[0].name}.${e.name}`);
			if(!ed)
				return;
			asString += `\tnode ${ed.type} ${e.name}:\n\r`;

			ed.text.split('\n').forEach((e2)=>{
				if(!e2)
					return;
				asString += `\t\t${e2}\n\r`;
			});

			ed.GOs.forEach((e3)=>{
				if(!e3)
					return;
				if(!e3.dest)
					return;
				asString += `\t\t->${e3.dest}${e3.name?`#${e3.name}`:``}\n\r`;
			});

			asString += `\tend node: ${e.name}\n\r`;
		});
	}

	asString += `end tree: ${t.trees[0].name}\n\r`;
	asString += `//AUTO GENERATED TREE`;

	return asString;
}

let prepareTree = ()=>{
	// RESET TREE VARs
	tree = {};
	tree.global = {};
	tree.trees = [];
	tree.loadState = {block:0, blockScopes:['global']};
	P5.clearDecisions();
	// 	SET TREE TEMP FNs
	tree.getScope = function(bl=0, gl=false){
		let block = bl + 1;
		let scope = 
		Array.from(this.loadState.blockScopes)
		.splice(1, bl)
		.join('.');
		if(gl)
			scope = this.loadState.blockScopes[0] + (scope?".":"") + scope;
		return scope;
	}
	tree.scope = function(){
		return this.loadState.block;
	}
	tree.endScope = function(){
		this.loadState.block--;
		this.loadState.blockScopes.unsetLastItem();
	}
	tree.addScope = function(name){
		this.loadState.block++;
		this.loadState.blockScopes[this.loadState.block] = name;
	}
}

let hFS = (e)=>{
	//TREE SETUP
	prepareTree();

	// LOAD
	let files = e.target.files;
	if(files[0]) {
		loadFromFile(files[0]).then((r)=>{
			infoSpan.innerHTML = `File ${files[0].name} (${files[0].size} B) loaded correctly. Processing...`;
			processFile(r.text);
		}).catch(console.error);
	}
}

// INIT
if(goodB){
	inputFile.addEventListener('change', hFS, false);
}
else{
	treeDiv.innerHTML = `Sorry, but your browser does not support this app!`;
}
