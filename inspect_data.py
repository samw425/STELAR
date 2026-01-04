import json

with open('web/public/rankings.json') as f:
    data = json.load(f)

global_list = data['rankings'].get('global', [])
print(f"Total Global Artists: {len(global_list)}")

listeners = [a['monthlyListeners'] for a in global_list]
if not listeners:
    print("No listener data found")
    exit()

print(f"Min Listeners: {min(listeners):,}")
print(f"Max Listeners: {max(listeners):,}")
print(f"Avg Listeners: {sum(listeners)/len(listeners):,.0f}")

under_5m = [a for a in global_list if a['monthlyListeners'] < 5_000_000]
print(f"Artists < 5M: {len(under_5m)}")

under_10m = [a for a in global_list if a['monthlyListeners'] < 10_000_000]
print(f"Artists < 10M: {len(under_10m)}")
