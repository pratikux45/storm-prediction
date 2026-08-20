import os

path = r'c:\Users\indug\OneDrive\Documents\india-storm-prediction\india-storm-prediction\frontend\src\App.tsx'
with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

start = -1
for i, l in enumerate(lines):
    if '{/* Historical Data Section */}' in l:
        start = i
        break

end = -1
count = 0
for i in range(start, len(lines)):
    if '<div' in lines[i]:
        count += lines[i].count('<div')
    if '</div' in lines[i]:
        count -= lines[i].count('</div')
    
    if count == 0 and i > start + 1:
        end = i
        break

if start != -1 and end != -1:
    block = lines[start:end+1]
    
    del lines[start:end+1]
    
    insert_idx = -1
    for i, l in enumerate(lines):
        if '</div>' in l and '</div>' in lines[i+1] and ') : (' in lines[i+2] and '<div className="h-48 flex' in lines[i+3]:
            insert_idx = i + 1
            break
            
    if insert_idx != -1:
        lines.insert(insert_idx, '\n')
        for idx, bline in enumerate(block):
            lines.insert(insert_idx + 1 + idx, bline)
            
        with open(path, 'w', encoding='utf-8') as f:
            f.writelines(lines)
        print('Moved successfully.')
    else:
        print('Failed to find insertion point.')
else:
    print('Failed to find block bounds.')
