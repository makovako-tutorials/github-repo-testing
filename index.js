const { Octokit } = require('@octokit/rest')
require('dotenv').config()

const ocktokit = new Octokit({
    auth: process.env.API_KEY
})

const fn = async () => {
    const root = await ocktokit.request("GET /")
    // let data = await ocktokit.repos.getReadme({
    //     owner: 'makovako-tutorials',
    //     repo: 'repo-db-test'
    // })
    data = await ocktokit.repos.getContents({
        owner: 'makovako-tutorials',
        repo: 'repo-db-test',
        path:'/db.json'
    })
    // console.log(root);
    // console.log(data);
    
    let db = JSON.parse(Buffer.from(data.data.content, 'base64').toString())
    const sha = data.data.sha
    // console.log(sha);
    
    console.log(db);
    db.push(Math.floor(Math.random()*100))
    const contents = Buffer.from(JSON.stringify(db)).toString('base64')
    console.log(contents);
    const resp = await ocktokit.repos.createOrUpdateFile({
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
    console.log(resp);
    
    
}

fn()