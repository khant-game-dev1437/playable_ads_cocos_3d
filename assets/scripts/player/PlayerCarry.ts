import { _decorator, Collider, Component, instantiate, ITriggerEvent, Node, Prefab, Vec3, tween } from 'cc';
import { PlayerCarrying } from '../enums/Enums';
import { GridData } from '../world/GridData';
import { PoolManager } from '../pool/PoolManager';
import { EventManager } from '../events/EventManager';

const { ccclass, property } = _decorator;

interface HandData {
    node: Node;
    itemType: PlayerCarrying;
    count: number;
    items: Node[];
}

@ccclass('PlayerCarry')
export class PlayerCarry extends Component {

    @property(Node)
    firstHandle: Node = null;

    @property(Node)
    secondHandle: Node = null;

    private _hands: HandData[] = [];

    private _activeHand: HandData | null = null;
    private _activeGrid: GridData | null = null;

    @property
    public countInterval: number = 0.2;
    @property
    public limitCount = 20;

    private _timer: number = 0;
    private _isDropping = false;

    private static CARRY_MAP: Map<PlayerCarrying, PlayerCarrying> = new Map([
        [PlayerCarrying.DROP_SQUARE, PlayerCarrying.SQUARE],
        [PlayerCarrying.DROP_SPHERE, PlayerCarrying.SPHERE],
    ]);

    public get totalCount(): number {
        let total = 0;

        for (const hand of this._hands) {
            total += hand.count;
        }

        return total;
    }
    start() {
        this._hands = [
            { node: this.firstHandle, itemType: PlayerCarrying.NOTHING, count: 0, items: [] },
            { node: this.secondHandle, itemType: PlayerCarrying.NOTHING, count: 0, items: [] }
        ];

        const collider = this.getComponent(Collider);
        if (collider) {
            collider.on('onTriggerEnter', this.onTriggerEnter, this);
            collider.on('onTriggerExit', this.onTriggerExit, this);
        }
    }

    private isDropType(type: PlayerCarrying): boolean {
        return type === PlayerCarrying.DROP_SQUARE || type === PlayerCarrying.DROP_SPHERE;
    }

    private findHandForPickup(itemType: PlayerCarrying): HandData | null {
        let emptyHand: HandData | null = null;
        for (const hand of this._hands) {
            if (hand.itemType === itemType) return hand;
            if (emptyHand === null && hand.itemType === PlayerCarrying.NOTHING) emptyHand = hand;  // use the first empty one
        }
        return emptyHand;
    }

    // call in drop zone
    private findHandForDrop(dropType: PlayerCarrying): HandData | null {
        const carryType = PlayerCarry.CARRY_MAP.get(dropType);
        if (carryType === undefined) return null;
        for (const hand of this._hands) {
            if (hand.itemType === carryType && hand.count > 0) return hand;
        }
        return null;
    }

    onTriggerEnter(event: ITriggerEvent) {
        const grid = event.otherCollider.getComponent(GridData);
        if (!grid) return;

        this._activeGrid = grid;

        if (this.isDropType(grid.itemType)) {
            const hand = this.findHandForDrop(grid.itemType);
            if (hand) {
                this._activeHand = hand;
                this._isDropping = true;
            }
            return;
        }

        // pickup zone
        const hand = this.findHandForPickup(grid.itemType);
        if (hand) {
            this._activeHand = hand;
            if (hand.itemType === PlayerCarrying.NOTHING) {
                hand.itemType = grid.itemType;
            }
        }
    }

    onTriggerExit(event: ITriggerEvent) {
        const grid = event.otherCollider.getComponent(GridData);
        if (!grid) return;

        if (grid === this._activeGrid) {
            this._isDropping = false;
            this._activeGrid = null;
            this._activeHand = null;
            this._timer = 0;
        }
    }

    update(deltaTime: number) {
        if (this._activeGrid && this._activeHand && !this._isDropping
            && this._activeHand.itemType === this._activeGrid.itemType) {
            this._timer += deltaTime; // pickup

            if (this._timer >= this.countInterval) {
                this.pickupFromGrid(this._activeHand);
                this._timer = 0;
            }
        } else if (this._isDropping && this._activeHand && this._activeHand.count > 0
            && this._activeGrid.dropLimit > 0) {
            this._timer += deltaTime; // drop

            if (this._timer >= this.countInterval) {
                this._activeHand.count--;
                this.dropItem(this._activeHand.items.pop(), this._activeGrid.node);
                this._timer = 0;

                if (this._activeHand.count <= 0) {
                    this._activeHand.itemType = PlayerCarrying.NOTHING;
                }
            }
        }
    }

    dropItem(item: Node, gridNode: Node) {
        const startWorldPos = item.worldPosition.clone();
        const nodeParent = gridNode.getComponent(GridData);
        if(!nodeParent) return;
        item.setParent(nodeParent.dropNodeParent);
        item.setWorldPosition(startWorldPos);
        const startLocalPos = item.position.clone();
        const midLocal = new Vec3(startLocalPos.x * 0.5, Math.max(startLocalPos.y, 0) + 2, startLocalPos.z * 0.5)

        tween(item)
            .to(0.15, {
                position: midLocal,
                scale: new Vec3(0.3, 0.1, 0.3)
            }, { easing: 'sineOut' })
            .to(0.15, {
                position: new Vec3(0, 0, 0),
            }, { easing: 'sineIn' })
            .call(() => {
                PoolManager.instance.returnToPool(item);
            })
            .start();

        // reduce grid limit blocks
        const gridData = gridNode.getComponent(GridData);
        if(gridData.dropLimit) {
            gridData.dropLimit--;
            EventManager.instance.emit(EventManager.GRID_FILLING,  gridData); //
            if(gridData.dropLimit <= 0) {
                EventManager.instance.emit(EventManager.GRID_FULL, gridData.itemType); // close arrows in gamemanager
            }
        }
    }

    pickupFromGrid(hand: HandData) {
        if (hand.count >= this.limitCount) {
            return;
        }   

        const nodeParent = this._activeGrid.pickNodeParent; // player carry .ts
        if(!nodeParent || nodeParent.children.length === 0) return;

        const block = nodeParent.children[nodeParent.children.length - 1];
        const startWorldPos = block.worldPosition.clone();
        block.setParent(hand.node);
        block.setWorldPosition(startWorldPos); // for curve anim

        // anim
        const startLocalPos = block.position.clone();
        const stackY = hand.count * 0.2
        
        const midLocal = new Vec3(startLocalPos.x * 0.5, Math.max(startLocalPos.y, stackY) + 2, startLocalPos.z * 0.5)
        const endLocal = new Vec3(0, stackY, 0);

        tween(block)
            .to(0.1, { position: midLocal }, { easing: 'sineOut' })
            .to(0.1, {
                position: endLocal,
                scale: new Vec3(0.5, 0.2, 0.5)
            }, { easing: 'sineIn' })
            .start();

        hand.count++;
        hand.items.push(block);

        EventManager.instance.emit(EventManager.PLAYER_RECEIVE_ITEM, hand.itemType);
        
    }
}
