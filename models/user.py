#!/usr/bin/python3
"""
Defines a User node model
"""

import models
from models.base import BaseNode, Base
from models.custom import CustomNode
from models.board import Board
from sqlalchemy import Column, String, Boolean, DateTime
from sqlalchemy.orm import relationship


class User(BaseNode, Base):
    """
    This model stores the needed data for the triggers
    """
    __tablename__ = 'users'
    email = Column(String(64), default='')
    password = Column(String(64), default='')
    name = Column(String(64), default='')
    # nodes = relationship('CustomNode', backref='user')
    # boards = relationship('Board', backref='user')
    confirmed = Column(Boolean, nullable=True, default=False)
    confirmed_on = Column(String(64), nullable=True)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    @property
    def boards(self):
        """
        Return the list of boards attached to this user
        """
        boards = models.storage.filter_by(Board, 'user_id', self.id)
        return boards