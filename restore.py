import os
import re

log_path = r'C:\Users\indug\.gemini\antigravity\brain\9d9bbd7b-947f-475a-a4c4-da9a167d7a15\.system_generated\logs\overview.txt'
prev_log = r'C:\Users\indug\.gemini\antigravity\brain\789fba68-bb87-4af3-9f56-9bfdd7419827\.system_generated\logs\overview.txt'

def extract(path, filename):
    with open(path, 'r', encoding='utf-8', errors='ignore') as f:
        text = f.read()
    
    matches = list(re.finditer(r'File Path: `file:///.*?/' + re.escape(filename) + r'`', text))
    if not matches: return None
    
    idx = matches[0].end()
    
    start = text.find('1: ', idx)
    if start == -1: return None
    
    end = text.find('The above content', start)
    if end == -1: end = text.find('\"}}', start)
    if end == -1: end = len(text)
    
    block = text[start:end]
    
    if r'\n' in block:
        block = block.replace(r'\n', '\n').replace(r'\"', '\"').replace(r'\\', '\\')
    
    lines = []
    for l in block.split('\n'):
        l = l.strip('\r')
        if re.match(r'^\d+:\s', l):
            lines.append(re.sub(r'^\d+:\s', '', l))
        elif re.match(r'^\d+:$', l):
            lines.append('')
    return '\n'.join(lines)

files = {
    'expanding-search-dock-shadcnui.tsx': log_path,
    'premium-metric-card.tsx': log_path,
    'side-menu.tsx': log_path,
    'App.tsx': prev_log
}

for filename, lp in files.items():
    code = extract(lp, filename)
    if not code and filename == 'App.tsx':
        code = extract(log_path, filename)
        
    if code:
        # Save to frontend/src folder structure
        if filename == 'App.tsx':
            dest = r'frontend\src\App.tsx'
        else:
            dest = rf'frontend\src\components\ui\{filename}'
            
        with open(dest, 'w', encoding='utf-8') as f:
            f.write(code + '\n')
        print(f'Restored {dest}')
    else:
        print(f'Failed {filename}')
