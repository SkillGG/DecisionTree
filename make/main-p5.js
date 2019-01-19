let P5 = {};

P5.font = null;

P5.typing = false;

P5.canvasDrag = false;
P5.canvasOffset = {x:0, y:0};
P5.canvasStart = true;

P5.cnv = null;
P5.decisions = [];
P5.beizers = [];
P5.title = "";
P5.setTitle = function(title){
	this.title = title;
}

P5.scaleBy = 0;
P5.scale = 0;
P5.stopElDrag = false;

P5.x = 0; 
P5.y = 0;
P5.speedx = 0;
P5.speedy = 0;
let mx = 0, my = 0;

P5.drag = false;
P5.scrollShift = false;

P5.connectionMode = false;

P5.conModeShow = function(){
	this.connectionMode = true;
	document.querySelector("#cmodediode").style.display = "block";
	console.log(`Conection mode: Active`);
}
P5.conModeHide = function(){
	this.connectionMode = false;
	P5.decisions.forEach((e)=>e.connectionStart = false);
	document.querySelector("#cmodediode").style.display = "none";
	console.log(`Conection mode: Inactive`);
}
P5.conModeToggle = function(){
	if(this.connectionMode)
		this.conModeHide();
	else
		this.conModeShow();
}

P5.deleteMode = false;

P5.delModeShow = function(){
	this.deleteMode = true;
	document.querySelector("#dmodediode").style.display = "block";
	console.log(`Delete mode: Active`);
}
P5.delModeHide = function(){
	this.deleteMode = false;
	document.querySelector("#dmodediode").style.display = "none";
	console.log(`Delete mode: Inactive`);
}
P5.delModeToggle = function(){
	if(this.deleteMode)
		this.delModeHide();
	else
		this.delModeShow();
}

P5.openConChangeMenu = async (dec)=>{
	P5.typing = true;
	let pceed = true;
	let newV = await connChangeMenu({cons: dec.connections, type: dec.type}).catch(e=>{console.error(e); pceed = false;});
	if(pceed){
		if(newV){
			console.log(newV);
			dec.connections = [];
			newV.c.forEach((e)=>{
				dec.connections.push({name: (((e.n === "!N")?"":e.n) || ""), dest: e.d || ""});
			});
		}
	}
	P5.typing = false;
}

P5.openChangeMenu = async (dec)=>{
	P5.typing = true;
	let pceed = true;
	let newV = await changeMenu({name: dec.name, value: dec.value}).catch(e=>{console.error(e); pceed = false;});
	if(pceed){
		if(newV){
			if(newV.name && newV.value){
				dec.name = newV.name;
				dec.value = newV.value;
				let ts = P5.font.textBounds(dec.value);
				dec.w = (ts.w < 20 ? 60 : ts.w + 30);
				dec.h = (ts.h < 20 ? 60 : ts.h);
			}
		}
	}
	P5.typing = false;
}

P5.clearDecisions = ()=>{
	P5.decisions = [];
	P5.beizers = [];
}

function preload(){
	P5.font = loadFont('./RobotoMono-Regular.ttf');
}

function setup(){
	P5.cnv = createCanvas(1960, 1080);
	P5.cnv.parent('Tree');
  	P5.cnv.style('display', 'block');
  	frameRate(60);
}

P5.addDecision = function(name="", value="", connections=[], w=0, h=0){
	let lD = this.decisions.getLastItem();
	if(!lD)
		lD = {x: 0, y: 0, w: 60, h: 60};
	this.decisions.push(
		new Decision(this.cnv, this.decisions, (lD.x + lD.w + 20), (lD.y + lD.h/2), w?w:70, h?h:50, name, value, connections)
	);
}

function draw(){
	mx = mouseX - P5.x;
	my = mouseY - P5.y;
	background(140,140,140);
	stroke(0,0,0);
	textSize(16);
	text(P5.title, 0, 16);
	if(P5.scaleBy <= -1)
		P5.scaleBy = -0.99;
	if(P5.decisions[0])
		translate(P5.decisions[0].x, P5.decisions[0].y);
	scale(P5.scaleBy + 1);
	if(P5.decisions[0])
		translate(-P5.decisions[0].x, -P5.decisions[0].y);
	translate(P5.x, P5.y);
	P5.decisions.forEach((e,i,a)=>{
		e.recalcTriangles();
		e.draw(mx, my);
	});
	if(P5.canvasDrag){
		[P5.x, P5.y] = dragCanvas(mouseX, mouseY, P5.canvasOffset);
	}
	P5.x += P5.speedx;
	P5.y += P5.speedy;
}

function keyPressed(e){
	if(!P5.typing){
		if(keyCode === 16) // SHIFT
			P5.scrollShift = true;
		if(keyCode === 37) // LEFT
			P5.speedx = 10;
		if(keyCode === 38) // UP
			P5.speedy = 10;
		if(keyCode === 39) // RIGHT
			P5.speedx = -10;
		if(keyCode === 40) // DOWN
			P5.speedy = -10;
		if(keyCode === 68){ // D
			if(treeMenu.btn.style.display !== "none"){
				P5.delModeToggle();
			}
		}
		if(keyCode === 65){ // A
			if(treeMenu.btn.style.display !== "none"){
				treeMenu.addBtn.click();
			}
		}
		if(keyCode === 	67){ // C
			if(treeMenu.btn.style.display !== "none"){
				P5.conModeToggle();
			}
		}
		if(keyCode === 116 && !keyIsDown(CONTROL)){ // F5
			P5.x = P5.decisions[0] ? -P5.decisions[0].x + 50 : P5.x;
			P5.y = P5.decisions[0] ? -P5.decisions[0].y + 50 : P5.y;
			e.preventDefault();
			return;
		}
	}
}

function keyReleased(){
	if(!P5.typing){
		if(16 === keyCode)
			P5.scrollShift = false;
		if(key === 'r' || key === 'R'){ // R
			P5.scale = 0;
			P5.scaleBy = 0;
		}
		if(keyCode === 37) // LEFT
			P5.speedx = 0;
		if(keyCode === 38) // UP
			P5.speedy = 0;
		if(keyCode === 39) // RIGHT
			P5.speedx = 0;
		if(keyCode === 40) // DOWN
			P5.speedy = 0;
	}
}

function mouseWheel(e){
	if(!P5.drag){
		P5.scale -= (e.delta / (P5.scrollShift?100:10));
		if(P5.scale < 0.11 && P5.scale > -0.11)
			P5.scaleBy = 0;
		else
			P5.scaleBy = P5.scale;
	}
}

function dragCanvas(mx, my, mO){
	let nx = 0;
	let ny = 0;
	nx = mO.sx + (mx - mO.x);
	ny = mO.sy + (my - mO.y);
	return [nx, ny];
}

function mousePressed(ev){
	ev.stopPropagation();
	if(!ev.target.matches('canvas'))
		return;
	P5.stopElDrag = false;
	if(P5.tempTO)
		clearTimeout(P5.tempTO);
	if(P5.scaleBy === 0){
		Array.from(P5.decisions).reverse().forEach((e,i,a)=>{
			if(mx > e.x && mx < (e.x + e.w + 10) && my > e.y && my < e.y + e.h)
					P5.canvasStart = false;
			if(!P5.drag){
				if(mx > e.x && mx < (e.x + e.w + 10) && my > e.y && my < e.y + e.h){
					P5.tempTO = setTimeout(()=>{
						if(!P5.stopElDrag){
							e.dragging = true;
						}
					}, 200);
					e.offset.x = e.x - mx;
					e.offset.y = e.y - my;
					P5.drag = true;
				}
			}
		});
	}
	if(!P5.drag){
		P5.canvasDrag = true;
		P5.canvasOffset ={x: mouseX , y: mouseY, sx: P5.x, sy: P5.y};
		P5.drag = true;
	}
}

function mouseReleased(ev) {
	if(!ev.target)
		return;
	if(!(ev.target instanceof Element))
		return;
	if(!ev.target.matches('canvas'))
		return;
	Array.from(P5.decisions).reverse().forEach((e,i,a)=>{
		if(P5.scaleBy === 0 && !P5.canvasStart){
			if(!e.dragging){
				e.click();
			}
			P5.stopElDrag = true;
		}
		e.dragging = false;
	});
	P5.canvasDrag = false;
	P5.drag = false;
	if(!P5.canvasStart)
		P5.canvasStart = true;
}