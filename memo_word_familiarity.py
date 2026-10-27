"""Prefer familiar English memo images over niche references.

These are authored familiarity tiers, not measured population statistics. They
only reorder already-approved CoLPI suggestions; they never invent candidates or
replace a user's saved word. Equal/unknown scores retain CoLPI's original order.
"""
import re
import unicodedata

# Broadly familiar everyday words, including many alternatives absent from the
# story lexicon. Keep familiarity separate from story/short-cue coverage.
EVERYDAY = frozenset('''
apple|apple juice|arm|baby|backpack|bag|ball|banana|bath|bathroom|beach|bear|bed|bee|bell|bike|bird|blanket|blindfold|boat|book|boot|bottle|bowl|box|boy|bread|bridge|bus|butter|cake|camera|can|car|card|carpet|carrot|cart|cash|cat|chair|cheek|cheese|chicken|child|chin|chocolate|clock|cloud|coat|coffee|coin|computer|cookie|corn|cow|crab|crow|cup|dad|day|desk|dog|doll|door|dress|drink|drum|duck|ducks|ear|earth|egg|eye|eyeball|face|fan|farm|feet|finger|fire|fish|floor|flower|fly|food|foot|fork|fox|frog|fruit|game|garden|girl|glass|glasses|glove|glue|goat|gold|grass|hair|ham|hand|hat|head|heart|hill|home|horse|hospital|house|ice|ice cream|jacket|jam|jar|jeans|juice|key|keyboard|keyboard (qwerty)|kitchen|kite|knee|knife|ladder|lake|lamp|leaf|leg|lemon|letter|light|lion|lip|lips|lock|log|love|map|milk|mirror|mom|money|monkey|moon|mountain|mouse|mouth|mud|mug|nail|neck|net|nose|notebook|nuggets|ocean|office|oil|onion|orange|orange juice|oven|owl|paint|pan|paper|park|party|pencil|pen|person|pet|phone|picture|pie|pig|pillow|pizza|plane|plant|plate|pocket|pool|pot|potato|rain|rat|rice|ring|river|road|rock|roof|room|rope|rose|rug|sad|salt|sand|school|sea|seed|sheep|shirt|shoe|shop|sink|sky|sleep|smile|smoke|snake|snow|soap|sock|socks|soup|spoon|square|stairs|star|stick|stone|straw|street|sugar|sun|table|tail|tape|taxi|tea|teacher|teddy bear|teeth|tent|tie|tiger|toast|toe|toilet|tomato|tooth|towel|toy|train|tree|truck|umbrella|wall|watch|water|watermelon|wave|web|wheel|window|wing|wolf|wood|word|worm|zebra|zoo
'''.strip().split('|'))

FAMILIAR = frozenset('''
electric eel|abs|actor|ad|ad (advertisement)|aeroplane|air conditioner|alien|angel|ant|aquarium|arrow|astronaut|avocado|axe|bacon|balloon|banjo|bat|beaver|beehive|bicycle|bubbles|butcher|butterfly|cage|cave|cd|cereal|chef|cherry|chess|chest|chimney|chives|clown|coconut|cog|cough|crown|cube|deer|dentist|diamond|dice|doctor|dolphin|donut|dough|dragon|eagle|eel|elephant|elevator|elf|envelope|feather|firefighter|foam|fossil|freezer|fridge|frying pan|galaxy|gate|ghost|globe|goal|golf|gravel|guitar|gym|hammock|hawk|hedgehog|helicopter|hive|honey|hook|hut|ice skates|iceberg|id card|island|ivy|jaguar|jigsaw|kangaroo|kayak|kebab|keyhole|kiwi|koala|lace|leek|lettuce|library|lighthouse|lizard|lobster|magazine|magnet|mail|maze|medal|microscope|microwave|mosquito|movie|muffin|mushroom|mustard|nachos|nap|newspaper|noodles|oatmeal|octopus|omelette|opera|ostrich|otter|oyster|pajamas|panda|peach|pear|penguin|perfume|pickle|pineapple|plum|plunger|polar bear|porcupine|pumpkin|puppy|puzzle|quad|queen|queue|quicksand|rabbit|racquet|rainbow|razor|remote|rhino|ribbon|robin|robot|ruby|safe|sail|salad|saxophone|scissors|shark|shell|skateboard|sloth|snail|spaghetti|spider|sponge|squirrel|squid|suitcase|sunflower|sushi|swan|swing|syrup|telescope|tennis|theater|thumb|tissue|tofu|toilet paper|tongue|torch|tortoise|traffic light|triangle|trophy|trumpet|tulip|turtle|unicorn|unicycle|vacuum|van|vase|vegetable|violin|volcano|volleyball|wallet|whale|wig|wizard|wok|yacht|yawn|yogurt|yo-yo|yoyo|zipper|zucchini
'''.strip().split('|'))

# Recognizable, but less everyday than the tiers above. No niche-name blacklist.
LESS_EVERYDAY = frozenset('''
abacus|aorta|atom|chihuahua|croquet|eclipse|genie|guacamole|hexagon|hyena|kazoo|kelp|leech|navel|orangutan|quartz|quid|quill|urchin|ventriloquist|viola|vulture|xylophone|xenon
'''.strip().split('|'))


def familiarity(word):
    normalized = unicodedata.normalize('NFKC', word).casefold().strip()
    normalized = ' '.join(normalized.split())
    # Parenthetical spelling hints do not make an ordinary image unfamiliar.
    base = re.sub(r'\s*\([^)]*\)', '', normalized).strip()
    def tier(value):
        forms = [value]
        if value.endswith('ies'):
            forms.append(value[:-3] + 'y')
        elif value.endswith('s') and not value.endswith('ss'):
            forms.append(value[:-1])
        return max(5 if form in EVERYDAY else 4 if form in FAMILIAR
                   else 3 if form in LESS_EVERYDAY else 0 for form in forms)
    score = max(tier(normalized), tier(base))
    # Transparent combinations of familiar words (e.g. apple box) should not
    # lose simply because the exact phrase is absent from the authored catalog.
    tokens = base.split()
    if 2 <= len(tokens) <= 3 and all(tier(token) for token in tokens):
        score = max(score, min(tier(token) for token in tokens) - 0.5)
    return score



def rank_candidates(words):
    """Stable ranking: familiarity first, existing CoLPI rank for ties."""
    return sorted(words, key=familiarity, reverse=True)
