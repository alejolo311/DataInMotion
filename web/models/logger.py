#!/usr/bin/python3
"""
Logger Object to return data in a pretty format
"""


import json


class Logger:
    """
    Initilizes linked to the user ID
    store each call to print in a pretty format
    <node-name>: Content
    and returns in __str__ all the content
    """
    def __init__(self, user_id):
        """
        initializes a logger attached to a User
        """
        self.user_id = user_id
        self.json_log = {}

    def json(self):
        """
        return the json log
        """
        return self.json_log

    def log(self, node_name, content):
        """
        add a new line to to file attached to the user
        """
        with open(self.user_id + '.log', 'a+') as logfile:
            logfile.write('{:<14}:   '.format(node_name) + content + '\n')

    def __str__(self):
        """
        return the content from the log file attached to the user
        """
        with open(self.user_id + '.log', 'r') as logfile:
            return logfile.read()

    def reset(self):
        """
        reset the text log content
        """
        with open(self.user_id + '.log', 'w') as logfile:
            logfile.write('')