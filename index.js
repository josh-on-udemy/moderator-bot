const Snoostorm = require('snoostorm');
const Snoowrap = require('snoowrap');
const PropertiesReader = require('properties-reader');

const properties = new PropertiesReader('./env.properties');

const r = new Snoowrap({
    userAgent: properties.get('userAgent'),
    clientId: properties.get('clientId'),
    clientSecret: properties.get('clientSecret'),
    username: properties.get('username'),
    password: properties.get('password')
});

const comments = new Snoostorm.CommentStream(r, {
    subreddit: properties.get('targetSubreddit'),
    limit: 10,
    pollTime: 2000
});

const badWords = properties.get('badWords').split(',');

comments.on('item', (comment) => {
    var commentWords = comment.body.split(' ');
    // this is a test comment body
    // ['this', 'is', 'a', 'test', 'comment', 'body']
    if(badWords.some(item => commentWords.includes(item))) {
        comment.remove({spam: true});
    }
})

const submissions = new Snoostorm.SubmissionStream(r, {
    subreddit: properties.get('targetSubreddit'),
    limit: 10,
    pollTime: 2000
});

submissions.on("item", (post) => {
    var titleWords = post.title.split(' ');
    if(badWords.some(item => titleWords.includes(item))) {
        post.remove({spam: true});
    }
});