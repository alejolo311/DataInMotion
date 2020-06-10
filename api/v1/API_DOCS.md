## Data in Motion API/v1

### This API handles, the User, Board and CustomNode CRUD

### [index](nodes/index.py)

#### Routes:

- GET api/v1/status
to check if API server is Up
Return: status = OK 

### [users](nodes/users.py)

- GET api/v1/users
to get all users
Return: list of users

- GET api/v1/users/<user_id>/boards
To get the boards created by an User
Return: list of boards


