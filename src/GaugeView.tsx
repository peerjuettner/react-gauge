import * as React from 'react';
import { Styles } from './Constants';



export interface IGaugeViewProps {
    progress: number;
    threshold: number;
    size: number;
    showThumb: boolean;
    style: string;
    onSetSlider(key: string, value: number): void;
}
const canvasRef = React.createRef<HTMLCanvasElement>()


export default class GaugeView extends React.Component<IGaugeViewProps> {
    static defaultProps: IGaugeViewProps = {
        progress: 50,
        threshold: 50,
        size: 50,
        style: "classic",
        showThumb: false,
        onSetSlider: (key: string, value: number) => { }
    }

    componentDidMount = () => {
        this.updateCanvas(GaugeView.defaultProps);
        this.registerForMouseAndTouch(canvasRef.current!);

    }

    componentWillReceiveProps = (props: IGaugeViewProps) => {
        this.updateCanvas(props);
    }

    updateCanvas(props: IGaugeViewProps) {
        const canvas = canvasRef.current;
        if (!canvas) { return };
        canvas.width = canvas.height = 200 + 4 * props.size;
        const centerx = canvas.width / 2;
        const centery = canvas.height / 2;
        const radius = Math.min(centerx, centery);
        const ctx = canvas.getContext('2d');
        if (!ctx) { return };

        const clockwise = false;
        const getCSS = (propname: string) => window.getComputedStyle(canvas, null).getPropertyValue(propname).toString().trim();
        // from 0-100 % to position on the circle circumference, 0 should be at the top
        const adjust = (fraction: number) => (fraction - 0.25) * 2.0 * Math.PI;
        const gradient = (radius: number, color: any) => {
            const grad = ctx!.createRadialGradient(centerx, centery, 0, centerx, centery, radius * 2);
            grad.addColorStop(0, "white");
            grad.addColorStop(1, color);
            return grad;
        };
        function pieSlice(start: number, end: number, radius: number, color: any) {
            ctx!.beginPath();
            ctx!.moveTo(centerx, centery);
            ctx!.arc(centerx, centery, radius, adjust(start), adjust(end), clockwise);
            ctx!.fillStyle = color;
            ctx!.fill();
        }
        function thumb(progressFraction: number) {
            const factor = 0.7;
            const tcentery = factor * Math.sin(adjust(progressFraction)) * (canvas!.height / 2) + centery;
            const tcenterx = factor * Math.cos(adjust(progressFraction)) * (canvas!.width / 2) + centerx;

            const size = Math.min(40, canvas!.height / 10);

            const inner = ctx!.createLinearGradient(tcenterx - size, tcentery - size, tcenterx + size, tcentery + size);
            inner.addColorStop(0, "rgba(0,0,0,0.3)");
            inner.addColorStop(0.8, "rgba(255,255,255,0.7)");

            const rim = ctx!.createLinearGradient(tcenterx - size, tcentery - size, tcenterx + size, tcentery + size);
            rim.addColorStop(0.2, "white");
            rim.addColorStop(1, "rgba(0,0,0,0.3)");

            ctx!.beginPath();
            ctx!.arc(tcenterx, tcentery, size, adjust(0), adjust(100));
            ctx!.strokeStyle = rim;
            ctx!.stroke();
            ctx!.fillStyle = inner;
            ctx!.fill();
        }


        const progressFraction = props.progress / 100;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // background arcs
        pieSlice(0, props.threshold / 100, radius, gradient(radius, Styles[props.style].sectionOneColor));
        pieSlice(props.threshold / 100, 1, radius, gradient(radius, Styles[props.style].sectionTwoColor));

        // progress arc
        pieSlice(0, progressFraction, radius * 0.9, Styles[props.style].progressColor);

        if (props.showThumb) { thumb(progressFraction) };

    }

    shouldComponentUpdate = () => { return false; }



    public render() {
        if (!canvasRef) { return; }
        return (
            <div>
                <canvas ref={canvasRef}></canvas>
            </div>
        );
    }
    // from mouse or touch event on the canvas to a 0..1 value
    private valueFromEvent = (progressView: HTMLCanvasElement, evt: any) => {
        let relativeX = evt.offsetX; // selection position via mouse or touch where 0,0 is the canvas top left corner
        let relativeY = evt.offsetY;
        if (evt.type.startsWith("touch")) {
            const rect = evt.target.getBoundingClientRect();
            relativeX = evt.targetTouches[0].clientX - rect.left;
            relativeY = evt.targetTouches[0].clientY - rect.top;
        }
        // normalize into cartesian coords where 0,0 is at the center of a unit circle
        let y = 2 * (((progressView.height / 2) - relativeY) / progressView.height);
        let x = 2 * (relativeX / progressView.width - 0.5);
        let angle = Math.atan2(y, x);                              // (x,y) angle to x axis as in polar coords
        angle = (angle < 0) ? Math.PI + (Math.PI + angle) : angle;  // x-axis counterclockwise 0..2*pi
        let val = 1 - (angle / (2 * Math.PI));                        // normalize to 0..1, clockwise
        val += 0.25;                                                // set relative to top, not x axis
        return (val > 1) ? val - 1 : val;
    };

    private registerForMouseAndTouch = (progressView: HTMLCanvasElement) => {

        const track = (evt: any) => {
            this.props.onSetSlider("progress", this.valueFromEvent(progressView, evt) * 100);// normalize for view data
        };

        const consume = (evt: any) => {                    // prevent click, focus, drag, and selection events
            evt.preventDefault();
            evt.stopImmediatePropagation();
        };

        progressView.onmousedown = evt => {         // start updating
            consume(evt);
            progressView.onmousemove = track;
            progressView.ontouchmove = track;
        };

        progressView.onmouseup = evt => {         // stop updating
            consume(evt);
            progressView.onmousemove = null;
            progressView.ontouchmove = null;
        };
    };
}
