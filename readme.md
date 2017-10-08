### net 模块

### http 与 https 模块

### 搭建一个 web server

```ts
import * as http from "http";
const server = http.createServer((req, res) => {
	res.end('hello world!')
})
server.listen(3000)
```

### 路由与控制器

```bash
npm i path-to-regexp
```

router.ts

```ts
import * as pathToRegexp from 'path-to-regexp';

const methodBuilder = (name) => function (url, handle) {
    let keys = []
    this.methods[name].push({
        url: pathToRegexp(url, keys),
        keys,
        handle
    })
}

// method url
class Router {
    methods = {
        get: [],
        delete: [],
        option : [],
        put: [],
        post: []
    } 

    get = methodBuilder('get')
    post = methodBuilder('post')
    put = methodBuilder('put')
    option = methodBuilder('option')
    delete = methodBuilder('delete')

    handleParams(req, res){
      const methods =  this.methods[(req.method as string).toLocaleLowerCase()];
      for(let method of methods){
        const {
            url,
            keys,
            handle
        } = method;
        const params = url.exec(req.url)
        if(params){
            req.params = keys.reduce((prev, current, index, array) => {
                prev[current.name] = params[index + 1] ? params[index + 1] : undefined;
                return prev;
            }, {});
            (async() => {
               await handle(req, res)
            })()
            break;
        }
      }
    }

}

export default Router;
```

index.ts

```
import Router from './router';

const router: any = new Router();

router.get('/', (req, res) => {
	res.end('home')
})

router.get('/day/haha', (req, res) => {
    console.log(req.params)
    res.end("haha")
})

router.get('/day/:count', async (req, res) => {
    console.log(req.params)
    res.end("day")
})

const server = http.createServer((req, res) => {
    router.handleParams(req, res)
})

server.listen(3000)
```


## 数据库

```bash
npm i lokijs
```

database/index.ts

```ts
import * as loki from 'lokijs';

const db = new loki('db.json')

const posts = db.addCollection('posts');

var resultObj = posts.insert({
    username: "yugo",
    title: 'day by day',
    body: 'awesome day!'
});

export {
    db,
    posts
}
```

index.ts

```ts
import { posts } from './database/index';

router.get('/posts/:username', async (req, res) => {
    const postsList = posts.find({ 'username': { '$eq': req.params.username } })

    const p = Promise.resolve(postsList)
    res.end(JSON.stringify(await p))
});
```

## 视图

```
npm i pug
npm i @types/pug -D
```

view.ts

```ts
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
```

index.ts

```ts
import { installViewEngine } from './view'

router.get('/', (req, res) => {
	res.render('/home.pug', {
		hello : 'world'
	})
})

const server = http.createServer((req, res) => {
	installViewEngine(res);
    router.handleParams(req, res)
})

```


views/home.pug

```pug
<!DOCTYPE html>
html(lang="en")
head
	meta(charset="UTF-8")
	title Document
body
	=hello

```


## not fond

```bash
npm i finalhandler
```

```ts
import * as finalhandler from 'finalhandler';

const server = http.createServer((req, res) => {
    res['done'] = finalhandler(req, res)
	installViewEngine(res);
    router.handleParams(req, res)
    res['done']();
})
```

```
const server = http.createServer((req, res: http.ServerResponse & { done: Function }) => {
    res.done = finalhandler(req, res)
	installViewEngine(res);
    router.handleParams(req, res)
    res.done();
})
```


## 解析 post 文本

```js
npm i raw-body
```

views/home.pug

```
<!DOCTYPE html>
html(lang="en")
head
	meta(charset="UTF-8")
	title Document
body
	=hello

	form(action='post', method='post')
		input(name='username')
		button(type='submit') 提交
```

```ts
import * as getRawBody from 'raw-body';
import * as querystring from 'querystring'

router.post('/post', async(req, res) => {
    res.end(JSON.stringify(req.text))
})

const server = http.createServer((req: any, res: http.ServerResponse & { done: Function }) => {
    res.done = finalhandler(req, res)
    getRawBody(req, {
       length: req.headers['content-length'],
       limit: '1mb'
    }, (err, string) => {
       if (err) return res.done(err)
       req.text = querystring.parse(string.toString())
       installViewEngine(res);
       (async () => {
           await router.handleParams(req, res)
           res.done();
       })()
    })

})
```

## 添加浏览器不支持的请求

home.pug

```pug
<!DOCTYPE html>
html(lang="en")
head
	meta(charset="UTF-8")
	title Document
body
	=hello

	form(action='post', method='post')
		input(name='username')
		input(name='_method', type='hidden', value='delete')
		button(type='submit') 提交

```


```
router['delete']('/post', async(req, res) => {
    res.end('delete')
})
```

router.ts

```ts
    async handleParams(req, res){

      let methods =  this.methods[(req.method as string).toLocaleLowerCase()];

      if ('_method' in req.text) {
           methods =  this.methods[(req.text['_method'] as string).toLocaleLowerCase()];
      }

      for(let method of methods){
        const {
            url,
            keys,
            handle
        } = method;
        const params = url.exec(req.url)
        if(params){
            req.params = keys.reduce((prev, current, index, array) => {
                prev[current.name] = params[index + 1] ? params[index + 1] : undefined;
                return prev;
            }, {});
            await handle(req, res)
            break;
        }
      }
    }
```