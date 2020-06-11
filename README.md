# DataInMotion

[![Build Status](https://travis-ci.com/alejolo311/DataInMotion.svg?branch=master)](https://travis-ci.com/alejolo311/DataInMotion)

## Environment
- Ubuntu 18.04
- Python 3.6 or higher
- SqlAlqchemy
- Flask
- Postgresql

To install all dependencies

```
./install
```

To configure postgres dev user

```
cat setup_postgres_dev.sql | sudo -H -u postgres bash -c 'psql'
```
### To export a DUMP_FILE

```
sudo -H -u postgres bash -c 'pg_dump data_im_dev_db' > <DUMP_FILE>.psql
```
### To import a DUMP_FILE

```
cat <DUMP_FILE>.psql | sudo -H -u postgres bash -c 'psql'
```

### Open de DataInMotion console

```
./console.py
```

### Running the API

```
python3 -m api.v1.app
```

### Running the WebServer

```
python3 -m dim_dynamic.nodes
```


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
