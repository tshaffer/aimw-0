const axios = require("axios");
require("dotenv").config();

function getMealWheelUsers(location) {
  console.log(`Called getMealWheelUsers`);
  console.log(location);

  return JSON.stringify({
    users: ["jorgan", "crapshack"],
  });
}

async function run_conversation() {

  const baseURL = "https://api.openai.com/v1/chat/completions";
  const headers = {
    "Content-Type": "application/json",
    Authorization: "Bearer " + process.env.OPENAI_API_KEY,
  };

  let data = {
    messages: [
      {
        role: "user",
        content:
          "What is the list of all mealWheel users in Boston",
      },
    ],
    model: "gpt-3.5-turbo-0613",
    functions: [
      {
        name: "getMealWheelUsers",
        description: "List all mealWheel users in a given location",
        parameters: {
          type: "object",
          properties: {
            location: {
              type: "string",
              description: "The city, e.g. Boston",
            },
          },
          required: ["location"],
        },
      },
    ],
    function_call: "auto",
  };

  try {
    let response = await axios.post(baseURL, data, { headers });
    response = response.data;
    console.log('Response: ');
    console.log(response);

    let message = response.choices[0].message;
    const function_name = message.function_call.name;
    console.log('function_name from OpenAI: ', function_name);

    let args = JSON.parse(message.function_call.arguments);
    console.log('args');
    console.log(args);

    function_response = getMealWheelUsers(
      args.location,
    );

    console.log(function_response);

    return 'ok';
    
  } catch (error) {
    console.error("Error:", error);
  }
}

run_conversation()
  .then((response) => {
    console.log('final response');
    console.log(response);
    // console.log('final message content');
    // console.log(response.choices[0].message.content);
  })
  .catch((error) => {
    console.error("Error:", error);
  });
