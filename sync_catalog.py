"""Keep the buildless catalog.js synchronized with catalog.json."""
import json
from pathlib import Path

here=Path(__file__).resolve().parent
public=here/'dist' if (here/'dist'/'catalog.json').exists() else here
data=json.loads((public/'catalog.json').read_text(encoding='utf-8'))
ids=set()
for game in data:
    if game['id'] in ids:
        raise ValueError('Duplicate game id: '+game['id'])
    ids.add(game['id'])
    if game['edition'] not in ('ps4','ps5'):
        raise ValueError('Invalid edition: '+game['id'])
    if not set(game['devices']) <= {'ps4','ps5'} or not game['devices']:
        raise ValueError('Invalid devices: '+game['id'])
    if game['edition']=='ps5' and 'ps4' in game['devices']:
        raise ValueError('PS5 edition cannot run on PS4: '+game['id'])
    if not (public/game['cover']).is_file():
        raise FileNotFoundError(game['cover'])
(public/'catalog.js').write_text('window.FIGHTCLUB_GAMES = '+json.dumps(data,ensure_ascii=False,indent=2)+';\n',encoding='utf-8')
print('Updated catalog.js:',len(data),'games')
