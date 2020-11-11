#!/usr/bin/python3
"""
Defines a EduBoard model
"""

from models.base import BaseNode, Base
import models
import traceback
from models.course import Course
from datetime import datetime
from models.custom import CustomNode
from models.node_flow_test import instancedNode
from models.logger import Logger
from sqlalchemy import Column, String, ForeignKey, Integer
from sqlalchemy.orm import relationship
import json
import uuid
import os


class EduBoard(BaseNode, Base):
    """
    Defines an Educational board object
    - a name.
    - a list of nodes and their positions.
    - a user_id attached
    - a progress rate
    - a course linked
    """
    __tablename__ = 'edu_boards'
    name = Column(String(64), nullable=True)
    user_id = Column(String(60), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    users = Column(String(8000), nullable=True)
    service = Column(String(64), nullable=True)
    # this progress is measured each time you run the test
    progress = Column(Integer, nullable=True, default=0)
    course = Column(String(64), nullable=True)

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

    def test_board(self):
        """
        Test the board and delivery the results
        """
        service_node = models.storage.get(CustomNode, self.service)
        nodes, starter = self.create_node_instances(self.id, service_node.id)
        result= self.run_edu(nodes, starter)
        score = self.check_answer(result.logger)
        return {
            'score': score
        }

    def check_answer(self, logger):
        """
        Get the answer file and checked
        against the resulting logger
        """
        course = models.storage.get(Course, self.course)
        answer = json.loads(course.answer)
        print(json.dumps(answer, indent=2))
        return 0

    # INTANCE MANAGER #
    # to run intanced nodes

    def create_node_instances(self, board_id, node_id):
        """
        Create JSON instances for the board and their links
        and return the id for the caller node
        """
        board = models.storage.get(EduBoard, board_id)
        nodes = {}
        nods = json.loads(board.nodes)
        instance_id = str(uuid.uuid4())
        for key in nods.keys():
            js = json.loads(models.storage.get(CustomNode, key).to_dict())
            nodes[key] = instancedNode(js, instance_id)
        return nodes, nodes[node_id]


    def run_edu(self, nodes, starter):
        """
        Test for running instanced nodes
        """
        try:
            logger = Logger(starter.id)
            time = datetime.now()
            test_file = {
                'status': 'started',
                'node_name': starter.name,
                'node_id': starter.id,
                'instance': starter.instance_id,
                'messages': [],
                'date': [time.year, time.month, time.day, time.hour, time.minute, time.second, time.microsecond]
                }
            with open('/usr/src/app/api/running/{}.test'.format(starter.instance_id), 'w') as test:
                test.write(json.dumps(test_file))
            resp = starter.run_node_task(({}, {}), logger, starter.id, nodes)
            with open('/usr/src/app/api/running/{}.test'.format(starter.instance_id), 'r') as test:
                test_file = json.loads(test.read())
            test_file['logger'] = dict(logger.json())
            test_file['status'] = 'completed'
            test_file['node_id'] = starter.id
            test_file['node_name'] = starter.name,
            os.remove('/usr/src/app/api/running/{}.test'.format(starter.instance_id))
            return test_file
        except Exception as e:
            traceback.print_exc()
            time = datetime.now()
            test_file = {
                'status': 'failed',
                'node_name': starter.name,
                'node_id': starter.instance_id,
                'instance': starter.instance_id,
                'logger': dict(logger.json()),
                'messages': ['failed'],
                'date': [time.year, time.month, time.day, time.hour, time.minute, time.second, time.microsecond]
                }
            os.remove('/usr/src/app/api/running/{}.test'.format(starter.instance_id))
            return test_file
