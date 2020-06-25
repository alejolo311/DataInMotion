#!/usr/bin/python3
"""
Base model for the ORM
"""

import models
from sqlalchemy import Column, String
from sqlalchemy.ext.declarative import declarative_base
import uuid
import json


Base = declarative_base()


class BaseNode:
    """
    This model contains basic attributes to firerenciate the
    customized created nodes, to determine their actions and scope
    """
    id = Column(String(64), primary_key=True)
    type = Column(String(10), default='custom')

    def __init__(self):
        """
        Initializes a new model
        """
        self.id = str(uuid.uuid4())

    def __str__(self):
        return '<node>(' + self.type + ')[id=' + self.id + ']'

    def save(self):
        """
        Saves the model
        """
        models.storage.new(self)
        models.storage.save()

    def to_dict(self):
        """
        Returns the dict representation
        [{"cond": "<"}, {"value2": "150"}]
        """
        dic = self.__dict__.copy()
        if '_sa_instance_state' in dic:
            del dic['_sa_instance_state']
        if 'analisis_params' in dic:
            try:
                dic['analisis_params'] = json.loads(dic['analisis_params'])
            except Exception:
                pass
        if 'data' in dic:
            dic['data'] = json.loads(dic['data'])
        if 'innodes' in dic:
            dic['innodes'] = json.loads(dic['innodes'])
        if 'outnodes' in dic:
            dic['outnodes'] = json.loads(dic['outnodes'])
        if 'headers' in dic:
            dic['headers'] = json.loads(dic['headers'])
        if 'nodes' in dic:
            dic['nodes'] = json.loads(dic['nodes'])
        return json.dumps(dic, indent=2, sort_keys=True)
