import { _decorator, Collider, Component, instantiate, ITriggerEvent, Node, Prefab, Vec3 } from 'cc';
import { PlayerCarrying } from '../enums/Enums';
import { GridData } from '../world/GridData';
import { PoolManager } from '../pool/PoolManager';

const { ccclass, property } = _decorator;

@ccclass('PlayerCarry')
export class PlayerCarry extends Component {

    @property(Node)
    handTransform: Node = null;

    playerCarriedItem = PlayerCarrying.NOTHING;

    private _activeGrid: GridData | null = null;

    @property
    public countInterval: number = 0.2;
    private _currentCount: number = 0;
    @property
    public limitCount = 20;

    private _timer: number = 0;

    start() {
        const collider = this.getComponent(Collider);

        if (collider) {
            collider.on('onTriggerEnter', this.onTriggerEnter, this);
            collider.on('onTriggerExit', this.onTriggerExit, this);
        }
    }

    onTriggerEnter(event: ITriggerEvent) {
        const grid = event.otherCollider.getComponent(GridData);
        if (!grid) return;
        this._activeGrid = grid;

        if (this._currentCount === 0) {
            this.playerCarriedItem = grid.itemType;
        }
    }

    onTriggerExit(event: ITriggerEvent) {
        const grid = event.otherCollider.getComponent(GridData);

        if (grid === this._activeGrid) {
            this._activeGrid = null;
            this._timer = 0; // 
        }
    }

    update(deltaTime: number) {
        if (this._activeGrid && this.playerCarriedItem === this._activeGrid.itemType) {
            this._timer += deltaTime;

            if (this._timer >= this.countInterval) {
                this.spawnFromGrid(this._activeGrid.itemPrefab);
                this._timer = 0;
            }
        }
    }

    spawnFromGrid(prefab: Prefab) { 
        if (this._currentCount > this.limitCount) return;

        let newBox = PoolManager.instance.getFromPool(prefab);
        newBox.setParent(this.handTransform);

        let stackY = this._currentCount * 0.2;
        newBox.setPosition(0, stackY, 0);

        this._currentCount++;
    }
}


