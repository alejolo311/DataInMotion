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
        self.id = uuid.uuid4()

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
        """
        return self.__dict__.copy()
