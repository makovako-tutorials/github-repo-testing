const { Octokit } = require('@octokit/rest')

exports.handler = async function(event, context, callback) {
    const {authorization} = event.headers
    if (authorization === process.env.EVENT_API_KEY) {
        const fetch = require('node-fetch')
        const cheerio = require('cheerio')

        const octokit = new Octokit({
            auth: process.env.GITHUB_API_KEY
        })

        const items_data = await octokit.repos.getContents({
            owner: 'makovako-tutorials',
            repo: 'repo-db-test',
            path: '/items.json'
        });
        const items = JSON.parse(Buffer.from(items_data.data.content,'base64').toString())
        const ids = items.map(item => item.id)

        const data = await octokit.repos.getContents({
            owner: 'makovako-tutorials',
            repo: 'repo-db-test',
            path:'/db.json'
        })
        
        let db = JSON.parse(Buffer.from(data.data.content, 'base64').toString())
        const sha = data.data.sha

        let response_db = []
        const x = await Promise.all(ids.map(async id => {
            const url = create_url(id)
            const alza_response = await fetch(url)
            const alza_data = await alza_response.text()

            const $ = cheerio.load(alza_data)
            const strCurrentPrice = $('.bigPrice','table#prices').text()
            const strOriginalPrice = $('.crossPrice','table#prices').text()
            console.log(`strCurrentPrice ${strCurrentPrice}, strOriginalPrice: ${strOriginalPrice}`);
            
            const originalPrice = parse_price(strOriginalPrice)
                
            const currentPrice = parse_price(
                strCurrentPrice
            )
            console.log(`currentprice: ${currentPrice}, originalprice: ${originalPrice}`);
            
            
            const date = Date.now()
            const currentDate = new Date(date).toISOString()

            const payload = {
                id,
                originalPrice,
                currentPrice,
                date,
                currentDate
            }
            db.push(payload)
            response_db.push(payload)

        }))
        // console.log(`x: ${x}`);
        // console.log(`response_db: ${response_db}`)
        

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
        let response = {
            statusCode: 200,
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify({
                payload: response_db,
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

const create_url = (id) => {
        return `https://www.alza.sk/${id}.htm`
}

const parse_price = (price) => {
    return parseFloat(price.slice(0,-2).replace(',','.'))
}