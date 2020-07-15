### Data in Motion models

The main concept in the Doc will be the CustomNode model
this is the core of the tool
we need to modularize all this behavior in order to construct a microservice structure
and be capable of delivery a useful debug log to the users and help them in helpings us about improvement

### CustomNode

```
Table 'custom_nodes':
field           |     description
-----------------------------------------------------------------------------------------
user_id         : The owner of the node
name            : A custom name
work_type       : 'service': this node should execute run_node_task(({}, {}), logger <-- This is a new instance of logger or the inherited logger object)
api_url         : The Url used by the Request core
api_endpoint    : This value is not handled yet
string          : This value stores the format string needed to replace and return the 'content' key value
headers         : A json-string, that is serilized and deserialized throught the node_execution_flow containing a set of key-pair values needed to perform the request
innodes         : A json-string containing a list of node ids to be called in the Innode section
data            : A json-string containing a set of key-pair values needed to request, or to process some data
outnodes        : A json-string containing a list of node ids
analisis_mode: The mode to process the data, options: ['comparision', 'replace', 'JSON', 'HTML', 'get_updates', media_player', 'media_twitter']
analisis_params : a json-string containing a list of dicts that contains the parameters to measure o process the data
trigger         : This field is not defined yet
timeout         : Integer, not defined, should be implemented with the crontab script
inner_connections: String (len 2000) not defined yet
color           : default:'#9bfa18' an hex value to define the container node color
board_id        : The board that contains the node
```

## CustomNode Flow

prototype: run_node_task(self, caller_data, logger)
self: node instance
caller_data: tuple(last_node, collected)
logger: a Logger object created when the recursion entry point is called, generally by the API endpoint /api/v1/nodes/<node_id>/run

### 1. collect the innodes results

In this step the node will call all the innodes attached to it, and also will collect the retrieved data from the innodes responses data

### 2. make the request (optional)

This step depends on the 'work_type' variable, if work_type="request", the node will acomplish the next series of steps

##### a. check if the url should loaded from the data

if the 'api_url' is 'input' the function look in the data for the keys 'url' or 'content'
if 'url' is correct or 'content' contains 'http' the 'api_url' is setted to the data value 'url' or 'content'
After this check the function determines if the headers contain any oauth defined variable
if an auth is required the function generates a signature an the authorizarion keys required using the node data and headers

