import { _decorator, Component, Node, Prefab } from 'cc';
import { PlayerCarrying } from '../enums/Enums';

const { ccclass, property } = _decorator;

@ccclass('GridData')
export class GridData extends Component {

    @property({ type: PlayerCarrying })
    public itemType: PlayerCarrying = PlayerCarrying.NOTHING;

    @property(Prefab)
    public itemPrefab: Prefab = null;

    start() {

    }

    update(deltaTime: number) {
        
    }
}


