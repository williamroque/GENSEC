import hashlib
import json

import getpass

import os

path = 'credentials.json'

def read_credentials():
    data = {}
    if os.path.exists(path):
        with open(path, 'r') as f:
            data = json.loads(f.read())
    return data

def write_credentials(data):
    with open(path, 'w+') as f:
        f.write(json.dumps(data))

commands = ['Dump credentials.', 'Add user.', 'Remove user.', 'Exit.']

def get_input():
    while True:
        for i, command in enumerate(commands):
            print('{}. {}'.format(i + 1, command))
        cmd = input('> ')
        try:
            cmd = int(cmd)
        except ValueError:
            print('Invalid command.\n')
            continue
        if 0 < cmd <= len(commands):
            break
        print('Invalid command.\n')
    return cmd

def get_credentials():
    username = password = ''
    while True:
        print()
        username = input('Username> ')
        password = getpass.getpass(prompt='Password> ', stream=None)
        if password == getpass.getpass(prompt='Confirm> ', stream=None):
            break
    print()
    return (username, password)

hash_p = lambda p: hashlib.sha256(p.encode('utf-8')).hexdigest()

while True:
    credentials = read_credentials()
    cmd = get_input()
    if cmd == 1:
        print()
        for user in credentials:
            print('{}: {}'.format(user, credentials[user]))
        print()
    elif cmd == 2:
        username, password = get_credentials()
        credentials[username] = hash_p(password)
        write_credentials(credentials)
    elif cmd == 3:
        successful = False
        username = password = ''
        while True:
            username, password = get_credentials()
            if not (username and password):
                break
            if username in credentials:
                if credentials[username] == hash_p(password):
                    successful = True
                    break
        if successful:
            del credentials[username]
            write_credentials(credentials)
    elif cmd == 4:
        break
