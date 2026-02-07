import { _decorator, Component, Node, Prefab } from 'cc';
import { PlayerCarrying } from '../enums/Enums';

const { ccclass, property } = _decorator;

@ccclass('GridData')
export class GridData extends Component {

    @property({ type: PlayerCarrying })
    public itemType: PlayerCarrying = PlayerCarrying.NOTHING;

    @property(Prefab)
    public itemPrefab: Prefab = null;

    @property({ visible(this: GridData) { return this.itemType === PlayerCarrying.DROP_SQUARE || this.itemType === PlayerCarrying.DROP_SPHERE; } }) // can be only seen if drop only
    public dropLimit: number = 40;

    start() {

    }

    update(deltaTime: number) {
        
    }
}


