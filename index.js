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
          "What is the list of all mealWheel users?",
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
          },
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

    /*
        response_message = response["choices"][0]["message"]

        function_response = fuction_to_call(
            location=function_args.get("location"),
            unit=function_args.get("unit"),
        )

        # Step 4: send the info on the function call and function response to GPT
        messages.append(response_message)  # extend conversation with assistant's reply
        messages.append(
            {
                "role": "function",
                "name": function_name,
                "content": function_response,
            }
        )  # extend conversation with function response
        second_response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo-0613",
            messages=messages,
        )     */
    function_response = await getMealWheelUsers();

    console.log(function_response);

    data.messages.push(message);

    data.messages.push({
      role: "function",
      name: function_name,
      content: function_response,
    });

    console.log('Make openAI call post getMealWheelUsers');
    // let keys = Object.keys(data);
    // console.log(keys);
    // console.log(data.messages);
    // console.log(data.model);
    // console.log(data.functions);
    // console.log(data.function_call);

    data.function_call = 'none';

    response = await axios.post(baseURL, data, { headers });
    response = response.data;
    console.log('return from request to OpenAI');
    console.log(response);
    console.log(response.data);


    // Makes the final API request after the conversation is finished.
    // console.log('Make final api request');
    // keys = Object.keys(data);
    // console.log(keys);
    // console.log(data.messages);
    // console.log(data.model);
    // console.log(data.functions);
    // console.log(data.function_call);
    // response = await axios.post(baseURL, data, { headers });
    // response = response.data;
    // console.log('response data');
    // console.log(response);

    return response;

  } catch (error) {
    console.error("Error:", error);
  }
}

run_conversation()
  .then((response) => {
    console.log('final response');
    console.log(response);
    console.log(response.choices[0].message.content);
  })
  .catch((error) => {
    console.error("Error:", error);
  });
