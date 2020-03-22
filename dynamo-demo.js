const AWS = require("aws-sdk");
const uuid = require("uuid");

require("dotenv").config();

AWS.config.update({
  region: "eu-central-1"
});

const dynamodb = new AWS.DynamoDB();

let params = {};

dynamodb.listTables(params, function(err, data) {
  if (err) console.log(err, err.stack);
  // an error occurred
  else console.log(data); // successful response
  /*
    data = {
     TableNames: [
        "Forum", 
        "ProductCatalog", 
        "Reply", 
        "Thread"
     ]
    }
    */
});

params = {
  Item: {
    id: { S: uuid.v4() },
    title: { S: "lele" },
    description: { S: "llili" }
  },
  ReturnConsumedCapacity: "TOTAL",
  TableName: "alza-prices-test"
};
if (false) {
  dynamodb.putItem(params, function(err, data) {
    if (err) console.log(err, err.stack);
    // an error occurred
    else console.log(data); // successful response
    /*
         data = {
          ConsumedCapacity: {
           CapacityUnits: 1, 
           TableName: "Music"
          }
         }
         */
  });
}

params = {
  TableName: "alza-prices-test"
};

dynamodb.scan(params, (err, data) => {
  if (err) console.error(err);
  else
    data.Items.map(item =>
      console.log(
        `ID: ${item.id.S}, Title: ${item.title.S}, Desc.: ${item.description.S}`
      )
    );
});

params = {
  Key: {
    id: { S: "9c8266a1-7430-4819-a80b-a02dca24fab1" }
  },
  TableName: "alza-prices-test"
};

dynamodb.getItem(params, (err, data) => {
  if (err) console.error(err);
  else
    console.log(
      `ID: ${data.Item.id.S}, Title: ${data.Item.title.S}, Desc.: ${data.Item.description.S}`
    );
});

const fn = async () => {
  const stuff = await dynamodb.getItem(params).promise();
  console.log(`stuff: ${stuff.Item.id.S}`)
};

fn();
