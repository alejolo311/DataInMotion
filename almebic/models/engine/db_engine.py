#!/usr/bin/python3
"""
Controls the ORM transactions using postgres db
"""

from models.base import BaseNode, Base
from models.user import User
from models.board import Board
from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker


class DBEngine:
    __engine = None
    __session = None

    def __init__(self):
        """
        Creates the engine object using environment variables
        """
        user = 'data_im_dev'
        password = 'dim_passwd'
        host = '172.21.0.2'
        db = 'data_im_dev_db'
        self.__engine = create_engine('postgres://{}:{}@{}:5432/{}'.format(
            user, password, host, db
        ))

    def reload(self):
        """
        Creates the Models based on metadata
        """
        try:
            Base.metadata.create_all(self.__engine)
            sess_factory = sessionmaker(bind=self.__engine,
                                        expire_on_commit=False)
            Session = scoped_session(sess_factory)
            self.__session = Session
        except Exception as e:
            print(e)

    def all(self, cls=None):
        """
        Returns all record, or all by class
        """
        newdict = {}
        objs = self.__session.query(cls).all()
        for obj in objs:
            key = obj.__class__.__name__ + '.' + obj.id
            newdict[key] = obj
        return (newdict)

    def new(self, obj):
        """
        Creates a new object
        """
        self.__session.add(obj)

    def save(self):
        """
        Saves changes in session
        """
        self.__session.commit()

    def close(self):
        """
        Remove the private session
        """
        self.__session.remove()

    def get(self, cls, id):
        """
        Resturn a record by class and id
        """
        objs = self.all(cls)
        for obj in objs.values():
            if obj.id == id:
                return obj
        return None

    def delete(self, obj):
        """
        Deletes a record
        """
        self.__session.delete(obj)
