import * as React from 'react';
import { GaugeControls } from './GaugeControls';
import GaugeView from './GaugeView';

export enum Style {
    classic = "classic",
    citrus = "citrus",
    elegant = "elegant",
}


export interface IGaugeContainerState {
    progress: number;
    threshold: number;
    size: number;
    showThumb: boolean;
    style: string;
}

export default class GaugeContainer extends React.Component<{}, IGaugeContainerState> {
    constructor(props: {}) {
        super(props);
        this.state = {
            progress: 50, showThumb: false, size: 50, style: Style.classic, threshold: 50
        }
    }

    onSetSlider = (key: string, value: number) => {
        this.setState({ ...this.state, [key]: value });
    }
    onSetCheckbox = (key: string, value: boolean) => {
        this.setState({ ...this.state, [key]: value })
    }
    onStartAnimation = async () => {
        for (let i = 0; i < 101; i++) {
            this.setState({ ...this.state, progress: i })
            await this.sleep(5)
        }
    }
    sleep = async (msec: number) => {
        return new Promise(resolve => setTimeout(resolve, msec));
    }
    onSetStyle = (s: string) => {
        this.setState({ ...this.state, style: s })
    }


    public render() {
        return (
            <div>
                <GaugeView progress={this.state.progress} threshold={this.state.threshold} size={this.state.size} showThumb={this.state.showThumb} style={this.state.style} onSetSlider={this.onSetSlider}></GaugeView>
                <GaugeControls progress={this.state.progress} threshold={this.state.threshold} size={this.state.size} onSetSlider={this.onSetSlider} onSetCheckbox={this.onSetCheckbox} onStartAnimation={this.onStartAnimation} onSetStyle={this.onSetStyle}></GaugeControls>
            </div>
        );
    }
}
