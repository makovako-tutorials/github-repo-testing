const { Octokit } = require('@octokit/rest')

exports.handler = async function(event, context, callback) {
    const {authorization} = event.headers
    if (authorization === process.env.EVENT_API_KEY) {
        const octokit = new Octokit({
            auth: process.env.GITHUB_API_KEY
        })
        const data = await octokit.repos.getContents({
            owner: 'makovako-tutorials',
            repo: 'repo-db-test',
            path:'/db.json'
        })
        
        let db = JSON.parse(Buffer.from(data.data.content, 'base64').toString())
        const sha = data.data.sha
        const randomNumber = Math.floor(Math.random()*100)
        const currentDate = new Date().toISOString()
        const payload = {
            currentDate,
            randomNumber
        }
        db.push(payload)
        const contents = Buffer.from(JSON.stringify(db)).toString('base64')
        const resp = await octokit.repos.createOrUpdateFile({
            owner: 'makovako-tutorials',
            repo: 'repo-db-test',
            path: 'db.json',
            message: `Updated at ${currentDate}`,
            content: contents,
            committer: {
                name: 'Test bot app',
                email: 'test@test.test'
            },
            sha
        })
        let response = {
            statusCode: 200,
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify({
                payload,
                status: resp.status,
                message: resp.data.commit.message

            })
        }
        return response
    } else {
        let response = {
            statusCode: 401,
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify({
                msg: "Wrong authorization"
            })
        }
        return response
    }

    
    
    callback(null, {
    statusCode: 200,
    body: {
        status: resp.status,
        message: resp.data.commit.message
    }
    });
}