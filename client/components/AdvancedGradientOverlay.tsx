import React from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Settings } from "lucide-react";

// Função para gerar CSS do gradiente
const generateGradientCSS = (settings: any) => {
  if (!settings.overlay_gradient_enabled) return settings.overlay_color || '#000000';
  
  const hexToRgba = (hex: string, opacity: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
  };

  const startColor = hexToRgba(settings.overlay_gradient_start || '#000000', settings.overlay_gradient_start_opacity || 80);
  const centerColor = hexToRgba(settings.overlay_gradient_center_color || '#000000', settings.overlay_gradient_center_opacity || 0);
  const endColor = hexToRgba(settings.overlay_gradient_end || '#000000', settings.overlay_gradient_end_opacity || 90);
  
  const startPos = settings.overlay_gradient_start_position || 20;
  const centerPos = settings.overlay_gradient_center_position || 50;
  const endPos = settings.overlay_gradient_end_position || 80;

  if (settings.overlay_gradient_direction === 'radial') {
    return `radial-gradient(ellipse at center, ${startColor} ${startPos}%, ${centerColor} ${centerPos}%, ${endColor} ${endPos}%)`;
  } else {
    return `linear-gradient(${settings.overlay_gradient_direction || 'to bottom'}, ${startColor} ${startPos}%, ${centerColor} ${centerPos}%, ${endColor} ${endPos}%)`;
  }
};

interface AdvancedGradientOverlayProps {
  localSettings: any;
  updateField: (field: string, value: any) => void;
}

export default function AdvancedGradientOverlay({ localSettings, updateField }: AdvancedGradientOverlayProps) {
  // Aplicar presets de gradiente
  const applyPreset = (presetName: string) => {
    const presets = {
      blackTransparentBlack: {
        overlay_gradient_direction: 'radial',
        overlay_gradient_start: '#000000',
        overlay_gradient_center_color: '#000000',
        overlay_gradient_end: '#000000',
        overlay_gradient_start_opacity: 90,
        overlay_gradient_center_opacity: 0,
        overlay_gradient_end_opacity: 95,
        overlay_gradient_start_position: 20,
        overlay_gradient_center_position: 50,
        overlay_gradient_end_position: 80,
        overlay_gradient_enabled: true
      },
      centerTransparent: {
        overlay_gradient_direction: 'radial',
        overlay_gradient_start: '#000000',
        overlay_gradient_center_color: '#000000',
        overlay_gradient_end: '#000000',
        overlay_gradient_start_opacity: 0,
        overlay_gradient_center_opacity: 0,
        overlay_gradient_end_opacity: 80,
        overlay_gradient_start_position: 0,
        overlay_gradient_center_position: 30,
        overlay_gradient_end_position: 70,
        overlay_gradient_enabled: true
      },
      darkEdges: {
        overlay_gradient_direction: 'radial',
        overlay_gradient_start: '#000000',
        overlay_gradient_center_color: '#000000',
        overlay_gradient_end: '#000000',
        overlay_gradient_start_opacity: 30,
        overlay_gradient_center_opacity: 10,
        overlay_gradient_end_opacity: 70,
        overlay_gradient_start_position: 10,
        overlay_gradient_center_position: 40,
        overlay_gradient_end_position: 90,
        overlay_gradient_enabled: true
      },
      vignette: {
        overlay_gradient_direction: 'radial',
        overlay_gradient_start: '#000000',
        overlay_gradient_center_color: '#000000',
        overlay_gradient_end: '#000000',
        overlay_gradient_start_opacity: 0,
        overlay_gradient_center_opacity: 20,
        overlay_gradient_end_opacity: 60,
        overlay_gradient_start_position: 30,
        overlay_gradient_center_position: 60,
        overlay_gradient_end_position: 100,
        overlay_gradient_enabled: true
      }
    };

    const preset = presets[presetName as keyof typeof presets];
    if (preset) {
      Object.entries(preset).forEach(([key, value]) => {
        updateField(key, value);
      });
    }
  };

  return (
    <Card className="bg-white shadow-sm border border-gray-200">
      <CardHeader>
        <CardTitle className="text-gray-900 flex items-center">
          <Settings className="w-5 h-5 mr-2 text-ecko-red" />
          Gradiente Avançado
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={localSettings.overlay_gradient_enabled || false}
              onChange={(e) => updateField("overlay_gradient_enabled", e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm font-medium text-gray-700">
              Usar gradiente no overlay
            </span>
          </label>
        </div>

        {localSettings.overlay_gradient_enabled && (
          <>
            {/* Preview do Gradiente */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Preview do Gradiente
              </label>
              <div className="h-20 rounded-lg border border-gray-300 relative overflow-hidden">
                <div 
                  className="absolute inset-0"
                  style={{
                    background: generateGradientCSS(localSettings)
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-sm font-medium drop-shadow-lg">
                    Preview do Overlay
                  </span>
                </div>
              </div>
            </div>

            {/* Presets Rápidos */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Presets Rápidos
              </label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => applyPreset("blackTransparentBlack")}
                  className="text-xs"
                >
                  Preto → Transparente → Preto
                </Button>
                <Button
                  type="button"
                  variant="outline" 
                  size="sm"
                  onClick={() => applyPreset("centerTransparent")}
                  className="text-xs"
                >
                  Centro Transparente
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => applyPreset("darkEdges")}
                  className="text-xs"
                >
                  Bordas Escuras
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => applyPreset("vignette")}
                  className="text-xs"
                >
                  Vinheta
                </Button>
              </div>
            </div>

            {/* Tipo de Gradiente */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Tipo de Gradiente
              </label>
              <select
                value={localSettings.overlay_gradient_direction || "radial"}
                onChange={(e) => updateField("overlay_gradient_direction", e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="radial">Radial (Centro para Fora)</option>
                <option value="to bottom">Linear Vertical (Topo → Base)</option>
                <option value="to top">Linear Vertical (Base → Topo)</option>
                <option value="to right">Linear Horizontal (Esquerda → Direita)</option>
                <option value="to left">Linear Horizontal (Direita → Esquerda)</option>
              </select>
            </div>

            {/* Controles de 3 Pontos do Gradiente */}
            <div className="space-y-3">
              {/* Ponto Inicial */}
              <div className="p-3 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-2 text-sm">Ponto Inicial ({localSettings.overlay_gradient_start_position || 20}%)</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs text-gray-600">Cor</label>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="color"
                        value={localSettings.overlay_gradient_start || "#000000"}
                        onChange={(e) => updateField("overlay_gradient_start", e.target.value)}
                        className="w-8 h-6 p-0 border rounded"
                      />
                      <Input
                        value={localSettings.overlay_gradient_start || "#000000"}
                        onChange={(e) => updateField("overlay_gradient_start", e.target.value)}
                        className="flex-1 text-xs h-6"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs text-gray-600">Opacidade: {localSettings.overlay_gradient_start_opacity || 80}%</label>
                    <Input
                      type="range"
                      min="0"
                      max="100"
                      value={localSettings.overlay_gradient_start_opacity || 80}
                      onChange={(e) => updateField("overlay_gradient_start_opacity", parseInt(e.target.value))}
                      className="w-full h-6"
                    />
                  </div>
                </div>
                <div className="mt-2">
                  <label className="block text-xs text-gray-600">Posição: {localSettings.overlay_gradient_start_position || 20}%</label>
                  <Input
                    type="range"
                    min="0"
                    max="100"
                    value={localSettings.overlay_gradient_start_position || 20}
                    onChange={(e) => updateField("overlay_gradient_start_position", parseInt(e.target.value))}
                    className="w-full h-6"
                  />
                </div>
              </div>

              {/* Ponto Central */}
              <div className="p-3 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-2 text-sm">Ponto Central ({localSettings.overlay_gradient_center_position || 50}%)</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs text-gray-600">Cor</label>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="color"
                        value={localSettings.overlay_gradient_center_color || "#000000"}
                        onChange={(e) => updateField("overlay_gradient_center_color", e.target.value)}
                        className="w-8 h-6 p-0 border rounded"
                      />
                      <Input
                        value={localSettings.overlay_gradient_center_color || "#000000"}
                        onChange={(e) => updateField("overlay_gradient_center_color", e.target.value)}
                        className="flex-1 text-xs h-6"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs text-gray-600">Opacidade: {localSettings.overlay_gradient_center_opacity || 0}%</label>
                    <Input
                      type="range"
                      min="0"
                      max="100"
                      value={localSettings.overlay_gradient_center_opacity || 0}
                      onChange={(e) => updateField("overlay_gradient_center_opacity", parseInt(e.target.value))}
                      className="w-full h-6"
                    />
                  </div>
                </div>
                <div className="mt-2">
                  <label className="block text-xs text-gray-600">Posição: {localSettings.overlay_gradient_center_position || 50}%</label>
                  <Input
                    type="range"
                    min="0"
                    max="100"
                    value={localSettings.overlay_gradient_center_position || 50}
                    onChange={(e) => updateField("overlay_gradient_center_position", parseInt(e.target.value))}
                    className="w-full h-6"
                  />
                </div>
              </div>

              {/* Ponto Final */}
              <div className="p-3 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-2 text-sm">Ponto Final ({localSettings.overlay_gradient_end_position || 80}%)</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs text-gray-600">Cor</label>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="color"
                        value={localSettings.overlay_gradient_end || "#000000"}
                        onChange={(e) => updateField("overlay_gradient_end", e.target.value)}
                        className="w-8 h-6 p-0 border rounded"
                      />
                      <Input
                        value={localSettings.overlay_gradient_end || "#000000"}
                        onChange={(e) => updateField("overlay_gradient_end", e.target.value)}
                        className="flex-1 text-xs h-6"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs text-gray-600">Opacidade: {localSettings.overlay_gradient_end_opacity || 90}%</label>
                    <Input
                      type="range"
                      min="0"
                      max="100"
                      value={localSettings.overlay_gradient_end_opacity || 90}
                      onChange={(e) => updateField("overlay_gradient_end_opacity", parseInt(e.target.value))}
                      className="w-full h-6"
                    />
                  </div>
                </div>
                <div className="mt-2">
                  <label className="block text-xs text-gray-600">Posição: {localSettings.overlay_gradient_end_position || 80}%</label>
                  <Input
                    type="range"
                    min="0"
                    max="100"
                    value={localSettings.overlay_gradient_end_position || 80}
                    onChange={(e) => updateField("overlay_gradient_end_position", parseInt(e.target.value))}
                    className="w-full h-6"
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// Exportar também a função para usar em outros componentes
export { generateGradientCSS };
