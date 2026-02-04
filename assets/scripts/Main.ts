import { _decorator, Component, view, screen } from 'cc';
import { EventManager } from './events/EventManager';
const { ccclass, property } = _decorator;

@ccclass('Main')
export class Main extends Component {
    protected onLoad() {
        view.on('canvas-resize', this.onScreenResize, this);
    }

    private onScreenResize() {
        const size = screen.windowSize;
        console.log(`Screen Resized to: ${size.width}x${size.height}`);

     
        EventManager.instance.emit(EventManager.EVENT_SCREEN_RESIZE, size);
    }

    protected onDestroy() {
        view.off('canvas-resize', this.onScreenResize, this);
    }
}


