import { _decorator, Component, Node, Prefab, Vec3 } from 'cc';
import { PlayerCarrying } from '../enums/Enums';
import { PoolManager } from '../pool/PoolManager';

const { ccclass, property } = _decorator;

@ccclass('GridData')
export class GridData extends Component {

    @property({ type: PlayerCarrying })
    public itemType: PlayerCarrying = PlayerCarrying.NOTHING;

    @property(Prefab)
    public itemPrefab: Prefab = null;

    @property({ visible(this: GridData) { return this.itemType === PlayerCarrying.DROP_SQUARE || this.itemType === PlayerCarrying.DROP_SPHERE; } }) // can be only seen if drop only
    public dropLimit: number = 40;

    @property({ visible(this: GridData) { return this.itemType === PlayerCarrying.SQUARE || this.itemType === PlayerCarrying.SPHERE; } }) // can be only seen if pickup only
    public blocksAvaliable: number = 40;

    @property({ visible(this: GridData) { return this.itemType === PlayerCarrying.SQUARE || this.itemType === PlayerCarrying.SPHERE; } }) // can be only seen if pickup only
    public _pickupSpacing: number = 1.1;

    @property({ visible(this: GridData) { return this.itemType === PlayerCarrying.SQUARE || this.itemType === PlayerCarrying.SPHERE; } }) // can be only seen if pickup only
    public _heightStep: number = 0.6;

    @property({type: Node, visible(this: GridData) { return this.itemType === PlayerCarrying.SQUARE || this.itemType === PlayerCarrying.SPHERE; } }) // can be only seen if pickup only
    public nodeParent: Node = null;

    start() {
        if (this.itemType === PlayerCarrying.SQUARE || this.itemType === PlayerCarrying.SPHERE) {
            this.spawnInitialBlocks(); // to stack blocks
        }
    }

    spawnInitialBlocks() {
        if (!this.itemPrefab || !this.nodeParent) return;

        for (let i = 0; i < this.blocksAvaliable; i++) {
            let newBlock = PoolManager.instance.getFromPool(this.itemPrefab);
            this.nodeParent.addChild(newBlock);

            let row = i % 3;
            let col = Math.floor(i / 3) % 3;
            let layer = Math.floor(i / 9);

            let x = (row - 1) * this._pickupSpacing;
            let z = (col - 1) * this._pickupSpacing;
            let y = layer * this._heightStep;

            newBlock.setScale(0.3, 0.1, 0.3); // 
            newBlock.setPosition(new Vec3(x, y, z));
        }
    }

    update(deltaTime: number) {

    }
}


