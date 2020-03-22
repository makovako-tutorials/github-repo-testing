exports.handler = async function(event, context, callback) {
  const { authorization } = event.headers;
  if (authorization === process.env.EVENT_API_KEY) {
    const fetch = require("node-fetch");
    const cheerio = require("cheerio");
    const uuid = require("uuid");
    const AWS = require("aws-sdk");

    const {
      CST_AWS_REGION,
      CST_AWS_ACCESS_KEY_ID,
      CST_AWS_SECRET_ACCESS_KEY,
      CST_AWS_DYNAMODB_TABLE_NAME
    } = process.env;

    AWS.config.update({
      region: CST_AWS_REGION,
      credentials: new AWS.Credentials({
        accessKeyId: CST_AWS_ACCESS_KEY_ID,
        secretAccessKey: CST_AWS_SECRET_ACCESS_KEY
      })
    });
    const dynamodb = new AWS.DynamoDB();
    const github_response = await fetch(
      "https://api.github.com/repos/makovako-tutorials/repo-db-test/contents/db.json"
    );
    console.log(`Github response: ${github_response}`);
    const github_data = await github_response.json();
    console.log(`Github data: ${github_data.content}`);
    const github_content = JSON.parse(
      Buffer.from(github_data.content, "base64").toString()
    );
    const ids = github_content.map(item => item.id);
    let db = [];
    const x = await Promise.all(
      ids.map(async id => {
        const url = create_url(id);
        const alza_response = await fetch(url);
        const alza_data = await alza_response.text();
        const $ = cheerio.load(alza_data);
        const strCurrentPrice = $(".bigPrice", "table#prices").text();
        const strOriginalPrice = $(".crossPrice", "table#prices").text();
        const originalPrice = parse_price(strOriginalPrice);
        const currentPrice = parse_price(strCurrentPrice);
        const date = Date.now();
        const currentDate = new Date(date).toISOString();

        await dynamodb
          .putItem({
            TableName: CST_AWS_DYNAMODB_TABLE_NAME,
            Item: {
              id: { S: uuid.v4() },
              alzaId: { S: id },
              originalPrice: { N: originalPrice },
              currentPrice: { N: originalPrice },
              date: { S: date },
              currentDate: { S: currentDate }
            }
          })
          .promise();

        const payload = {
          id,
          originalPrice,
          currentPrice,
          date,
          currentDate
        };
        db.push(payload);
      })
    );
    let response = {
      statusCode: 200,
      headers: {
        "Content-type": "application/json"
      },
      body: JSON.stringify({
        payload: db
      })
    };
    return response;
  } else {
    let response = {
      statusCode: 401,
      headers: {
        "Content-type": "application/json"
      },
      body: JSON.stringify({
        msg: "Wrong authorization"
      })
    };
    return response;
  }
};

const create_url = id => {
  return `https://www.alza.sk/${id}.htm`;
};

const parse_price = price => {
  return parseFloat(price.slice(0, -2).replace(",", "."));
};
