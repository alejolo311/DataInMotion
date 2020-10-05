#!/usr/bin/python3
"""
Defines a Board model
"""

from models.base import BaseNode, Base
from models.custom import CustomNode
from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.orm import relationship
import json


class Board(BaseNode, Base):
    """
    Defines a board object
    - a name.
    - a list of nodes and their positions.
    - a user_id attached
    """
    __tablename__ = 'boards'
    name = Column(String(64), nullable=True)
    nodes = Column(String(100000), default='{}')
    user_id = Column(String(60), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    users = Column(String(8000), nullable=True)

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
