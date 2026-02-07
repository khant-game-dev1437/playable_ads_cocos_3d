import { _decorator, Component, Node } from 'cc';
import { EventManager } from '../events/EventManager';
import { PlayerCarrying } from '../enums/Enums';
const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {

    @property(Node)
    public cubeDownArrow: Node = null;

    @property(Node)
    public sphereDownArrow: Node = null;

    start() {
        EventManager.instance.on(EventManager.PLAYER_RECEIVE_ITEM, this.showCubeDownArrow, this)
    }

    protected onDestroy(): void {
        EventManager.instance.off(EventManager.PLAYER_RECEIVE_ITEM, this.showCubeDownArrow, this)
    }

    showCubeDownArrow(data) {
        if (data === PlayerCarrying.SQUARE) {
            if (this.cubeDownArrow.active) return;
            this.cubeDownArrow.active = true;
        } else if (data === PlayerCarrying.SPHERE) {
            if(this.sphereDownArrow.active) return;
            this.sphereDownArrow.active = true;
        }
        
    }

    update(deltaTime: number) {
        
    }
}


