import json
import os

input_file = r"e:\Project\Personal\cust360web\xmind_content.json"
output_file = r"e:\Project\Personal\cust360web\src\app\crm-guide\xmindData.ts"

# Ensure directory exists
os.makedirs(os.path.dirname(output_file), exist_ok=True)

with open(input_file, 'r', encoding='utf-8') as f:
    data = json.load(f)

root_topic = data[0]['rootTopic']

nodes_data = []

def process_node(node, parent_id, level):
    node_id = node['id']
    title = node.get('title', '')
    
    # Children
    children_ids = []
    if 'children' in node and 'attached' in node['children']:
        for child in node['children']['attached']:
            children_ids.append(child['id'])
            process_node(child, node_id, level + 1)
            
    nodes_data.append({
        'id': node_id,
        'title': title,
        'level': level,
        'parentId': parent_id,
        'childrenIds': children_ids
    })

process_node(root_topic, None, 0)

# Generate TS code
ts_code = "export type MindMapNode = {\n"
ts_code += "  id: string;\n"
ts_code += "  title: string;\n"
ts_code += "  level: number;\n"
ts_code += "  parentId?: string | null;\n"
ts_code += "  childrenIds: string[];\n"
ts_code += "};\n\n"

ts_code += f"export const rootId = '{root_topic['id']}';\n\n"

ts_code += "export const initialNodesData: MindMapNode[] = "
ts_code += json.dumps(nodes_data, ensure_ascii=False, indent=2)
ts_code += ";\n"

with open(output_file, 'w', encoding='utf-8') as f:
    f.write(ts_code)

print(f"Generated {output_file} with {len(nodes_data)} nodes.")
