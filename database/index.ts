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