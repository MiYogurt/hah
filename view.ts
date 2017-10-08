import * as pug from 'pug';
import * as path from 'path';

function installViewEngine(res, basePath = path.resolve(__dirname, './views')){
	res.render = (filename, context) => {
		try {
			const prod = process.env['NODE_ENV'] == 'prod' ? true: false;
			const fn = pug.compileFile(basePath + filename, {
				debug: !prod,
				cache: prod,
				basedir: basePath
			});
			const html = fn(context)
			res.end(html);
		}catch(e) {
			console.log(e);
			res.end(e)
		}

	}
}

export { installViewEngine }