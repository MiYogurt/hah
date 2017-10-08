import * as http from "http";
import Router from './router';
import { posts } from './database/index';
import { installViewEngine } from './view'
import * as finalhandler from 'finalhandler';
import * as getRawBody from 'raw-body';
import * as querystring from 'querystring'
/*
解析路由 -> 调用控制器 -> 拿到数据 -> 生成视图
*/

const router: any = new Router();

router.get('/', (req, res) => {
	res.render('/home.pug', {
		hello : 'world'
	})
})

router.get('/day/haha', (req, res) => {
    console.log(req.params)
    res.end("haha")
})

router.get('/day/:count', async (req, res) => {
    console.log(req.params)
    res.end("day")
})

router['delete']('/post', async(req, res) => {
    res.end('delete')
})

router.post('/post', async(req, res) => {
    res.write('post')
    res.end(JSON.stringify(req.text))
})



router.get('/posts/:username', async (req, res) => {
    const postsList = posts.find({ 'username': { '$eq': req.params.username } })

    const p = Promise.resolve(postsList)
    res.end(JSON.stringify(await p))
});

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

// process.on('unhandledRejection', console.log)

server.listen(3000)