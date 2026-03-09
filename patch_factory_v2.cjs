const fs = require('fs');
let code = fs.readFileSync('src/core/CharacterFactory.ts', 'utf8');

// Mapping characters to sheets and rows
const mappings = {
  // Judgment (judgment_ability_icons.png)
  '_CAN_': { sheet: 'judgment_ability_icons.png', iconRow: 0 },
  '_DCY_': { sheet: 'judgment_ability_icons.png', iconRow: 1 },
  '_VOD_': { sheet: 'judgment_ability_icons.png', iconRow: 2 },
  '_SHD_': { sheet: 'judgment_ability_icons.png', iconRow: 2 }, // reuse void
  '_DTH_': { sheet: 'judgment_ability_icons.png', iconRow: 3 },

  // Order (order_ability_icons.png)
  '_CHR_': { sheet: 'order_ability_icons.png', iconRow: 0 },
  '_GRV_': { sheet: 'order_ability_icons.png', iconRow: 1 },
  '_MAG_': { sheet: 'order_ability_icons.png', iconRow: 2 },
  '_TRU_': { sheet: 'order_ability_icons.png', iconRow: 3 },

  // Chaos (chaos_ability_icons.png)
  '_FIR_': { sheet: 'chaos_ability_icons.png', iconRow: 0 },
  '_EAR_': { sheet: 'chaos_ability_icons.png', iconRow: 1 },
  '_WAT_': { sheet: 'chaos_ability_icons.png', iconRow: 2 },
  '_AIR_': { sheet: 'chaos_ability_icons.png', iconRow: 3 },

  // Love (love_ability_icons.png)
  '_LIF_': { sheet: 'love_ability_icons.png', iconRow: 0 },
  '_BLD_': { sheet: 'love_ability_icons.png', iconRow: 1 },
  '_GRW_': { sheet: 'love_ability_icons.png', iconRow: 2 },
  '_DRM_': { sheet: 'love_ability_icons.png', iconRow: 3 },
};

let replacedCount = 0;
// Replace ability icons
Object.keys(mappings).forEach(key => {
    const { sheet, iconRow } = mappings[key];
    
    for (let c = 0; c < 4; c++) {
        const suffixes = ['_ATK', '_SP1', '_SP2', '_ULT'];
        // Remove trailing _ since it's ABIL_CAN_ATK
        const rawKey = key.replace(/_/g, ''); 
        const abilKey = `ABIL_${rawKey}${suffixes[c]}`;
        
        const search = new RegExp(`({ id: '${abilKey}'[^}]*?iconUrl: '[^']*'[^}]*?)(})`, 'g');
        const before = code;
        code = code.replace(search, `$1, iconSprite: { sheet: '${sheet}', row: ${iconRow}, col: ${c} } $2`);
        if (code !== before) replacedCount++;
    }
});

console.log('Replaced', replacedCount, 'abilities');

// Update character portraits assignment
const portraitAddition = `
    let portraitSheet = { sheet: 'character_portraits.png', row: 0, col: 0 };
    if (baseData.id.includes('_CAN_')) portraitSheet = { sheet: 'character_portraits.png', row: 0, col: 0 };
    else if (baseData.id.includes('_DCY_')) portraitSheet = { sheet: 'character_portraits.png', row: 0, col: 1 };
    else if (baseData.id.includes('_VOD_')) portraitSheet = { sheet: 'character_portraits.png', row: 0, col: 2 };
    else if (baseData.id.includes('_SHD_')) portraitSheet = { sheet: 'character_portraits.png', row: 0, col: 3 };
    else if (baseData.id.includes('_DTH_')) portraitSheet = { sheet: 'character_portraits.png', row: 1, col: 0 };
    else if (baseData.id.includes('_CHR_')) portraitSheet = { sheet: 'character_portraits.png', row: 1, col: 1 };
    else if (baseData.id.includes('_GRV_')) portraitSheet = { sheet: 'character_portraits.png', row: 1, col: 2 };
    else if (baseData.id.includes('_MAG_')) portraitSheet = { sheet: 'character_portraits.png', row: 1, col: 3 };
    else if (baseData.id.includes('_TRU_')) portraitSheet = { sheet: 'character_portraits.png', row: 2, col: 0 };
    else if (baseData.id.includes('_FIR_')) portraitSheet = { sheet: 'character_portraits.png', row: 2, col: 1 };
    else if (baseData.id.includes('_EAR_')) portraitSheet = { sheet: 'character_portraits.png', row: 2, col: 2 };
    else if (baseData.id.includes('_WAT_')) portraitSheet = { sheet: 'character_portraits.png', row: 2, col: 3 };
    else if (baseData.id.includes('_AIR_')) portraitSheet = { sheet: 'character_portraits.png', row: 3, col: 0 };
    else if (baseData.id.includes('_LIF_')) portraitSheet = { sheet: 'character_portraits.png', row: 3, col: 1 };
    else if (baseData.id.includes('_BLD_')) portraitSheet = { sheet: 'character_portraits.png', row: 3, col: 2 };
    else if (baseData.id.includes('_GRW_')) portraitSheet = { sheet: 'character_portraits.png', row: 3, col: 3 };
    else if (baseData.id.includes('_DRM_')) portraitSheet = { sheet: 'character_portraits.png', row: 0, col: 0 };
`;

if (!code.includes('portraitSheet = { sheet:')) {
    code = code.replace(
        /const activeChar: ActiveCharacter = {/g, 
        portraitAddition + '\n    const activeChar: ActiveCharacter = {'
    );

    code = code.replace(
        /portraitUrl,/g,
        'portraitUrl,\n      portraitSprite: portraitSheet as any,'
    );
}

fs.writeFileSync('src/core/CharacterFactory.ts', code);
