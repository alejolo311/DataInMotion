# DataInMotion
[Demo](http://159.65.38.228/user/728fb2db-4510-43f7-97ea-53ec6df9cfa7/boards)
[landing page](http://159.65.38.228/)

A visual programming based tool, focused on social engagement through Data changes in realtime
You will create your solution by assembling a distributed net of inputs and outputs of processed data

[![Build Status](https://travis-ci.com/alejolo311/DataInMotion.svg?branch=master)](https://travis-ci.com/alejolo311/DataInMotion)


## Installation and Requirements

- Docker

- Docker-compose



### Run the project in dev mode using docker

```

$ sudo docker-compose up --build -d

```

When you run the project in dev mode de Web is running in port 5000 and de api in port 8080

  

### Run the project in production mode using docker

```

$ sudo docker-compose -f docker-compose.prod.yml up --build -d

```

When you run the project in production mode de Web is running in port 80 usign nginx and de api in port 8080

  

## Project docs

  
First week revision [revision 1](https://docs.google.com/document/d/1s13NnGAXOVwmD-erY1Dy5OWhkGxuqloVx7OwlUKXeqY/edit#https://docs.google.com/document/d/1rcGtsBb7fb3BwmHuWrGGRu4bPG1egeiZwHPql2Q8Qh4)

Second week revision [revision 2](https://docs.google.com/document/d/1rcGtsBb7fb3BwmHuWrGGRu4bPG1egeiZwHPql2Q8Qh4)

Third week revision [revision 3]()

## Usage

You can check an info article about the newest features here [DataInMotion-v2.0](https://www.linkedin.com/pulse/data-motion-v20-daniel-rodriguez-castillo)

While running in dev mode open your [localhost](http://localhost/) and look at the "Try demo" button

You can start a board from scratch, copy existing nodes between your boards, an start working in developing your solution

## How it works

#### Create a new node

set a new Name

Choose if this node is a starting point this means the node will run the logic for its own connections

-- imagen de starting point

Select the type of task for the node

When you select Request, the node will fetch data from the URL source you set in the next field

Here you will provide an URL to fetch the data, notice that at the beggining you should put the method required for the request

When you have setted the URL you can provide a headers object required for the request

Now you can provide any data need for your task

This step is important take care of your selection

- Comparision
this mode will compare a value given by the "key" in the node input data, you can select between compare values
or detect substrings in the data

- Generate phrase
this mode is used to create a string by giving a template with the wildcards "{}" to identify and replace with a value in the input node data.
as an example:
	data = "The sun is raising"
	the template -> {data} and i feel alive
	the result content -> "The sun is raising and i feel alive"

- JSON
this mode allows you to extract a given key with a path at the node input data and return the value with your predefined key
as an example:

```
key = "Friend"
path = data/random/name
input_data = {
	data: [
		{
			name: Trudy
		}
	]
}
value = input_data[data][random][name] <-- Using the path
return {key: value} -> {'Friend': 'Trudy'}
# Notice that "random" takes any position on a list you can use this keyword while setting the analisis_params
```

- text or HTML
this mode will perform an HTML scrapping, but first the backend clean the html-content by removing uneccesary spaces and new lines, in this option you have to set three values
-- occurence:
		a pattern to match in the html-content
-- stop:
		the tool will store characters one by one until the "stop" pattern is matched
-- discard:
		when this option is checked the occurrence will be removed from the extracted values
		if is not checked the extracted value will contain the occurrecnce pattern

-- check updates
extracts the last record, this options finds if there is new records in the input data by checking the parameter counter stored in the node, to use this option set the value "count" to 0 or whatever value you need in the data section at the previous section

I/O attibutes

  

- innodes: list of other nodes ids the actual node will depend on the innodes to contruct its logic

  

- outnodes: list of subsequence of task nodes, the node start a request to another node and waits for a response, then return the resulted data to the caller node

  

Terms:

- connections: list of ids of the caller nodes, notes de difference with the innodes, the resulting data from this nodes will be returned to the actual caller connection, this term will be used for UX design purposes

  
  
  

# Team Members

### Alejandro Lopez:

Software Developer continuously working on problem-solving through creativity, critical thinking, and self-learning. Always adapting to new technologies driven through a passion for development.

The role of Alejandro in the project is to ideate and develop solutions for the backend analyzing external data sources.

### Daniel Rodriguez:

A Doer who likes to be involved in challenging projects, thinking, and creating out of the box solutions motivated by collaborative work.

The role of Daniel in the project is to create and develop trigger services that connect messages to distribution systems.

### Victor Hernandez:

A creative person converting ideas to reality, searching for new ways to use, and empower technology to the people.

The role of Victor in the project is to create the user flow, UX interactions, create infrastructure, deploy, and scale the solution.