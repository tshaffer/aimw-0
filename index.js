import { Configuration, OpenAIApi } from "openai";
import axios from 'axios';
import 'dotenv/config';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

function getPizzaList() {
  return JSON.stringify({
    pizzaList: ['sausage', 'pesto']
  });
}

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

  const messages = [
    {
      role: "user",
      content:
        // "What is the list of all mealWheel users?",
        // "What is the list of pizzas that Ted likes?",
        "Get the list of pizzas that Ted likes, then list all mealWheel users.",
    },
  ];

  const functions = [
    {
      name: "getMealWheelUsers",
      description: "List all mealWheel users",
      parameters: {
        type: "object",
        properties: {
        },
      },
    },
    {
      name: "getPizzaList",
      description: "List all types of pizza that I like",
      parameters: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "The name of the person asking for a list of pizzas",
          },
        },
        required: ["name"],
      }
    }
  ];

  console.log('invoke open ai.createChatCompletion');
  let response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo-0613",
    messages,
    functions,
    // "auto"
  });
  console.log('return from openai.createChatCompletion');

  console.log('response keys');
  console.log(Object.keys(response));

  let responseData = response.data;
  console.log('responseData keys');
  console.log(Object.keys(responseData));

  let response_message = responseData["choices"][0]["message"]
  console.log('response_message');
  console.log(response_message);

  let function_name = response_message["function_call"]["name"];
  console.log('function_name');
  console.log(function_name);

  let function_response = await getPizzaList();
  console.log('function_response');
  console.log(function_response);

  // messages.push(function_response);
  messages.push(
    {
      role: 'function',
      name: function_name,
      content: function_response,
    }
  );
  console.log('messages');
  console.log(messages);

  response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo-0613",
    messages,
    functions,
  });

  console.log('return from openai.createChatCompletion');

  console.log('response keys');
  console.log(Object.keys(response));

  responseData = response.data;
  console.log('responseData keys');
  console.log(Object.keys(responseData));

  response_message = responseData["choices"][0]["message"]
  console.log('response_message');
  console.log(response_message);

  function_name = response_message["function_call"]["name"];
  console.log('function_name');
  console.log(function_name);

  function_response = await getMealWheelUsers();
  console.log('function_response');
  console.log(function_response);

  messages.push(
    {
      role: 'function',
      name: function_name,
      content: function_response,
    }
  );
  console.log('messages');
  console.log(messages);

    response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo-0613",
    messages,
    functions,
  });

  console.log('return from openai.createChatCompletion');

  console.log('response keys');
  console.log(Object.keys(response));

    responseData = response.data;
  console.log('responseData keys');
  console.log(Object.keys(responseData));

  response_message = responseData["choices"][0]["message"]
  console.log('response_message');
  console.log(response_message);

  return response_message;

}

run_conversation()
  .then((response_message) => {
    console.log('natural language final response');
    console.log(response_message.content);
  })
  .catch((error) => {
    console.log('Failblog');
    console.log(Object.keys(error));
    // console.error("Error:", error);
  });
