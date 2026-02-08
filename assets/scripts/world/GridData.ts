import { _decorator, Component, Node, Prefab, Vec3 } from 'cc';
import { PlayerCarrying } from '../enums/Enums';
import { PoolManager } from '../pool/PoolManager';
import { EventManager } from '../events/EventManager';

const { ccclass, property } = _decorator;

@ccclass('GridData')
export class GridData extends Component {

    @property({ type: PlayerCarrying })
    public itemType: PlayerCarrying = PlayerCarrying.NOTHING;

    @property(Prefab)
    public itemPrefab: Prefab = null;

    //drop
    @property({ visible(this: GridData) { return this.itemType === PlayerCarrying.DROP_SQUARE || this.itemType === PlayerCarrying.DROP_SPHERE; } }) // can be only seen if drop only
    public dropLimit: number = 40;

    @property({type: Node, visible(this: GridData) { return this.itemType === PlayerCarrying.DROP_SQUARE || this.itemType === PlayerCarrying.DROP_SPHERE; } }) // can be only seen if drop only
    public dropNodeParent: Node = null;


    // pick up
    @property({ visible(this: GridData) { return this.itemType === PlayerCarrying.SQUARE || this.itemType === PlayerCarrying.SPHERE; } }) // can be only seen if pickup only
    public blocksAvaliable: number = 40;

    @property({type: Node, visible(this: GridData) { return this.itemType === PlayerCarrying.SQUARE || this.itemType === PlayerCarrying.SPHERE; } }) // can be only seen if pickup only
    public pickNodeParent: Node = null;


    // spacing and stack
    @property({ visible(this: GridData) { return this.itemType === PlayerCarrying.SQUARE || this.itemType === PlayerCarrying.SPHERE; } }) // can be only seen if pickup only
    public _pickupSpacing: number = 1.1;

    @property({ visible(this: GridData) { return this.itemType === PlayerCarrying.SQUARE || this.itemType === PlayerCarrying.SPHERE; } }) // can be only seen if pickup only
    public _heightStep: number = 0.6;

    

    private _spawnIndex: number = 0;
    private _shouldSpawn: boolean = false;

    start() {
        if (this.itemType === PlayerCarrying.SQUARE || this.itemType === PlayerCarrying.SPHERE) {
            if (this.itemPrefab && this.pickNodeParent) {
                this._shouldSpawn = true;
            }
        } else if (this.itemType === PlayerCarrying.DROP_SQUARE || this.itemType === PlayerCarrying.DROP_SPHERE) {
             EventManager.instance.emit(EventManager.GRID_TEXT_INITIAL,  this.node.getComponent(GridData)); //
        }
    }

    update(deltaTime: number) {
        if (!this._shouldSpawn) return;

        for (let i = 0; i < 5; i++) {
            if (this._spawnIndex >= this.blocksAvaliable) {
                this._shouldSpawn = false;
                break;
            }
            this.spawnBlock(this._spawnIndex);
            this._spawnIndex++;
        }
    }

    spawnBlock(index: number) {
        let newBlock = PoolManager.instance.getFromPool(this.itemPrefab);
        this.pickNodeParent.addChild(newBlock);

        let row = index % 3;
        let col = Math.floor(index / 3) % 3;
        let layer = Math.floor(index / 9);

        let x = (row - 1) * this._pickupSpacing;
        let z = (col - 1) * this._pickupSpacing;
        let y = layer * this._heightStep;

        newBlock.setScale(0.3, 0.1, 0.3);
        newBlock.setPosition(x, y, z);
    }

}


