const { Octokit } = require('@octokit/rest')

exports.handler = async function(event, context, callback) {
    const octokit = new Octokit({
        auth: process.env.API_KEY
    })
    const data = await octokit.repos.getContents({
        owner: 'makovako-tutorials',
        repo: 'repo-db-test',
        path:'/db.json'
    })
    console.log('Hello');
    
    let db = JSON.parse(Buffer.from(data.data.content, 'base64').toString())
    const sha = data.data.sha
    db.push(Math.floor(Math.random()*100))
    const contents = Buffer.from(JSON.stringify(db)).toString('base64')
    const resp = await octokit.repos.createOrUpdateFile({
        owner: 'makovako-tutorials',
        repo: 'repo-db-test',
        path: 'db.json',
        message: `Updated at ${new Date().toISOString()}`,
        content: contents,
        committer: {
            name: 'Test bot app',
            email: 'test@test.test'
        },
        sha
    })
    callback(null, {
    statusCode: 200,
    body: {
        status: resp.status,
        message: resp.data.commit.message
    }
    });
}