class Decision {
	constructor(canvas, decisionList, sx=0, sy=0, w=60, h=60, name, vl, connections){
		this.cnv = canvas;
		this.dL = decisionList;
		this.value = vl;
		this.w = w;
		this.h = h;
		this.x = sx;
		this.y = sy;
		this.name = name;
		this.outTriangle = {
			p1: {x: sx + w, y: sy + h/2 - (1/8 * h)},
			p2: {x: sx + w, y: sy + h/2 + (1/8 * h)},
			p3:{x: sx + w + 10, y: sy + h/2}
		};
		this.inTriangle = {
			p1: {x: sx, y: sy + h/2 - (1/8*h)},
			p2: {x: sx, y: sy + h/2 + (1/8*h)},
			p3:{x: sx + 10,y: sy + h/2}
		};

//	Array containing objects with destination(.dest) and
//	name(.name) specifying what connection to make.
		this.connections = connections;
		this.connectionStart = false;
		this.drawConnections = [];
		this.rlov = false;
		this.type = connections.length <= 1?"click":connections.length === 2?"dual":connections.length > 2?"lots":"click";
		this.otrlov = false;
		this.offset = {x:0, y:0};
		this.dragging = false;
		this.colorFill = {r:255,g:255,b:255,a:255, stroke:{r:255,g:255,b:255}};
	}

}

let n = 0;

Decision.prototype.recalcTriangles = function(){
	this.outTriangle = {
		p1: {x: this.x + this.w, y: this.y + this.h/2 - (1/8 * this.h)},
		p2: {x: this.x + this.w, y: this.y + this.h/2 + (1/8 * this.h)},
		p3:{x: this.x + this.w + 10, y: this.y + this.h/2}
	};
	this.inTriangle = {
		p1: {x: this.x, y: this.y + this.h/2 - (1/8*this.h)},
		p2: {x: this.x, y: this.y + this.h/2 + (1/8*this.h)},
		p3:{x: this.x + 10,y: this.y + this.h/2}
	};
}

Decision.prototype.reconnect = function(){
	this.drawConnections = [];
	Array.from(this.dL).forEach((to)=>{
		Array.from(this.connections).forEach((ex)=>{
			if(ex.dest === to.name){
				this.drawConnections.push({
					fn: ()=>{
						let
						b = {x:to.x,y:to.y+to.h/2},	// black spot
						g = this.outTriangle.p3,	// green spot
						c = {x:b.x-g.x,y:b.y-g.y},	// c distance
						r1 = {},					// red spot 1
						r2 = {};					// red spot 2
						if(c.x > 0){
							// b is on left
							r1 = {
								x: g.x + c.x/2,
								y: g.y
							};
							r2 = {
								x: b.x - c.x/2,
								y: b.y
							};
							c = {
								x:c.x + 5,
								y:c.y - 10
							};
						}
						else {
							// b is on right
							r1 = {
								x: g.x - c.x/2,
								y: g.y + c.y
							};
							r2 = {
								x: b.x + c.x/2,
								y: b.y - c.y
							};
							c = {
								x: c.x + 5,
								y: c.y - 10
							};
						}
						noFill();
						stroke(0);	
						bezier(
							g.x, g.y,
							r1.x, r1.y,
							r2.x, r2.y,
							b.x, b.y
						);
						fill(0,0,0);
						noStroke();
						let hbx = bezierPoint(g.x, r1.x, r2.x, b.x, 0.5) - 10;
						let hby = bezierPoint(g.y, r1.y, r2.y, b.y, 0.5);
						text((ex.name || (this.type!=="click"?"":((abs(c.x)+abs(c.y) > 100)?"click":""))), hbx, hby);
					}
				});
			}
		});
	});
}

Decision.prototype.draw = function(mX, mY) {
	// SETTING ROLLOVER
	if(	mX > this.x &&
		mX < this.x + this.w &&
		mY > this.y &&
		mY < this.y + this.h)
		this.rlov = true;
	else
		this.rlov = false;

	if(pointInTriangle({x: mX, y: mY}, this.outTriangle.p1,this.outTriangle.p2,this.outTriangle.p3))
		this.otrlov = true;
	else
		this.otrlov = false;

	// CHANGING X,Y IN CASE OF DRAGGING THIS ONE
	if(this.dragging){
		this.x = mX + this.offset.x;
		this.y = mY + this.offset.y;
		this.recalcTriangles();
	}

	// REDRAWING BEZIER CURVES BETWEEN OTHER DECISIONS
	this.reconnect();
	this.drawConnections.forEach((b)=>{
		b.fn();
	});

	// DRAWING RECTANGLE
	stroke(this.colorFill.stroke.r, this.colorFill.stroke.g, this.colorFill.stroke.b, this.colorFill.stroke.a);
	fill(this.colorFill.r, this.colorFill.g, this.colorFill.b, this.colorFill.a);
	if(this.dragging)
		stroke(200,10,100);
	rect(this.x, this.y, this.w, this.h);

	fill(0);
	noStroke();
	triangle(
		this.outTriangle.p1.x, this.outTriangle.p1.y,
		this.outTriangle.p2.x, this.outTriangle.p2.y,
		this.outTriangle.p3.x, this.outTriangle.p3.y,
	);

	if(this.connections.length <= 1)
		this.type = "click";
	else if(this.connections.length === 2)
		this.type = "dual";
	else
		this.type = "lots";

	noStroke();
	fill(0);
	triangle(
		this.inTriangle.p1.x, this.inTriangle.p1.y,
		this.inTriangle.p2.x, this.inTriangle.p2.y,
		this.inTriangle.p3.x, this.inTriangle.p3.y,
	);

	// DRAWING DECISION->MOUSE LINE
	// TODO: Fix
	/*if(this.connectionStart){
		noFill();
		let
		b = {x:mX,y:mY},		// black spot
		g = this.outTriangle.p3,	// green spot
		c = {x:b.x-g.x,y:b.y-g.y},	// c distance
		r1 = {},					// red spot 1
		r2 = {};					// red spot 2
		if(c.x > 0){
			// b is on left
			r1 = {
				x: g.x + c.x/2,
				y: g.y
			};
			r2 = {
				x: b.x - c.x/2,
				y: b.y
			};
		}
		else {
			r1 = {
				x: g.x - c.x/2,
				y: g.y + c.y
			};
			r2 = {
				x: b.x + c.x/2,
				y: b.y - c.y
			};
		}
		bezier(
			g.x, g.y,
			r1.x, r1.y,
			r2.x, r2.y,
			b.x, b.y
		);
	}*/


	textSize(10);
	stroke(0);
	fill(0);

	// DRAWING NAME AND VALUE
	if(this.value){
		text(this.value, this.x + 15, this.y + 20, this.x + 15 + this.w, this.y - 5 + this.h);
	}
	text(this.name,this.x + 5, this.y + 10);
	textSize(16);
};

Decision.prototype.reTree = function(tr){
	let dc = eval(`tr.global.${tr.trees[0].name}.${this.name}`);
	if(!dc)
		return;
	tr.trees[0].decisions.pushIfNot({name: this.name});
	dc.GOs = this.connections || [];
	dc.text = this.value || "";
	dc.type = this.type || "";
}

Decision.prototype.kys = function(tr){
	P5.decisions.unsetItem(P5.decisions.indexOf(this));
	eval(`tr.global.${tr.trees[0].name}.${this.name} = null`);
	Array.from(this.dL).forEach((e)=>{
		e.connections.unsetMatchingItemV({dest: this.name});
	});
	let zH = tr.trees[0].decisions.getFirstMatchingObjectV({name:this.name});
	tr.trees[0].decisions.unsetItem(tr.trees[0].decisions.indexOf(zH));
};

Decision.prototype.click = function(){
	if(this.rlov || this.otrlov){
		if(!P5.deleteMode && !P5.connectionMode){
			// CHANGE MODE
			if(this.rlov)
				P5.openChangeMenu(this);
			if(this.otrlov)
				P5.openConChangeMenu(this);
			
		}
		else if(P5.deleteMode && !P5.connectionMode){
			// DELETE MODE
			this.kys(tree);
			P5.delModeHide();
		}
		else if(!P5.deleteMode && P5.connectionMode){
			//CONNECTION MODE
			if(this.otrlov){
				this.dL.forEach((e)=>e.connectionStart = false);
				this.connectionStart = true;
				console.log(`Started connection from: ${this.name}`)
			}
			if(this.rlov){
				this.dL.forEach((e,i,a)=>{
					if(e.connectionStart){
						console.log(`Connection created: ${e.name}=>${this.name}`);
						e.connections.push({dest:this.name});
						e.connectionStart = false;
					}
				});
			}
		}
		else{
			if(this.rlov){
				this.connections = [];
			}
		}	
	}
}