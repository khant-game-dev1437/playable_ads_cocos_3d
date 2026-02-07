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

    private _cubeGridFull = false;
    private _sphereGridFull = false;

    start() {
        EventManager.instance.on(EventManager.PLAYER_RECEIVE_ITEM, this.showCubeDownArrow, this)
        EventManager.instance.on(EventManager.GRID_FULL, this.turnOffArrows, this)
    }

    protected onDestroy(): void {
        EventManager.instance.off(EventManager.PLAYER_RECEIVE_ITEM, this.showCubeDownArrow, this)
        EventManager.instance.off(EventManager.GRID_FULL, this.turnOffArrows, this)
    }

    showCubeDownArrow(data) {
        if (data === PlayerCarrying.SQUARE && !this._cubeGridFull) {
            this.cubeDownArrow.active = true;
        } else if (data === PlayerCarrying.SPHERE && !this._sphereGridFull) {
            this.sphereDownArrow.active = true;
        }
    }

    turnOffArrows(data) {
        if (data === PlayerCarrying.DROP_SQUARE) {
            this._cubeGridFull = true;
            this.cubeDownArrow.active = false;
        } else if (data === PlayerCarrying.DROP_SPHERE) {
            this._sphereGridFull = true;
            this.sphereDownArrow.active = false;
        }
    }

    update(deltaTime: number) {
        
    }
}


