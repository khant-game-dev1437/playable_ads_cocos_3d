import { _decorator, Component, Node, Prefab, Vec3, tween } from 'cc';
import { PlayerCarrying } from '../enums/Enums';
import { PoolManager } from '../pool/PoolManager';
import { EventManager } from '../events/EventManager';

const { ccclass, property } = _decorator;

@ccclass('GridData')
export class GridData extends Component {

    @property({ type: PlayerCarrying })
    public itemType: PlayerCarrying = PlayerCarrying.NOTHING;

    //drop
    @property({ visible(this: GridData) { return this.itemType === PlayerCarrying.DROP_SQUARE || this.itemType === PlayerCarrying.DROP_SPHERE; } }) // can be only seen if drop only
    public dropLimit: number = 40;

    @property({type: Node, visible(this: GridData) { return this.itemType === PlayerCarrying.DROP_SQUARE || this.itemType === PlayerCarrying.DROP_SPHERE; } }) // can be only seen if drop only
    public dropNodeParent: Node = null;


    // pick up
    @property({type: Prefab, visible(this: GridData) { return this.itemType === PlayerCarrying.SQUARE || this.itemType === PlayerCarrying.SPHERE; } })
    public pickupPrefab: Prefab = null;

    @property({ visible(this: GridData) { return this.itemType === PlayerCarrying.SQUARE || this.itemType === PlayerCarrying.SPHERE; } }) // can be only seen if pickup only
    public blocksAvaliable: number = 40;

    @property({type: Node, visible(this: GridData) { return this.itemType === PlayerCarrying.SQUARE || this.itemType === PlayerCarrying.SPHERE; } }) // can be only seen if pickup only
    public pickNodeParent: Node = null;


    // spacing and stack
    @property({ visible(this: GridData) { return this.itemType === PlayerCarrying.SQUARE || this.itemType === PlayerCarrying.SPHERE; } }) // can be only seen if pickup only
    public _pickupSpacing: number = 1.1;

    @property({ visible(this: GridData) { return this.itemType === PlayerCarrying.SQUARE || this.itemType === PlayerCarrying.SPHERE; } }) // can be only seen if pickup only
    public _heightStep: number = 0.6;

    // reward
    @property({type: Node, visible(this: GridData) { return this.itemType === PlayerCarrying.MONEY || this.itemType === PlayerCarrying.DROP_SQUARE || this.itemType === PlayerCarrying.DROP_SPHERE} })
    public moneyPickupPoint: Node = null;
    @property({type: Prefab, visible(this: GridData) { return this.itemType === PlayerCarrying.MONEY || this.itemType === PlayerCarrying.DROP_SQUARE || this.itemType === PlayerCarrying.DROP_SPHERE} })
    public rewardItem: Prefab = null;
    @property({visible(this: GridData) { return this.itemType === PlayerCarrying.MONEY || this.itemType === PlayerCarrying.DROP_SQUARE || this.itemType === PlayerCarrying.DROP_SPHERE}})
    public rewardCount: number = 10;
    @property({visible(this: GridData) { return this.itemType === PlayerCarrying.MONEY || this.itemType === PlayerCarrying.DROP_SQUARE || this.itemType === PlayerCarrying.DROP_SPHERE}})
    public rewardValue: number = 20.0;


    private _spawnIndex: number = 0;
    private _shouldSpawn: boolean = false;

    start() {
        if (this.itemType === PlayerCarrying.SQUARE || this.itemType === PlayerCarrying.SPHERE) {
            if (this.pickupPrefab && this.pickNodeParent) {
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
        let newBlock = PoolManager.instance.getFromPool(this.pickupPrefab);
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

    gridFull() {
        if(!this.rewardItem || !this.moneyPickupPoint) return;

        const existingCount = this.moneyPickupPoint.children.length;

        for (let i = 0; i < this.rewardCount; i++) {
            const reward = PoolManager.instance.getFromPool(this.rewardItem);
            this.moneyPickupPoint.addChild(reward);

            const idx = existingCount + i;
            let row = idx % 3;
            let col = Math.floor(idx / 3) % 3;
            let layer = Math.floor(idx / 9);
            let x = (row - 1) * reward.scale.x + 0.1;
            let z = (col - 1) * reward.scale.z + 0.1;
            let y = layer * reward.scale.y + 0.2;

            reward.setPosition(x, y, z);
            const finalScale = reward.scale.clone();
            //reward.setScale(0, 0, 0);

            tween(reward)
                .delay(i * 0.05)
                .to(0.25, { scale: new Vec3(finalScale.x * 1.3, finalScale.y * 1.3, finalScale.z * 1.3) }, { easing: 'backOut' })
                .to(0.1, { scale: finalScale }, { easing: 'sineOut' })
                .start();
        }
    }
}


