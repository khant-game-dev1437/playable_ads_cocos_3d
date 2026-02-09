import { _decorator, Component, screen, view, ResolutionPolicy } from 'cc';
import { EventManager } from './events/EventManager';
const { ccclass } = _decorator;

@ccclass('Menu_UI')
export class Menu_UI extends Component {

    start() {
        EventManager.instance.on(EventManager.EVENT_SCREEN_RESIZE, this.updateFitMode, this);
        this.updateFitMode();
    }

    protected onDestroy() {
        EventManager.instance.off(EventManager.EVENT_SCREEN_RESIZE, this.updateFitMode, this);
    }

    updateFitMode() {
        const windowSize = screen.windowSize;
        if (windowSize.height > windowSize.width) {
            // portrait — fit width
            view.setDesignResolutionSize(720, 1280, ResolutionPolicy.FIXED_WIDTH);
        } else {
            // landscape — fit height
            view.setDesignResolutionSize(720, 1280, ResolutionPolicy.FIXED_HEIGHT);
        }
    }
}
