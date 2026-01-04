import json

with open('web/public/rankings.json') as f:
    data = json.load(f)

global_list = data['rankings'].get('global', [])
countries = set()

for a in global_list:
    if a.get('country'):
        countries.add(a['country'])

print("Unique Countries found in dataset:")
print(sorted(list(countries)))
