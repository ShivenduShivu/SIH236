"""Fail closed on tracked/staged private or generated artifacts before a push."""
import argparse
import pathlib
import re
import subprocess
import sys

parser = argparse.ArgumentParser()
parser.add_argument('--staged', action='store_true')
args = parser.parse_args()
git = ['git', '-c', f'safe.directory={pathlib.Path(__file__).resolve().parents[1].as_posix()}']
command = git + (['diff', '--cached', '--name-only', '--diff-filter=ACMR', '-z'] if args.staged else ['ls-files', '-z'])
paths = subprocess.check_output(command).decode().split('\0')
bad = []
for name in filter(None, paths):
    parts = pathlib.PurePosixPath(name).parts
    if any(p in {'node_modules', '.venv', '__pycache__', 'dist', 'tmp', 'output', 'test-results', '.pytest_cache'} for p in parts):
        bad.append((name, 'generated/private directory'))
    base = parts[-1]
    if (base.startswith('.env') and base != '.env.example') or pathlib.Path(base).suffix in {'.pem', '.key', '.p12', '.pfx', '.pyc', '.log'}:
        bad.append((name, 'credential or local artifact filename'))
    content = subprocess.check_output(git + ['show', ':' + name])
    if len(content) > 1_000_000:
        bad.append((name, 'file larger than 1 MB; review explicitly'))
    if re.search(rb'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|(?:ghp_|github_pat_)[A-Za-z0-9_]{25,}|sk-[A-Za-z0-9_-]{35,}', content):
        bad.append((name, 'possible credential (value suppressed)'))
if bad:
    for name, reason in bad:
        print(f'FAIL {name}: {reason}')
    sys.exit(1)
print(f'PASS: {len(list(filter(None, paths)))} {"staged" if args.staged else "tracked"} files reviewed; no prohibited artifacts or recognized credential patterns.')
print('This pattern audit is supplemented by a human staged-diff review; it is not a complete secret scanner.')
