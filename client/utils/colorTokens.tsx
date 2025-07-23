import React from 'react';

// Tokens de cor pré-definidos
export const COLOR_TOKENS = {
  'ecko': '#dc2626',      // Vermelho Ecko
  'red': '#dc2626',       // Vermelho
  'blue': '#2563eb',      // Azul
  'green': '#16a34a',     // Verde
  'purple': '#7c3aed',    // Roxo
  'orange': '#ea580c',    // Laranja
  'yellow': '#ca8a04',    // Amarelo
  'white': '#ffffff',     // Branco
  'black': '#000000',     // Preto
  'gray': '#6b7280',      // Cinza
};

/**
 * Renderiza texto com tokens de cor como {ecko}PALAVRA{/ecko}
 * @param text - Texto com tokens de cor
 * @param className - Classes CSS adicionais
 * @returns JSX com texto renderizado com cores
 */
export function renderTextWithColorTokens(text: string, className?: string): React.ReactNode {
  if (!text) return text;

  const tokenRegex = /\{(\w+)\}(.*?)\{\/\1\}/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;
  let keyIndex = 0;

  while ((match = tokenRegex.exec(text)) !== null) {
    const [fullMatch, colorName, content] = match;
    const matchStart = match.index;
    
    // Adicionar texto antes do token
    if (matchStart > lastIndex) {
      const beforeText = text.substring(lastIndex, matchStart);
      if (beforeText) {
        parts.push(
          <span key={`text-${keyIndex++}`} className={className}>
            {beforeText}
          </span>
        );
      }
    }
    
    // Adicionar texto com cor do token
    const color = COLOR_TOKENS[colorName as keyof typeof COLOR_TOKENS];
    if (color) {
      parts.push(
        <span 
          key={`token-${keyIndex++}`}
          style={{ color: color }}
          className={`font-bold ${className || ''}`}
        >
          {content}
        </span>
      );
    } else {
      // Token inválido, mostrar como texto normal
      parts.push(
        <span key={`invalid-${keyIndex++}`} className={className}>
          {fullMatch}
        </span>
      );
    }
    
    lastIndex = tokenRegex.lastIndex;
  }
  
  // Adicionar texto restante
  if (lastIndex < text.length) {
    const remainingText = text.substring(lastIndex);
    if (remainingText) {
      parts.push(
        <span key={`remaining-${keyIndex++}`} className={className}>
          {remainingText}
        </span>
      );
    }
  }
  
  // Se não há tokens, retornar texto simples
  if (parts.length === 0) {
    return <span className={className}>{text}</span>;
  }
  
  return <>{parts}</>;
}

/**
 * Remove todos os tokens de cor do texto
 * @param text - Texto com tokens
 * @returns Texto limpo sem tokens
 */
export function removeColorTokens(text: string): string {
  if (!text) return text;
  return text.replace(/\{(\w+)\}(.*?)\{\/\1\}/g, '$2');
}

/**
 * Conta quantos tokens de cada cor estão sendo usados
 * @param text - Texto com tokens
 * @returns Objeto com contagem de cada token
 */
export function countColorTokens(text: string): Record<string, number> {
  const counts: Record<string, number> = {};
  
  Object.keys(COLOR_TOKENS).forEach(colorName => {
    const tokenRegex = new RegExp(`\\{${colorName}\\}.*?\\{\\/${colorName}\\}`, 'g');
    const matches = text.match(tokenRegex);
    if (matches) {
      counts[colorName] = matches.length;
    }
  });
  
  return counts;
}

/**
 * Valida se os tokens de cor estão bem formados
 * @param text - Texto com tokens
 * @returns Array de erros encontrados
 */
export function validateColorTokens(text: string): string[] {
  const errors: string[] = [];
  
  // Verificar tokens não fechados
  const openTokenRegex = /\{(\w+)\}/g;
  const completeTokenRegex = /\{(\w+)\}.*?\{\/\1\}/g;
  
  let openMatch;
  const openTokens: Array<{name: string, index: number}> = [];
  
  while ((openMatch = openTokenRegex.exec(text)) !== null) {
    openTokens.push({
      name: openMatch[1],
      index: openMatch.index
    });
  }
  
  let completeMatch;
  const completeTokens: Array<{name: string, index: number}> = [];
  
  while ((completeMatch = completeTokenRegex.exec(text)) !== null) {
    completeTokens.push({
      name: completeMatch[1],
      index: completeMatch.index
    });
  }
  
  // Verificar tokens órfãos
  openTokens.forEach(openToken => {
    const hasComplete = completeTokens.some(complete => 
      complete.name === openToken.name && complete.index === openToken.index
    );
    
    if (!hasComplete) {
      errors.push(`Token "${openToken.name}" não foi fechado corretamente`);
    }
  });
  
  // Verificar cores inválidas
  completeTokens.forEach(token => {
    if (!COLOR_TOKENS[token.name as keyof typeof COLOR_TOKENS]) {
      errors.push(`Cor "${token.name}" não é válida`);
    }
  });
  
  return errors;
}
