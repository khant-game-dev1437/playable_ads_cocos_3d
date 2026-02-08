import { _decorator, Component, Label, Node } from 'cc';
import { EventManager } from '../events/EventManager';
import { PlayerCarrying } from '../enums/Enums';
import { PlayerCarry } from '../player/PlayerCarry';
const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {

    @property(Node)
    public cubeDownArrow: Node = null;

    @property(Node)
    public sphereDownArrow: Node = null;

    @property(Node)
    public cubeFilled: Node = null;

    @property(Node)
    public sphereFilled: Node = null;

    private _cubeFilledComp;
    private _sphereFilledComp;

    private _cubeGridFull = false;
    private _sphereGridFull = false;

    private _cubeCount = 0;
    private _sphereCount = 0;

    start() {
        this._cubeFilledComp = this.cubeFilled.getComponent(Label);
        this._sphereFilledComp = this.sphereFilled.getComponent(Label);

        EventManager.instance.on(EventManager.PLAYER_RECEIVE_ITEM, this.showCubeDownArrow, this)
        EventManager.instance.on(EventManager.GRID_FULL, this.turnOffArrows, this)
        EventManager.instance.on(EventManager.GRID_FILLING, this.filling, this)
    }

    protected onDestroy(): void {
        EventManager.instance.off(EventManager.PLAYER_RECEIVE_ITEM, this.showCubeDownArrow, this)
        EventManager.instance.off(EventManager.GRID_FULL, this.turnOffArrows, this)
        EventManager.instance.off(EventManager.GRID_FILLING, this.filling, this)
    }

    filling(gridData) {
        console.log('gridData', gridData.itemType)
        if(gridData.itemType === PlayerCarrying.DROP_SQUARE) {
            this._cubeCount++;
            this._cubeFilledComp.string = `${this._cubeCount}/${gridData.dropLimit + this._cubeCount}`
        }else if(gridData.itemType === PlayerCarrying.DROP_SPHERE) {
            this._sphereCount++;
            this._sphereFilledComp.string = `${this._sphereCount}/${gridData.dropLimit + this._sphereCount}`
        }
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


