import * as http from "http";
import Router from './router';
import { posts } from './database/index';
import { installViewEngine } from './view'

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

router.get('/posts/:username', async (req, res) => {
    const postsList = posts.find({ 'username': { '$eq': req.params.username } })

    const p = Promise.resolve(postsList)
    res.end(JSON.stringify(await p))
});

const server = http.createServer((req, res) => {
	installViewEngine(res);
    router.handleParams(req, res)
})

server.listen(3000)