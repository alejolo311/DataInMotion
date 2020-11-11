#!/usr/bin/python3
"""
Defines a EduSchool model
"""

from models.base import BaseNode, Base
from models.user import User
import models
import traceback
from datetime import datetime
from models.custom import CustomNode
from models.node_flow_test import instancedNode
from models.user import User
from models.logger import Logger
from sqlalchemy import Column, String, ForeignKey, Integer
from sqlalchemy.orm import relationship
import json
import uuid
import os


class EduSchool(BaseNode, Base):
    """
    Defines an School, contains an EduModels list board object
    """
    __tablename__ = 'edu_schools'
    name = Column(String(64), nullable=True)
    description = Column(String(300), nullable=True)
    admin = Column(String(60), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    users = Column(String(8000), nullable=True, default='[]')


    @property
    def get_users(self):
        """
        Return a list of users
        """
        uss = []
        if self.users and len(self.users) > 0:
            uss = json.loads(self.users)
        return uss

    def set_users(self, us_list):
        """
        Set the user list
        """
        self.users = json.dumps(us_list)
        self.save()
