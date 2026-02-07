import { _decorator, Collider, Component, instantiate, ITriggerEvent, Node, Prefab, Vec3, tween } from 'cc';
import { PlayerCarrying } from '../enums/Enums';
import { GridData } from '../world/GridData';
import { PoolManager } from '../pool/PoolManager';
import { EventManager } from '../events/EventManager';

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

    public itemData = [];
    private _isDropping = false;

    private static DROP_MAP: Map<PlayerCarrying, PlayerCarrying> = new Map([
        [PlayerCarrying.SQUARE, PlayerCarrying.DROP_SQUARE],
        [PlayerCarrying.SPHERE, PlayerCarrying.DROP_SPHERE],
    ]);

    start() {
        const collider = this.getComponent(Collider);

        if (collider) {
            collider.on('onTriggerEnter', this.onTriggerEnter, this);
            collider.on('onTriggerExit', this.onTriggerExit, this);
        }
    }

    private isDropType(type: PlayerCarrying): boolean {
        return type === PlayerCarrying.DROP_SQUARE || type === PlayerCarrying.DROP_SPHERE;
    }

    onTriggerEnter(event: ITriggerEvent) {
        const grid = event.otherCollider.getComponent(GridData);

        if (!grid) return;

        this._activeGrid = grid;

        if (this.isDropType(grid.itemType)) {
            if (grid.itemType === PlayerCarry.DROP_MAP.get(this.playerCarriedItem)) {
                this._isDropping = true;
            }
            return;
        }

        if (this._currentCount === 0) {
            this.playerCarriedItem = grid.itemType;
        }
    }

    onTriggerExit(event: ITriggerEvent) {
        const grid = event.otherCollider.getComponent(GridData);
        if (!grid) return;

        if (grid === this._activeGrid) {
            this._isDropping = false;
            this._activeGrid = null;
            this._timer = 0;
        }
    }

    update(deltaTime: number) {
        if (this._activeGrid && this.playerCarriedItem === this._activeGrid.itemType) {
            this._timer += deltaTime;  // pickup

            if (this._timer >= this.countInterval) {
                this.spawnFromGrid(this._activeGrid.itemPrefab);
                this._timer = 0;
            }
        } else if (this._isDropping && this._currentCount > 0 && this._activeGrid.dropLimit > 0) { // else if to prevent double increment timr
            this._timer += deltaTime; // drop

            if (this._timer >= this.countInterval) {
                
                this._currentCount--;
                this.dropItem(this.itemData.pop(), this._activeGrid.node);
                this._timer = 0;

                if (this._currentCount <= 0) {
                    this.playerCarriedItem = PlayerCarrying.NOTHING;
                }
            }
        }
    }

    dropItem(item: Node, gridNode: Node) {
        item.setParent(gridNode);
        item.setWorldPosition(item.worldPosition); 
        item.setScale(0.5,0.2,0.5)

        tween(item)
            .to(0.3, {
                position: new Vec3(0, 0, 0),
                scale: new Vec3(0.5, 0.2, 0.5),
            }, { easing: 'bounceOut' })
            .call(() => {
                PoolManager.instance.returnToPool(item);
            })
            .start();

        // reduce grid limit blocks
        if(gridNode.getComponent(GridData).dropLimit) {
            gridNode.getComponent(GridData).dropLimit--
        }
    }

    spawnFromGrid(prefab: Prefab) {
        if (this._currentCount >= this.limitCount) return;
        
        let newBox = PoolManager.instance.getFromPool(prefab);
        newBox.setParent(this.handTransform);

        let stackY = this._currentCount * 0.2;

        newBox.setScale(new Vec3(0, 0, 0)); // for animation

        //newBox.setPosition(0, stackY, 0);
         newBox.setPosition(0, stackY + 0.2, 0); // slight high abit for ani

        tween(newBox)
            .to(0.2, {
                scale: new Vec3(0.5, 0.2, 0.5),
                position: new Vec3(0, stackY, 0)
            }, { easing: 'backOut' })
            .start();

        this._currentCount++;

        EventManager.instance.emit(EventManager.PLAYER_RECEIVE_ITEM);
        this.itemData.push(newBox);

        console.log('currentCount ', this._currentCount);
    }
}


