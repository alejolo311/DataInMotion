"""
Flask web server
"""

from flask import Flask
from flask_cors import CORS
from models import storage
from flask import render_template, Response, request
from models.custom import CustomNode
from models.board import Board
from models.user import User
import uuid
import json

# libertad y whiskey

app = Flask(__name__)
CORS(app)


@app.route('/user/boards', methods=['GET'], strict_slashes=False)
def main_board():
    """
    shows the main page to start creating a board
    """
    return render_template('dashboard.html', id=str(uuid.uuid4()))


@app.route('/boards/<board_id>', methods=['GET'], strict_slashes=False)
def board(board_id):
    """
    return a view for the board
    """
    # args = request.args.to_dict()
    # print(args)
    # process_id = None
    # if 'check_process' in args:
    #     process_id = args['check_process']
    board = json.loads(storage.get(Board, board_id).to_dict())
    user = storage.get(User, board['user_id'])
    return render_template('board.html', id=str(uuid.uuid4()), board=board, owner=user.email) # , pid=process_id)


@app.route('/boards/<board_id>/lite', methods=['GET'], strict_slashes=False)
def board_lite(board_id):
    """
    return a view for the board
    """
    board = json.loads(storage.get(Board, board_id).to_dict())
    user = storage.get(User, board['user_id'])
    print(user, board)
    return render_template('board_lite.html', id=str(uuid.uuid4()), board=board, owner=user.email)


@app.route('/boards/nodes', methods=['POST'], strict_slashes=False)
def nodes():
    """
    return a list of nodes
    by now it returns all the created nodes, it need to filter by board id
    """
    nodes = request.get_json()
    # print(nodes)
    # if 'lite' in dict(request.__dict__)['environ']['QUERY_STRING']:
    #     return Response(json.dumps([nods, connections]), mimetype='application/json')
    # else:
    cols = ['#9dff00', '#7dcc00', '#6db200', '#5e9900',
            '#3e6600', '#a6ff19', '#baff4c', '#b07fff']
    cols.extend(['#fff200', '#e5d900', '#ccc100', '#b2a900',
                 '#999100', '#fff766', '#fffbb2', '#00fff2', '#00bfa5'])
    cols.extend(['#ff5724', '#ff784f', '#ff8965', '#ff9a7b',
                 '#ffbba7', '#ff4f7e', '#ffe4db', '#4fff78'])
    cols.extend(['#69c5fa', '#5eb1e1', '#549dc8', '#4989af',
                 '#3f7696', '#96d6fb', '#c3e7fd', '	#fa9e69'])
    template = render_template('node.html', nodes=nodes.values(),
                               id=str(uuid.uuid4()), colors=cols)
    return Response(json.dumps({'nodes': template}), mimetype='application/json')
    # read the board file
    # nodes = []
    # boar = json.loads(storage.get(Board, board_id).to_dict())
    # for key in boar['nodes']:
    #     node = storage.get(CustomNode, key)
    #     nodes.append(node)
    # print('clossing , Boards.', board_id)
    # # THIS BEHAVIOR SHOULD BE REMOVED FOR SECURITY REASONS
    # # IT JUST VALID FOR DEVELOPING PURPOSE
    # parsed = []
    # for node in nodes:
    #     nd = json.loads(node.to_dict())
    #     nd['connections'] = []
    #     for n in nodes:
    #         for inp in json.loads(n.innodes):
    #             if inp == node.id:
    #                 nd['connections'].append((inp, 'in'))
    #         for inp in json.loads(n.outnodes):
    #             if inp == node.id:
    #                 nd['connections'].append((inp, 'out'))
    #     parsed.append(nd)
    # cols = ['#9dff00', '#7dcc00', '#6db200', '#5e9900',
    #         '#3e6600', '#a6ff19', '#baff4c', '#b07fff']
    # cols.extend(['#fff200', '#e5d900', '#ccc100', '#b2a900',
    #              '#999100', '#fff766', '#fffbb2', '#00fff2', '#00bfa5'])
    # cols.extend(['#ff5724', '#ff784f', '#ff8965', '#ff9a7b',
    #              '#ffbba7', '#ff4f7e', '#ffe4db', '#4fff78'])
    # cols.extend(['#69c5fa', '#5eb1e1', '#549dc8', '#4989af',
    #              '#3f7696', '#96d6fb', '#c3e7fd', '	#fa9e69'])
    # # print('Is Lite', dict(request.__dict__)['environ']['QUERY_STRING'])
    # if 'lite' in dict(request.__dict__)['environ']['QUERY_STRING']:
    #     cols = ['#fff200', '#e5d900', '#ccc100', '#b2a900',
    #              '#999100', '#fff766', '#fffbb2', '#00fff2', '#00bfa5']
    #     nods = []
    #     connections = {}
    #     for nod in parsed:
    #         connections[nod['id']] = {}
    #         connections[nod['id']]['innodes'] = nod['innodes']
    #         connections[nod['id']]['outnodes'] = nod['outnodes']
    #         connections[nod['id']]['type'] = nod['type'];
    #         template = render_template('lite/node.html', node=nod,
    #                                    id=str(uuid.uuid4()), colors=cols)
    #         connections[nod['id']]['template'] = template
    #     return Response(json.dumps([nods, connections]), mimetype='application/json')
    # else:
    #     template = render_template('node.html', nodes=parsed,
    #                             id=str(uuid.uuid4()), colors=cols)
    # return Response(json.dumps({'nodes': template}), mimetype='application/json')


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


@app.route('/login', methods=['GET'], strict_slashes=False)
def login():
    """
    A index page to redirect user to the board
    """
    return render_template('login.html', id=str(uuid.uuid4()))

@app.route('/register', methods=['GET'], strict_slashes=False)
def register():
    """
    Register form
    """
    return render_template('register.html', id=str(uuid.uuid4()))

@app.route('/check_mail', methods=['GET'], strict_slashes=False)
def check_mail():
    """
    Chek your mail
    """
    # print(dir(request))
    # print(request.base_url)
    # print(request.host)
    return render_template('check_mail.html', id=str(uuid.uuid4()))

@app.route('/', methods=['GET'], strict_slashes=False)
def index():
    """
    A index page to redirect user to the board
    """
    return render_template('index.html', id=str(uuid.uuid4()))


@app.route('/launch_demo', methods=['GET'], strict_slashes=False)
def launch_demo():
    """
    Find the demo user and send the id
    """
    users = storage.all(User)
    us = None
    for user in users.values():
        if user.email == 'test':
            us = user
    return Response(json.dumps({'id': us.id}), mimetype='application/json')

@app.route('/calendar', methods=['GET'], strict_slashes=False)
def calendar():
    """
    Return the calendar view
    """
    return render_template('calendar.html', id=str(uuid.uuid4()))

@app.route('/forgot', methods=['GET'], strict_slashes=False)
def forgot():
    """
    Return the forgot view
    """
    return render_template('forgot.html', id=str(uuid.uuid4()))


@app.route('/change_password',
            methods=['GET'],
            strict_slashes=False)
def change_password():
    """
    Change password view
    """
    token = request.args.get('token')
    return render_template('change_password.html', id=str(uuid.uuid4()), token=token)


@app.route('/node_editor',
            methods=['GET'],
            strict_slashes=False)
def node_editor():
    """
    Node Editor View
    """
    node_id = request.args.get('id')
    return render_template('node_editor.html', id=str(uuid.uuid4()), node=node_id)

if __name__ == '__main__':
    app.run(host="0.0.0.0", port='8086')