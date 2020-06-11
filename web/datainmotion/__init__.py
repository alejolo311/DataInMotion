"""
Flask web server
"""

from flask import Flask
from flask_cors import CORS
from models import storage
from flask import render_template, Response
from models.custom import CustomNode
from models.board import Board
from models.user import User
import uuid
import json

# libertad y whiskey

app = Flask(__name__)
CORS(app)


@app.route('/user/<id>/boards', methods=['GET'], strict_slashes=False)
def main_board(id):
    """
    shows the main page to start creating a board
    """
    user = storage.get(User, id)
    print('User: ', id, '\n', user)
    if user is None:
        return Response({'error': 'User doesnt exists'}, status=404)
    user = json.loads(user.to_dict())
    return render_template('dashboard.html', id=str(uuid.uuid4()), user=user)


@app.route('/boards/<board_id>', methods=['GET'], strict_slashes=False)
def board(board_id):
    """
    return a view for the board
    """
    board = json.loads(storage.get(Board, board_id).to_dict())
    return render_template('board.html', id=str(uuid.uuid4()), board=board)


@app.route('/boards/<board_id>/nodes', methods=['GET'], strict_slashes=False)
def nodes(board_id):
    """
    return a list of nodes
    by now it returns all the created nodes, it need to filter by board id
    """
    # read the board file
    nodes = []
    boar = json.loads(storage.get(Board, board_id).to_dict())
    for key in boar['nodes']:
        node = storage.get(CustomNode, key)
        nodes.append(node)
    print('clossing , Boards.', board_id)
    # THIS BEHAVIOR SHOULD BE REMOVED FOR SECURITY REASONS
    # IT JUST VALID FOR DEVELOPING PURPOSE
    parsed = []
    for node in nodes:
        nd = json.loads(node.to_dict())
        nd['connections'] = []
        for n in nodes:
            for inp in json.loads(n.innodes):
                if inp == node.id:
                    nd['connections'].append((inp, 'in'))
            for inp in json.loads(n.outnodes):
                if inp == node.id:
                    nd['connections'].append((inp, 'out'))
        parsed.append(nd)
    cols = ['#9dff00', '#7dcc00', '#6db200', '#5e9900',
            '#3e6600', '#a6ff19', '#baff4c', '#b07fff']
    cols.extend(['#fff200', '#e5d900', '#ccc100', '#b2a900',
                 '#999100', '#fff766', '#fffbb2', '#00fff2'])
    cols.extend(['#ff5724', '#ff784f', '#ff8965', '#ff9a7b',
                 '#ffbba7', '#ff4f7e', '#ffe4db', '#4fff78'])
    cols.extend(['#69c5fa', '#5eb1e1', '#549dc8', '#4989af',
                 '#3f7696', '#96d6fb', '#c3e7fd', '	#fa9e69'])
    template = render_template('node.html', nodes=parsed,
                               id=str(uuid.uuid4()), colors=cols)
    return template


@app.route('/nodes/<node_id>', methods=['GET'], strict_slashes=False)
def get_node(node_id):
    """
    return the html view for a single node
    """
    nodes = storage.all(CustomNode)
    parsed = []
    nd = json.loads(storage.get(CustomNode, node_id).to_dict())
    nd['connections'] = []
    for n in nodes.values():
        for inp in json.loads(n.innodes):
            if inp == nd['id']:
                nd['connections'].append((inp, 'in'))
        for inp in json.loads(n.outnodes):
            if inp == nd['id']:
                nd['connections'].append((inp, 'out'))
    template = render_template('node.html', nodes=[nd])
    return template


# @app.route('/users/<user_id>', methods=['GET'], strict_slashes=False)
# def get_user(user_id):
#     """
#     return the view of an user profile
#     """
#     return

@app.teardown_appcontext
def taerdown(exception):
    """Tears down close storage"""
    storage.close()


@app.route('/home', methods=['GET'], strict_slashes=False)
def home():
    """
    A index page to redirect user to the board
    """
    return render_template('home.html', id=str(uuid.uuid4()))


if __name__ == '__main__':
    app.run("localhost", 8000)
