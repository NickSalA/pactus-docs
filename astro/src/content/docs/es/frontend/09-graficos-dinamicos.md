---
title: "Graficos Dinamicos en Chatbot"
description: "Motor de renderizado de visualizaciones en el agente IA, con soporte para graficos de barras, lineas y pastel."
---

El sistema de聊天机器人 integra un motor de renderizado dinamico de graficos que permite al agente devolver visualizaciones junto con respuestas de texto.

## ChartRenderer

El componente principal es `ChartRenderer` ubicado en `src/features/aiAgent/components/widgets/ChartRenderer.tsx`. Implementa un patron de dispatch por tipo:

```typescript
export function ChartRenderer({ chart }: ChartRendererProps) {
  switch (chart.type) {
    case 'bar':
      return <BarChartWidget chart={chart} />;
    case 'line':
      return <LineChartWidget chart={chart} />;
    case 'pie':
      return <PieChartWidget chart={chart} />;
  }
}
```

## Tipos de Graficos

### BarChartWidget

Grafico de barras verticales para rankings y comparaciones.

**Props:** `chart: ApiChartData`

**Caracteristicas:**
- Layout vertical por defecto
- Colores personalizables por serie
- Tooltips con valores formateados

### LineChartWidget

Grafico de lineas para tendencias temporales.

**Props:** `chart: ApiChartData`

**Caracteristicas:**
- Linea punteada para datos proyectados (`is_forecast`)
- Gradient fill bajo la linea
- Soporte para multiples series

### PieChartWidget

Grafico de pastel o dona para distribuciones.

**Props:** `chart: ApiChartData`

**Caracteristicas:**
- Variantes `pie` y `donut`
- Labels con porcentajes
- Colores por segmento

## Tipo ApiChartData

```typescript
export interface ApiChartData {
  type: 'bar' | 'line' | 'pie';
  layout: 'vertical' | 'horizontal' | 'centric';
  title: string;
  config: {
    categoryKey: string;
    series: Array<{
      dataKey: string;
      name: string;
      color?: string;
    }>;
  };
  data: Record<string, string | number>[];
}
```

## Integracion con ChatMessage

El tipo `ChatMessage` en `src/features/aiAgent/lib/utils.ts` incluye el campo opcional `chart`:

```typescript
export type ChatMessage = {
  id: string;
  sender: 'user' | 'bot';
  content: string;
  timestamp: Date;
  chart?: ApiChartData;
};
```

En `ChatMessageList.tsx` se renderiza condicionalmente:

```tsx
{message.chart && <ChartRenderer chart={message.chart} />}
```

## Flujo de Datos

1. Usuario envia mensaje al chatbot via `POST /chatbot/`
2. Backend procesa la consulta y decide si devuelve visualizacion
3. Si hay visualizacion, `ApiChatResponse` incluye el objeto `chart`
4. El hook `useAiAgentPage` construye el `ChatMessage` con el chart adjunto
5. `ChatMessageList` detecta `message.chart` y renderiza `ChartRenderer`
6. `ChartRenderer` hace dispatch al widget correcto segun `chart.type`