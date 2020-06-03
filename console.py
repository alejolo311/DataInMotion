#!/usr/bin/python3
"""
Test the nodes
"""

from models import storage
from models.user import User
from models.custom import CustomNode
import json

storage.reload()

objects = storage.all(CustomNode)


while True:
    nodes = list(enumerate(objects.keys()))
    print('\033[33m id   name             Model.id\033[0m')
    for i, key in nodes:
        if objects[key].type == 'service':
            print('\033[34m', end='')
        else:
            print('\033[0m', end='')
        print('{:>3}'.format(i), '{:<16}'.format(objects[key].name), ': ', key.split('.')[1])
    print('\033[0m', end='')
    print('c: create, s: select, d: delete')
    chose = input('\033[35mDataInMotion shell > \033[0m')
    chose = chose.split(' ')
    if chose[0] == 's':
        node = storage.get(CustomNode, nodes[int(chose[1])][1].split('.')[1])
        while True:
            # print(node.name + ':')
            print('actions: [run, set, show, back, append_ap, append_data, add_out, add_in, add_h]')
            chose = input('\033[35mDataInMotion shell:[{}]> \033[0m'.format(node.name))
            if chose == 'show':
                print(node.to_dict())
            elif chose == 'run':
                response = node.run_node_task({})
                print('===Node response===')
                print(json.dumps(response[0], indent=2, sort_keys=True))
                print('===================')
            elif chose == 'set':
                print(json.loads(node.to_dict()).keys())
                print('Shortcuts\n\tap: analisis_parameters, nm: name, wt: work_type')
                print('\ts:string, api: the api url, end: the endpoint, data: request data')
                print('\tout: outnodes, h: headers, h_value<value>: header value, am: analisis mode, ty: type, co: color')
                key = input('key > ')
                chose = input('value > ')
                if key == 'ap':
                    node.analisis_params = chose
                elif key == 's':
                    node.string = chose
                elif key == 'ty':
                    node.type = chose
                elif key == 'nm':
                    node.name = chose
                elif key == 'wt':
                    node.work_type = chose
                elif key == 'api':
                    node.api_url = chose
                elif key == 'end':
                    node.api_endpoint = chose
                elif key == 'data':
                    node.data = chose
                elif key == 'out':
                    node.outnodes = chose
                elif key == 'h':
                    node.headers = chose
                elif key == 'am':
                    node.analisis_mode = chose
                elif key == 'co':
                    node.color = chose
                elif 'h_value' in key:
                    headers = json.loads(node.headers)
                    k = key.split('<')[1][:-1]
                    headers[k] = chose
                    node.headers = json.dumps(headers)
                node.save()
                print(chose, key, 'this method is not implemented yet')
            elif chose == 'append_ap':
                key = input('key > ')
                path = input('path > ')
                aps = json.loads(node.analisis_params)
                new_ap = {'key': key, 'path': path}
                if node.analisis_mode == 'comparision':
                    new_ap = {key: path}
                aps.append(new_ap)
                node.analisis_params = json.dumps(aps)
                node.save()
            elif chose == 'append_data':
                key = input('key > ')
                value = input('value > ')
                aps = json.loads(node.data)
                aps[key] = value
                node.data = json.dumps(aps)
                node.save()
            elif chose == 'add_out':
                outnodes = json.loads(node.outnodes)
                value = input('value > ')
                outnodes.append(value)
                node.outnodes = json.dumps(outnodes)
                node.save()
            elif chose == 'add_in':
                innodes = json.loads(node.innodes)
                value = input('value > ')
                innodes.append(value)
                node.innodes = json.dumps(innodes)
                node.save()
            elif chose == 'add_h':
                heads = json.loads(node.headers)
                key = input('key > ')
                value = input('value > ')
                heads[key] = value
                node.headers = json.dumps(heads)
                node.save()
            elif chose == 'back':
                break
    elif chose[0] == 'c':
        new_node = CustomNode()
        name = input('New node name > ')
        new_node.name = name
        print(storage.all(User))
        user_id = input('Node user > ')
        new_node.user_id = user_id
        new_node.save()
        objects = storage.all(CustomNode)

