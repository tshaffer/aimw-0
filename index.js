const axios = require("axios");
require("dotenv").config();

function getMealWheelUsers() {
  console.log(`Called getMealWheelUsers`);

  const serverUrl = 'https://tsmealwheel.herokuapp.com';
  const apiUrlFragment = '/api/v1/';
  const path = serverUrl + apiUrlFragment + 'users';

  const userNames = [];
  return axios.get(path)
    .then((usersResponse) => {
      const users = usersResponse.data;
      for (const user of users) {
        console.log('userName:', user.userName)
        userNames.push(user.userName);
      }

      return JSON.stringify({
        user: userNames
      });
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
          "What is the list of all mealWheel users in Boston?",
      },
    ],
    model: "gpt-3.5-turbo-0613",
    functions: [
      {
        name: "getMealWheelUsers",
        description: "List all mealWheel users",
        parameters: {
          type: "object",
          properties: {
            location: {
              type: "string",
              description: "The city, e.g. Boston",
            },
          },
          // required: ["location"],
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

    function_response = await getMealWheelUsers();

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
  })
  .catch((error) => {
    console.error("Error:", error);
  });
