// Reviewed vocabulary, mnemonic stand-ins, pronunciation, and physical affordances.
const MEMO_LEXICON = {
  "email": {
    "pos": "noun",
    "category": "object",
    "number": "singular",
    "properties": [
      "portable"
    ],
    "description": "a message on a screen, imagined as a flying envelope",
    "affordances": {
      "tags": [
        "message",
        "portable",
        "physical"
      ],
      "canDo": [
        "alert",
        "arrive"
      ],
      "canReceive": [
        "send",
        "read"
      ],
      "associations": [
        "screen",
        "envelope"
      ],
      "detail": "a message that can be sent or announce its arrival"
    }
  },
  "boy": {
    "pos": "noun",
    "category": "person",
    "number": "singular",
    "properties": [
      "animate"
    ],
    "description": "a young person",
    "actions": [
      "waves",
      "steps aside",
      "reaches out"
    ],
    "affordances": {
      "tags": [
        "animate",
        "grasping",
        "person",
        "physical"
      ],
      "canDo": [
        "drink",
        "hold",
        "play",
        "pour"
      ],
      "canReceive": [],
      "associations": [],
      "detail": "a young person",
      "basis": "category and reviewed word properties"
    }
  },
  "baby": {
    "pos": "noun",
    "category": "person",
    "number": "singular",
    "properties": [
      "animate"
    ],
    "description": "a very young child",
    "actions": [
      "waves",
      "steps aside",
      "reaches out"
    ],
    "affordances": {
      "tags": [
        "animate",
        "grasping",
        "person",
        "physical"
      ],
      "canDo": [
        "drink",
        "hold",
        "play",
        "pour"
      ],
      "canReceive": [],
      "associations": [],
      "detail": "a very young child",
      "basis": "category and reviewed word properties"
    }
  },
  "astronaut": {
    "pos": "noun",
    "category": "person",
    "number": "singular",
    "properties": [
      "animate"
    ],
    "description": "a person wearing a bulky space suit",
    "actions": [
      "waves",
      "steps aside",
      "reaches out"
    ],
    "pronunciation": {
      "syllables": [
        "as",
        "tro",
        "naut"
      ],
      "shortCue": "ast"
    },
    "affordances": {
      "tags": [
        "animate",
        "grasping",
        "person",
        "physical",
        "visored"
      ],
      "canDo": [
        "drink",
        "hold",
        "play",
        "pour"
      ],
      "canReceive": [],
      "associations": [
        "visor",
        "space suit"
      ],
      "detail": "a curved helmet visor",
      "basis": "category and reviewed word properties"
    }
  },
  "chef": {
    "pos": "noun",
    "category": "person",
    "number": "singular",
    "properties": [
      "animate"
    ],
    "description": "a person preparing food",
    "actions": [
      "waves",
      "steps aside",
      "reaches out"
    ],
    "affordances": {
      "tags": [
        "animate",
        "grasping",
        "person",
        "physical"
      ],
      "canDo": [
        "drink",
        "hold",
        "play",
        "pour"
      ],
      "canReceive": [],
      "associations": [],
      "detail": "a person preparing food",
      "basis": "category and reviewed word properties"
    }
  },
  "clown": {
    "pos": "noun",
    "category": "person",
    "number": "singular",
    "properties": [
      "animate"
    ],
    "description": "a performer with a brightly painted face",
    "actions": [
      "waves",
      "steps aside",
      "reaches out"
    ],
    "affordances": {
      "tags": [
        "animate",
        "grasping",
        "person",
        "physical"
      ],
      "canDo": [
        "drink",
        "hold",
        "play",
        "pour"
      ],
      "canReceive": [],
      "associations": [],
      "detail": "a performer with a brightly painted face",
      "basis": "category and reviewed word properties"
    }
  },
  "dad": {
    "pos": "noun",
    "category": "person",
    "number": "singular",
    "properties": [
      "animate"
    ],
    "actions": [
      "waves",
      "steps aside",
      "reaches out"
    ],
    "affordances": {
      "tags": [
        "animate",
        "grasping",
        "person",
        "physical"
      ],
      "canDo": [
        "drink",
        "hold",
        "play",
        "pour"
      ],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "doctor": {
    "pos": "noun",
    "category": "person",
    "number": "singular",
    "properties": [
      "animate"
    ],
    "description": "a person caring for a patient",
    "actions": [
      "waves",
      "steps aside",
      "reaches out"
    ],
    "affordances": {
      "tags": [
        "animate",
        "grasping",
        "person",
        "physical"
      ],
      "canDo": [
        "drink",
        "hold",
        "play",
        "pour"
      ],
      "canReceive": [],
      "associations": [],
      "detail": "a person caring for a patient",
      "basis": "category and reviewed word properties"
    }
  },
  "dude": {
    "pos": "noun",
    "category": "person",
    "number": "singular",
    "properties": [
      "animate"
    ],
    "actions": [
      "waves",
      "steps aside",
      "reaches out"
    ],
    "affordances": {
      "tags": [
        "animate",
        "grasping",
        "person",
        "physical"
      ],
      "canDo": [
        "drink",
        "hold",
        "play",
        "pour"
      ],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "elf": {
    "pos": "noun",
    "category": "person",
    "number": "singular",
    "properties": [
      "animate"
    ],
    "description": "a small imaginary person with pointed ears",
    "actions": [
      "waves",
      "steps aside",
      "reaches out"
    ],
    "affordances": {
      "tags": [
        "animate",
        "grasping",
        "person",
        "physical"
      ],
      "canDo": [
        "drink",
        "hold",
        "play",
        "pour"
      ],
      "canReceive": [],
      "associations": [],
      "detail": "a small imaginary person with pointed ears",
      "basis": "category and reviewed word properties"
    }
  },
  "firefighter": {
    "pos": "noun",
    "category": "person",
    "number": "singular",
    "properties": [
      "animate"
    ],
    "description": "a person in protective clothing",
    "actions": [
      "waves",
      "steps aside",
      "reaches out"
    ],
    "affordances": {
      "tags": [
        "animate",
        "grasping",
        "person",
        "physical"
      ],
      "canDo": [
        "drink",
        "hold",
        "play",
        "pour"
      ],
      "canReceive": [],
      "associations": [],
      "detail": "a person in protective clothing",
      "basis": "category and reviewed word properties"
    }
  },
  "goalkeeper": {
    "pos": "noun",
    "category": "person",
    "number": "singular",
    "properties": [
      "animate"
    ],
    "affordances": {
      "tags": [
        "animate",
        "grasping",
        "person",
        "physical"
      ],
      "canDo": [
        "drink",
        "hold",
        "play",
        "pour"
      ],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "hobbit": {
    "pos": "noun",
    "category": "person",
    "number": "singular",
    "properties": [
      "animate"
    ],
    "affordances": {
      "tags": [
        "animate",
        "grasping",
        "person",
        "physical"
      ],
      "canDo": [
        "drink",
        "hold",
        "play",
        "pour"
      ],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "kid": {
    "pos": "noun",
    "category": "person",
    "number": "singular",
    "properties": [
      "animate"
    ],
    "actions": [
      "waves",
      "steps aside",
      "reaches out"
    ],
    "affordances": {
      "tags": [
        "animate",
        "grasping",
        "person",
        "physical"
      ],
      "canDo": [
        "drink",
        "hold",
        "play",
        "pour"
      ],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "mom": {
    "pos": "noun",
    "category": "person",
    "number": "singular",
    "properties": [
      "animate"
    ],
    "actions": [
      "waves",
      "steps aside",
      "reaches out"
    ],
    "affordances": {
      "tags": [
        "animate",
        "grasping",
        "person",
        "physical"
      ],
      "canDo": [
        "drink",
        "hold",
        "play",
        "pour"
      ],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "ninja": {
    "pos": "noun",
    "category": "person",
    "number": "singular",
    "properties": [
      "animate"
    ],
    "affordances": {
      "tags": [
        "animate",
        "grasping",
        "person",
        "physical"
      ],
      "canDo": [
        "drink",
        "hold",
        "play",
        "pour"
      ],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "ogre": {
    "pos": "noun",
    "category": "person",
    "number": "singular",
    "properties": [
      "animate"
    ],
    "affordances": {
      "tags": [
        "animate",
        "grasping",
        "person",
        "physical"
      ],
      "canDo": [
        "drink",
        "hold",
        "play",
        "pour"
      ],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "quarterback": {
    "pos": "noun",
    "category": "person",
    "number": "singular",
    "properties": [
      "animate"
    ],
    "affordances": {
      "tags": [
        "animate",
        "grasping",
        "person",
        "physical"
      ],
      "canDo": [
        "drink",
        "hold",
        "play",
        "pour"
      ],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "queen": {
    "pos": "noun",
    "category": "person",
    "number": "singular",
    "properties": [
      "animate"
    ],
    "actions": [
      "waves",
      "steps aside",
      "reaches out"
    ],
    "affordances": {
      "tags": [
        "animate",
        "grasping",
        "person",
        "physical"
      ],
      "canDo": [
        "drink",
        "hold",
        "play",
        "pour"
      ],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "referee": {
    "pos": "noun",
    "category": "person",
    "number": "singular",
    "properties": [
      "animate"
    ],
    "affordances": {
      "tags": [
        "animate",
        "grasping",
        "person",
        "physical"
      ],
      "canDo": [
        "drink",
        "hold",
        "play",
        "pour"
      ],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "ventriloquist": {
    "pos": "noun",
    "category": "person",
    "number": "singular",
    "properties": [
      "animate"
    ],
    "affordances": {
      "tags": [
        "animate",
        "grasping",
        "person",
        "physical"
      ],
      "canDo": [
        "drink",
        "hold",
        "play",
        "pour"
      ],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "vet": {
    "pos": "noun",
    "category": "person",
    "number": "singular",
    "properties": [
      "animate"
    ],
    "affordances": {
      "tags": [
        "animate",
        "grasping",
        "person",
        "physical"
      ],
      "canDo": [
        "drink",
        "hold",
        "play",
        "pour"
      ],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "wife": {
    "pos": "noun",
    "category": "person",
    "number": "singular",
    "properties": [
      "animate"
    ],
    "actions": [
      "waves",
      "steps aside",
      "reaches out"
    ],
    "affordances": {
      "tags": [
        "animate",
        "grasping",
        "person",
        "physical"
      ],
      "canDo": [
        "drink",
        "hold",
        "play",
        "pour"
      ],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "wizard": {
    "pos": "noun",
    "category": "person",
    "number": "singular",
    "properties": [
      "animate"
    ],
    "actions": [
      "waves",
      "steps aside",
      "reaches out"
    ],
    "affordances": {
      "tags": [
        "animate",
        "grasping",
        "person",
        "physical"
      ],
      "canDo": [
        "drink",
        "hold",
        "play",
        "pour"
      ],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "ant": {
    "pos": "noun",
    "category": "animal",
    "number": "singular",
    "properties": [
      "animate"
    ],
    "affordances": {
      "tags": [
        "animal",
        "animate",
        "physical"
      ],
      "canDo": [
        "follow",
        "nudge",
        "sniff"
      ],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "bat": {
    "pos": "noun",
    "category": "animal",
    "number": "singular",
    "properties": [
      "animate"
    ],
    "affordances": {
      "tags": [
        "animal",
        "animate",
        "physical"
      ],
      "canDo": [
        "follow",
        "nudge",
        "sniff"
      ],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "bear": {
    "pos": "noun",
    "category": "animal",
    "number": "singular",
    "properties": [
      "animate"
    ],
    "affordances": {
      "tags": [
        "animal",
        "animate",
        "physical"
      ],
      "canDo": [
        "follow",
        "nudge",
        "sniff"
      ],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "beaver": {
    "pos": "noun",
    "category": "animal",
    "number": "singular",
    "properties": [
      "animate"
    ],
    "description": "an animal with a broad flat tail",
    "affordances": {
      "tags": [
        "animal",
        "animate",
        "physical"
      ],
      "canDo": [
        "follow",
        "nudge",
        "sniff"
      ],
      "canReceive": [],
      "associations": [],
      "detail": "an animal with a broad flat tail",
      "basis": "category and reviewed word properties"
    }
  },
  "bee": {
    "pos": "noun",
    "category": "animal",
    "number": "singular",
    "properties": [
      "animate"
    ],
    "description": "a small buzzing insect",
    "affordances": {
      "tags": [
        "animal",
        "animate",
        "physical"
      ],
      "canDo": [
        "follow",
        "nudge",
        "sniff"
      ],
      "canReceive": [],
      "associations": [],
      "detail": "a small buzzing insect",
      "basis": "category and reviewed word properties"
    }
  },
  "cat": {
    "pos": "noun",
    "category": "animal",
    "number": "singular",
    "properties": [
      "animate"
    ],
    "description": "a small animal with whiskers and soft paws",
    "affordances": {
      "tags": [
        "animal",
        "animate",
        "physical"
      ],
      "canDo": [
        "follow",
        "nudge",
        "sniff"
      ],
      "canReceive": [],
      "associations": [],
      "detail": "a small animal with whiskers and soft paws",
      "basis": "category and reviewed word properties"
    }
  },
  "chihuahua": {
    "pos": "noun",
    "category": "animal",
    "number": "singular",
    "properties": [
      "animate"
    ],
    "affordances": {
      "tags": [
        "animal",
        "animate",
        "physical"
      ],
      "canDo": [
        "follow",
        "nudge",
        "sniff"
      ],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "cow": {
    "pos": "noun",
    "category": "animal",
    "number": "singular",
    "properties": [
      "animate"
    ],
    "affordances": {
      "tags": [
        "animal",
        "animate",
        "physical"
      ],
      "canDo": [
        "follow",
        "nudge",
        "sniff"
      ],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "deer": {
    "pos": "noun",
    "category": "animal",
    "number": "singular",
    "properties": [
      "animate"
    ],
    "affordances": {
      "tags": [
        "animal",
        "animate",
        "physical"
      ],
      "canDo": [
        "follow",
        "nudge",
        "sniff"
      ],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "dog": {
    "pos": "noun",
    "category": "animal",
    "number": "singular",
    "properties": [
      "animate"
    ],
    "description": "an animal with a wagging tail",
    "affordances": {
      "tags": [
        "animal",
        "animate",
        "physical"
      ],
      "canDo": [
        "follow",
        "nudge",
        "sniff"
      ],
      "canReceive": [],
      "associations": [],
      "detail": "an animal with a wagging tail",
      "basis": "category and reviewed word properties"
    }
  },
  "ducks": {
    "pos": "noun",
    "category": "animal",
    "number": "plural",
    "properties": [
      "animate"
    ],
    "affordances": {
      "tags": [
        "animal",
        "animate",
        "physical"
      ],
      "canDo": [
        "follow",
        "nudge",
        "sniff"
      ],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "eagle": {
    "pos": "noun",
    "category": "animal",
    "number": "singular",
    "properties": [
      "animate"
    ],
    "affordances": {
      "tags": [
        "animal",
        "animate",
        "physical"
      ],
      "canDo": [
        "follow",
        "nudge",
        "sniff"
      ],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "eel": {
    "pos": "noun",
    "category": "animal",
    "number": "singular",
    "properties": [
      "animate"
    ],
    "affordances": {
      "tags": [
        "animal",
        "animate",
        "physical"
      ],
      "canDo": [
        "follow",
        "nudge",
        "sniff"
      ],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "elk": {
    "pos": "noun",
    "category": "animal",
    "number": "singular",
    "properties": [
      "animate"
    ],
    "affordances": {
      "tags": [
        "animal",
        "animate",
        "physical"
      ],
      "canDo": [
        "follow",
        "nudge",
        "sniff"
      ],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "fish": {
    "pos": "noun",
    "category": "animal",
    "number": "singular",
    "properties": [
      "animate"
    ],
    "description": "an animal with fins that swims",
    "affordances": {
      "tags": [
        "animal",
        "animate",
        "physical"
      ],
      "canDo": [
        "follow",
        "nudge",
        "sniff"
      ],
      "canReceive": [],
      "associations": [],
      "detail": "an animal with fins that swims",
      "basis": "category and reviewed word properties"
    }
  },
  "fly": {
    "pos": "noun",
    "category": "animal",
    "number": "singular",
    "properties": [
      "animate"
    ],
    "affordances": {
      "tags": [
        "animal",
        "animate",
        "physical"
      ],
      "canDo": [
        "follow",
        "nudge",
        "sniff"
      ],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "fox": {
    "pos": "noun",
    "category": "animal",
    "number": "singular",
    "properties": [
      "animate"
    ],
    "affordances": {
      "tags": [
        "animal",
        "animate",
        "physical"
      ],
      "canDo": [
        "follow",
        "nudge",
        "sniff"
      ],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "frog": {
    "pos": "noun",
    "category": "animal",
    "number": "singular",
    "properties": [
      "animate"
    ],
    "description": "a small animal with long jumping legs",
    "affordances": {
      "tags": [
        "animal",
        "animate",
        "physical"
      ],
      "canDo": [
        "follow",
        "nudge",
        "sniff"
      ],
      "canReceive": [],
      "associations": [],
      "detail": "a small animal with long jumping legs",
      "basis": "category and reviewed word properties"
    }
  },
  "goat": {
    "pos": "noun",
    "category": "animal",
    "number": "singular",
    "properties": [
      "animate"
    ],
    "affordances": {
      "tags": [
        "animal",
        "animate",
        "physical"
      ],
      "canDo": [
        "follow",
        "nudge",
        "sniff"
      ],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "hawk": {
    "pos": "noun",
    "category": "animal",
    "number": "singular",
    "properties": [
      "animate"
    ],
    "affordances": {
      "tags": [
        "animal",
        "animate",
        "physical"
      ],
      "canDo": [
        "follow",
        "nudge",
        "sniff"
      ],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "hedgehog": {
    "pos": "noun",
    "category": "animal",
    "number": "singular",
    "properties": [
      "animate"
    ],
    "description": "a small animal with a prickly back",
    "pronunciation": {
      "syllables": [
        "hedge",
        "hog"
      ],
      "shortCue": "hedge"
    },
    "affordances": {
      "tags": [
        "animal",
        "animate",
        "physical"
      ],
      "canDo": [
        "follow",
        "nudge",
        "sniff"
      ],
      "canReceive": [],
      "associations": [],
      "detail": "a small animal with a prickly back",
      "basis": "category and reviewed word properties"
    }
  },
  "hyena": {
    "pos": "noun",
    "category": "animal",
    "number": "singular",
    "properties": [
      "animate"
    ],
    "affordances": {
      "tags": [
        "animal",
        "animate",
        "physical"
      ],
      "canDo": [
        "follow",
        "nudge",
        "sniff"
      ],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "jaguar": {
    "pos": "noun",
    "category": "animal",
    "number": "singular",
    "properties": [
      "animate"
    ],
    "affordances": {
      "tags": [
        "animal",
        "animate",
        "physical"
      ],
      "canDo": [
        "follow",
        "nudge",
        "sniff"
      ],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "kangaroo": {
    "pos": "noun",
    "category": "animal",
    "number": "singular",
    "properties": [
      "animate"
    ],
    "pronunciation": {
      "syllables": [
        "kan",
        "ga",
        "roo"
      ],
      "shortCue": "roo"
    },
    "affordances": {
      "tags": [
        "animal",
        "animate",
        "physical"
      ],
      "canDo": [
        "follow",
        "nudge",
        "sniff"
      ],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "koala": {
    "pos": "noun",
    "category": "animal",
    "number": "singular",
    "properties": [
      "animate"
    ],
    "affordances": {
      "tags": [
        "animal",
        "animate",
        "physical"
      ],
      "canDo": [
        "follow",
        "nudge",
        "sniff"
      ],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "leech": {
    "pos": "noun",
    "category": "animal",
    "number": "singular",
    "properties": [
      "animate"
    ],
    "affordances": {
      "tags": [
        "animal",
        "animate",
        "physical"
      ],
      "canDo": [
        "follow",
        "nudge",
        "sniff"
      ],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "lion": {
    "pos": "noun",
    "category": "animal",
    "number": "singular",
    "properties": [
      "animate"
    ],
    "affordances": {
      "tags": [
        "animal",
        "animate",
        "physical"
      ],
      "canDo": [
        "follow",
        "nudge",
        "sniff"
      ],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "lizard": {
    "pos": "noun",
    "category": "animal",
    "number": "singular",
    "properties": [
      "animate"
    ],
    "affordances": {
      "tags": [
        "animal",
        "animate",
        "physical"
      ],
      "canDo": [
        "follow",
        "nudge",
        "sniff"
      ],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "lobster": {
    "pos": "noun",
    "category": "animal",
    "number": "singular",
    "properties": [
      "animate"
    ],
    "affordances": {
      "tags": [
        "animal",
        "animate",
        "physical"
      ],
      "canDo": [
        "follow",
        "nudge",
        "sniff"
      ],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "mosquito": {
    "pos": "noun",
    "category": "animal",
    "number": "singular",
    "properties": [
      "animate"
    ],
    "affordances": {
      "tags": [
        "animal",
        "animate",
        "physical"
      ],
      "canDo": [
        "follow",
        "nudge",
        "sniff"
      ],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "mouse": {
    "pos": "noun",
    "category": "animal",
    "number": "singular",
    "properties": [
      "animate"
    ],
    "affordances": {
      "tags": [
        "animal",
        "animate",
        "physical"
      ],
      "canDo": [
        "follow",
        "nudge",
        "sniff"
      ],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "octopus": {
    "pos": "noun",
    "category": "animal",
    "number": "singular",
    "properties": [
      "animate"
    ],
    "description": "a sea animal with eight flexible arms",
    "pronunciation": {
      "syllables": [
        "oc",
        "to",
        "pus"
      ],
      "shortCue": "oc"
    },
    "affordances": {
      "tags": [
        "animal",
        "animate",
        "physical"
      ],
      "canDo": [
        "follow",
        "nudge",
        "sniff"
      ],
      "canReceive": [],
      "associations": [],
      "detail": "a sea animal with eight flexible arms",
      "basis": "category and reviewed word properties"
    }
  },
  "orangutan": {
    "pos": "noun",
    "category": "animal",
    "number": "singular",
    "properties": [
      "animate"
    ],
    "affordances": {
      "tags": [
        "animal",
        "animate",
        "physical"
      ],
      "canDo": [
        "follow",
        "nudge",
        "sniff"
      ],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "ostrich": {
    "pos": "noun",
    "category": "animal",
    "number": "singular",
    "properties": [
      "animate"
    ],
    "affordances": {
      "tags": [
        "animal",
        "animate",
        "physical"
      ],
      "canDo": [
        "follow",
        "nudge",
        "sniff"
      ],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "otter": {
    "pos": "noun",
    "category": "animal",
    "number": "singular",
    "properties": [
      "animate"
    ],
    "affordances": {
      "tags": [
        "animal",
        "animate",
        "physical"
      ],
      "canDo": [
        "follow",
        "nudge",
        "sniff"
      ],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "owl": {
    "pos": "noun",
    "category": "animal",
    "number": "singular",
    "properties": [
      "animate"
    ],
    "description": "a bird with large eyes",
    "affordances": {
      "tags": [
        "animal",
        "animate",
        "physical"
      ],
      "canDo": [
        "follow",
        "nudge",
        "sniff"
      ],
      "canReceive": [],
      "associations": [],
      "detail": "a bird with large eyes",
      "basis": "category and reviewed word properties"
    }
  },
  "ox": {
    "pos": "noun",
    "category": "animal",
    "number": "singular",
    "properties": [
      "animate"
    ],
    "affordances": {
      "tags": [
        "animal",
        "animate",
        "physical"
      ],
      "canDo": [
        "follow",
        "nudge",
        "sniff"
      ],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "oyster": {
    "pos": "noun",
    "category": "animal",
    "number": "singular",
    "properties": [
      "animate"
    ],
    "description": "a shellfish with two rough shells that open and close",
    "pronunciation": {
      "syllables": [
        "oys",
        "ter"
      ],
      "shortCue": "oys"
    },
    "affordances": {
      "tags": [
        "animal",
        "animate",
        "physical"
      ],
      "canDo": [
        "follow",
        "nudge",
        "sniff"
      ],
      "canReceive": [],
      "associations": [],
      "detail": "a shellfish with two rough shells that open and close",
      "basis": "category and reviewed word properties"
    }
  },
  "panda": {
    "pos": "noun",
    "category": "animal",
    "number": "singular",
    "properties": [
      "animate"
    ],
    "affordances": {
      "tags": [
        "animal",
        "animate",
        "physical"
      ],
      "canDo": [
        "follow",
        "nudge",
        "sniff"
      ],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "pig": {
    "pos": "noun",
    "category": "animal",
    "number": "singular",
    "properties": [
      "animate"
    ],
    "affordances": {
      "tags": [
        "animal",
        "animate",
        "physical"
      ],
      "canDo": [
        "follow",
        "nudge",
        "sniff"
      ],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "porcupine": {
    "pos": "noun",
    "category": "animal",
    "number": "singular",
    "properties": [
      "animate"
    ],
    "description": "an animal covered in sharp quills",
    "pronunciation": {
      "syllables": [
        "por",
        "cu",
        "pine"
      ],
      "shortCue": "pine"
    },
    "affordances": {
      "tags": [
        "animal",
        "animate",
        "physical"
      ],
      "canDo": [
        "follow",
        "nudge",
        "sniff"
      ],
      "canReceive": [],
      "associations": [],
      "detail": "an animal covered in sharp quills",
      "basis": "category and reviewed word properties"
    }
  },
  "rat": {
    "pos": "noun",
    "category": "animal",
    "number": "singular",
    "properties": [
      "animate"
    ],
    "affordances": {
      "tags": [
        "animal",
        "animate",
        "physical"
      ],
      "canDo": [
        "follow",
        "nudge",
        "sniff"
      ],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "rhino": {
    "pos": "noun",
    "category": "animal",
    "number": "singular",
    "properties": [
      "animate"
    ],
    "affordances": {
      "tags": [
        "animal",
        "animate",
        "physical"
      ],
      "canDo": [
        "follow",
        "nudge",
        "sniff"
      ],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "roach": {
    "pos": "noun",
    "category": "animal",
    "number": "singular",
    "properties": [
      "animate"
    ],
    "affordances": {
      "tags": [
        "animal",
        "animate",
        "physical"
      ],
      "canDo": [
        "follow",
        "nudge",
        "sniff"
      ],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "shark": {
    "pos": "noun",
    "category": "animal",
    "number": "singular",
    "properties": [
      "animate"
    ],
    "affordances": {
      "tags": [
        "animal",
        "animate",
        "physical"
      ],
      "canDo": [
        "follow",
        "nudge",
        "sniff"
      ],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "tiger": {
    "pos": "noun",
    "category": "animal",
    "number": "singular",
    "properties": [
      "animate"
    ],
    "affordances": {
      "tags": [
        "animal",
        "animate",
        "physical"
      ],
      "canDo": [
        "follow",
        "nudge",
        "sniff"
      ],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "urchin": {
    "pos": "noun",
    "category": "animal",
    "number": "singular",
    "properties": [
      "animate"
    ],
    "affordances": {
      "tags": [
        "animal",
        "animate",
        "physical"
      ],
      "canDo": [
        "follow",
        "nudge",
        "sniff"
      ],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "vulture": {
    "pos": "noun",
    "category": "animal",
    "number": "singular",
    "properties": [
      "animate"
    ],
    "affordances": {
      "tags": [
        "animal",
        "animate",
        "physical"
      ],
      "canDo": [
        "follow",
        "nudge",
        "sniff"
      ],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "wolf": {
    "pos": "noun",
    "category": "animal",
    "number": "singular",
    "properties": [
      "animate"
    ],
    "affordances": {
      "tags": [
        "animal",
        "animate",
        "physical"
      ],
      "canDo": [
        "follow",
        "nudge",
        "sniff"
      ],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "zebra": {
    "pos": "noun",
    "category": "animal",
    "number": "singular",
    "properties": [
      "animate"
    ],
    "affordances": {
      "tags": [
        "animal",
        "animate",
        "physical"
      ],
      "canDo": [
        "follow",
        "nudge",
        "sniff"
      ],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "apple": {
    "pos": "noun",
    "category": "food",
    "number": "singular",
    "properties": [
      "edible",
      "portable"
    ],
    "affordances": {
      "tags": [
        "edible",
        "physical",
        "portable",
        "rollable",
        "round",
        "small-storable"
      ],
      "canDo": [
        "bump",
        "roll"
      ],
      "canReceive": [
        "push",
        "roll"
      ],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "avocado": {
    "pos": "noun",
    "category": "food",
    "number": "singular",
    "properties": [
      "edible",
      "portable"
    ],
    "pronunciation": {
      "syllables": [
        "av",
        "o",
        "ca",
        "do"
      ],
      "shortCue": "av"
    },
    "affordances": {
      "tags": [
        "edible",
        "physical",
        "portable"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "bacon": {
    "pos": "noun",
    "category": "food",
    "number": "mass",
    "properties": [
      "edible",
      "portable"
    ],
    "affordances": {
      "tags": [
        "aromatic",
        "edible",
        "physical",
        "portable"
      ],
      "canDo": [
        "attract attention",
        "release a scent"
      ],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "banana": {
    "pos": "noun",
    "category": "food",
    "number": "singular",
    "properties": [
      "edible",
      "portable"
    ],
    "description": "a curved fruit with a peel",
    "pronunciation": {
      "syllables": [
        "ba",
        "na",
        "na"
      ],
      "shortCue": "ban"
    },
    "affordances": {
      "tags": [
        "edible",
        "physical",
        "portable",
        "small-storable"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "a curved fruit with a peel",
      "basis": "category and reviewed word properties"
    }
  },
  "cake": {
    "pos": "noun",
    "category": "food",
    "number": "singular",
    "properties": [
      "edible",
      "portable"
    ],
    "affordances": {
      "tags": [
        "edible",
        "physical",
        "portable"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "cereal": {
    "pos": "noun",
    "category": "food",
    "number": "mass",
    "properties": [
      "edible",
      "portable"
    ],
    "affordances": {
      "tags": [
        "edible",
        "physical",
        "portable"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "cheddar": {
    "pos": "noun",
    "category": "food",
    "number": "mass",
    "properties": [
      "edible",
      "portable"
    ],
    "affordances": {
      "tags": [
        "edible",
        "physical",
        "portable"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "cheese": {
    "pos": "noun",
    "category": "food",
    "number": "mass",
    "properties": [
      "edible",
      "portable"
    ],
    "affordances": {
      "tags": [
        "aromatic",
        "edible",
        "physical",
        "portable"
      ],
      "canDo": [
        "attract attention",
        "release a scent"
      ],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "chives": {
    "pos": "noun",
    "category": "food",
    "number": "plural",
    "properties": [
      "edible",
      "portable"
    ],
    "affordances": {
      "tags": [
        "edible",
        "physical",
        "portable"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "chocolate": {
    "pos": "noun",
    "category": "food",
    "number": "mass",
    "properties": [
      "edible",
      "portable"
    ],
    "affordances": {
      "tags": [
        "edible",
        "physical",
        "portable"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "coconut": {
    "pos": "noun",
    "category": "food",
    "number": "singular",
    "properties": [
      "edible",
      "portable"
    ],
    "pronunciation": {
      "syllables": [
        "co",
        "co",
        "nut"
      ],
      "shortCue": "nut"
    },
    "affordances": {
      "tags": [
        "edible",
        "physical",
        "portable",
        "rollable",
        "round"
      ],
      "canDo": [
        "bump",
        "roll"
      ],
      "canReceive": [
        "push",
        "roll"
      ],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "dough": {
    "pos": "noun",
    "category": "food",
    "number": "mass",
    "properties": [
      "edible",
      "portable"
    ],
    "affordances": {
      "tags": [
        "edible",
        "physical",
        "portable"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "egg": {
    "pos": "noun",
    "category": "food",
    "number": "singular",
    "properties": [
      "edible",
      "portable"
    ],
    "description": "a smooth shell containing a yolk",
    "affordances": {
      "tags": [
        "edible",
        "fragile",
        "physical",
        "portable",
        "rollable",
        "round"
      ],
      "canDo": [
        "bump",
        "roll"
      ],
      "canReceive": [
        "crack",
        "push",
        "roll"
      ],
      "associations": [],
      "detail": "a smooth shell containing a yolk",
      "basis": "category and reviewed word properties"
    }
  },
  "eggplant": {
    "pos": "noun",
    "category": "food",
    "number": "singular",
    "properties": [
      "edible",
      "portable"
    ],
    "affordances": {
      "tags": [
        "edible",
        "physical",
        "portable"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "food": {
    "pos": "noun",
    "category": "food",
    "number": "mass",
    "properties": [
      "edible",
      "portable"
    ],
    "affordances": {
      "tags": [
        "edible",
        "physical",
        "portable"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "fudge": {
    "pos": "noun",
    "category": "food",
    "number": "mass",
    "properties": [
      "edible",
      "portable"
    ],
    "affordances": {
      "tags": [
        "edible",
        "physical",
        "portable"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "guacamole": {
    "pos": "noun",
    "category": "food",
    "number": "mass",
    "properties": [
      "edible",
      "portable"
    ],
    "pronunciation": {
      "syllables": [
        "gua",
        "ca",
        "mo",
        "le"
      ],
      "shortCue": "guac",
      "note": "Guac keeps the recognizable opening sound; final c carries the /k/ sound associated with Q."
    },
    "affordances": {
      "tags": [
        "edible",
        "physical",
        "portable",
        "sticky"
      ],
      "canDo": [
        "coat",
        "stick"
      ],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "ham": {
    "pos": "noun",
    "category": "food",
    "number": "mass",
    "properties": [
      "edible",
      "portable"
    ],
    "affordances": {
      "tags": [
        "edible",
        "physical",
        "portable"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "honey": {
    "pos": "noun",
    "category": "food",
    "number": "mass",
    "properties": [
      "edible",
      "portable"
    ],
    "affordances": {
      "tags": [
        "edible",
        "liquid",
        "physical",
        "portable",
        "sticky"
      ],
      "canDo": [
        "coat",
        "drip",
        "flow",
        "splash",
        "stick"
      ],
      "canReceive": [
        "freeze",
        "pour",
        "spill"
      ],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "jam": {
    "pos": "noun",
    "category": "food",
    "number": "mass",
    "properties": [
      "edible",
      "portable"
    ],
    "affordances": {
      "tags": [
        "edible",
        "physical",
        "portable",
        "sticky"
      ],
      "canDo": [
        "coat",
        "stick"
      ],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "kebab": {
    "pos": "noun",
    "category": "food",
    "number": "singular",
    "properties": [
      "edible",
      "portable"
    ],
    "affordances": {
      "tags": [
        "edible",
        "physical",
        "portable"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "kiwi": {
    "pos": "noun",
    "category": "food",
    "number": "singular",
    "properties": [
      "edible",
      "portable"
    ],
    "affordances": {
      "tags": [
        "edible",
        "physical",
        "portable"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "lemon": {
    "pos": "noun",
    "category": "food",
    "number": "singular",
    "properties": [
      "edible",
      "portable"
    ],
    "description": "a yellow fruit with a sour taste",
    "pronunciation": {
      "syllables": [
        "lem",
        "on"
      ],
      "shortCue": "lem"
    },
    "affordances": {
      "tags": [
        "aromatic",
        "edible",
        "physical",
        "portable"
      ],
      "canDo": [
        "attract attention",
        "release a scent"
      ],
      "canReceive": [],
      "associations": [],
      "detail": "a yellow fruit with a sour taste",
      "basis": "category and reviewed word properties"
    }
  },
  "lettuce": {
    "pos": "noun",
    "category": "food",
    "number": "mass",
    "properties": [
      "edible",
      "portable"
    ],
    "affordances": {
      "tags": [
        "edible",
        "physical",
        "portable"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "muffin": {
    "pos": "noun",
    "category": "food",
    "number": "singular",
    "properties": [
      "edible",
      "portable"
    ],
    "affordances": {
      "tags": [
        "edible",
        "physical",
        "portable"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "mushroom": {
    "pos": "noun",
    "category": "food",
    "number": "singular",
    "properties": [
      "edible",
      "portable"
    ],
    "affordances": {
      "tags": [
        "edible",
        "physical",
        "portable"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "nachos": {
    "pos": "noun",
    "category": "food",
    "number": "plural",
    "properties": [
      "edible",
      "portable"
    ],
    "affordances": {
      "tags": [
        "edible",
        "physical",
        "portable"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "noodles": {
    "pos": "noun",
    "category": "food",
    "number": "plural",
    "properties": [
      "edible",
      "portable"
    ],
    "affordances": {
      "tags": [
        "edible",
        "physical",
        "portable"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "nuggets": {
    "pos": "noun",
    "category": "food",
    "number": "plural",
    "properties": [
      "edible",
      "portable"
    ],
    "description": "small golden pieces of food with a crisp coating",
    "pronunciation": {
      "syllables": [
        "nug",
        "gets"
      ],
      "shortCue": "nug"
    },
    "affordances": {
      "tags": [
        "edible",
        "physical",
        "portable"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "small golden pieces of food with a crisp coating",
      "basis": "category and reviewed word properties"
    }
  },
  "oatmeal": {
    "pos": "noun",
    "category": "food",
    "number": "mass",
    "properties": [
      "edible",
      "portable"
    ],
    "affordances": {
      "tags": [
        "edible",
        "physical",
        "portable"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "omelette": {
    "pos": "noun",
    "category": "food",
    "number": "singular",
    "properties": [
      "edible",
      "portable"
    ],
    "affordances": {
      "tags": [
        "edible",
        "physical",
        "portable"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "onion": {
    "pos": "noun",
    "category": "food",
    "number": "singular",
    "properties": [
      "edible",
      "portable"
    ],
    "affordances": {
      "tags": [
        "edible",
        "physical",
        "portable"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "orange": {
    "pos": "noun",
    "category": "food",
    "number": "singular",
    "properties": [
      "edible",
      "portable"
    ],
    "pronunciation": {
      "syllables": [
        "or",
        "ange"
      ],
      "shortCue": "or"
    },
    "affordances": {
      "tags": [
        "aromatic",
        "edible",
        "physical",
        "portable",
        "rollable",
        "round",
        "small-storable"
      ],
      "canDo": [
        "attract attention",
        "bump",
        "release a scent",
        "roll"
      ],
      "canReceive": [
        "push",
        "roll"
      ],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "pear": {
    "pos": "noun",
    "category": "food",
    "number": "singular",
    "properties": [
      "edible",
      "portable"
    ],
    "affordances": {
      "tags": [
        "edible",
        "physical",
        "portable"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "pie": {
    "pos": "noun",
    "category": "food",
    "number": "singular",
    "properties": [
      "edible",
      "portable"
    ],
    "affordances": {
      "tags": [
        "edible",
        "physical",
        "portable"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "pizza": {
    "pos": "noun",
    "category": "food",
    "number": "singular",
    "properties": [
      "edible",
      "portable"
    ],
    "affordances": {
      "tags": [
        "aromatic",
        "edible",
        "physical",
        "portable"
      ],
      "canDo": [
        "attract attention",
        "release a scent"
      ],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "rice": {
    "pos": "noun",
    "category": "food",
    "number": "mass",
    "properties": [
      "edible",
      "portable"
    ],
    "affordances": {
      "tags": [
        "edible",
        "physical",
        "portable"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "rye": {
    "pos": "noun",
    "category": "food",
    "number": "mass",
    "properties": [
      "edible",
      "portable"
    ],
    "affordances": {
      "tags": [
        "edible",
        "physical",
        "portable"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "sausage": {
    "pos": "noun",
    "category": "food",
    "number": "singular",
    "properties": [
      "edible",
      "portable"
    ],
    "affordances": {
      "tags": [
        "edible",
        "physical",
        "portable"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "spaghetti": {
    "pos": "noun",
    "category": "food",
    "number": "mass",
    "properties": [
      "edible",
      "portable"
    ],
    "pronunciation": {
      "syllables": [
        "spa",
        "ghet",
        "ti"
      ],
      "shortCue": "spag"
    },
    "affordances": {
      "tags": [
        "edible",
        "physical",
        "portable"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "squash": {
    "pos": "noun",
    "category": "food",
    "number": "singular",
    "properties": [
      "edible",
      "portable"
    ],
    "affordances": {
      "tags": [
        "edible",
        "physical",
        "portable"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "sushi": {
    "pos": "noun",
    "category": "food",
    "number": "mass",
    "properties": [
      "edible",
      "portable"
    ],
    "affordances": {
      "tags": [
        "edible",
        "physical",
        "portable"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "syrup": {
    "pos": "noun",
    "category": "food",
    "number": "mass",
    "properties": [
      "edible",
      "portable"
    ],
    "affordances": {
      "tags": [
        "edible",
        "liquid",
        "physical",
        "portable",
        "sticky"
      ],
      "canDo": [
        "coat",
        "drip",
        "flow",
        "splash",
        "stick"
      ],
      "canReceive": [
        "freeze",
        "pour",
        "spill"
      ],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "tofu": {
    "pos": "noun",
    "category": "food",
    "number": "mass",
    "properties": [
      "edible",
      "portable"
    ],
    "affordances": {
      "tags": [
        "edible",
        "physical",
        "portable"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "tomato": {
    "pos": "noun",
    "category": "food",
    "number": "singular",
    "properties": [
      "edible",
      "portable"
    ],
    "pronunciation": {
      "syllables": [
        "to",
        "ma",
        "to"
      ],
      "shortCue": "tom"
    },
    "affordances": {
      "tags": [
        "edible",
        "physical",
        "portable"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "vegetable": {
    "pos": "noun",
    "category": "food",
    "number": "singular",
    "properties": [
      "edible",
      "portable"
    ],
    "affordances": {
      "tags": [
        "edible",
        "physical",
        "portable"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "veggies": {
    "pos": "noun",
    "category": "food",
    "number": "plural",
    "properties": [
      "edible",
      "portable"
    ],
    "affordances": {
      "tags": [
        "edible",
        "physical",
        "portable"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "wasabi": {
    "pos": "noun",
    "category": "food",
    "number": "singular",
    "properties": [
      "edible",
      "portable"
    ],
    "affordances": {
      "tags": [
        "edible",
        "physical",
        "portable"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "watermelon": {
    "pos": "noun",
    "category": "food",
    "number": "singular",
    "properties": [
      "edible",
      "portable"
    ],
    "affordances": {
      "tags": [
        "edible",
        "physical",
        "portable"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "yam": {
    "pos": "noun",
    "category": "food",
    "number": "singular",
    "properties": [
      "edible",
      "portable"
    ],
    "affordances": {
      "tags": [
        "edible",
        "physical",
        "portable"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "yogurt": {
    "pos": "noun",
    "category": "food",
    "number": "mass",
    "properties": [
      "edible",
      "portable"
    ],
    "pronunciation": {
      "syllables": [
        "yo",
        "gurt"
      ],
      "shortCue": "yog"
    },
    "affordances": {
      "tags": [
        "edible",
        "physical",
        "portable"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "yolk": {
    "pos": "noun",
    "category": "food",
    "number": "singular",
    "properties": [
      "edible",
      "portable"
    ],
    "affordances": {
      "tags": [
        "edible",
        "physical",
        "portable"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "zucchini": {
    "pos": "noun",
    "category": "food",
    "number": "singular",
    "properties": [
      "edible",
      "portable"
    ],
    "affordances": {
      "tags": [
        "edible",
        "physical",
        "portable"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "banjo": {
    "pos": "noun",
    "category": "instrument",
    "number": "singular",
    "properties": [
      "musical",
      "portable",
      "sound"
    ],
    "description": "a string instrument with a round body",
    "affordances": {
      "tags": [
        "musical",
        "noisy",
        "physical",
        "portable",
        "sound"
      ],
      "canDo": [
        "ring",
        "startle"
      ],
      "canReceive": [
        "play",
        "silence"
      ],
      "associations": [],
      "detail": "a string instrument with a round body",
      "basis": "category and reviewed word properties"
    }
  },
  "guitar": {
    "pos": "noun",
    "category": "instrument",
    "number": "singular",
    "properties": [
      "musical",
      "portable",
      "sound"
    ],
    "description": "a musical instrument with strings that vibrate",
    "affordances": {
      "tags": [
        "musical",
        "noisy",
        "physical",
        "portable",
        "sound"
      ],
      "canDo": [
        "ring",
        "startle"
      ],
      "canReceive": [
        "play",
        "silence"
      ],
      "associations": [],
      "detail": "a musical instrument with strings that vibrate",
      "basis": "category and reviewed word properties"
    }
  },
  "kazoo": {
    "pos": "noun",
    "category": "instrument",
    "number": "singular",
    "properties": [
      "musical",
      "portable",
      "sound"
    ],
    "description": "a small instrument that buzzes when hummed into",
    "affordances": {
      "tags": [
        "musical",
        "noisy",
        "physical",
        "portable",
        "sound"
      ],
      "canDo": [
        "ring",
        "startle"
      ],
      "canReceive": [
        "play",
        "silence"
      ],
      "associations": [],
      "detail": "a small instrument that buzzes when hummed into",
      "basis": "category and reviewed word properties"
    }
  },
  "saxophone": {
    "pos": "noun",
    "category": "instrument",
    "number": "singular",
    "properties": [
      "musical",
      "portable",
      "sound"
    ],
    "description": "a curved brass wind instrument with shiny keys",
    "pronunciation": {
      "syllables": [
        "sax",
        "o",
        "phone"
      ],
      "shortCue": "sax"
    },
    "affordances": {
      "tags": [
        "musical",
        "noisy",
        "physical",
        "portable",
        "sound"
      ],
      "canDo": [
        "ring",
        "startle"
      ],
      "canReceive": [
        "play",
        "silence"
      ],
      "associations": [
        "keys",
        "mouthpiece"
      ],
      "detail": "a curved brass wind instrument with shiny keys",
      "basis": "category and reviewed word properties"
    }
  },
  "viola": {
    "pos": "noun",
    "category": "instrument",
    "number": "singular",
    "properties": [
      "musical",
      "portable",
      "sound"
    ],
    "description": "a bowed string instrument",
    "affordances": {
      "tags": [
        "musical",
        "noisy",
        "physical",
        "portable",
        "sound"
      ],
      "canDo": [
        "ring",
        "startle"
      ],
      "canReceive": [
        "play",
        "silence"
      ],
      "associations": [],
      "detail": "a bowed string instrument",
      "basis": "category and reviewed word properties"
    }
  },
  "xylophone": {
    "pos": "noun",
    "category": "instrument",
    "number": "singular",
    "properties": [
      "musical",
      "portable",
      "sound"
    ],
    "description": "a row of bars that ring when tapped",
    "pronunciation": {
      "syllables": [
        "xy",
        "lo",
        "phone"
      ],
      "shortCue": "zile"
    },
    "affordances": {
      "tags": [
        "musical",
        "noisy",
        "physical",
        "portable",
        "sound"
      ],
      "canDo": [
        "ring",
        "startle"
      ],
      "canReceive": [
        "play",
        "silence"
      ],
      "associations": [],
      "detail": "a row of bars that ring when tapped",
      "basis": "category and reviewed word properties"
    }
  },
  "backpack": {
    "pos": "noun",
    "category": "container",
    "number": "singular",
    "properties": [
      "container",
      "portable"
    ],
    "description": "a bag worn on the back",
    "affordances": {
      "tags": [
        "container",
        "physical",
        "portable"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "a bag worn on the back",
      "basis": "category and reviewed word properties"
    }
  },
  "bag": {
    "pos": "noun",
    "category": "container",
    "number": "singular",
    "properties": [
      "container",
      "portable"
    ],
    "affordances": {
      "tags": [
        "container",
        "physical",
        "portable"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "box": {
    "pos": "noun",
    "category": "container",
    "number": "singular",
    "properties": [
      "container",
      "portable"
    ],
    "description": "a container with sides and a lid",
    "affordances": {
      "tags": [
        "container",
        "physical",
        "portable",
        "storage"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "a container with sides and a lid",
      "basis": "category and reviewed word properties"
    }
  },
  "can": {
    "pos": "noun",
    "category": "container",
    "number": "singular",
    "properties": [
      "container",
      "portable"
    ],
    "affordances": {
      "tags": [
        "container",
        "physical",
        "portable",
        "vessel"
      ],
      "canDo": [
        "hold",
        "overflow"
      ],
      "canReceive": [
        "empty",
        "fill"
      ],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "cup": {
    "pos": "noun",
    "category": "container",
    "number": "singular",
    "properties": [
      "container",
      "portable"
    ],
    "affordances": {
      "tags": [
        "container",
        "knockable",
        "physical",
        "portable",
        "vessel"
      ],
      "canDo": [
        "hold",
        "overflow"
      ],
      "canReceive": [
        "empty",
        "fill"
      ],
      "associations": [],
      "detail": "a rim and a hollow bowl",
      "basis": "category and reviewed word properties"
    }
  },
  "envelope": {
    "pos": "noun",
    "category": "container",
    "number": "singular",
    "properties": [
      "container",
      "portable"
    ],
    "pronunciation": {
      "syllables": [
        "en",
        "ve",
        "lope"
      ],
      "shortCue": "lope"
    },
    "affordances": {
      "tags": [
        "absorbent",
        "container",
        "light",
        "paper",
        "physical",
        "portable"
      ],
      "canDo": [
        "drip when wet",
        "soak up liquid"
      ],
      "canReceive": [
        "fold",
        "soak",
        "squeeze"
      ],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "jar": {
    "pos": "noun",
    "category": "container",
    "number": "singular",
    "properties": [
      "container",
      "portable"
    ],
    "description": "a wide-mouthed container",
    "affordances": {
      "tags": [
        "container",
        "knockable",
        "physical",
        "portable",
        "vessel"
      ],
      "canDo": [
        "hold",
        "overflow"
      ],
      "canReceive": [
        "empty",
        "fill"
      ],
      "associations": [],
      "detail": "a wide opening",
      "basis": "category and reviewed word properties"
    }
  },
  "pot": {
    "pos": "noun",
    "category": "container",
    "number": "singular",
    "properties": [
      "container",
      "portable"
    ],
    "affordances": {
      "tags": [
        "container",
        "physical",
        "portable",
        "vessel"
      ],
      "canDo": [
        "hold",
        "overflow"
      ],
      "canReceive": [
        "empty",
        "fill"
      ],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "vase": {
    "pos": "noun",
    "category": "container",
    "number": "singular",
    "properties": [
      "container",
      "portable"
    ],
    "affordances": {
      "tags": [
        "container",
        "fragile",
        "knockable",
        "physical",
        "portable",
        "vessel"
      ],
      "canDo": [
        "hold",
        "overflow"
      ],
      "canReceive": [
        "crack",
        "empty",
        "fill"
      ],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "aeroplane": {
    "pos": "noun",
    "category": "vehicle",
    "number": "singular",
    "properties": [],
    "description": "a flying vehicle with fixed wings",
    "operator": "pilot",
    "affordances": {
      "tags": [
        "physical",
        "vehicle"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "a flying vehicle with fixed wings",
      "basis": "category and reviewed word properties"
    }
  },
  "bike": {
    "pos": "noun",
    "category": "vehicle",
    "number": "singular",
    "properties": [],
    "description": "a vehicle with two wheels and pedals",
    "operator": "rider",
    "affordances": {
      "tags": [
        "physical",
        "vehicle"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "a vehicle with two wheels and pedals",
      "basis": "category and reviewed word properties"
    }
  },
  "bus": {
    "pos": "noun",
    "category": "vehicle",
    "number": "singular",
    "properties": [],
    "operator": "driver",
    "affordances": {
      "tags": [
        "physical",
        "vehicle"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "car": {
    "pos": "noun",
    "category": "vehicle",
    "number": "singular",
    "properties": [],
    "description": "a vehicle with four wheels",
    "operator": "driver",
    "affordances": {
      "tags": [
        "physical",
        "vehicle"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "a vehicle with four wheels",
      "basis": "category and reviewed word properties"
    }
  },
  "helicopter": {
    "pos": "noun",
    "category": "vehicle",
    "number": "singular",
    "properties": [],
    "description": "a flying vehicle with spinning blades",
    "operator": "pilot",
    "affordances": {
      "tags": [
        "physical",
        "vehicle"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "a flying vehicle with spinning blades",
      "basis": "category and reviewed word properties"
    }
  },
  "jeep": {
    "pos": "noun",
    "category": "vehicle",
    "number": "singular",
    "properties": [],
    "operator": "driver",
    "affordances": {
      "tags": [
        "physical",
        "vehicle"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "jet": {
    "pos": "noun",
    "category": "vehicle",
    "number": "singular",
    "properties": [],
    "affordances": {
      "tags": [
        "physical",
        "vehicle"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "kayak": {
    "pos": "noun",
    "category": "vehicle",
    "number": "singular",
    "properties": [],
    "operator": "paddler",
    "affordances": {
      "tags": [
        "physical",
        "vehicle"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "taxi": {
    "pos": "noun",
    "category": "vehicle",
    "number": "singular",
    "properties": [],
    "operator": "driver",
    "affordances": {
      "tags": [
        "physical",
        "vehicle"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "ufo": {
    "pos": "noun",
    "category": "vehicle",
    "number": "singular",
    "properties": [],
    "affordances": {
      "tags": [
        "physical",
        "vehicle"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "unicycle": {
    "pos": "noun",
    "category": "vehicle",
    "number": "singular",
    "properties": [],
    "operator": "rider",
    "affordances": {
      "tags": [
        "physical",
        "vehicle"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "van": {
    "pos": "noun",
    "category": "vehicle",
    "number": "singular",
    "properties": [],
    "operator": "driver",
    "affordances": {
      "tags": [
        "physical",
        "vehicle"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "vehicle": {
    "pos": "noun",
    "category": "vehicle",
    "number": "singular",
    "properties": [],
    "affordances": {
      "tags": [
        "physical",
        "vehicle"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "yacht": {
    "pos": "noun",
    "category": "vehicle",
    "number": "singular",
    "properties": [],
    "description": "a boat with a deck",
    "operator": "captain",
    "affordances": {
      "tags": [
        "physical",
        "vehicle"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "a boat with a deck",
      "basis": "category and reviewed word properties"
    }
  },
  "cave": {
    "pos": "noun",
    "category": "place",
    "number": "singular",
    "properties": [],
    "affordances": {
      "tags": [
        "place"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "gym": {
    "pos": "noun",
    "category": "place",
    "number": "singular",
    "properties": [],
    "affordances": {
      "tags": [
        "place"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "headquarters": {
    "pos": "noun",
    "category": "place",
    "number": "singular",
    "properties": [],
    "affordances": {
      "tags": [
        "place"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "hut": {
    "pos": "noun",
    "category": "place",
    "number": "singular",
    "properties": [],
    "affordances": {
      "tags": [
        "place"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "inn": {
    "pos": "noun",
    "category": "place",
    "number": "singular",
    "properties": [],
    "affordances": {
      "tags": [
        "place"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "kitchen": {
    "pos": "noun",
    "category": "place",
    "number": "singular",
    "properties": [],
    "affordances": {
      "tags": [
        "place"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "lake": {
    "pos": "noun",
    "category": "place",
    "number": "singular",
    "properties": [],
    "description": "a large body of water surrounded by land",
    "affordances": {
      "tags": [
        "place"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "a large body of water surrounded by land",
      "basis": "category and reviewed word properties"
    }
  },
  "lighthouse": {
    "pos": "noun",
    "category": "place",
    "number": "singular",
    "properties": [],
    "description": "a tall tower with a bright guiding light",
    "pronunciation": {
      "syllables": [
        "light",
        "house"
      ],
      "shortCue": "light"
    },
    "affordances": {
      "tags": [
        "place"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "a tall tower with a bright guiding light",
      "basis": "category and reviewed word properties"
    }
  },
  "mountain": {
    "pos": "noun",
    "category": "place",
    "number": "singular",
    "properties": [],
    "affordances": {
      "tags": [
        "place"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "office": {
    "pos": "noun",
    "category": "place",
    "number": "singular",
    "properties": [],
    "affordances": {
      "tags": [
        "place"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "river": {
    "pos": "noun",
    "category": "place",
    "number": "singular",
    "properties": [],
    "description": "a flowing stream of water",
    "affordances": {
      "tags": [
        "place"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "a flowing stream of water",
      "basis": "category and reviewed word properties"
    }
  },
  "sea": {
    "pos": "noun",
    "category": "place",
    "number": "singular",
    "properties": [],
    "affordances": {
      "tags": [
        "place"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "tent": {
    "pos": "noun",
    "category": "place",
    "number": "singular",
    "properties": [],
    "description": "a fabric shelter",
    "affordances": {
      "tags": [
        "place"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "a fabric shelter",
      "basis": "category and reviewed word properties"
    }
  },
  "volcano": {
    "pos": "noun",
    "category": "place",
    "number": "singular",
    "properties": [],
    "description": "a mountain with an opening for hot rock",
    "pronunciation": {
      "syllables": [
        "vol",
        "ca",
        "no"
      ],
      "shortCue": "vol"
    },
    "affordances": {
      "tags": [
        "place"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "a mountain with an opening for hot rock",
      "basis": "category and reviewed word properties"
    }
  },
  "zoo": {
    "pos": "noun",
    "category": "place",
    "number": "singular",
    "properties": [],
    "description": "a place with animal enclosures",
    "affordances": {
      "tags": [
        "place"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "a place with animal enclosures",
      "basis": "category and reviewed word properties"
    }
  },
  "aa battery": {
    "pos": "noun",
    "category": "object",
    "number": "singular",
    "properties": [],
    "description": "a small cylindrical battery with metal terminals",
    "affordances": {
      "tags": [
        "physical",
        "portable",
        "rollable",
        "cylindrical",
        "power-source"
      ],
      "canDo": [
        "roll",
        "power"
      ],
      "canReceive": [
        "insert",
        "charge"
      ],
      "associations": [
        "battery compartment",
        "positive terminal"
      ],
      "detail": "a small cylindrical battery with metal terminals",
      "basis": "reviewed physical properties and mnemonic representation"
    }
  },
  "ball": {
    "pos": "noun",
    "category": "object",
    "number": "singular",
    "properties": [
      "portable"
    ],
    "affordances": {
      "tags": [
        "physical",
        "portable",
        "rollable",
        "round"
      ],
      "canDo": [
        "bump",
        "roll"
      ],
      "canReceive": [
        "push",
        "roll"
      ],
      "associations": [],
      "detail": "a smoothly rolling surface",
      "basis": "category and reviewed word properties"
    }
  },
  "bed": {
    "pos": "noun",
    "category": "object",
    "number": "singular",
    "properties": [],
    "description": "a padded place to sleep",
    "affordances": {
      "tags": [
        "physical"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "a padded place to sleep",
      "basis": "category and reviewed word properties"
    }
  },
  "blindfold": {
    "pos": "noun",
    "category": "object",
    "number": "singular",
    "properties": [
      "wearable"
    ],
    "affordances": {
      "tags": [
        "absorbent",
        "fabric",
        "physical",
        "wearable"
      ],
      "canDo": [
        "drip when wet",
        "soak up liquid"
      ],
      "canReceive": [
        "snag",
        "soak",
        "squeeze",
        "wear"
      ],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "book": {
    "pos": "noun",
    "category": "object",
    "number": "singular",
    "properties": [
      "portable"
    ],
    "description": "a stack of bound pages that can be opened",
    "affordances": {
      "tags": [
        "absorbent",
        "paper",
        "physical",
        "portable"
      ],
      "canDo": [
        "drip when wet",
        "soak up liquid"
      ],
      "canReceive": [
        "fold",
        "soak",
        "squeeze"
      ],
      "associations": [],
      "detail": "a stack of bound pages that can be opened",
      "basis": "category and reviewed word properties"
    }
  },
  "car jack": {
    "pos": "noun",
    "category": "object",
    "number": "singular",
    "properties": [],
    "affordances": {
      "tags": [
        "mechanical",
        "metal",
        "physical"
      ],
      "canDo": [
        "catch fabric",
        "turn"
      ],
      "canReceive": [
        "magnetize"
      ],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "cd": {
    "pos": "noun",
    "category": "object",
    "number": "singular",
    "properties": [],
    "affordances": {
      "tags": [
        "physical"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "chair": {
    "pos": "noun",
    "category": "object",
    "number": "singular",
    "properties": [],
    "description": "a seat with a back",
    "affordances": {
      "tags": [
        "physical"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "a seat with a back",
      "basis": "category and reviewed word properties"
    }
  },
  "cog": {
    "pos": "noun",
    "category": "object",
    "number": "singular",
    "properties": [
      "portable"
    ],
    "description": "a wheel whose teeth fit into another wheel",
    "affordances": {
      "tags": [
        "mechanical",
        "metal",
        "physical",
        "portable"
      ],
      "canDo": [
        "catch fabric",
        "turn"
      ],
      "canReceive": [
        "magnetize"
      ],
      "associations": [
        "teeth",
        "axle"
      ],
      "detail": "interlocking metal teeth",
      "basis": "category and reviewed word properties"
    }
  },
  "cube": {
    "pos": "noun",
    "category": "object",
    "number": "singular",
    "properties": [
      "portable"
    ],
    "affordances": {
      "tags": [
        "physical",
        "portable"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "diamond": {
    "pos": "noun",
    "category": "object",
    "number": "singular",
    "properties": [],
    "affordances": {
      "tags": [
        "physical",
        "round"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "dice": {
    "pos": "noun",
    "category": "object",
    "number": "plural",
    "properties": [],
    "affordances": {
      "tags": [
        "physical",
        "round"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "doll": {
    "pos": "noun",
    "category": "object",
    "number": "singular",
    "properties": [
      "portable"
    ],
    "description": "a small figure shaped like a person",
    "affordances": {
      "tags": [
        "knockable",
        "physical",
        "portable"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "a small figure shaped like a person",
      "basis": "category and reviewed word properties"
    }
  },
  "fan": {
    "pos": "noun",
    "category": "object",
    "number": "singular",
    "properties": [],
    "affordances": {
      "tags": [
        "physical"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "fork": {
    "pos": "noun",
    "category": "object",
    "number": "singular",
    "properties": [
      "portable"
    ],
    "affordances": {
      "tags": [
        "metal",
        "physical",
        "portable"
      ],
      "canDo": [],
      "canReceive": [
        "magnetize"
      ],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "fossil": {
    "pos": "noun",
    "category": "object",
    "number": "singular",
    "properties": [],
    "affordances": {
      "tags": [
        "physical"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "globe": {
    "pos": "noun",
    "category": "object",
    "number": "singular",
    "properties": [],
    "description": "a ball showing a map of the world",
    "affordances": {
      "tags": [
        "physical",
        "rollable",
        "round"
      ],
      "canDo": [
        "bump",
        "roll"
      ],
      "canReceive": [
        "push",
        "roll"
      ],
      "associations": [],
      "detail": "a ball showing a map of the world",
      "basis": "category and reviewed word properties"
    }
  },
  "hat": {
    "pos": "noun",
    "category": "object",
    "number": "singular",
    "properties": [
      "portable",
      "wearable"
    ],
    "affordances": {
      "tags": [
        "absorbent",
        "fabric",
        "physical",
        "portable",
        "wearable"
      ],
      "canDo": [
        "drip when wet",
        "soak up liquid"
      ],
      "canReceive": [
        "snag",
        "soak",
        "squeeze",
        "wear"
      ],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "ice skates": {
    "pos": "noun",
    "category": "object",
    "number": "plural",
    "properties": [],
    "affordances": {
      "tags": [
        "physical"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "id card": {
    "pos": "noun",
    "category": "object",
    "number": "singular",
    "properties": [],
    "affordances": {
      "tags": [
        "physical"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "key": {
    "pos": "noun",
    "category": "object",
    "number": "singular",
    "properties": [
      "portable"
    ],
    "description": "a small shaped piece of metal that opens a lock",
    "affordances": {
      "tags": [
        "metal",
        "physical",
        "portable",
        "small-storable"
      ],
      "canDo": [],
      "canReceive": [
        "magnetize"
      ],
      "associations": [],
      "detail": "a small shaped piece of metal that opens a lock",
      "basis": "category and reviewed word properties"
    }
  },
  "keyboard (qwerty)": {
    "pos": "noun",
    "category": "object",
    "number": "singular",
    "properties": [
      "sound"
    ],
    "description": "a board of letter keys that click when pressed",
    "pronunciation": {
      "syllables": [
        "key",
        "board"
      ],
      "shortCue": "key"
    },
    "affordances": {
      "tags": [
        "electronic",
        "keyed",
        "physical",
        "sound"
      ],
      "canDo": [
        "click",
        "jam when sticky",
        "light up"
      ],
      "canReceive": [
        "splash",
        "switch on",
        "type on"
      ],
      "associations": [
        "keys",
        "computer"
      ],
      "detail": "rows of clicking letter keys",
      "basis": "category and reviewed word properties"
    }
  },
  "kite": {
    "pos": "noun",
    "category": "object",
    "number": "singular",
    "properties": [],
    "description": "a lightweight shape that flies on a string",
    "affordances": {
      "tags": [
        "physical"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "a lightweight shape that flies on a string",
      "basis": "category and reviewed word properties"
    }
  },
  "ladder": {
    "pos": "noun",
    "category": "object",
    "number": "singular",
    "properties": [
      "climbable"
    ],
    "description": "a frame with steps for climbing",
    "affordances": {
      "tags": [
        "physical",
        "wooden",
        "climbable",
        "tall"
      ],
      "canDo": [],
      "canReceive": [
        "climb",
        "lean"
      ],
      "associations": [
        "rungs",
        "top",
        "height"
      ],
      "detail": "a frame with steps for climbing",
      "basis": "category and reviewed word properties"
    }
  },
  "leaf": {
    "pos": "noun",
    "category": "object",
    "number": "singular",
    "properties": [],
    "affordances": {
      "tags": [
        "light",
        "physical",
        "plant"
      ],
      "canDo": [
        "sway"
      ],
      "canReceive": [
        "water"
      ],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "lego": {
    "pos": "noun",
    "category": "object",
    "number": "singular",
    "properties": [],
    "affordances": {
      "tags": [
        "physical"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "log": {
    "pos": "noun",
    "category": "object",
    "number": "singular",
    "properties": [],
    "affordances": {
      "tags": [
        "physical",
        "wooden"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "magazine": {
    "pos": "noun",
    "category": "object",
    "number": "singular",
    "properties": [],
    "affordances": {
      "tags": [
        "paper",
        "physical"
      ],
      "canDo": [],
      "canReceive": [
        "fold",
        "soak"
      ],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "mirror": {
    "pos": "noun",
    "category": "object",
    "number": "singular",
    "properties": [],
    "description": "a surface that reflects an image",
    "affordances": {
      "tags": [
        "fragile",
        "physical"
      ],
      "canDo": [],
      "canReceive": [
        "crack"
      ],
      "associations": [],
      "detail": "a surface that reflects an image",
      "basis": "category and reviewed word properties"
    }
  },
  "nail": {
    "pos": "noun",
    "category": "object",
    "number": "singular",
    "properties": [],
    "affordances": {
      "tags": [
        "physical"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "net": {
    "pos": "noun",
    "category": "object",
    "number": "singular",
    "properties": [],
    "affordances": {
      "tags": [
        "physical"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "newspaper": {
    "pos": "noun",
    "category": "object",
    "number": "singular",
    "properties": [],
    "affordances": {
      "tags": [
        "absorbent",
        "paper",
        "physical"
      ],
      "canDo": [
        "drip when wet",
        "soak up liquid"
      ],
      "canReceive": [
        "fold",
        "soak",
        "squeeze"
      ],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "notebook": {
    "pos": "noun",
    "category": "object",
    "number": "singular",
    "properties": [],
    "affordances": {
      "tags": [
        "absorbent",
        "paper",
        "physical"
      ],
      "canDo": [
        "drip when wet",
        "soak up liquid"
      ],
      "canReceive": [
        "fold",
        "soak",
        "squeeze"
      ],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "oxford dictionary": {
    "pos": "noun",
    "category": "object",
    "number": "singular",
    "properties": [],
    "affordances": {
      "tags": [
        "physical"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "phone": {
    "pos": "noun",
    "category": "object",
    "number": "singular",
    "properties": [
      "portable"
    ],
    "description": "a handheld device that can ring",
    "affordances": {
      "tags": [
        "electronic",
        "noisy",
        "physical",
        "portable"
      ],
      "canDo": [
        "light up",
        "ring",
        "startle"
      ],
      "canReceive": [
        "play",
        "silence",
        "splash",
        "switch on"
      ],
      "associations": [],
      "detail": "a handheld device that can ring",
      "basis": "category and reviewed word properties"
    }
  },
  "pixel": {
    "pos": "noun",
    "category": "object",
    "number": "singular",
    "properties": [
      "portable"
    ],
    "description": "a tiny colored square in a digital image",
    "affordances": {
      "tags": [
        "physical",
        "portable"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "a tiny colored square in a digital image",
      "basis": "category and reviewed word properties"
    }
  },
  "plunger": {
    "pos": "noun",
    "category": "object",
    "number": "singular",
    "properties": [],
    "affordances": {
      "tags": [
        "physical"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "q-tip": {
    "pos": "noun",
    "category": "object",
    "number": "singular",
    "properties": [],
    "affordances": {
      "tags": [
        "physical"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "quartz": {
    "pos": "noun",
    "category": "object",
    "number": "singular",
    "properties": [],
    "affordances": {
      "tags": [
        "physical"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "quill": {
    "pos": "noun",
    "category": "object",
    "number": "singular",
    "properties": [],
    "affordances": {
      "tags": [
        "physical"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "racquet": {
    "pos": "noun",
    "category": "object",
    "number": "singular",
    "properties": [],
    "pronunciation": {
      "syllables": [
        "rac",
        "quet"
      ],
      "shortCue": "rack",
      "note": "Rack preserves the opening sound; ck carries the /k/ sound written qu in racquet."
    },
    "affordances": {
      "tags": [
        "physical"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "remote": {
    "pos": "noun",
    "category": "object",
    "number": "singular",
    "properties": [],
    "affordances": {
      "tags": [
        "electronic",
        "physical"
      ],
      "canDo": [
        "light up"
      ],
      "canReceive": [
        "splash",
        "switch on"
      ],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "rock": {
    "pos": "noun",
    "category": "object",
    "number": "singular",
    "properties": [
      "portable"
    ],
    "description": "a hard piece of stone",
    "affordances": {
      "tags": [
        "physical",
        "portable"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "a hard piece of stone",
      "basis": "category and reviewed word properties"
    }
  },
  "rope": {
    "pos": "noun",
    "category": "object",
    "number": "singular",
    "properties": [
      "portable"
    ],
    "description": "a long flexible cord",
    "affordances": {
      "tags": [
        "flexible",
        "physical",
        "portable"
      ],
      "canDo": [
        "tangle",
        "wrap"
      ],
      "canReceive": [
        "stretch",
        "tie"
      ],
      "associations": [],
      "detail": "a long flexible cord",
      "basis": "category and reviewed word properties"
    }
  },
  "rose": {
    "pos": "noun",
    "category": "object",
    "number": "singular",
    "properties": [
      "portable"
    ],
    "description": "a flower with layered petals",
    "affordances": {
      "tags": [
        "aromatic",
        "physical",
        "plant",
        "portable"
      ],
      "canDo": [
        "attract attention",
        "release a scent",
        "sway"
      ],
      "canReceive": [
        "water"
      ],
      "associations": [],
      "detail": "a flower with layered petals",
      "basis": "category and reviewed word properties"
    }
  },
  "ruby": {
    "pos": "noun",
    "category": "object",
    "number": "singular",
    "properties": [],
    "affordances": {
      "tags": [
        "physical"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "rug": {
    "pos": "noun",
    "category": "object",
    "number": "singular",
    "properties": [],
    "affordances": {
      "tags": [
        "absorbent",
        "fabric",
        "physical",
        "soft"
      ],
      "canDo": [
        "drip when wet",
        "soak up liquid"
      ],
      "canReceive": [
        "snag",
        "soak",
        "squeeze",
        "wear"
      ],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "safe": {
    "pos": "noun",
    "category": "container",
    "number": "singular",
    "properties": [
      "container"
    ],
    "affordances": {
      "tags": [
        "physical",
        "container",
        "storage",
        "heavy"
      ],
      "canDo": [
        "contain",
        "protect"
      ],
      "canReceive": [
        "unlock",
        "open"
      ],
      "associations": [
        "combination lock",
        "door",
        "valuables"
      ],
      "detail": "a heavy lockable storage box with a door",
      "basis": "category and reviewed word properties"
    },
    "description": "a heavy lockable storage box with a door"
  },
  "scissors": {
    "pos": "noun",
    "category": "object",
    "number": "plural",
    "properties": [],
    "affordances": {
      "tags": [
        "physical"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "sd card": {
    "pos": "noun",
    "category": "object",
    "number": "singular",
    "properties": [],
    "affordances": {
      "tags": [
        "physical"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "soap": {
    "pos": "noun",
    "category": "object",
    "number": "singular",
    "properties": [
      "portable"
    ],
    "affordances": {
      "tags": [
        "physical",
        "portable"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "sock": {
    "pos": "noun",
    "category": "object",
    "number": "singular",
    "properties": [
      "portable",
      "wearable"
    ],
    "affordances": {
      "tags": [
        "absorbent",
        "fabric",
        "flexible",
        "physical",
        "portable",
        "soft",
        "wearable"
      ],
      "canDo": [
        "drip when wet",
        "soak up liquid",
        "tangle",
        "wrap"
      ],
      "canReceive": [
        "snag",
        "soak",
        "squeeze",
        "stretch",
        "tie",
        "wear"
      ],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "tape": {
    "pos": "noun",
    "category": "object",
    "number": "singular",
    "properties": [],
    "affordances": {
      "tags": [
        "physical"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "teddy bear": {
    "pos": "noun",
    "category": "object",
    "number": "singular",
    "properties": [
      "portable"
    ],
    "description": "a soft stuffed bear with fuzzy paws",
    "pronunciation": {
      "syllables": [
        "ted",
        "dy",
        "bear"
      ],
      "shortCue": "bear"
    },
    "affordances": {
      "tags": [
        "absorbent",
        "fabric",
        "physical",
        "portable",
        "soft"
      ],
      "canDo": [
        "drip when wet",
        "soak up liquid"
      ],
      "canReceive": [
        "snag",
        "soak",
        "squeeze",
        "wear"
      ],
      "associations": [
        "fuzzy paws",
        "stuffing"
      ],
      "detail": "fuzzy fabric and soft stuffing",
      "basis": "category and reviewed word properties"
    }
  },
  "tie": {
    "pos": "noun",
    "category": "object",
    "number": "singular",
    "properties": [
      "wearable"
    ],
    "affordances": {
      "tags": [
        "fabric",
        "flexible",
        "physical",
        "wearable"
      ],
      "canDo": [
        "tangle",
        "wrap"
      ],
      "canReceive": [
        "snag",
        "soak",
        "stretch",
        "tie",
        "wear"
      ],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "toilet paper": {
    "pos": "noun",
    "category": "object",
    "number": "singular",
    "properties": [],
    "affordances": {
      "tags": [
        "physical"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "towel": {
    "pos": "noun",
    "category": "object",
    "number": "singular",
    "properties": [],
    "affordances": {
      "tags": [
        "absorbent",
        "fabric",
        "physical",
        "soft"
      ],
      "canDo": [
        "drip when wet",
        "soak up liquid"
      ],
      "canReceive": [
        "snag",
        "soak",
        "squeeze",
        "wear"
      ],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "toy": {
    "pos": "noun",
    "category": "object",
    "number": "singular",
    "properties": [
      "portable"
    ],
    "description": "an object made for play",
    "affordances": {
      "tags": [
        "knockable",
        "physical",
        "portable",
        "small-storable"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "an object made for play",
      "basis": "category and reviewed word properties"
    }
  },
  "umbrella": {
    "pos": "noun",
    "category": "object",
    "number": "singular",
    "properties": [],
    "description": "a folding canopy that keeps rain away",
    "pronunciation": {
      "syllables": [
        "um",
        "brel",
        "la"
      ],
      "shortCue": "brel"
    },
    "affordances": {
      "tags": [
        "physical"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "a folding canopy that keeps rain away",
      "basis": "category and reviewed word properties"
    }
  },
  "watch": {
    "pos": "noun",
    "category": "object",
    "number": "singular",
    "properties": [
      "portable"
    ],
    "description": "a small timepiece",
    "affordances": {
      "tags": [
        "mechanical",
        "metal",
        "physical",
        "portable"
      ],
      "canDo": [
        "catch fabric",
        "turn"
      ],
      "canReceive": [
        "magnetize"
      ],
      "associations": [],
      "detail": "a small timepiece",
      "basis": "category and reviewed word properties"
    }
  },
  "wig": {
    "pos": "noun",
    "category": "object",
    "number": "singular",
    "properties": [
      "portable",
      "wearable"
    ],
    "affordances": {
      "tags": [
        "absorbent",
        "hair",
        "headwear",
        "physical",
        "portable",
        "tangleable",
        "wearable"
      ],
      "canDo": [
        "drip when wet",
        "soak up liquid",
        "catch"
      ],
      "canReceive": [
        "soak",
        "squeeze",
        "tangle"
      ],
      "associations": [
        "strands",
        "head"
      ],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "wok": {
    "pos": "noun",
    "category": "object",
    "number": "singular",
    "properties": [],
    "affordances": {
      "tags": [
        "physical"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "yo-yo": {
    "pos": "noun",
    "category": "object",
    "number": "singular",
    "properties": [
      "portable"
    ],
    "affordances": {
      "tags": [
        "physical",
        "portable"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "yoyo": {
    "pos": "noun",
    "category": "object",
    "number": "singular",
    "properties": [
      "portable"
    ],
    "affordances": {
      "tags": [
        "physical",
        "portable"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "zipper": {
    "pos": "noun",
    "category": "object",
    "number": "singular",
    "properties": [],
    "affordances": {
      "tags": [
        "physical"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "aorta": {
    "pos": "noun",
    "category": "body",
    "number": "singular",
    "properties": [],
    "affordances": {
      "tags": [
        "body",
        "physical"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "cheek": {
    "pos": "noun",
    "category": "body",
    "number": "singular",
    "properties": [],
    "affordances": {
      "tags": [
        "body",
        "physical"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "chin": {
    "pos": "noun",
    "category": "body",
    "number": "singular",
    "properties": [],
    "affordances": {
      "tags": [
        "body",
        "physical"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "ear": {
    "pos": "noun",
    "category": "body",
    "number": "singular",
    "properties": [],
    "affordances": {
      "tags": [
        "body",
        "physical"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "eye": {
    "pos": "noun",
    "category": "body",
    "number": "singular",
    "properties": [],
    "affordances": {
      "tags": [
        "body",
        "physical"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "eyeball": {
    "pos": "noun",
    "category": "body",
    "number": "singular",
    "properties": [],
    "affordances": {
      "tags": [
        "body",
        "physical"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "face": {
    "pos": "noun",
    "category": "body",
    "number": "singular",
    "properties": [],
    "description": "the front of a head, with eyes, a nose and a mouth",
    "affordances": {
      "tags": [
        "body",
        "physical"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "the front of a head, with eyes, a nose and a mouth",
      "basis": "category and reviewed word properties"
    }
  },
  "feet": {
    "pos": "noun",
    "category": "body",
    "number": "plural",
    "properties": [],
    "affordances": {
      "tags": [
        "body",
        "physical"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "hair": {
    "pos": "noun",
    "category": "body",
    "number": "singular",
    "properties": [],
    "affordances": {
      "tags": [
        "body",
        "hair",
        "physical",
        "tangleable"
      ],
      "canDo": [
        "catch"
      ],
      "canReceive": [
        "tangle"
      ],
      "associations": [
        "strands",
        "head"
      ],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "head": {
    "pos": "noun",
    "category": "body",
    "number": "singular",
    "properties": [],
    "affordances": {
      "tags": [
        "body",
        "physical"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "knee": {
    "pos": "noun",
    "category": "body",
    "number": "singular",
    "properties": [],
    "affordances": {
      "tags": [
        "body",
        "physical"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "lips": {
    "pos": "noun",
    "category": "body",
    "number": "plural",
    "properties": [],
    "affordances": {
      "tags": [
        "body",
        "physical"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "navel": {
    "pos": "noun",
    "category": "body",
    "number": "singular",
    "properties": [],
    "affordances": {
      "tags": [
        "body",
        "physical"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "tail": {
    "pos": "noun",
    "category": "body",
    "number": "singular",
    "properties": [],
    "affordances": {
      "tags": [
        "body",
        "physical"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "toe": {
    "pos": "noun",
    "category": "body",
    "number": "singular",
    "properties": [],
    "affordances": {
      "tags": [
        "body",
        "physical"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "ash": {
    "pos": "noun",
    "category": "substance",
    "number": "mass",
    "properties": [],
    "affordances": {
      "tags": [
        "substance"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "foam": {
    "pos": "noun",
    "category": "substance",
    "number": "mass",
    "properties": [],
    "description": "a mass of tiny bubbles",
    "affordances": {
      "tags": [
        "substance"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "a mass of tiny bubbles",
      "basis": "category and reviewed word properties"
    }
  },
  "gas": {
    "pos": "noun",
    "category": "substance",
    "number": "mass",
    "properties": [],
    "affordances": {
      "tags": [
        "substance"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "gold": {
    "pos": "noun",
    "category": "substance",
    "number": "mass",
    "properties": [],
    "affordances": {
      "tags": [
        "substance"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "grass": {
    "pos": "noun",
    "category": "substance",
    "number": "mass",
    "properties": [],
    "affordances": {
      "tags": [
        "plant",
        "substance"
      ],
      "canDo": [
        "sway"
      ],
      "canReceive": [
        "water"
      ],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "gravel": {
    "pos": "noun",
    "category": "substance",
    "number": "mass",
    "properties": [],
    "affordances": {
      "tags": [
        "substance"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "helium": {
    "pos": "noun",
    "category": "substance",
    "number": "mass",
    "properties": [],
    "affordances": {
      "tags": [
        "substance"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "ice": {
    "pos": "noun",
    "category": "substance",
    "number": "mass",
    "properties": [],
    "description": "frozen water",
    "affordances": {
      "tags": [
        "cold",
        "substance"
      ],
      "canDo": [
        "chill",
        "freeze liquid"
      ],
      "canReceive": [
        "melt"
      ],
      "associations": [],
      "detail": "a cold, slippery surface",
      "basis": "category and reviewed word properties"
    }
  },
  "ink": {
    "pos": "noun",
    "category": "substance",
    "number": "mass",
    "properties": [],
    "affordances": {
      "tags": [
        "liquid",
        "substance"
      ],
      "canDo": [
        "drip",
        "flow",
        "splash"
      ],
      "canReceive": [
        "drink",
        "freeze",
        "pour",
        "spill"
      ],
      "associations": [],
      "detail": "a dark spreading stain",
      "basis": "category and reviewed word properties"
    }
  },
  "iron": {
    "pos": "noun",
    "category": "substance",
    "number": "mass",
    "properties": [],
    "affordances": {
      "tags": [
        "metal",
        "substance"
      ],
      "canDo": [],
      "canReceive": [
        "magnetize"
      ],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "liquid": {
    "pos": "noun",
    "category": "substance",
    "number": "mass",
    "properties": [],
    "affordances": {
      "tags": [
        "liquid",
        "substance"
      ],
      "canDo": [
        "drip",
        "flow",
        "splash"
      ],
      "canReceive": [
        "freeze",
        "pour",
        "spill"
      ],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "mud": {
    "pos": "noun",
    "category": "substance",
    "number": "mass",
    "properties": [],
    "description": "wet sticky earth",
    "affordances": {
      "tags": [
        "substance"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "wet sticky earth",
      "basis": "category and reviewed word properties"
    }
  },
  "oil": {
    "pos": "noun",
    "category": "substance",
    "number": "mass",
    "properties": [],
    "affordances": {
      "tags": [
        "liquid",
        "substance"
      ],
      "canDo": [
        "drip",
        "flow",
        "splash"
      ],
      "canReceive": [
        "drink",
        "freeze",
        "pour",
        "spill"
      ],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "quicksand": {
    "pos": "noun",
    "category": "substance",
    "number": "mass",
    "properties": [],
    "description": "waterlogged sand that shifts under weight",
    "affordances": {
      "tags": [
        "substance"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "waterlogged sand that shifts under weight",
      "basis": "category and reviewed word properties"
    }
  },
  "water": {
    "pos": "noun",
    "category": "substance",
    "number": "mass",
    "properties": [],
    "description": "a clear liquid",
    "affordances": {
      "tags": [
        "drinkable",
        "liquid",
        "substance"
      ],
      "canDo": [
        "drip",
        "flow",
        "refresh",
        "splash"
      ],
      "canReceive": [
        "drink",
        "freeze",
        "pour",
        "sip",
        "spill"
      ],
      "associations": [],
      "detail": "clear droplets",
      "basis": "category and reviewed word properties"
    }
  },
  "wax": {
    "pos": "noun",
    "category": "substance",
    "number": "mass",
    "properties": [],
    "affordances": {
      "tags": [
        "substance"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "wood": {
    "pos": "noun",
    "category": "substance",
    "number": "mass",
    "properties": [],
    "affordances": {
      "tags": [
        "substance",
        "wooden"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "rage": {
    "pos": "noun",
    "category": "emotion",
    "number": "mass",
    "properties": [],
    "description": "intense anger, imagined as a person stamping a foot",
    "representation": {
      "phrase": "a red-faced person stamping a foot",
      "definite": "the foot-stamping person",
      "category": "person",
      "number": "singular",
      "properties": [
        "animate"
      ]
    },
    "affordances": {
      "tags": [
        "animate",
        "grasping",
        "person",
        "physical"
      ],
      "canDo": [
        "drink",
        "hold",
        "play",
        "pour"
      ],
      "canReceive": [],
      "associations": [],
      "detail": "intense anger, imagined as a person stamping a foot",
      "basis": "authored stand-in"
    }
  },
  "queue": {
    "pos": "noun",
    "category": "group",
    "number": "singular",
    "properties": [],
    "description": "a line of people waiting their turn",
    "pronunciation": {
      "syllables": [
        "queue"
      ],
      "shortCue": "queue"
    },
    "affordances": {
      "tags": [
        "people",
        "physical"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "a line of people waiting their turn",
      "basis": "category and reviewed word properties"
    }
  },
  "galaxy": {
    "pos": "noun",
    "category": "place",
    "number": "singular",
    "properties": [],
    "description": "a vast swirl of stars",
    "pronunciation": {
      "syllables": [
        "gal",
        "ax",
        "y"
      ],
      "shortCue": "gal",
      "pairCues": {
        "GX": "gax"
      }
    },
    "affordances": {
      "tags": [
        "place"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "a vast swirl of stars",
      "basis": "category and reviewed word properties"
    }
  },
  "girl": {
    "pos": "noun",
    "category": "person",
    "number": "singular",
    "properties": [],
    "description": "a young person",
    "affordances": {
      "tags": [
        "animate",
        "grasping",
        "person",
        "physical"
      ],
      "canDo": [
        "drink",
        "hold",
        "play",
        "pour"
      ],
      "canReceive": [],
      "associations": [],
      "detail": "a young person",
      "basis": "category and reviewed word properties"
    }
  },
  "siri": {
    "pos": "phrase",
    "category": "abstract",
    "number": "singular",
    "properties": [],
    "representation": {
      "phrase": "a phone displaying a glowing voice-assistant orb",
      "definite": "the glowing phone",
      "category": "object",
      "number": "singular",
      "properties": [
        "portable"
      ]
    },
    "pronunciation": {
      "syllables": [
        "si",
        "ri"
      ],
      "shortCue": "see"
    },
    "affordances": {
      "tags": [
        "electronic",
        "noisy",
        "physical",
        "portable"
      ],
      "canDo": [
        "light up",
        "ring",
        "startle"
      ],
      "canReceive": [
        "play",
        "silence",
        "splash",
        "switch on"
      ],
      "associations": [],
      "detail": "",
      "basis": "authored stand-in"
    }
  },
  "artificial intelligence": {
    "pos": "phrase",
    "category": "abstract",
    "number": "singular",
    "properties": [],
    "representation": {
      "phrase": "a small robot with blinking eyes",
      "definite": "the blinking robot",
      "category": "object",
      "number": "singular",
      "properties": [
        "portable"
      ]
    },
    "affordances": {
      "tags": [
        "physical",
        "portable"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "authored stand-in"
    }
  },
  "facebook": {
    "pos": "phrase",
    "category": "abstract",
    "number": "singular",
    "properties": [],
    "representation": {
      "phrase": "a blue address book with a lowercase f on its cover",
      "definite": "the blue address book",
      "category": "object",
      "number": "singular",
      "properties": [
        "portable"
      ]
    },
    "affordances": {
      "tags": [
        "physical",
        "portable"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "authored stand-in"
    }
  },
  "instagram": {
    "pos": "phrase",
    "category": "abstract",
    "number": "singular",
    "properties": [],
    "representation": {
      "phrase": "a square camera with a rainbow-colored lens",
      "definite": "the rainbow camera",
      "category": "object",
      "number": "singular",
      "properties": [
        "portable"
      ]
    },
    "affordances": {
      "tags": [
        "physical",
        "portable"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "authored stand-in"
    }
  },
  "youtube": {
    "pos": "phrase",
    "category": "abstract",
    "number": "singular",
    "properties": [],
    "representation": {
      "phrase": "a red play-button-shaped television",
      "definite": "the red television",
      "category": "object",
      "number": "singular",
      "properties": [
        "portable"
      ]
    },
    "affordances": {
      "tags": [
        "physical",
        "portable"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "authored stand-in"
    }
  },
  "excel": {
    "pos": "phrase",
    "category": "abstract",
    "number": "singular",
    "properties": [],
    "representation": {
      "phrase": "a green clipboard covered in spreadsheet squares",
      "definite": "the green clipboard",
      "category": "object",
      "number": "singular",
      "properties": [
        "portable"
      ]
    },
    "affordances": {
      "tags": [
        "physical",
        "portable"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "authored stand-in"
    }
  },
  "cstimer": {
    "pos": "phrase",
    "category": "abstract",
    "number": "singular",
    "properties": [],
    "representation": {
      "phrase": "a stopwatch with a tiny cube on its dial",
      "definite": "the cube stopwatch",
      "category": "object",
      "number": "singular",
      "properties": [
        "portable"
      ]
    },
    "affordances": {
      "tags": [
        "physical",
        "portable"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "authored stand-in"
    }
  },
  "ip address": {
    "pos": "phrase",
    "category": "abstract",
    "number": "singular",
    "properties": [],
    "representation": {
      "phrase": "a router with a numbered address tag",
      "definite": "the tagged router",
      "category": "object",
      "number": "singular",
      "properties": [
        "portable"
      ]
    },
    "affordances": {
      "tags": [
        "physical",
        "portable"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "authored stand-in"
    }
  },
  "direct message": {
    "pos": "phrase",
    "category": "abstract",
    "number": "singular",
    "properties": [],
    "representation": {
      "phrase": "a sealed envelope bearing a chat-bubble stamp",
      "definite": "the sealed envelope",
      "category": "object",
      "number": "singular",
      "properties": [
        "portable"
      ]
    },
    "affordances": {
      "tags": [
        "physical",
        "portable"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "authored stand-in"
    }
  },
  "chat": {
    "pos": "phrase",
    "category": "abstract",
    "number": "singular",
    "properties": [],
    "representation": {
      "phrase": "a handheld speech-bubble-shaped sign",
      "definite": "the speech-bubble sign",
      "category": "object",
      "number": "singular",
      "properties": [
        "portable"
      ]
    },
    "affordances": {
      "tags": [
        "physical",
        "portable"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "authored stand-in"
    }
  },
  "glitch": {
    "pos": "phrase",
    "category": "abstract",
    "number": "singular",
    "properties": [],
    "representation": {
      "phrase": "a handheld screen showing a scrambled checkerboard",
      "definite": "the scrambled screen",
      "category": "object",
      "number": "singular",
      "properties": [
        "portable"
      ]
    },
    "affordances": {
      "tags": [
        "physical",
        "portable"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "authored stand-in"
    }
  },
  "iq": {
    "pos": "phrase",
    "category": "abstract",
    "number": "singular",
    "properties": [],
    "representation": {
      "phrase": "a brain-shaped puzzle with interlocking pieces",
      "definite": "the brain-shaped puzzle",
      "category": "object",
      "number": "singular",
      "properties": [
        "portable"
      ]
    },
    "affordances": {
      "tags": [
        "physical",
        "portable"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "authored stand-in"
    }
  },
  "law": {
    "pos": "phrase",
    "category": "abstract",
    "number": "singular",
    "properties": [],
    "representation": {
      "phrase": "a thick rulebook with a balance scale on its cover",
      "definite": "the rulebook",
      "category": "object",
      "number": "singular",
      "properties": [
        "portable"
      ]
    },
    "affordances": {
      "tags": [
        "physical",
        "portable"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "authored stand-in"
    }
  },
  "job": {
    "pos": "phrase",
    "category": "abstract",
    "number": "singular",
    "properties": [],
    "representation": {
      "phrase": "a briefcase with a work badge attached",
      "definite": "the briefcase",
      "category": "object",
      "number": "singular",
      "properties": [
        "portable"
      ]
    },
    "affordances": {
      "tags": [
        "physical",
        "portable"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "authored stand-in"
    }
  },
  "national record": {
    "pos": "phrase",
    "category": "abstract",
    "number": "singular",
    "properties": [],
    "representation": {
      "phrase": "a trophy wrapped in a finish-line ribbon",
      "definite": "the ribbon-wrapped trophy",
      "category": "object",
      "number": "singular",
      "properties": [
        "portable"
      ]
    },
    "affordances": {
      "tags": [
        "physical",
        "portable"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "authored stand-in"
    }
  },
  "pb (personal best)": {
    "pos": "phrase",
    "category": "abstract",
    "number": "singular",
    "properties": [],
    "representation": {
      "phrase": "a gold medal engraved with a stopwatch",
      "definite": "the engraved medal",
      "category": "object",
      "number": "singular",
      "properties": [
        "portable"
      ]
    },
    "affordances": {
      "tags": [
        "physical",
        "portable"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "authored stand-in"
    }
  },
  "win": {
    "pos": "phrase",
    "category": "abstract",
    "number": "singular",
    "properties": [],
    "representation": {
      "phrase": "a tall trophy with a golden star on top",
      "definite": "the star-topped trophy",
      "category": "object",
      "number": "singular",
      "properties": [
        "portable"
      ]
    },
    "affordances": {
      "tags": [
        "physical",
        "portable"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "authored stand-in"
    }
  },
  "experience points": {
    "pos": "phrase",
    "category": "abstract",
    "number": "singular",
    "properties": [],
    "representation": {
      "phrase": "a jar of glowing star tokens",
      "definite": "the token jar",
      "category": "object",
      "number": "singular",
      "properties": [
        "portable"
      ]
    },
    "affordances": {
      "tags": [
        "physical",
        "portable"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "authored stand-in"
    }
  },
  "power": {
    "pos": "phrase",
    "category": "abstract",
    "number": "singular",
    "properties": [],
    "representation": {
      "phrase": "a battery with a bright lightning-bolt emblem",
      "definite": "the lightning-bolt battery",
      "category": "object",
      "number": "singular",
      "properties": [
        "portable"
      ]
    },
    "affordances": {
      "tags": [
        "physical",
        "portable"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "authored stand-in"
    }
  },
  "love": {
    "pos": "phrase",
    "category": "abstract",
    "number": "singular",
    "properties": [],
    "representation": {
      "phrase": "a soft heart-shaped cushion",
      "definite": "the heart-shaped cushion",
      "category": "object",
      "number": "singular",
      "properties": [
        "portable"
      ]
    },
    "affordances": {
      "tags": [
        "absorbent",
        "fabric",
        "physical",
        "portable",
        "soft"
      ],
      "canDo": [
        "drip when wet",
        "soak up liquid"
      ],
      "canReceive": [
        "snag",
        "soak",
        "squeeze",
        "wear"
      ],
      "associations": [],
      "detail": "",
      "basis": "authored stand-in"
    }
  },
  "good job": {
    "pos": "phrase",
    "category": "abstract",
    "number": "singular",
    "properties": [],
    "representation": {
      "phrase": "a shiny gold-star sticker",
      "definite": "the gold-star sticker",
      "category": "object",
      "number": "singular",
      "properties": [
        "portable"
      ]
    },
    "affordances": {
      "tags": [
        "physical",
        "portable"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "authored stand-in"
    }
  },
  "good game": {
    "pos": "phrase",
    "category": "abstract",
    "number": "singular",
    "properties": [],
    "representation": {
      "phrase": "a game controller wearing a medal",
      "definite": "the decorated controller",
      "category": "object",
      "number": "singular",
      "properties": [
        "portable"
      ]
    },
    "affordances": {
      "tags": [
        "physical",
        "portable"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "authored stand-in"
    }
  },
  "question mark": {
    "pos": "phrase",
    "category": "abstract",
    "number": "singular",
    "properties": [],
    "representation": {
      "phrase": "a question-mark-shaped hook",
      "definite": "the question-mark hook",
      "category": "object",
      "number": "singular",
      "properties": [
        "portable"
      ]
    },
    "affordances": {
      "tags": [
        "physical",
        "portable"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "authored stand-in"
    }
  },
  "q and a": {
    "pos": "phrase",
    "category": "abstract",
    "number": "singular",
    "properties": [],
    "representation": {
      "phrase": "two cards showing a question mark and an answer bubble",
      "definite": "the two cards",
      "category": "object",
      "number": "plural",
      "properties": [
        "portable"
      ]
    },
    "affordances": {
      "tags": [
        "physical",
        "portable"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "authored stand-in"
    }
  },
  "quote": {
    "pos": "phrase",
    "category": "abstract",
    "number": "singular",
    "properties": [],
    "representation": {
      "phrase": "a paper scroll with oversized quotation marks",
      "definite": "the quotation scroll",
      "category": "object",
      "number": "singular",
      "properties": [
        "portable"
      ]
    },
    "affordances": {
      "tags": [
        "physical",
        "portable"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "authored stand-in"
    }
  },
  "no": {
    "pos": "phrase",
    "category": "abstract",
    "number": "singular",
    "properties": [],
    "representation": {
      "phrase": "a red paddle bearing a large NO",
      "definite": "the red paddle",
      "category": "object",
      "number": "singular",
      "properties": [
        "portable"
      ]
    },
    "affordances": {
      "tags": [
        "physical",
        "portable"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "authored stand-in"
    }
  },
  "next": {
    "pos": "phrase",
    "category": "abstract",
    "number": "singular",
    "properties": [],
    "representation": {
      "phrase": "a page-turning arrow cut from cardboard",
      "definite": "the cardboard arrow",
      "category": "object",
      "number": "singular",
      "properties": [
        "portable"
      ]
    },
    "affordances": {
      "tags": [
        "physical",
        "portable"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "authored stand-in"
    }
  },
  "exit": {
    "pos": "phrase",
    "category": "abstract",
    "number": "singular",
    "properties": [],
    "representation": {
      "phrase": "a portable illuminated EXIT sign",
      "definite": "the illuminated sign",
      "category": "object",
      "number": "singular",
      "properties": [
        "portable"
      ]
    },
    "affordances": {
      "tags": [
        "physical",
        "portable"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "authored stand-in"
    }
  },
  "disqualified": {
    "pos": "phrase",
    "category": "abstract",
    "number": "singular",
    "properties": [],
    "representation": {
      "phrase": "a crossed-out race bib",
      "definite": "the crossed-out bib",
      "category": "object",
      "number": "singular",
      "properties": [
        "portable"
      ]
    },
    "affordances": {
      "tags": [
        "physical",
        "portable"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "authored stand-in"
    }
  },
  "kilometer": {
    "pos": "phrase",
    "category": "abstract",
    "number": "singular",
    "properties": [],
    "representation": {
      "phrase": "a folding ruler stretched out beside a 1 km marker",
      "definite": "the folding ruler",
      "category": "object",
      "number": "singular",
      "properties": [
        "portable"
      ]
    },
    "affordances": {
      "tags": [
        "physical",
        "portable"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "authored stand-in"
    }
  },
  "yearbook": {
    "pos": "phrase",
    "category": "abstract",
    "number": "singular",
    "properties": [],
    "representation": {
      "phrase": "a thick album of school portraits",
      "definite": "the portrait album",
      "category": "object",
      "number": "singular",
      "properties": [
        "portable"
      ]
    },
    "affordances": {
      "tags": [
        "physical",
        "portable"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "authored stand-in"
    }
  },
  "ultraviolet": {
    "pos": "phrase",
    "category": "abstract",
    "number": "singular",
    "properties": [],
    "representation": {
      "phrase": "a purple flashlight making white fabric glow",
      "definite": "the purple flashlight",
      "category": "object",
      "number": "singular",
      "properties": [
        "portable"
      ]
    },
    "affordances": {
      "tags": [
        "physical",
        "portable"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "authored stand-in"
    }
  },
  "x-ray": {
    "pos": "phrase",
    "category": "abstract",
    "number": "singular",
    "properties": [],
    "representation": {
      "phrase": "a translucent sheet showing the bones of a hand",
      "definite": "the translucent sheet",
      "category": "object",
      "number": "singular",
      "properties": [
        "portable"
      ]
    },
    "affordances": {
      "tags": [
        "physical",
        "portable"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "authored stand-in"
    }
  },
  "jazz": {
    "pos": "phrase",
    "category": "abstract",
    "number": "singular",
    "properties": [],
    "representation": {
      "phrase": "a miniature saxophone with curling musical notes painted on it",
      "definite": "the miniature saxophone",
      "category": "object",
      "number": "singular",
      "properties": [
        "portable"
      ]
    },
    "affordances": {
      "tags": [
        "physical",
        "portable"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "authored stand-in"
    }
  },
  "opera": {
    "pos": "phrase",
    "category": "abstract",
    "number": "singular",
    "properties": [],
    "representation": {
      "phrase": "a small theater mask with an open singing mouth",
      "definite": "the singing mask",
      "category": "object",
      "number": "singular",
      "properties": [
        "portable"
      ]
    },
    "affordances": {
      "tags": [
        "physical",
        "portable"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "authored stand-in"
    }
  },
  "boom": {
    "pos": "phrase",
    "category": "abstract",
    "number": "singular",
    "properties": [],
    "representation": {
      "phrase": "a bass drum with a visibly vibrating skin",
      "definite": "the vibrating drum",
      "category": "object",
      "number": "singular",
      "properties": [
        "portable"
      ]
    },
    "affordances": {
      "tags": [
        "physical",
        "portable"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "authored stand-in"
    }
  },
  "five": {
    "pos": "phrase",
    "category": "abstract",
    "number": "singular",
    "properties": [],
    "representation": {
      "phrase": "a foam hand with five outstretched fingers",
      "definite": "the foam hand",
      "category": "object",
      "number": "singular",
      "properties": [
        "portable"
      ]
    },
    "affordances": {
      "tags": [
        "physical",
        "portable"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "authored stand-in"
    }
  },
  "nine": {
    "pos": "phrase",
    "category": "abstract",
    "number": "singular",
    "properties": [],
    "representation": {
      "phrase": "a number-nine-shaped balloon",
      "definite": "the number-nine balloon",
      "category": "object",
      "number": "singular",
      "properties": [
        "portable"
      ]
    },
    "affordances": {
      "tags": [
        "physical",
        "portable"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "authored stand-in"
    }
  },
  "nine (ix)": {
    "pos": "phrase",
    "category": "abstract",
    "number": "singular",
    "properties": [],
    "representation": {
      "phrase": "a stone tile engraved with IX",
      "definite": "the engraved tile",
      "category": "object",
      "number": "singular",
      "properties": [
        "portable"
      ]
    },
    "affordances": {
      "tags": [
        "physical",
        "portable"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "authored stand-in"
    }
  },
  "zero": {
    "pos": "phrase",
    "category": "abstract",
    "number": "singular",
    "properties": [],
    "representation": {
      "phrase": "an empty ring shaped like a zero",
      "definite": "the empty ring",
      "category": "object",
      "number": "singular",
      "properties": [
        "portable"
      ]
    },
    "affordances": {
      "tags": [
        "physical",
        "portable"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "authored stand-in"
    }
  },
  "two (ii)": {
    "pos": "phrase",
    "category": "abstract",
    "number": "singular",
    "properties": [],
    "representation": {
      "phrase": "two upright wooden counting sticks",
      "definite": "the two counting sticks",
      "category": "object",
      "number": "plural",
      "properties": [
        "portable"
      ]
    },
    "affordances": {
      "tags": [
        "physical",
        "portable"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "authored stand-in"
    }
  },
  "cyan": {
    "pos": "phrase",
    "category": "abstract",
    "number": "singular",
    "properties": [],
    "representation": {
      "phrase": "a tin of bright cyan paint",
      "definite": "the cyan paint tin",
      "category": "object",
      "number": "singular",
      "properties": [
        "portable"
      ]
    },
    "affordances": {
      "tags": [
        "physical",
        "portable"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "authored stand-in"
    }
  },
  "pink": {
    "pos": "phrase",
    "category": "abstract",
    "number": "singular",
    "properties": [],
    "representation": {
      "phrase": "a spool of pink ribbon",
      "definite": "the pink ribbon spool",
      "category": "object",
      "number": "singular",
      "properties": [
        "portable"
      ]
    },
    "affordances": {
      "tags": [
        "physical",
        "portable"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "authored stand-in"
    }
  },
  "extra large": {
    "pos": "phrase",
    "category": "abstract",
    "number": "singular",
    "properties": [],
    "representation": {
      "phrase": "an oversized shirt with a huge XL label",
      "definite": "the oversized shirt",
      "category": "object",
      "number": "singular",
      "properties": [
        "portable"
      ]
    },
    "affordances": {
      "tags": [
        "physical",
        "portable"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "authored stand-in"
    }
  },
  "exquisite": {
    "pos": "phrase",
    "category": "abstract",
    "number": "singular",
    "properties": [],
    "representation": {
      "phrase": "a delicate jeweled egg on a tiny stand",
      "definite": "the jeweled egg",
      "category": "object",
      "number": "singular",
      "properties": [
        "portable"
      ]
    },
    "affordances": {
      "tags": [
        "physical",
        "portable"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "authored stand-in"
    }
  },
  "unique": {
    "pos": "phrase",
    "category": "abstract",
    "number": "singular",
    "properties": [],
    "representation": {
      "phrase": "a single striped marble among plain marbles",
      "definite": "the striped marble",
      "category": "object",
      "number": "singular",
      "properties": [
        "portable"
      ]
    },
    "affordances": {
      "tags": [
        "physical",
        "portable"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "authored stand-in"
    }
  },
  "quick": {
    "pos": "phrase",
    "category": "abstract",
    "number": "singular",
    "properties": [],
    "representation": {
      "phrase": "a wind-up racing car with speed stripes",
      "definite": "the wind-up car",
      "category": "object",
      "number": "singular",
      "properties": [
        "portable"
      ]
    },
    "affordances": {
      "tags": [
        "physical",
        "portable"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "authored stand-in"
    }
  },
  "ez (easy)": {
    "pos": "phrase",
    "category": "abstract",
    "number": "singular",
    "properties": [],
    "representation": {
      "phrase": "a two-piece jigsaw puzzle",
      "definite": "the two-piece puzzle",
      "category": "object",
      "number": "singular",
      "properties": [
        "portable"
      ]
    },
    "affordances": {
      "tags": [
        "physical",
        "portable"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "authored stand-in"
    }
  },
  "ubuntu (linux)": {
    "pos": "phrase",
    "category": "abstract",
    "number": "singular",
    "properties": [],
    "representation": {
      "phrase": "a laptop displaying the Ubuntu logo",
      "definite": "the laptop",
      "category": "object",
      "number": "singular",
      "properties": [
        "portable"
      ]
    },
    "affordances": {
      "tags": [
        "physical",
        "portable"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "authored stand-in"
    }
  },
  "minecraft": {
    "pos": "phrase",
    "category": "abstract",
    "number": "singular",
    "properties": [],
    "representation": {
      "phrase": "a blocky grass-topped dirt cube",
      "definite": "the blocky grass cube",
      "category": "object",
      "number": "singular",
      "properties": [
        "portable"
      ]
    },
    "affordances": {
      "tags": [
        "physical",
        "portable"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "authored stand-in"
    }
  },
  "zoom": {
    "pos": "phrase",
    "category": "abstract",
    "number": "singular",
    "properties": [],
    "representation": {
      "phrase": "a camera with an exaggerated telescoping lens",
      "definite": "the long-lensed camera",
      "category": "object",
      "number": "singular",
      "properties": [
        "portable"
      ]
    },
    "affordances": {
      "tags": [
        "physical",
        "portable"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "authored stand-in"
    }
  },
  "yawn": {
    "pos": "phrase",
    "category": "abstract",
    "number": "singular",
    "properties": [],
    "representation": {
      "phrase": "a small pillow embroidered with an open yawning mouth",
      "definite": "the embroidered pillow",
      "category": "object",
      "number": "singular",
      "properties": [
        "portable"
      ]
    },
    "affordances": {
      "tags": [
        "physical",
        "portable"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "authored stand-in"
    }
  },
  "nap": {
    "pos": "phrase",
    "category": "abstract",
    "number": "singular",
    "properties": [],
    "representation": {
      "phrase": "a folded blanket beside a sleeping cap",
      "definite": "the folded blanket",
      "category": "object",
      "number": "singular",
      "properties": [
        "portable"
      ]
    },
    "affordances": {
      "tags": [
        "physical",
        "portable"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "authored stand-in"
    }
  },
  "save": {
    "pos": "phrase",
    "category": "abstract",
    "number": "singular",
    "properties": [],
    "representation": {
      "phrase": "a floppy disk with a large checkmark",
      "definite": "the checked floppy disk",
      "category": "object",
      "number": "singular",
      "properties": [
        "portable"
      ]
    },
    "affordances": {
      "tags": [
        "physical",
        "portable"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "authored stand-in"
    }
  },
  "exchange": {
    "pos": "phrase",
    "category": "abstract",
    "number": "singular",
    "properties": [],
    "representation": {
      "phrase": "two interlocked arrows carved into a wooden token",
      "definite": "the arrow token",
      "category": "object",
      "number": "singular",
      "properties": [
        "portable"
      ]
    },
    "affordances": {
      "tags": [
        "physical",
        "portable"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "authored stand-in"
    }
  },
  "go": {
    "pos": "phrase",
    "category": "abstract",
    "number": "singular",
    "properties": [],
    "representation": {
      "phrase": "a miniature traffic light glowing green",
      "definite": "the green traffic light",
      "category": "object",
      "number": "singular",
      "properties": [
        "portable"
      ]
    },
    "affordances": {
      "tags": [
        "physical",
        "portable"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "authored stand-in"
    }
  },
  "excite": {
    "pos": "phrase",
    "category": "abstract",
    "number": "singular",
    "properties": [],
    "representation": {
      "phrase": "a person jumping with both hands raised",
      "definite": "the excited person",
      "category": "person",
      "number": "singular",
      "properties": [
        "animate"
      ]
    },
    "affordances": {
      "tags": [
        "animate",
        "grasping",
        "person",
        "physical"
      ],
      "canDo": [
        "drink",
        "hold",
        "play",
        "pour"
      ],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "authored stand-in"
    }
  },
  "exhale": {
    "pos": "phrase",
    "category": "abstract",
    "number": "singular",
    "properties": [],
    "representation": {
      "phrase": "a person blowing out a long visible puff of air",
      "definite": "the person blowing air",
      "category": "person",
      "number": "singular",
      "properties": [
        "animate"
      ]
    },
    "affordances": {
      "tags": [
        "animate",
        "grasping",
        "person",
        "physical"
      ],
      "canDo": [
        "drink",
        "hold",
        "play",
        "pour"
      ],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "authored stand-in"
    }
  },
  "itch": {
    "pos": "phrase",
    "category": "abstract",
    "number": "singular",
    "properties": [],
    "representation": {
      "phrase": "a person scratching an elbow",
      "definite": "the elbow-scratching person",
      "category": "person",
      "number": "singular",
      "properties": [
        "animate"
      ]
    },
    "affordances": {
      "tags": [
        "animate",
        "grasping",
        "person",
        "physical"
      ],
      "canDo": [
        "drink",
        "hold",
        "play",
        "pour"
      ],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "authored stand-in"
    }
  },
  "haha (laughing)": {
    "pos": "phrase",
    "category": "abstract",
    "number": "singular",
    "properties": [],
    "representation": {
      "phrase": "a person laughing with their head tipped back",
      "definite": "the laughing person",
      "category": "person",
      "number": "singular",
      "properties": [
        "animate"
      ]
    },
    "affordances": {
      "tags": [
        "animate",
        "grasping",
        "person",
        "physical"
      ],
      "canDo": [
        "drink",
        "hold",
        "play",
        "pour"
      ],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "authored stand-in"
    }
  },
  "hi (hello)": {
    "pos": "phrase",
    "category": "abstract",
    "number": "singular",
    "properties": [],
    "representation": {
      "phrase": "a person raising a hand in greeting",
      "definite": "the waving person",
      "category": "person",
      "number": "singular",
      "properties": [
        "animate"
      ]
    },
    "affordances": {
      "tags": [
        "animate",
        "grasping",
        "person",
        "physical"
      ],
      "canDo": [
        "drink",
        "hold",
        "play",
        "pour"
      ],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "authored stand-in"
    }
  },
  "uhhh (thinking)": {
    "pos": "phrase",
    "category": "abstract",
    "number": "singular",
    "properties": [],
    "representation": {
      "phrase": "a person resting their chin on a hand while thinking",
      "definite": "the thoughtful person",
      "category": "person",
      "number": "singular",
      "properties": [
        "animate"
      ]
    },
    "affordances": {
      "tags": [
        "animate",
        "grasping",
        "person",
        "physical"
      ],
      "canDo": [
        "drink",
        "hold",
        "play",
        "pour"
      ],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "authored stand-in"
    }
  },
  "zzz (sleeping)": {
    "pos": "phrase",
    "category": "abstract",
    "number": "singular",
    "properties": [],
    "representation": {
      "phrase": "a person asleep under a striped blanket",
      "definite": "the sleeping person",
      "category": "person",
      "number": "singular",
      "properties": [
        "animate"
      ]
    },
    "affordances": {
      "tags": [
        "animate",
        "grasping",
        "person",
        "physical"
      ],
      "canDo": [
        "drink",
        "hold",
        "play",
        "pour"
      ],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "authored stand-in"
    }
  },
  "yell": {
    "pos": "phrase",
    "category": "abstract",
    "number": "singular",
    "properties": [],
    "representation": {
      "phrase": "a person calling through cupped hands",
      "definite": "the calling person",
      "category": "person",
      "number": "singular",
      "properties": [
        "animate"
      ]
    },
    "affordances": {
      "tags": [
        "animate",
        "grasping",
        "person",
        "physical"
      ],
      "canDo": [
        "drink",
        "hold",
        "play",
        "pour"
      ],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "authored stand-in"
    }
  },
  "chew": {
    "pos": "phrase",
    "category": "abstract",
    "number": "singular",
    "properties": [],
    "representation": {
      "phrase": "a person slowly chewing a mouthful of food",
      "definite": "the chewing person",
      "category": "person",
      "number": "singular",
      "properties": [
        "animate"
      ]
    },
    "affordances": {
      "tags": [
        "animate",
        "grasping",
        "person",
        "physical"
      ],
      "canDo": [
        "drink",
        "hold",
        "play",
        "pour"
      ],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "authored stand-in"
    }
  },
  "chill": {
    "pos": "phrase",
    "category": "abstract",
    "number": "singular",
    "properties": [],
    "representation": {
      "phrase": "a person relaxing in a hammock",
      "definite": "the relaxed person",
      "category": "person",
      "number": "singular",
      "properties": [
        "animate"
      ]
    },
    "affordances": {
      "tags": [
        "animate",
        "grasping",
        "person",
        "physical"
      ],
      "canDo": [
        "drink",
        "hold",
        "play",
        "pour"
      ],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "authored stand-in"
    }
  },
  "exaggerate": {
    "pos": "phrase",
    "category": "abstract",
    "number": "singular",
    "properties": [],
    "representation": {
      "phrase": "a storyteller stretching their arms impossibly far apart",
      "definite": "the gesturing storyteller",
      "category": "person",
      "number": "singular",
      "properties": [
        "animate"
      ]
    },
    "affordances": {
      "tags": [
        "animate",
        "grasping",
        "person",
        "physical"
      ],
      "canDo": [
        "drink",
        "hold",
        "play",
        "pour"
      ],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "authored stand-in"
    }
  },
  "pikachu": {
    "pos": "noun",
    "category": "unknown",
    "number": "singular",
    "properties": [],
    "pronunciation": {
      "syllables": [
        "pi",
        "ka",
        "chu"
      ],
      "shortCue": "pik"
    },
    "affordances": {
      "tags": [],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "pokemon": {
    "pos": "noun",
    "category": "unknown",
    "number": "singular",
    "properties": [],
    "pronunciation": {
      "syllables": [
        "po",
        "ke",
        "mon"
      ],
      "shortCue": "poke"
    },
    "affordances": {
      "tags": [],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "butterfly": {
    "pos": "noun",
    "category": "unknown",
    "number": "singular",
    "properties": [],
    "pronunciation": {
      "syllables": [
        "but",
        "ter",
        "fly"
      ],
      "shortCue": "fly"
    },
    "affordances": {
      "tags": [],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "abacus": {
    "pos": "noun",
    "category": "unknown",
    "number": "singular",
    "properties": [],
    "pronunciation": {
      "syllables": [
        "ab",
        "a",
        "cus"
      ],
      "shortCue": "ab"
    },
    "affordances": {
      "tags": [],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "aquarium": {
    "pos": "noun",
    "category": "unknown",
    "number": "singular",
    "properties": [],
    "pronunciation": {
      "syllables": [
        "a",
        "quar",
        "i",
        "um"
      ],
      "shortCue": "quar"
    },
    "affordances": {
      "tags": [],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "elephant": {
    "pos": "noun",
    "category": "unknown",
    "number": "singular",
    "properties": [],
    "pronunciation": {
      "syllables": [
        "el",
        "e",
        "phant"
      ],
      "shortCue": "el"
    },
    "affordances": {
      "tags": [],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "bicycle": {
    "pos": "noun",
    "category": "unknown",
    "number": "singular",
    "properties": [],
    "pronunciation": {
      "syllables": [
        "bi",
        "cy",
        "cle"
      ],
      "shortCue": "bike"
    },
    "affordances": {
      "tags": [],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "computer": {
    "pos": "noun",
    "category": "unknown",
    "number": "singular",
    "properties": [],
    "pronunciation": {
      "syllables": [
        "com",
        "pu",
        "ter"
      ],
      "shortCue": "comp"
    },
    "affordances": {
      "tags": [
        "electronic"
      ],
      "canDo": [
        "light up"
      ],
      "canReceive": [
        "splash",
        "switch on"
      ],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "unicorn": {
    "pos": "noun",
    "category": "unknown",
    "number": "singular",
    "properties": [],
    "pronunciation": {
      "syllables": [
        "u",
        "ni",
        "corn"
      ],
      "shortCue": "corn"
    },
    "affordances": {
      "tags": [],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "telephone": {
    "pos": "noun",
    "category": "unknown",
    "number": "singular",
    "properties": [],
    "pronunciation": {
      "syllables": [
        "tel",
        "e",
        "phone"
      ],
      "shortCue": "tel"
    },
    "affordances": {
      "tags": [],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "telescope": {
    "pos": "noun",
    "category": "unknown",
    "number": "singular",
    "properties": [],
    "pronunciation": {
      "syllables": [
        "tel",
        "e",
        "scope"
      ],
      "shortCue": "scope"
    },
    "affordances": {
      "tags": [],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "microscope": {
    "pos": "noun",
    "category": "unknown",
    "number": "singular",
    "properties": [],
    "pronunciation": {
      "syllables": [
        "mi",
        "cro",
        "scope"
      ],
      "shortCue": "scope"
    },
    "affordances": {
      "tags": [],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "keyboard": {
    "pos": "noun",
    "category": "unknown",
    "number": "singular",
    "properties": [],
    "pronunciation": {
      "syllables": [
        "key",
        "board"
      ],
      "shortCue": "key"
    },
    "affordances": {
      "tags": [
        "electronic",
        "keyed"
      ],
      "canDo": [
        "click",
        "jam when sticky",
        "light up"
      ],
      "canReceive": [
        "splash",
        "switch on",
        "type on"
      ],
      "associations": [
        "keys",
        "computer"
      ],
      "detail": "rows of clicking letter keys",
      "basis": "category and reviewed word properties"
    }
  },
  "ian": {
    "pos": "proper noun",
    "category": "person",
    "number": "singular",
    "proper": true,
    "properties": [
      "animate"
    ],
    "affordances": {
      "tags": [
        "animate",
        "grasping",
        "person",
        "physical"
      ],
      "canDo": [
        "drink",
        "hold",
        "play",
        "pour"
      ],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "jesus": {
    "pos": "proper noun",
    "category": "person",
    "number": "singular",
    "proper": true,
    "properties": [
      "animate"
    ],
    "affordances": {
      "tags": [
        "animate",
        "grasping",
        "person",
        "physical"
      ],
      "canDo": [
        "drink",
        "hold",
        "play",
        "pour"
      ],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "apple juice": {
    "pos": "noun",
    "category": "substance",
    "number": "mass",
    "properties": [],
    "affordances": {
      "tags": [
        "drinkable",
        "liquid",
        "sticky",
        "substance"
      ],
      "canDo": [
        "coat",
        "drip",
        "flow",
        "refresh",
        "splash",
        "stick"
      ],
      "canReceive": [
        "drink",
        "freeze",
        "pour",
        "sip",
        "spill"
      ],
      "associations": [
        "cup",
        "carton",
        "straw"
      ],
      "detail": "a golden splash with a sticky edge",
      "basis": "category and reviewed word properties"
    },
    "pronunciation": {
      "syllables": [
        "ap",
        "ple",
        "juice"
      ],
      "shortCue": "juice"
    }
  },
  "orange juice": {
    "pos": "noun",
    "category": "substance",
    "number": "mass",
    "properties": [],
    "affordances": {
      "tags": [
        "drinkable",
        "liquid",
        "sticky",
        "substance"
      ],
      "canDo": [
        "coat",
        "drip",
        "flow",
        "refresh",
        "splash",
        "stick"
      ],
      "canReceive": [
        "drink",
        "freeze",
        "pour",
        "sip",
        "spill"
      ],
      "associations": [
        "glass",
        "orange",
        "carton"
      ],
      "detail": "a bright orange stream",
      "basis": "category and reviewed word properties"
    },
    "pronunciation": {
      "syllables": [
        "or",
        "ange",
        "juice"
      ],
      "shortCue": "juice"
    }
  },
  "juice": {
    "pos": "noun",
    "category": "substance",
    "number": "mass",
    "properties": [],
    "affordances": {
      "tags": [
        "drinkable",
        "liquid",
        "sticky",
        "substance"
      ],
      "canDo": [
        "coat",
        "drip",
        "flow",
        "refresh",
        "splash",
        "stick"
      ],
      "canReceive": [
        "drink",
        "freeze",
        "pour",
        "sip",
        "spill"
      ],
      "associations": [
        "cup",
        "straw"
      ],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "coffee": {
    "pos": "noun",
    "category": "substance",
    "number": "mass",
    "properties": [],
    "affordances": {
      "tags": [
        "aromatic",
        "drinkable",
        "liquid",
        "substance"
      ],
      "canDo": [
        "attract attention",
        "drip",
        "flow",
        "refresh",
        "release a scent",
        "splash"
      ],
      "canReceive": [
        "drink",
        "freeze",
        "pour",
        "sip",
        "spill"
      ],
      "associations": [
        "mug",
        "spoon"
      ],
      "detail": "a dark, fragrant stream",
      "basis": "category and reviewed word properties"
    }
  },
  "tea": {
    "pos": "noun",
    "category": "substance",
    "number": "mass",
    "properties": [],
    "affordances": {
      "tags": [
        "aromatic",
        "drinkable",
        "liquid",
        "substance"
      ],
      "canDo": [
        "attract attention",
        "drip",
        "flow",
        "refresh",
        "release a scent",
        "splash"
      ],
      "canReceive": [
        "drink",
        "freeze",
        "pour",
        "sip",
        "spill"
      ],
      "associations": [
        "cup",
        "teapot"
      ],
      "detail": "an amber stream",
      "basis": "category and reviewed word properties"
    }
  },
  "milk": {
    "pos": "noun",
    "category": "substance",
    "number": "mass",
    "properties": [],
    "affordances": {
      "tags": [
        "drinkable",
        "liquid",
        "substance"
      ],
      "canDo": [
        "drip",
        "flow",
        "refresh",
        "splash"
      ],
      "canReceive": [
        "drink",
        "freeze",
        "pour",
        "sip",
        "spill"
      ],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "paint": {
    "pos": "noun",
    "category": "substance",
    "number": "mass",
    "properties": [],
    "affordances": {
      "tags": [
        "liquid",
        "substance"
      ],
      "canDo": [
        "drip",
        "flow",
        "splash"
      ],
      "canReceive": [
        "drink",
        "freeze",
        "pour",
        "spill"
      ],
      "associations": [],
      "detail": "a streak of vivid color",
      "basis": "category and reviewed word properties"
    }
  },
  "magnet": {
    "pos": "noun",
    "category": "object",
    "number": "singular",
    "properties": [],
    "affordances": {
      "tags": [
        "magnetic",
        "physical"
      ],
      "canDo": [
        "attract metal"
      ],
      "canReceive": [],
      "associations": [
        "metal",
        "iron"
      ],
      "detail": "a strong pull toward metal",
      "basis": "category and reviewed word properties"
    }
  },
  "domino": {
    "pos": "noun",
    "category": "object",
    "number": "singular",
    "properties": [],
    "affordances": {
      "tags": [
        "knockable",
        "physical"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "drum": {
    "pos": "noun",
    "category": "object",
    "number": "singular",
    "properties": [],
    "affordances": {
      "tags": [
        "noisy",
        "physical"
      ],
      "canDo": [
        "ring",
        "startle"
      ],
      "canReceive": [
        "play",
        "silence"
      ],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "bell": {
    "pos": "noun",
    "category": "object",
    "number": "singular",
    "properties": [],
    "affordances": {
      "tags": [
        "noisy",
        "physical"
      ],
      "canDo": [
        "ring",
        "startle"
      ],
      "canReceive": [
        "play",
        "silence"
      ],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "sponge": {
    "pos": "noun",
    "category": "object",
    "number": "singular",
    "properties": [],
    "affordances": {
      "tags": [
        "absorbent",
        "physical",
        "soft"
      ],
      "canDo": [
        "drip when wet",
        "soak up liquid"
      ],
      "canReceive": [
        "soak",
        "squeeze"
      ],
      "associations": [],
      "detail": "tiny absorbent holes",
      "basis": "category and reviewed word properties"
    }
  },
  "paper": {
    "pos": "noun",
    "category": "object",
    "number": "mass",
    "properties": [],
    "affordances": {
      "tags": [
        "absorbent",
        "light",
        "paper",
        "physical"
      ],
      "canDo": [
        "drip when wet",
        "soak up liquid"
      ],
      "canReceive": [
        "fold",
        "soak",
        "squeeze"
      ],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "feather": {
    "pos": "noun",
    "category": "object",
    "number": "singular",
    "properties": [],
    "affordances": {
      "tags": [
        "light",
        "physical"
      ],
      "canDo": [],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "balloon": {
    "pos": "noun",
    "category": "object",
    "number": "singular",
    "properties": [],
    "affordances": {
      "tags": [
        "inflatable",
        "physical"
      ],
      "canDo": [
        "float"
      ],
      "canReceive": [
        "inflate"
      ],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "battery": {
    "pos": "noun",
    "category": "object",
    "number": "singular",
    "properties": [],
    "description": "a small cylindrical battery with metal terminals",
    "affordances": {
      "tags": [
        "physical",
        "portable",
        "rollable",
        "cylindrical",
        "power-source"
      ],
      "canDo": [
        "roll",
        "power"
      ],
      "canReceive": [
        "insert",
        "charge"
      ],
      "associations": [
        "battery compartment",
        "positive terminal"
      ],
      "detail": "a small cylindrical battery with metal terminals",
      "basis": "reviewed physical properties and mnemonic representation"
    }
  },
  "abs": {
    "pos": "noun",
    "category": "body",
    "number": "plural",
    "properties": [],
    "description": "defined abdominal muscles represented by a strong person",
    "affordances": {
      "tags": [
        "physical",
        "person",
        "animate",
        "strong",
        "body-surface"
      ],
      "canDo": [
        "lift",
        "brace",
        "flex"
      ],
      "canReceive": [
        "bump",
        "tickle"
      ],
      "associations": [
        "torso",
        "weightlifting"
      ],
      "detail": "defined abdominal muscles represented by a strong person",
      "basis": "reviewed physical properties and mnemonic representation"
    },
    "representation": {
      "phrase": "a person with defined abdominal muscles",
      "definite": "the person with defined abs",
      "category": "person",
      "number": "singular",
      "properties": [
        "animate",
        "strong"
      ]
    }
  },
  "air conditioner": {
    "pos": "noun",
    "category": "object",
    "number": "singular",
    "properties": [],
    "description": "a heavy cooling unit with vents and a broad back panel",
    "affordances": {
      "tags": [
        "physical",
        "heavy",
        "back-surface",
        "airflow",
        "electronic"
      ],
      "canDo": [
        "cool",
        "blow",
        "display"
      ],
      "canReceive": [
        "lift",
        "install"
      ],
      "associations": [
        "vents",
        "back panel",
        "wall"
      ],
      "detail": "a heavy cooling unit with vents and a broad back panel",
      "basis": "reviewed physical properties and mnemonic representation"
    }
  },
  "advertisement": {
    "pos": "noun",
    "category": "object",
    "number": "singular",
    "properties": [],
    "description": "a bright printed advertising poster",
    "affordances": {
      "tags": [
        "physical",
        "portable",
        "signage",
        "flat",
        "paper"
      ],
      "canDo": [
        "display",
        "unroll"
      ],
      "canReceive": [
        "attach",
        "read"
      ],
      "associations": [
        "poster",
        "product image",
        "billboard"
      ],
      "detail": "a bright printed advertising poster",
      "basis": "reviewed physical properties and mnemonic representation"
    }
  },
  "ad (advertisement)": {
    "pos": "noun",
    "category": "object",
    "number": "singular",
    "properties": [],
    "description": "a bright printed advertising poster",
    "affordances": {
      "tags": [
        "physical",
        "portable",
        "signage",
        "flat",
        "paper"
      ],
      "canDo": [
        "display",
        "unroll"
      ],
      "canReceive": [
        "attach",
        "read"
      ],
      "associations": [
        "poster",
        "product image",
        "billboard"
      ],
      "detail": "a bright printed advertising poster",
      "basis": "reviewed physical properties and mnemonic representation"
    }
  },
  "ad": {
    "pos": "noun",
    "category": "object",
    "number": "singular",
    "properties": [],
    "description": "a bright printed advertising poster",
    "affordances": {
      "tags": [
        "physical",
        "portable",
        "signage",
        "flat",
        "paper"
      ],
      "canDo": [
        "display",
        "unroll"
      ],
      "canReceive": [
        "attach",
        "read"
      ],
      "associations": [
        "poster",
        "product image",
        "billboard"
      ],
      "detail": "a bright printed advertising poster",
      "basis": "reviewed physical properties and mnemonic representation"
    }
  },
  "afro": {
    "pos": "noun",
    "category": "body",
    "number": "singular",
    "properties": [
      "wearable"
    ],
    "description": "a rounded mass of dense curly hair on a person’s head",
    "affordances": {
      "tags": [
        "hair",
        "headwear",
        "physical",
        "springy",
        "tangleable",
        "wearable"
      ],
      "canDo": [
        "catch",
        "spring"
      ],
      "canReceive": [
        "comb",
        "tangle"
      ],
      "associations": [
        "curls",
        "head"
      ],
      "detail": "a rounded mass of dense curly hair on a person’s head",
      "basis": "reviewed physical properties and mnemonic representation"
    },
    "representation": {
      "phrase": "a springy afro wig",
      "definite": "the afro wig",
      "category": "body",
      "number": "singular",
      "properties": [
        "springy",
        "wearable"
      ]
    }
  },
  "angel": {
    "pos": "noun",
    "category": "person",
    "number": "singular",
    "properties": [],
    "description": "an imaginary winged figure flying upward",
    "affordances": {
      "tags": [
        "physical",
        "person",
        "animate",
        "flying",
        "winged"
      ],
      "canDo": [
        "fly",
        "glide"
      ],
      "canReceive": [
        "launch"
      ],
      "associations": [
        "wings",
        "clouds"
      ],
      "detail": "an imaginary winged figure flying upward",
      "basis": "reviewed physical properties and mnemonic representation"
    }
  },
  "trampoline": {
    "pos": "noun",
    "category": "object",
    "number": "singular",
    "properties": [],
    "description": "a stretched elastic mat that rebounds when pressed",
    "affordances": {
      "tags": [
        "physical",
        "springy"
      ],
      "canDo": [
        "launch",
        "bounce"
      ],
      "canReceive": [
        "jump"
      ],
      "associations": [
        "springs",
        "elastic mat"
      ],
      "detail": "a stretched elastic mat that rebounds when pressed",
      "basis": "reviewed physical properties and mnemonic representation"
    }
  },
  "poster": {
    "pos": "noun",
    "category": "object",
    "number": "singular",
    "properties": [],
    "description": "a printed poster on a flat sheet",
    "affordances": {
      "tags": [
        "physical",
        "portable",
        "signage",
        "flat",
        "paper"
      ],
      "canDo": [
        "display",
        "unroll"
      ],
      "canReceive": [
        "attach",
        "read"
      ],
      "associations": [
        "poster",
        "product image",
        "billboard"
      ],
      "detail": "a bright printed advertising poster",
      "basis": "reviewed physical properties and mnemonic representation"
    }
  },
  "jesus christ": {
    "pos": "proper noun",
    "category": "person",
    "number": "singular",
    "proper": true,
    "properties": [
      "animate"
    ],
    "affordances": {
      "tags": [
        "animate",
        "grasping",
        "person",
        "physical"
      ],
      "canDo": [
        "drink",
        "hold",
        "play",
        "pour"
      ],
      "canReceive": [],
      "associations": [],
      "detail": "",
      "basis": "category and reviewed word properties"
    }
  },
  "xenon": {
    "pos": "noun",
    "category": "substance",
    "number": "mass",
    "properties": [],
    "description": "Xenon is a colourless noble gas, element 54 (Xe) on the periodic table, used in flash lamps.",
    "source": "https://periodic-table.rsc.org/element/54/Xenon",
    "representation": {
      "phrase": "a periodic-table tile marked Xe, 54",
      "definite": "the Xe tile",
      "category": "object",
      "number": "singular",
      "properties": [
        "portable"
      ],
      "explanation": "Xenon is a colourless noble gas, element 54 on the periodic table, used in flash lamps. The tile stands for the gas"
    },
    "affordances": {
      "tags": [
        "physical",
        "portable",
        "element-tile",
        "printed-label"
      ],
      "canDo": [
        "label",
        "stamp"
      ],
      "canReceive": [
        "point",
        "read"
      ],
      "associations": [
        "periodic table",
        "Xe",
        "54",
        "flash lamp"
      ],
      "detail": "a tile carrying the element symbol and atomic number",
      "basis": "reviewed element representation"
    }
  },
  "electric eel": {
    "pos": "noun",
    "category": "animal",
    "number": "singular",
    "properties": [
      "animate"
    ],
    "affordances": {
      "tags": [
        "animal",
        "animate",
        "physical",
        "electric"
      ],
      "canDo": [
        "follow",
        "nudge",
        "sniff"
      ],
      "canReceive": [],
      "associations": [],
      "detail": "a long fish associated with electric discharges",
      "basis": "category and reviewed word properties"
    },
    "description": "a long fish associated with electric discharges"
  },
  "zigzagoon (pokemon)": {
    "pos": "proper noun",
    "category": "animal",
    "number": "singular",
    "proper": true,
    "properties": [
      "animate"
    ],
    "description": "a fictional raccoon-like Pokémon",
    "affordances": {
      "tags": [
        "animal",
        "animate",
        "physical"
      ],
      "canDo": [
        "nudge",
        "sniff"
      ],
      "canReceive": [
        "pet"
      ],
      "associations": [
        "fur",
        "paws"
      ],
      "detail": "a fictional animal character",
      "basis": "authored fictional character"
    }
  },
  "jay": {
    "pos": "proper noun",
    "category": "person",
    "number": "singular",
    "proper": true,
    "properties": [
      "animate"
    ],
    "affordances": {
      "tags": [
        "animate",
        "grasping",
        "person",
        "physical"
      ],
      "canDo": [
        "drink",
        "hold",
        "play",
        "pour"
      ],
      "canReceive": [],
      "associations": [],
      "detail": "a person named Jay",
      "basis": "category and reviewed word properties"
    },
    "namedPerson": true
  }
};
