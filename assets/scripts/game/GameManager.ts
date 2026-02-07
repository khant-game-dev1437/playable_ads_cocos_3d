import { _decorator, Component, Node } from 'cc';
import { EventManager } from '../events/EventManager';
const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {

    @property(Node)
    public cubeDownArrow: Node = null;

    start() {
        EventManager.instance.once(EventManager.PLAYER_RECEIVE_ITEM, this.showCubeDownArrow, this)
    }

    protected onDestroy(): void {
        EventManager.instance.off(EventManager.PLAYER_RECEIVE_ITEM, this.showCubeDownArrow, this)
    }

    showCubeDownArrow() {
        if(this.cubeDownArrow.active) return;
        this.cubeDownArrow.active = true;
    }

    update(deltaTime: number) {
        
    }
}


