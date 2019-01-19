let setTitle = function(opt){
	if(opt.file)
	{
		if(opt.file instanceof Promise === true){
			let response = data=>{
				let opt = Options.parseOptions(data);
				document.title = `${opt.title}(${opt.subtitle}) v${opt.version} by ${opt.madeby}`;
			};
			
			opt.file.then(f=>{
				if(f.ok){
					f.text().then(response).catch(e=>{console.error("DAMN! File could not resolve as text!");console.log(e);});
					return;
				}
				throw `DAMN! Your Promise did not resolve into proper data!`;
			}).catch(console.error);

		}
	}
	if(opt.title){
		document.title = title;
	}
}