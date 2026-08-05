const fs = require('fs');
let code = fs.readFileSync('frontend/app/hooks/useAppState.ts', 'utf8');

if (!code.includes('import { logError }')) {
  code = code.replace(/import \{ useState/, "import { logError } from '../lib/logger';\nimport { useState");
}

const catchRegex = /catch\s*\(\s*(err|e|error)(?:\s*:\s*any)?\s*\)\s*\{/g;

let match;
let newCode = '';
let lastIndex = 0;

while ((match = catchRegex.exec(code)) !== null) {
  const errVar = match[1];
  const catchIndex = match.index;
  
  // search backwards for async functions
  const beforeCatch = code.substring(0, catchIndex);
  const funcMatches = [...beforeCatch.matchAll(/(?:const|let|var|function)\s+(\w+)\s*(?:=\s*(?:useCallback\()?\s*async|\s*\(\s*async)/g)];
  
  let funcName = 'unknown';
  if (funcMatches.length > 0) {
    funcName = funcMatches[funcMatches.length - 1][1];
  } else {
    // fallback for regular functions or useEffect
    const allFuncs = [...beforeCatch.matchAll(/(?:const|let|var|function)\s+(\w+)\s*=?\s*(?:useCallback\()?/g)];
    if (allFuncs.length > 0) {
      funcName = allFuncs[allFuncs.length - 1][1];
    }
  }
  
  const logStatement = `\n      logError('useAppState:${funcName}', ${errVar}, { userId: currentUser?.userId });`;
  
  newCode += code.substring(lastIndex, catchIndex + match[0].length) + logStatement;
  lastIndex = catchIndex + match[0].length;
}

newCode += code.substring(lastIndex);

fs.writeFileSync('frontend/app/hooks/useAppState.ts', newCode);
console.log('Done replacing safely in useAppState.ts');
