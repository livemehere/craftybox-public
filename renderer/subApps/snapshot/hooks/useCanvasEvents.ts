import { useEffect, useRef } from 'react';

import { TToolKey, TToggleKey } from '../components/Tools';
import Stage from '@/lib/Canvas/Core/Stage';
import Layer from '@/lib/Canvas/Core/Layer/Core/Layer';
import { createLayer } from '../utils/layerFactory';

interface UseCanvasEventsProps {
    stage: Stage | undefined;
    activeToolKey: TToolKey;
    strokeWidth: number;
    color: string;
    toggleKeys: TToggleKey[];
    fontSize: number;
    curLabelNumber: number;
    setActiveToolKey: (key: TToolKey) => void;
    setCurLabelNumber: (fn: (prev: number) => number) => void;
    allDraggable: () => (() => void)[];
    dash: number[];
}

export const useCanvasEvents = ({
    stage,
    activeToolKey,
    strokeWidth,
    color,
    toggleKeys,
    fontSize,
    curLabelNumber,
    setActiveToolKey,
    setCurLabelNumber,
    allDraggable,
    dash,
}: UseCanvasEventsProps) => {
    const offListenersRef = useRef<(() => void)[]>([]);
    const currentLayerRef = useRef<any>(null);

    useEffect(() => {
        if (!stage) return;

        if (activeToolKey === 'select') {
            offListenersRef.current = allDraggable();
        } else {
            offListenersRef.current?.forEach((off) => off());
        }

        const handlePointerDown = (e: any) => {
            const layerConfig = {
                pointerX: e.pointerX,
                pointerY: e.pointerY,
                strokeWidth,
                strokeStyle: color,
                fillStyle: color,
                fontSize,
                dash: toggleKeys.includes('dash') ? dash : undefined
            };

            const result = createLayer(
                activeToolKey,
                layerConfig,
                stage,
                curLabelNumber,
                setActiveToolKey,
                setCurLabelNumber
            );

            if (result?.layer) {
                currentLayerRef.current = result.layer;
                stage.root.addChild(result.layer);
                stage.render();
            }
        };

        const handlePointerMove = (e: any) => {
            const layer = currentLayerRef.current;
            if (!layer) return;

            if (Layer.isLineLayer(layer)) {
                layer.x2 = e.pointerX;
                layer.y2 = e.pointerY;
            } else {
                layer.width = e.pointerX - layer.x;
                layer.height = e.pointerY - layer.y;
            }
            stage.render();
        };

        const handlePointerUp = () => {
            currentLayerRef.current = null;
        };

        const downOff = stage.on('pointerdown', handlePointerDown);
        const moveOff = stage.on('pointermove', handlePointerMove);
        const upOff = stage.on('pointerup', handlePointerUp);

        return () => {
            downOff();
            moveOff();
            upOff();
            offListenersRef.current?.forEach((off) => off());
        };
    }, [
        stage,
        activeToolKey,
        strokeWidth,
        color,
        toggleKeys,
        fontSize,
        curLabelNumber,
        setActiveToolKey,
        setCurLabelNumber,
        allDraggable,
        dash,
    ]);
}; 