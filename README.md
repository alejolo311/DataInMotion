# DataInMotion

  

[![Build Status](https://travis-ci.com/alejolo311/DataInMotion.svg?branch=master)](https://travis-ci.com/alejolo311/DataInMotion)

  

## Requirements

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

  

[revision 1](https://docs.google.com/document/d/1s13NnGAXOVwmD-erY1Dy5OWhkGxuqloVx7OwlUKXeqY/edit#https://docs.google.com/document/d/1rcGtsBb7fb3BwmHuWrGGRu4bPG1egeiZwHPql2Q8Qh4)

[revision 2](https://docs.google.com/document/d/1rcGtsBb7fb3BwmHuWrGGRu4bPG1egeiZwHPql2Q8Qh4)

  
  

## The model Custom Nodes

  

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