import os
import json
import nbformat
from nbclient import NotebookClient

print("Running generator...")
os.system("python generate_notebook.py")

nb_path = "india_storm_prediction_analysis.ipynb"
if not os.path.exists(nb_path):
    print("Notebook not generated!")
    exit(1)

print("Executing notebook...")
with open(nb_path, 'r', encoding='utf-8') as f:
    nb = nbformat.read(f, as_version=4)

client = NotebookClient(nb, timeout=600, kernel_name='python3')
try:
    client.execute()
    print("Execution complete.")
except Exception as e:
    print(f"Error during execution: {e}")

with open(nb_path, 'w', encoding='utf-8') as f:
    nbformat.write(nb, f)

print("Saved executed notebook.")
