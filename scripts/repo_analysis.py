import os
import json
import subprocess
import re
from typing import Dict, List, Any


def analyze_iotagentmesh_repository() -> Dict[str, Any]:
    """Extract API routes, handlers, and test files from the repository."""
    repo_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

    # Map API routes to their handler functions from router.ts
    router_file = os.path.join(repo_root, 'supabase', 'functions', 'api-gateway', 'router.ts')
    route_map: Dict[str, str] = {}
    if os.path.exists(router_file):
        with open(router_file, 'r') as f:
            router_content = f.read()
        for match in re.finditer(r"routes\.set\('(.*?)',\s*(\w+)\)", router_content):
            path, handler = match.groups()
            route_map[path] = handler

    # Parse OpenAPI spec from docs.ts using Node.js to evaluate the JS object
    docs_file = os.path.join(
        repo_root, 'supabase', 'functions', 'api-gateway', 'handlers', 'docs.ts'
    )
    api_paths: Dict[str, List[str]] = {}
    if os.path.exists(docs_file):
        node_script = """
const fs = require('fs');
const m = fs
  .readFileSync('{file}', 'utf8')
  .match(/const openApiSpec = ({{[\s\S]*?}});/);
if (!m) process.exit(1);
const spec = eval('(' + m[1] + ')');
console.log(JSON.stringify(spec.paths));
""".format(file=docs_file.replace("'", "\'"))
        result = subprocess.check_output(['node', '-e', node_script], text=True)
        paths_data = json.loads(result)
        for path, methods in paths_data.items():
            api_paths[path] = list(methods.keys())

    # Identify test files across the repository
    search_dirs = [os.path.join(repo_root, 'src'), os.path.join(repo_root, 'tests')]
    test_files: List[str] = []
    for search_dir in search_dirs:
        if not os.path.isdir(search_dir):
            continue
        for root_dir, _, files in os.walk(search_dir):
            for file in files:
                if file.endswith(('.test.ts', '.test.tsx')):
                    test_files.append(
                        os.path.relpath(os.path.join(root_dir, file), repo_root)
                    )

    return {
        'routes': api_paths,
        'handlers': route_map,
        'tests': test_files,
    }


if __name__ == '__main__':
    analysis = analyze_iotagentmesh_repository()
    print(json.dumps(analysis, indent=2))
