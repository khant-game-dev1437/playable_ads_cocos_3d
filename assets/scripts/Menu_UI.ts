import { _decorator, Component, Node, Vec3, view, screen } from 'cc';
import { EventManager } from './events/EventManager';
const { ccclass, property } = _decorator;

@ccclass('Menu_UI')
export class Menu_UI extends Component {

    @property(Node)
    public button: Node = null;
     @property(Node)
    public button1: Node = null;

    @property(Node)
    public button2: Node = null;
     @property(Node)
    public button3: Node = null;
    
    start() {
    
        EventManager.instance.on(EventManager.EVENT_SCREEN_RESIZE, this.uiResize, this)

        this.uiResize();
    }

    uiResize() {
        if (!this.button) return;

        const windowSize = screen.windowSize;
        
        let finalScale = 1;
        if(windowSize.height > windowSize.width) {
            finalScale = windowSize.width / 720;
        } else {
            finalScale = windowSize.width / 1280;
        }
        

        this.button.setScale(finalScale,finalScale);
        this.button1.setScale(finalScale,finalScale);
        this.button2.setScale(finalScale,finalScale);
        this.button3.setScale(finalScale,finalScale);
    }
}


