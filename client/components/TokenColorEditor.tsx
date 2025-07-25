import React, { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Badge } from './ui/badge';
import { 
  Type, 
  Palette, 
  Plus, 
  Eye, 
  EyeOff, 
  Info 
} from 'lucide-react';

interface TokenColorEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  label?: string;
  className?: string;
  showColors?: boolean;
}

// Tokens de cor pré-definidos
const COLOR_TOKENS = {
  'ecko': '#dc2626',      // Vermelho Ecko
  'blue': '#2563eb',      // Azul
  'green': '#16a34a',     // Verde
  'orange': '#ea580c',    // Laranja
  'yellow': '#ca8a04',    // Amarelo
  'white': '#ffffff',     // Branco
  'black': '#000000',     // Preto
};

export function TokenColorEditor({
  value,
  onChange,
  placeholder = "Digite seu texto...",
  rows = 4,
  label,
  className = "",
  showColors = false
}: TokenColorEditorProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Função para inserir token de cor
  const insertColorToken = (color: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    let newText;
    if (selectedText) {
      // Se há texto selecionado, envolve com o token
      newText = value.substring(0, start) + 
                `{${color}}${selectedText}{/${color}}` + 
                value.substring(end);
    } else {
      // Se não há seleção, insere token vazio
      newText = value.substring(0, start) + 
                `{${color}}texto{/${color}}` + 
                value.substring(start);
    }
    
    onChange(newText);
    
    // Focar e posicionar cursor após inserir
    setTimeout(() => {
      textarea.focus();
      const newPosition = selectedText 
        ? start + `{${color}}${selectedText}{/${color}}`.length
        : start + `{${color}}texto`.length;
      textarea.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  // Função para renderizar texto com tokens de cor
  const renderTextWithTokens = (text: string) => {
    const tokenRegex = /\{(\w+)\}(.*?)\{\/\1\}/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = tokenRegex.exec(text)) !== null) {
      const [fullMatch, colorName, content] = match;
      const matchStart = match.index;
      
      // Adicionar texto antes do token
      if (matchStart > lastIndex) {
        parts.push(text.substring(lastIndex, matchStart));
      }
      
      // Adicionar texto com cor do token
      const color = COLOR_TOKENS[colorName as keyof typeof COLOR_TOKENS];
      if (color) {
        parts.push(
          <span 
            key={`token-${matchStart}`}
            style={{ color: color, fontWeight: 'bold' }}
          >
            {content}
          </span>
        );
      } else {
        // Token inválido, mostrar como texto normal
        parts.push(fullMatch);
      }
      
      lastIndex = tokenRegex.lastIndex;
    }
    
    // Adicionar texto restante
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }
    
    return parts;
  };

  // Função para limpar tokens do texto
  const getCleanText = (text: string) => {
    return text.replace(/\{(\w+)\}(.*?)\{\/\1\}/g, '$2');
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">
            {label}
          </label>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
            >
              {showPreview ? (
                <EyeOff className="w-3 h-3 mr-1" />
              ) : (
                <Eye className="w-3 h-3 mr-1" />
              )}
              {showPreview ? 'Editar' : 'Preview'}
            </Button>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs"
                >
                  <Info className="w-3 h-3 mr-1" />
                  Ajuda
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 text-sm">
                <div className="space-y-2">
                  <h4 className="font-semibold">Como usar tokens de cor:</h4>
                  <div className="space-y-1 text-xs">
                    <p>• Selecione texto e clique em uma cor para aplicar</p>
                    <p>• Use <code>{`{ecko}texto{/ecko}`}</code> para texto vermelho Ecko</p>
                    <p>• Use <code>{`{blue}texto{/blue}`}</code> para texto azul</p>
                    <p>• Cores disponíveis: ecko, blue, green, orange, yellow, white, black</p>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      )}

      {/* Botões de cores */}
      <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg border">
        <div className="flex items-center gap-2 mr-4">
          <Palette className="w-4 h-4 text-gray-600" />
          <span className="text-xs font-medium text-gray-600">Cores:</span>
        </div>
        
        {Object.entries(COLOR_TOKENS).map(([name, color]) => (
          <Button
            key={name}
            type="button"
            onClick={() => insertColorToken(name)}
            className="h-7 px-2 text-xs border border-gray-300 hover:border-gray-400"
            style={{ 
              backgroundColor: color === '#ffffff' ? '#f8f9fa' : color,
              color: ['#ffffff', '#ca8a04'].includes(color) ? '#000000' : '#ffffff',
              borderColor: color === '#ffffff' ? '#d1d5db' : color
            }}
          >
            {name}
          </Button>
        ))}
      </div>

      {/* Editor ou Preview */}
      {showPreview ? (
        <div className="min-h-24 p-3 border border-gray-300 rounded-md bg-white">
          <div className="text-sm leading-relaxed">
            {renderTextWithTokens(value)}
          </div>
        </div>
      ) : (
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className="font-mono text-sm"
          onSelect={(e) => {
            const target = e.target as HTMLTextAreaElement;
            setCursorPosition(target.selectionStart);
          }}
        />
      )}

      {/* Contador de tokens */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-4">
          <span>
            Texto limpo: {getCleanText(value).length} caracteres
          </span>
          <span>
            Com tokens: {value.length} caracteres
          </span>
        </div>
        
        {/* Badges dos tokens usados */}
        <div className="flex gap-1">
          {Object.keys(COLOR_TOKENS).map(colorName => {
            const tokenRegex = new RegExp(`\\{${colorName}\\}.*?\\{\\/${colorName}\\}`, 'g');
            const matches = value.match(tokenRegex);
            if (matches && matches.length > 0) {
              return (
                <Badge
                  key={colorName}
                  variant="outline"
                  className="h-5 px-1 text-xs"
                  style={{
                    borderColor: COLOR_TOKENS[colorName as keyof typeof COLOR_TOKENS],
                    color: COLOR_TOKENS[colorName as keyof typeof COLOR_TOKENS]
                  }}
                >
                  {colorName} ({matches.length})
                </Badge>
              );
            }
            return null;
          })}
        </div>
      </div>
    </div>
  );
}
