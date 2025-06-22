import RectLayer from '@/lib/Canvas/Core/Layer/Shapes/RectLayer';
import { EllipseLayer } from '@/lib/Canvas/Core/Layer/Shapes/EllipseLayer';
import ArrowLayer from '@/lib/Canvas/Core/Layer/Shapes/ArrowLayer';
import LineLayer from '@/lib/Canvas/Core/Layer/Shapes/LineLayer';
import TextLayer from '@/lib/Canvas/Core/Layer/Shapes/TextLayer';
import FrameLayer from '@/lib/Canvas/Core/Layer/Container/FrameLayer';
import Stage from '@/lib/Canvas/Core/Stage';
import Transform from '@/lib/Canvas/Core/Helper/Transform';
import { TToolKey } from '../components/Tools';

interface LayerConfig {
    pointerX: number;
    pointerY: number;
    strokeWidth: number;
    strokeStyle: string;
    fillStyle: string;
    fontSize: number;
    dash?: number[];
}

interface LayerFactoryResult {
    layer: any;
    cleanup?: () => void;
}

export const createLayer = (
    toolKey: TToolKey,
    config: LayerConfig,
    stage: Stage,
    curLabelNumber: number,
    setActiveToolKey: (key: TToolKey) => void,
    setCurLabelNumber: (fn: (prev: number) => number) => void
): LayerFactoryResult | null => {
    const { pointerX, pointerY, strokeWidth, strokeStyle, fillStyle, fontSize, dash } = config;

    const strokes = { strokeWidth, strokeStyle, dash };
    const fills = { fillStyle };
    const linePos = { x1: pointerX, y1: pointerY, x2: pointerX, y2: pointerY };
    const boxPos = { x: pointerX, y: pointerY };

    switch (toolKey) {
        case 'select':
            return null;

        case 'rect':
            return { layer: new RectLayer({ ...boxPos, ...strokes }) };

        case 'ellipse':
            return { layer: new EllipseLayer({ ...boxPos, ...strokes }) };

        case 'arrow':
            return { layer: new ArrowLayer({ ...linePos, ...strokes }) };

        case 'line':
            return { layer: new LineLayer({ ...linePos, ...strokes }) };

        case 'text': {
            const layer = new TextLayer({
                ...boxPos,
                ...fills,
                text: '',
                strokeWidth: 0,
                fontSize
            });

            const cleanup = Transform.textEditable(stage, layer as TextLayer, {
                onBlur: () => {
                    cleanup();
                    setActiveToolKey('select');
                }
            });

            return { layer, cleanup };
        }

        case 'label': {
            const group = new FrameLayer({
                ...boxPos,
                width: 20,
                height: 20
            });

            group.x -= group.width / 2;
            group.y -= group.height / 2;

            const count = new TextLayer({
                text: `${curLabelNumber}`,
                fontSize: 14,
                fillStyle: '#fff',
                strokeWidth: 0
            });

            stage.measureAndUpdateTextLayer(count);
            count.x = group.width / 2 - count.width / 2;
            count.y = group.height / 2 - count.height / 2;

            const bg = new EllipseLayer({
                width: group.width,
                height: group.height,
                ...fills
            });

            group.addChild(bg);
            group.addChild(count);
            group.addTag('label');

            setCurLabelNumber(prev => prev + 1);

            return { layer: group };
        }

        default:
            throw new Error(`Invalid tool key: ${toolKey}`);
    }
}; 