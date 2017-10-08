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