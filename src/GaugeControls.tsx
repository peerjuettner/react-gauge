import * as React from 'react';
import { Style } from './GaugeContainer';

export interface IGaugeControlsProps {
    onSetSlider(key: string, value: number): void
    onSetCheckbox(key: string, value: boolean): void
    onStartAnimation(): void;
    onSetStyle(s: string): void;
    progress: number;
    threshold: number;
    size: number;
}

export function GaugeControls(props: IGaugeControlsProps) {
    return (
        <form>
            <select id="styleDropdown" onChange={(e) => props.onSetStyle(e.currentTarget.value)}>
                {Object.values(Style).map(v =>
                    <option value={v}>{v}</option>
                )}
            </select>
            <br />
            <input id="button" type="button" onClick={() => props.onStartAnimation()} value="Animate"></input>
            <br />
            <label htmlFor="progress" >Progress:</label>
            <input type="range" min="0" max="100" id="progress" value={props.progress} onChange={e => props.onSetSlider("progress", e.currentTarget.valueAsNumber)} />
            <br />
            <label htmlFor="threshold" >Threshold:</label>
            <input type="range" min="0" max="100" id="threshold" value={props.threshold} onChange={e => props.onSetSlider("threshold", e.currentTarget.valueAsNumber)} />
            <br />
            <label htmlFor="size" >Size:</label>
            <input type="range" min="0" max="100" id="size" value={props.size} onChange={e => props.onSetSlider("size", e.currentTarget.valueAsNumber)} />
            <br />
            <label htmlFor="hasThumb">Show thumb?</label>
            <input type="checkbox" onChange={e => props.onSetCheckbox("showThumb", e.target.checked)}></input>
        </form>
    );
}