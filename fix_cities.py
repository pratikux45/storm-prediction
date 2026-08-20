import re

with open('frontend/src/data/indian_cities.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace types
content = content.replace("'Critical' | 'Severe' | 'Moderate' | 'Low'", "'High Risk' | 'Moderate Risk' | 'Low Risk'")

# Replace actual string values
content = re.sub(r"riskLevel: 'Critical'", "riskLevel: 'High Risk'", content)
content = re.sub(r"riskLevel: 'Severe'", "riskLevel: 'High Risk'", content)
content = re.sub(r"riskLevel: 'Moderate'", "riskLevel: 'Moderate Risk'", content)
content = re.sub(r"riskLevel: 'Low'", "riskLevel: 'Low Risk'", content)

with open('frontend/src/data/indian_cities.ts', 'w', encoding='utf-8') as f:
    f.write(content)
