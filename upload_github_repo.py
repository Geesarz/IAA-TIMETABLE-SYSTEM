import os
import json
import base64
import urllib.request
from urllib.error import HTTPError

# GitHub token is read from the environment for security
TOKEN = os.environ.get('GITHUB_TOKEN')
if not TOKEN:
    raise SystemExit('Environment variable GITHUB_TOKEN is required')
REPO_NAME = "IAA-TIMETABLE-SYSTEM"
REPO_DESCRIPTION = "IAA TIMETABLE SYSTEM"
PRIVATE = False
IGNORE_DIRS = {
    'node_modules', 'venv', '.venv', '.lovable', '.tanstack', 'dist', 'dist-ssr',
    '.output', '.wrangler', '.dev.vars', '.vscode', '.idea'
}
IGNORE_FILES = {'.env.local'}
IGNORE_SUFFIXES = ('.log',)

ROOT = os.path.abspath(os.path.dirname(__file__))
HEADERS = {
    'Authorization': f'token {TOKEN}',
    'Accept': 'application/vnd.github+json',
    'Content-Type': 'application/json',
}


def gh_request(url, method='GET', data=None):
    req = urllib.request.Request(url, data=data, method=method, headers=HEADERS)
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read().decode())
    except HTTPError as e:
        body = e.read().decode()
        raise RuntimeError(f'GitHub API error {e.code}: {body}')


def list_local_files():
    files = []
    for base, dirs, filenames in os.walk(ROOT):
        rel_base = os.path.relpath(base, ROOT)
        if rel_base == '.':
            rel_base = ''
        parts = rel_base.split(os.sep) if rel_base else []
        if any(p in IGNORE_DIRS for p in parts):
            continue
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
        for fn in filenames:
            if fn in IGNORE_FILES or fn.endswith(IGNORE_SUFFIXES):
                continue
            files.append((os.path.join(rel_base, fn) if rel_base else fn).replace(os.sep, '/'))
    return sorted(files)


def ensure_repo(owner):
    url = 'https://api.github.com/user/repos'
    payload = json.dumps({
        'name': REPO_NAME,
        'description': REPO_DESCRIPTION,
        'private': PRIVATE,
    }).encode()
    try:
        repo = gh_request(url, method='POST', data=payload)
        print('Created repository:', repo['full_name'])
        return repo
    except RuntimeError as exc:
        msg = str(exc)
        if 'already exists' in msg or 'name already exists on this account' in msg:
            return gh_request(f'https://api.github.com/repos/{owner}/{REPO_NAME}')
        raise


def get_owner():
    user = gh_request('https://api.github.com/user')
    return user['login']


def get_remote_shas(owner):
    base = f'https://api.github.com/repos/{owner}/{REPO_NAME}/contents'
    shas = {}
    stack = ['']
    while stack:
        path = stack.pop()
        url = base if path == '' else f'{base}/{path}'
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req) as resp:
            items = json.loads(resp.read().decode())
        for item in items:
            if item['type'] == 'file':
                shas[item['path']] = item['sha']
            elif item['type'] == 'dir':
                stack.append(item['path'])
    return shas


def upload_file(owner, path):
    base = f'https://api.github.com/repos/{owner}/{REPO_NAME}/contents'
    url = f'{base}/{path}'
    with open(os.path.join(ROOT, path), 'rb') as f:
        content = base64.b64encode(f.read()).decode()
    sha = None
    try:
        existing = gh_request(url)
        sha = existing['sha']
    except RuntimeError as exc:
        if '404' not in str(exc):
            raise
    payload = {
        'message': f'Add {path}' if sha is None else f'Update {path}',
        'content': content,
    }
    if sha is not None:
        payload['sha'] = sha
    try:
        return gh_request(url, method='PUT', data=json.dumps(payload).encode())
    except RuntimeError as exc:
        error_text = str(exc)
        if 'GitHub API error 409' in error_text:
            try:
                file_info = gh_request(url)
                payload['sha'] = file_info['sha']
                payload['message'] = f'Update {path}'
                return gh_request(url, method='PUT', data=json.dumps(payload).encode())
            except RuntimeError:
                pass
        raise


def main():
    owner = get_owner()
    ensure_repo(owner)
    local_files = list_local_files()
    print(f'Local files to sync: {len(local_files)}')
    for idx, path in enumerate(local_files, 1):
        upload_file(owner, path)
        print(f'[{idx}/{len(local_files)}] synced {path}')
    print('Upload complete.')
    print(f'https://github.com/{owner}/{REPO_NAME}')


if __name__ == '__main__':
    main()
